import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Max-Age':       '86400',
};

function corsHeaders() { return new Headers(CORS_HEADERS); }
function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === process.env.LIBRARY_ADMIN_SECRET;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

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
Script Type: ${script.script_type}
Tags: ${script.tags.join(', ')}

=== SCRIPT CONTENT ===
${script.script.slice(0, 12000)}
${script.script.length > 12000 ? '\n[... truncated ...]' : ''}

=== YOUR TASK ===
Check all 5 dimensions:

1. SAFETY – malicious code, network requests to non-ML endpoints, dangerous subprocess calls (os.system, eval, exec), file operations outside expected paths, crypto mining, exfiltration?

2. CONTENT – name/description/tags contain insults, hate speech, NSFW, spam, or misleading claims?

3. CONSISTENCY – do tags, model_type, task_type and description accurately match what the script actually does? (e.g. tagged "bert" but trains YOLO = BAD)

4. CORRECTNESS – syntactically valid Python? Obvious fatal errors? Reasonable ML practices?

5. FRAMETRAIN_COMPAT – uses os.environ.get('MODEL_PATH'), DATASET_PATH, OUTPUT_PATH?

=== RESPONSE FORMAT ===
Return ONLY valid JSON, no markdown backticks, no preamble:
{
  "verdict": "approve" or "warn" or "reject",
  "score": <integer 0-100>,
  "checks": {
    "safety":        { "pass": true/false, "note": "<concise note>" },
    "content":       { "pass": true/false, "note": "<concise note>" },
    "consistency":   { "pass": true/false, "note": "<concise note>" },
    "correctness":   { "pass": true/false, "note": "<concise note>" },
    "compatibility": { "pass": true/false, "note": "<concise note>" }
  },
  "issues": ["<issue 1>", "<issue 2>"],
  "summary": "<2-3 sentence summary in German>"
}

Verdict guide:
- "approve" → score >= 75, no safety/content failures
- "warn"    → score 40-74, minor issues, no hard blocks
- "reject"  → score < 40, OR any safety failure, OR content violation`;
}

// POST /api/library/admin/ai-check  { id }
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400, headers: corsHeaders() });

    const script = await prisma.libraryScript.findUnique({ where: { id } });
    if (!script) return NextResponse.json({ error: 'Skript nicht gefunden' }, { status: 404, headers: corsHeaders() });

    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) return NextResponse.json({ error: 'GROQ_API_KEY nicht konfiguriert' }, { status: 500, headers: corsHeaders() });

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: 'You are a strict security and ML quality auditor. Always respond with pure JSON only. No markdown, no extra text.' },
          { role: 'user',   content: buildPrompt({ name: script.name, description: script.description, author: script.author, model_type: script.model_type, task_type: script.task_type, framework: script.framework, script_type: script.script_type, tags: script.tags, script: script.script }) },
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('Groq error:', err);
      return NextResponse.json({ error: `Groq Fehler: ${groqRes.status}` }, { status: 502, headers: corsHeaders() });
    }

    const groqData = await groqRes.json();
    const rawText  = groqData.choices?.[0]?.message?.content ?? '';
    const cleaned  = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('JSON parse failed:', rawText);
      return NextResponse.json({ error: 'Groq hat kein valides JSON zurückgegeben', raw: rawText }, { status: 502, headers: corsHeaders() });
    }

    await prisma.libraryScript.update({
      where: { id },
      data: { aiCheckResult: JSON.stringify(result), aiCheckedAt: new Date() },
    });

    return NextResponse.json({ success: true, result }, { headers: corsHeaders() });
  } catch (err) {
    console.error('[POST /api/library/admin/ai-check]', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500, headers: corsHeaders() });
  }
}
