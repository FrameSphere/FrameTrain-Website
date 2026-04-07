'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import {
  CreditCard, Shield, Zap, Brain, BarChart3, Layers,
  Lock, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react'

// ─── Feature items ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    label: 'Model Manager',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.35)',
  },
  {
    icon: Zap,
    label: 'Training Panel',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.35)',
  },
  {
    icon: BarChart3,
    label: 'Live Monitoring',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.35)',
  },
  {
    icon: Layers,
    label: 'LoRA Fine-Tuning',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.35)',
  },
]

const PERKS = [
  'Voller Zugang zur Desktop-App',
  'Unbegrenzte Modelle & Trainings',
  'Lebenslange Updates – kostenlos',
  'API-Key sofort nach Zahlung',
  'Alle zukünftigen Features inklusive',
]

// ─── Animated background orbs ─────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large violet orb */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          top: '-200px',
          right: '-150px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          animation: 'orbFloat1 12s ease-in-out infinite',
        }}
      />
      {/* Pink orb */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          bottom: '-100px',
          left: '-100px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)',
          animation: 'orbFloat2 15s ease-in-out infinite',
        }}
      />
      {/* Cyan orb */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          animation: 'orbFloat3 18s ease-in-out infinite',
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// ─── Feature icon card ─────────────────────────────────────────────────────────
function FeatureChip({ icon: Icon, label, color, glow, delay }: {
  icon: any; label: string; color: string; glow: string; delay: number
}) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))`
          : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        border: `1px solid ${hovered ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backdropFilter: 'blur(12px)',
        boxShadow: hovered ? `0 0 24px ${glow}` : 'none',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{label}</span>
    </div>
  )
}

// ─── Animated price counter ────────────────────────────────────────────────────
function PriceDisplay({ visible }: { visible: boolean }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (visible) setTimeout(() => setShown(true), 100)
  }, [visible])

  return (
    <div style={{ textAlign: 'center', marginBottom: 8 }}>
      <div
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(20px)',
          transition: 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', marginTop: 14, lineHeight: 1 }}>€</span>
        <span
          style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-4px',
          }}
        >
          1,99
        </span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>Einmalig · kein Abo · kein Risiko</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler beim Erstellen der Checkout-Session')
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
        <div style={{ color: '#6b7280' }}>Lädt…</div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  // Stagger delays
  const d = (n: number) => n * 120 + 200

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 60px) scale(1.05); }
          66% { transform: translate(30px, -40px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -50px) scale(1.08); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          40% { transform: translate(-50%, -50%) scale(1.3); }
          70% { transform: translate(-45%, -55%) scale(0.9); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pay-btn-shimmer {
          background: linear-gradient(135deg, #7c3aed, #a855f7, #ec4899, #a855f7, #7c3aed);
          background-size: 300% 100%;
          animation: shimmer 2.5s linear infinite;
        }
        .pay-btn-shimmer:hover {
          animation: shimmer 1.2s linear infinite;
        }
        * { box-sizing: border-box; }
      `}</style>

      <BackgroundOrbs />

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#030712', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
        <Header />

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 60px' }}>
          <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>

            {/* ── Top label ── */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
                transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 28,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(167,139,250,0.12)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: 100,
                padding: '6px 16px',
              }}>
                <Sparkles size={14} color="#c4b5fd" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', letterSpacing: '0.05em' }}>
                  EIN SCHRITT VOR DEM ZUGANG
                </span>
              </div>
            </div>

            {/* ── Headline ── */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(32px, 6vw, 52px)',
                fontWeight: 900,
                color: '#f1f5f9',
                lineHeight: 1.1,
                margin: '0 0 14px',
                letterSpacing: '-1.5px',
              }}>
                Schalte FrameTrain
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, #c4b5fd, #f9a8d4, #67e8f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  für immer frei.
                </span>
              </h1>
              <p style={{ color: '#64748b', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
                Willkommen, {user?.email?.split('@')[0] || 'Trainer'}. <br />
                Einmalige Zahlung — du zahlst nie wieder.
              </p>
            </div>

            {/* ── Main card ── */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
                transition: 'opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.3s',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 28,
                padding: 'clamp(24px, 5vw, 44px)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Price */}
              <PriceDisplay visible={mounted} />

              {/* Divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)', margin: '28px 0' }} />

              {/* Perks list */}
              <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PERKS.map((perk, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
                      transition: `opacity 0.4s ease ${d(i)}ms, transform 0.4s ease ${d(i)}ms`,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(52,211,153,0.15)',
                      border: '1px solid rgba(52,211,153,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <CheckCircle2 size={13} color="#34d399" />
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: 15, fontWeight: 500 }}>{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)', margin: '0 0 28px' }} />

              {/* Feature chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
                {FEATURES.map((f, i) => (
                  <FeatureChip key={f.label} {...f} delay={d(i + PERKS.length)} />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom: 20,
                  padding: '12px 16px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 12,
                  color: '#fca5a5',
                  fontSize: 14,
                }}>
                  {error}
                </div>
              )}

              {/* CTA Button */}
              <div style={{ position: 'relative' }}>
                {/* Pulse ring */}
                {!loading && (
                  <div style={{
                    position: 'absolute',
                    inset: -2,
                    borderRadius: 18,
                    border: '2px solid rgba(167,139,250,0.4)',
                    animation: 'pulseRing 2s ease-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  onMouseEnter={() => setBtnHovered(true)}
                  onMouseLeave={() => { setBtnHovered(false); setBtnPressed(false) }}
                  onMouseDown={() => setBtnPressed(true)}
                  onMouseUp={() => setBtnPressed(false)}
                  className="pay-btn-shimmer"
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: 16,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    color: 'white',
                    fontSize: 17,
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    transform: btnPressed ? 'scale(0.98)' : btnHovered ? 'scale(1.02)' : 'scale(1)',
                    transition: 'transform 0.15s ease, opacity 0.2s ease',
                    boxShadow: btnHovered
                      ? '0 20px 50px rgba(168,85,247,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
                      : '0 10px 30px rgba(168,85,247,0.3)',
                    letterSpacing: '-0.3px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 18, height: 18,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Weiterleitung zu Stripe…
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Jetzt freischalten · 1,99 €
                      <ArrowRight size={18} style={{ marginLeft: 4 }} />
                    </>
                  )}
                </button>
              </div>

              {/* Trust badges */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                marginTop: 20,
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 12 }}>
                  <Shield size={13} color="#34d399" />
                  <span>Stripe gesichert</span>
                </div>
                <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 12 }}>
                  <CreditCard size={13} color="#67e8f9" />
                  <span>Alle Karten akzeptiert</span>
                </div>
                <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 12 }}>
                  <CheckCircle2 size={13} color="#a78bfa" />
                  <span>Sofortzugang</span>
                </div>
              </div>

              {/* Skip link */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#374151', fontSize: 13,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6b7280')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
                >
                  Später bezahlen
                </button>
              </div>
            </div>

            {/* ── Feature icons row below card ── */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.6s ease 1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
                marginTop: 32,
                color: '#1e293b',
                fontSize: 13,
              }}
            >
              <span>Bereits von Entwicklern weltweit genutzt</span>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
