import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppScreenshot } from '@/components/AppScreenshot'
import { Shield, DollarSign, Cloud, Laptop, ChevronRight, ArrowRight, Check, X } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CloudGuide' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/guides/local-vs-cloud'),
    openGraph: pageOpenGraph({
      locale,
      path: '/guides/local-vs-cloud',
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
    }),
  }
}

type PrivacyItem = { title: string; text: string }

export default async function LocalVsCloudPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CloudGuide' })

  const badges = t.raw('badges') as string[]
  const costHeaders = t.raw('cost.tableHeaders') as string[]
  const costRows = t.raw('cost.tableRows') as string[][]
  const featHeaders = t.raw('features.tableHeaders') as string[]
  const featRows = t.raw('features.rows') as [string, boolean, boolean][]
  const privacyItems = t.raw('privacy.items') as PrivacyItem[]
  const whenCloudItems = t.raw('whenCloud.items') as string[]

  const pageUrl = `${siteUrl}/${locale}/guides/local-vs-cloud`
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
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-ghost-fill text-success border border-success">{badges[0]}</span>
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
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Cost Comparison */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-warning" />
                {t('cost.heading')}
              </h2>
              <p className="text-ink-muted mb-6 leading-relaxed">
                {t('cost.intro')}
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {costHeaders.map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-ink-muted font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {costRows.map((row, i) => (
                      <tr key={i} className={`hover:bg-ghost-fill transition-colors ${i === 4 ? 'text-success' : ''}`}>
                        <td className="py-3 px-4 font-medium">{row[0]}</td>
                        <td className="py-3 px-4 text-ink-muted">{row[1]}</td>
                        <td className="py-3 px-4">{row[2]}</td>
                        <td className={`py-3 px-4 font-semibold ${i === 4 ? 'text-success' : 'text-danger'}`}>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-faint">{t('cost.footnote')}</p>
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-3xl font-semibold text-ink mb-6">{t('features.heading')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left py-3 px-4 text-ink-muted font-semibold">{featHeaders[0]}</th>
                      <th className="text-center py-3 px-4 text-ink-muted font-semibold">{featHeaders[1]}</th>
                      <th className="text-center py-3 px-4 text-success font-semibold">{featHeaders[2]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {featRows.map(([feature, cloud, local], i) => (
                      <tr key={i} className="hover:bg-ghost-fill transition-colors">
                        <td className="py-3 px-4 text-ink">{feature}</td>
                        <td className="py-3 px-4 text-center">
                          {cloud
                            ? <Check className="w-5 h-5 text-success mx-auto" />
                            : <X className="w-5 h-5 text-danger mx-auto" />}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {local
                            ? <Check className="w-5 h-5 text-success mx-auto" />
                            : <X className="w-5 h-5 text-danger mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Datenschutz */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-success" />
                {t('privacy.heading')}
              </h2>
              <div className="text-ink space-y-4 leading-relaxed">
                <p>{t('privacy.intro')}</p>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {privacyItems.map(({ title, text }) => (
                  <div key={title} className="bg-surface border border-line rounded-md p-4 border border-line">
                    <h4 className="font-semibold text-success mb-2 text-sm">{title}</h4>
                    <p className="text-ink-muted text-sm">{text}</p>
                  </div>
                ))}
              </div>

              {/* Belegt das Datenschutz-Argument: selbst die KI-Funktionen
                  haben eine vollständig lokale Option. */}
              <AppScreenshot
                locale={locale}
                slug="ai-providers"
                alt={t('privacy.screenshotAlt')}
                caption={t('privacy.screenshotCaption')}
                className="mt-8"
              />
            </div>

            {/* Wann Cloud sinnvoll ist */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Cloud className="w-8 h-8 text-indigo-text" />
                {t('whenCloud.heading')}
              </h2>
              <p className="text-ink-muted mb-4">
                {t('whenCloud.intro')}
              </p>
              <ul className="space-y-3">
                {whenCloudItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-ink">
                    <div className="w-6 h-6 bg-indigo-soft border border-line rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-indigo-text font-semibold">{i + 1}</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-surface border border-line rounded-lg p-8 border border-line text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ghost-fill border border-line rounded-lg mb-6">
                <Laptop className="w-8 h-8 text-ink" />
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
