import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AICoach.meta')
  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords') as string[],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: 'https://frame-train.vercel.app/docs/ai-training-guide',
      type: 'article',
    },
    alternates: {
      canonical: 'https://frame-train.vercel.app/docs/ai-training-guide',
    },
  }
}

export default function AITrainingGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
