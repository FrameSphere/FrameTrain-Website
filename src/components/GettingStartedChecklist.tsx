'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { youtubeWatchUrl, VIDEOS } from '@/lib/videos'

/**
 * Erste-Schritte-Checkliste im Dashboard.
 *
 * Automatisch abgehakt wird nur, was die Website ohnehin weiß: Download
 * geklickt (Flag im Browser) und App angemeldet (lastUsedAt am API-Key).
 * Was in der App passiert, erfährt die Website bewusst nicht (keine
 * Nutzungs-Telemetrie) – diese Schritte hakt der Nutzer selbst ab.
 * Zustand liegt pro Nutzer im localStorage, keine DB-Änderung nötig.
 */
export const DOWNLOAD_FLAG = 'ft_app_downloaded'

type StepKey = 'download' | 'connect' | 'dataset' | 'train' | 'test'

const STEPS: { key: StepKey; href: string; external?: boolean }[] = [
  { key: 'download', href: '/download' },
  { key: 'connect', href: youtubeWatchUrl(VIDEOS.install), external: true },
  { key: 'dataset', href: '/docs#dataset-builder' },
  { key: 'train', href: youtubeWatchUrl(VIDEOS.train), external: true },
  { key: 'test', href: '/docs/ai-training-guide/trainingsverlauf' },
]

export function GettingStartedChecklist({ userId, appConnected }: { userId: string; appConnected: boolean }) {
  const t = useTranslations('Dashboard.checklist')
  const storeKey = `ft_checklist_${userId}`
  const [manual, setManual] = useState<Partial<Record<StepKey, boolean>>>({})
  const [downloaded, setDownloaded] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storeKey) || '{}')
      setManual(saved.steps || {})
      setHidden(!!saved.hidden)
      setDownloaded(window.localStorage.getItem(DOWNLOAD_FLAG) === '1')
    } catch {
      setHidden(false)
    }
  }, [storeKey])

  const save = (steps: typeof manual, hide = hidden) => {
    try {
      window.localStorage.setItem(storeKey, JSON.stringify({ steps, hidden: hide }))
    } catch {}
  }

  const auto: Partial<Record<StepKey, boolean>> = { download: downloaded || appConnected, connect: appConnected }
  const isDone = (k: StepKey) => !!(auto[k] || manual[k])
  const done = STEPS.filter((s) => isDone(s.key)).length
  const total = STEPS.length

  if (hidden) return null

  const toggle = (k: StepKey) => {
    const next = { ...manual, [k]: !manual[k] }
    setManual(next)
    save(next)
  }

  return (
    <section className="mb-8 rounded-xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="checklist-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ft-label m-0">{t('label')}</p>
          <h2 id="checklist-title" className="ft-heading mt-2 mb-0">
            {done === total ? t('doneTitle') : t('title')}
          </h2>
          {done === total && <p className="ft-small mt-2 mb-0">{t('doneText')}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            setHidden(true)
            save(manual, true)
          }}
          className="flex-none text-[14px] text-ink-faint hover:text-ink transition-colors duration-150"
        >
          {t('hide')}
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="ft-progress flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: `${Math.max(3, (done / total) * 100)}%` }} />
        </span>
        <span className="ft-data text-ink-muted tabular-nums">{t('progress', { done, total })}</span>
      </div>

      <ol className="mt-6 m-0 p-0 list-none border-t border-line">
        {STEPS.map((s, i) => {
          const d = isDone(s.key)
          const isAuto = !!auto[s.key]
          const linkCls = 'ft-link inline-flex items-center gap-1 text-[14px] font-medium'
          return (
            <li key={s.key} className="py-4 border-b border-line flex items-start gap-4">
              <button
                type="button"
                onClick={() => !isAuto && toggle(s.key)}
                disabled={isAuto}
                aria-pressed={d}
                aria-label={d ? t('markOpen') : t('markDone')}
                className={`mt-0.5 flex-none w-6 h-6 rounded-pill border flex items-center justify-center transition-colors duration-150 ${
                  d ? 'bg-success border-success text-bg' : 'border-line-strong hover:border-ink'
                } ${isAuto ? 'cursor-default' : ''}`}
              >
                {d ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <span className="ft-label !text-[10px]">{i + 1}</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`m-0 text-[16px] font-semibold ${d ? 'text-ink-muted line-through decoration-line-strong' : 'text-ink'}`}>
                  {t(`steps.${s.key}.title`)}
                  {isAuto && <span className="ml-2 ft-data text-success no-underline">{t('auto')}</span>}
                </p>
                {!d && (
                  <>
                    <p className="m-0 mt-1 text-[14px] leading-[22px] text-ink-muted">{t(`steps.${s.key}.text`)}</p>
                    <div className="mt-2">
                      {s.external ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                          {t(`steps.${s.key}.cta`)}
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                        </a>
                      ) : (
                        <Link href={s.href} className={linkCls}>
                          {t(`steps.${s.key}.cta`)}
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
