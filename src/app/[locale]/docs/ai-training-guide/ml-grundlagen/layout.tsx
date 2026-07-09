import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ML Grundlagen – Machine Learning, Neuronale Netze, Transformer erklärt | FrameTrain',
  description: 'Was ist Machine Learning? Neuronale Netzwerke, Transformer-Architektur, LLMs, Backpropagation und Gradient Descent – vollständig und verständlich erklärt für KI-Training.',
  keywords: ['Machine Learning Grundlagen', 'Neuronale Netzwerke erklärt', 'Transformer Architektur', 'LLM Grundlagen', 'Backpropagation erklärt', 'Gradient Descent', 'was ist Machine Learning', 'KI lernen Grundlagen', 'Supervised Learning', 'Deep Learning Grundlagen', 'Aktivierungsfunktionen', 'BERT LLaMA Mistral erklärt'],
  openGraph: {
    title: 'ML Grundlagen – Machine Learning, Neuronale Netze, Transformer | FrameTrain',
    description: 'Was ist Machine Learning? Neuronale Netzwerke, Transformer, Backpropagation und Gradient Descent verständlich erklärt.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/ml-grundlagen',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/ml-grundlagen' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
