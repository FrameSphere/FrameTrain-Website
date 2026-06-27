import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const CODEX_SECRET = process.env.CODEX_API_KEY || ''

export const dynamic = 'force-dynamic'

// ── GET /api/status-updates ─────────────────────────────────────
// Öffentlich – gibt die letzten N veröffentlichten Updates zurück
export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50)

    const updates = await prisma.statusUpdate.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        appVersion: true,
        source: true,
        sourceRef: true,
        scope: true,
        author: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ updates })
  } catch (err) {
    console.error('[status-updates GET]', err)
    return NextResponse.json({ updates: [] }, { status: 200 })
  }
}

// ── POST /api/status-updates ────────────────────────────────────
// Geschützt durch CODEX_API_KEY – nur Codex / CI darf posten
//
// Beispiel-Payload:
// {
//   "title": "Synapse Builder: Canvas-Persistence gefixt",
//   "body":  "### Was wurde gemacht\n- Canvas-Nodes bleiben jetzt...",
//   "type":  "hotfix",           // optional, default "status"
//   "appVersion": "0.9.3-dev",   // optional
//   "source": "desktop-app",     // optional
//   "sourceRef": "v1.2.5",        // optional
//   "scope": "changelog",        // optional
//   "author": "Codex"            // optional
// }
//
// Authentifizierung: Authorization: Bearer <CODEX_API_KEY>
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!CODEX_SECRET || key !== CODEX_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, body: text, type, appVersion, source, sourceRef, scope, author } = body

    if (!title || typeof title !== 'string' || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }

    const validTypes = ['status', 'milestone', 'hotfix', 'dev']
    const safeType = validTypes.includes(type) ? type : 'status'

    const update = await prisma.statusUpdate.create({
      data: {
        title: title.trim().slice(0, 200),
        body: text.trim().slice(0, 5000),
        type: safeType,
        appVersion: appVersion ? String(appVersion).slice(0, 30) : null,
        source: source ? String(source).slice(0, 60) : null,
        sourceRef: sourceRef ? String(sourceRef).slice(0, 120) : null,
        scope: scope ? String(scope).slice(0, 60) : null,
        author: author ? String(author).slice(0, 60) : 'Codex',
        published: true,
      },
    })

    console.log('[status-updates POST] Created:', update.id, '-', update.title)
    return NextResponse.json({ success: true, id: update.id }, { status: 201 })
  } catch (err) {
    console.error('[status-updates POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
