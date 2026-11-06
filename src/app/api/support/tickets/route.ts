import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { linkTickets, listTickets, parseTicketRefs } from '@/lib/support-links'

// Support-Tickets des angemeldeten Kontos (Website: Chat und Dashboard).
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({ tickets: await listTickets(user.userId) })
}

/** Body: { tickets: [{ ticket_id, user_token, subject }] } – verknuepft und liefert die volle Liste. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!rateLimit(`support-link:${user.userId}`, 30, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  await linkTickets(user.userId, parseTicketRefs(body?.tickets), 'web')
  return NextResponse.json({ tickets: await listTickets(user.userId) })
}
