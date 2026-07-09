import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Info } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Imprint' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default function ImprintPage() {
  const t = useTranslations('Imprint')
  const locale = useLocale()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Info className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">{t('heading')}</h1>
              <p className="text-gray-400 text-sm mt-1">{t('subtitle')}</p>
            </div>
          </div>

          {locale === 'en' && (
            <div className="mb-8 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
              {t('courtesyNote')}
            </div>
          )}

          <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 space-y-8 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-4">{t('provider.heading')}</h2>
              <div className="glass border border-white/10 rounded-xl px-6 py-5 space-y-1 text-sm">
                <p className="text-white font-bold text-base">{t('provider.name')}</p>
                <p>{t('provider.location')}</p>
                <p>{t('provider.country')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">{t('contact.heading')}</h2>
              <div className="glass border border-white/10 rounded-xl px-6 py-5 space-y-2 text-sm">
                <p>
                  {t('contact.emailLabel')}{' '}
                  <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">
                    framesphere@gmx.net
                  </a>
                </p>
                <p>
                  {t('contact.websiteLabel')}{' '}
                  <a href="https://frametrain.vercel.app" className="text-violet-400 hover:text-violet-300">
                    frametrain.vercel.app
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">{t('responsible.heading')}</h2>
              <div className="text-sm">
                <p>{t('responsible.text')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">{t('disclaimer.heading')}</h2>
              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <p className="text-white font-semibold mb-1">{t('disclaimer.content.title')}</p>
                  <p>{t('disclaimer.content.text')}</p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">{t('disclaimer.links.title')}</p>
                  <p>{t('disclaimer.links.text')}</p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">{t('disclaimer.copyright.title')}</p>
                  <p>{t('disclaimer.copyright.text')}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">{t('dispute.heading')}</h2>
              <p className="text-sm text-gray-400">
                {t.rich('dispute.text', {
                  link: (chunks) => (
                    <a
                      href="https://ec.europa.eu/consumers/odr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300"
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
