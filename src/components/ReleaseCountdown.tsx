'use client'

/* ============================================================
   Temporäre UI Anfang, bald herausnehmen
   Release: 20. Juli 2026, 12:00 UTC
   Zum Entfernen: Diese Datei löschen + alle Imports davon entfernen
   ============================================================ */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Rocket, Sparkles, PartyPopper, Clock } from 'lucide-react'

// ── Konfiguration ───────────────────────────────────────────────
const RELEASE_DATE = new Date('2026-07-20T12:00:00Z')
const CONFETTI_DAYS = 7 // Konfetti für N Tage nach Release
const CONFETTI_END = new Date(RELEASE_DATE.getTime() + CONFETTI_DAYS * 24 * 60 * 60 * 1000)

// ── Öffentliche Hilfsfunktionen ─────────────────────────────────
export function isAppReleased(): boolean {
  return new Date() >= RELEASE_DATE
}

export function isConfettiPeriod(): boolean {
  const now = new Date()
  return now >= RELEASE_DATE && now < CONFETTI_END
}

// ── Interne Helfer ──────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getTimeLeft() {
  const diff = RELEASE_DATE.getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

// ── Canvas Konfetti ─────────────────────────────────────────────
interface ConfettiParticle {
  x: number; y: number; vx: number; vy: number
  color: string; size: number; angle: number; spin: number; opacity: number
}

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ConfettiParticle[]>([])
  const rafRef = useRef<number>(0)
  const lastBurstRef = useRef<number>(0)

  const COLORS = [
    '#a855f7', '#ec4899', '#3b82f6', '#10b981',
    '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  ]

  const burst = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width
    const count = 80
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 6
      particlesRef.current.push({
        x: w * (0.2 + Math.random() * 0.6),
        y: -10,
        vx: Math.cos(angle) * speed * 0.6,
        vy: speed * (0.5 + Math.random() * 0.5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        opacity: 1,
      })
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initial burst
    burst()

    const animate = (ts: number) => {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Periodic new bursts every 3s
      if (ts - lastBurstRef.current > 3000) {
        burst()
        lastBurstRef.current = ts
      }

      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0.01)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        p.vx *= 0.99
        p.angle += p.spin
        if (p.y > canvas.height * 0.6) p.opacity -= 0.015
        else if (p.y > 0) p.opacity = Math.min(1, p.opacity)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active, burst])

  return canvasRef
}

// ── Haupt-Countdown (für Dashboard Download-Block) ──────────────
export function DownloadLockCountdown() {
  const t = useTranslations('ReleaseCountdown.downloadLock')
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [released, setReleased] = useState(false)
  const confettiActive = mounted && isConfettiPeriod()
  const canvasRef = useConfetti(released && confettiActive)

  useEffect(() => {
    setMounted(true)
    setReleased(isAppReleased())
    const tick = () => {
      const tl = getTimeLeft()
      setTimeLeft(tl)
      if (!tl) setReleased(true)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (mounted && released) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        {/* Konfetti Canvas */}
        {confettiActive && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />
        )}
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <PartyPopper className="w-6 h-6 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-bold text-sm">{t('releasedTitle')}</p>
            <p className="text-green-400/70 text-xs mt-0.5">{t('releasedDesc')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="p-5 bg-amber-500/8 border border-amber-500/25 rounded-xl mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-400" />
        <p className="text-amber-300 font-semibold text-sm">{t('availableFrom')}</p>
      </div>
      <div className="flex gap-3">
        {[
          { v: timeLeft.days, label: t('days') },
          { v: timeLeft.hours, label: t('hours') },
          { v: timeLeft.minutes, label: t('minutes') },
          { v: timeLeft.seconds, label: t('seconds') },
        ].map(({ v, label }) => (
          <div key={label} className="flex-1 text-center bg-black/20 rounded-lg py-2 px-1">
            <div className="text-xl font-black text-amber-400 font-mono">{mounted ? pad(v) : '--'}</div>
            <div className="text-[10px] text-amber-500/70 font-medium">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-amber-500/60 text-xs mt-3">
        {t('note')}
      </p>
    </div>
  )
}

// ── Hero-Banner für die Landing Page ───────────────────────────
export function ReleaseBanner() {
  const t = useTranslations('ReleaseCountdown.banner')
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [released, setReleased] = useState(false)
  const confettiActive = mounted && isConfettiPeriod()
  const canvasRef = useConfetti(released && confettiActive)

  useEffect(() => {
    setMounted(true)
    setReleased(isAppReleased())
    const tick = () => {
      const tl = getTimeLeft()
      setTimeLeft(tl)
      if (!tl) setReleased(true)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (mounted && released && confettiActive) {
    return (
      <div className="relative w-full max-w-2xl mx-auto mb-10 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
        <div className="glass-strong border border-green-400/30 rounded-2xl px-6 py-4 text-center relative">
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-green-300 font-black text-lg">{t('liveTitle')}</p>
          <p className="text-green-400/70 text-sm mt-1">{t('liveDesc')}</p>
        </div>
      </div>
    )
  }

  if (mounted && released) return null
  if (!timeLeft) return null

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="glass-strong border border-purple-500/30 rounded-2xl px-6 py-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-blue-600/5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-bold text-sm uppercase tracking-widest">{t('label')}</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex justify-center gap-3 mb-4">
            {[
              { v: timeLeft.days, label: t('days') },
              { v: timeLeft.hours, label: t('hours') },
              { v: timeLeft.minutes, label: t('minutes') },
              { v: timeLeft.seconds, label: t('seconds') },
            ].map(({ v, label }, i) => (
              <div key={label} className="flex flex-col items-center">
                <div className="glass rounded-xl px-4 py-3 min-w-[64px] text-center border border-white/10 mb-1.5">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{mounted ? pad(v) : '--'}</span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">{label}</span>
                {i < 3 && (
                  <span className="absolute text-2xl text-purple-400/50 font-black" style={{ marginTop: '8px', marginLeft: '70px' }}>:</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            <span className="text-purple-400 font-semibold">{t('date')}</span> · {t('note1')}
            <br />
            <span className="text-gray-500 text-xs">{t('note2')}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Kompaktes "Bald verfügbar" Badge ────────────────────────────
export function ComingSoonBadge() {
  const t = useTranslations('ReleaseCountdown.badge')
  const released = isAppReleased()
  if (released) return null
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold animate-pulse"
      style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.4)' }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
      </span>
      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {t('text')}
      </span>
    </div>
  )
}

// ── Großes Promo-Banner für Landing Page (Sektion) ──────────────
export function ReleasePromoSection() {
  const t = useTranslations('ReleaseCountdown.promo')
  const released = isAppReleased()
  if (released) return null

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl animate-gradient opacity-80" />
          <div className="absolute inset-[2px] bg-gray-950 rounded-3xl" />

          <div className="relative px-8 py-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6">
              <Rocket className="w-3.5 h-3.5" />
              {t('tag')}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t('titlePre')}{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              {t.rich('paragraph', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
              {(t.raw('features') as { emoji: string; text: string }[]).map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/10">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-gray-300 text-left">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>{t('footer')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Temporäre UI Ende
   ============================================================ */
