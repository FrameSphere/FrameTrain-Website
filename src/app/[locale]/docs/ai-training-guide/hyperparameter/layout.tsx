import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/hyperparameter'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Hyperparameter-Coaching – Learning Rate, Batch Size, AdamW, LR Scheduler | FrameTrain',
    description: 'Learning Rate (vertieft), LR Scheduler Strategien (Cosine Decay, Warmup), Batch Size und Gradient Accumulation, Optimizer-Vergleich AdamW vs SGD, Regularisierung.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Hyperparameter-Coaching – Learning Rate, Batch Size, Optimizer | FrameTrain',
      description: 'Learning Rate, LR Scheduler, Batch Size, Gradient Accumulation, AdamW und Regularisierung – vollständig erklärt.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
