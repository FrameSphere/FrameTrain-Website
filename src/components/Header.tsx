'use client'

import { Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback, useId } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { ChangelogModal, useChangelogBadge } from '@/components/ChangelogModal'
import { trackEvent } from '@/lib/events'

/**
 * Die Dynamic Island – Navigation im Design-System „Neuron".
 *
 * Das eine verspielte Detail der Marke: eine schwebende Liquid-Glass-Pille.
 * Für Gäste zeigt der Status-Chip ein laufendes Demo-Training (Loss tickt,
 * Epoche läuft), ein Klick klappt die Details auf. Angemeldete sehen dort
 * die aktuelle App-Version und öffnen mit einem Klick „Was ist neu?".
 *
 * Bleibt bewusst `position: fixed` (nicht sticky): mehrere Seiten haben
 * overflow-hidden auf dem Wrapper, daran scheitert sticky still.
 */

const linkCls =
  'px-3.5 py-[7px] rounded-pill text-[14px] leading-5 font-medium text-ink-muted hover:text-ink hover:bg-ghost-fill transition-colors duration-150 ease-out'
const linkActive = 'text-ink bg-ghost-fill'

/* ── Demo-Training ──────────────────────────────────────────────────── */

const TOTAL_STEPS = 60
const EPOCHS = 5
const SECONDS_PER_STEP = 7

function lossAt(step: number) {
  // Deterministisches "Rauschen", damit Server und Client nicht auseinanderlaufen
  const noise = Math.sin(step * 2.3) * 0.018 + Math.sin(step * 0.7) * 0.012
  return 0.31 + 0.6 * Math.exp(-step / 13) + noise
}

function useDemoRun() {
  const [step, setStep] = useState(24)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let hold = 0
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s >= TOTAL_STEPS) {
          hold += 1
          // Kurz "Fertig" zeigen, dann beginnt der nächste Lauf
          if (hold > 4) {
            hold = 0
            return 0
          }
          return s
        }
        return s + 1
      })
    }, 1100)
    return () => window.clearInterval(id)
  }, [])

  const done = step >= TOTAL_STEPS
  const epoch = Math.min(EPOCHS, Math.floor(step / (TOTAL_STEPS / EPOCHS)) + 1)
  const epochProgress = done ? 1 : (step % (TOTAL_STEPS / EPOCHS)) / (TOTAL_STEPS / EPOCHS)
  const remaining = (TOTAL_STEPS - step) * SECONDS_PER_STEP
  const history = Array.from({ length: Math.max(2, step + 1) }, (_, i) => lossAt(i))

  return { step, done, loss: lossAt(step), epoch, epochProgress, remaining, history }
}

