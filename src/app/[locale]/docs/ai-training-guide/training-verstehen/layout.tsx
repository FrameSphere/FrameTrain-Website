import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/training-verstehen'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Training verstehen – Loss-Funktionen, Metriken, Train/Val/Test Split | FrameTrain',
    description: 'Der Trainings-Loop Schritt für Schritt, Loss-Funktionen (Cross-Entropy, MSE), Metriken wie Accuracy, F1, Perplexity, und warum du deinen Datensatz aufteilen musst.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Training verstehen – Loss-Funktionen, Metriken, Train/Val/Test Split | FrameTrain',
      description: 'Trainings-Loop, Loss-Funktionen, Accuracy/F1/Perplexity und Dataset-Split verständlich erklärt.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
