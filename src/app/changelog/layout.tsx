import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog – Neue Features & Updates von FrameTrain',
  description:
    'Alle Releases, neuen Features und Bugfixes von FrameTrain: LoRA & QLoRA-Updates, GPU-Optimierungen, Mixed Precision Training und mehr.',
  alternates: {
    canonical: 'https://frame-train.vercel.app/changelog',
  },
  openGraph: {
    title: 'Changelog – FrameTrain',
    description: 'Alle Releases, neuen Features und Bugfixes von FrameTrain.',
    url: 'https://frame-train.vercel.app/changelog',
  },
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children
}
