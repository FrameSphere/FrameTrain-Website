import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fine-Tuning Methoden – LoRA, QLoRA, Full Fine-Tuning, PEFT erklärt | FrameTrain',
  description: 'Full Fine-Tuning, LoRA (Low-Rank Adaptation) mit Architektur-Diagramm, QLoRA 4-bit Training, PEFT-Methoden im Vergleich und Entscheidungsbaum: Wann welche Methode?',
  keywords: ['LoRA Fine-Tuning erklärt', 'QLoRA 4-bit Training', 'Full Fine-Tuning LLM', 'PEFT Parameter Efficient Fine-Tuning', 'Low-Rank Adaptation', 'LoRA Rank Alpha Target Modules', 'Fine-Tuning Methoden Vergleich', 'LLaMA Mistral LoRA', 'NF4 Quantisierung'],
  openGraph: {
    title: 'Fine-Tuning Methoden – LoRA, QLoRA, Full Fine-Tuning, PEFT | FrameTrain',
    description: 'LoRA, QLoRA, Full Fine-Tuning und PEFT-Methoden erklärt – mit Diagramm und Entscheidungsbaum.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/fine-tuning',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/fine-tuning' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
