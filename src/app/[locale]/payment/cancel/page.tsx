'use client'

import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function PaymentCancelPage() {
  const t = useTranslations('Payment.cancel')
  const infoItems = t.raw('infoItems') as string[]
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 ft-container py-12 md:py-20">
        <div className="max-w-[520px] mx-auto text-center">
          <p className="ft-label m-0 flex items-center justify-center gap-2">
            <span className="ft-dot !bg-ink-faint" aria-hidden="true" />
            Stripe
          </p>
          <h1 className="ft-display-l mt-4 mb-0">{t('heading')}</h1>
          <p className="ft-lead mt-4 mb-0">{t('subtitleLine1')}</p>
          <p className="mt-1 mb-0 text-[15px] text-ink-faint">{t('subtitleLine2')}</p>

          <div className="mt-10 rounded-xl border border-line bg-surface p-7 sm:p-9 text-left">
            <h2 className="ft-label m-0">{t('infoHeading')}</h2>
            <ul className="mt-4 p-0 list-none flex flex-col gap-2.5">
              {infoItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] text-ink">
                  <span className="w-1.5 h-1.5 rounded-pill bg-ink-faint flex-none" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/payment" className="ft-btn ft-btn--primary flex-1">
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                {t('retryButton')}
              </Link>
              <Link href="/dashboard" className="ft-btn ft-btn--ghost flex-1">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                {t('backToDashboard')}
              </Link>
            </div>

            <p className="mt-6 mb-0 flex items-center justify-center gap-2 text-[14px] text-ink-faint">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              <span>
                {t('supportText')}{' '}
                <Link href="/dashboard?support=open" className="ft-link">
                  {t('supportLink')}
                </Link>
              </span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