function formatEta(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.max(0, sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function Sparkline({ values }: { values: number[] }) {
  const w = 120
  const h = 28
  const max = 0.95
  const min = 0.25
  const pts = values
    .map((v, i) => {
      const x = (i / (TOTAL_STEPS - 1)) * w
      const y = h - ((v - min) / (max - min)) * h
      return `${x.toFixed(1)},${Math.max(1, Math.min(h - 1, y)).toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="block">
      <line x1="0" y1={h - 0.5} x2={w} y2={h - 0.5} stroke="var(--chart-grid)" />
      <polyline points={pts} fill="none" stroke="var(--chart-1)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Sprache ────────────────────────────────────────────────────────── */

function LangSwitch({ large = false }: { large?: boolean }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <div className={`flex items-center rounded-pill bg-ghost-fill p-0.5 ${large ? 'w-full' : ''}`}>
      {(['de', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-pressed={locale === l}
          className={`rounded-pill font-mono uppercase tracking-[0.1em] transition-colors duration-150 ease-out ${
            large ? 'flex-1 h-11 text-[13px]' : 'h-[30px] px-2.5 text-[11px]'
          } ${locale === l ? 'bg-surface-raised text-ink' : 'text-ink-faint hover:text-ink'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

/* ── Island ─────────────────────────────────────────────────────────── */

export function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const t = useTranslations('Island')
  const pathname = usePathname()
  const [detailOpen, setDetailOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const { count: badgeCount, refresh: refreshBadge } = useChangelogBadge()
  const run = useDemoRun()
  const detailId = useId()
  const menuId = useId()

  useEffect(() => {
    setMenuOpen(false)
    setDetailOpen(false)
  }, [pathname])

  // Version für angemeldete Nutzer (gleiche Quelle wie die App-Update-Prüfung)
  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/app-version')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.version && setAppVersion(String(d.version).replace(/^v/i, '')))
      .catch(() => {})
  }, [isAuthenticated])

  // Die mobile Sticky-Pille (landing/Ctas.tsx) blendet sich darüber aus
  useEffect(() => {
    document.documentElement.toggleAttribute('data-ft-menu-open', menuOpen)
    return () => document.documentElement.removeAttribute('data-ft-menu-open')
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen && !detailOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setDetailOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, detailOpen])

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const onTrialClick = useCallback(() => trackEvent('trial_click', { from: 'island' }), [])

  const guestLinks = [
    { href: '/#loop', label: t('links.loop') },
    { href: '/#pricing', label: t('links.pricing') },
    { href: '/docs/ai-training-guide', label: t('links.coach') },
    { href: '/download', label: t('links.download') },
  ]
  const userLinks = [
    { href: '/dashboard', label: t('links.dashboard') },
    { href: '/library', label: t('links.library') },
    { href: '/docs', label: t('links.docs') },
    { href: '/guides', label: t('links.guides') },
  ]
  const links = isAuthenticated ? userLinks : guestLinks
  const isActive = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`))

  const moreLinks = [
    { href: '/screenshots', label: t('more.screenshots') },
    { href: '/library', label: t('more.library') },
    { href: '/guides', label: t('more.guides') },
    { href: '/docs', label: t('more.docs') },
    { href: '/faq', label: t('more.faq') },
    { href: '/about', label: t('more.about') },
  ].filter((l) => !links.some((x) => x.href === l.href))

  /* Status-Chip: Gäste → Demo-Training, Nutzer → App-Version + Neuigkeiten */
  const chip = isAuthenticated ? (
    <button
      type="button"
      onClick={() => {
        setMenuOpen(false)
        setChangelogOpen(true)
      }}
      className="ft-status bg-ghost-fill hover:bg-surface-raised transition-colors duration-150"
      title={t('status.whatsNew')}
    >
      <span className={`ft-dot ${badgeCount > 0 ? '' : '!bg-success'}`} aria-hidden="true" />
      <span>{appVersion ? t('status.version', { version: appVersion }) : 'FrameTrain'}</span>
      {badgeCount > 0 && (
        <span className="text-output-text">· {badgeCount > 9 ? '9+' : badgeCount}</span>
      )}
      <span className="sr-only">{t('status.whatsNew')}</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setDetailOpen((o) => !o)}
      aria-expanded={detailOpen}
      aria-controls={detailId}
      aria-label={detailOpen ? t('status.ariaClose') : t('status.aria')}
      className="ft-status hover:brightness-125 transition-[filter] duration-150"
    >
      <span className={`ft-dot ${run.done ? '!bg-success' : 'ft-dot--live'}`} aria-hidden="true" />
      <span className="hidden sm:inline text-ink-muted">run-014 ·</span>
      <span>{run.loss.toFixed(3)}</span>
    </button>
  )

  return (
    <>
      {/* Platzhalter für die fixierte Island */}
      <div className="h-[84px]" aria-hidden="true" />

      <div className="fixed top-4 inset-x-0 z-50 flex flex-col items-center px-3 pointer-events-none">
        <nav
          aria-label="FrameTrain"
          className="ft-glass pointer-events-auto rounded-island max-w-full overflow-hidden"
        >
          <div className="flex items-center gap-1.5 py-1.5 pl-2 pr-1.5">
            <Link
              href="/"
              aria-label={t('home')}
              className="flex items-center gap-2.5 pr-2 rounded-pill text-ink"
              onClick={closeMenu}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo, next/image bringt hier nichts */}
              <img src="/brand/frametrain-icon-indigo.svg" alt="" width={30} height={30} className="w-[30px] h-[30px] block" />
              <span className="font-semibold text-[15px] leading-5 tracking-[-0.01em]">FrameTrain</span>
            </Link>

            {/* Links ab lg */}
            <div className="hidden lg:flex items-center gap-0.5">
              {!loading &&
                links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? 'page' : undefined}
                    className={`${linkCls} ${isActive(l.href) ? linkActive : ''}`}
                  >
                    {l.label}
                  </Link>
                ))}
            </div>

            <span className="hidden lg:block w-px h-5 bg-glass-edge mx-1" aria-hidden="true" />

            {!loading && chip}

            <div className="hidden lg:flex items-center gap-1 ml-1">
              <LangSwitch />
              {!loading &&
                (isAuthenticated ? (
                  <button type="button" onClick={logout} className={linkCls}>
                    {t('logout')}
                  </button>
                ) : (
                  <Link href="/login" className={linkCls}>
                    {t('login')}
                  </Link>
                ))}
            </div>

            {!loading && !isAuthenticated && (
              <Link
                href="/register"
                onClick={onTrialClick}
                className="hidden md:inline-flex ft-btn ft-btn--primary ft-btn--sm ml-1"
              >
                {t('trial')}
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setDetailOpen(false)
                setMenuOpen((o) => !o)
              }}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t('closeMenu') : t('menu')}
              className="lg:hidden flex items-center justify-center w-11 h-[34px] rounded-pill bg-ghost-fill text-ink hover:bg-surface-raised transition-colors duration-150"
            >
              {menuOpen ? <X className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />}
            </button>
          </div>

          {/* Aufgeklappte Island: Details zum Demo-Training */}
          {!isAuthenticated && (
            <div
              id={detailId}
              className={`grid transition-[grid-template-rows] duration-[240ms] ease-out motion-reduce:transition-none ${
                detailOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
              aria-hidden={!detailOpen}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 pt-3.5 pb-4 border-t border-glass-edge ft-data text-ink-muted">
                  <span className="ft-label !text-[10px]">{t('status.demo')}</span>
                  <span>
                    {t('status.model')} <strong className="font-normal text-ink">mein-klassifizierer</strong>
                  </span>
                  <span className="flex items-center gap-2.5">
                    {run.done ? (
                      <strong className="font-normal text-success">{t('status.done')}</strong>
                    ) : (
                      <>
                        {t('status.epoch')} <strong className="font-normal text-ink">{run.epoch}/{EPOCHS}</strong>
                        <span className="ft-progress w-[96px]">
                          <span style={{ width: `${Math.round(run.epochProgress * 100)}%` }} />
                        </span>
                      </>
                    )}
                  </span>
                  <span>
                    {t('status.eta')} <strong className="font-normal text-ink tabular-nums">{formatEta(run.remaining)}</strong>
                  </span>
                  <span className="flex items-center gap-2.5">
                    {t('status.loss')} <strong className="font-normal text-output-text tabular-nums">{run.loss.toFixed(3)}</strong>
                    <Sparkline values={run.history} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Mobiles Menü: zweite Glasfläche unter der Island */}
        {menuOpen && (
          <div
            id={menuId}
            className="ft-glass pointer-events-auto lg:hidden mt-2 w-full max-w-[420px] rounded-island p-2 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain animate-enter"
          >
            <nav className="flex flex-col">
              {[...links, ...moreLinks].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`flex items-center min-h-[48px] px-4 rounded-[18px] text-[16px] text-ink-muted hover:text-ink hover:bg-ghost-fill transition-colors duration-150 ${
                    isActive(l.href) ? linkActive : ''
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 pt-3 px-2 pb-1 border-t border-glass-edge flex flex-col gap-3">
              <div>
                <div className="ft-label mb-2 px-1">{t('language')}</div>
                <LangSwitch large />
              </div>
              {isAuthenticated ? (
                <>
                  {user?.email && <div className="px-1 ft-data text-ink-faint break-all">{user.email}</div>}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="ft-btn ft-btn--ghost w-full"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/register" onClick={() => { onTrialClick(); closeMenu() }} className="ft-btn ft-btn--primary w-full">
                    {t('trial')}
                  </Link>
                  <Link href="/login" onClick={closeMenu} className="ft-btn ft-btn--ghost w-full">
                    {t('login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} onRead={refreshBadge} />
    </>
  )
}
