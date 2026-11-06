import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BookOpen, Clock, LifeBuoy, Mail, Plug } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'
import { SUPPORT_EMAIL } from '@/lib/support'
import { OpenSupportButton } from '@/components/support/OpenSupportButton'

// Oeffentliche Support-Seite: ohne Login erreichbar. Support-URL fuer die
// Verzeichnisse von Anthropic (Claude) und OpenAI (ChatGPT-Apps).
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SupportPage' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: pageAlternates(locale, '/support'),
    openGraph: pageOpenGraph({ locale, path: '/support', title, description }),
  }
}

export default async function SupportPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'SupportPage' })
  const ai = t.raw('ai.items') as { q: string; a: string }[]
  const links = t.raw('links.items') as { label: string; href: string }[]

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-4">
            <p className="ft-label mb-4">{t('badge')}</p>
            <h1 className="text-4xl md:text-[52px] md:leading-[1.02] font-semibold tracking-[-0.04em] text-ink mb-6">{t('heading')}</h1>
            <p className="ft-lead max-w-[68ch]">{t('intro')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="ft-card flex flex-col">
              <h2 className="flex items-center gap-2 text-[22px] leading-tight font-semibold tracking-tight text-ink mb-3">
                <LifeBuoy className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />{t('chat.heading')}
              </h2>
              <p className="text-sm text-ink-muted mb-5 flex-1">{t('chat.text')}</p>
              <div><OpenSupportButton label={t('chat.button')} /></div>
            </section>
            <section className="ft-card flex flex-col">
              <h2 className="flex items-center gap-2 text-[22px] leading-tight font-semibold tracking-tight text-ink mb-3">
                <Mail className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />{t('email.heading')}
              </h2>
              <p className="text-sm text-ink-muted mb-5 flex-1">{t('email.text')}</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-text font-semibold break-all">{SUPPORT_EMAIL}</a>
            </section>
          </div>

          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Clock className="w-4 h-4" />{t('responseTime')}
          </p>

          <section className="ft-card">
            <h2 className="flex items-center gap-2 text-[22px] leading-tight font-semibold tracking-tight text-ink mb-4">
              <Plug className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />{t('ai.heading')}
            </h2>
            <dl className="space-y-4">
              {ai.map((x) => (
                <div key={x.q}>
                  <dt className="font-semibold text-ink text-sm">{x.q}</dt>
                  <dd className="text-sm text-ink-muted mt-1">{x.a}</dd>
                </div>
              ))}
            </dl>
            <Link href="/docs/mcp" className="mt-5 inline-flex items-center gap-1 text-sm text-indigo-text font-medium">
              <BookOpen className="w-4 h-4" />{t('ai.docsLink')}
            </Link>
          </section>

          <section className="ft-card">
            <h2 className="text-[22px] leading-tight font-semibold tracking-tight text-ink mb-4">{t('links.heading')}</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-md border border-line hover:border-line-strong px-4 py-3 text-sm text-ink transition duration-200 ease-out">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-ink-muted">
            {t.rich('account', { link: (c) => <Link href="/dashboard" className="text-indigo-text underline">{c}</Link> })}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
