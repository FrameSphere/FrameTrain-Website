import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Cookie } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'
import { pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Cookies' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/cookies'),
  }
}

type CookieItem = { name: string; purpose: string; duration: string; type: string }

export default function CookiesPage() {
  const t = useTranslations('Cookies')
  const locale = useLocale()

  const s2items = t.raw('s2.items') as CookieItem[]

  return (
    <div className="min-h-screen flex flex-col bg-bg ">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-ghost-fill border border-line rounded-lg flex items-center justify-center flex-shrink-0">
              <Cookie className="w-7 h-7 text-ink" />
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
              <h2 className="text-xl font-semibold text-ink mb-3">{t('s1.heading')}</h2>
              <p className="text-sm">{t('s1.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('s2.heading')}</h2>
              <p className="mb-4 text-sm">{t('s2.intro')}</p>

              {/* Mobile: stacked cards */}
              <div className="space-y-3 text-sm sm:hidden">
                {s2items.map((item) => (
                  <div key={item.name} className="bg-surface border border-line border border-line rounded-md px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-ink font-semibold font-mono text-xs">{item.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-indigo-text border border-line rounded-full px-2 py-0.5">{item.type}</span>
                    </div>
                    <p className="text-ink-muted text-xs mb-1">{item.purpose}</p>
                    <p className="text-ink-faint text-xs">{t('s2.columns.duration')}: {item.duration}</p>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-hidden rounded-md border border-line">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-ghost-fill text-ink-muted text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 font-semibold">{t('s2.columns.name')}</th>
                      <th className="px-4 py-3 font-semibold">{t('s2.columns.purpose')}</th>
                      <th className="px-4 py-3 font-semibold">{t('s2.columns.duration')}</th>
                      <th className="px-4 py-3 font-semibold">{t('s2.columns.type')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s2items.map((item, i) => (
                      <tr key={item.name} className={i % 2 === 0 ? 'bg-ghost-fill' : ''}>
                        <td className="px-4 py-3 font-mono text-ink text-xs whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-3 text-ink-muted">{item.purpose}</td>
                        <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{item.duration}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] uppercase tracking-wide text-indigo-text border border-line rounded-full px-2 py-0.5">{item.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('s3.heading')}</h2>
              <p className="text-sm">{t('s3.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('s4.heading')}</h2>
              <p className="text-sm">{t('s4.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('s5.heading')}</h2>
              <p className="text-sm">{t('s5.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('s6.heading')}</h2>
              <p className="text-sm">
                {t.rich('s6.text', {
                  link: (chunks) => <a href="mailto:framesphere@gmx.net" className="text-indigo-text hover:text-indigo-text">{chunks}</a>,
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
