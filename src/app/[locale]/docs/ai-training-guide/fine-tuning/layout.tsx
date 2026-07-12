import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/fine-tuning'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Fine-Tuning Methoden – LoRA, QLoRA, Full Fine-Tuning, PEFT erklärt | FrameTrain',
    description: 'Full Fine-Tuning, LoRA (Low-Rank Adaptation) mit Architektur-Diagramm, QLoRA 4-bit Training, PEFT-Methoden im Vergleich und Entscheidungsbaum: Wann welche Methode?',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Fine-Tuning Methoden – LoRA, QLoRA, Full Fine-Tuning, PEFT | FrameTrain',
      description: 'LoRA, QLoRA, Full Fine-Tuning und PEFT-Methoden erklärt – mit Diagramm und Entscheidungsbaum.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
