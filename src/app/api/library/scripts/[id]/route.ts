import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── GET /api/library/scripts/[id] ────────────────────────────────────────
// Gibt ein einzelnes Skript MIT Script-Inhalt zurück
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const script = await prisma.libraryScript.findUnique({
      where: { id },
    });

    if (!script) {
      return NextResponse.json(
        { error: 'Skript nicht gefunden' },
        { status: 404, headers: CORS },
      );
    }

    return NextResponse.json(script, { headers: CORS });
  } catch (err) {
    console.error('[GET /api/library/scripts/[id]]', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500, headers: CORS },
    );
  }
}
