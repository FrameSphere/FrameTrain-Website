import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { pageAlternates } from '@/lib/seo'
import { DeclarationForm } from '@/components/legal/DeclarationForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Declaration' })
  return {
    title: t('cancel.metaTitle'),
    alternates: pageAlternates(locale, '/cancel'),
    robots: { index: false, follow: true },
  }
}

// § 312k BGB: Kündigungsbutton „Verträge hier kündigen“ (Footer, ohne Login
// erreichbar) → diese Bestätigungsseite mit „Jetzt kündigen“.
export default function CancelPage() {
  const t = useTranslations('Declaration')
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-semibold text-ink">{t('cancel.heading')}</h1>
          <p className="text-ink-muted text-sm mt-3 mb-8">{t('cancel.intro')}</p>
          <DeclarationForm kind="cancel" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
