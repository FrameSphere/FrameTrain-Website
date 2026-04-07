'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import {
  Download, Key, Zap, Brain, BarChart3, Layers, ChevronRight,
  BookOpen, Play, ArrowRight, Check
} from 'lucide-react'

// ─── Feature Showcase Data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Brain className="w-7 h-7 text-violet-400" />,
    title: 'Model Manager',
    desc: 'Importiere Modelle direkt von HuggingFace Hub oder lokalen Dateien – in Sekunden.',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-400/25',
  },
  {
    icon: <Zap className="w-7 h-7 text-pink-400" />,
    title: 'Training Panel',
    desc: 'Konfiguriere Learning Rate, Batch Size, LoRA-Adapter und starte mit einem Klick.',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'border-pink-400/25',
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-cyan-400" />,
    title: 'Live Monitoring',
    desc: 'Verfolge Training Loss, Validation Loss und Accuracy in Echtzeit.',
    color: 'from-cyan-500/20 to-teal-500/10',
    border: 'border-cyan-400/25',
  },
  {
    icon: <Layers className="w-7 h-7 text-green-400" />,
    title: 'LoRA Fine-Tuning',
    desc: 'Trainiere LLMs mit 10× weniger VRAM dank eingebautem LoRA & QLoRA Support.',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-400/25',
  },
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
  // Color: interpolate from violet (#8b5cf6) → magenta (#e879f9) → green (#22c55e)
  // split: 0–0.5 = violet→magenta, 0.5–1 = magenta→green
  function lerpColor(a: [number,number,number], b: [number,number,number], t: number): string {
    const r = Math.round(a[0] + (b[0] - a[0]) * t)
    const g = Math.round(a[1] + (b[1] - a[1]) * t)
    const bl = Math.round(a[2] + (b[2] - a[2]) * t)
    return `rgb(${r},${g},${bl})`
  }
  const violet: [number,number,number] = [139, 92, 246]
  const magenta: [number,number,number] = [232, 121, 249]
  const green: [number,number,number] = [34, 197, 94]
  let arcColor: string
  if (fillProgress <= 0.5) {
    arcColor = lerpColor(violet, magenta, fillProgress / 0.5)
  } else {
    arcColor = lerpColor(magenta, green, (fillProgress - 0.5) / 0.5)
  }

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
      {/* Glow ring */}
      {phase === 'done' && (
        <div
          className="absolute rounded-full"
          style={{
            width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)',
            animation: 'ping 1s ease-out',
          }}
        />
      )}
      <svg width="140" height="140" viewBox="0 0 120 120">
        {/* Background track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
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
          style={{ transition: 'stroke 0.05s linear', filter: `drop-shadow(0 0 8px ${arcColor})` }}
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
  const [visible, setVisible] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    const interval = setInterval(() => {
      setActiveIdx(i => (i + 1) % FEATURES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Willkommen bei{' '}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
            FrameTrain
          </span>
        </h2>
        <p className="text-gray-400 text-lg">Hier ist, was dich erwartet:</p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 transition-all duration-500 ${
              activeIdx === i ? 'scale-[1.03] shadow-lg' : 'scale-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {f.icon}
              <h3 className="text-white font-bold text-lg">{f.title}</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onTutorial}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 transition-all"
        >
          <BookOpen className="w-5 h-5" />
          Kurzes Tutorial ansehen
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="flex items-center gap-2 px-8 py-4 glass border border-white/15 text-gray-300 hover:text-white hover:border-white/30 rounded-2xl font-semibold transition-all"
        >
          <Play className="w-5 h-5" />
          Direkt loslegen
        </button>
      </div>
    </div>
  )
}

// ─── Tutorial View ─────────────────────────────────────────────────────────────
function TutorialView({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  const steps = [
    {
      num: '01',
      color: 'text-violet-400',
      bg: 'bg-violet-500/15 border-violet-400/25',
      title: 'API-Key kopieren',
      desc: 'Gehe ins Dashboard und kopiere deinen persönlichen API-Key. Er dient als Lizenz für die Desktop-App.',
      icon: <Key className="w-8 h-8 text-violet-400" />,
    },
    {
      num: '02',
      color: 'text-pink-400',
      bg: 'bg-pink-500/15 border-pink-400/25',
      title: 'App herunterladen',
      desc: 'Lade FrameTrain für Windows, macOS oder Linux herunter – direkt im Dashboard-Bereich.',
      icon: <Download className="w-8 h-8 text-pink-400" />,
    },
    {
      num: '03',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15 border-cyan-400/25',
      title: 'Modell importieren',
      desc: 'Öffne den Model Manager und importiere dein erstes Modell von HuggingFace Hub oder lokal.',
      icon: <Layers className="w-8 h-8 text-cyan-400" />,
    },
    {
      num: '04',
      color: 'text-green-400',
      bg: 'bg-green-500/15 border-green-400/25',
      title: 'Training starten',
      desc: 'Lade dein Dataset hoch, stelle Hyperparameter ein und klicke auf "Start Training". Fertig! 🚀',
      icon: <Zap className="w-8 h-8 text-green-400" />,
    },
  ]

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      onDone()
    }
  }

  const s = steps[step]

  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step
                ? 'w-8 h-2.5 bg-violet-400'
                : i < step
                ? 'w-2.5 h-2.5 bg-green-400'
                : 'w-2.5 h-2.5 bg-white/15'
            }`}
          />
        ))}
      </div>

      {/* Step card */}
      <div className={`rounded-3xl border p-10 mb-8 text-center ${s.bg} transition-all duration-500`}>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center">
            {s.icon}
          </div>
        </div>
        <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${s.color}`}>Schritt {s.num}</div>
        <h3 className="text-2xl font-black text-white mb-4">{s.title}</h3>
        <p className="text-gray-300 text-base leading-relaxed max-w-sm mx-auto">{s.desc}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 glass border border-white/10 text-gray-400 hover:text-white rounded-xl disabled:opacity-30 transition-all text-sm"
        >
          ← Zurück
        </button>
        <button
          onClick={next}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 transition-all"
        >
          {step < steps.length - 1 ? (
            <>Weiter <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Zum Dashboard <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Skip */}
      <div className="text-center mt-5">
        <button onClick={onDone} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
          Überspringen
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

  // 'check' → 'showcase' → 'tutorial' | 'done'
  const [view, setView] = useState<'check' | 'showcase' | 'tutorial' | 'done'>('check')
  const [successVisible, setSuccessVisible] = useState(false)

  function handleCheckDone() {
    setTimeout(() => setSuccessVisible(true), 100)
    setTimeout(() => setView('showcase'), 2200)
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  function handleTutorial() {
    setView('tutorial')
  }

  function handleTutorialDone() {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">

          {/* ── Check animation phase ── */}
          {view === 'check' && (
            <div className="text-center">
              <AnimatedCheck onDone={handleCheckDone} />
              <div
                className={`transition-all duration-700 mt-8 ${successVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <h1 className="text-4xl font-black text-white mb-3">
                  Zahlung erfolgreich! 🎉
                </h1>
                <p className="text-gray-400 text-lg">
                  Willkommen in der FrameTrain-Familie. Dein Account ist jetzt aktiv.
                </p>
              </div>
            </div>
          )}

          {/* ── Feature showcase ── */}
          {view === 'showcase' && (
            <FeatureShowcase onSkip={handleSkip} onTutorial={handleTutorial} />
          )}

          {/* ── Tutorial ── */}
          {view === 'tutorial' && (
            <TutorialView onDone={handleTutorialDone} />
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
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
