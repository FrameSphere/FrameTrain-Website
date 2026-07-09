import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FileText } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Terms' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default function TermsPage() {
  const t = useTranslations('Terms')
  const locale = useLocale()

  const s2items = t.raw('s2.items') as string[]
  const s6items = t.raw('s6.items') as string[]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">{t('heading')}</h1>
              <p className="text-gray-400 text-sm mt-1">{t('lastUpdated')}</p>
            </div>
          </div>

          {/* WICHTIG: NICHT entfernen. Die deutsche AGB ist die rechtlich
              bindende Fassung; die englische ist eine Gefaelligkeits-
              uebersetzung. Siehe auch die TODO/ANWALT-Kommentare unten zu
              § 312k BGB Kuendigungsbutton, Widerrufsrecht und
              Haftungsbeschraenkung – diese Klauseln wurden 1:1 (nur
              uebersetzt) aus der bisherigen, noch nicht final geprueften
              deutschen Fassung uebernommen. */}
          {locale === 'en' && (
            <div className="mb-8 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
              {t('courtesyNote')}
            </div>
          )}

          <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 space-y-10 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s1.heading')}</h2>
              <p className="text-sm">{t('s1.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s2.heading')}</h2>
              <p className="text-sm mb-3">{t('s2.intro')}</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
                {s2items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s3.heading')}</h2>
              <p className="text-sm mb-3">{t('s3.text1')}</p>
              <p className="text-sm">{t('s3.text2')}</p>
            </section>

            <section>
              {/* TODO/ANWALT PRÜFEN: Als laufendes Abo-Verhältnis unterliegt FrameTrain seit Juli 2022 dem
                  Kuendigungsbutton-Erfordernis nach § 312k BGB – ein jederzeit leicht auffindbarer,
                  eindeutig beschrifteter Kuendigungs-Button (z.B. im Dashboard) ist gesetzlich vorgeschrieben.
                  Bitte rechtlich pruefen lassen, ob das aktuell so umgesetzt ist. Gilt fuer DE + EN Fassung. */}
              <h2 className="text-xl font-bold text-white mb-3">{t('s4.heading')}</h2>
              <p className="text-sm">
                {t.rich('s4.text', {
                  link: (chunks) => <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">{chunks}</a>,
                })}
              </p>
            </section>

            <section>
              {/* TODO/ANWALT PRUEFEN: Das Widerrufsrecht bei Abos/Dauerschuldverhaeltnissen unterscheidet sich
                  von dem bei einmaligen digitalen Inhalten. Diese Klausel sollte juristisch an das neue
                  Abo-Modell angepasst werden. Gilt fuer DE + EN Fassung. */}
              <h2 className="text-xl font-bold text-white mb-3">{t('s5.heading')}</h2>
              <p className="text-sm mb-3">{t('s5.text1')}</p>
              <p className="text-sm">
                {t.rich('s5.text2', {
                  link: (chunks) => <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">{chunks}</a>,
                })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s6.heading')}</h2>
              <p className="text-sm mb-3">{t('s6.text1')}</p>
              <p className="text-sm font-semibold text-red-400">{t('s6.prohibitedLabel')}</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400 mt-2">
                {s6items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s7.heading')}</h2>
              <p className="text-sm">{t('s7.text')}</p>
            </section>

            <section>
              {/* TODO/ANWALT PRUEFEN: Haftungsobergrenze an das Abo-Modell angepasst (gezahlte Gebuehren der
                  letzten 12 Monate statt fixer 1,99 Euro). Bitte rechtlich gegenpruefen. Gilt fuer DE + EN Fassung. */}
              <h2 className="text-xl font-bold text-white mb-3">{t('s8.heading')}</h2>
              <p className="text-sm">{t('s8.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s9.heading')}</h2>
              <p className="text-sm">{t('s9.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s10.heading')}</h2>
              <p className="text-sm">{t('s10.text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t('s11.heading')}</h2>
              <p className="text-sm">
                {t.rich('s11.text', {
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
