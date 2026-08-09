import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'

// Die Page ist eine Client-Komponente und kann keine Metadata exportieren –
// ohne dieses Layout würde sie das Startseiten-Canonical aus dem Root-Layout erben.
// noindex: Der Marketplace ist noch ein "Coming Soon"-Platzhalter (siehe page.tsx).
// Bis echter Content existiert, gehört die Seite nicht in den Index (Thin Content)
// und bleibt bewusst aus der Sitemap. Bei Launch: noindex entfernen + in sitemap.ts.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    alternates: pageAlternates(locale, '/extensions'),
    robots: { index: false, follow: true },
  }
}

export default function ExtensionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
