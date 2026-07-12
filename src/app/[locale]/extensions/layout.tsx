import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'

// Die Page ist eine Client-Komponente und kann keine Metadata exportieren –
// ohne dieses Layout würde sie das Startseiten-Canonical aus dem Root-Layout erben.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: pageAlternates(locale, '/extensions') }
}

export default function ExtensionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
