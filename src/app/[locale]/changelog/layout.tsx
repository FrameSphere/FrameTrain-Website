import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Changelog' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `https://frame-train.vercel.app/${locale}/changelog` },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `https://frame-train.vercel.app/${locale}/changelog`,
    },
  }
}

export default function ChangelogLayout({ children }: Props) {
  return children
}
