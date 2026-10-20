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
  green: 'text-success bg-ghost-fill border-success',
  purple: 'text-indigo-text bg-indigo-soft border-line',
  blue: 'text-indigo-text bg-indigo-soft border-line',
  pink: 'text-indigo-text bg-indigo-soft border-line',
  gray: 'text-ink-muted bg-surface-raised border-line',
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
        <div className="px-4 py-4 border-b border-line">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-ink-faint">
            <Link href="/" className="hover:text-indigo-text transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/guides" className="hover:text-indigo-text transition">Guides</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-ink">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-line">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-ghost-fill text-warning border border-warning">{badges[0]}</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-soft text-indigo-text border border-line">{badges[1]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="text-ink">
                {t('heroTitleLine2')}
              </span>
            </h1>
            <p className="text-xl text-ink-muted leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Quick Summary */}
            <div className="bg-surface border border-line rounded-lg p-6 border border-line">
              <h2 className="text-xl font-semibold text-ink mb-4">{t('quickSummary.heading')}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {summaryItems.map(({ vram, desc, example }) => (
                  <div key={vram} className="bg-surface border border-line rounded-md p-4 border border-line">
                    <div className="text-2xl font-semibold text-indigo-text mb-1">{vram}</div>
                    <p className="text-ink text-sm mb-2">{desc}</p>
                    <p className="text-xs text-ink-faint font-mono">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GPU Cards */}
            {gpus.map((gpu) => (
              <div key={gpu.name} className="bg-surface border border-line rounded-lg p-8 border border-line">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-ink">{gpu.name}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tierColors[gpu.tierColor]}`}>
                        {gpu.tier}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-ink-muted"><span className="text-ink font-semibold">{gpu.vram}</span> {t('vramLabel')}</span>
                      <span className="text-ink-muted">{t('priceApprox')} <span className="text-warning font-semibold">{gpu.price}</span></span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-14 h-14 bg-ghost-fill border border-line rounded-md border border-line">
                    <Cpu className="w-7 h-7 text-ink-muted" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-3">{t('prosLabel')}</h4>
                    <ul className="space-y-2">
                      {gpu.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-ink text-sm">
                          <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-danger uppercase tracking-wider mb-3">{t('consLabel')}</h4>
                    <ul className="space-y-2">
                      {gpu.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-ink text-sm">
                          <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger font-semibold text-xs leading-4">✕</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-text uppercase tracking-wider mb-3">{t('suitableLabel')}</h4>
                    <ul className="space-y-2">
                      {gpu.suitable.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-ink text-sm">
                          <Zap className="w-4 h-4 text-indigo-text flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line text-center">
              <h3 className="text-2xl font-semibold text-ink mb-4">
                {t('cta.heading')}
              </h3>
              <p className="text-ink-muted mb-6 max-w-lg mx-auto">
                {t('cta.text')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register" className="relative group inline-block px-8 py-3 rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                  <div className="relative flex items-center gap-2 text-ink font-semibold">
                    <span>{t('cta.ctaStart')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/guides/lora-finetuning" className="bg-surface border border-line px-8 py-3 rounded-md text-ink hover:text-ink transition font-semibold">
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
