'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import {
  Ticket, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X, Lock,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

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
        // Weiter zur Success-Seite (mit Animation), von dort ins Dashboard
        window.location.href = '/payment/success?promo=redeemed'
        return
      }

      // Rabatt / Gratismonate: über Stripe-Checkout (Code wird serverseitig angewendet)
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan, promoCode: promo.code }),
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
        <div style={{ color: '#6b7280' }}>…</div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes redeemOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.06); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          top: '-150px', right: '-100px',
          background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
          animation: 'redeemOrb 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          bottom: '-120px', left: '-80px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
          animation: 'redeemOrb 18s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#030712', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
        <Header />

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 60px' }}>
          <div style={{ width: '100%', maxWidth: 480 }}>

            {/* Top label */}
            <div style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
              display: 'flex', justifyContent: 'center', marginBottom: 24,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: 100, padding: '6px 16px',
              }}>
                <Ticket size={14} color="#34d399" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399', letterSpacing: '0.05em' }}>
                  {t('topLabel')}
                </span>
              </div>
            </div>

            {/* Heading */}
            <div style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
              textAlign: 'center', marginBottom: 36,
            }}>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(30px, 6vw, 44px)', fontWeight: 900,
                color: '#f1f5f9', lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-1px',
              }}>
                {t('headingLine1')}<br />
                <span style={{
                  background: 'linear-gradient(90deg, #6ee7b7, #c4b5fd, #f9a8d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {t('headingLine2')}
                </span>
              </h1>
              <p style={{ color: '#64748b', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                {t('subtitle')}
              </p>
            </div>

            {/* Card */}
            <div style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
              transition: 'opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.3s',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 24, padding: 'clamp(24px, 5vw, 36px)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}>

              {!promo ? (
                <>
                  {/* ── Schritt 1: Code-Eingabe ── */}
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {t('inputLabel')}
                  </label>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handleValidate() }}
                    placeholder={tPromo('placeholder')}
                    maxLength={32}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '18px 18px',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${error ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.14)'}`,
                      borderRadius: 14,
                      color: '#f1f5f9',
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textAlign: 'center',
                      outline: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      textTransform: 'uppercase',
                      marginBottom: 14,
                    }}
                  />

                  {error && (
                    <div style={{
                      marginBottom: 14, padding: '11px 14px',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 12, color: '#fca5a5', fontSize: 13.5,
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleValidate}
                    disabled={checking || !codeInput.trim()}
                    style={{
                      width: '100%', padding: '16px 24px', borderRadius: 14, border: 'none',
                      cursor: checking || !codeInput.trim() ? 'not-allowed' : 'pointer',
                      opacity: checking || !codeInput.trim() ? 0.55 : 1,
                      background: 'linear-gradient(135deg, #059669, #34d399)',
                      color: 'white', fontSize: 16, fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 10px 30px rgba(52,211,153,0.25)',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {checking ? (
                      <>
                        <div style={{
                          width: 17, height: 17,
                          border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                          borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                        }} />
                        {tPromo('checking')}
                      </>
                    ) : (
                      <>
                        <Ticket size={17} />
                        {t('validateCta')}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* ── Schritt 2: Code gültig → Vorteil + Einlösen ── */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '16px 18px', marginBottom: 20,
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)',
                    borderRadius: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle2 size={19} color="#34d399" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#34d399', fontSize: 16, fontWeight: 800 }}>{benefitText}</div>
                        <div style={{ color: '#64748b', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tPromo('codeLabel', { code: promo.code })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setPromo(null); setCodeInput(''); setError('') }}
                      aria-label={tPromo('remove')}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#64748b', display: 'flex', padding: 4, flexShrink: 0,
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {/* Gratismonate: Wahl zwischen "ohne Abo" und "mit Abo" */}
                  {promo.type === 'free_months' && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: 10 }}>
                        {t('chooseMode')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {([
                          { key: 'direct' as const, title: t('modeDirectTitle'), desc: t('modeDirectDesc', { months: promo.freeMonths ?? 0, date: freeUntilDate }) },
                          { key: 'subscription' as const, title: t('modeSubTitle'), desc: t('modeSubDesc') },
                        ]).map(m => (
                          <button
                            key={m.key}
                            onClick={() => setMode(m.key)}
                            style={{
                              padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                              textAlign: 'left',
                              border: `1px solid ${mode === m.key ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.1)'}`,
                              background: mode === m.key ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                              fontFamily: "'DM Sans', sans-serif",
                              transition: 'all 0.15s ease',
                              display: 'flex', alignItems: 'flex-start', gap: 12,
                            }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                              border: `2px solid ${mode === m.key ? '#a78bfa' : '#475569'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {mode === m.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} />}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: mode === m.key ? '#e2e8f0' : '#94a3b8' }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.5, color: mode === m.key ? '#94a3b8' : '#475569' }}>
                                {m.desc}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plan-Auswahl: bei Rabatt-Codes immer, bei Gratismonaten nur im Abo-Modus */}
                  {(promo.type === 'percent' || (promo.type === 'free_months' && mode === 'subscription')) && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: 10 }}>
                        {promo.type === 'free_months' ? t('choosePlanAfterTrial') : t('choosePlan')}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {(['monthly', 'yearly'] as Plan[]).map(p => (
                          <button
                            key={p}
                            onClick={() => setPlan(p)}
                            style={{
                              padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                              border: `1px solid ${plan === p ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.1)'}`,
                              background: plan === p ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                              color: plan === p ? '#e2e8f0' : '#64748b',
                              fontFamily: "'DM Sans', sans-serif",
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ fontSize: 14, fontWeight: 700 }}>
                              {p === 'monthly' ? t('planMonthly') : t('planYearly')}
                            </div>
                            {promo.type === 'percent' && promo.percentOff ? (
                              // Rabatt sichtbar machen: alter Preis durchgestrichen, neuer Preis grün
                              <div style={{ fontSize: 12, marginTop: 2 }}>
                                <span style={{ textDecoration: 'line-through', color: '#475569' }}>
                                  {formatEuro(PLAN_PRICES[p])}
                                </span>
                                <span style={{ color: '#34d399', fontWeight: 700, marginLeft: 6 }}>
                                  {discounted(p, promo.percentOff)}
                                </span>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, marginTop: 2, color: plan === p ? '#a78bfa' : '#475569' }}>
                                {formatEuro(PLAN_PRICES[p])}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Klartext: was genau passiert */}
                  <div style={{
                    marginBottom: 18, padding: '12px 14px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, color: '#94a3b8', fontSize: 13, lineHeight: 1.6,
                  }}>
                    {promo.type === 'lifetime' && t('noteLifetime')}
                    {promo.type === 'percent' && promo.percentOff && (() => {
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
                        return plan === 'yearly'
                          ? t('notePercentRepeatingYearly', vars)
                          : t('notePercentRepeating', vars)
                      }
                      return t('notePercentOnce', vars)
                    })()}
                    {promo.type === 'free_months' && mode === 'direct' &&
                      t('noteDirect', { months: promo.freeMonths ?? 0, date: freeUntilDate })}
                    {promo.type === 'free_months' && mode === 'subscription' &&
                      t('noteTrial', { months: promo.freeMonths ?? 0, date: freeUntilDate, price: planPrice })}
                  </div>

                  {error && (
                    <div style={{
                      marginBottom: 16, padding: '11px 14px',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 12, color: '#fca5a5', fontSize: 13.5,
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    style={{
                      width: '100%', padding: '17px 24px', borderRadius: 14, border: 'none',
                      cursor: redeeming ? 'not-allowed' : 'pointer',
                      opacity: redeeming ? 0.6 : 1,
                      background: promo.type === 'lifetime'
                        ? 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)'
                        : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      color: 'white', fontSize: 16.5, fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 14px 40px rgba(168,85,247,0.35)',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {(() => {
                      const isDirect = promo.type === 'lifetime' ||
                        (promo.type === 'free_months' && mode === 'direct')
                      if (redeeming) {
                        return (
                          <>
                            <div style={{
                              width: 17, height: 17,
                              border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                            }} />
                            {isDirect ? tPromo('redeeming') : t('redirectingStripe')}
                          </>
                        )
                      }
                      return (
                        <>
                          {isDirect ? <Sparkles size={18} /> : <Lock size={18} />}
                          {promo.type === 'lifetime'
                            ? t('redeemLifetimeCta')
                            : isDirect ? t('redeemDirectCta') : t('redeemCheckoutCta')}
                          <ArrowRight size={18} />
                        </>
                      )
                    })()}
                  </button>
                </>
              )}

              {/* Zurück zur Payment-Seite */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  onClick={() => router.push('/payment')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', fontSize: 13, fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                >
                  <ArrowLeft size={14} />
                  {t('backToPayment')}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}
