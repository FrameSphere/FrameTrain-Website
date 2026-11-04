import type { Metadata } from 'next'
import { utilityMetadata } from '@/lib/seo'

// Die Page ist eine Client-Komponente und kann keine Metadata exportieren –
// ohne dieses Layout erbt sie Titel, Canonical und OpenGraph der Startseite.
// noindex: Checkout-Schritt hinter Login.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'payment', '/payment')
}

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children
}
