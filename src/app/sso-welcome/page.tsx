'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle2, ArrowRight, Brain, Zap, BarChart3, Layers } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase =
  | 'idle'        // before start
  | 'logos'       // logos fly in
  | 'connecting'  // animated line between them
  | 'connected'   // checkmark appears
  | 'features'    // feature cards appear
  | 'cta'         // button appears

// ─── Helpers ──────────────────────────────────────────────────────────────────
const easeOut = 'cubic-bezier(0.16, 1, 0.3, 1)'

const FEATURES = [
  {
    icon: Brain,
    title: 'Lokales Training',
    desc: 'Trainiere KI-Modelle direkt auf deinem Rechner — DSGVO-konform, keine Cloud.',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
  },
  {
    icon: Zap,
    title: 'LoRA Fine-Tuning',
    desc: 'Effizientes Fine-Tuning großer Modelle mit wenig VRAM durch LoRA-Adapter.',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.2)',
  },
  {
    icon: BarChart3,
    title: 'Live Monitoring',
    desc: 'Echtzeit-Übersicht über Loss, GPU-Auslastung und Trainingsfortschritt.',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.08)',
    border: 'rgba(34,211,238,0.2)',
  },
  {
    icon: Layers,
    title: 'FrameSphere Connected',
    desc: 'Dein FrameSphere-Konto ist verknüpft — ein Login für alle deine Tools.',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
  },
]

// ─── Logo Components ───────────────────────────────────────────────────────────
function FrameTrainLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(-60px) scale(0.8)',
      transition: `opacity 0.7s ${easeOut}, transform 0.7s ${easeOut}`,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px rgba(168,85,247,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        <Brain size={36} color="white" />
        <div style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 21,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>FrameTrain</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>KI-Training App</div>
      </div>
    </div>
  )
}

function FrameSphereLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.8)',
      transition: `opacity 0.7s ${easeOut} 0.15s, transform 0.7s ${easeOut} 0.15s`,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #6d28d9, #c026d3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px rgba(192,38,211,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        <span style={{ color: 'white', fontWeight: 900, fontSize: 26, letterSpacing: '-1px' }}>FS</span>
        <div style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 21,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>FrameSphere</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Dein Account-Hub</div>
      </div>
    </div>
  )
}

