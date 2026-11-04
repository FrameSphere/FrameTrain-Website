import type { Metadata } from 'next'
import { utilityMetadata } from '@/lib/seo'

// Die Page ist eine Client-Komponente und kann keine Metadata exportieren –
// ohne dieses Layout würde sie das Startseiten-Canonical aus dem Root-Layout erben.
// noindex: reine Auth-Seite ohne öffentlichen Content, gehört nicht in den Index
// (follow:true, damit der Linkgraph zu Impressum/Datenschutz erhalten bleibt).
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'register', '/register')
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
