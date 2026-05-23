import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

// POST /api/library/admin/reject  { id, reason? }
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { id, reason } = await req.json();
    if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400, headers: corsHeaders() });

    const updated = await prisma.libraryScript.update({
      where: { id },
      data: {
        verified: false,
        rejectedAt: new Date(),
        rejectedReason: reason?.trim() || 'Manuell abgelehnt',
      },
    });

    return NextResponse.json({ success: true, id: updated.id, rejected: true }, { headers: corsHeaders() });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Skript nicht gefunden' }, { status: 404, headers: corsHeaders() });
    }
    console.error('[POST /api/library/admin/reject]', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500, headers: corsHeaders() });
  }
}
