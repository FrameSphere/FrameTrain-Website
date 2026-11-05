'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  ArrowLeft, BookOpen, Bot, CircleDot, Laptop, Link2, Loader2, MessageSquare, RefreshCw, Unplug, Wrench,
} from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ConnectorUrlCopy } from '@/components/mcp/ConnectorUrlCopy'


interface McpStatus {
  connections: { id: string; clientName: string; createdAt: string; lastUsedAt: string | null }[]
  recentJobs: { id: string; tool: string; clientName: string; status: string; createdAt: string }[]
  devices: { id: string; deviceName: string; appVersion: string; lastSeenAt: string; online: boolean; toolCount: number }[]
}

function useRelativeTime() {
  const locale = useLocale()
  return useCallback(
    (iso: string) => {
      const diff = (new Date(iso).getTime() - Date.now()) / 1000
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      const abs = Math.abs(diff)
      if (abs < 60) return rtf.format(Math.round(diff), 'second')
      if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
      if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
      return rtf.format(Math.round(diff / 86400), 'day')
    },
    [locale],
  )
}

function Steps({ title, steps, icon: Icon }: { title: string; steps: string[]; icon: typeof Bot }) {
  return (
    <div className="bg-surface-raised border border-line rounded-md p-5">
      <h3 className="flex items-center gap-2 font-semibold text-ink mb-3">
        <Icon className="w-5 h-5 text-indigo-text" />
        {title}
      </h3>
      <ol className="space-y-2 text-sm text-ink-muted list-decimal list-inside">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  )
}

export default function AiConnectionsPage() {
  const t = useTranslations('AiConnections')
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const relTime = useRelativeTime()
  const [status, setStatus] = useState<McpStatus | null>(null)
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(false)
    try {
      const res = await fetch('/api/user/mcp', { credentials: 'include', cache: 'no-store' })
      if (!res.ok) throw new Error()
      setStatus(await res.json())
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?next=/dashboard/ai-connections')
    if (!authLoading && isAuthenticated) load()
  }, [authLoading, isAuthenticated, load, router])

  // Online-Status aktuell halten, solange die Seite offen ist.
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [isAuthenticated, load])

  const disconnect = async (id: string, clientName: string) => {
    if (!confirm(t('clients.confirm', { client: clientName }))) return
    setBusyId(id)
    try {
      await fetch('/api/user/mcp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', connectionId: id }),
      })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const device = status?.devices[0]
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const timeFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 flex-shrink-0 bg-ghost-fill border border-line rounded-lg flex items-center justify-center">
              <Bot className="w-7 h-7 text-ink" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-ink">{t('title')}</h1>
              <p className="text-ink-muted mt-1">{t('subtitle')}</p>
            </div>
          </div>

          {(authLoading || (!status && !error)) && (
            <div className="flex items-center gap-2 text-ink-muted mb-8">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('loading')}
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 border border-danger rounded-md text-sm text-ink flex items-center justify-between gap-4">
              <span>{t('loadError')}</span>
              <button onClick={load} className="flex items-center gap-1 text-indigo-text font-semibold">
                <RefreshCw className="w-4 h-4" />
                {t('retry')}
              </button>
            </div>
          )}

          {status && (
            <>
              {/* App-Status */}
              <section className="bg-surface border border-line rounded-lg p-6 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-ink mb-4">
                  <Laptop className="w-5 h-5 text-indigo-text" />
                  {t('app.heading')}
                </h2>
                {!device ? (
                  <p className="text-sm text-ink-muted">{t('app.never')}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-semibold ${
                          device.online ? 'text-success border-line bg-ghost-fill' : 'text-ink-muted border-line bg-surface-raised'
                        }`}
                      >
                        <CircleDot className="w-3.5 h-3.5" />
                        {device.online ? t('app.online') : t('app.offline')}
                      </span>
                      <span className="font-semibold text-ink">{device.deviceName}</span>
                      <span className="text-sm text-ink-muted">{t('app.version', { version: device.appVersion })}</span>
                      {device.toolCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
                          <Wrench className="w-3.5 h-3.5" />
                          {t('app.tools', { count: device.toolCount })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-faint">{t('app.lastSeen', { time: relTime(device.lastSeenAt) })}</p>
                    {!device.online && <p className="text-sm text-ink-muted">{t('app.offlineHint')}</p>}
                  </div>
                )}
              </section>

              {/* Verbundene Clients */}
              <section className="bg-surface border border-line rounded-lg p-6 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-ink mb-4">
                  <Link2 className="w-5 h-5 text-indigo-text" />
                  {t('clients.heading')}
                </h2>
                {status.connections.length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('clients.empty')}</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {status.connections.map((c) => (
                      <li key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink truncate">{c.clientName}</p>
                          <p className="text-xs text-ink-faint">
                            {t('clients.connected', { date: dateFmt.format(new Date(c.createdAt)) })}
                            {c.lastUsedAt && <> · {t('clients.lastUsed', { time: relTime(c.lastUsedAt) })}</>}
                          </p>
                        </div>
                        <button
                          onClick={() => disconnect(c.id, c.clientName)}
                          disabled={busyId === c.id}
                          className="press inline-flex items-center justify-center gap-2 px-4 py-2 border border-line hover:border-danger text-danger rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {busyId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
                          {busyId === c.id ? t('clients.disconnecting') : t('clients.disconnect')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Letzte Aufrufe */}
              <section className="bg-surface border border-line rounded-lg p-6 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-ink mb-4">
                  <MessageSquare className="w-5 h-5 text-indigo-text" />
                  {t('jobs.heading')}
                </h2>
                {status.recentJobs.length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('jobs.empty')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-line">
                        {status.recentJobs.map((j) => (
                          <tr key={j.id}>
                            <td className="py-2 pr-4 font-mono text-ink whitespace-nowrap">{j.tool}</td>
                            <td className="py-2 pr-4 text-ink-muted whitespace-nowrap">{j.clientName}</td>
                            <td className="py-2 pr-4 text-ink-muted whitespace-nowrap">
                              {t.has(`jobs.status.${j.status}`) ? t(`jobs.status.${j.status}` as 'jobs.status.done') : j.status}
                            </td>
                            <td className="py-2 text-ink-faint whitespace-nowrap text-right">
                              {timeFmt.format(new Date(j.createdAt))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Anleitung */}
          <section className="bg-surface border border-line rounded-lg p-6">
            <h2 className="text-xl font-semibold text-ink mb-4">{t('guide.heading')}</h2>
            <p className="text-sm font-medium text-ink mb-2">{t('guide.urlLabel')}</p>
            <div className="mb-6">
              <ConnectorUrlCopy />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Steps title={t('guide.appTitle')} steps={t.raw('guide.appSteps') as string[]} icon={Laptop} />
              <Steps title={t('guide.claudeTitle')} steps={t.raw('guide.claudeSteps') as string[]} icon={Bot} />
              <Steps title={t('guide.chatgptTitle')} steps={t.raw('guide.chatgptSteps') as string[]} icon={MessageSquare} />
            </div>
            <p className="mt-4 text-xs text-ink-faint">{t('guide.localHint')}</p>
            <Link href="/docs/mcp" className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-text font-medium">
              <BookOpen className="w-4 h-4" />
              {t('guide.docsLink')}
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
