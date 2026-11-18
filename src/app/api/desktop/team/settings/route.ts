import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { teamActorForApiKey } from '@/lib/team-desktop'
import { cleanStorageHint } from '@/lib/team-catalog'

export const dynamic = 'force-dynamic'

// Team-Einstellungen aus der App (nur Admins): Hinweis, wo der Team-Speicher
// liegt. Den Pfad auf dem eigenen Rechner speichert jede App selbst.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const auth = await teamActorForApiKey(body.apiKey, body.deviceId)
  if (!auth.ok) return auth.response
  if (auth.actor.role !== 'admin') return NextResponse.json({ error: 'Nur Admins ändern Team-Einstellungen.' }, { status: 403 })
  const storageHint = cleanStorageHint(body.storageHint)
  if (storageHint === undefined) return NextResponse.json({ error: 'Ungültiger Hinweis (höchstens 300 Zeichen).' }, { status: 400 })
  await prisma.team.update({ where: { id: auth.teamId }, data: { storageHint } })
  return NextResponse.json({ ok: true, storageHint })
}
