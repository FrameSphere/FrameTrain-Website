import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'
import { pageAlternates } from '@/lib/seo'
import { DeclarationForm } from '@/components/legal/DeclarationForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Withdrawal' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/withdrawal'),
  }
}

type Section = { heading: string; paragraphs: string[] }

// Widerrufsbelehrung + Muster-Widerrufsformular (Anlage 1/2 zu Art. 246a EGBGB)
// und die Widerrufsfunktion nach § 356a BGB („Vertrag hier widerrufen“).
export default function WithdrawalPage() {
  const t = useTranslations('Withdrawal')
  const tDecl = useTranslations('Declaration')
  const locale = useLocale()
  const sections = t.raw('sections') as Section[]
  const form = t.raw('modelForm') as string[]

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-semibold text-ink">{t('heading')}</h1>
          <p className="text-ink-muted text-sm mt-1">{t('lastUpdated')}</p>

          {locale === 'en' && (
            <div className="mt-8 px-5 py-3 rounded-md bg-ghost-fill border border-line text-warning text-sm">{t('courtesyNote')}</div>
          )}

          <a href="#widerrufen" className="ft-btn ft-btn--primary mt-8 inline-flex">{tDecl('withdrawal.button')}</a>

          <div className="mt-10 bg-surface border border-line rounded-lg p-8 md:p-12 space-y-8 text-ink leading-relaxed">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-xl font-semibold text-ink mb-3">{s.heading}</h2>
                {s.paragraphs.map((p, i) => <p key={i} className="text-sm mb-3">{p}</p>)}
              </section>
            ))}
            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">{t('modelFormHeading')}</h2>
              <div className="text-sm text-ink-muted whitespace-pre-line border border-line rounded-md px-5 py-4">
                {form.join('\n')}
              </div>
            </section>
          </div>

          <section id="widerrufen" className="mt-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">{tDecl('withdrawal.heading')}</h2>
            <p className="text-ink-muted text-sm mt-3 mb-6">{tDecl('withdrawal.intro')}</p>
            <DeclarationForm kind="withdrawal" />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
