import { beforeEach, describe, expect, it, vi } from 'vitest'

const rows: { userId: string; ticketId: number; userToken: string; subject: string; source: string }[] = []
vi.mock('@/lib/prisma', () => ({
  prisma: {
    supportTicketLink: {
      findMany: vi.fn(async ({ where }: { where: { userId: string; ticketId?: { in: number[] } } }) =>
        rows.filter((r) => r.userId === where.userId && (!where.ticketId || where.ticketId.in.includes(r.ticketId)))
          .sort((a, b) => b.ticketId - a.ticketId)),
      upsert: vi.fn(async ({ create }: { create: (typeof rows)[number] }) => { rows.push(create); return create }),
    },
  },
}))

import { linkTickets, listTickets, parseTicketRefs } from '../support-links'

const TOKEN = 'a'.repeat(64)
const manager = (ok: Set<number>) =>
  (async (url: string) => {
    const id = Number(String(url).match(/support\/(\d+)\/thread/)?.[1])
    return ok.has(id) && String(url).includes(TOKEN)
      ? new Response(JSON.stringify({ ticket: { subject: `Ticket ${id}` }, messages: [] }), { status: 200 })
      : new Response('{}', { status: 404 })
  }) as unknown as typeof fetch

describe('support ticket links', () => {
  beforeEach(() => { rows.length = 0 })

  it('parses only well-formed refs', () => {
    expect(parseTicketRefs([
      { ticket_id: 4, user_token: TOKEN, subject: 'x' },
      { ticket_id: 'nope', user_token: TOKEN },
      { ticket_id: 5, user_token: 'short' },
      null,
    ])).toEqual([{ ticket_id: 4, user_token: TOKEN, subject: 'x' }])
    expect(parseTicketRefs('x')).toEqual([])
  })

  it('links only tickets the Manager confirms, once', async () => {
    const fetchImpl = manager(new Set([4]))
    const refs = parseTicketRefs([{ ticket_id: 4, user_token: TOKEN, subject: '' }, { ticket_id: 9, user_token: TOKEN, subject: 'fake' }])
    expect(await linkTickets('u1', refs, 'web', fetchImpl)).toBe(1)
    expect(await linkTickets('u1', refs, 'web', fetchImpl)).toBe(0)
    expect(await listTickets('u1')).toEqual([{ ticket_id: 4, user_token: TOKEN, subject: 'Ticket 4' }])
    expect(await listTickets('u2')).toEqual([])
  })
})
