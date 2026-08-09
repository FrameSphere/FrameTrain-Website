import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

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

export default async function InstallLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Install' })
  const pageUrl = `${siteUrl}/${locale}/install`

  // TechArticle statt HowTo: Googles HowTo-Rich-Results wurden 09/2023 abgeschaltet;
  // TechArticle passt zu einer plattformübergreifenden Installationsanleitung und
  // wird weiterhin ausgewertet.
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
        '@type': 'TechArticle',
        headline: t('metaTitle'),
        description: t('metaDescription'),
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        image: `${siteUrl}/og-image.png`,
        author: { '@type': 'Organization', name: 'FrameTrain', url: siteUrl },
        publisher: {
          '@type': 'Organization',
          name: 'FrameTrain',
          logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.svg` },
        },
        mainEntityOfPage: pageUrl,
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
