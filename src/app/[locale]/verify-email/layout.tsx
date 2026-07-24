import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'

// Transaktionale Bestätigungsseite: korrektes Canonical + noindex, damit sie
// nicht mit dem Startseiten-Canonical aus dem Root-Layout in den Index läuft.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    alternates: pageAlternates(locale, '/verify-email'),
    robots: { index: false, follow: true },
  }
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
