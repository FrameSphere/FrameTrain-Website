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

const bold = { b: (chunks: React.ReactNode) => <strong className="text-white">{chunks}</strong> }

function Cell({ value, label }: { value: string; label: string }) {
  if (value === 'yes') return <Check className="w-4 h-4 text-green-400 mx-auto" aria-label={label} />
  if (value === 'no') return <X className="w-4 h-4 text-gray-600 mx-auto" aria-label={label} />
  if (value === 'partial') return <Minus className="w-4 h-4 text-yellow-400 mx-auto" aria-label={label} />
  return <span className="text-gray-300 text-xs">{value}</span>
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

  const cardAccent = ['border-purple-500/30', 'border-blue-500/20', 'border-green-500/20']
  const cardTag = ['text-purple-300 bg-purple-500/15', 'text-blue-300 bg-blue-500/15', 'text-green-300 bg-green-500/15']

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-400 transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-5 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
              <Scale className="w-3.5 h-3.5" />
              {t('breadcrumb')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="text-gradient-brand">{t('heroTitleLine2')}</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto space-y-12">

            {/* Intro */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <div className="text-gray-300 space-y-4 leading-relaxed max-w-3xl">
                <p>{t.rich('intro.p1', bold)}</p>
                <p>{t.rich('intro.p2', bold)}</p>
              </div>
              <p className="mt-6 text-xs text-gray-500">{t('lastUpdated')}</p>
            </div>

            {/* Matrix */}
            <div className="glass-strong rounded-2xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{t('matrix.heading')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold w-[34%]">{colHeaders[0]}</th>
                      <th className="text-center py-3 px-4 text-purple-300 font-bold">{colHeaders[1]}</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-semibold">{colHeaders[2]}</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-semibold">{colHeaders[3]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row, i) => {
                      const isLast = i === rows.length - 1
                      return (
                        <tr key={i} className={`hover:bg-white/[0.02] transition-colors ${isLast ? 'font-medium' : ''}`}>
                          <td className="py-3 px-4 text-white">{row.feature}</td>
                          <td className="py-3 px-4 text-center bg-purple-500/[0.04]"><Cell value={row.frametrain} label={legend.yes} /></td>
                          <td className="py-3 px-4 text-center"><Cell value={row.mlx} label={legend.no} /></td>
                          <td className="py-3 px-4 text-center"><Cell value={row.unsloth} label={legend.no} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Legend */}
              <div className="mt-5 flex items-center gap-5 flex-wrap text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> {legend.yes}</span>
                <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-yellow-400" /> {legend.partial}</span>
                <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-gray-600" /> {legend.no}</span>
              </div>
            </div>

            {/* Choose which */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 px-1">{t('chooseWhich.heading')}</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {cards.map((c, i) => (
                  <div key={c.name} className={`glass rounded-xl p-6 border ${cardAccent[i] ?? 'border-white/10'} flex flex-col`}>
                    <span className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 ${cardTag[i] ?? 'text-gray-300 bg-white/10'}`}>
                      {c.tag}
                    </span>
                    <h3 className="text-white font-bold text-lg mb-2">{c.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{c.desc}</p>
                    <p className="text-gray-300 text-sm leading-relaxed mt-auto pt-4 border-t border-white/5">
                      {c.bestFor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">{t('disclaimer')}</p>

            {/* FAQ */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-purple-400" />
                {t('faq.heading')}
              </h2>
              <div className="divide-y divide-white/5">
                {faqItems.map((item) => (
                  <details key={item.question} className="group py-4">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-white font-medium">
                      <span>{item.question}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="text-gray-400 text-sm leading-relaxed mt-3">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">{t('cta.heading')}</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">{t('cta.text')}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/download" className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <Download className="w-4 h-4" />
                    <span>{t('cta.ctaDownload')}</span>
                  </div>
                </Link>
                <Link href="/guides" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold flex items-center gap-2">
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
