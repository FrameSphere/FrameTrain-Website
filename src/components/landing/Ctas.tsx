'use client'

import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/events'

/**
 * Die Hauptaktion. Für Gäste überall dasselbe Wort ("Kostenlos testen"),
 * für Angemeldete der Weg zurück ins Dashboard. Startet im Server-HTML als
 * Gast-Variante, damit der Inhalt nie auf den Auth-Check wartet.
 */
export function TrialButton({
  label,
  dashboardLabel,
  from,
  variant = 'primary',
  className = '',
}: {
  label: string
  dashboardLabel: string
  from: string
  variant?: 'primary' | 'on-indigo'
  className?: string
}) {
  const { isAuthenticated } = useAuth()
  return (
    <Link
      href={isAuthenticated ? '/dashboard' : '/register'}
      onClick={() => !isAuthenticated && trackEvent('trial_click', { from })}
      className={`ft-btn ${variant === 'on-indigo' ? 'ft-btn--on-indigo' : 'ft-btn--primary'} ${className}`}
    >
      {isAuthenticated ? dashboardLabel : label}
    </Link>
  )
}

export function DemoButton({
  label,
  variant = 'ghost',
  className = '',
}: {
  label: string
  variant?: 'ghost' | 'on-indigo-outline'
  className?: string
}) {
  return (
    <a
      href="#demo"
      onClick={() => trackEvent('demo_click')}
      // Klassen ausgeschrieben: Tailwind findet sonst keine Verwendung und wirft sie raus
      className={`ft-btn ${variant === 'on-indigo-outline' ? 'ft-btn--on-indigo-outline' : 'ft-btn--ghost'} ${className}`}
    >
      <Play className="w-4 h-4" strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
      {label}
    </a>
  )
}

/**
 * Mobile Sticky-Pille: Wer vom Handy kommt (Reddit, TikTok, Instagram), hat
 * Preis und Aktion immer einen Daumen entfernt. Erscheint, sobald der Hero
 * aus dem Bild ist, und verschwindet über dem Abschluss-Block, der dieselbe
 * Aktion schon groß zeigt.
 */
export function MobileCtaPill({ cta, price, heroId, endId }: { cta: string; price: string; heroId: string; endId: string }) {
  const { isAuthenticated } = useAuth()
  const [pastHero, setPastHero] = useState(false)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(heroId)
    const end = document.getElementById(endId)
    const observers: IntersectionObserver[] = []
    if (hero) {
      const o = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0))
      o.observe(hero)
      observers.push(o)
    }
    if (end) {
      const o = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { rootMargin: '0px 0px -20% 0px' })
      o.observe(end)
      observers.push(o)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [heroId, endId])

  if (isAuthenticated) return null
  const visible = pastHero && !atEnd

  return (
    <div
      className={`ft-mobile-pill md:hidden fixed inset-x-3 bottom-3 z-40 transition-[transform,opacity] duration-[240ms] ease-out motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[140%] opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 p-1.5 pl-5 rounded-pill bg-surface-raised border border-line shadow-island">
        <span className="ft-data text-ink-muted flex-1">{price}</span>
        <Link
          href="/register"
          tabIndex={visible ? 0 : -1}
          onClick={() => trackEvent('trial_click', { from: 'mobile_pill' })}
          className="ft-btn ft-btn--primary !h-11 !px-5 !text-[15px]"
        >
          {cta}
        </Link>
      </div>
    </div>
  )
}
