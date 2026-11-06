import { beforeEach, describe, expect, it } from 'vitest'
import { filterHelp, isValidEmail, loadTickets, markSeen, rememberTicket, unreadIn, type Thread } from '../support'

// Node-Umgebung: kleiner localStorage-Ersatz fuer window.localStorage
const store = new Map<string, string>()
const localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v) },
  clear: () => store.clear(),
}
;(globalThis as unknown as { window: unknown }).window = { localStorage }

const thread = (id: number, admin: number): Thread => ({
  ticket: { id, subject: 's', status: 'open', created_at: '', updated_at: '' },
  messages: [
    { sender: 'user', message: 'hi', created_at: '' },
    ...Array.from({ length: admin }, () => ({ sender: 'admin' as const, message: 'a', created_at: '' })),
  ],
})

describe('support helpers', () => {
  beforeEach(() => localStorage.clear())

  it('merges account and guest tickets, newest first, without duplicates', () => {
    rememberTicket(null, { ticket_id: 3, user_token: 'g', subject: 'guest' })
    rememberTicket('u1', { ticket_id: 7, user_token: 'u', subject: 'mine' })
    rememberTicket('u1', { ticket_id: 3, user_token: 'g', subject: 'guest' })
    expect(loadTickets('u1').map((t) => t.ticket_id)).toEqual([7, 3])
    expect(loadTickets(null).map((t) => t.ticket_id)).toEqual([3])
  })

  it('counts unread admin replies until seen', () => {
    const th = thread(5, 2)
    expect(unreadIn(th)).toBe(2)
    markSeen(th)
    expect(unreadIn(th)).toBe(0)
    expect(unreadIn(thread(5, 3))).toBe(1)
  })

  it('filters help by all words in title or keywords', () => {
    const items = [{ title: 'Install FrameTrain', keywords: 'mac windows' }, { title: 'Connect Claude', keywords: 'mcp chatgpt' }]
    expect(filterHelp(items, 'chatgpt')).toHaveLength(1)
    expect(filterHelp(items, 'install mac')).toHaveLength(1)
    expect(filterHelp(items, '')).toHaveLength(2)
  })

  it('validates email addresses', () => {
    expect(isValidEmail('a@b.de')).toBe(true)
    expect(isValidEmail('nope')).toBe(false)
  })
})
