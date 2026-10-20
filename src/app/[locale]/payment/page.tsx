'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
// Locale-bewusster Router: sonst würde /en/payment auf /de/... weiterleiten.
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import {
  CreditCard, Shield, Zap, Brain, BarChart3, Layers,
  Lock, ArrowRight, CheckCircle2, Check, Ticket
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trackSignUp } from '@/lib/analytics'

// ─── Feature items ─────────────────────────────────────────────────────────────
const FEATURE_META = [
  { key: 'modelManager' as const, icon: Brain },
  { key: 'trainingPanel' as const, icon: Zap },
  { key: 'liveMonitoring' as const, icon: BarChart3 },
  { key: 'loraFineTuning' as const, icon: Layers },
]

// ─── Plan Selector + Price Display ───────────────────────────────────────────
type Plan = 'monthly' | 'yearly'

function PriceDisplay({ plan, onPlanChange }: { plan: Plan; onPlanChange: (p: Plan) => void }) {
  const t = useTranslations('Payment.page')
  const isYearly = plan === 'yearly'
  const price = isYearly ? '39,99' : '4,99'
  const sub = isYearly ? t('priceDisplay.perYear') : t('priceDisplay.perMonth')

  return (
    <div className="flex flex-col items-center text-center">
      <div role="radiogroup" className="inline-flex p-1 rounded-pill bg-bg border border-line">
        {(['monthly', 'yearly'] as Plan[]).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={plan === p}
            onClick={() => onPlanChange(p)}
            className={`h-10 px-5 rounded-pill text-[14px] font-medium transition-colors duration-150 ease-out ${
              plan === p ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {p === 'monthly' ? t('planToggle.monthly') : t('planToggle.yearly')}
            {p === 'yearly' && <span className="ml-2 ft-data text-success">{t('planToggle.savePercent')}</span>}
          </button>
        ))}
      </div>
      <div className="mt-7 flex items-start gap-1" aria-live="polite">
        <span className="mt-2 text-[22px] font-semibold text-ink-muted">€</span>
        <span key={plan} className="ft-stat !text-[72px] animate-enter">{price}</span>
      </div>
      <p className="m-0 mt-2 text-[15px] text-ink-muted">
        {sub} · {t('priceDisplay.earlyAccessSuffix')}
      </p>
      <p className={`m-0 mt-1.5 ft-data ${isYearly ? 'text-success' : 'text-ink-faint'}`}>
        {isYearly ? t('priceDisplay.saveYearly') : t('priceDisplay.cancelMonthly')}
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function PaymentPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const t = useTranslations('Payment.page')
  const tFeatures = useTranslations('Payment.page.features')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<Plan>(() => {
    // Wird während SSR immer 'monthly' sein; useSearchParams läuft nur client-side
    return 'monthly'
  })

  const PERKS = t.raw('perks') as string[]

  // Plan aus URL-Param setzen (z. B. /payment?plan=yearly)
  useEffect(() => {
    const param = searchParams.get('plan')
    if (param === 'yearly') setPlan('yearly')
  }, [searchParams])

  // OAuth-Neuregistrierungen landen hier mit ?signup=google|github (gesetzt im
  // OAuth-Callback, nur bei tatsächlich neu angelegtem User). Das sign_up-Event
  // feuert daher hier statt auf der Registrierungsseite — dedupliziert über
  // sessionStorage, damit ein Reload nicht doppelt zählt.
  useEffect(() => {
    const signupMethod = searchParams.get('signup')
    if (!signupMethod) return
    // Nur für tatsächlich eingeloggte Nutzer: sonst könnte sich jeder
    // /payment?signup=google aufrufen und die sign_up-Zahlen aufblähen.
    if (authLoading || !isAuthenticated) return
    const key = `ft_signup_tracked_${signupMethod}`
    try {
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')
    } catch {
      /* kein Storage → einmal feuern ist besser als gar nicht */
    }
    trackSignUp(signupMethod)
  }, [searchParams, authLoading, isAuthenticated])

  // Die Kauf-Seite ist erst nach bestätigter E-Mail erreichbar – wer noch
  // nicht bestätigt hat, landet auf der Warteseite.
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user && user.emailVerified === false) router.push('/verify-email/pending')
  }, [authLoading, isAuthenticated, user, router])

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Serverseitiger Riegel: E-Mail noch nicht bestätigt → zurück auf die Warteseite
        if (data.code === 'email_not_verified') {
          router.push('/verify-email/pending')
          return
        }
        throw new Error(data.error || t('errorFallback'))
      }
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="ft-data text-ink-faint">{t('loadingText')}</p>
      </div>
    )
  }
  if (!isAuthenticated) return null
  // Kein Aufblitzen der Kauf-Seite, während die Weiterleitung auf die
  // Warteseite läuft
  if (user?.emailVerified === false) return null

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 ft-container py-12 md:py-20">
        <div className="max-w-[560px] mx-auto">
          <div className="text-center">
            <p className="ft-label m-0">{t('topLabel')}</p>
            <h1 className="ft-display-l mt-4 mb-0">
              {t('headingLine1')} <span className="text-ink-muted">{t('headingLine2')}</span>
            </h1>
            <p className="ft-lead mt-4 mb-0">
              {t('subtitleWelcome', { name: user?.email?.split('@')[0] || t('subtitleDefaultName') })}{' '}
              {t('subtitlePrice')}
            </p>
          </div>

          <div className="mt-10 rounded-xl border border-line bg-surface p-6 sm:p-10">
            <PriceDisplay plan={plan} onPlanChange={setPlan} />

            <ul className="mt-8 pt-8 border-t border-line p-0 list-none flex flex-col gap-3">
              {PERKS.map((perk, i) => (
                <li key={i} className="flex items-start gap-3 text-[16px] leading-6 text-ink">
                  <Check className="w-[18px] h-[18px] mt-[3px] flex-none text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-2">
              {FEATURE_META.map((f) => {
                const Icon = f.icon
                return (
                  <span key={f.key} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-pill bg-ghost-fill text-[14px] text-ink-muted">
                    <Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    {tFeatures(f.key)}
                  </span>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => router.push('/redeem')}
              className="mt-7 inline-flex items-center gap-2 text-[15px] font-medium ft-link"
            >
              <Ticket className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              {t('promo.toggle')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </button>

            {error && (
              <div role="alert" className="mt-6 px-4 py-3 rounded-sm border border-danger text-danger text-[14px]">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="ft-btn ft-btn--primary w-full mt-7"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-pill border-2 border-[rgba(255,255,255,0.3)] border-t-on-indigo animate-spin" aria-hidden="true" />
                  {t('redirecting')}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                  {plan === 'yearly' ? t('ctaYearly') : t('ctaMonthly')}
                </>
              )}
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 ft-data text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('trust.stripeSecured')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('trust.allCards')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('trust.instantAccess')}
              </span>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-[14px] text-ink-faint hover:text-ink transition-colors duration-150"
              >
                {t('skipLink')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// useSearchParams benötigt Suspense-Boundary in Next.js
export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentPageInner />
    </Suspense>
  )
}
