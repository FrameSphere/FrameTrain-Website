import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ – Häufige Fragen zu FrameTrain (Preis, GPU, DSGVO, Training)',
  description:
    'Antworten zu FrameTrain: Preis & Abo, GPU/VRAM-Anforderungen, LoRA & QLoRA, Datensatz-Formate, DSGVO-Konformität, Modell-Export und Installation.',
  alternates: {
    canonical: 'https://frame-train.vercel.app/faq',
  },
  openGraph: {
    title: 'FAQ – FrameTrain',
    description: 'Häufige Fragen zu FrameTrain: Preis, GPU, DSGVO, Training und mehr.',
    url: 'https://frame-train.vercel.app/faq',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
