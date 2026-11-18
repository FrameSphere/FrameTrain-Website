import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTeamRole, teamHasAccess } from '@/lib/team'
import type { Actor } from '@/lib/team-catalog'

// Auth fuer /api/desktop/team/*: API-Key -> Team und handelnde Person.
// Gesperrte Plaetze, Plaetze auf einem anderen Geraet und abgelaufene Teams
// kommen nicht durch.
export async function teamActorForApiKey(apiKey: unknown, deviceId?: unknown): Promise<
  | { ok: true; teamId: string; actor: Actor }
  | { ok: false; response: NextResponse }
> {
  const deny = (error: string, status: number) => ({ ok: false as const, response: NextResponse.json({ error }, { status }) })
  if (typeof apiKey !== 'string' || !apiKey.startsWith('ft_')) return deny('invalid api key', 401)

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: {
      isActive: true, expiresAt: true, userId: true,
      user: { select: { name: true, email: true, hasPaid: true, ownedTeam: { select: { id: true, accessUntil: true } } } },
      seat: {
        select: {
          id: true, name: true, role: true, isActive: true, deviceId: true,
          team: { select: { id: true, accessUntil: true } },
        },
      },
    },
  })
  if (!key || !key.isActive || (key.expiresAt && key.expiresAt < new Date())) return deny('invalid api key', 401)

  const seat = key.seat
  const team = seat ? seat.team : key.user.ownedTeam
  if (!team) return deny('Kein Business-Team', 404)
  if (!teamHasAccess(key.user.hasPaid, team.accessUntil)) return deny('Der Zugang des Teams ist abgelaufen.', 403)
  if (seat) {
    if (!seat.isActive) return deny('Dieser Platz wurde gesperrt.', 403)
    if (typeof deviceId === 'string' && seat.deviceId && seat.deviceId !== deviceId) {
      return deny('Dein Platz wird auf einem anderen Gerät genutzt.', 409)
    }
  }
  const actor: Actor = seat
    ? { key: seat.id, name: seat.name, role: isTeamRole(seat.role) ? seat.role : 'member' }
    : { key: 'owner', name: key.user.name || key.user.email, role: 'admin' }
  return { ok: true, teamId: team.id, actor }
}
