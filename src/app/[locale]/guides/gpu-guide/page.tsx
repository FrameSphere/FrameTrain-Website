import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Cpu, Zap, Check, ChevronRight, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GpuGuide' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/guides/gpu-guide'),
    openGraph: pageOpenGraph({
      locale,
      path: '/guides/gpu-guide',
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
    }),
  }
}

type GpuItem = {
  name: string; vram: string; price: string; tier: string; tierColor: string
  pros: string[]; cons: string[]; suitable: string[]
}
type SummaryItem = { vram: string; desc: string; example: string }

const tierColors: Record<string, string> = {
  green: 'text-green-400 bg-green-500/10 border-green-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  pink: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  gray: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

export default async function GpuGuidePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GpuGuide' })

  const badges = t.raw('badges') as string[]
  const summaryItems = t.raw('quickSummary.items') as SummaryItem[]
  const gpus = t.raw('gpus') as GpuItem[]

  const pageUrl = `${siteUrl}/${locale}/guides/gpu-guide`
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
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">{badges[0]}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">{badges[1]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {t('heroTitleLine2')}
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Quick Summary */}
            <div className="glass-strong rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{t('quickSummary.heading')}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {summaryItems.map(({ vram, desc, example }) => (
                  <div key={vram} className="glass rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-black text-purple-400 mb-1">{vram}</div>
                    <p className="text-gray-300 text-sm mb-2">{desc}</p>
                    <p className="text-xs text-gray-600 font-mono">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GPU Cards */}
            {gpus.map((gpu) => (
              <div key={gpu.name} className="glass-strong rounded-2xl p-8 border border-white/10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-white">{gpu.name}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tierColors[gpu.tierColor]}`}>
                        {gpu.tier}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400"><span className="text-white font-semibold">{gpu.vram}</span> {t('vramLabel')}</span>
                      <span className="text-gray-400">{t('priceApprox')} <span className="text-yellow-400 font-semibold">{gpu.price}</span></span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-white/10">
                    <Cpu className="w-7 h-7 text-gray-400" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">{t('prosLabel')}</h4>
                    <ul className="space-y-2">
                      {gpu.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-gray-300 text-sm">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">{t('consLabel')}</h4>
                    <ul className="space-y-2">
                      {gpu.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400 font-bold text-xs leading-4">✕</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">{t('suitableLabel')}</h4>
                    <ul className="space-y-2">
                      {gpu.suitable.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-gray-300 text-sm">
                          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <h3 className="text-2xl font-black text-white mb-4">
                {t('cta.heading')}
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                {t('cta.text')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register" className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>{t('cta.ctaStart')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/guides/lora-finetuning" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  {t('cta.ctaLora')}
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
