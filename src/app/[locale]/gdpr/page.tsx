import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { MarketingPage, marketingMetadata } from '@/components/marketing/MarketingPage'

// Inhalt: messages/<locale>.json → "PageGdpr"
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return marketingMetadata(locale, 'PageGdpr', '/gdpr')
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <MarketingPage locale={locale} ns="PageGdpr" path="/gdpr" />
}
