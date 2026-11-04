import type { Metadata } from 'next'
import { utilityMetadata } from '@/lib/seo'

// Die Page ist eine Client-Komponente und kann keine Metadata exportieren –
// ohne dieses Layout würde sie das Startseiten-Canonical aus dem Root-Layout erben.
// noindex: Gutschein-Einlöseseite hinter Login, kein öffentlicher Content
// (follow:true, damit der Linkgraph zu Impressum/Datenschutz erhalten bleibt).
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'redeem', '/redeem')
}

export default function RedeemLayout({ children }: { children: React.ReactNode }) {
  return children
}
