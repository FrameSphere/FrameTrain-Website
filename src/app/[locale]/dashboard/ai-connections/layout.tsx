import type { Metadata } from 'next'
import { utilityMetadata } from '@/lib/seo'

// noindex: persoenlicher Bereich hinter Login.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'aiConnections', '/dashboard/ai-connections')
}

export default function AiConnectionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
