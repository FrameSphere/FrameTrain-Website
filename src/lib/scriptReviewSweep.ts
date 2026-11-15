// ─────────────────────────────────────────────────────────────────────────────
// Open Library – Nachprüfung liegengebliebener Skripte
// ─────────────────────────────────────────────────────────────────────────────
// Die Prüfung beim Upload kann ausfallen (ungültiger API-Key, Zeitüberschreitung,
// Anthropic nicht erreichbar). Das Skript bleibt dann ungeprüft liegen und bekam
// bisher nie wieder eine Prüfung. Ebenso blieb ein Skript abgelehnt, wenn eine
// Sperr-Regel es fälschlich getroffen hatte und die Regel später korrigiert wurde
// (15.11.2026: `model.eval()` galt als `eval()`).
//
// Dieser Lauf holt beides nach. Er wird täglich per Cron aufgerufen und kann
// jederzeit von Hand angestoßen werden (siehe api/cron/review-library-scripts).

import { findHardBlockers, runAutoReview, type AuditResult, type Decision, type ScriptInput } from './scriptAudit';

/** So speichern die Routen eine Ablehnung durch eine Sperr-Regel. */
const RULE_REJECTION = /^AI:\s*(AI:\s*)?Sicherheit:\s*Blockierte Muster:/;

export interface ReviewCandidate extends ScriptInput {
  id: string;
  verified: boolean;
  aiCheckedAt: Date | null;
  rejectedAt: Date | null;
  rejectedReason: string | null;
}

export type RecheckReason = 'unchecked' | 'rule_no_longer_matches';

/**
 * Braucht das Skript eine (neue) Prüfung?
 *  - 'unchecked': wartet, wurde aber nie geprüft (Prüfung beim Upload fiel aus)
 *  - 'rule_no_longer_matches': von einer Sperr-Regel abgelehnt, die das Skript
 *    heute nicht mehr trifft
 * Von der KI oder von Hand abgelehnte Skripte bleiben unangetastet.
 */
export function recheckReason(s: Pick<ReviewCandidate, 'verified' | 'aiCheckedAt' | 'rejectedAt' | 'rejectedReason' | 'script'>): RecheckReason | null {
  if (s.verified) return null;
  if (!s.rejectedAt) return s.aiCheckedAt ? null : 'unchecked';
  if (RULE_REJECTION.test(s.rejectedReason ?? '') && findHardBlockers(s.script).length === 0) {
    return 'rule_no_longer_matches';
  }
  return null;
}

export interface ReviewUpdate {
  aiCheckResult: string;
  aiCheckedAt: Date;
  verified?: boolean;
  rejectedAt?: Date | null;
  rejectedReason?: string | null;
}

/** Was nach einer Nachprüfung in die Datenbank geschrieben wird. */
export function reviewUpdate(result: AuditResult, decision: Decision, reason: string, now: Date): ReviewUpdate {
  const data: ReviewUpdate = { aiCheckResult: JSON.stringify(result), aiCheckedAt: now };
  if (decision === 'approve') {
    data.verified = true; data.rejectedAt = null; data.rejectedReason = null;
  } else if (decision === 'reject') {
    data.verified = false; data.rejectedAt = now; data.rejectedReason = `AI: ${reason}`;
  } else {
    // Grenzfall: wartet auf einen Menschen. Eine frühere Fehl-Ablehnung fällt weg.
    data.verified = false; data.rejectedAt = null; data.rejectedReason = null;
  }
  return data;
}

export interface SweepOutcome {
  id: string; name: string; why: RecheckReason;
  decision?: Decision; reason?: string; error?: string;
}

export interface SweepDeps {
  review?: typeof runAutoReview;
  save: (id: string, data: ReviewUpdate) => Promise<unknown>;
  now?: () => Date;
}

/**
 * Prüft die übergebenen Kandidaten nach. Fällt die KI-Prüfung aus, bleibt das
 * Skript unverändert und der Fehler steht im Ergebnis – es wird nie auf Verdacht
 * freigegeben oder abgelehnt.
 */
export async function sweepScripts(candidates: ReviewCandidate[], deps: SweepDeps): Promise<SweepOutcome[]> {
  const review = deps.review ?? runAutoReview;
  const now = deps.now ?? (() => new Date());
  const todo = candidates
    .map((s) => ({ s, why: recheckReason(s) }))
    .filter((x): x is { s: ReviewCandidate; why: RecheckReason } => x.why !== null);

  return Promise.all(todo.map(async ({ s, why }): Promise<SweepOutcome> => {
    try {
      const { result, decision, reason } = await review({
        name: s.name, description: s.description, author: s.author,
        model_type: s.model_type, task_type: s.task_type, framework: s.framework,
        script_type: s.script_type, tags: s.tags, script: s.script,
      });
      await deps.save(s.id, reviewUpdate(result, decision, reason, now()));
      return { id: s.id, name: s.name, why, decision, reason };
    } catch (e) {
      return { id: s.id, name: s.name, why, error: (e as Error).message || 'Prüfung fehlgeschlagen' };
    }
  }));
}
