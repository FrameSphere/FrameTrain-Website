'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Check, ArrowRight, Brain, Zap, BarChart3, Layers } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Phase = 'idle' | 'logos' | 'connecting' | 'connected' | 'features' | 'cta'

const FEATURE_META = [
  { key: 'localTraining' as const, icon: Brain },
  { key: 'loraFineTuning' as const, icon: Zap },
  { key: 'liveMonitoring' as const, icon: BarChart3 },
  { key: 'frameSphereConnected' as const, icon: Layers },
]

/** Blendet einen Block ein, sobald seine Phase erreicht ist (240ms, ohne Bewegung bei reduced motion). */
function reveal(show: boolean) {
  return `transition-[opacity,transform] duration-[240ms] ease-out motion-reduce:transition-none ${
    show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
  }`
}

/**
 * Begrüßung nach dem FrameSphere-SSO: zwei Marken verbinden sich – eine
 * Linie zieht sich vom FrameTrain-Icon zur FrameSphere-Kachel, am Ende
 * erscheint ein Haken. Danach Nutzen und die eine nächste Aktion.
 */
export default function SSOWelcomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations('SsoWelcome')
  const tFeatures = useTranslations('SsoWelcome.features')
  const [phase, setPhase] = useState<Phase>('idle')
  const [hasPaid, setHasPaid] = useState<boolean | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setHasPaid(data.user?.hasPaid ?? false))
      .catch(() => setHasPaid(false))
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (hasPaid === null) return
    const timers = [
      setTimeout(() => setPhase('logos'), 100),
      setTimeout(() => setPhase('connecting'), 700),
      setTimeout(() => setPhase('connected'), 1400),
      setTimeout(() => setPhase('features'), 1900),
      setTimeout(() => setPhase('cta'), 2400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [hasPaid])

  const at = (p: Phase) => {
    const order: Phase[] = ['idle', 'logos', 'connecting', 'connected', 'features', 'cta']
    return order.indexOf(phase) >= order.indexOf(p)
  }

  if (authLoading || hasPaid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="w-8 h-8 rounded-pill border-2 border-line border-t-ink animate-spin" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />
      <main className="flex-1 ft-container py-12 md:py-20">
        <div className="max-w-[600px] mx-auto flex flex-col items-center text-center">
          {/* Verbindung */}
          <div className={`flex items-center gap-5 ${reveal(at('logos'))}`}>
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo */}
              <img src="/brand/frametrain-icon-indigo.svg" alt="" width={64} height={64} className="w-16 h-16" />
              <span className="text-[14px] font-semibold">FrameTrain</span>
              <span className="ft-data text-ink-faint">{t('frameTrainSubtitle')}</span>
            </div>

            <div className="relative w-28 h-px bg-line -mt-14" aria-hidden="true">
              <span
                className={`absolute inset-y-0 left-0 bg-indigo-text transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                  at('connecting') ? 'w-full' : 'w-0'
                }`}
              />
              <span
                className={`absolute left-1/2 -translate-x-1/2 -top-[13px] w-[26px] h-[26px] rounded-pill flex items-center justify-center transition-colors duration-150 ${
                  at('connected') ? 'bg-success text-bg' : 'bg-bg border border-line'
                }`}
              >
                {at('connected') && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="w-16 h-16 rounded-lg bg-surface-raised border border-line flex items-center justify-center font-semibold text-[22px] tracking-[-0.03em]">
                FS
              </span>
              <span className="text-[14px] font-semibold">FrameSphere</span>
              <span className="ft-data text-ink-faint">{t('frameSphereSubtitle')}</span>
            </div>
          </div>

          <p className={`mt-8 mb-0 ft-label !text-success flex items-center gap-2 ${reveal(at('connected'))}`}>
            <span className="ft-dot !bg-success" aria-hidden="true" />
            {t('connectedBadge')}
          </p>

          <div className={reveal(at('features'))}>
            <h1 className="ft-display-l mt-6 mb-0">
              {t('headingLine1')} <span className="text-ink-muted">{t('headingLine2')}</span>
            </h1>
            <p className="ft-lead mt-4 mb-0 max-w-[460px] mx-auto">{t('subtitle')}</p>
          </div>

          <div className={`mt-10 w-full grid gap-px bg-line border border-line rounded-lg overflow-hidden sm:grid-cols-2 text-left ${reveal(at('features'))}`}>
            {FEATURE_META.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.key} className="bg-bg p-6 flex gap-3.5">
                  <Icon className="w-5 h-5 mt-0.5 flex-none text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="m-0 text-[15px] font-semibold text-ink">{tFeatures(`${f.key}.title`)}</p>
                    <p className="m-0 mt-1 text-[14px] leading-[22px] text-ink-muted">{tFeatures(`${f.key}.desc`)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`mt-10 flex flex-col items-center gap-3 ${reveal(at('cta'))}`}>
            <button
              type="button"
              onClick={() => router.push(hasPaid ? '/dashboard' : '/payment')}
              className="ft-btn ft-btn--primary"
            >
              {hasPaid ? t('ctaDashboard') : t('ctaUnlock')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
            {!hasPaid && <p className="m-0 ft-data text-ink-faint">{t('ctaHint')}</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
