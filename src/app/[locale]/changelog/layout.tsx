import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Changelog' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/changelog'),
    openGraph: pageOpenGraph({
      locale,
      path: '/changelog',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
  }
}

export default function ChangelogLayout({ children }: Props) {
  return children
}
