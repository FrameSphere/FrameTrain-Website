import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { freeSeats, isTeamRole } from '@/lib/team'

// Verwaltung der Plaetze im Web-Dashboard. Nur der Inhaber, nur per
// Browser-Cookie — ein Platz-Schluessel (Bearer) darf hier nichts aendern.
export async function ownerTeam() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Nicht authentifiziert', status: 401 as const }
  const team = await prisma.team.findUnique({ where: { ownerId: user.userId } })
  if (!team) return { error: 'Kein Business-Team', status: 404 as const }
  return { team, userId: user.userId }
}

export async function teamDashboardView(teamId: string) {
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      seats: {
        orderBy: { createdAt: 'asc' },
        include: { apiKey: { select: { key: true } } },
      },
    },
  })
  return {
    id: team.id,
    name: team.name,
    seatLimit: team.seatLimit,
    freeSeats: freeSeats(team.seatLimit, team.seats.length),
    accessUntil: team.accessUntil ? team.accessUntil.toISOString() : null,
    seats: team.seats.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: isTeamRole(s.role) ? s.role : 'member',
      isActive: s.isActive,
      // Schluessel steht wie beim eigenen Schluessel im Klartext im Dashboard,
      // damit der Inhaber ihn weitergeben kann.
      apiKey: s.apiKey.key,
      hasPassword: !!s.desktopPasswordHash,
      deviceName: s.deviceName,
      lastSeenAt: s.lastSeenAt ? s.lastSeenAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
    })),
  }
}
