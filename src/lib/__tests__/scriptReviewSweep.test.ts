import { describe, expect, it, vi } from 'vitest'
import type { AuditResult } from '../scriptAudit'
import { recheckReason, reviewUpdate, sweepScripts, type ReviewCandidate } from '../scriptReviewSweep'

const pass = { pass: true, note: '' }
const result = (over: Partial<AuditResult> = {}): AuditResult => ({
  verdict: 'approve', score: 92,
  checks: { safety: pass, content: pass, consistency: pass, correctness: pass, compatibility: pass },
  issues: [], summary: 'ok', ...over,
})

const base: ReviewCandidate = {
  id: 's1', name: 'Skript', description: 'd', author: 'a', model_type: 'Classifier', task_type: 'Fine-Tuning',
  framework: 'transformers', script_type: 'train', tags: [], script: 'import os\nmodel.eval()\n',
  verified: false, aiCheckedAt: null, rejectedAt: null, rejectedReason: null,
}
const NOW = new Date('2026-11-16T04:00:00Z')

describe('recheckReason', () => {
  it('wartendes Skript ohne Prüfung wird nachgeprüft', () => {
    expect(recheckReason(base)).toBe('unchecked')
  })

  it('geprüfter Grenzfall bleibt für die manuelle Prüfung liegen', () => {
    expect(recheckReason({ ...base, aiCheckedAt: NOW })).toBeNull()
  })

  it('freigegebene Skripte bleiben unangetastet', () => {
    expect(recheckReason({ ...base, verified: true })).toBeNull()
  })

  it('Fehl-Ablehnung durch model.eval() wird nachgeprüft (auch mit doppeltem Präfix)', () => {
    for (const reason of ['AI: Sicherheit: Blockierte Muster: eval()', 'AI: AI: Sicherheit: Blockierte Muster: eval()']) {
      expect(recheckReason({ ...base, aiCheckedAt: NOW, rejectedAt: NOW, rejectedReason: reason })).toBe('rule_no_longer_matches')
    }
  })

  it('trifft die Sperr-Regel weiterhin, bleibt die Ablehnung', () => {
    const s = { ...base, script: 'x = eval(user_input)', aiCheckedAt: NOW, rejectedAt: NOW, rejectedReason: 'AI: Sicherheit: Blockierte Muster: eval()' }
    expect(recheckReason(s)).toBeNull()
  })

  it('Ablehnung durch KI oder Mensch wird nicht automatisch aufgehoben', () => {
    expect(recheckReason({ ...base, aiCheckedAt: NOW, rejectedAt: NOW, rejectedReason: 'AI: Skript passt nicht zur Beschreibung (30/100)' })).toBeNull()
    expect(recheckReason({ ...base, rejectedAt: NOW, rejectedReason: 'Spam' })).toBeNull()
  })
})

describe('reviewUpdate', () => {
  it('Freigabe setzt verified und löscht eine frühere Ablehnung', () => {
    expect(reviewUpdate(result(), 'approve', 'AI-freigegeben (92/100)', NOW)).toMatchObject({
      verified: true, rejectedAt: null, rejectedReason: null, aiCheckedAt: NOW,
    })
  })

  it('Ablehnung speichert Zeitpunkt und Grund mit einem Präfix', () => {
    const u = reviewUpdate(result({ verdict: 'reject', score: 10 }), 'reject', 'Sicherheit: Datenabfluss', NOW)
    expect(u).toMatchObject({ verified: false, rejectedAt: NOW, rejectedReason: 'AI: Sicherheit: Datenabfluss' })
  })

  it('Grenzfall wartet auf einen Menschen, eine Fehl-Ablehnung fällt weg', () => {
    expect(reviewUpdate(result({ verdict: 'warn', score: 70 }), 'hold', 'Grenzfall', NOW)).toMatchObject({
      verified: false, rejectedAt: null, rejectedReason: null,
    })
  })
})

describe('sweepScripts', () => {
  it('prüft nur Kandidaten und speichert die Entscheidung', async () => {
    const save = vi.fn().mockResolvedValue(null)
    const review = vi.fn().mockResolvedValue({ result: result(), decision: 'approve', reason: 'AI-freigegeben (92/100)' })
    const out = await sweepScripts(
      [base, { ...base, id: 's2', verified: true }, { ...base, id: 's3', aiCheckedAt: NOW }],
      { review, save, now: () => NOW },
    )
    expect(review).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('s1', expect.objectContaining({ verified: true }))
    expect(out).toEqual([expect.objectContaining({ id: 's1', why: 'unchecked', decision: 'approve' })])
  })

  it('fällt die KI-Prüfung aus, bleibt das Skript unverändert und der Fehler steht im Ergebnis', async () => {
    const save = vi.fn()
    const review = vi.fn().mockRejectedValue(new Error('Anthropic Fehler: 401'))
    const out = await sweepScripts([base], { review, save })
    expect(save).not.toHaveBeenCalled()
    expect(out[0]).toMatchObject({ id: 's1', error: 'Anthropic Fehler: 401' })
  })
})
