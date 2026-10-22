import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Info } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'
import { pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Imprint' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/imprint'),
  }
}

export default function ImprintPage() {
  const t = useTranslations('Imprint')
  const locale = useLocale()

  return (
    <div className="min-h-screen flex flex-col bg-bg ">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-ghost-fill border border-line rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-7 h-7 text-ink" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-ink">{t('heading')}</h1>
              <p className="text-ink-muted text-sm mt-1">{t('subtitle')}</p>
            </div>
          </div>

          {locale === 'en' && (
            <div className="mb-8 px-5 py-3 rounded-md bg-ghost-fill border border-line text-warning text-sm">
              {t('courtesyNote')}
            </div>
          )}

          <div className="bg-surface border border-line rounded-lg p-8 md:p-12 border border-line space-y-8 text-ink leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-ink mb-4">{t('provider.heading')}</h2>
              <div className="bg-surface border border-line border border-line rounded-md px-6 py-5 space-y-1 text-sm">
                <p className="text-ink font-semibold text-base">{t('provider.name')}</p>
                <p>{t('provider.location')}</p>
                <p>{t('provider.country')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-4">{t('contact.heading')}</h2>
              <div className="bg-surface border border-line border border-line rounded-md px-6 py-5 space-y-2 text-sm">
                <p>
                  {t('contact.emailLabel')}{' '}
                  <a href="mailto:framesphere@gmx.net" className="text-indigo-text hover:text-indigo-text">
                    framesphere@gmx.net
                  </a>
                </p>
                <p>
                  {t('contact.websiteLabel')}{' '}
                  <a href="https://frame-train.com" className="text-indigo-text hover:text-indigo-text">
                    frame-train.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-4">{t('responsible.heading')}</h2>
              <div className="text-sm">
                <p>{t('responsible.text')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-4">{t('disclaimer.heading')}</h2>
              <div className="space-y-4 text-sm text-ink-muted">
                <div>
                  <p className="text-ink font-semibold mb-1">{t('disclaimer.content.title')}</p>
                  <p>{t('disclaimer.content.text')}</p>
                </div>
                <div>
                  <p className="text-ink font-semibold mb-1">{t('disclaimer.links.title')}</p>
                  <p>{t('disclaimer.links.text')}</p>
                </div>
                <div>
                  <p className="text-ink font-semibold mb-1">{t('disclaimer.copyright.title')}</p>
                  <p>{t('disclaimer.copyright.text')}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-4">{t('dispute.heading')}</h2>
              <p className="text-sm text-ink-muted">
                {t.rich('dispute.text', {
                  link: (chunks) => (
                    <a
                      href="https://ec.europa.eu/consumers/odr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-text hover:text-indigo-text"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
