import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'

// Post-Login-Zwischenseite: korrektes Canonical + noindex, damit sie nicht
// mit dem Startseiten-Canonical aus dem Root-Layout in den Index läuft.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    alternates: pageAlternates(locale, '/sso-welcome'),
    robots: { index: false, follow: true },
  }
}

export default function SsoWelcomeLayout({ children }: { children: React.ReactNode }) {
  return children
}
