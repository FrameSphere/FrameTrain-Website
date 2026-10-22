import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Check, X, Minus, ArrowRight, ChevronRight, Scale, Download, HelpCircle,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Compare' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/compare'),
    openGraph: pageOpenGraph({
      locale,
      path: '/compare',
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
    }),
  }
}

type Row = { feature: string; frametrain: string; mlx: string; unsloth: string }
type Card = { name: string; tag: string; desc: string; bestFor: string }
type FaqItem = { question: string; answer: string }

const bold = { b: (chunks: React.ReactNode) => <strong className="text-ink">{chunks}</strong> }

function Cell({ value, label }: { value: string; label: string }) {
  if (value === 'yes') return <Check className="w-4 h-4 text-success mx-auto" aria-label={label} />
  if (value === 'no') return <X className="w-4 h-4 text-ink-faint mx-auto" aria-label={label} />
  if (value === 'partial') return <Minus className="w-4 h-4 text-warning mx-auto" aria-label={label} />
  return <span className="text-ink text-xs">{value}</span>
}

export default async function ComparePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Compare' })

  const colHeaders = t.raw('matrix.colHeaders') as string[]
  const rows = t.raw('matrix.rows') as Row[]
  const legend = t.raw('matrix.legend') as { yes: string; no: string; partial: string }
  const cards = t.raw('chooseWhich.cards') as Card[]
  const faqItems = t.raw('faq.items') as FaqItem[]

  const pageUrl = `${siteUrl}/${locale}/compare`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t('breadcrumb'), item: pageUrl },
        ],
      },
      {
        '@type': 'Article',
        headline: t('ogTitle'),
        description: t('metaDescription'),
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        author: { '@type': 'Organization', name: 'FrameTrain' },
        publisher: { '@type': 'Organization', name: 'FrameTrain' },
        mainEntityOfPage: pageUrl,
        about: { '@type': 'SoftwareApplication', '@id': `${siteUrl}/#software` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  const cardAccent = ['border-line', 'border-line', 'border-line']
  const cardTag = ['text-indigo-text bg-indigo-soft', 'text-indigo-text bg-indigo-soft', 'text-success bg-ghost-fill']

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 py-4 border-b border-line">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-ink-faint">
            <Link href="/" className="hover:text-indigo-text transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-ink">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-line">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-soft text-indigo-text border border-line">
              <Scale className="w-3.5 h-3.5" />
              {t('breadcrumb')}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="text-ink">{t('heroTitleLine2')}</span>
            </h1>
            <p className="text-xl text-ink-muted leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto space-y-12">

            {/* Intro */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <div className="text-ink space-y-4 leading-relaxed max-w-3xl">
                <p>{t.rich('intro.p1', bold)}</p>
                <p>{t.rich('intro.p2', bold)}</p>
              </div>
              <p className="mt-6 text-xs text-ink-faint">{t('lastUpdated')}</p>
            </div>

            {/* Matrix */}
            <div className="bg-surface border border-line rounded-lg p-6 sm:p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6">{t('matrix.heading')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left py-3 px-4 text-ink-muted font-semibold w-[34%]">{colHeaders[0]}</th>
                      <th className="text-center py-3 px-4 text-indigo-text font-semibold">{colHeaders[1]}</th>
                      <th className="text-center py-3 px-4 text-ink font-semibold">{colHeaders[2]}</th>
                      <th className="text-center py-3 px-4 text-ink font-semibold">{colHeaders[3]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((row, i) => {
                      const isLast = i === rows.length - 1
                      return (
                        <tr key={i} className={`hover:bg-ghost-fill transition-colors ${isLast ? 'font-medium' : ''}`}>
                          <td className="py-3 px-4 text-ink">{row.feature}</td>
                          <td className="py-3 px-4 text-center bg-indigo-soft"><Cell value={row.frametrain} label={legend.yes} /></td>
                          <td className="py-3 px-4 text-center"><Cell value={row.mlx} label={legend.no} /></td>
                          <td className="py-3 px-4 text-center"><Cell value={row.unsloth} label={legend.no} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Legend */}
              <div className="mt-5 flex items-center gap-5 flex-wrap text-xs text-ink-faint">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> {legend.yes}</span>
                <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-warning" /> {legend.partial}</span>
                <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-ink-faint" /> {legend.no}</span>
              </div>
            </div>

            {/* Choose which */}
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-6 px-1">{t('chooseWhich.heading')}</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {cards.map((c, i) => (
                  <div key={c.name} className={`bg-surface border border-line rounded-md p-6 border ${cardAccent[i] ?? 'border-line'} flex flex-col`}>
                    <span className={`self-start text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${cardTag[i] ?? 'text-ink bg-surface-raised'}`}>
                      {c.tag}
                    </span>
                    <h3 className="text-ink font-semibold text-lg mb-2">{c.name}</h3>
                    <p className="text-ink-muted text-sm leading-relaxed mb-4">{c.desc}</p>
                    <p className="text-ink text-sm leading-relaxed mt-auto pt-4 border-t border-line">
                      {c.bestFor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Einzelvergleiche */}
            <div>
              <h2 className="ft-label m-0 px-1">{t('more.heading')}</h2>
              <ul className="mt-4 p-0 list-none grid gap-x-8 sm:grid-cols-3">
                {(t.raw('more.items') as { href: string; label: string }[]).map((m) => (
                  <li key={m.href} className="border-b border-line">
                    <Link href={m.href} className="group flex items-center justify-between gap-4 py-4 text-[16px] text-ink-muted hover:text-ink transition-colors duration-150">
                      {m.label}
                      <ArrowRight className="w-4 h-4 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-ink-faint leading-relaxed max-w-3xl">{t('disclaimer')}</p>

            {/* FAQ */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-indigo-text" />
                {t('faq.heading')}
              </h2>
              <div className="divide-y divide-line">
                {faqItems.map((item) => (
                  <details key={item.question} className="group py-4">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-ink font-medium">
                      <span>{item.question}</span>
                      <ChevronRight className="w-4 h-4 text-ink-faint transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="text-ink-muted text-sm leading-relaxed mt-3">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line text-center">
              <h3 className="text-2xl font-semibold text-ink mb-4">{t('cta.heading')}</h3>
              <p className="text-ink-muted mb-6 max-w-lg mx-auto">{t('cta.text')}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/download" className="relative group inline-block px-8 py-3 rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                  <div className="relative flex items-center gap-2 text-ink font-semibold">
                    <Download className="w-4 h-4" />
                    <span>{t('cta.ctaDownload')}</span>
                  </div>
                </Link>
                <Link href="/guides" className="bg-surface border border-line px-8 py-3 rounded-md text-ink hover:text-ink transition font-semibold flex items-center gap-2">
                  {t('cta.ctaDocs')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
