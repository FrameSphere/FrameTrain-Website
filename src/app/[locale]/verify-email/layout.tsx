import type { Metadata } from 'next'
import { utilityMetadata } from '@/lib/seo'

// Transaktionale Bestätigungsseite: korrektes Canonical + noindex, damit sie
// nicht mit dem Startseiten-Canonical aus dem Root-Layout in den Index läuft.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'verifyEmail', '/verify-email')
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
