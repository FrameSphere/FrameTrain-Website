import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { auditProvider, auditScript, parseAuditJson, runAutoReview, type ScriptInput } from '../scriptAudit'

const script: ScriptInput = {
  name: 'MLM', description: 'd', author: 'a', model_type: 'Classifier', task_type: 'Pre-Training',
  framework: 'transformers', script_type: 'train', tags: ['mlm'],
  script: "import os\nMODEL_PATH = os.environ['MODEL_PATH']\nmodel.eval()\n",
}
const pass = { pass: true, note: 'ok' }
const good = {
  verdict: 'approve', score: 93,
  checks: { safety: pass, content: pass, consistency: pass, correctness: pass, compatibility: pass },
  issues: [], summary: 'Sauberes Skript.',
}
const groqBody = (content: unknown) => ({ choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }] })
const response = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers })

describe('auditProvider', () => {
  it('nimmt Groq, sobald ein Groq-Key gesetzt ist', () => {
    expect(auditProvider({ GROQ_API_KEY: 'gsk_x', ANTHROPIC_API_KEY: 'sk-ant-x' })).toBe('groq')
  })
  it('ohne Groq-Key bleibt es bei Claude', () => {
    expect(auditProvider({ ANTHROPIC_API_KEY: 'sk-ant-x' })).toBe('anthropic')
    expect(auditProvider({})).toBe('anthropic')
  })
  it('AI_AUDIT_PROVIDER entscheidet ausdrücklich', () => {
    expect(auditProvider({ AI_AUDIT_PROVIDER: 'anthropic', GROQ_API_KEY: 'gsk_x' })).toBe('anthropic')
    expect(auditProvider({ AI_AUDIT_PROVIDER: ' Groq ' })).toBe('groq')
    expect(auditProvider({ AI_AUDIT_PROVIDER: 'unsinn', GROQ_API_KEY: 'gsk_x' })).toBe('groq')
  })
})

describe('parseAuditJson', () => {
  it('liest JSON auch mit Markdown-Zaun und Text drumherum', () => {
    const r = parseAuditJson('Hier das Ergebnis:\n```json\n' + JSON.stringify(good) + '\n```')
    expect(r).toMatchObject({ verdict: 'approve', score: 93 })
  })
  it('fehlende Prüfpunkte zählen als nicht bestanden', () => {
    const r = parseAuditJson('{"verdict":"approve","score":99}')
    expect(r.checks.safety.pass).toBe(false)
  })
  it('wirft bei Text ohne JSON', () => {
    expect(() => parseAuditJson('Das Skript sieht gut aus.')).toThrow(/kein valides JSON/)
  })
})

describe('Prüfung über Groq', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test')
    vi.stubEnv('AI_AUDIT_PROVIDER', '')
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })

  it('ruft Groq mit JSON-Modus und gibt bei sauberem Ergebnis frei', async () => {
    fetchMock.mockResolvedValue(response(200, groqBody(good)))
    const review = await runAutoReview(script)
    expect(review.decision).toBe('approve')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer gsk_test')
    const body = JSON.parse(init.body as string)
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.model).toBe('llama-3.3-70b-versatile')
    expect(body.messages[1].content).toContain('model.eval()')
  })

  it('lehnt ab, wenn das Modell einen Sicherheits-Fail meldet', async () => {
    fetchMock.mockResolvedValue(response(200, groqBody({
      ...good, verdict: 'reject', score: 10, checks: { ...good.checks, safety: { pass: false, note: 'sendet Daten an fremden Server' } },
    })))
    const review = await runAutoReview(script)
    expect(review).toMatchObject({ decision: 'reject', reason: 'Sicherheit: sendet Daten an fremden Server' })
  })

  it('wiederholt ein 429 einmal nach der genannten Wartezeit', async () => {
    vi.useFakeTimers()
    fetchMock
      .mockResolvedValueOnce(response(429, 'rate limit', { 'retry-after': '2' }))
      .mockResolvedValueOnce(response(200, groqBody(good)))
    const p = auditScript(script)
    await vi.advanceTimersByTimeAsync(2000)
    await expect(p).resolves.toMatchObject({ verdict: 'approve' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('ungültiger Key ist ein Fehler, keine Entscheidung', async () => {
    fetchMock.mockResolvedValue(response(401, '{"error":"invalid api key"}'))
    await expect(runAutoReview(script)).rejects.toThrow('Groq Fehler: 401')
  })

  it('Sperr-Regel greift ohne Modellaufruf', async () => {
    const review = await runAutoReview({ ...script, script: 'import os\nos.system("rm -rf /")' })
    expect(review.decision).toBe('reject')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
