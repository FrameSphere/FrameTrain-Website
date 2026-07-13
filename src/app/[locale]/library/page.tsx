import type { Metadata } from 'next'
import { LibraryPageClient } from './LibraryPageClient'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl as baseUrl } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Library' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/library'),
    openGraph: pageOpenGraph({
      locale,
      path: '/library',
      title: t('ogTitle'),
      description: t('ogDescription'),
    }),
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('twitterDescription'),
      creator: '@FrameTrainApp',
    },
    // Noindex bis die Library nur verifizierten Content zeigt (SEO-Audit
    // 13.07.2026: Test-Einträge wie "döner"/"test" waren öffentlich indexierbar).
    // TODO: auf index:true zurückstellen, sobald Test-Skripte aus der DB entfernt sind.
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
  }
}

async function getInitialScripts() {
  try {
    const scripts = await prisma.libraryScript.findMany({
      orderBy: [{ verified: 'desc' }, { downloads: 'desc' }],
      take: 50,
      select: {
        id: true,
        name: true,
        description: true,
        author: true,
        model_type: true,
        task_type: true,
        framework: true,
        script_type: true,
        verified: true,
        downloads: true,
        stars: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return scripts.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      author: s.author,
      model_type: s.model_type,
      task_type: s.task_type,
      framework: s.framework,
      script_type: s.script_type ?? 'train',
      verified: s.verified,
      downloads: s.downloads,
      stars: s.stars,
      tags: s.tags,
      script: '',
      created_at: s.createdAt.toISOString(),
      updated_at: s.updatedAt.toISOString(),
    }))
  } catch {
    return []
  }
}

export default async function LibraryPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Library' })
  const initialScripts = await getInitialScripts()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/${locale}/library`,
        url: `${baseUrl}/${locale}/library`,
        name: t('jsonLdName'),
        description: t('jsonLdDescription'),
        isPartOf: { '@id': baseUrl },
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/${locale}` },
            { '@type': 'ListItem', position: 2, name: t('breadcrumbName'), item: `${baseUrl}/${locale}/library` },
          ],
        },
      },
      ...(initialScripts.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: t('jsonLdName'),
              description: t('jsonLdItemListDesc'),
              numberOfItems: initialScripts.length,
              itemListElement: initialScripts.slice(0, 20).map((s, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'SoftwareSourceCode',
                  name: s.name,
                  description: s.description,
                  programmingLanguage: 'Python',
                  runtimePlatform: s.framework,
                  author: { '@type': 'Person', name: s.author },
                  keywords: Array.isArray(s.tags) ? s.tags.join(', ') : '',
                },
              })),
            },
          ]
        : []),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none" />
        <Header />
        <main className="flex-1 relative">
          <LibraryPageClient initialScripts={initialScripts} />
        </main>
        <Footer />
      </div>
    </>
  )
}
