'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
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

// ── Stil-Helfer ──────────────────────────────────────────────────
const STATUS_TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  status:    { label: 'Status',     color: 'text-blue-400 bg-blue-500/10 border-blue-500/25',    icon: <GitCommit className="w-3.5 h-3.5" /> },
  milestone: { label: 'Milestone',  color: 'text-purple-400 bg-purple-500/10 border-purple-500/25', icon: <Milestone className="w-3.5 h-3.5" /> },
  hotfix:    { label: 'Hotfix',     color: 'text-orange-400 bg-orange-500/10 border-orange-500/25', icon: <Flame className="w-3.5 h-3.5" /> },
  dev:       { label: 'Dev-Update', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',    icon: <Code2 className="w-3.5 h-3.5" /> },
}

const RELEASE_TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  feature:     { label: 'New',      color: 'text-purple-400 bg-purple-500/10 border-purple-500/25', icon: <Sparkles className="w-3.5 h-3.5" /> },
  improvement: { label: 'Improved', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25',    icon: <Zap className="w-3.5 h-3.5" /> },
  fix:         { label: 'Fixed',    color: 'text-orange-400 bg-orange-500/10 border-orange-500/25', icon: <Bug className="w-3.5 h-3.5" /> },
  security:    { label: 'Security', color: 'text-green-400 bg-green-500/10 border-green-500/25', icon: <Shield className="w-3.5 h-3.5" /> },
  breaking:    { label: 'Breaking', color: 'text-red-400 bg-red-500/10 border-red-500/25',       icon: <span className="text-xs">💥</span> },
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 3_600_000
  if (diffH < 1)    return 'Gerade eben'
  if (diffH < 24)   return `vor ${Math.floor(diffH)} Std`
  if (diffH < 48)   return 'Gestern'
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

// Einfaches Markdown → JSX (nur Fettdruck, Aufzählungen, Zeilenumbrüche)
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <p key={i} className="text-white font-bold text-xs mt-2 mb-1">{line.slice(4)}</p>
        }
        if (line.startsWith('## ')) {
          return <p key={i} className="text-white font-bold text-sm mt-2 mb-1">{line.slice(3)}</p>
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.slice(2)
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-purple-400 mt-0.5 flex-shrink-0">·</span>
              <span className="text-gray-300 text-sm leading-relaxed">
                {content.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                  j % 2 === 1
                    ? <strong key={j} className="text-white">{part}</strong>
                    : part
                )}
              </span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-gray-400 text-sm leading-relaxed">
            {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="text-white">{part}</strong>
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
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSeen, setLastSeen] = useState(0)

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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 pb-8 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-strong border border-white/10 rounded-3xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl shadow-purple-500/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Was ist neu?</h2>
              <p className="text-gray-500 text-xs mt-0.5">Updates &amp; Entwicklungsstand</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Lade Updates…</span>
            </div>
          )}

          {!loading && feed.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Noch keine Updates vorhanden.</p>
            </div>
          )}

          {!loading && feed.map((item, idx) => {
            const ts = new Date(item.kind === 'status' ? item.data.createdAt : item.data.created_at).getTime()
            const isNew = ts > lastSeen

            if (item.kind === 'status') {
              const meta = STATUS_TYPE_META[item.data.type] || STATUS_TYPE_META.status
              return (
                <div
                  key={`s-${item.data.id}`}
                  className={`rounded-2xl border p-4 transition-all ${
                    isNew ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/8 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isNew && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500 text-white uppercase tracking-wide">
                          Neu
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      {item.data.appVersion && (
                        <span className="text-[11px] text-gray-600 font-mono">
                          v{item.data.appVersion}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-600 flex-shrink-0">{fmtDate(item.data.createdAt)}</span>
                  </div>
                  <p className="text-white font-semibold text-sm mb-2">{item.data.title}</p>
                  <SimpleMarkdown text={item.data.body} />
                  <p className="text-gray-600 text-[11px] mt-3">— {item.data.author}</p>
                </div>
              )
            }

            // release entry
            const meta = RELEASE_TYPE_META[item.data.type] || RELEASE_TYPE_META.feature
            return (
              <div
                key={`r-${item.data.id}`}
                className={`rounded-2xl border p-4 transition-all ${
                  isNew ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/8 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isNew && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500 text-white uppercase tracking-wide">
                        Neu
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-gray-600 font-mono">v{item.data.version}</span>
                  </div>
                  <span className="text-[11px] text-gray-600 flex-shrink-0">{fmtDate(item.data.created_at)}</span>
                </div>
                <p className="text-white font-semibold text-sm">{item.data.title}</p>
                {item.data.description && (
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.data.description}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
          <Link
            href="/changelog"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 glass border border-white/10 rounded-xl text-gray-300 hover:text-white hover:border-purple-500/30 transition-all text-sm font-semibold group"
          >
            Vollständiger Changelog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
