import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Install' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/install'),
    openGraph: pageOpenGraph({
      locale,
      path: '/install',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
  }
}

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return children
}
