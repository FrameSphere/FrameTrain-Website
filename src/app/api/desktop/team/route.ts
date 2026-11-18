import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { buildMemberList, freeSeats, isTeamRole, teamHasAccess } from '@/lib/team'

export const dynamic = 'force-dynamic'

// Team-Seite der App und Lebenszeichen: liefert Team und Mitglieder und sagt,
// ob der Platz noch auf diesem Geraet aktiv ist (sonst meldet die App ab).
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`desktop-team:${ip}`, 120, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const { apiKey, deviceId } = await req.json().catch(() => ({}))
  if (typeof apiKey !== 'string' || !apiKey.startsWith('ft_')) {
    return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
  }

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: {
      isActive: true,
      expiresAt: true,
      userId: true,
      seat: { select: { id: true, teamId: true, role: true, isActive: true, deviceId: true } },
    },
  })
  if (!key || !key.isActive || (key.expiresAt && key.expiresAt < new Date())) {
    return NextResponse.json({ error: 'invalid api key', active: false }, { status: 401 })
  }

  const seat = key.seat
  const team = await prisma.team.findUnique({
    where: seat ? { id: seat.teamId } : { ownerId: key.userId },
    include: {
      owner: {
        select: {
          id: true, name: true, email: true, hasPaid: true,
          apiKeys: { where: { seat: null }, select: { lastUsedAt: true }, orderBy: { lastUsedAt: 'desc' }, take: 1 },
        },
      },
      seats: {
        select: { id: true, name: true, role: true, isActive: true, deviceName: true, lastSeenAt: true, createdAt: true },
      },
    },
  })
  if (!team) return NextResponse.json({ team: null, active: true })

  // Lebenszeichen: Platz gesperrt oder auf einem anderen Geraet uebernommen?
  let active = teamHasAccess(team.owner.hasPaid, team.accessUntil)
  let reason: 'locked' | 'other_device' | 'no_access' | null = active ? null : 'no_access'
  if (seat) {
    if (!seat.isActive) { active = false; reason = 'locked' }
    else if (seat.deviceId && seat.deviceId !== deviceId) { active = false; reason = 'other_device' }
    else if (active) await prisma.teamSeat.update({ where: { id: seat.id }, data: { lastSeenAt: new Date() } })
  }

  const members = buildMemberList(
    { id: team.owner.id, name: team.owner.name, email: team.owner.email, lastSeenAt: team.owner.apiKeys[0]?.lastUsedAt ?? null },
    team.seats,
    { seatId: seat ? seat.id : null },
  )

  return NextResponse.json({
    active,
    reason,
    team: {
      id: team.id,
      name: team.name,
      seatLimit: team.seatLimit,
      freeSeats: freeSeats(team.seatLimit, team.seats.length),
      accessUntil: team.accessUntil ? team.accessUntil.toISOString() : null,
      role: seat ? (isTeamRole(seat.role) ? seat.role : 'member') : 'admin',
      isOwner: !seat,
      seatId: seat ? seat.id : null,
      members,
    },
  })
}
