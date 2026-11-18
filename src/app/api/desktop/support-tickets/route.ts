import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { accountForApiKey } from '../_shared'
import { linkTickets, listTickets, parseTicketRefs } from '@/lib/support-links'

// Support-Tickets fuer die Desktop-App (Authentifizierung per API-Key wie die
// uebrigen /api/desktop-Routen). Body: { apiKey, tickets?: [...] }.
// Verknuepft die mitgeschickten Tickets und liefert alle Tickets des Kontos.
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`desktop-support:${ip}`, 30, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  const account = await accountForApiKey(body?.apiKey)
  if (!account) return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
  // Business-Platz: Support-Verlauf des Inhabers bleibt privat; die Anfragen
  // der Person bleiben lokal in ihrer App.
  if (account.seatId) return NextResponse.json({ tickets: [] })
  const userId = account.userId
  await linkTickets(userId, parseTicketRefs(body?.tickets), 'app')
  return NextResponse.json({ tickets: await listTickets(userId) })
}
