// Server: Support-Tickets einem Konto zuordnen (Tabelle support_ticket_links).
// Ein Ticket wird nur verknuepft, wenn der Manager das Paar ticket_id + user_token
// bestaetigt – wer den Token nicht kennt, kann fremde Tickets nicht uebernehmen.

import { prisma } from '@/lib/prisma'
import { MANAGER_API } from '@/lib/support'

export interface TicketRef {
  ticket_id: number
  user_token: string
  subject: string
}

const MAX_PER_CALL = 20

export function parseTicketRefs(raw: unknown): TicketRef[] {
  if (!Array.isArray(raw)) return []
  const out: TicketRef[] = []
  for (const r of raw.slice(0, MAX_PER_CALL)) {
    if (!r || typeof r !== 'object') continue
    const t = r as Record<string, unknown>
    const id = Number(t.ticket_id)
    if (!Number.isInteger(id) || id <= 0) continue
    if (typeof t.user_token !== 'string' || !/^[a-f0-9]{16,128}$/i.test(t.user_token)) continue
    const subject = typeof t.subject === 'string' ? t.subject.slice(0, 200) : ''
    out.push({ ticket_id: id, user_token: t.user_token, subject })
  }
  return out
}

async function managerConfirms(t: TicketRef, fetchImpl: typeof fetch): Promise<string | null> {
  try {
    const res = await fetchImpl(`${MANAGER_API}/api/support/${t.ticket_id}/thread?token=${encodeURIComponent(t.user_token)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.ticket?.subject === 'string' ? data.ticket.subject : null
  } catch {
    return null
  }
}

/** Verknuepft bestaetigte Tickets mit dem Konto; bekannte werden nicht erneut geprueft. */
export async function linkTickets(userId: string, refs: TicketRef[], source: 'web' | 'app', fetchImpl: typeof fetch = fetch) {
  if (refs.length === 0) return 0
  const known = new Set(
    (await prisma.supportTicketLink.findMany({ where: { userId, ticketId: { in: refs.map((r) => r.ticket_id) } }, select: { ticketId: true } }))
      .map((r) => r.ticketId),
  )
  let linked = 0
  for (const r of refs) {
    if (known.has(r.ticket_id)) continue
    const subject = await managerConfirms(r, fetchImpl)
    if (subject === null) continue
    await prisma.supportTicketLink.upsert({
      where: { userId_ticketId: { userId, ticketId: r.ticket_id } },
      create: { userId, ticketId: r.ticket_id, userToken: r.user_token, subject: r.subject || subject, source },
      update: {},
    })
    linked++
  }
  return linked
}

export async function listTickets(userId: string): Promise<TicketRef[]> {
  const rows = await prisma.supportTicketLink.findMany({
    where: { userId },
    orderBy: { ticketId: 'desc' },
    take: 50,
    select: { ticketId: true, userToken: true, subject: true },
  })
  return rows.map((r) => ({ ticket_id: r.ticketId, user_token: r.userToken, subject: r.subject }))
}
