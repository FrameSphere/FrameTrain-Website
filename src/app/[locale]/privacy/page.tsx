import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'
import { pageAlternates } from '@/lib/seo'
import { Link } from '@/i18n/navigation'

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

type ItemWithDesc = { name: string; desc: string }
type ThirdParty = { name: string; role: string; privacy: string }

export default function PrivacyPage() {
  const t = useTranslations('Privacy')
  const locale = useLocale()

  const s2items = t.raw('s2.items') as ItemWithDesc[]
  const s3items = t.raw('s3.items') as string[]
  const s4items = t.raw('s4.items') as string[]
  const s4excluded = t.raw('s4.excludedItems') as string[]
  const s5items = t.raw('s5.items') as ThirdParty[]
  const s6items = t.raw('s6.items') as string[]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">{t('heading')}</h1>
              <p className="text-gray-400 text-sm mt-1">{t('lastUpdated')}</p>
            </div>
          </div>

          {locale === 'en' && (
            <div className="mb-8 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
              {t('courtesyNote')}
            </div>
          )}

          <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 space-y-10 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s1.heading')}</h2>
              <p>{t('s1.intro')}</p>
              <div className="mt-3 glass border border-white/10 rounded-xl px-5 py-4 text-sm">
                <p className="text-white font-semibold">{t('s1.name')}</p>
                <p>{t('s1.location')}</p>
                <p>{t('s1.emailLabel')} <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">framesphere@gmx.net</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s2.heading')}</h2>
              <p className="mb-4">{t('s2.intro')}</p>
              <ul className="space-y-2 text-sm list-none">
                {s2items.map((item) => (
                  <li key={item.name} className="flex gap-3">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span><span className="text-white font-semibold">{item.name}:</span> {item.desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s3.heading')}</h2>
              <p className="mb-3">{t('s3.intro')}</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
                {s3items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s4.heading')}</h2>
              <p className="mb-3">{t('s4.intro')}</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400 mb-4">
                {s4items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="text-sm font-semibold text-white mb-2">{t('s4.excludedLabel')}</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400 mb-4">
                {s4excluded.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="text-sm mb-3">{t('s4.consentText')}</p>
              <p className="text-sm">{t('s4.purposeText')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s5.heading')}</h2>
              <div className="space-y-3 text-sm">
                {s5items.map((tp) => (
                  <div key={tp.name} className="flex items-center justify-between glass border border-white/10 rounded-xl px-4 py-3">
                    <span><span className="text-white font-semibold">{tp.name}</span> – {tp.role}</span>
                    <a href={tp.privacy} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 text-xs">
                      {t('s5.linkLabel')}
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s6.heading')}</h2>
              <p className="mb-3">{t('s6.intro')}</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
                {s6items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="mt-3 text-sm">
                {t.rich('s6.contact', {
                  link: (chunks) => <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">{chunks}</a>,
                })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s7.heading')}</h2>
              <p className="text-sm">
                {t.rich('s7.text', {
                  link: (chunks) => <Link href="/cookies" className="text-violet-400 hover:text-violet-300">{chunks}</Link>,
                })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s8.heading')}</h2>
              <p className="text-sm">{t('s8.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s9.heading')}</h2>
              <p className="text-sm">
                {t.rich('s9.text', {
                  link: (chunks) => <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">{chunks}</a>,
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
