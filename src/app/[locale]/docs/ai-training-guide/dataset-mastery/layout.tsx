import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/dataset-mastery'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Dataset-Mastery – Datenqualität, Preprocessing, Augmentation, Balancing | FrameTrain',
    description: 'Wie viele Trainingsdaten brauche ich? Datenqualitäts-Checkliste, Text-Preprocessing-Pipeline, Data Augmentation Techniken und Klassen-Balancing für ML.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Dataset-Mastery – Datenqualität, Preprocessing, Augmentation | FrameTrain',
      description: 'Datenqualität, Preprocessing, Augmentation und Klassen-Balancing für erfolgreiches ML-Training.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
