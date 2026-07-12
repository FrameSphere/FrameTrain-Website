import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/diagnose'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Diagnose & Fixes – Overfitting bekämpfen, LR-Probleme, Loss Spikes | FrameTrain',
    description: 'Konkrete Maßnahmen gegen Overfitting, Underfitting beheben, Learning Rate Probleme diagnostizieren und Loss Spikes durch Gradient Clipping eliminieren.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Diagnose & Fixes – Overfitting, LR-Probleme, Loss Spikes beheben | FrameTrain',
      description: 'Overfitting bekämpfen, Underfitting beheben, Loss Spikes stoppen – konkrete Lösungen für ML-Trainingsprobleme.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
