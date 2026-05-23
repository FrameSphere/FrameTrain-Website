import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Max-Age':       '86400',
};

function corsHeaders() {
  return new Headers(CORS_HEADERS);
}

function checkAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  return token === process.env.LIBRARY_ADMIN_SECRET;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// GET /api/library/admin/pending
// ?status=pending|rejected|approved|all  (default: pending)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  try {
    const status = req.nextUrl.searchParams.get('status') ?? 'pending';

    type WhereClause = {
      verified?: boolean;
      rejectedAt?: { not: null } | null;
    };

    let where: WhereClause = {};
    if (status === 'pending')  where = { verified: false, rejectedAt: null };
    else if (status === 'rejected') where = { rejectedAt: { not: null } };
    else if (status === 'approved') where = { verified: true };
    // 'all' → kein Filter

    const scripts = await prisma.libraryScript.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, description: true, author: true,
        model_type: true, task_type: true, framework: true,
        script_type: true, script: true, verified: true, tags: true,
        downloads: true, stars: true,
        aiCheckResult: true, aiCheckedAt: true,
        rejectedAt: true, rejectedReason: true,
        createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ scripts, count: scripts.length }, { headers: corsHeaders() });
  } catch (err) {
    console.error('[GET /api/library/admin/pending]', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500, headers: corsHeaders() });
  }
}
