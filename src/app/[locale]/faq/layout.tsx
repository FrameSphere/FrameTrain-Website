import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FAQ' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `https://frame-train.vercel.app/${locale}/faq` },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `https://frame-train.vercel.app/${locale}/faq`,
    },
  }
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
