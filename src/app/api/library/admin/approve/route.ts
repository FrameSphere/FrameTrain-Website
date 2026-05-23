import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

// POST /api/library/admin/approve
// Body: { id: string }
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400, headers: CORS });

    const updated = await prisma.libraryScript.update({
      where: { id },
      data: {
        verified: true,
        rejectedAt: null,
        rejectedReason: null,
      },
    });

    return NextResponse.json({ success: true, id: updated.id, verified: true }, { headers: CORS });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Skript nicht gefunden' }, { status: 404, headers: CORS });
    }
    console.error('[POST /api/library/admin/approve]', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500, headers: CORS });
  }
}
