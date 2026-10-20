'use client'

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import {
  X, Sparkles, Zap, Bug, Shield, Rocket,
  Bell, GitCommit, Milestone, Flame, Code2, ArrowRight,
} from 'lucide-react'

const MANAGER_API = process.env.NEXT_PUBLIC_MANAGER_API_URL || 'https://webcontrol-hq-api.karol-paschek.workers.dev'
const LS_KEY = 'ft_changelog_last_seen'

// ── Typen ────────────────────────────────────────────────────────
export interface StatusUpdate {
  id: string
  title: string
  body: string
  type: 'status' | 'milestone' | 'hotfix' | 'dev'
  appVersion?: string | null
  author: string
  createdAt: string
}

interface ChangelogEntry {
  id: number
  version: string
  title: string
  description?: string | null
  title_en?: string | null
  description_en?: string | null
  source?: string | null
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'
  created_at: string
}

type FeedItem =
  | { kind: 'status'; data: StatusUpdate }
  | { kind: 'release'; data: ChangelogEntry }

// ── Badge-Hook: gibt Anzahl ungesehener Einträge zurück ──────────
export function useChangelogBadge() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    const lastSeen = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
    try {
      const [statusRes, changelogRes] = await Promise.all([
        fetch('/api/status-updates?limit=20'),
        fetch(`${MANAGER_API}/api/changelog/published?site_id=frametrain`).catch(() => null),
      ])
      const { updates = [] }: { updates: StatusUpdate[] } = await statusRes.json()
      const changelog: ChangelogEntry[] = changelogRes?.ok ? await changelogRes.json() : []

      const allDates = [
        ...updates.map(u => new Date(u.createdAt).getTime()),
        ...changelog.map(c => new Date(c.created_at).getTime()),
      ]
      const newCount = allDates.filter(ts => ts > lastSeen).length
      setCount(newCount)
    } catch {
      setCount(0)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { count, refresh }
}

// ── Stil-Helfer (nur Farbe/Icon, Labels kommen aus next-intl) ────
const STATUS_TYPE_STYLE: Record<string, { color: string; icon: React.ReactNode }> = {
  status:    { color: 'text-indigo-text bg-indigo-soft border-line',    icon: <GitCommit className="w-3.5 h-3.5" /> },
  milestone: { color: 'text-indigo-text bg-indigo-soft border-line', icon: <Milestone className="w-3.5 h-3.5" /> },
  hotfix:    { color: 'text-warning bg-ghost-fill border-line', icon: <Flame className="w-3.5 h-3.5" /> },
  dev:       { color: 'text-indigo-text bg-indigo-soft border-line',    icon: <Code2 className="w-3.5 h-3.5" /> },
}

const RELEASE_TYPE_STYLE: Record<string, { color: string; icon: React.ReactNode }> = {
  feature:     { color: 'text-indigo-text bg-indigo-soft border-line', icon: <Sparkles className="w-3.5 h-3.5" /> },
  improvement: { color: 'text-indigo-text bg-indigo-soft border-line',    icon: <Zap className="w-3.5 h-3.5" /> },
  fix:         { color: 'text-warning bg-ghost-fill border-line', icon: <Bug className="w-3.5 h-3.5" /> },
  security:    { color: 'text-success bg-ghost-fill border-line', icon: <Shield className="w-3.5 h-3.5" /> },
  breaking:    { color: 'text-danger bg-ghost-fill border-danger',       icon: <span className="text-xs"></span> },
}

function fmtDate(
  iso: string,
  locale: string,
  labels: { justNow: string; hoursAgo: string; yesterday: string }
) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 3_600_000
  if (diffH < 1)  return labels.justNow
  if (diffH < 24) return labels.hoursAgo.replace('{h}', String(Math.floor(diffH)))
  if (diffH < 48) return labels.yesterday
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { day: 'numeric', month: 'short' })
}

// Einfaches Markdown → JSX (nur Fettdruck, Aufzählungen, Zeilenumbrüche)
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <p key={i} className="text-ink font-semibold text-xs mt-2 mb-1">{line.slice(4)}</p>
        }
        if (line.startsWith('## ')) {
          return <p key={i} className="text-ink font-semibold text-sm mt-2 mb-1">{line.slice(3)}</p>
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.slice(2)
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-indigo-text mt-0.5 flex-shrink-0">·</span>
              <span className="text-ink text-sm leading-relaxed">
                {content.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                  j % 2 === 1
                    ? <strong key={j} className="text-ink">{part}</strong>
                    : part
                )}
              </span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-ink-muted text-sm leading-relaxed">
            {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="text-ink">{part}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

// ── Haupt-Modal ──────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onRead: () => void
}

