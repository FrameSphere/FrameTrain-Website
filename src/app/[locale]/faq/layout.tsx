import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FAQ' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/faq'),
    openGraph: pageOpenGraph({
      locale,
      path: '/faq',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
  }
}

export default async function FAQLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FAQ' })
  const categories = t.raw('categories') as Record<string, { faqs: { q: string; a: string }[] }>
  // Special-Antworten (Tabellen/Code-Blöcke) haben Marker-Strings ("__..._TABLE__")
  // statt echtem Text – die lassen wir aus dem strukturierten Daten-Schema raus.
  const faqItems = Object.values(categories)
    .flatMap((c) => c.faqs)
    .filter((f) => !f.a.startsWith('__'))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
