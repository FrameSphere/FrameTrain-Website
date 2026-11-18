import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { SEAT_PASSWORD_MIN } from '@/lib/team'

export const dynamic = 'force-dynamic'

// Erste Anmeldung auf einem Business-Platz: die Person legt ihr eigenes
// Desktop-Passwort fest. Geht nur, solange keins gesetzt ist — zuruecksetzen
// kann nur der Inhaber im Dashboard.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`seat-password:${ip}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'Zu viele Versuche. Bitte warte kurz.' }, { status: 429 })
  }
  const { apiKey, password } = await req.json().catch(() => ({}))
  if (typeof apiKey !== 'string' || !apiKey.startsWith('ft_')) {
    return NextResponse.json({ error: 'Ungültiger Schlüssel' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < SEAT_PASSWORD_MIN || password.length > 200) {
    return NextResponse.json({ error: `Das Passwort braucht mindestens ${SEAT_PASSWORD_MIN} Zeichen.` }, { status: 400 })
  }

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: { isActive: true, expiresAt: true, seat: { select: { id: true, isActive: true, desktopPasswordHash: true } } },
  })
  const seat = key?.seat
  if (!key || !key.isActive || (key.expiresAt && key.expiresAt < new Date()) || !seat) {
    return NextResponse.json({ error: 'Schlüssel gehört zu keinem Team-Platz.' }, { status: 401 })
  }
  if (!seat.isActive) {
    return NextResponse.json({ error: 'Dieser Platz wurde vom Team-Inhaber gesperrt.' }, { status: 401 })
  }

  const hash = await bcrypt.hash(password, 12)
  // Bedingt schreiben: zwei gleichzeitige Erstanmeldungen setzen nicht beide.
  const { count } = await prisma.teamSeat.updateMany({
    where: { id: seat.id, desktopPasswordHash: null },
    data: { desktopPasswordHash: hash },
  })
  if (count === 0) {
    return NextResponse.json(
      { error: 'Für diesen Platz ist schon ein Passwort festgelegt. Der Team-Inhaber kann es zurücksetzen.' },
      { status: 409 }
    )
  }
  return NextResponse.json({ ok: true })
}
