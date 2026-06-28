import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download – FrameTrain für macOS, Windows & Linux',
  description:
    'Lade FrameTrain für macOS, Windows oder Linux herunter und starte lokales LLM-Fine-Tuning mit LoRA und QLoRA auf deiner eigenen GPU.',
  alternates: {
    canonical: 'https://frame-train.vercel.app/download',
  },
  openGraph: {
    title: 'Download – FrameTrain',
    description: 'Lade FrameTrain für macOS, Windows oder Linux herunter.',
    url: 'https://frame-train.vercel.app/download',
  },
}

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children
}
