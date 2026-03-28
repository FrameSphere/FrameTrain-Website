import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training verstehen – Loss-Funktionen, Metriken, Train/Val/Test Split | FrameTrain',
  description: 'Der Trainings-Loop Schritt für Schritt, Loss-Funktionen (Cross-Entropy, MSE), Metriken wie Accuracy, F1, Perplexity, und warum du deinen Datensatz aufteilen musst.',
  keywords: ['Trainings-Loop Machine Learning', 'Loss Funktion erklärt', 'Cross-Entropy Loss', 'Accuracy F1 Score Perplexity', 'Train Validation Test Split', 'Metriken ML Training', 'Overfitting erkennen Metriken', 'Gradient Accumulation Steps', 'Label Smoothing'],
  openGraph: {
    title: 'Training verstehen – Loss-Funktionen, Metriken, Train/Val/Test Split | FrameTrain',
    description: 'Trainings-Loop, Loss-Funktionen, Accuracy/F1/Perplexity und Dataset-Split verständlich erklärt.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/training-verstehen',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/training-verstehen' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
