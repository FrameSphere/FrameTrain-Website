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

const bold = { b: (chunks: React.ReactNode) => <strong className="text-ink">{chunks}</strong> }

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
        <div className="px-4 py-4 border-b border-line">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-ink-faint">
            <Link href="/" className="hover:text-indigo-text transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-ink">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-line">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {badges.map((b) => (
                <span
                  key={b}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-soft text-indigo-text border border-line"
                >
                  {b}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="text-ink">{t('heroTitleLine2')}</span>
            </h1>
            <p className="text-xl text-ink-muted leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link href="/download" className="relative group inline-block px-8 py-3 rounded-md overflow-hidden">
                <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                <div className="relative flex items-center gap-2 text-ink font-semibold">
                  <Download className="w-4 h-4" />
                  <span>{t('cta.ctaDownload')}</span>
                </div>
              </Link>
              <Link href="/guides/lora-finetuning" className="bg-surface border border-line px-8 py-3 rounded-md text-ink hover:text-ink transition font-semibold">
                {t('cta.ctaDocs')}
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Why Apple Silicon */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-indigo-text" />
                {t('intro.heading')}
              </h2>
              <div className="text-ink space-y-4 leading-relaxed">
                <p>{t.rich('intro.p1', bold)}</p>
                <p>{t.rich('intro.p2', bold)}</p>
              </div>
            </div>

            {/* No CUDA – 3 points */}
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-6 px-1">{t('noCuda.heading')}</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {points.map((p, i) => {
                  const Icon = pointIcons[i] ?? Check
                  return (
                    <div key={p.title} className="bg-surface border border-line rounded-md p-6 border border-line">
                      <Icon className="w-7 h-7 text-indigo-text mb-4" />
                      <h3 className="text-ink font-semibold mb-2">{p.title}</h3>
                      <p className="text-ink-muted text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Capability table */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-3 flex items-center gap-3">
                <Gauge className="w-8 h-8 text-indigo-text" />
                {t('capability.heading')}
              </h2>
              <p className="text-ink-muted text-sm leading-relaxed mb-6 max-w-3xl">
                {t.rich('capability.intro', bold)}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-line">
                      {tableHeaders.map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-ink-muted font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-ghost-fill transition-colors align-top">
                        <td className="py-3 px-4 text-ink font-medium whitespace-nowrap">{row[0]}</td>
                        <td className="py-3 px-4 text-indigo-text whitespace-nowrap">{row[1]}</td>
                        <td className="py-3 px-4 text-ink">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-surface border border-line rounded-md p-4 border border-line">
                <p className="text-ink-muted text-sm">{t.rich('capability.note', bold)}</p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6">{t('howItWorks.heading')}</h2>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-sm bg-ghost-fill border border-line text-ink font-semibold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-ink font-semibold">{s.title}</h3>
                      <p className="text-ink-muted text-sm leading-relaxed mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Requirements */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6">{t('requirements.heading')}</h2>
              <ul className="space-y-3">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-ink text-sm leading-relaxed">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

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

            {/* MLX vs. PyTorch */}
            <div className="rounded-lg border border-line bg-bg p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="max-w-[620px]">
                <h2 className="text-xl font-semibold text-ink m-0">{t('mlx.heading')}</h2>
                <p className="text-ink-muted text-[15px] leading-6 mt-2 mb-0">{t('mlx.text')}</p>
              </div>
              <Link href="/guides/mlx-vs-pytorch" className="ft-btn ft-btn--ghost flex-none">
                {t('mlx.cta')}
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>

            {/* CTA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ghost-fill border border-line rounded-lg mb-6">
                <Zap className="w-8 h-8 text-ink" />
              </div>
              <h3 className="text-2xl font-semibold text-ink mb-4">{t('cta.heading')}</h3>
              <p className="text-ink-muted mb-6 max-w-lg mx-auto">{t('cta.text')}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/download" className="relative group inline-block px-8 py-3 rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                  <div className="relative flex items-center gap-2 text-ink font-semibold">
                    <span>{t('cta.ctaDownload')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/compare" className="bg-surface border border-line px-8 py-3 rounded-md text-ink hover:text-ink transition font-semibold">
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
