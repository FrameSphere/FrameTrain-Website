import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { userIdForApiKey } from '../_shared'
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
  const userId = await userIdForApiKey(body?.apiKey)
  if (!userId) return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
  await linkTickets(userId, parseTicketRefs(body?.tickets), 'app')
  return NextResponse.json({ tickets: await listTickets(userId) })
}
