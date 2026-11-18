import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { teamActorForApiKey } from '@/lib/team-desktop'

export const dynamic = 'force-dynamic'

// Protokoll: jemand hat einen Eintrag aus dem Team-Speicher geholt.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const auth = await teamActorForApiKey(body.apiKey, body.deviceId)
  if (!auth.ok) return auth.response
  const entry = typeof body.id === 'string'
    ? await prisma.teamEntry.findFirst({ where: { id: body.id, teamId: auth.teamId, deletedAt: null }, select: { id: true, title: true } })
    : null
  if (!entry) return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 })
  await prisma.teamActivity.create({ data: { teamId: auth.teamId, actorName: auth.actor.name, action: 'fetched', entryId: entry.id, title: entry.title } })
  return NextResponse.json({ ok: true })
}
