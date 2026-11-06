// Support-Tickets: gemeinsame Helfer fuer Chat-Fenster, Feedback-Dialog und Dashboard.
//
// Die Tickets liegen im Manager (WebControl-HQ, Cloudflare Worker). Wer welches
// Ticket lesen darf, haengt am user_token, den der Manager beim Anlegen zurueckgibt.
// Diese Paare (ticket_id + user_token) merkt sich der Browser – fuer Angemeldete
// unter demselben Schluessel wie das Dashboard (ft_tickets_<userId>), fuer Gaeste
// unter ft_tickets_guest.

export const MANAGER_API =
  process.env.NEXT_PUBLIC_MANAGER_API_URL || 'https://webcontrol-hq-api.karol-paschek.workers.dev'

export interface StoredTicket {
  ticket_id: number
  user_token: string
  subject: string
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface ThreadMessage {
  sender: 'user' | 'admin'
  message: string
  created_at: string
}

export interface Thread {
  ticket: { id: number; subject: string; status: TicketStatus; created_at: string; updated_at: string }
  messages: ThreadMessage[]
}

export const GUEST_KEY = 'ft_tickets_guest'
const SEEN_KEY = 'ft_support_seen_v1'

export function ticketKey(userId: string | null | undefined): string {
  return userId ? `ft_tickets_${userId}` : GUEST_KEY
}

function readList(key: string): StoredTicket[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v.filter((t) => t && typeof t.ticket_id === 'number' && typeof t.user_token === 'string') : []
  } catch {
    return []
  }
}

/** Eigene Tickets dieses Browsers, neueste zuerst. Angemeldete sehen auch ihre Gast-Tickets. */
export function loadTickets(userId: string | null | undefined): StoredTicket[] {
  const lists = userId ? [readList(ticketKey(userId)), readList(GUEST_KEY)] : [readList(GUEST_KEY)]
  const seen = new Set<number>()
  const out: StoredTicket[] = []
  for (const t of lists.flat()) {
    if (seen.has(t.ticket_id)) continue
    seen.add(t.ticket_id)
    out.push(t)
  }
  return out.sort((a, b) => b.ticket_id - a.ticket_id)
}

export function rememberTicket(userId: string | null | undefined, t: StoredTicket) {
  try {
    const key = ticketKey(userId)
    const list = readList(key).filter((x) => x.ticket_id !== t.ticket_id)
    window.localStorage.setItem(key, JSON.stringify([t, ...list]))
  } catch {}
}

/** Anzahl Antworten von dir, die der Nutzer schon gesehen hat (je Ticket). */
function readSeen(): Record<string, number> {
  try {
    const v = JSON.parse(window.localStorage.getItem(SEEN_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

export function adminCount(thread: Thread): number {
  return thread.messages.filter((m) => m.sender === 'admin').length
}

export function unreadIn(thread: Thread): number {
  return Math.max(0, adminCount(thread) - (readSeen()[String(thread.ticket.id)] ?? 0))
}

export function markSeen(thread: Thread) {
  try {
    const seen = readSeen()
    seen[String(thread.ticket.id)] = adminCount(thread)
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {}
}

export async function fetchThread(t: StoredTicket): Promise<Thread | null> {
  try {
    const res = await fetch(`${MANAGER_API}/api/support/${t.ticket_id}/thread?token=${encodeURIComponent(t.user_token)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.ticket && Array.isArray(data.messages) ? (data as Thread) : null
  } catch {
    return null
  }
}

export async function submitTicket(input: {
  userId: string | null
  name: string
  email: string
  subject: string
  message: string
}): Promise<StoredTicket | null> {
  const res = await fetch(`${MANAGER_API}/api/support/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site_id: 'frametrain',
      user_id: input.userId || 'guest',
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success || !data.ticket_id || !data.user_token) return null
  const stored = { ticket_id: data.ticket_id as number, user_token: data.user_token as string, subject: input.subject }
  rememberTicket(input.userId, stored)
  return stored
}

export async function replyToTicket(t: StoredTicket, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${MANAGER_API}/api/support/${t.ticket_id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: t.user_token, message }),
    })
    const data = await res.json().catch(() => ({}))
    return res.ok && !!data.success
  } catch {
    return false
  }
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
}

/** Hilfe-Eintraege nach Suchbegriff filtern (Titel und Stichworte, ohne Gross/Klein). */
export function filterHelp<T extends { title: string; keywords?: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  const words = q.split(/\s+/)
  return items.filter((i) => {
    const hay = `${i.title} ${i.keywords ?? ''}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

export const OPEN_SUPPORT_EVENT = 'ft-open-support'
export type SupportView = 'list' | 'new' | 'help'

/** Oeffnet das Chat-Fenster von ueberall (Footer, /support, Island …). */
export function openSupport(view: SupportView = 'list') {
  window.dispatchEvent(new CustomEvent(OPEN_SUPPORT_EVENT, { detail: { view } }))
}

/** Oeffentliche Support-Adresse (Impressum, /support, Verzeichnis-Eintraege). Spaeter: support@frame-train.com */
export const SUPPORT_EMAIL = 'framesphere@gmx.net'
