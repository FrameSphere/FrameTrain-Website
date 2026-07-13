import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Zap, Check, ArrowRight, Code2, Cpu, ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'LoraGuide' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/guides/lora-finetuning'),
    openGraph: pageOpenGraph({
      locale,
      path: '/guides/lora-finetuning',
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
    }),
  }
}

type HyperParam = { param: string; typical: string; desc: string }

export default async function LoraGuidePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'LoraGuide' })

  const loraItems = t.raw('vsFull.loraItems') as string[]
  const fullItems = t.raw('vsFull.fullItems') as string[]
  const tableHeaders = t.raw('qlora.tableHeaders') as string[]
  const tableRows = t.raw('qlora.tableRows') as string[][]
  const hyperparams = t.raw('hyperparams.items') as HyperParam[]
  const badges = t.raw('badges') as string[]

  const pageUrl = `${siteUrl}/${locale}/guides/lora-finetuning`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/${locale}/guides` },
          { '@type': 'ListItem', position: 3, name: t('breadcrumb'), item: pageUrl },
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
      },
    ],
  }

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
            <Link href="/guides" className="hover:text-purple-400 transition">Guides</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">{badges[0]}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">{badges[1]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('heroTitleLine2')}
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Was ist LoRA */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                {t('whatIsLora.heading')}
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>{t.rich('whatIsLora.p1', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('whatIsLora.p2', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('whatIsLora.p3', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
              </div>
            </div>

            {/* LoRA vs Full Fine-Tuning */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6">
                {t('vsFull.heading')}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-purple-400 mb-4">{t('vsFull.loraTitle')}</h3>
                  <ul className="space-y-3">
                    {loraItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">{t('vsFull.fullTitle')}</h3>
                  <ul className="space-y-3">
                    {fullItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 glass rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">
                  {t.rich('vsFull.ruleOfThumb', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}
                </p>
              </div>
            </div>

            {/* QLoRA */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-blue-400" />
                {t('qlora.heading')}
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>{t.rich('qlora.p1', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('qlora.p2', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
              </div>

              {/* VRAM Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {tableHeaders.map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-gray-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{row[0]}</td>
                        <td className="py-3 px-4 text-red-400">{row[1]}</td>
                        <td className="py-3 px-4 text-yellow-400">{row[2]}</td>
                        <td className="py-3 px-4 text-green-400">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LoRA Hyperparameter */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Code2 className="w-8 h-8 text-green-400" />
                {t('hyperparams.heading')}
              </h2>
              <div className="space-y-4">
                {hyperparams.map(({ param, typical, desc }) => (
                  <div key={param} className="glass rounded-xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-purple-400 font-mono font-bold text-sm bg-purple-500/10 px-2 py-1 rounded">{param}</code>
                      <span className="text-xs text-gray-500">{t('hyperparams.typicalLabel')}: {typical}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                {t('cta.heading')}
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                {t('cta.text')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>{t('cta.ctaStart')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/docs" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  {t('cta.ctaDocs')}
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
