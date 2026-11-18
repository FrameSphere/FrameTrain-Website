import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { cleanEmail, cleanSeatName, isTeamRole } from '@/lib/team'
import { ownerTeam, teamDashboardView } from '@/lib/team-admin'

export const dynamic = 'force-dynamic'

async function seatOfOwner(id: string) {
  const auth = await ownerTeam()
  if ('error' in auth) return { res: NextResponse.json({ error: auth.error }, { status: auth.status }) }
  const seat = await prisma.teamSeat.findFirst({ where: { id, teamId: auth.team.id } })
  if (!seat) return { res: NextResponse.json({ error: 'Platz nicht gefunden' }, { status: 404 }) }
  return { seat, teamId: auth.team.id, userId: auth.userId }
}

// Platz aendern: Name, E-Mail, Rolle, sperren/entsperren, Passwort
// zuruecksetzen, Geraet freigeben, neuen Schluessel erzeugen.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const found = await seatOfOwner(id)
  if ('res' in found) return found.res
  const { seat, teamId, userId } = found
  const body = await req.json().catch(() => ({}))

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) {
    const name = cleanSeatName(body.name)
    if (!name) return NextResponse.json({ error: 'Gib einen Namen an (höchstens 80 Zeichen).' }, { status: 400 })
    data.name = name
  }
  if (body.email !== undefined) {
    const email = cleanEmail(body.email)
    if (email === undefined) return NextResponse.json({ error: 'Die E-Mail-Adresse ist ungültig.' }, { status: 400 })
    data.email = email
  }
  if (body.role !== undefined) {
    if (!isTeamRole(body.role)) return NextResponse.json({ error: 'Unbekannte Rolle.' }, { status: 400 })
    data.role = body.role
  }
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if (body.resetPassword === true) {
    data.desktopPasswordHash = null
    data.deviceId = null // neu anmelden muss die Person ohnehin
  }
  if (body.releaseDevice === true) data.deviceId = null

  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length) await tx.teamSeat.update({ where: { id: seat.id }, data })
    // Sperren wirkt auch auf alle anderen Wege, die nur den Schluessel pruefen
    if (typeof body.isActive === 'boolean') {
      await tx.apiKey.update({ where: { id: seat.apiKeyId }, data: { isActive: body.isActive } })
    }
    if (body.regenerateKey === true) {
      // Neuer Schluessel = alter Schluessel ist sofort ungueltig; Geraet wird frei.
      const key = await tx.apiKey.create({ data: { userId, key: generateApiKey(), isActive: seat.isActive } })
      await tx.teamSeat.update({ where: { id: seat.id }, data: { apiKeyId: key.id, deviceId: null } })
      await tx.apiKey.delete({ where: { id: seat.apiKeyId } })
    }
  })
  return NextResponse.json({ team: await teamDashboardView(teamId) })
}

// Platz loeschen: Schluessel verschwindet, der Platz wird wieder frei.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const found = await seatOfOwner(id)
  if ('res' in found) return found.res
  // Loescht ueber die Kaskade auch den Platz
  await prisma.apiKey.delete({ where: { id: found.seat.apiKeyId } })
  return NextResponse.json({ team: await teamDashboardView(found.teamId) })
}
