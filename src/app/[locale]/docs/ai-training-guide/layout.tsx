import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AICoach.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
    }),
  }
}

export default function AITrainingGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
