import { describe, expect, it } from 'vitest'
import { decide, findHardBlockers, type AuditResult } from '../scriptAudit'

describe('findHardBlockers – eval/exec', () => {
  it('lässt PyTorch-Methodenaufrufe .eval() durch', () => {
    const src = [
      'model.eval()',
      '        m.eval()',
      'model = AutoModelForSequenceClassification.from_pretrained(mdir).eval()',
      'model.train(); model.eval ()',
      'cursor.exec("x")',
    ].join('\n')
    expect(findHardBlockers(src)).toEqual([])
  })

  it('lässt Wörter wie evaluate( / execute( durch', () => {
    expect(findHardBlockers('evaluate(model)\nexecute(job)\nretrieval(x)')).toEqual([])
  })

  it('blockt eingebautes eval()/exec()', () => {
    expect(findHardBlockers('x = eval(user_input)')).toContain('eval()')
    expect(findHardBlockers('eval("1+1")')).toContain('eval()')
    expect(findHardBlockers('  exec (code)')).toContain('exec()')
    expect(findHardBlockers('print(exec(code))')).toContain('exec()')
  })

  it('blockt den Umweg über builtins', () => {
    expect(findHardBlockers('import builtins\nbuiltins.eval(s)')).toContain('eval()')
    expect(findHardBlockers('__builtins__.exec(s)')).toContain('exec()')
  })

  it('blockt weiterhin base64→exec-Verschleierung', () => {
    const hits = findHardBlockers('exec(base64.b64decode(payload))')
    expect(hits).toContain('exec()')
  })
})

describe('decide', () => {
  const base: AuditResult = {
    verdict: 'reject', score: 20,
    checks: {
      safety: { pass: true, note: '' }, content: { pass: true, note: '' },
      consistency: { pass: false, note: '' }, correctness: { pass: true, note: '' },
      compatibility: { pass: true, note: '' },
    },
    issues: [], summary: 'Passt nicht zur Beschreibung.',
  }

  it('liefert den Grund ohne doppeltes „AI:"-Präfix', () => {
    const { decision, reason } = decide(base)
    expect(decision).toBe('reject')
    expect(reason.startsWith('AI:')).toBe(false)
  })
})
