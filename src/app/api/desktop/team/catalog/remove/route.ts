import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { teamActorForApiKey } from '@/lib/team-desktop'
import { canEdit } from '@/lib/team-catalog'

export const dynamic = 'force-dynamic'

// Eintrag aus dem Katalog nehmen (Autor oder Admin). Bleibt als geloescht
// markiert, damit die Apps der anderen ihn beim naechsten Abgleich entfernen.
// Dateien im Team-Speicher loescht die App des Handelnden selbst.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const auth = await teamActorForApiKey(body.apiKey, body.deviceId)
  if (!auth.ok) return auth.response
  const entry = typeof body.id === 'string'
    ? await prisma.teamEntry.findFirst({ where: { id: body.id, teamId: auth.teamId } })
    : null
  if (!entry || entry.deletedAt) return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 })
  if (!canEdit(auth.actor, entry)) return NextResponse.json({ error: 'Nur der Autor oder ein Admin kann das entfernen.' }, { status: 403 })
  await prisma.$transaction([
    prisma.teamEntry.update({ where: { id: entry.id }, data: { deletedAt: new Date() } }),
    prisma.teamActivity.create({ data: { teamId: auth.teamId, actorName: auth.actor.name, action: 'removed', entryId: entry.id, title: entry.title } }),
  ])
  return NextResponse.json({ ok: true })
}
