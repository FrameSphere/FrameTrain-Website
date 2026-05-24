import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── PATCH /api/library/scripts/author/update ───────────────────────────────
// Aktualisiert alle Scripts eines Users, wenn sein Author-Name sich ändert
// Body: { oldAuthor: string, newAuthor: string, userId: string }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldAuthor, newAuthor, userId } = body;

    if (!oldAuthor || !newAuthor || !userId) {
      return NextResponse.json(
        { error: 'oldAuthor, newAuthor, and userId are required' },
        { status: 400, headers: CORS }
      );
    }

    // Validierung: oldAuthor und newAuthor sollten sich unterscheiden
    if (oldAuthor.trim() === newAuthor.trim()) {
      return NextResponse.json(
        { error: 'oldAuthor and newAuthor must be different' },
        { status: 400, headers: CORS }
      );
    }

    // Prüfe, ob newAuthor bereits verwendet wird (außer vom gleichen User)
    const allScriptsWithNewName = await prisma.libraryScript.findMany({
      where: {
        author: {
          equals: newAuthor.trim(),
          mode: 'insensitive',
        },
      },
      select: { author: true },
      take: 1,
    });

    // Wenn newAuthor existiert und NICHT oldAuthor ist, dann ist er vergeben
    if (
      allScriptsWithNewName.length > 0 &&
      allScriptsWithNewName[0].author.toLowerCase() !==
        oldAuthor.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'newAuthor is already taken by another user' },
        { status: 409, headers: CORS }
      );
    }

    // Aktualisiere alle Scripts des Users mit oldAuthor zu newAuthor
    const result = await prisma.libraryScript.updateMany({
      where: {
        author: {
          equals: oldAuthor.trim(),
          mode: 'insensitive',
        },
      },
      data: {
        author: newAuthor.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${result.count} scripts`,
        updatedCount: result.count,
      },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[PATCH /api/library/scripts/author/update]', err);
    return NextResponse.json(
      { error: 'Failed to update author name for scripts' },
      { status: 500, headers: CORS }
    );
  }
}
