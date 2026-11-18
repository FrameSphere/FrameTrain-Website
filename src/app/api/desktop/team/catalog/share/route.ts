import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { teamActorForApiKey } from '@/lib/team-desktop'
import {
  ENTRIES_PER_TEAM_MAX, canEdit, canShare, cleanLocalRef, cleanPayload, cleanSize, cleanStoragePath,
  cleanTitle, entryView, isEntryKind, shareActivity,
} from '@/lib/team-catalog'

export const dynamic = 'force-dynamic'

// Modellversion oder Dataset im Team teilen (nur Metadaten). Erneutes Teilen
// desselben lokalen Eintrags aktualisiert ihn, z. B. nachdem die Dateien in
// den Team-Speicher gelegt wurden.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`team-share:${ip}`, 300, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  const auth = await teamActorForApiKey(body.apiKey, body.deviceId)
  if (!auth.ok) return auth.response
  const { actor, teamId } = auth
  if (!canShare(actor)) return NextResponse.json({ error: 'Mit Leserechten kannst du nichts teilen.' }, { status: 403 })

  const kind = body.kind
  const localRef = cleanLocalRef(body.localRef)
  const title = cleanTitle(body.title)
  const payload = cleanPayload(body.payload)
  const storagePath = cleanStoragePath(body.storagePath)
  if (!isEntryKind(kind) || !localRef || !title) return NextResponse.json({ error: 'Ungültiger Eintrag' }, { status: 400 })
  if (!payload) return NextResponse.json({ error: 'Die Angaben sind zu groß (höchstens 64 KB).' }, { status: 400 })
  if (storagePath === undefined) return NextResponse.json({ error: 'Ungültiger Pfad im Team-Speicher' }, { status: 400 })
  const auto = body.auto === true

  const where = { teamId_kind_localRef_authorKey: { teamId, kind, localRef, authorKey: actor.key } }
  const existing = await prisma.teamEntry.findUnique({ where })
  if (existing && !canEdit(actor, existing)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  // Auto-Teilen holt einen vom Autor entfernten Eintrag nicht zurueck
  if (existing?.deletedAt && auto) return NextResponse.json({ entry: null, skipped: true })
  if (!existing) {
    const count = await prisma.teamEntry.count({ where: { teamId, deletedAt: null } })
    if (count >= ENTRIES_PER_TEAM_MAX) {
      return NextResponse.json({ error: `Der Team-Katalog ist voll (${ENTRIES_PER_TEAM_MAX} Einträge).` }, { status: 409 })
    }
  }

  // Ein Auto-Teilen ueberschreibt keinen schon gesetzten Speicherort
  const nextStorage = auto && existing?.storagePath ? existing.storagePath : storagePath
  const action = shareActivity(existing, { storagePath: nextStorage, auto })
  const data = {
    title, payload: payload as object, storagePath: nextStorage, sizeBytes: cleanSize(body.sizeBytes),
    authorName: actor.name, auto: existing ? existing.auto && auto : auto, deletedAt: null,
  }
  const entry = await prisma.teamEntry.upsert({
    where,
    create: { teamId, kind, localRef, authorKey: actor.key, ...data },
    update: data,
  })
  if (action) {
    await prisma.teamActivity.create({ data: { teamId, actorName: actor.name, action, entryId: entry.id, title } })
  }
  return NextResponse.json({ entry: entryView(entry, actor) })
}
