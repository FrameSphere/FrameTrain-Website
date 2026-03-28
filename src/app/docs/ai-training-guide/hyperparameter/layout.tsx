import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hyperparameter-Coaching – Learning Rate, Batch Size, AdamW, LR Scheduler | FrameTrain',
  description: 'Learning Rate (vertieft), LR Scheduler Strategien (Cosine Decay, Warmup), Batch Size und Gradient Accumulation, Optimizer-Vergleich AdamW vs SGD, Regularisierung.',
  keywords: ['Learning Rate Fine-Tuning', 'LR Scheduler Cosine Decay Warmup', 'Batch Size GPU Speicher', 'Gradient Accumulation', 'AdamW vs SGD Optimizer', 'Weight Decay Regularisierung', 'Hyperparameter Tuning LLM', 'Linear Scaling Rule'],
  openGraph: {
    title: 'Hyperparameter-Coaching – Learning Rate, Batch Size, Optimizer | FrameTrain',
    description: 'Learning Rate, LR Scheduler, Batch Size, Gradient Accumulation, AdamW und Regularisierung – vollständig erklärt.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/hyperparameter',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/hyperparameter' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
