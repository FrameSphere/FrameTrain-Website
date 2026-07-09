import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diagnose & Fixes – Overfitting bekämpfen, LR-Probleme, Loss Spikes | FrameTrain',
  description: 'Konkrete Maßnahmen gegen Overfitting, Underfitting beheben, Learning Rate Probleme diagnostizieren und Loss Spikes durch Gradient Clipping eliminieren.',
  keywords: ['Overfitting bekämpfen Techniken', 'Underfitting beheben LLM', 'Learning Rate zu groß zu klein', 'Loss Spike beheben', 'Gradient Explosion Clipping', 'Early Stopping Patience', 'Dropout Regularisierung', 'Weight Decay Overfitting'],
  openGraph: {
    title: 'Diagnose & Fixes – Overfitting, LR-Probleme, Loss Spikes beheben | FrameTrain',
    description: 'Overfitting bekämpfen, Underfitting beheben, Loss Spikes stoppen – konkrete Lösungen für ML-Trainingsprobleme.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/diagnose',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/diagnose' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
