import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getRequestUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// CORS headers – Desktop-App (Tauri) sendet aus tauri://localhost
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── GET /api/library/scripts ─────────────────────────────────────────────
// Query-Params: search, model_type, task_type, framework, verified_only, limit, offset
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search       = searchParams.get('search')?.trim() ?? '';
    const model_type   = searchParams.get('model_type') ?? '';
    const task_type    = searchParams.get('task_type') ?? '';
    const framework    = searchParams.get('framework') ?? '';
    const verifiedOnly = searchParams.get('verified_only') === 'true';
    const script_type  = searchParams.get('script_type') ?? '';   // 'train' | 'test' | ''
    const limit  = Math.min(100, parseInt(searchParams.get('limit')  ?? '50', 10));
    const offset =              parseInt(searchParams.get('offset') ?? '0',  10);

    // Optionale Authentifizierung: eingeloggte Nutzer sehen zusätzlich ihre
    // EIGENEN abgelehnten Skripte (mit Warnung im Frontend). Fremde abgelehnte
    // Skripte bleiben für alle unsichtbar.
    const currentUser = await getRequestUser(req);

    // Konditionen werden per AND kombiniert – nötig, weil sowohl die
    // Sichtbarkeits- als auch die Suchbedingung ein eigenes OR brauchen.
    const and: Prisma.LibraryScriptWhereInput[] = [];

    // Sichtbarkeit: abgelehnte Skripte nur für den jeweiligen Eigentümer.
    and.push(
      currentUser
        ? { OR: [{ rejectedAt: null }, { userId: currentUser.userId }] }
        : { rejectedAt: null },
    );

    if (verifiedOnly)  and.push({ verified:    true });
    if (model_type)    and.push({ model_type });
    if (task_type)     and.push({ task_type });
    if (framework)     and.push({ framework });
    if (script_type)   and.push({ script_type });

    if (search) {
      and.push({
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { author:      { contains: search, mode: 'insensitive' } },
          { tags:        { has: search.toLowerCase() } },
        ],
      });
    }

    const where: Prisma.LibraryScriptWhereInput = { AND: and };

    const [rawScripts, total] = await Promise.all([
      prisma.libraryScript.findMany({
        where,
        orderBy: [{ downloads: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
      prisma.libraryScript.count({ where }),
    ]);

    // camelCase -> snake_case damit Frontend-Interface stimmt.
    // Nur öffentliche Felder ausliefern: Script-Inhalt (Bandbreite) sowie interne
    // Prüf-Felder (aiCheckResult/aiCheckedAt) gehören nicht ins öffentliche Listing.
    const scripts = rawScripts.map((s) => ({
      id:          s.id,
      name:        s.name,
      description: s.description,
      author:      s.author,
      model_type:  s.model_type,
      task_type:   s.task_type,
      framework:   s.framework,
      script_type: s.script_type,
      verified:    s.verified,
      downloads:   s.downloads,
      stars:       s.stars,
      tags:        s.tags,
      // Nur beim eigenen abgelehnten Skript befüllt (Fremde sind rausgefiltert),
      // damit das Frontend die Ablehnungs-Warnung anzeigen kann.
      rejectedAt:     s.rejectedAt ? s.rejectedAt.toISOString() : null,
      rejectedReason: s.rejectedReason,
      created_at:  s.createdAt.toISOString(),
      updated_at:  s.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { scripts, total, limit, offset },
      { headers: CORS },
    );
  } catch (err) {
    console.error('[GET /api/library/scripts]', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500, headers: CORS },
    );
  }
}

// ── POST /api/library/scripts ────────────────────────────────────────────
// Body: { name, description, author, userId, model_type, task_type, framework, tags, script }
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getRequestUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401, headers: CORS },
      );
    }
    const userId = currentUser.userId;

    const body = await req.json();
    const { name, description, author, model_type, task_type, framework, script_type, tags, script } = body ?? {};

    // Pflichtfeld-Validierung
    if (!name?.trim() || !description?.trim() || !author?.trim() || !script?.trim()) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: name, description, author, script' },
        { status: 400, headers: CORS },
      );
    }
    if (script.length > 500_000) {
      return NextResponse.json(
        { error: 'Skript zu lang (max. 500.000 Zeichen)' },
        { status: 400, headers: CORS },
      );
    }

    // Prüfe ob User existiert
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, communityName: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User nicht gefunden' },
        { status: 404, headers: CORS },
      );
    }

    // Setze communityName beim ersten Upload wenn nicht vorhanden
    // Dies ist KRITISCH für die spätere Name-Synchronisation!
    let userCommunityName = user.communityName;
    if (!userCommunityName) {
      // Prüfe ob dieser Author-Name bereits vergeben ist
      const existingAuthor = await prisma.libraryScript.findFirst({
        where: {
          author: {
            equals: author.trim(),
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      if (existingAuthor) {
        return NextResponse.json(
          { error: 'Community-Name ist bereits vergeben' },
          { status: 409, headers: CORS },
        );
      }

      // WICHTIG: Setze den communityName beim ersten Upload
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { communityName: author.trim() },
          select: { communityName: true },
        });
        userCommunityName = updatedUser.communityName;
      } catch (err) {
        // Falls Update fehlschlägt (zB weil Feld nicht existiert), nutze den Author-Namen direkt
        console.warn('Could not set communityName, falling back to author', err);
        userCommunityName = author.trim();
      }
    }

    const created = await prisma.libraryScript.create({
      data: {
        userId:      userId,
        name:        name.trim().slice(0, 200),
        description: description.trim().slice(0, 2000),
        author:      userCommunityName!.slice(0, 100), // Nutze immer den User.communityName
        model_type:  (model_type  ?? 'Custom').slice(0, 50),
        task_type:   (task_type   ?? 'Fine-Tuning').slice(0, 100),
        framework:   (framework   ?? 'transformers').slice(0, 50),
        script_type: (['train', 'test'].includes(script_type) ? script_type : 'train'),
        tags: Array.isArray(tags)
          ? tags.map((t: string) => String(t).toLowerCase().slice(0, 30)).slice(0, 20)
          : [],
        script,
        verified: false, // Immer false – Verifikation erfolgt manuell
      },
    });

    return NextResponse.json(
      { success: true, id: created.id },
      { status: 201, headers: CORS },
    );
  } catch (err) {
    console.error('[POST /api/library/scripts]', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500, headers: CORS },
    );
  }
}
