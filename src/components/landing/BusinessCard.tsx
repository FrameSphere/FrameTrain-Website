'use client'

import { Check } from 'lucide-react'
import { trackEvent } from '@/lib/events'
import { SUPPORT_EMAIL } from '@/lib/support'

export type BusinessCopy = {
  planName: string
  audience: string
  price: string
  perMonth: string
  billing: string
  features: string[]
  cta: string
  ctaNote: string
  mailSubject: string
  mailBody: string
}

/**
 * Business-Tarif für Firmen mit mehreren Nutzern. Bewusst kein Checkout:
 * Anfrage per Mail, Lizenzschlüssel und Rechnung werden von Hand vergeben.
 * Nur Leistungen aufführen, die es wirklich gibt – die kommerzielle Nutzung
 * ist schon im normalen Plan erlaubt (AGB) und gehört deshalb nicht hierher.
 */
export function BusinessCard({ copy }: { copy: BusinessCopy }) {
  const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(copy.mailSubject)}&body=${encodeURIComponent(copy.mailBody)}`

  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-7 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="ft-label">{copy.planName}</span>
          <p className="mt-2 text-[16px] leading-6 text-ink-muted">{copy.audience}</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="ft-stat !text-[44px] sm:!text-[48px]">{copy.price}</span>
            <span className="text-[17px] text-ink-muted">{copy.perMonth}</span>
          </div>
          <p className="mt-2 ft-data text-ink-faint">{copy.billing}</p>
          <div className="mt-6">
            <a
              href={href}
              onClick={() => trackEvent('business_inquiry', { from: 'pricing' })}
              className="ft-btn ft-btn--primary"
            >
              {copy.cta}
            </a>
          </div>
          <p className="mt-4 ft-data text-ink-muted">{copy.ctaNote}</p>
        </div>

        <ul className="flex flex-col gap-3.5">
          {copy.features.map((f) => (
            <li key={f} className="flex gap-3 text-[16px] leading-6 text-ink">
              <Check className="w-[18px] h-[18px] mt-[3px] flex-none text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
