import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { teamActorForApiKey } from '@/lib/team-desktop'
import { ACTIVITY_LIMIT, entryView } from '@/lib/team-catalog'

export const dynamic = 'force-dynamic'

// Team-Katalog abholen. Ohne `since` alle aktiven Eintraege; mit `since`
// (ISO-Zeit der letzten Antwort) nur Aenderungen inkl. entfernter Eintraege.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`team-catalog:${ip}`, 240, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  const auth = await teamActorForApiKey(body.apiKey, body.deviceId)
  if (!auth.ok) return auth.response

  const serverTime = new Date()
  const since = typeof body.since === 'string' && !Number.isNaN(Date.parse(body.since))
    // Puffer gegen Uhr- und Transaktionsversatz; die App fuehrt nach ID zusammen
    ? new Date(Date.parse(body.since) - 5000)
    : null

  const [entries, activity, team] = await Promise.all([
    prisma.teamEntry.findMany({
      where: since ? { teamId: auth.teamId, updatedAt: { gt: since } } : { teamId: auth.teamId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    }),
    prisma.teamActivity.findMany({
      where: { teamId: auth.teamId },
      orderBy: { createdAt: 'desc' },
      take: ACTIVITY_LIMIT,
      select: { id: true, actorName: true, action: true, entryId: true, title: true, createdAt: true },
    }),
    prisma.team.findUnique({ where: { id: auth.teamId }, select: { storageHint: true } }),
  ])

  return NextResponse.json({
    serverTime: serverTime.toISOString(),
    full: !since,
    storageHint: team?.storageHint ?? null,
    you: auth.actor,
    entries: entries.map((e) => entryView(e, auth.actor)),
    activity: activity.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
  })
}
