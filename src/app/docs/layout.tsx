import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dokumentation – Installation, Training, LoRA & GPU-Setup | FrameTrain',
  description:
    'Komplette FrameTrain-Dokumentation: Installation, Quick Start, Model Manager, Dataset-Formate, LoRA-Training, Hyperparameter, GPU-Setup, Export und Troubleshooting.',
  alternates: {
    canonical: 'https://frame-train.vercel.app/docs',
  },
  openGraph: {
    title: 'Dokumentation – FrameTrain',
    description:
      'Komplette FrameTrain-Dokumentation: Installation, Training, LoRA, GPU-Setup, Export und Troubleshooting.',
    url: 'https://frame-train.vercel.app/docs',
  },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
