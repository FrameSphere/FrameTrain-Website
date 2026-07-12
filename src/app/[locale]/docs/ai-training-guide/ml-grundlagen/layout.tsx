import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/ml-grundlagen'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'ML Grundlagen – Machine Learning, Neuronale Netze, Transformer erklärt | FrameTrain',
    description: 'Was ist Machine Learning? Neuronale Netzwerke, Transformer-Architektur, LLMs, Backpropagation und Gradient Descent – vollständig und verständlich erklärt für KI-Training.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'ML Grundlagen – Machine Learning, Neuronale Netze, Transformer | FrameTrain',
      description: 'Was ist Machine Learning? Neuronale Netzwerke, Transformer, Backpropagation und Gradient Descent verständlich erklärt.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
