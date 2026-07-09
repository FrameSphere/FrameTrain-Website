import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dataset-Mastery – Datenqualität, Preprocessing, Augmentation, Balancing | FrameTrain',
  description: 'Wie viele Trainingsdaten brauche ich? Datenqualitäts-Checkliste, Text-Preprocessing-Pipeline, Data Augmentation Techniken und Klassen-Balancing für ML.',
  keywords: ['Dataset vorbereiten Machine Learning', 'Datenqualität ML Training', 'Text Preprocessing Pipeline', 'Data Augmentation NLP', 'Klassen-Balancing Oversampling Undersampling', 'Tokenisierung LLM', 'Dataset Format CSV JSON', 'wie viel Daten Fine-Tuning'],
  openGraph: {
    title: 'Dataset-Mastery – Datenqualität, Preprocessing, Augmentation | FrameTrain',
    description: 'Datenqualität, Preprocessing, Augmentation und Klassen-Balancing für erfolgreiches ML-Training.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/dataset-mastery',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/dataset-mastery' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
