'use client'

// Support-Chat unten rechts auf jeder Seite.
//
// Ein Knopf "Hilfe" oeffnet ein Fenster mit den eigenen Gespraechen (Tickets im
// Manager), einem Formular fuer neue Anfragen (auch ohne Konto, mit E-Mail) und
// einer durchsuchbaren Hilfe-Liste. Antworten von Karol erscheinen als Zahl am
// Knopf. Auf dem Handy fuellt das Fenster den Bildschirm.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, ChevronRight, LifeBuoy, Loader2, MessageCircle, Plus, Search, Send, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { detectPlatform } from '@/lib/platform'
import {
  OPEN_SUPPORT_EVENT, filterHelp, fetchThread, isValidEmail, loadTickets, markSeen, replyToTicket, submitTicket,
  unreadIn, type StoredTicket, type SupportView, type Thread,
} from '@/lib/support'

type View = SupportView | 'thread'
type Topic = 'ai' | 'install' | 'account' | 'other'
interface HelpItem { title: string; href: string; keywords?: string }

const POLL_MS = 2 * 60 * 1000
const LAST_SENT_KEY = 'ft_feedback_last_sent'
const MIN_INTERVAL_MS = 60 * 1000

export function SupportChat() {
  const t = useTranslations('SupportChat')
  const locale = useLocale()
  const pathname = usePathname()
  const { user } = useAuth()
  const userId = user?.id ? String(user.id) : null

  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('list')
  const [tickets, setTickets] = useState<StoredTicket[]>([])
  const [threads, setThreads] = useState<Record<number, Thread | null>>({})
  const [active, setActive] = useState<StoredTicket | null>(null)
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => setMounted(true), [])

  // Eigene Tickets und deren Verlauf laden (beim Start, beim Oeffnen, alle 2 min wenn sichtbar)
  const refresh = useCallback(async () => {
    const list = loadTickets(userId).slice(0, 10)
    setTickets(list)
    if (list.length === 0) return
    setLoadingList(true)
    const results = await Promise.all(list.map((x) => fetchThread(x)))
    setThreads(Object.fromEntries(list.map((x, i) => [x.ticket_id, results[i]])))
    setLoadingList(false)
  }, [userId])

  useEffect(() => {
    if (!mounted) return
    void refresh()
    const id = setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, POLL_MS)
    return () => clearInterval(id)
  }, [mounted, refresh])

  useEffect(() => {
    const onOpen = (e: Event) => {
      const v = (e as CustomEvent<{ view?: SupportView }>).detail?.view
      setOpen(true)
      setView(v ?? (loadTickets(userId).length ? 'list' : 'new'))
      void refresh()
    }
    window.addEventListener(OPEN_SUPPORT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_SUPPORT_EVENT, onOpen)
  }, [refresh, userId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const unread = useMemo(
    () => Object.values(threads).reduce((n, th) => n + (th ? unreadIn(th) : 0), 0),
    [threads],
  )

  const openThread = (x: StoredTicket) => {
    setActive(x)
    setView('thread')
  }

  const onThreadLoaded = useCallback((th: Thread) => {
    markSeen(th)
    setThreads((prev) => ({ ...prev, [th.ticket.id]: th }))
  }, [])

  // Auf der OAuth-Zustimmung soll nichts ablenken.
  if (!mounted || pathname.startsWith('/oauth')) return null

  const launcher = (
    <button
      type="button"
      onClick={() => {
        if (open) { setOpen(false); return }
        setOpen(true)
        setView(tickets.length ? 'list' : 'new')
        void refresh()
      }}
      aria-expanded={open}
      aria-controls="ft-support-panel"
      className={`${open ? 'hidden sm:inline-flex' : 'inline-flex'} fixed bottom-5 right-5 z-[90] items-center gap-2 h-11 px-4 rounded-full bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-medium text-sm transition duration-200 ease-out`}
    >
      {open ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
      <span>{open ? t('close') : t('launcher')}</span>
      {!open && unread > 0 && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-on-indigo text-indigo text-xs font-semibold inline-flex items-center justify-center" aria-label={t('unread', { count: unread })}>
          {unread}
        </span>
      )}
    </button>
  )

  const panel = open && (
    <section
      id="ft-support-panel"
      role="dialog"
      aria-modal="false"
      aria-label={t('title')}
      className="fixed z-[95] inset-0 sm:inset-auto sm:bottom-20 sm:right-5 sm:w-[380px] sm:h-[min(600px,calc(100vh-7rem))] flex flex-col bg-surface border border-line sm:rounded-lg shadow-2xl overflow-hidden"
    >
      <header className="flex items-center gap-3 px-4 py-3 border-b border-line">
        {view === 'thread' || view === 'new' ? (
          <button type="button" onClick={() => setView('list')} className="p-1 -ml-1 text-ink-muted hover:text-ink" aria-label={t('back')}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- SVG-Logo
          <img src="/brand/frametrain-icon-indigo.svg" alt="" width={28} height={28} className="rounded-[22%]" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">
            {view === 'thread' && active ? active.subject : t('title')}
          </p>
          <p className="text-xs text-ink-faint">{t('responseTime')}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="p-1 text-ink-muted hover:text-ink" aria-label={t('close')}>
          <X className="w-4 h-4" />
        </button>
      </header>

      {(view === 'list' || view === 'help') && (
        <nav className="flex gap-1 px-4 pt-3" aria-label={t('title')}>
          {(['list', 'help'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-current={view === v ? 'page' : undefined}
              className={`px-3 py-1 rounded-full text-xs font-medium ${view === v ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              {t(v === 'list' ? 'tabs.conversations' : 'tabs.help')}
            </button>
          ))}
        </nav>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        {view === 'list' && (
          <ConversationList
            tickets={tickets}
            threads={threads}
            loading={loadingList}
            onOpen={openThread}
            onNew={() => setView('new')}
          />
        )}
        {view === 'help' && <HelpList onNew={() => setView('new')} onNavigate={() => setOpen(false)} />}
        {view === 'new' && (
          <NewRequest
            userId={userId}
            userEmail={user?.email ?? ''}
            pathname={pathname}
            locale={locale}
            onCreated={(x) => { void refresh(); openThread(x) }}
          />
        )}
        {view === 'thread' && active && <ThreadView ticket={active} onLoaded={onThreadLoaded} />}
      </div>
    </section>
  )

  return createPortal(<>{panel}{launcher}</>, document.body)
}

// ── Gespraeche ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Thread['ticket']['status'] }) {
  const t = useTranslations('SupportChat')
  const cls = status === 'resolved' ? 'text-success' : status === 'closed' ? 'text-ink-faint' : status === 'in_progress' ? 'text-warning' : 'text-indigo-text'
  return <span className={`text-xs ${cls}`}>{t(`status.${status}`)}</span>
}

function ConversationList({ tickets, threads, loading, onOpen, onNew }: {
  tickets: StoredTicket[]
  threads: Record<number, Thread | null>
  loading: boolean
  onOpen: (t: StoredTicket) => void
  onNew: () => void
}) {
  const t = useTranslations('SupportChat')
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
        {tickets.length === 0 ? (
          <div className="pt-6 text-center">
            <LifeBuoy className="w-8 h-8 mx-auto text-ink-faint" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-ink">{t('empty.title')}</p>
            <p className="mt-1 text-sm text-ink-muted">{t('empty.text')}</p>
          </div>
        ) : (
          tickets.map((x) => {
            const th = threads[x.ticket_id]
            const last = th?.messages[th.messages.length - 1]
            const unread = th ? unreadIn(th) : 0
            return (
              <button
                key={x.ticket_id}
                type="button"
                onClick={() => onOpen(x)}
                className="w-full text-left rounded-md border border-line hover:border-line-strong bg-bg px-3 py-2.5 flex items-start gap-3 transition duration-200 ease-out"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink truncate flex-1">{x.subject}</p>
                    {th ? <StatusBadge status={th.ticket.status} /> : loading ? <Loader2 className="w-3 h-3 animate-spin text-ink-faint" /> : null}
                  </div>
                  {last && (
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {last.sender === 'admin' ? `${t('karol')}: ` : ''}{last.message}
                    </p>
                  )}
                </div>
                {unread > 0 && <span className="mt-1 w-2 h-2 rounded-full bg-indigo-text flex-shrink-0" aria-label={t('unread', { count: unread })} />}
                <ChevronRight className="w-4 h-4 text-ink-faint flex-shrink-0 mt-0.5" />
              </button>
            )
          })
        )}
      </div>
      <div className="px-4 py-3 border-t border-line">
        <button type="button" onClick={onNew} className="ft-btn ft-btn--primary ft-btn--sm w-full inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />{t('newRequest')}
        </button>
      </div>
    </div>
  )
}

// ── Hilfe ────────────────────────────────────────────────────────────────────

function HelpList({ onNew, onNavigate }: { onNew: () => void; onNavigate: () => void }) {
  const t = useTranslations('SupportChat')
  const [q, setQ] = useState('')
  const items = t.raw('help.items') as HelpItem[]
  const shown = filterHelp(items, q)
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 pt-3">
        <label className="relative block">
          <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('help.search')}
            aria-label={t('help.search')}
            className="ft-input w-full pl-9 text-sm"
          />
        </label>
      </div>
      <ul className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-1">
        {shown.map((i) => (
          <li key={i.href + i.title}>
            <Link href={i.href} onClick={onNavigate} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-ink hover:bg-surface-raised">
              <span className="flex-1">{i.title}</span>
              <ChevronRight className="w-4 h-4 text-ink-faint" />
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="px-2 py-2 text-sm text-ink-muted">{t('help.none')}</li>}
      </ul>
      <div className="px-4 py-3 border-t border-line text-sm text-ink-muted flex items-center justify-between gap-2">
        <span>{t('help.stillStuck')}</span>
        <button type="button" onClick={onNew} className="text-indigo-text font-medium">{t('help.write')}</button>
      </div>
    </div>
  )
}

// ── Neue Anfrage ─────────────────────────────────────────────────────────────

function NewRequest({ userId, userEmail, pathname, locale, onCreated }: {
  userId: string | null
  userEmail: string
  pathname: string
  locale: string
  onCreated: (t: StoredTicket) => void
}) {
  const t = useTranslations('SupportChat')
  const [topic, setTopic] = useState<Topic>('ai')
  const [email, setEmail] = useState(userEmail)
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // Honeypot
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { textRef.current?.focus() }, [])
  useEffect(() => { if (userEmail) setEmail(userEmail) }, [userEmail])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (website) return
    if (!userId && !isValidEmail(email)) { setError(t('errors.email')); return }
    if (message.trim().length < 10) { setError(t('errors.short')); return }
    try {
      const last = Number(window.localStorage.getItem(LAST_SENT_KEY) || 0)
      if (Date.now() - last < MIN_INTERVAL_MS) { setError(t('errors.tooFast')); return }
    } catch {}
    setSending(true)
    const platform = detectPlatform()
    const context = [
      `Seite: ${pathname} (${locale})`,
      `System: ${platform.mobile ? 'Handy/Tablet' : platform.os ?? 'unbekannt'}${platform.os === 'mac' ? ` (${platform.macChip})` : ''}`,
      `Konto: ${userId ? 'angemeldet' : 'Gast'}`,
      `Quelle: Support-Chat`,
    ].join('\n')
    const firstLine = message.trim().split('\n')[0].slice(0, 60)
    const subject = `[${t(`topics.${topic}`)}] ${firstLine}`
    try {
      const created = await submitTicket({
        userId,
        name: email.split('@')[0] || 'Support-Chat',
        email: email.trim(),
        subject,
        message: `${message.trim()}\n\n---\n${context}`,
      })
      if (!created) throw new Error()
      try { window.localStorage.setItem(LAST_SENT_KEY, String(Date.now())) } catch {}
      onCreated(created)
    } catch {
      setError(t('errors.send'))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col" noValidate>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
        <fieldset>
          <legend className="ft-label mb-2">{t('topicLabel')}</legend>
          <div className="flex flex-wrap gap-2">
            {(['ai', 'install', 'account', 'other'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTopic(k)}
                aria-pressed={topic === k}
                className={`px-3 py-1.5 rounded-full text-xs border ${topic === k ? 'bg-indigo-soft text-indigo-text border-line-strong' : 'border-line text-ink-muted hover:text-ink'}`}
              >
                {t(`topics.${k}`)}
              </button>
            ))}
          </div>
        </fieldset>
        {!userId && (
          <label className="block">
            <span className="ft-label mb-1 block">{t('emailLabel')}</span>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }} placeholder="du@beispiel.de" className="ft-input w-full text-sm" autoComplete="email" />
            <span className="text-xs text-ink-faint mt-1 block">{t('emailHint')}</span>
          </label>
        )}
        <label className="block">
          <span className="ft-label mb-1 block">{t('messageLabel')}</span>
          <textarea
            ref={textRef}
            value={message}
            onChange={(e) => { setMessage(e.target.value); setError(null) }}
            rows={6}
            placeholder={t('messagePlaceholder')}
            className="ft-input w-full text-sm py-2 h-auto resize-none"
          />
        </label>
        <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <p className="text-xs text-ink-faint">
          {t.rich('privacy', { link: (c) => <Link href="/privacy" className="underline">{c}</Link> })}
        </p>
      </div>
      <div className="px-4 py-3 border-t border-line">
        <button type="submit" disabled={sending} className="ft-btn ft-btn--accent ft-btn--sm w-full inline-flex items-center justify-center gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {t('send')}
        </button>
      </div>
    </form>
  )
}

// ── Verlauf eines Gespraechs ─────────────────────────────────────────────────

function ThreadView({ ticket, onLoaded }: { ticket: StoredTicket; onLoaded: (th: Thread) => void }) {
  const t = useTranslations('SupportChat')
  const locale = useLocale()
  const [thread, setThread] = useState<Thread | null>(null)
  const [failed, setFailed] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const th = await fetchThread(ticket)
    if (!th) { setFailed(true); return }
    setFailed(false)
    setThread(th)
    onLoaded(th)
  }, [ticket, onLoaded])

  useEffect(() => { void load() }, [load])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [thread])

  const fmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }), [locale])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = text.trim()
    if (!msg) { setError(t('errors.empty')); return }
    setSending(true)
    setError(null)
    const ok = await replyToTicket(ticket, msg)
    setSending(false)
    if (!ok) { setError(t('errors.send')); return }
    setText('')
    void load()
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {!thread && !failed && <div className="flex justify-center pt-6"><Loader2 className="w-5 h-5 animate-spin text-ink-faint" /></div>}
        {failed && <p className="text-sm text-ink-muted">{t('errors.load')}</p>}
        {thread?.messages.map((m, i) => {
          const mine = m.sender === 'user'
          // Technischen Kontext (nach "---") nicht im Chat zeigen
          const body = mine ? m.message.split('\n\n---\n')[0] : m.message
          return (
            <div key={i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${mine ? 'bg-surface-raised text-ink' : 'bg-indigo-soft text-ink'}`}>
                {body}
              </div>
              <span className="text-[11px] text-ink-faint mt-1">
                {mine ? t('you') : t('karol')} · {fmt.format(new Date(m.created_at.replace(' ', 'T') + (m.created_at.endsWith('Z') ? '' : 'Z')))}
              </span>
            </div>
          )
        })}
        {thread && (thread.ticket.status === 'resolved' || thread.ticket.status === 'closed') && (
          <p className="text-xs text-ink-faint text-center">{t('closedHint')}</p>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="px-4 py-3 border-t border-line flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send(e) }}
          rows={2}
          placeholder={t('replyPlaceholder')}
          aria-label={t('replyPlaceholder')}
          className="ft-input flex-1 text-sm py-2 h-auto resize-none"
        />
        <button type="submit" disabled={sending} className="ft-btn ft-btn--accent ft-btn--sm inline-flex items-center gap-1.5" aria-label={t('send')}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
      {error && <p className="px-4 pb-3 -mt-1 text-sm text-danger" role="alert">{error}</p>}
    </div>
  )
}
