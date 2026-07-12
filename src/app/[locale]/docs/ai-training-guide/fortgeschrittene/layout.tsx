import type { Metadata } from 'next'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

const path = '/docs/ai-training-guide/fortgeschrittene'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Fortgeschrittene ML-Techniken – Mixed Precision, Gradient Checkpointing, Ensembles | FrameTrain',
    description: 'Mixed Precision Training mit bf16/fp16, Gradient Checkpointing für weniger VRAM, Early Stopping optimal nutzen und Model Ensembles für bessere Performance.',
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({
      locale,
      path,
      title: 'Fortgeschrittene ML-Techniken – Mixed Precision, Gradient Checkpointing | FrameTrain',
      description: 'Mixed Precision (bf16/fp16), Gradient Checkpointing, Early Stopping und Model Ensembles für professionelles ML-Training.',
      type: 'article',
    }),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
