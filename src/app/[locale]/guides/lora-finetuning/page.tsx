import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppScreenshot } from '@/components/AppScreenshot'
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
  const tShots = await getTranslations({ locale, namespace: 'Screenshots' })

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
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-soft text-indigo-text border border-line">{badges[0]}</span>
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

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Was ist LoRA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-indigo-text" />
                {t('whatIsLora.heading')}
              </h2>
              <div className="text-ink space-y-4 leading-relaxed">
                <p>{t.rich('whatIsLora.p1', { b: (chunks) => <strong className="text-ink">{chunks}</strong> })}</p>
                <p>{t.rich('whatIsLora.p2', { b: (chunks) => <strong className="text-ink">{chunks}</strong> })}</p>
                <p>{t.rich('whatIsLora.p3', { b: (chunks) => <strong className="text-ink">{chunks}</strong> })}</p>
              </div>
            </div>

            {/* LoRA vs Full Fine-Tuning */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-3xl font-semibold text-ink mb-6">
                {t('vsFull.heading')}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface border border-line rounded-md p-6 border border-line">
                  <h3 className="text-xl font-semibold text-indigo-text mb-4">{t('vsFull.loraTitle')}</h3>
                  <ul className="space-y-3">
                    {loraItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-ink text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface border border-line rounded-md p-6 border border-line">
                  <h3 className="text-xl font-semibold text-indigo-text mb-4">{t('vsFull.fullTitle')}</h3>
                  <ul className="space-y-3">
                    {fullItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-ink text-sm">
                        <Check className="w-4 h-4 text-indigo-text flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-surface border border-line rounded-md p-4 border border-line">
                <p className="text-ink-muted text-sm">
                  {t.rich('vsFull.ruleOfThumb', { b: (chunks) => <strong className="text-ink">{chunks}</strong> })}
                </p>
              </div>
            </div>

            {/* QLoRA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-indigo-text" />
                {t('qlora.heading')}
              </h2>
              <div className="text-ink space-y-4 leading-relaxed">
                <p>{t.rich('qlora.p1', { b: (chunks) => <strong className="text-ink">{chunks}</strong> })}</p>
                <p>{t.rich('qlora.p2', { b: (chunks) => <strong className="text-ink">{chunks}</strong> })}</p>
              </div>

              {/* VRAM Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {tableHeaders.map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-ink-muted font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-ghost-fill transition-colors">
                        <td className="py-3 px-4 text-ink font-medium">{row[0]}</td>
                        <td className="py-3 px-4 text-danger">{row[1]}</td>
                        <td className="py-3 px-4 text-warning">{row[2]}</td>
                        <td className="py-3 px-4 text-success">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LoRA Hyperparameter */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Code2 className="w-8 h-8 text-success" />
                {t('hyperparams.heading')}
              </h2>
              <div className="space-y-4">
                {hyperparams.map(({ param, typical, desc }) => (
                  <div key={param} className="bg-surface border border-line rounded-md p-5 border border-line">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-indigo-text font-mono font-semibold text-sm bg-indigo-soft px-2 py-1 rounded">{param}</code>
                      <span className="text-xs text-ink-faint">{t('hyperparams.typicalLabel')}: {typical}</span>
                    </div>
                    <p className="text-ink-muted text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Wo diese Parameter in der App tatsächlich stehen – der Guide
                  erklärt sie, der Screenshot zeigt den Ort. */}
              <AppScreenshot
                locale={locale}
                slug="training"
                alt={t('hyperparams.screenshotAlt')}
                caption={t('hyperparams.screenshotCaption')}
                className="mt-8"
              />
              <Link
                href="/screenshots"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-text hover:text-indigo-text transition-colors group"
              >
                {tShots('tourLinkLabel')}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* CTA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ghost-fill border border-line rounded-lg mb-6">
                <Zap className="w-8 h-8 text-ink" />
              </div>
              <h3 className="text-2xl font-semibold text-ink mb-4">
                {t('cta.heading')}
              </h3>
              <p className="text-ink-muted mb-6 max-w-lg mx-auto">
                {t('cta.text')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="relative group inline-block px-8 py-3 rounded-md overflow-hidden"
                >
                  <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                  <div className="relative flex items-center gap-2 text-ink font-semibold">
                    <span>{t('cta.ctaStart')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/docs" className="bg-surface border border-line px-8 py-3 rounded-md text-ink hover:text-ink transition font-semibold">
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
