'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import {
  Ticket, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X, Lock,
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { trackStartTrial, readConsent } from '@/lib/analytics'
import { WithdrawalWaiver } from '@/components/WithdrawalWaiver'
import { trackEvent } from '@/lib/events'
import { normalizePromoCode, readStoredPromoCode, clearStoredPromoCode } from '@/components/PromoCapture'

type Plan = 'monthly' | 'yearly'

interface ValidatedPromo {
  code: string
  type: 'percent' | 'free_months' | 'lifetime'
  percentOff?: number
  percentDuration?: 'once' | 'forever' | 'repeating'
  percentDurationMonths?: number
  freeMonths?: number
}

// Preise (müssen zu den Stripe-Preisen passen)
const PLAN_PRICES: Record<Plan, number> = { monthly: 4.99, yearly: 39.99 }

function formatEuro(value: number): string {
  return value.toFixed(2).replace('.', ',') + ' €'
}

function discounted(planKey: Plan, percentOff: number): string {
  return formatEuro(PLAN_PRICES[planKey] * (1 - percentOff / 100))
}

export default function RedeemPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const t = useTranslations('Payment.redeem')
  const tPromo = useTranslations('Payment.page.promo')

  const [mounted, setMounted] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [promo, setPromo] = useState<ValidatedPromo | null>(null)
  const [plan, setPlan] = useState<Plan>('monthly')
  // Nur für free_months: 'direct' = ohne Abo/Karte (endet automatisch),
  // 'subscription' = mit Abo (nahtloser Übergang nach der Gratiszeit)
  const [mode, setMode] = useState<'direct' | 'subscription'>('direct')
  const [checking, setChecking] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState('')

  // Ende der Gratiszeit (für Anzeigetexte)
  const freeUntilDate = (() => {
    if (!promo || promo.type !== 'free_months' || !promo.freeMonths) return ''
    const d = new Date()
    d.setMonth(d.getMonth() + promo.freeMonths)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
  })()

  const planPrice = plan === 'monthly' ? '4,99 €/Monat' : '39,99 €/Jahr'

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(timer)
  }, [])

  // Kanal-Code vorausfüllen: ?code=… oder vorher irgendwo auf der Seite gemerkt
  useEffect(() => {
    const code = normalizePromoCode(new URLSearchParams(window.location.search).get('code')) || readStoredPromoCode()
    if (code) setCodeInput((current) => current || code)
  }, [])

  // ── Schritt 1: Code prüfen ──
  const handleValidate = async () => {
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    setChecking(true)
    setError('')
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })
      if (res.status === 429) {
        setError(tPromo('rateLimited'))
        return
      }
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setError(data.reason === 'already_redeemed' ? tPromo('alreadyRedeemed') : tPromo('invalid'))
        return
      }
      setPromo(data.promo as ValidatedPromo)
    } catch {
      setError(tPromo('invalid'))
    } finally {
      setChecking(false)
    }
  }

  const [waiver, setWaiver] = useState(false)
  const locale = useLocale()

  // ── Schritt 2: Einlösen ──
  const handleRedeem = async () => {
    if (!promo) return
    setRedeeming(true)
    setError('')
    try {
      const directRedeem = promo.type === 'lifetime' ||
        (promo.type === 'free_months' && mode === 'direct')

      if (directRedeem) {
        // Direkt einlösen, kein Stripe — Lifetime für immer,
        // Gratismonate mit automatischem Ablauf (Server setzt promo_access_until)
        const res = await fetch('/api/promo/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code: promo.code }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          setPromo(null)
          throw new Error(data.reason === 'already_redeemed' ? tPromo('alreadyRedeemed') : tPromo('invalid'))
        }
        // Funnel-Signal: Zugang ist freigeschaltet, aber es floss kein Geld.
        // Bewusst kein purchase mit Wert 0 — siehe src/lib/analytics.ts.
        // Muss vor dem Redirect feuern; dedupliziert über den Code.
        trackStartTrial({
          promoType: promo.type,
          freeMonths: promo.freeMonths,
          dedupeId: promo.code,
        })
        trackEvent('code_redeemed', { code: promo.code, type: promo.type })
        clearStoredPromoCode()
        // Weiter zur Success-Seite (mit Animation), von dort ins Dashboard
        window.location.href = '/payment/success?promo=redeemed'
        return
      }

      // Rabatt / Gratismonate: über Stripe-Checkout (Code wird serverseitig angewendet)
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan, promoCode: promo.code, locale, withdrawalWaiver: waiver, adConsent: readConsent() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'promo_invalid') {
          setPromo(null)
          throw new Error(tPromo('invalid'))
        }
        throw new Error(data.error || tPromo('invalid'))
      }
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setRedeeming(false)
    }
  }

  const benefitText = promo
    ? promo.type === 'percent'
      ? tPromo('appliedPercent', { percent: promo.percentOff ?? 0 })
      : promo.type === 'free_months'
        ? tPromo('appliedFreeMonths', { months: promo.freeMonths ?? 0 })
        : tPromo('appliedLifetime')
    : ''

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="w-8 h-8 rounded-pill border-2 border-line border-t-ink animate-spin" aria-hidden="true" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  // Über Stripe (Rabatt oder Gratismonate mit Abo) → Widerrufsverzicht nötig
  const needsCheckout = !!promo && promo.type !== 'lifetime' && !(promo.type === 'free_months' && mode === 'direct')
  const subLabel = 'ft-label block mb-3'
  const choiceCls = (active: boolean) =>
    `w-full text-left rounded-md border px-4 py-3.5 transition-colors duration-150 ease-out ${
      active ? 'border-line-strong bg-surface-raised' : 'border-line bg-bg hover:border-line-strong'
    }`
  const spinner = (
    <span className="w-4 h-4 rounded-pill border-2 border-[rgba(255,255,255,0.3)] border-t-on-indigo animate-spin" aria-hidden="true" />
  )

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 ft-container py-12 md:py-20">
        <div className="max-w-[480px] mx-auto">
          <div className="text-center">
            <p className="ft-label m-0 flex items-center justify-center gap-2">
              <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              {t('topLabel')}
            </p>
            <h1 className="ft-display-l mt-4 mb-0">
              {t('headingLine1')} <span className="text-ink-muted">{t('headingLine2')}</span>
            </h1>
            <p className="ft-lead mt-4 mb-0">{t('subtitle')}</p>
          </div>

          <div className="mt-10 rounded-xl border border-line bg-surface p-6 sm:p-8">
            {!promo ? (
              <>
                {/* ── Schritt 1: Code-Eingabe ── */}
                <label htmlFor="redeem-code" className={subLabel}>
                  {t('inputLabel')}
                </label>
                <input
                  id="redeem-code"
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase())
                    setError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleValidate()
                  }}
                  placeholder={tPromo('placeholder')}
                  maxLength={32}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  className={`ft-input !h-14 text-center font-mono !text-[20px] tracking-[0.12em] uppercase ${error ? '!border-danger' : ''}`}
                />

                {error && (
                  <div role="alert" className="mt-3 px-4 py-3 rounded-sm border border-danger text-danger text-[14px]">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={checking || !codeInput.trim()}
                  className="ft-btn ft-btn--primary w-full mt-4"
                >
                  {checking ? (
                    <>
                      {spinner}
                      {tPromo('checking')}
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      {t('validateCta')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* ── Schritt 2: Code gültig → Vorteil + Einlösen ── */}
                <div className="flex items-center justify-between gap-3 px-4 py-4 rounded-md border border-success">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 flex-none text-success" strokeWidth={1.5} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="m-0 text-[16px] font-semibold text-success">{benefitText}</p>
                      <p className="m-0 ft-data text-ink-faint truncate">{tPromo('codeLabel', { code: promo.code })}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPromo(null)
                      setCodeInput('')
                      setError('')
                    }}
                    aria-label={tPromo('remove')}
                    className="flex-none w-9 h-9 rounded-pill flex items-center justify-center text-ink-faint hover:text-ink hover:bg-ghost-fill transition-colors duration-150"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Gratismonate: Wahl zwischen "ohne Abo" und "mit Abo" */}
                {promo.type === 'free_months' && (
                  <div className="mt-6">
                    <span className={subLabel}>{t('chooseMode')}</span>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { key: 'direct' as const, title: t('modeDirectTitle'), desc: t('modeDirectDesc', { months: promo.freeMonths ?? 0, date: freeUntilDate }) },
                        { key: 'subscription' as const, title: t('modeSubTitle'), desc: t('modeSubDesc') },
                      ].map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          role="radio"
                          aria-checked={mode === m.key}
                          onClick={() => setMode(m.key)}
                          className={`${choiceCls(mode === m.key)} flex items-start gap-3`}
                        >
                          <span
                            className={`mt-0.5 w-[18px] h-[18px] rounded-pill border-2 flex-none flex items-center justify-center ${
                              mode === m.key ? 'border-ink' : 'border-line-strong'
                            }`}
                            aria-hidden="true"
                          >
                            {mode === m.key && <span className="w-2 h-2 rounded-pill bg-ink" />}
                          </span>
                          <span>
                            <span className={`block text-[15px] font-semibold ${mode === m.key ? 'text-ink' : 'text-ink-muted'}`}>{m.title}</span>
                            <span className="block mt-1 text-[13px] leading-5 text-ink-muted">{m.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan-Auswahl: bei Rabatt-Codes immer, bei Gratismonaten nur im Abo-Modus */}
                {(promo.type === 'percent' || (promo.type === 'free_months' && mode === 'subscription')) && (
                  <div className="mt-6">
                    <span className={subLabel}>{promo.type === 'free_months' ? t('choosePlanAfterTrial') : t('choosePlan')}</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(['monthly', 'yearly'] as Plan[]).map((p) => (
                        <button key={p} type="button" role="radio" aria-checked={plan === p} onClick={() => setPlan(p)} className={choiceCls(plan === p)}>
                          <span className={`block text-[15px] font-semibold ${plan === p ? 'text-ink' : 'text-ink-muted'}`}>
                            {p === 'monthly' ? t('planMonthly') : t('planYearly')}
                          </span>
                          {promo.type === 'percent' && promo.percentOff ? (
                            // Rabatt sichtbar machen: alter Preis durchgestrichen, neuer Preis daneben
                            <span className="block mt-1 ft-data">
                              <span className="line-through text-ink-faint">{formatEuro(PLAN_PRICES[p])}</span>
                              <span className="ml-1.5 text-success">{discounted(p, promo.percentOff)}</span>
                            </span>
                          ) : (
                            <span className="block mt-1 ft-data text-ink-faint">{formatEuro(PLAN_PRICES[p])}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Klartext: was genau passiert */}
                <p className="mt-6 mb-0 px-4 py-3 rounded-md bg-bg border border-line text-[14px] leading-[22px] text-ink-muted">
                  {promo.type === 'lifetime' && t('noteLifetime')}
                  {promo.type === 'percent' &&
                    promo.percentOff &&
                    (() => {
                      const vars = {
                        percent: promo.percentOff,
                        price: discounted(plan, promo.percentOff),
                        regular: formatEuro(PLAN_PRICES[plan]),
                        interval: plan === 'monthly' ? t('intervalMonthly') : t('intervalYearly'),
                        months: promo.percentDurationMonths ?? 0,
                      }
                      if (promo.percentDuration === 'forever') return t('notePercentForever', vars)
                      if (promo.percentDuration === 'repeating') {
                        // "X Monate"-Rabatt trifft beim Jahresabo nur die erste
                        // Jahresrechnung → ehrlich formulieren statt "für X Monate".
                        return plan === 'yearly' ? t('notePercentRepeatingYearly', vars) : t('notePercentRepeating', vars)
                      }
                      return t('notePercentOnce', vars)
                    })()}
                  {promo.type === 'free_months' && mode === 'direct' && t('noteDirect', { months: promo.freeMonths ?? 0, date: freeUntilDate })}
                  {promo.type === 'free_months' &&
                    mode === 'subscription' &&
                    t('noteTrial', { months: promo.freeMonths ?? 0, date: freeUntilDate, price: planPrice })}
                </p>

                {needsCheckout && <WithdrawalWaiver checked={waiver} onChange={setWaiver} />}

                {error && (
                  <div role="alert" className="mt-4 px-4 py-3 rounded-sm border border-danger text-danger text-[14px]">
                    {error}
                  </div>
                )}

                <button type="button" onClick={handleRedeem} disabled={redeeming || (needsCheckout && !waiver)} className="ft-btn ft-btn--primary w-full mt-6">
                  {(() => {
                    const isDirect = promo.type === 'lifetime' || (promo.type === 'free_months' && mode === 'direct')
                    if (redeeming) {
                      return (
                        <>
                          {spinner}
                          {isDirect ? tPromo('redeeming') : t('redirectingStripe')}
                        </>
                      )
                    }
                    return (
                      <>
                        {isDirect ? (
                          <Sparkles className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                        ) : (
                          <Lock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                        )}
                        {promo.type === 'lifetime' ? t('redeemLifetimeCta') : isDirect ? t('redeemDirectCta') : t('redeemCheckoutCta')}
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      </>
                    )
                  })()}
                </button>
              </>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push('/payment')}
                className="inline-flex items-center gap-1.5 text-[14px] text-ink-faint hover:text-ink transition-colors duration-150"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('backToPayment')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
