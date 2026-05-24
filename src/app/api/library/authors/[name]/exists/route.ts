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

// ── GET /api/library/authors/[name]/exists ────────────────────────────────
// Prüft, ob ein Community-Name bereits als User.communityName verwendet wird
export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name parameter' }, { status: 400, headers: CORS });
    }

    const decodedName = decodeURIComponent(name).trim();
    
    // Prüfe, ob ein User mit diesem communityName bereits existiert
    const existingUser = await prisma.user.findFirst({
      where: {
        communityName: {
          equals: decodedName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    return NextResponse.json(
      { exists: !!existingUser },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[GET /api/library/authors/[name]/exists]', err);
    return NextResponse.json(
      { error: 'Failed to check author name' },
      { status: 500, headers: CORS }
    );
  }
}
