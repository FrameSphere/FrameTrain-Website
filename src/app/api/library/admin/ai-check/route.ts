import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAutoReview } from '@/lib/scriptAudit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

// POST /api/library/admin/ai-check  { id, apply? }
// Prüft ein Script mit Claude. `apply` (default true) wendet die strenge
// Auto-Entscheidung direkt an (verified / rejected / pending).
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { id, apply = true } = await req.json();
    if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400, headers: corsHeaders() });

    const script = await prisma.libraryScript.findUnique({ where: { id } });
    if (!script) return NextResponse.json({ error: 'Skript nicht gefunden' }, { status: 404, headers: corsHeaders() });

    let review;
    try {
      review = await runAutoReview({
        name: script.name, description: script.description, author: script.author,
        model_type: script.model_type, task_type: script.task_type, framework: script.framework,
        script_type: script.script_type, tags: script.tags, script: script.script,
      });
    } catch (e) {
      console.error('[ai-check] audit failed:', e);
      return NextResponse.json({ error: (e as Error).message || 'Prüfung fehlgeschlagen' }, { status: 502, headers: corsHeaders() });
    }

    const { result, decision, reason } = review;

    // Ergebnis speichern (+ optional Entscheidung anwenden)
    const data: {
      aiCheckResult: string; aiCheckedAt: Date;
      verified?: boolean; rejectedAt?: Date | null; rejectedReason?: string | null;
    } = { aiCheckResult: JSON.stringify(result), aiCheckedAt: new Date() };

    if (apply) {
      if (decision === 'approve') {
        data.verified = true; data.rejectedAt = null; data.rejectedReason = null;
      } else if (decision === 'reject') {
        data.verified = false; data.rejectedAt = new Date(); data.rejectedReason = `AI: ${reason}`;
      }
      // 'hold' → nichts anwenden, bleibt pending
    }

    await prisma.libraryScript.update({ where: { id }, data });

    return NextResponse.json({ success: true, result, decision, reason, applied: apply }, { headers: corsHeaders() });
  } catch (err) {
    console.error('[POST /api/library/admin/ai-check]', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500, headers: corsHeaders() });
  }
}
