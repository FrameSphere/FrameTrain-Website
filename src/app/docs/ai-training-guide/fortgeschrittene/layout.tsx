import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fortgeschrittene ML-Techniken – Mixed Precision, Gradient Checkpointing, Ensembles | FrameTrain',
  description: 'Mixed Precision Training mit bf16/fp16, Gradient Checkpointing für weniger VRAM, Early Stopping optimal nutzen und Model Ensembles für bessere Performance.',
  keywords: ['Mixed Precision Training bf16', 'Gradient Checkpointing VRAM sparen', 'Early Stopping LLM Training', 'Model Ensembles', 'bfloat16 Training', 'fp16 fp32 Vergleich', 'Speicher sparen GPU Training', 'fortgeschrittene ML Techniken LLM'],
  openGraph: {
    title: 'Fortgeschrittene ML-Techniken – Mixed Precision, Gradient Checkpointing | FrameTrain',
    description: 'Mixed Precision (bf16/fp16), Gradient Checkpointing, Early Stopping und Model Ensembles für professionelles ML-Training.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/fortgeschrittene',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/fortgeschrittene' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
