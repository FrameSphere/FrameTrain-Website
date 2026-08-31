import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Cpu, Zap, Check, ArrowRight, ChevronRight, Shield, Layers, Gauge, Download, HelpCircle,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AppleSilicon' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/apple-silicon'),
    openGraph: pageOpenGraph({
      locale,
      path: '/apple-silicon',
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
    }),
  }
}

type Point = { title: string; desc: string }
type Step = { title: string; desc: string }
type FaqItem = { question: string; answer: string }

const bold = { b: (chunks: React.ReactNode) => <strong className="text-white">{chunks}</strong> }

export default async function AppleSiliconPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AppleSilicon' })

  const badges = t.raw('badges') as string[]
  const points = t.raw('noCuda.points') as Point[]
  const tableHeaders = t.raw('capability.tableHeaders') as string[]
  const tableRows = t.raw('capability.tableRows') as string[][]
  const steps = t.raw('howItWorks.steps') as Step[]
  const requirements = t.raw('requirements.items') as string[]
  const faqItems = t.raw('faq.items') as FaqItem[]

  const pageUrl = `${siteUrl}/${locale}/apple-silicon`
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

  const pointIcons = [Layers, Gauge, Shield]

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
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-400 transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {badges.map((b) => (
                <span
                  key={b}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  {b}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="text-gradient-brand">{t('heroTitleLine2')}</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link href="/download" className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                <div className="relative flex items-center gap-2 text-white font-semibold">
                  <Download className="w-4 h-4" />
                  <span>{t('cta.ctaDownload')}</span>
                </div>
              </Link>
              <Link href="/guides/lora-finetuning" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                {t('cta.ctaDocs')}
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Why Apple Silicon */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-purple-400" />
                {t('intro.heading')}
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>{t.rich('intro.p1', bold)}</p>
                <p>{t.rich('intro.p2', bold)}</p>
              </div>
            </div>

            {/* No CUDA – 3 points */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 px-1">{t('noCuda.heading')}</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {points.map((p, i) => {
                  const Icon = pointIcons[i] ?? Check
                  return (
                    <div key={p.title} className="glass rounded-xl p-6 border border-white/10">
                      <Icon className="w-7 h-7 text-purple-400 mb-4" />
                      <h3 className="text-white font-semibold mb-2">{p.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Capability table */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <Gauge className="w-8 h-8 text-blue-400" />
                {t('capability.heading')}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-3xl">
                {t.rich('capability.intro', bold)}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      {tableHeaders.map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-gray-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors align-top">
                        <td className="py-3 px-4 text-white font-medium whitespace-nowrap">{row[0]}</td>
                        <td className="py-3 px-4 text-blue-300 whitespace-nowrap">{row[1]}</td>
                        <td className="py-3 px-4 text-gray-300">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 glass rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">{t.rich('capability.note', bold)}</p>
              </div>
            </div>

            {/* How it works */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{t('howItWorks.heading')}</h2>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-white font-semibold">{s.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Requirements */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{t('requirements.heading')}</h2>
              <ul className="space-y-3">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-gray-300 text-sm leading-relaxed">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('cta.heading')}</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">{t('cta.text')}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/download" className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>{t('cta.ctaDownload')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/compare" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  FrameTrain vs. Unsloth &amp; MLX
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