// ─── Animated connecting line with traveling dot ───────────────────────────────
function ConnectionLine({ phase }: { phase: Phase }) {
  const drawing = phase === 'connecting' || phase === 'connected' || phase === 'features' || phase === 'cta'
  const done = phase === 'connected' || phase === 'features' || phase === 'cta'

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 120 }}>
      {/* Static line */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 2,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        {/* Animated fill */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #7c3aed, #c026d3)',
          transformOrigin: 'left center',
          transform: drawing ? 'scaleX(1)' : 'scaleX(0)',
          transition: drawing ? `transform 0.6s ${easeOut}` : 'none',
          boxShadow: drawing ? '0 0 10px rgba(168,85,247,0.8)' : 'none',
        }} />
        {/* Traveling particle */}
        {drawing && !done && (
          <div style={{
            position: 'absolute',
            top: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 12px rgba(255,255,255,0.9)',
            transform: 'translateY(-50%)',
            animation: 'travelDot 0.6s ease-out forwards',
          }} />
        )}
      </div>

      {/* Checkmark in the center */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: done ? 'linear-gradient(135deg, #059669, #34d399)' : 'transparent',
        border: done ? 'none' : '2px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: done ? 1 : 0,
        transform: done ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)',
        transition: `opacity 0.4s ${easeOut}, transform 0.5s ${easeOut}`,
        boxShadow: done ? '0 0 20px rgba(52,211,153,0.6)' : 'none',
      }}>
        <CheckCircle2 size={16} color="white" strokeWidth={2.5} />
      </div>
    </div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, bg, border, delay, visible }: {
  icon: any; title: string; desc: string; color: string; bg: string; border: string; delay: number; visible: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
        transition: `opacity 0.5s ${easeOut} ${delay}ms, transform 0.5s ${easeOut} ${delay}ms`,
        padding: '18px 20px',
        borderRadius: 16,
        background: hovered ? `linear-gradient(135deg, ${bg}, rgba(255,255,255,0.03))` : bg,
        border: `1px solid ${hovered ? color + '44' : border}`,
        backdropFilter: 'blur(12px)',
        cursor: 'default',
        transition: `opacity 0.5s ${easeOut} ${delay}ms, transform 0.5s ${easeOut} ${delay}ms, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease`,
        boxShadow: hovered ? `0 8px 32px ${color}22` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
          transition: 'transform 0.25s ease',
        }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SSOWelcomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [hasPaid, setHasPaid] = useState<boolean | null>(null)
  const [btnHovered, setBtnHovered] = useState(false)

  // Check auth + paid status
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    // Fetch paid status from /api/auth/me or stored in user context
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setHasPaid(data.user?.hasPaid ?? false))
      .catch(() => setHasPaid(false))
  }, [authLoading, isAuthenticated])

  // Kick off animation sequence once paid status is known
  useEffect(() => {
    if (hasPaid === null) return
    const timers: NodeJS.Timeout[] = []
    timers.push(setTimeout(() => setPhase('logos'),      100))
    timers.push(setTimeout(() => setPhase('connecting'), 900))
    timers.push(setTimeout(() => setPhase('connected'),  1600))
    timers.push(setTimeout(() => setPhase('features'),   2200))
    timers.push(setTimeout(() => setPhase('cta'),        2900))
    return () => timers.forEach(clearTimeout)
  }, [hasPaid])

  const showLogos      = phase !== 'idle'
  const showLine       = phase !== 'idle'
  const showFeatures   = phase === 'features' || phase === 'cta'
  const showCta        = phase === 'cta'

  const handleWeiter = () => {
    if (hasPaid) {
      router.push('/dashboard')
    } else {
      router.push('/payment')
    }
  }

  if (authLoading || hasPaid === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
        <div style={{
          width: 40, height: 40,
          border: '2px solid rgba(168,85,247,0.2)',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes travelDot {
          from { left: 0%; }
          to   { left: 100%; }
        }
        @keyframes orbPulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%     { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes shimmerBtn {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, background: '#030712',
        overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          top: '-150px', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          animation: 'orbPulse 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          bottom: '-80px', left: '20%',
          background: 'radial-gradient(circle, rgba(192,38,211,0.1) 0%, transparent 70%)',
          animation: 'orbPulse 10s ease-in-out infinite 2s',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <main style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* ── Connection Animation ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

            {/* Logos + line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' }}>
              <FrameTrainLogo visible={showLogos} />
              <ConnectionLine phase={phase} />
              <FrameSphereLogo visible={showLogos} />
            </div>

            {/* Connected label */}
            <div style={{
              opacity: (phase === 'connected' || phase === 'features' || phase === 'cta') ? 1 : 0,
              transform: (phase === 'connected' || phase === 'features' || phase === 'cta')
                ? 'translateY(0) scale(1)'
                : 'translateY(12px) scale(0.9)',
              transition: `opacity 0.5s ${easeOut}, transform 0.5s ${easeOut}`,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px',
              borderRadius: 100,
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
            }}>
              <CheckCircle2 size={15} color="#34d399" />
              <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>
                Erfolgreich verbunden
              </span>
            </div>

            {/* Headline */}
            <div style={{
              textAlign: 'center',
              opacity: (phase === 'features' || phase === 'cta') ? 1 : 0,
              transform: (phase === 'features' || phase === 'cta') ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.5s ${easeOut} 0.1s, transform 0.5s ${easeOut} 0.1s`,
            }}>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(26px, 5vw, 38px)',
                fontWeight: 900,
                color: '#f1f5f9',
                lineHeight: 1.2,
                letterSpacing: '-1px',
                marginBottom: 12,
              }}>
                Dein FrameSphere-Konto<br />
                <span style={{
                  background: 'linear-gradient(90deg, #c4b5fd, #f9a8d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>ist jetzt verknüpft.</span>
              </h1>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
                Du kannst dich ab sofort mit einem Klick bei FrameTrain anmelden — ganz ohne
                separates Passwort. Dein Account ist bereits eingerichtet.
              </p>
            </div>
          </div>

          {/* ── Feature Cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.title}
                {...f}
                delay={i * 80}
                visible={showFeatures}
              />
            ))}
          </div>

          {/* ── CTA Button ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            opacity: showCta ? 1 : 0,
            transform: showCta ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.5s ${easeOut}, transform 0.5s ${easeOut}`,
          }}>
            <button
              onClick={handleWeiter}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                padding: '16px 48px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                color: 'white',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899, #a855f7, #7c3aed)',
                backgroundSize: '300% 100%',
                animation: 'shimmerBtn 2.5s linear infinite',
                transform: btnHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1) translateY(0)',
                transition: 'transform 0.2s ease',
                boxShadow: btnHovered
                  ? '0 20px 50px rgba(168,85,247,0.5)'
                  : '0 8px 30px rgba(168,85,247,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                letterSpacing: '-0.3px',
              }}
            >
              {hasPaid ? 'Zum Dashboard' : 'Jetzt freischalten'}
              <ArrowRight
                size={18}
                style={{
                  transform: btnHovered ? 'translateX(3px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {!hasPaid && (
              <p style={{ color: '#374151', fontSize: 13 }}>
                Einmaliger Kauf · danach unlimitierter Zugang
              </p>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
