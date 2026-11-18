import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { cleanEmail, cleanSeatName, freeSeats, isTeamRole } from '@/lib/team'
import { ownerTeam, teamDashboardView } from '@/lib/team-admin'

export const dynamic = 'force-dynamic'

// Neuen Platz vergeben: Schluessel wird erzeugt, das Passwort legt die
// Person bei der ersten Anmeldung in der App selbst fest.
export async function POST(req: NextRequest) {
  const auth = await ownerTeam()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))

  const name = cleanSeatName(body.name)
  if (!name) return NextResponse.json({ error: 'Gib einen Namen an (höchstens 80 Zeichen).' }, { status: 400 })
  const email = cleanEmail(body.email ?? null)
  if (email === undefined) return NextResponse.json({ error: 'Die E-Mail-Adresse ist ungültig.' }, { status: 400 })
  const role = body.role === undefined ? 'member' : body.role
  if (!isTeamRole(role)) return NextResponse.json({ error: 'Unbekannte Rolle.' }, { status: 400 })

  const { team, userId } = auth
  try {
    await prisma.$transaction(async (tx) => {
      const used = await tx.teamSeat.count({ where: { teamId: team.id } })
      if (freeSeats(team.seatLimit, used) < 1) throw new Error('SEATS_FULL')
      const key = await tx.apiKey.create({ data: { userId, key: generateApiKey(), isActive: true } })
      await tx.teamSeat.create({ data: { teamId: team.id, apiKeyId: key.id, name, email, role } })
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'SEATS_FULL') {
      return NextResponse.json({ error: 'Alle Plätze sind vergeben. Schreib uns, wenn du mehr brauchst.' }, { status: 409 })
    }
    throw e
  }
  return NextResponse.json({ team: await teamDashboardView(team.id) })
}
