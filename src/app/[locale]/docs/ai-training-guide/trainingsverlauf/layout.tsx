import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trainingsverlauf lesen – Loss-Kurven, Overfitting & Underfitting erkennen | FrameTrain',
  description: 'Loss-Kurven interpretieren, Overfitting und Underfitting erkennen, instabiles Training diagnostizieren – mit interaktiven SVG-Diagrammen und klaren Erklärungen.',
  keywords: ['Loss Kurven interpretieren', 'Overfitting erkennen Diagramm', 'Underfitting erkennen', 'Training Validation Loss Gap', 'instabiles Training Loss Spike', 'Trainingsverlauf analysieren', 'ML Monitoring', 'Loss Kurve flacht ab'],
  openGraph: {
    title: 'Trainingsverlauf lesen – Loss-Kurven, Overfitting & Underfitting | FrameTrain',
    description: 'Loss-Kurven interpretieren, Overfitting und Underfitting diagnostizieren mit interaktiven Diagrammen.',
    url: 'https://frame-train.vercel.app/docs/ai-training-guide/trainingsverlauf',
    type: 'article',
  },
  alternates: { canonical: 'https://frame-train.vercel.app/docs/ai-training-guide/trainingsverlauf' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
