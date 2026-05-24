import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── GET /api/user/community-name ─────────────────────────────────────────
// Query: ?userId=...
// Returns: { communityName: string | null }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get('userId')?.trim();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400, headers: CORS }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { communityName: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: CORS }
      );
    }

    return NextResponse.json(
      { communityName: user.communityName ?? null },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[GET /api/user/community-name]', err);
    return NextResponse.json(
      { error: 'Failed to fetch community name' },
      { status: 500, headers: CORS }
    );
  }
}

// ── PATCH /api/user/community-name ──────────────────────────────────────
// Body: { userId: string, communityName: string }
// Updates the communityName and ALL related scripts immediately
// Returns: { success: boolean, message: string, updatedCount: number }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, communityName } = body;

    if (!userId?.trim() || !communityName?.trim()) {
      return NextResponse.json(
        { error: 'userId and communityName are required' },
        { status: 400, headers: CORS }
      );
    }

    // Überprüfe, dass User existiert
    const user = await prisma.user.findUnique({
      where: { id: userId.trim() },
      select: { id: true, communityName: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: CORS }
      );
    }

    const newName = communityName.trim();

    // Überprüfe, dass neuer Name nicht bereits von anderem User verwendet wird
    if (user.communityName !== newName) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            {
              communityName: {
                equals: newName,
                mode: 'insensitive',
              },
            },
            {
              id: {
                not: userId.trim(),
              },
            },
          ],
        },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Community name is already taken by another user' },
          { status: 409, headers: CORS }
        );
      }
    }

    // Update User mit neuem communityName
    const oldName = user.communityName;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId.trim() },
      data: { communityName: newName },
      select: { communityName: true },
    });

    // Aktualisiere alle Scripts des Users auf den neuen Namen
    // Suche nach ALLEN Scripts dieses Users und aktualisiere deren author Feld
    let updatedCount = 0;
    const userScripts = await prisma.libraryScript.findMany({
      where: {
        userId: userId.trim(),
      },
      select: { id: true, author: true },
    });

    if (userScripts.length > 0) {
      // Update alle Scripts auf den neuen Namen
      const result = await prisma.libraryScript.updateMany({
        where: {
          userId: userId.trim(),
        },
        data: {
          author: newName,
        },
      });
      updatedCount = result.count;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Community name updated${updatedCount > 0 ? ` and ${updatedCount} scripts updated` : ''}`,
        updatedCount,
      },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[PATCH /api/user/community-name]', err);
    return NextResponse.json(
      { error: 'Failed to update community name' },
      { status: 500, headers: CORS }
    );
  }
}
