// ─────────────────────────────────────────────────────────────────────────────
// FrameTrain Open Library – automatische Script-Prüfung mit Claude (Anthropic)
// ─────────────────────────────────────────────────────────────────────────────
// Ersetzt die alte Groq-Prüfung. Wird an zwei Stellen genutzt:
//   1. Beim Upload  (POST /api/library/scripts)        → sofortige Auto-Entscheidung
//   2. Im Admin-UI  (POST /api/library/admin/ai-check) → manuelle Re-Prüfung
//
// Philosophie: SEHR STRENG. Ein Script wird nur automatisch freigegeben, wenn es
// eindeutig sauber ist. Alles Grenzwertige bleibt „pending" (kein Mensch nötig,
// aber auch nicht öffentlich) statt riskant automatisch live zu gehen.

// ── Modell / Konfiguration (per Vercel-Env überschreibbar) ───────────────────
const AI_MODEL          = process.env.AI_AUDIT_MODEL      ?? 'claude-sonnet-5';
const APPROVE_THRESHOLD = numEnv('AI_APPROVE_THRESHOLD', 85); // Score >= X für Auto-Freigabe
const REJECT_THRESHOLD  = numEnv('AI_REJECT_THRESHOLD',  40); // Score <  X → Auto-Ablehnung

function numEnv(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) ? v : fallback;
}

// ── Typen ────────────────────────────────────────────────────────────────────
export interface AuditCheck { pass: boolean; note: string }

export interface AuditResult {
  verdict: 'approve' | 'warn' | 'reject';
  score: number; // 0-100
  checks: {
    safety:        AuditCheck;
    content:       AuditCheck;
    consistency:   AuditCheck;
    correctness:   AuditCheck;
    compatibility: AuditCheck;
  };
  issues: string[];
  summary: string;
}

export type Decision = 'approve' | 'reject' | 'hold';

export interface ScriptInput {
  name: string; description: string; author: string;
  model_type: string; task_type: string; framework: string;
  script_type: string; tags: string[]; script: string;
}

export interface AutoReview {
  result: AuditResult;
  decision: Decision;
  reason: string;   // menschenlesbare Begründung der Entscheidung
}

