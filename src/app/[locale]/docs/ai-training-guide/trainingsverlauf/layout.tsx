import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/trainingsverlauf'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Trainingsverlauf lesen – Loss-Kurven, Overfitting & Underfitting erkennen | FrameTrain',
    description: 'Loss-Kurven interpretieren, Overfitting und Underfitting erkennen, instabiles Training diagnostizieren – mit interaktiven SVG-Diagrammen und klaren Erklärungen.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Trainingsverlauf lesen – Loss-Kurven, Overfitting & Underfitting | FrameTrain',
      description: 'Loss-Kurven interpretieren, Overfitting und Underfitting diagnostizieren mit interaktiven Diagrammen.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
