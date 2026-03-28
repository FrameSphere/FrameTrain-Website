import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KI-Training Coach – Der ultimative LLM Fine-Tuning Guide | FrameTrain Docs',
  description: 'Der komplette Guide für KI-Training und LLM Fine-Tuning: ML Grundlagen, Loss-Kurven lesen, Overfitting beheben, LoRA & QLoRA, Hyperparameter-Tuning, Dataset-Vorbereitung – alles erklärt.',
  keywords: [
    'KI Training Guide', 'LLM Fine-Tuning Guide', 'Machine Learning Grundlagen',
    'LoRA Fine-Tuning erklärt', 'QLoRA Training', 'Loss Kurven interpretieren',
    'Overfitting beheben', 'Underfitting', 'Learning Rate', 'Batch Size',
    'Hyperparameter Tuning', 'Training Coach', 'Neural Network Training',
    'Transformer Architektur', 'Gradient Descent', 'Backpropagation',
    'Neuronale Netzwerke', 'ML Training Dokumentation', 'FrameTrain Docs',
  ],
  openGraph: {
    title: 'KI-Training Coach – Der ultimative LLM Fine-Tuning Guide | FrameTrain',
    description: 'ML Grundlagen, Loss-Kurven lesen, Overfitting & Underfitting, LoRA/QLoRA, Hyperparameter, Datasets – der komplette Guide für erfolgreiches KI-Training.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide',
    type: 'article',
  },
  alternates: {
    canonical: 'https://frame-train.vercel.app/docs/ai-training-guide',
  },
}

export default function AITrainingGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