export function ChangelogModal({ open, onClose, onRead }: Props) {
  const t = useTranslations('ChangelogModal')
  const locale = useLocale()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSeen, setLastSeen] = useState(0)

  const dateLabels = {
    justNow: t('justNow'),
    hoursAgo: t.raw('hoursAgo'),
    yesterday: t('yesterday'),
  }

  useEffect(() => {
    if (!open) return
    setLastSeen(parseInt(localStorage.getItem(LS_KEY) || '0', 10))

    async function load() {
      setLoading(true)
      try {
        const [statusRes, changelogRes] = await Promise.all([
          fetch('/api/status-updates?limit=15'),
          fetch(`${MANAGER_API}/api/changelog/published?site_id=frametrain`).catch(() => null),
        ])

        const { updates = [] }: { updates: StatusUpdate[] } = await statusRes.json()
        const changelog: ChangelogEntry[] = changelogRes?.ok ? await changelogRes.json() : []

        const items: FeedItem[] = [
          ...updates.map(u => ({ kind: 'status' as const, data: u })),
          ...changelog.slice(0, 10).map(c => ({ kind: 'release' as const, data: c })),
        ].sort((a, b) => {
          const ta = new Date(a.kind === 'status' ? a.data.createdAt : a.data.created_at).getTime()
          const tb = new Date(b.kind === 'status' ? b.data.createdAt : b.data.created_at).getTime()
          return tb - ta
        })

        setFeed(items)
      } catch {
        setFeed([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open])

  // Beim Schließen als gelesen markieren
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => {
      localStorage.setItem(LS_KEY, String(Date.now()))
      onRead()
    }, 1500)
    return () => clearTimeout(id)
  }, [open, onRead])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 pb-8 bg-[rgba(5,5,10,0.72)] "
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line border border-line rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-ghost-fill border border-line rounded-md flex items-center justify-center">
              <Rocket className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h2 className="text-ink font-semibold text-lg leading-none">{t('title')}</h2>
              <p className="text-ink-faint text-xs mt-0.5">{t('subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="press p-2 hover:bg-surface-raised rounded-md transition-colors text-ink-muted hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-ink-faint">
              <div className="w-5 h-5 border-2 border-indigo-text border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{t('loadingText')}</span>
            </div>
          )}

          {!loading && feed.length === 0 && (
            <div className="text-center py-12 text-ink-faint">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('emptyText')}</p>
            </div>
          )}

          {!loading && feed.map((item, idx) => {
            const ts = new Date(item.kind === 'status' ? item.data.createdAt : item.data.created_at).getTime()
            const isNew = ts > lastSeen

            if (item.kind === 'status') {
              const style = STATUS_TYPE_STYLE[item.data.type] || STATUS_TYPE_STYLE.status
              const label = t(`statusTypeLabels.${item.data.type}` as any) || item.data.type
              return (
                <div
                  key={`s-${item.data.id}`}
                  className={`rounded-lg border p-4 transition duration-200 ease-out ${
                    isNew ? 'border-line-strong bg-surface-raised' : 'border-line bg-ghost-fill'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isNew && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-button text-ink uppercase tracking-wide">
                          {t('newBadge')}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.color}`}>
                        {style.icon}
                        {label}
                      </span>
                      {item.data.appVersion && (
                        <span className="text-[11px] text-ink-faint font-mono">
                          v{item.data.appVersion}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-ink-faint flex-shrink-0">{fmtDate(item.data.createdAt, locale, dateLabels)}</span>
                  </div>
                  <p className="text-ink font-semibold text-sm mb-2">{item.data.title}</p>
                  <SimpleMarkdown text={item.data.body} />
                  <p className="text-ink-faint text-[11px] mt-3">— {item.data.author}</p>
                </div>
              )
            }

            // release entry (zweisprachig: EN-Felder nutzen, wenn Locale = en)
            const style = RELEASE_TYPE_STYLE[item.data.type] || RELEASE_TYPE_STYLE.feature
            const label = t(`typeLabels.${item.data.type}` as any) || item.data.type
            const relTitle = locale === 'en' && item.data.title_en ? item.data.title_en : item.data.title
            const relDesc  = locale === 'en' && item.data.description_en ? item.data.description_en : item.data.description
            const isDateVersion = /^\d{4}-\d{2}-\d{2}$/.test(item.data.version)
            return (
              <div
                key={`r-${item.data.id}`}
                className={`rounded-lg border p-4 transition duration-200 ease-out ${
                  isNew ? 'border-line-strong bg-surface-raised' : 'border-line bg-ghost-fill'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isNew && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-button text-ink uppercase tracking-wide">
                        {t('newBadge')}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.color}`}>
                      {style.icon}
                      {label}
                    </span>
                    {!isDateVersion && (
                      <span className="text-[11px] text-ink-faint font-mono">v{item.data.version}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-ink-faint flex-shrink-0">{fmtDate(item.data.created_at, locale, dateLabels)}</span>
                </div>
                <p className="text-ink font-semibold text-sm">{relTitle}</p>
                {relDesc && (
                  item.data.source === 'automation'
                    ? <div className="mt-1.5"><SimpleMarkdown text={relDesc} /></div>
                    : <p className="text-ink-muted text-sm mt-1 leading-relaxed">{relDesc}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line flex-shrink-0">
          <Link
            href="/changelog"
            onClick={onClose}
            className="card-lift flex items-center justify-center gap-2 w-full py-2.5 bg-surface border border-line border border-line rounded-md text-ink hover:text-ink hover:border-line transition duration-200 ease-out text-sm font-semibold group"
          >
            {t('viewFull')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
