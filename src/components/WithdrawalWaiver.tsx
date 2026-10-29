'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

// Pflicht-Haken vor jedem Stripe-Checkout (§ 356 Abs. 5 BGB): ausdrückliches
// Verlangen des sofortigen Beginns + Kenntnis vom Verlust des Widerrufsrechts.
// Der Server lehnt den Checkout ohne withdrawalWaiver=true ab.
export function WithdrawalWaiver({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const t = useTranslations('Checkout')
  return (
    <div className="mt-6 flex flex-col gap-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 w-5 h-5 flex-shrink-0 accent-[var(--indigo-button)]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-[13px] leading-5 text-ink-muted">
          {t.rich('waiverLabel', {
            withdrawal: (chunks) => <Link href="/withdrawal" target="_blank" className="ft-link">{chunks}</Link>,
          })}
        </span>
      </label>
      <p className="m-0 text-[13px] leading-5 text-ink-faint">
        {t.rich('termsNote', {
          terms: (chunks) => <Link href="/terms" target="_blank" className="ft-link">{chunks}</Link>,
          privacy: (chunks) => <Link href="/privacy" target="_blank" className="ft-link">{chunks}</Link>,
        })}
      </p>
    </div>
  )
}
