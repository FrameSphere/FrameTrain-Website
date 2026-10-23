import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { UnsubscribeForm } from './UnsubscribeForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Unsubscribe' })
  // Persönlicher Link – gehört nicht in den Suchindex
  return { title: t('metaTitle'), robots: { index: false, follow: false } }
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="ft-container py-16 sm:py-24">
        <Suspense>
          <UnsubscribeForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
