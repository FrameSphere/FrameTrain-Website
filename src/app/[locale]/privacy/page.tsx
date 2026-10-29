import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'
import { pageAlternates } from '@/lib/seo'
import { LegalSections, type LegalSection } from '@/components/legal/LegalSections'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Privacy' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/privacy'),
  }
}

export default function PrivacyPage() {
  const t = useTranslations('Privacy')
  const locale = useLocale()

  const sections = t.raw('sections') as LegalSection[]

  return (
    <div className="min-h-screen flex flex-col bg-bg ">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-ghost-fill border border-line rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-ink" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-ink">{t('heading')}</h1>
              <p className="text-ink-muted text-sm mt-1">{t('lastUpdated')}</p>
            </div>
          </div>

          {locale === 'en' && (
            <div className="mb-8 px-5 py-3 rounded-md bg-ghost-fill border border-line text-warning text-sm">
              {t('courtesyNote')}
            </div>
          )}

          <div className="bg-surface border border-line rounded-lg p-8 md:p-12 border border-line space-y-10 text-ink leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('controller.heading')}</h2>
              <p>{t('controller.intro')}</p>
              <div className="mt-3 bg-surface border border-line rounded-md px-5 py-4 text-sm">
                <p className="text-ink font-semibold">{t('controller.name')}</p>
                <p>{t('controller.street')}</p>
                <p>{t('controller.city')}</p>
                <p>{t('controller.emailLabel')} <a href="mailto:framesphere@gmx.net" className="text-indigo-text hover:text-indigo-text">framesphere@gmx.net</a></p>
              </div>
            </section>

            <LegalSections sections={sections} />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