// ── Deterministische Hard-Blocker ────────────────────────────────────────────
// Diese Muster führen SOFORT zur Ablehnung – unabhängig vom LLM. Defense in depth:
// die KI kann getäuscht werden, ein Regex-Treffer auf echten Schadcode nicht.
// Wort-/Aufruf-Grenzen vermeiden Fehltreffer (z. B. „evaluation" ≠ „eval(").
const HARD_BLOCKERS: { label: string; re: RegExp }[] = [
  { label: 'os.system-Aufruf',            re: /\bos\.system\s*\(/ },
  { label: 'os.popen-Aufruf',             re: /\bos\.popen\s*\(/ },
  { label: 'subprocess-Nutzung',          re: /\bsubprocess\b/ },
  { label: 'eval()',                      re: /\beval\s*\(/ },
  { label: 'exec()',                      re: /\bexec\s*\(/ },
  { label: 'dynamischer __import__',      re: /\b__import__\s*\(/ },
  { label: 'pickle.load (Deserialisierung)', re: /\bpickle\.loads?\s*\(/ },
  { label: 'marshal.load',                re: /\bmarshal\.loads?\s*\(/ },
  { label: 'Roh-Socket',                  re: /\bsocket\.socket\s*\(/ },
  { label: 'Netzwerk-Download (urllib)',  re: /\burllib\.request\b|\burlopen\s*\(/ },
  { label: 'Netzwerk-Request (requests)', re: /\brequests\.(get|post|put|delete|patch)\s*\(/ },
  { label: 'Netzwerk-Request (httpx)',    re: /\bhttpx\.(get|post|put|delete|patch|Client)\s*\(/ },
  { label: 'Shell-Download (curl/wget)',  re: /\b(curl|wget)\s+https?:\/\//i },
  { label: 'Reverse-Shell / Binär-Shell', re: /\/bin\/(ba)?sh\b/ },
  { label: 'Crypto-Mining',               re: /\bstratum\+tcp:\/\/|\bxmrig\b|\bcoinhive\b/i },
  { label: 'base64→exec-Verschleierung',  re: /base64\.b64decode[\s\S]{0,80}(exec|eval)\s*\(/ },
  { label: 'ctypes (Speicherzugriff)',    re: /\bimport\s+ctypes\b|\bctypes\.\w/ },
];

export function findHardBlockers(scriptText: string): string[] {
  return HARD_BLOCKERS.filter(b => b.re.test(scriptText)).map(b => b.label);
}

// FrameTrain-Konvention: Pfade kommen aus Umgebungsvariablen, nicht hartcodiert.
const FT_ENV_VARS = ['MODEL_PATH', 'DATASET_PATH', 'OUTPUT_PATH'];
export function referencedFtEnvVars(scriptText: string): string[] {
  return FT_ENV_VARS.filter(v => new RegExp(`['"]${v}['"]`).test(scriptText));
}

// ── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(script: ScriptInput, hardHits: string[], envVars: string[]): string {
  return `Du bist ein STRENGER Sicherheits- und Qualitäts-Auditor für eine öffentliche
ML-Script-Bibliothek namens „FrameTrain Open Library". Diese Scripts werden von
fremden Nutzern eingereicht und danach von anderen heruntergeladen und AUSGEFÜHRT.
Gehe im Zweifel gegen die Freigabe – lieber ein gutes Script zurückhalten als ein
gefährliches durchlassen.

=== EINREICHUNG (METADATEN) ===
Name: ${script.name}
Autor: ${script.author}
Beschreibung: ${script.description}
Model Type: ${script.model_type}
Task Type: ${script.task_type}
Framework: ${script.framework}
Script Type: ${script.script_type}
Tags: ${script.tags.join(', ')}

=== AUTOMATISCHE VORBEFUNDE (deterministisch, vertrauenswürdig) ===
Hard-Blocker-Treffer: ${hardHits.length ? hardHits.join('; ') : 'keine'}
Genutzte FrameTrain-Env-Vars: ${envVars.length ? envVars.join(', ') : 'KEINE'}

=== SCRIPT-INHALT ===
${script.script.slice(0, 12000)}
${script.script.length > 12000 ? '\n[... gekürzt ...]' : ''}

=== DEINE AUFGABE ===
Prüfe streng alle 5 Dimensionen:

1. SAFETY – Schadcode, Netzwerkzugriffe zu Nicht-ML-Zielen, gefährliche
   Subprozess-Aufrufe (os.system, eval, exec), Dateizugriffe außerhalb der
   erwarteten Pfade, Krypto-Mining, Datenexfiltration, Verschleierung? Jeder
   oben gelistete Hard-Blocker-Treffer ist automatisch ein SAFETY-Fail.

2. CONTENT – Enthalten Name/Beschreibung/Tags Beleidigungen, Hassrede, NSFW,
   Spam oder irreführende Behauptungen?

3. CONSISTENCY – Passen Tags, model_type, task_type und Beschreibung wirklich zu
   dem, was das Script tatsächlich tut? (z. B. mit „bert" getaggt, trainiert aber
   YOLO = schlecht)

4. CORRECTNESS – Syntaktisch valides Python? Offensichtliche fatale Fehler?
   Sinnvolle ML-Praxis?

5. COMPATIBILITY (FrameTrain) – Nutzt das Script die vorgesehenen Env-Vars
   (os.environ.get('MODEL_PATH'/'DATASET_PATH'/'OUTPUT_PATH')) statt hartkodierter
   Pfade? Wenn KEINE Env-Var genutzt wird, ist compatibility.pass = false.

=== ANTWORTFORMAT ===
Antworte AUSSCHLIESSLICH mit validem JSON, keine Markdown-Backticks, kein Vorwort:
{
  "verdict": "approve" | "warn" | "reject",
  "score": <ganze Zahl 0-100>,
  "checks": {
    "safety":        { "pass": true/false, "note": "<kurze Notiz>" },
    "content":       { "pass": true/false, "note": "<kurze Notiz>" },
    "consistency":   { "pass": true/false, "note": "<kurze Notiz>" },
    "correctness":   { "pass": true/false, "note": "<kurze Notiz>" },
    "compatibility": { "pass": true/false, "note": "<kurze Notiz>" }
  },
  "issues": ["<Problem 1>", "<Problem 2>"],
  "summary": "<2-3 Sätze Zusammenfassung auf Deutsch>"
}

Verdict-Leitfaden (streng):
- "approve" → score >= 85, KEIN Safety-/Content-Fail, alle 5 Checks bestanden
- "warn"    → score 40-84, kleinere Mängel, keine harten Blocker
- "reject"  → score < 40 ODER ein Safety-Fail ODER ein Content-Verstoß`;
}

// ── Claude-Aufruf ─────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<AuditResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY nicht konfiguriert');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 2500,
      // Kurze, aber vorhandene Denkphase; hält Kosten/Latenz niedrig.
      output_config: { effort: 'low' },
      system:
        'Du bist ein strenger Sicherheits- und ML-Qualitäts-Auditor. Antworte immer ' +
        'mit reinem JSON. Kein Markdown, kein zusätzlicher Text.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Anthropic error:', res.status, err);
    throw new Error(`Anthropic Fehler: ${res.status}`);
  }

  const data = await res.json();
  // content ist ein Array aus Blöcken (thinking + text) – nur die Text-Blöcke nehmen.
  const rawText: string = (data.content ?? [])
    .filter((b: { type?: string }) => b?.type === 'text')
    .map((b: { text?: string }) => b.text ?? '')
    .join('')
    .trim();

  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Robust: falls doch Prosa drumherum steht, das äußere JSON-Objekt ausschneiden.
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;

  let parsed: AuditResult;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error('JSON parse failed:', rawText);
    throw new Error('Claude hat kein valides JSON zurückgegeben');
  }
  return normalizeResult(parsed);
}

function normalizeResult(r: Partial<AuditResult>): AuditResult {
  const check = (c?: AuditCheck): AuditCheck => ({
    pass: c?.pass === true,
    note: typeof c?.note === 'string' ? c.note : '',
  });
  const checks = r.checks ?? ({} as AuditResult['checks']);
  return {
    verdict: r.verdict === 'approve' || r.verdict === 'reject' ? r.verdict : 'warn',
    score: Math.max(0, Math.min(100, Math.round(Number(r.score ?? 0)))),
    checks: {
      safety:        check(checks.safety),
      content:       check(checks.content),
      consistency:   check(checks.consistency),
      correctness:   check(checks.correctness),
      compatibility: check(checks.compatibility),
    },
    issues: Array.isArray(r.issues) ? r.issues.map(String).slice(0, 20) : [],
    summary: typeof r.summary === 'string' ? r.summary : '',
  };
}

// ── Öffentliche API ───────────────────────────────────────────────────────────

/** Reine Prüfung: liefert das AI-Ergebnis (inkl. deterministischer Hard-Blocker). */
export async function auditScript(script: ScriptInput): Promise<AuditResult> {
  const hardHits = findHardBlockers(script.script);
  const envVars  = referencedFtEnvVars(script.script);

  // Bei Hard-Blocker den LLM-Aufruf gar nicht erst wagen – direkt hartes Reject.
  if (hardHits.length > 0) {
    return {
      verdict: 'reject',
      score: 0,
      checks: {
        safety:        { pass: false, note: `Blockierte Muster: ${hardHits.join(', ')}` },
        content:       { pass: true,  note: 'nicht geprüft (Safety-Abbruch)' },
        consistency:   { pass: true,  note: 'nicht geprüft (Safety-Abbruch)' },
        correctness:   { pass: true,  note: 'nicht geprüft (Safety-Abbruch)' },
        compatibility: { pass: envVars.length > 0, note: envVars.join(', ') || 'keine Env-Vars' },
      },
      issues: hardHits.map(h => `Verbotenes Muster: ${h}`),
      summary: `Automatisch abgelehnt: potenziell gefährliche Muster gefunden (${hardHits.join(', ')}).`,
    };
  }

  const result = await callClaude(buildPrompt(script, hardHits, envVars));
  // Env-Var-Befund deterministisch erzwingen (LLM kann es übersehen).
  if (envVars.length === 0 && result.checks.compatibility.pass) {
    result.checks.compatibility = { pass: false, note: 'Keine FrameTrain-Env-Vars (MODEL_PATH/DATASET_PATH/OUTPUT_PATH) genutzt' };
    if (result.verdict === 'approve') result.verdict = 'warn';
  }
  return result;
}

/** Entscheidungslogik: aus einem AuditResult eine strenge Entscheidung ableiten. */
export function decide(result: AuditResult): { decision: Decision; reason: string } {
  const c = result.checks;

  // Harte Ablehnungsgründe
  if (!c.safety.pass)  return { decision: 'reject', reason: `Sicherheit: ${c.safety.note || 'nicht bestanden'}` };
  if (!c.content.pass) return { decision: 'reject', reason: `Inhalt: ${c.content.note || 'nicht bestanden'}` };
  if (result.verdict === 'reject' || result.score < REJECT_THRESHOLD)
    return { decision: 'reject', reason: `AI: ${result.summary || 'Score zu niedrig'} (${result.score}/100)` };

  // Freigabe nur bei eindeutig sauberem Ergebnis
  const allPass = c.safety.pass && c.content.pass && c.consistency.pass && c.correctness.pass && c.compatibility.pass;
  if (result.verdict === 'approve' && result.score >= APPROVE_THRESHOLD && allPass)
    return { decision: 'approve', reason: `AI-freigegeben (${result.score}/100)` };

  // Alles dazwischen: zurückhalten (bleibt „pending", nicht öffentlich)
  return { decision: 'hold', reason: `Grenzfall – manuelle Prüfung nötig (${result.score}/100)` };
}

/** Prüfen + entscheiden in einem Schritt. */
export async function runAutoReview(script: ScriptInput): Promise<AutoReview> {
  const result = await auditScript(script);
  const { decision, reason } = decide(result);
  return { result, decision, reason };
}
