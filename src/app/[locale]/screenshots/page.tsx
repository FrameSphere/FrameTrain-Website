import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppScreenshot, screenshotUrl, SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT } from '@/components/AppScreenshot'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'
import { ArrowRight, ChevronRight, Check, Download, Sparkles } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

const PATH = '/screenshots'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Screenshots' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, PATH),
    openGraph: pageOpenGraph({
      locale,
      path: PATH,
      title: t('ogTitle'),
      description: t('ogDescription'),
    }),
  }
}

type ShotItem = {
  id: string
  slug: string
  title: string
  text: string
  alt: string
  caption: string
  bullets: string[]
  relatedHref?: string
  relatedLabel?: string
  beta?: boolean
}

export default async function ScreenshotsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Screenshots' })
  const items = t.raw('items') as ShotItem[]

  const pageUrl = `${siteUrl}/${locale}${PATH}`

  // Die Screenshots sind der eigentliche Inhalt dieser Seite – deshalb liegen
  // sie als ImageObject im Markup (Google Bildersuche liest Caption und
  // Beschreibung daraus) und zusätzlich als `screenshot` an der App selbst.
  const images = items.map((item) => ({
    '@type': 'ImageObject',
    contentUrl: screenshotUrl(siteUrl, locale, item.slug),
    url: `${pageUrl}#${item.id}`,
    width: SCREENSHOT_WIDTH,
    height: SCREENSHOT_HEIGHT,
    encodingFormat: 'image/webp',
    name: item.title,
    caption: item.caption,
    description: item.alt,
    representativeOfPage: item.slug === 'training',
    inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
    creditText: 'FrameTrain',
    license: `${siteUrl}/${locale}/terms`,
  }))

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
        '@type': 'ImageGallery',
        name: t('ogTitle'),
        description: t('metaDescription'),
        url: pageUrl,
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'FrameTrain' },
        associatedMedia: images,
      },
      {
        // Dieselbe @id wie im Root-Layout: Google führt beide Knoten zu einer
        // Entität zusammen, statt zwei konkurrierende Apps zu sehen. Diese
        // Seite steuert nur die Screenshots bei.
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'FrameTrain',
        screenshot: items.map((item) => screenshotUrl(siteUrl, locale, item.slug)),
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
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-gray-300">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-14 sm:py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-full bg-purple-500/15 text-purple-300/90 border border-purple-500/25 mb-5">
              {t('badge')}
            </span>
            <h1 className="text-[2.1rem] sm:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-[-0.02em]">
              {t('h1Line1')}<br />
              <span className="text-gradient-brand">{t('h1Line2')}</span>
            </h1>
            <p className="text-lg text-gray-400 leading-[1.7] max-w-[70ch]">
              {t('intro')}
            </p>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-[70ch]">
              {t('introNote')}
            </p>
          </div>
        </section>

        {/* Sprungmarken: bei elf Abschnitten ist die Seite lang genug, dass
            Scrollen allein keine Orientierung mehr gibt. */}
        <nav aria-label={t('jumpHeading')} className="px-4 py-8 border-b border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">
              {t('jumpHeading')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {items.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="press inline-flex items-center gap-2 px-3 py-1.5 glass border border-white/[0.08] rounded-lg text-[13px] text-gray-400 hover:text-white hover:border-white/20 transition-colors duration-[180ms]"
                  >
                    <span className="nums font-mono text-[11px] text-gray-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.title.split('–')[0].trim()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Abschnitte */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {items.map((item, i) => (
              <article
                key={item.id}
                id={item.id}
                className="scroll-mt-28 glass-strong rounded-2xl p-6 sm:p-8 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="nums font-mono text-xs text-gray-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.beta && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300/90 border border-cyan-500/25">
                      {t('betaLabel')}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-[26px] font-bold text-white mb-4 leading-[1.25]">
                  {item.title}
                </h2>

                <p className="text-[15px] sm:text-base text-gray-400 leading-[1.75] mb-7 max-w-[70ch]">
                  {item.text}
                </p>

                <AppScreenshot
                  locale={locale}
                  slug={item.slug}
                  alt={item.alt}
                  caption={item.caption}
                />

                <ul className="mt-7 grid sm:grid-cols-3 gap-3">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[14px] text-gray-300 leading-[1.6]">
                      <Check className="w-4 h-4 text-green-400/90 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {item.relatedHref && (
                  <Link
                    href={item.relatedHref}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-purple-400/90 hover:text-purple-300 transition-colors group"
                  >
                    {item.relatedLabel ?? t('relatedLabel')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-2xl p-8 sm:p-10 border border-purple-500/20 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('ctaHeading')}</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">{t('ctaText')}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/register" className="press relative group inline-block px-7 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                  <span className="relative flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-[18px] h-[18px]" />
                    {t('ctaStart')}
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </span>
                </Link>
                <Link
                  href="/download"
                  className="press glass px-6 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.09] transition-colors duration-200 font-semibold inline-flex items-center gap-2"
                >
                  <Download className="w-[18px] h-[18px]" />
                  {t('ctaDownload')}
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
