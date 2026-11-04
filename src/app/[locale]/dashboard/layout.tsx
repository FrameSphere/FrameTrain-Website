import type { Metadata } from 'next'
import { utilityMetadata } from '@/lib/seo'

// Die Page ist eine Client-Komponente und kann keine Metadata exportieren –
// ohne dieses Layout erbt sie Titel, Canonical und OpenGraph der Startseite.
// noindex: persönlicher Bereich hinter Login.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'dashboard', '/dashboard')
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
