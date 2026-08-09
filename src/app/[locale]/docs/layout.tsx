import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Docs' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/docs'),
    openGraph: pageOpenGraph({
      locale,
      path: '/docs',
      title: t('metaTitle'),
      description: t('metaDescription'),
    }),
  }
}

// Hinweis: KEIN JSON-LD in diesem Layout. Ein Layout umschließt in Next.js auch
// alle Kind-Segmente (/docs/ai-training-guide + Kapitel) – hier gesetzte
// strukturierte Daten würden dort doppelte/konkurrierende BreadcrumbLists
// erzeugen. Das CollectionPage-Schema liegt daher in docs/page.tsx (Index-Seite).
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
