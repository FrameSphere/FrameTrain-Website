import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Installation – FrameTrain für macOS, Windows & Linux einrichten',
  description:
    'Schritt-für-Schritt-Anleitung zur Installation von FrameTrain auf macOS, Windows und Linux, inklusive Lösungen für Sicherheitswarnungen und Systemanforderungen.',
  alternates: {
    canonical: 'https://frame-train.vercel.app/install',
  },
  openGraph: {
    title: 'Installations-Anleitung – FrameTrain',
    description: 'So installierst du FrameTrain auf macOS, Windows und Linux.',
    url: 'https://frame-train.vercel.app/install',
  },
}

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return children
}
