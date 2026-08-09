import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Download' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/download'),
    openGraph: pageOpenGraph({
      locale,
      path: '/download',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
  }
}

export default async function DownloadLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Download' })
  const pageUrl = `${siteUrl}/${locale}/download`

  // SoftwareApplication auf der eigentlichen Download-Seite (die Startseite trägt
  // dasselbe Schema für den Marken-Kontext). BreadcrumbList verankert die Seite
  // in der Site-Hierarchie.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t('metaTitle'), item: pageUrl },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'FrameTrain',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        description: t('metaDescription'),
        url: pageUrl,
        offers: {
          '@type': 'Offer',
          price: '4.99',
          priceCurrency: 'EUR',
        },
      },
    ],
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
