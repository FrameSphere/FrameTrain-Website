'use client'

import { useState } from 'react'
import { Check, Ticket } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/events'

export type PricingCopy = {
  monthly: string
  yearly: string
  save: string
  recommended: string
  planName: string
  perMonth: string
  yearlyPrice: string
  yearlyBilling: string
  monthlyPrice: string
  monthlyBilling: string
  features: string[]
  cta: string
  ctaNote: string
  subscribeDirect: string
  foundingLabel: string
  foundingCount: string
  foundingNote: string
  promoHint: string
  promoCta: string
}

type Props = { copy: PricingCopy; foundingCount: number | null; foundingSpots: number }

/**
 * Ein Plan, zwei Abrechnungen. Jährlich ist vorausgewählt und markiert –
 * als Monatspreis (3,33 €) dargestellt, weil das die Zahl ist, die man mit
 * anderen Abos vergleicht. Die Hauptaktion bleibt "Kostenlos testen".
 */
export function PricingCard({ copy, foundingCount, foundingSpots }: Props) {
  const { isAuthenticated } = useAuth()
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly')
  const yearly = plan === 'yearly'
  const taken = foundingCount === null ? null : Math.min(foundingCount, foundingSpots)

  const choose = (p: 'yearly' | 'monthly') => {
    setPlan(p)
    trackEvent('pricing_toggle', { plan: p })
  }

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="p-7 sm:p-10 lg:border-r border-line">
          {/* Umschalter */}
          <div role="radiogroup" aria-label={copy.planName} className="inline-flex p-1 rounded-pill bg-bg border border-line">
            {(['yearly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={plan === p}
                onClick={() => choose(p)}
                className={`h-10 px-4 sm:px-5 rounded-pill text-[14px] font-medium transition-colors duration-150 ease-out ${
                  plan === p ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {p === 'yearly' ? copy.yearly : copy.monthly}
                {p === 'yearly' && <span className="ml-2 ft-data text-success">{copy.save}</span>}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="ft-label">{copy.planName}</span>
            {yearly && (
              <span className="ft-data px-2.5 py-0.5 rounded-pill bg-indigo-soft text-indigo-text">{copy.recommended}</span>
            )}
          </div>

          <div className="mt-3 flex items-baseline gap-2" aria-live="polite">
            <span key={plan} className="ft-stat !text-[64px] sm:!text-[72px] animate-enter">
              {yearly ? copy.yearlyPrice : copy.monthlyPrice}
            </span>
            <span className="text-[17px] text-ink-muted">{copy.perMonth}</span>
          </div>
          <p className="mt-2 ft-data text-ink-faint">{yearly ? copy.yearlyBilling : copy.monthlyBilling}</p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            {isAuthenticated ? (
              <Link href={`/payment?plan=${plan}`} className="ft-btn ft-btn--primary">
                {copy.subscribeDirect}
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => trackEvent('trial_click', { from: 'pricing', plan })}
                  className="ft-btn ft-btn--primary"
                >
                  {copy.cta}
                </Link>
                <Link href={`/payment?plan=${plan}`} className="ft-link text-[15px] font-medium sm:ml-2">
                  {copy.subscribeDirect}
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 ft-data text-ink-muted">{copy.ctaNote}</p>
        </div>

        <div className="p-7 sm:p-10 border-t lg:border-t-0 border-line flex flex-col">
          <ul className="flex flex-col gap-3.5">
            {copy.features.map((f) => (
              <li key={f} className="flex gap-3 text-[16px] leading-6 text-ink">
                <Check className="w-[18px] h-[18px] mt-[3px] flex-none text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          {taken !== null && (
            <div className="mt-auto pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <span className="ft-label">{copy.foundingLabel}</span>
                <span className="ft-data text-ink tabular-nums">
                  {copy.foundingCount.replace('{count}', String(taken))}
                </span>
              </div>
              <span
                className="ft-progress mt-3"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={foundingSpots}
                aria-valuenow={taken}
                aria-label={copy.foundingLabel}
              >
                <span style={{ width: `${Math.max(2, (taken / foundingSpots) * 100)}%` }} />
              </span>
              <p className="mt-3 text-[14px] leading-[22px] text-ink-muted">{copy.foundingNote}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line px-7 sm:px-10 py-4 flex flex-wrap items-center gap-2 text-[14px] text-ink-muted">
        <Ticket className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
        {copy.promoHint}
        <Link href="/redeem" className="ft-link font-medium">
          {copy.promoCta}
        </Link>
      </div>
    </div>
  )
}
