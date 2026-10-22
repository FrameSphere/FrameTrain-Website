import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ChannelPage, channelMetadata } from '@/components/marketing/ChannelPage'

// Code und Rücklink pflegen: src/lib/channels.ts
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return channelMetadata(locale, 'instagram')
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ChannelPage locale={locale} channel="instagram" />
}
