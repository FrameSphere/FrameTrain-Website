'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import {
  Download, Key, Zap, Brain, BarChart3, Layers, ChevronRight,
  BookOpen, Play, ArrowRight, Check
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trackPurchase, trackStartTrial } from '@/lib/analytics'

// ─── Feature Showcase Data ─────────────────────────────────────────────────────
const FEATURE_META = [
  { key: 'modelManager' as const, icon: <Brain className="w-7 h-7 text-indigo-text" />, color: ' ', border: 'border-line' },
  { key: 'trainingPanel' as const, icon: <Zap className="w-7 h-7 text-indigo-text" />, color: ' ', border: 'border-line' },
  { key: 'liveMonitoring' as const, icon: <BarChart3 className="w-7 h-7 text-indigo-text" />, color: ' ', border: 'border-line' },
  { key: 'loraFineTuning' as const, icon: <Layers className="w-7 h-7 text-success" />, color: ' ', border: 'border-line' },
]

// ─── Animated Check Circle ─────────────────────────────────────────────────────
function AnimatedCheck({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'fill' | 'check' | 'done'>('fill')
  const [fillProgress, setFillProgress] = useState(0)
  const [checkProgress, setCheckProgress] = useState(0)

  useEffect(() => {
    // Phase 1: fill circle from 0 → 100% (800ms)
    const startFill = Date.now()
    const fillDuration = 900
    const fillRaf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - startFill
      const p = Math.min(elapsed / fillDuration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setFillProgress(eased)
      if (p < 1) {
        requestAnimationFrame(tick)
      } else {
        setPhase('check')
        // Phase 2: draw checkmark (600ms)
        const startCheck = Date.now()
        const checkDuration = 600
        const checkRaf = requestAnimationFrame(function tick2() {
          const e2 = Date.now() - startCheck
          const p2 = Math.min(e2 / checkDuration, 1)
          const eased2 = 1 - Math.pow(1 - p2, 2)
          setCheckProgress(eased2)
          if (p2 < 1) {
            requestAnimationFrame(tick2)
          } else {
            setPhase('done')
            setTimeout(onDone, 500)
          }
        })
      }
    })
    return () => {}
  }, [onDone])

  // Circle: radius 54, circumference ≈ 339
  const r = 54
  const circ = 2 * Math.PI * r
  // Neuron: der Ring läuft in Orange (ein Ergebnis entsteht) und wird
  // grün, sobald die Zahlung bestätigt ist.
  const arcColor = fillProgress >= 1 ? 'var(--success)' : 'var(--output)'

  // Check path: two segments
  // First segment: (28,64) → (44,80)  length ~22.6
  // Second segment: (44,80) → (76,48) length ~44.7
  // Total ~67.3. Split at ~0.336
  const totalCheckLen = 67.3
  const seg1Len = 22.6
  const seg2Len = 44.7
  const drawn = checkProgress * totalCheckLen
  const seg1Drawn = Math.min(drawn, seg1Len)
  const seg2Drawn = Math.max(0, drawn - seg1Len)
  const t1 = seg1Drawn / seg1Len
  const p1x = 28 + t1 * 16
  const p1y = 64 + t1 * 16
  const t2 = seg2Drawn / seg2Len
  const p2x = 44 + t2 * 32
  const p2y = 80 - t2 * 32

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        {/* Background track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        {/* Animated fill arc */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fillProgress * circ} ${circ}`}
          strokeDashoffset="0"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke 150ms ease-out' }}
        />
        {/* Checkmark drawn progressively */}
        {checkProgress > 0 && (
          <>
            {/* First leg */}
            {t1 > 0 && (
              <line
                x1="28" y1="64" x2={p1x} y2={p1y}
                stroke="white" strokeWidth="5.5" strokeLinecap="round"
              />
            )}
            {/* Second leg */}
            {seg2Drawn > 0 && (
              <line
                x1="44" y1="80" x2={p2x} y2={p2y}
                stroke="white" strokeWidth="5.5" strokeLinecap="round"
              />
            )}
          </>
        )}
      </svg>
    </div>
  )
}

// ─── Feature Showcase ──────────────────────────────────────────────────────────
function FeatureShowcase({ onSkip, onTutorial }: { onSkip: () => void; onTutorial: () => void }) {
  const t = useTranslations('Payment.success.showcase')
  const [visible, setVisible] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    const interval = setInterval(() => {
      setActiveIdx(i => (i + 1) % FEATURE_META.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`transition duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-ink mb-3">
          {t('headingPre')}{' '}
          <span className="text-ink">
            FrameTrain
          </span>
        </h2>
        <p className="text-ink-muted text-lg">{t('subtitle')}</p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {FEATURE_META.map((f, i) => (
          <div
            key={f.key}
            className={` ${f.color} border ${f.border} rounded-lg p-6 transition duration-300 ease-out ${
              activeIdx === i ? 'scale-[1.03] ' : 'scale-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {f.icon}
              <h3 className="text-ink font-semibold text-lg">{t(`features.${f.key}.title`)}</h3>
            </div>
            <p className="text-ink text-sm leading-relaxed">{t(`features.${f.key}.desc`)}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onTutorial}
          className="press flex items-center gap-2 px-8 py-4 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge rounded-lg font-semibold text-lg   transition duration-200 ease-out"
        >
          <BookOpen className="w-5 h-5" />
          {t('ctaTutorial')}
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="press flex items-center gap-2 px-8 py-4 bg-surface border border-line border border-line-strong text-ink hover:text-ink hover:border-line-strong rounded-lg font-semibold transition duration-200 ease-out"
        >
          <Play className="w-5 h-5" />
          {t('ctaSkip')}
        </button>
      </div>
    </div>
  )
}

// ─── Tutorial View ─────────────────────────────────────────────────────────────
function TutorialView({ onDone }: { onDone: () => void }) {
  const t = useTranslations('Payment.success.tutorial')
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  const stepsMeta = [
    { color: 'text-indigo-text', bg: 'bg-indigo-soft border-line', icon: <Key className="w-8 h-8 text-indigo-text" /> },
    { color: 'text-indigo-text', bg: 'bg-indigo-soft border-line', icon: <Download className="w-8 h-8 text-indigo-text" /> },
    { color: 'text-indigo-text', bg: 'bg-indigo-soft border-line', icon: <Layers className="w-8 h-8 text-indigo-text" /> },
    { color: 'text-success', bg: 'bg-ghost-fill border-line', icon: <Zap className="w-8 h-8 text-success" /> },
  ]
  const stepTexts = t.raw('steps') as { title: string; desc: string }[]

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  const next = () => {
    if (step < stepsMeta.length - 1) {
      setStep(s => s + 1)
    } else {
      onDone()
    }
  }

  const meta = stepsMeta[step]
  const text = stepTexts[step]

  return (
    <div className={`transition duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {stepsMeta.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition duration-200 ease-out ${
              i === step
                ? 'w-8 h-2.5 bg-indigo-soft'
                : i < step
                ? 'w-2.5 h-2.5 bg-success'
                : 'w-2.5 h-2.5 bg-surface-raised'
            }`}
          />
        ))}
      </div>

      {/* Step card */}
      <div className={`rounded-xl border p-10 mb-8 text-center ${meta.bg} transition duration-300 ease-out`}>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-surface border border-line rounded-xl flex items-center justify-center">
            {meta.icon}
          </div>
        </div>
        <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${meta.color}`}>{t('stepLabel')} {String(step + 1).padStart(2, '0')}</div>
        <h3 className="text-2xl font-semibold text-ink mb-4">{text.title}</h3>
        <p className="text-ink text-base leading-relaxed max-w-sm mx-auto">{text.desc}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 bg-surface border border-line border border-line text-ink-muted hover:text-ink rounded-md disabled:opacity-30 transition duration-200 ease-out text-sm"
        >
          {t('back')}
        </button>
        <button
          onClick={next}
          className="press flex items-center gap-2 px-8 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge rounded-md font-semibold   transition duration-200 ease-out"
        >
          {step < stepsMeta.length - 1 ? (
            <>{t('next')} <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>{t('toDashboard')} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Skip */}
      <div className="text-center mt-5">
        <button onClick={onDone} className="text-ink-faint hover:text-ink-muted text-sm transition-colors">
          {t('skip')}
        </button>
      </div>
    </div>
  )
}

// ─── Main Content ──────────────────────────────────────────────────────────────
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  // Kommt von der Gutschein-Seite (/redeem, Lifetime-Code ohne Stripe)
  const promoRedeemed = searchParams.get('promo') === 'redeemed'
  const t = useTranslations('Payment.success')

  // 'verifying' → 'check' → 'showcase' → 'tutorial'
  const [view, setView] = useState<'verifying' | 'check' | 'showcase' | 'tutorial' | 'invalid'>('verifying')
  const [successVisible, setSuccessVisible] = useState(false)

  // Schritt 1: session_id prüfen + auf hasPaid warten
  useEffect(() => {
    // ── Gutschein-Einlösung (kein Stripe): Freischaltung über /api/auth/me prüfen ──
    // Die Seite zeigt die Animation NUR, wenn der Server hasPaid bestätigt —
    // der URL-Param allein schaltet nichts frei.
    if (promoRedeemed) {
      let attempts = 0
      const MAX_ATTEMPTS = 10
      const checkAccess = async () => {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            if (data.user?.hasPaid) {
              setView('check')
              return
            }
          }
          if (attempts < MAX_ATTEMPTS) {
            attempts++
            setTimeout(checkAccess, 1000)
            return
          }
          setView('invalid')
        } catch {
          setView('invalid')
        }
      }
      checkAccess()
      return
    }

    // Keine session_id in der URL → sofort raus
    if (!sessionId) {
      router.replace('/payment')
      return
    }

    let attempts = 0
    const MAX_ATTEMPTS = 10   // max ~10 Sekunden warten
    const INTERVAL_MS = 1000

    const verify = async () => {
      try {
        // Session gegen Stripe verifizieren
        const res = await fetch(`/api/payment/verify-session?session_id=${sessionId}`, {
          credentials: 'include',
        })

        if (!res.ok) {
          // 403 / 404 → ungültige Session
          setView('invalid')
          return
        }

        const data = await res.json()

        if (data.valid && data.hasPaid) {
          // Zahlung bestätigt + DB aktualisiert → Conversion feuern, dann Animation.
          // Werte kommen vom Server (Stripe), nie aus der URL. trackPurchase
          // dedupliziert selbst über die Stripe-Session-ID und feuert nur bei
          // erteiltem Consent. Bei Gratis-Trials (amountTotal = 0) bleibt es
          // bewusst aus — dort entsteht noch kein Umsatz.
          if (data.transactionId && data.amountTotal > 0 && data.currency) {
            trackPurchase({
              transactionId: data.transactionId,
              value: data.amountTotal,
              currency: data.currency,
              plan: data.plan ?? undefined,
            })
          } else if (data.transactionId) {
            // Gutschein-Checkout mit Gratiszeit: Stripe bucht jetzt 0 €.
            // Kein purchase (kein Umsatz), aber sehr wohl ein Funnel-Signal —
            // sonst erzeugt ein trial-first-Nutzer gar keine Conversion.
            // Die spätere echte Abbuchung erfasst der Stripe-Webhook.
            trackStartTrial({
              promoType: 'stripe_trial',
              dedupeId: data.transactionId,
            })
          }
          setView('check')
          return
        }

        if (data.valid && !data.hasPaid && attempts < MAX_ATTEMPTS) {
          // Stripe OK, aber Webhook noch nicht angekommen → polling
          attempts++
          setTimeout(verify, INTERVAL_MS)
          return
        }

        // Timeout oder ungültig
        setView('invalid')
      } catch {
        setView('invalid')
      }
    }

    verify()
  }, [sessionId, promoRedeemed, router])

  function handleCheckDone() {
    setTimeout(() => setSuccessVisible(true), 100)
    setTimeout(() => setView('showcase'), 2200)
  }

  const bgClass = 'min-h-screen flex flex-col bg-bg   '

  // Verifizierung läuft noch
  if (view === 'verifying') {
    return (
      <div className={bgClass}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-indigo-text border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-ink-muted text-lg">{promoRedeemed ? t('activating') : t('verifying')}</p>
          </div>
        </main>
      </div>
    )
  }

  // Ungültige oder fehlende Session
  if (view === 'invalid') {
    return (
      <div className={bgClass}>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-6"></div>
            <h1 className="text-2xl font-semibold text-ink mb-3">{t('invalid.heading')}</h1>
            <p className="text-ink-muted mb-8">{t('invalid.text')}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/payment')}
                className="px-6 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge rounded-md font-semibold"
              >
                {t('invalid.ctaPayment')}
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-surface border border-line border border-line-strong text-ink rounded-md font-semibold"
              >
                {t('invalid.ctaDashboard')}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={bgClass}>
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">

          {/* ── Check animation phase ── */}
          {view === 'check' && (
            <div className="text-center">
              <AnimatedCheck onDone={handleCheckDone} />
              <div
                className={`transition duration-300 ease-out mt-8 ${successVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <h1 className="text-4xl font-semibold text-ink mb-3">
                  {t('successHeading')}
                </h1>
                <p className="text-ink-muted text-lg">
                  {t('successText')}
                </p>
              </div>
            </div>
          )}

          {/* ── Feature showcase ── */}
          {view === 'showcase' && (
            <FeatureShowcase
              onSkip={() => router.push('/dashboard')}
              onTutorial={() => setView('tutorial')}
            />
          )}

          {/* ── Tutorial ── */}
          {view === 'tutorial' && (
            <TutorialView onDone={() => router.push('/dashboard')} />
          )}

        </div>
      </main>

      <style jsx global>{`
        @keyframes ping {
          0% { transform: scale(0.95); opacity: 0.8; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function PaymentSuccessPage() {
  const t = useTranslations('Payment.success')
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg ">
        <div className="text-ink text-xl">{t('loadingFallback')}</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
