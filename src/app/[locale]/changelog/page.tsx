'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Sparkles, Zap, Bug, Shield, Rocket, RefreshCw,
  GitCommit, Milestone, Flame, Code2,
} from 'lucide-react'
import type { StatusUpdate } from '@/components/ChangelogModal'

const MANAGER_API = process.env.NEXT_PUBLIC_MANAGER_API_URL || 'https://webcontrol-hq-api.karol-paschek.workers.dev'

interface ChangelogEntry {
  id: number
  version: string
  title: string
  description: string | null
  title_en?: string | null
  description_en?: string | null
  source?: string | null
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'
  published: number
  created_at: string
}

type StaticEntry = { type: string; text: string }
type StaticRelease = { version: string; date: string; tag: string; tagColor: string; entries: StaticEntry[] }

// ── Stil-Helfer ───────────────────────────────────────────────────
function getChangeIcon(type: string) {
  const cls = 'w-4 h-4 flex-shrink-0 mt-0.5'
  switch (type) {
    case 'feature':     return <Sparkles className={`${cls} text-indigo-text`} />
    case 'improvement': return <Zap       className={`${cls} text-indigo-text`} />
    case 'fix':         return <Bug       className={`${cls} text-warning`} />
    case 'security':    return <Shield    className={`${cls} text-success`} />
    case 'breaking':    return <span className="text-sm flex-shrink-0 mt-0.5"></span>
    default:            return <Sparkles className={`${cls} text-ink-muted`} />
  }
}

const TYPE_COLOR: Record<string, string> = {
  feature:     'text-indigo-text bg-indigo-soft border-line',
  improvement: 'text-indigo-text bg-indigo-soft border-line',
  fix:         'text-warning bg-ghost-fill border-line',
  security:    'text-success bg-ghost-fill border-line',
  breaking:    'text-danger bg-ghost-fill border-danger',
}

const STATUS_TYPE_COLOR: Record<string, string> = {
  status:    'text-indigo-text bg-indigo-soft border-line',
  milestone: 'text-indigo-text bg-indigo-soft border-line',
  hotfix:    'text-warning bg-ghost-fill border-line',
  dev:       'text-indigo-text bg-indigo-soft border-line',
}

const STATUS_TYPE_ICON: Record<string, React.ReactNode> = {
  status:    <GitCommit className="w-3.5 h-3.5" />,
  milestone: <Milestone className="w-3.5 h-3.5" />,
  hotfix:    <Flame className="w-3.5 h-3.5" />,
  dev:       <Code2 className="w-3.5 h-3.5" />,
}

// Einfacher Markdown-Renderer für Status-Update-Body
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <p key={i} className="text-ink font-semibold text-sm mt-3 mb-1">{line.slice(4)}</p>
        if (line.startsWith('## '))  return <p key={i} className="text-ink font-semibold mt-3 mb-1">{line.slice(3)}</p>
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.slice(2)
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-indigo-text mt-1 flex-shrink-0">·</span>
              <span className="text-ink text-sm leading-relaxed">
                {content.split(/\*\*(.*?)\*\*/g).map((p, j) =>
                  j % 2 === 1 ? <strong key={j} className="text-ink">{p}</strong> : p
                )}
              </span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-ink-muted text-sm leading-relaxed">
            {line.split(/\*\*(.*?)\*\*/g).map((p, j) =>
              j % 2 === 1 ? <strong key={j} className="text-ink">{p}</strong> : p
            )}
          </p>
        )
      })}
    </div>
  )
}

