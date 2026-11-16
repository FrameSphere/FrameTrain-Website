import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUser } from '@/lib/auth';
import { publicScriptView } from '@/lib/scriptGuards';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── GET /api/library/scripts/[id] ────────────────────────────────────────
// Gibt ein einzelnes Skript MIT Script-Inhalt zurück – ohne interne Felder
// (Prüfergebnis, Nutzer-ID). Abgelehnte Skripte sind gesperrt: für Fremde gibt es
// sie nicht (404), der Einreicher sieht Eintrag und Grund, aber keinen Inhalt.
export async function GET(
  req: NextRequest,
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

    const viewer = script.rejectedAt ? await getRequestUser(req) : null;
    const view = publicScriptView(script, viewer?.userId ?? null, true);
    if (!view) {
      return NextResponse.json(
        { error: 'Skript nicht gefunden' },
        { status: 404, headers: CORS },
      );
    }
    return NextResponse.json(view, { headers: CORS });
  } catch (err) {
    console.error('[GET /api/library/scripts/[id]]', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500, headers: CORS },
    );
  }
}
