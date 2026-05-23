import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Groq kann etwas brauchen

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
};

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === process.env.LIBRARY_ADMIN_SECRET;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── Groq AI Prüf-Prompt ───────────────────────────────────────────────────
function buildPrompt(script: {
  name: string; description: string; author: string;
  model_type: string; task_type: string; framework: string;
  script_type: string; tags: string[]; script: string;
}): string {
  return `You are a strict security and quality auditor for a public ML script library called FrameTrain Open Library.

Analyze this community-submitted script and return a JSON verdict. Be rigorous but fair.

=== SUBMISSION METADATA ===
Name: ${script.name}
Author: ${script.author}
Description: ${script.description}
Model Type: ${script.model_type}
Task Type: ${script.task_type}
Framework: ${script.framework}
Script Type: ${script.script_type}  (train or test)
Tags: ${script.tags.join(', ')}

=== SCRIPT CONTENT ===
${script.script.slice(0, 12000)}
${script.script.length > 12000 ? '\n[... truncated ...]' : ''}

=== YOUR TASK ===
Check all 5 dimensions carefully:

1. SAFETY – Does the script contain: malicious code, network requests to non-ML endpoints, 
   dangerous subprocess calls (os.system, eval, exec), attempts to read/write outside expected 
   directories, crypto mining, exfiltration, or any clearly harmful code?

2. CONTENT – Does the name/description/tags contain: insults, hate speech, NSFW content, 
   spam, misleading claims, or inappropriate material?

3. CONSISTENCY – Do the tags, model_type, task_type and description accurately describe 
   what the script actually does? 
   Example of BAD consistency: tags say "bert" but script trains a YOLO vision model.
   Example of BAD consistency: script_type is "train" but script only does inference.

4. CORRECTNESS – Is the script syntactically valid Python? Does it have obvious fatal errors?
   Does it follow reasonable ML practices (not completely broken)?

5. FRAMETRAIN_COMPAT – Does the script use os.environ.get('MODEL_PATH'), DATASET_PATH, 
   and OUTPUT_PATH for FrameTrain integration? (nice-to-have, not a blocker)

=== RESPONSE FORMAT ===
Return ONLY valid JSON, no markdown backticks, no preamble:
{
  "verdict": "approve" or "warn" or "reject",
  "score": <integer 0-100>,
  "checks": {
    "safety":       { "pass": true/false, "note": "<concise english note>" },
    "content":      { "pass": true/false, "note": "<concise english note>" },
    "consistency":  { "pass": true/false, "note": "<concise english note>" },
    "correctness":  { "pass": true/false, "note": "<concise english note>" },
    "compatibility":{ "pass": true/false, "note": "<concise english note>" }
  },
  "issues": ["<issue 1>", "<issue 2>"],
  "summary": "<2-3 sentence human-readable summary in German>"
}

Verdict guide:
- "approve" → score >= 75, no safety/content failures
- "warn"    → score 40-74, or minor inconsistencies, but no hard blocks
- "reject"  → score < 40, OR any safety failure, OR content violation`;
}

// ── POST /api/library/admin/ai-check ─────────────────────────────────────
// Body: { id: string }
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400, headers: CORS });

    const script = await prisma.libraryScript.findUnique({ where: { id } });
    if (!script) return NextResponse.json({ error: 'Skript nicht gefunden' }, { status: 404, headers: CORS });

    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) return NextResponse.json({ error: 'GROQ_API_KEY nicht konfiguriert' }, { status: 500, headers: CORS });

    // Groq-Anfrage
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1, // möglichst deterministisch
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: 'You are a strict security and ML quality auditor. Always respond with pure JSON only. No markdown, no extra text.',
          },
          {
            role: 'user',
            content: buildPrompt({
              name: script.name,
              description: script.description,
              author: script.author,
              model_type: script.model_type,
              task_type: script.task_type,
              framework: script.framework,
              script_type: script.script_type,
              tags: script.tags,
              script: script.script,
            }),
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const groqErr = await groqRes.text();
      console.error('Groq API error:', groqErr);
      return NextResponse.json({ error: `Groq Fehler: ${groqRes.status}` }, { status: 502, headers: CORS });
    }

    const groqData = await groqRes.json();
    const rawText = groqData.choices?.[0]?.message?.content ?? '';

    // JSON aus Antwort extrahieren (safety: backtick-fences entfernen)
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('JSON parse failed:', rawText);
      return NextResponse.json(
        { error: 'Groq hat kein valides JSON zurückgegeben', raw: rawText },
        { status: 502, headers: CORS },
      );
    }

    // Ergebnis in DB speichern
    await prisma.libraryScript.update({
      where: { id },
      data: {
        aiCheckResult: JSON.stringify(result),
        aiCheckedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, result }, { headers: CORS });
  } catch (err) {
    console.error('[POST /api/library/admin/ai-check]', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500, headers: CORS });
  }
}