// ── Seite ─────────────────────────────────────────────────────────
export default function ChangelogPage() {
  const t = useTranslations('Changelog')
  const locale = useLocale()
  const [apiEntries, setApiEntries]   = useState<ChangelogEntry[] | null>(null)
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [loadingChangelog, setLoadingChangelog] = useState(true)
  const [loadingStatus, setLoadingStatus]       = useState(true)

  const staticReleases = t.raw('staticReleases') as StaticRelease[]

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { year: 'numeric', month: 'long', day: 'numeric' })

  // Zweisprachige Einträge: EN-Felder nutzen, wenn Locale = en und vorhanden
  const entryTitle = (e: ChangelogEntry) =>
    locale === 'en' && e.title_en ? e.title_en : e.title
  const entryDescription = (e: ChangelogEntry) =>
    locale === 'en' && e.description_en ? e.description_en : e.description
  // Automation-Versionen sind Datumsangaben (YYYY-MM-DD) → als Datum anzeigen statt "vYYYY-MM-DD"
  const isDateVersion = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)

  useEffect(() => {
    // Changelog-Einträge vom Manager-API
    fetch(`${MANAGER_API}/api/changelog/published?site_id=frametrain`)
      .then(r => r.json())
      .then((data: ChangelogEntry[]) => setApiEntries(Array.isArray(data) ? data : []))
      .catch(() => setApiEntries([]))
      .finally(() => setLoadingChangelog(false))

    // Status-Updates von der eigenen API
    fetch('/api/status-updates?limit=30')
      .then(r => r.json())
      .then(d => setStatusUpdates(Array.isArray(d.updates) ? d.updates : []))
      .catch(() => setStatusUpdates([]))
      .finally(() => setLoadingStatus(false))
  }, [])

  // Changelog nach Version gruppieren
  const grouped: Record<string, ChangelogEntry[]> = {}
  if (apiEntries) {
    apiEntries.forEach(e => {
      grouped[e.version] = grouped[e.version] || []
      grouped[e.version].push(e)
    })
  }
  const versions = Object.keys(grouped).sort((a, b) => {
    const da = grouped[a][0].created_at
    const db = grouped[b][0].created_at
    return new Date(db).getTime() - new Date(da).getTime()
  })

  const hasApiData   = apiEntries && apiEntries.length > 0
  const hasStatusData = statusUpdates.length > 0
  const loading      = loadingChangelog || loadingStatus

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-line">
          <div className="absolute inset-0 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-ghost-fill border border-line rounded-xl mb-6">
              <Rocket className="w-10 h-10 text-ink" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-ink mb-6">{t('heading')}</h1>
            <p className="text-xl text-ink-muted max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="mt-8 flex gap-6 justify-center text-sm text-ink-faint flex-wrap">
              {[
                { icon: <Sparkles className="w-4 h-4 text-indigo-text" />, label: t('legend.feature') },
                { icon: <Zap       className="w-4 h-4 text-indigo-text" />, label: t('legend.improvement') },
                { icon: <Bug       className="w-4 h-4 text-warning" />, label: t('legend.fix') },
                { icon: <Shield    className="w-4 h-4 text-success" />, label: t('legend.security') },
                { icon: <GitCommit className="w-4 h-4 text-indigo-text" />, label: t('legend.devStatus') },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">{icon}<span>{label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-16">

            {/* Lade-Spinner */}
            {loading && (
              <div className="flex items-center justify-center py-16 gap-3 text-ink-muted">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-text" />
                <span>{t('loading')}</span>
              </div>
            )}

            {/* ── Status-Updates (Codex-Automatisierung) ── */}
            {!loadingStatus && hasStatusData && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-5 h-5 text-indigo-text" />
                    <h2 className="text-2xl font-semibold text-ink">{t('devStatusHeading')}</h2>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-soft border border-line text-indigo-text">
                    {t('liveBadge')}
                  </span>
                </div>

                <div className="space-y-4">
                  {statusUpdates.map(update => {
                    const metaColor = STATUS_TYPE_COLOR[update.type] || STATUS_TYPE_COLOR.status
                    const metaIcon = STATUS_TYPE_ICON[update.type] || STATUS_TYPE_ICON.status
                    const metaLabel = t(`statusTypeLabels.${update.type}` as any) || update.type
                    return (
                      <article key={update.id} className="bg-surface border border-line rounded-lg border border-line overflow-hidden">
                        {/* Kopfzeile */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${metaColor}`}>
                              {metaIcon}
                              {metaLabel}
                            </span>
                            {update.appVersion && (
                              <span className="text-xs font-mono text-ink-faint">v{update.appVersion}</span>
                            )}
                            <h3 className="text-ink font-semibold">{update.title}</h3>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-xs text-ink-faint">{fmtDate(update.createdAt)}</div>
                            <div className="text-[11px] text-ink-faint mt-0.5">— {update.author}</div>
                          </div>
                        </div>
                        {/* Body */}
                        <div className="px-6 py-5">
                          <SimpleMarkdown text={update.body} />
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Release-Einträge (Manager-API) ── */}
            <div>
                {hasStatusData && (
                  <div className="flex items-center gap-3 mb-8">
                    <Rocket className="w-5 h-5 text-indigo-text" />
                    <h2 className="text-2xl font-semibold text-ink">{t('releasesHeading')}</h2>
                  </div>
                )}

                {/* API-Einträge */}
                {hasApiData && versions.map(version => {
                  const entries = grouped[version]
                  const latest  = entries[0]
                  return (
                    <article key={version} className="mb-12">
                      <div className="flex items-center gap-4 mb-6 flex-wrap">
                        <div className="bg-surface border border-line rounded-lg px-6 py-4 border border-line">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl font-semibold text-ink">
                              {isDateVersion(version) ? fmtDate(version) : `v${version}`}
                            </span>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full border text-indigo-text bg-indigo-soft border-line">
                              Release
                            </span>
                          </div>
                          {!isDateVersion(version) && (
                            <div className="text-sm text-ink-faint">{fmtDate(latest.created_at)}</div>
                          )}
                        </div>
                      </div>
                      <div className="bg-surface border border-line rounded-lg border border-line overflow-hidden">
                        <div className="divide-y divide-line">
                          {entries.map(e => (
                            <div key={e.id} className="flex items-start gap-4 px-6 py-4 hover:bg-ghost-fill transition-colors">
                              {getChangeIcon(e.type)}
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${TYPE_COLOR[e.type] || TYPE_COLOR.feature}`}>
                                {t(`typeLabels.${e.type}` as any) || e.type}
                              </span>
                              <div className="min-w-0">
                                <p className="text-ink text-sm font-semibold">{entryTitle(e)}</p>
                                {entryDescription(e) && (
                                  e.source === 'automation'
                                    ? <div className="mt-2"><SimpleMarkdown text={entryDescription(e)!} /></div>
                                    : <p className="text-ink-muted text-sm mt-1 leading-relaxed">{entryDescription(e)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  )
                })}

                {/* Statische Fallback-Releases */}
                {!hasApiData && staticReleases.map(release => (
                  <article key={release.version} className="mb-12">
                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                      <div className="bg-surface border border-line rounded-lg px-6 py-4 border border-line">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl font-semibold text-ink">v{release.version}</span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            release.tagColor === 'green'
                              ? 'text-success bg-ghost-fill border-line'
                              : 'text-indigo-text bg-indigo-soft border-line'
                          }`}>
                            {release.tag}
                          </span>
                        </div>
                        <div className="text-sm text-ink-faint">{fmtDate(release.date)}</div>
                      </div>
                    </div>
                    <div className="bg-surface border border-line rounded-lg border border-line overflow-hidden">
                      <div className="divide-y divide-line">
                        {release.entries.map((change, i) => (
                          <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-ghost-fill transition-colors">
                            {getChangeIcon(change.type)}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${TYPE_COLOR[change.type] || TYPE_COLOR.feature}`}>
                              {t(`typeLabels.${change.type}` as any) || change.type}
                            </span>
                            <p className="text-ink text-sm leading-relaxed">{change.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}

                {/* Leer */}
                {!hasApiData && !loadingChangelog && staticReleases.length === 0 && (
                  <div className="text-center py-16 text-ink-faint">
                    <div className="text-4xl mb-4"></div>
                    <p>{t('emptyState')}</p>
                  </div>
                )}
              </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-surface border border-line rounded-xl p-10 border border-line">
              <h2 className="text-2xl font-semibold text-ink mb-4">{t('cta.heading')}</h2>
              <p className="text-ink-muted mb-6">{t('cta.text')}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register" className="relative group px-6 py-3 rounded-md overflow-hidden inline-block">
                  <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                  <span className="relative text-ink font-semibold">{t('cta.ctaStart')}</span>
                </Link>
                <Link href="/docs" className="bg-surface border border-line px-6 py-3 rounded-md text-ink hover:text-ink transition font-semibold">
                  {t('cta.ctaDocs')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
