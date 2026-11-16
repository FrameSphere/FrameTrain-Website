import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── POST /api/library/scripts/[id]/download ───────────────────────────────
// Erhöht den Download-Zähler um 1 und gibt das vollständige Skript zurück.
// Abgelehnte Skripte sind gesperrt und werden an niemanden ausgeliefert –
// vorher reichte die ID, um auch ein abgelehntes Skript zu laden.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const current = await prisma.libraryScript.findUnique({ where: { id }, select: { rejectedAt: true } });
    if (!current) {
      return NextResponse.json({ error: 'Skript nicht gefunden' }, { status: 404, headers: CORS });
    }
    if (current.rejectedAt) {
      return NextResponse.json(
        { error: 'Dieses Skript wurde bei der Sicherheitsprüfung abgelehnt und ist gesperrt.' },
        { status: 403, headers: CORS },
      );
    }
    const updated = await prisma.libraryScript.update({
      where: { id },
      data:  { downloads: { increment: 1 } },
    });

    return NextResponse.json(
      {
        success: true,
        downloads: updated.downloads,
        script: updated.script,
        name: updated.name,
        verified: updated.verified,
      },
      { headers: CORS },
    );
  } catch (err: unknown) {
    // P2025 = Record not found (Prisma)
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Skript nicht gefunden' },
        { status: 404, headers: CORS },
      );
    }
    console.error('[POST /api/library/scripts/[id]/download]', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500, headers: CORS },
    );
  }
}
