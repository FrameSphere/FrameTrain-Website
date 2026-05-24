import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
      return new NextResponse(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { communityName: true },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ communityName: user.communityName ?? null }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[GET /api/user/community-name]', err);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch community name' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}

// ── POST /api/user/community-name (Update) ──────────────────────────────
// Body: { userId: string, communityName: string }
// Updates the communityName and ALL related scripts immediately
// Returns: { success: boolean, message: string, updatedCount: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, communityName } = body;

    console.log('[POST /api/user/community-name] Request:', { userId, communityName });

    if (!userId?.trim() || !communityName?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'userId and communityName are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Überprüfe, dass User existiert
    const user = await prisma.user.findUnique({
      where: { id: userId.trim() },
      select: { id: true, communityName: true },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } }
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
        console.log('[POST /api/user/community-name] Name already taken');
        return new NextResponse(
          JSON.stringify({ error: 'Community name is already taken by another user' }),
          { status: 409, headers: { ...CORS, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update User mit neuem communityName
    console.log('[POST /api/user/community-name] Updating user with new name:', newName);
    const updatedUser = await prisma.user.update({
      where: { id: userId.trim() },
      data: { communityName: newName },
      select: { id: true, communityName: true },
    });

    console.log('[POST /api/user/community-name] User updated:', updatedUser);

    // Aktualisiere alle Scripts des Users auf den neuen Namen
    let updatedCount = 0;
    const userScripts = await prisma.libraryScript.findMany({
      where: {
        userId: userId.trim(),
      },
      select: { id: true, author: true },
    });

    console.log('[POST /api/user/community-name] Found scripts:', userScripts.length);

    if (userScripts.length > 0) {
      const result = await prisma.libraryScript.updateMany({
        where: {
          userId: userId.trim(),
        },
        data: {
          author: newName,
        },
      });
      updatedCount = result.count;
      console.log('[POST /api/user/community-name] Scripts updated:', updatedCount);
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Community name updated${updatedCount > 0 ? ` and ${updatedCount} scripts updated` : ''}`,
        updatedCount,
      }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[POST /api/user/community-name] Error:', err);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update community name', details: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}
