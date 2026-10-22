import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Check, Minus, X } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FaqList } from '@/components/landing/FaqList'
import { AppShot } from '@/components/landing/AppShot'
import { TrialButton } from '@/components/landing/Ctas'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'

/*
 * Gemeinsamer Renderer für Zielgruppen- und Vergleichsseiten.
 *
 * Der komplette Inhalt einer Seite lebt in messages/<locale>.json unter einem
 * eigenen Namespace (z. B. "PageComputerVision"); hier steht nur, WIE die
 * Bausteine aussehen. Server-Komponente: alles landet im HTML, eine H1 pro
 * Seite, H2 pro Abschnitt, H3 darunter.
 */

type Item = { title: string; text: string }
type Section =
  | { type: 'points'; eyebrow?: string; title: string; lead?: string; items: Item[] }
  | { type: 'steps'; eyebrow?: string; title: string; lead?: string; items: Item[]; shot?: string; shotAlt?: string }
  | { type: 'table'; eyebrow?: string; title: string; lead?: string; cols: string[]; rows: string[][]; note?: string }
  | { type: 'text'; eyebrow?: string; title: string; paragraphs: string[] }
  | { type: 'choose'; eyebrow?: string; title: string; cards: { title: string; items: string[] }[] }
  | { type: 'shot'; slug: string; alt: string; caption?: string }

type Crumb = { name: string; path: string }
type FaqEntry = { question: string; answer: string }

export async function marketingMetadata(locale: string, ns: string, path: string, index = true): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: ns })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({ locale, path, title, description, type: 'article' }),
    ...(index ? {} : { robots: { index: false, follow: true } }),
  }
}

const bold = (chunks: React.ReactNode) => <strong className="font-semibold text-ink">{chunks}</strong>

// Bewusst neutral: Haken/Kreuz heißen nur "ja/nein", nicht "gut/schlecht" –
// manche Zeilen beschreiben einen Nachteil (z. B. "Programmieren nötig").
function Cell({ value, labels }: { value: string; labels: { yes: string; no: string; partial: string } }) {
  if (value === 'yes')
    return (
      <span className="inline-flex items-center gap-2 text-ink">
        <Check className="w-4 h-4 text-ink" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{labels.yes}</span>
      </span>
    )
  if (value === 'no')
    return (
      <span className="inline-flex items-center gap-2 text-ink-faint">
        <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{labels.no}</span>
      </span>
    )
  if (value === 'partial')
    return (
      <span className="inline-flex items-center gap-2 text-ink-muted">
        <Minus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{labels.partial}</span>
      </span>
    )
  return <span>{value}</span>
}

function Head({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="mb-10 max-w-[720px]">
      {eyebrow && <p className="ft-label m-0 mb-4">{eyebrow}</p>}
      <h2 className="ft-display-l m-0 !text-[32px] md:!text-[42px]">{title}</h2>
      {lead && <p className="ft-lead mt-4 mb-0">{lead}</p>}
    </div>
  )
}

export async function MarketingPage({ locale, ns, path }: { locale: string; ns: string; path: string }) {
  const t = await getTranslations({ locale, namespace: ns })
  const tCommon = await getTranslations({ locale, namespace: 'Marketing' })

  const crumbs = t.raw('breadcrumb') as Crumb[]
  const sections = t.raw('sections') as Section[]
  const faq = (t.has('faq') ? t.raw('faq') : []) as FaqEntry[]
  const related = (t.has('related') ? t.raw('related') : []) as { href: string; label: string }[]
  const heroShot = t.has('heroShot') ? (t('heroShot') as string) : null
  const labels = { yes: tCommon('yes'), no: tCommon('no'), partial: tCommon('partial') }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: tCommon('home'), path: '' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${siteUrl}/${locale}${c.path}`,
    })),
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
            }),
          }}
        />
      )}

      <Header />

      <main className="flex-1">
        {/* Brotkrumen */}
        <nav aria-label="Breadcrumb" className="ft-container pt-6">
          <ol className="flex flex-wrap items-center gap-2 p-0 m-0 list-none ft-data text-ink-faint">
            <li>
              <Link href="/" className="hover:text-ink transition-colors duration-150">
                {tCommon('home')}
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-ink-muted">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="hover:text-ink transition-colors duration-150">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero */}
        <section className="ft-container pt-12 md:pt-20">
          <p className="ft-label m-0">{t('eyebrow')}</p>
          <h1 className="ft-display-l mt-5 mb-0 max-w-[900px] !text-[38px] md:!text-[60px]">
            {t('titleA')} {t.has('titleB') && <span className="text-ink-muted">{t('titleB')}</span>}
          </h1>
          <p className="ft-lead mt-6 mb-0 max-w-[640px]">{t.rich('lead', { b: bold })}</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <TrialButton label={tCommon('trial')} dashboardLabel={tCommon('dashboard')} from={`page_${ns}`} />
            <Link href="/#demo" className="ft-btn ft-btn--ghost">
              {tCommon('demo')}
            </Link>
          </div>
          <p className="mt-4 ft-data text-ink-faint">{tCommon('trialNote')}</p>
          {heroShot && (
            <div className="ft-window mt-14">
              <AppShot locale={locale} slug={heroShot} alt={t('heroShotAlt')} priority />
            </div>
          )}
        </section>

        {sections.map((s, i) => {
          const wrap = (children: React.ReactNode, tinted = false) => (
            <section key={i} className={`border-t border-line ${tinted ? 'bg-surface' : ''}`}>
              <div className="ft-container ft-section">{children}</div>
            </section>
          )

          if (s.type === 'points')
            return wrap(
              <>
                <Head eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
                <div className="ft-io">
                  {s.items.map((it) => (
                    <div key={it.title} className="ft-io__cell">
                      <span className="ft-io__node" aria-hidden="true" />
                      <h3 className="ft-heading m-0">{it.title}</h3>
                      <p className="ft-small m-0">{t.rich(`sections.${i}.items.${s.items.indexOf(it)}.text`, { b: bold })}</p>
                    </div>
                  ))}
                </div>
              </>
            )

          if (s.type === 'steps')
            return wrap(
              <>
                <Head eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
                <div className={`grid gap-10 ${s.shot ? 'lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]' : ''} items-start`}>
                  <ol className="m-0 p-0 list-none border-t border-line">
                    {s.items.map((it, k) => (
                      <li key={it.title} className="py-5 border-b border-line flex gap-5">
                        <span className="ft-label w-6 pt-1">{String(k + 1).padStart(2, '0')}</span>
                        <div>
                          <h3 className="m-0 text-[17px] font-semibold text-ink">{it.title}</h3>
                          <p className="m-0 mt-1.5 text-[15px] leading-6 text-ink-muted">{t.rich(`sections.${i}.items.${k}.text`, { b: bold })}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {s.shot && (
                    <div className="ft-window lg:sticky lg:top-28">
                      <AppShot locale={locale} slug={s.shot} alt={s.shotAlt ?? ''} sizes="(min-width: 1120px) 660px, 100vw" />
                    </div>
                  )}
                </div>
              </>,
              true
            )

          if (s.type === 'table')
            return wrap(
              <>
                <Head eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
                {/* Handy: jede Zeile als eigener Block, damit nichts seitlich verschwindet */}
                <dl className="md:hidden m-0 rounded-lg border border-line divide-y divide-line overflow-hidden">
                  {s.rows.map((row, r) => (
                    <div key={r} className="px-5 py-4">
                      <dt className="text-[15px] font-medium text-ink">{row[0]}</dt>
                      {row.slice(1).map((cell, k) => (
                        <dd key={k} className="m-0 mt-2 flex items-center justify-between gap-4 text-[14px] text-ink-muted">
                          <span className="ft-label !text-[10px]">{s.cols[k + 1]}</span>
                          <span className="text-right">
                            <Cell value={cell} labels={labels} />
                          </span>
                        </dd>
                      ))}
                    </div>
                  ))}
                </dl>
                <div className="hidden md:block overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
                    <thead>
                      <tr className="bg-surface-raised">
                        {s.cols.map((c, k) => (
                          <th key={k} scope="col" className="px-5 py-3.5 ft-label !text-ink-muted font-medium">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.rows.map((row, r) => (
                        <tr key={r} className="border-t border-line">
                          {row.map((cell, k) =>
                            k === 0 ? (
                              <th key={k} scope="row" className="px-5 py-3.5 font-medium text-ink align-top">
                                {cell}
                              </th>
                            ) : (
                              <td key={k} className={`px-5 py-3.5 align-top text-ink-muted ${k === 1 ? 'bg-surface' : ''}`}>
                                <Cell value={cell} labels={labels} />
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {s.note && <p className="mt-4 mb-0 ft-data text-ink-faint">{s.note}</p>}
              </>
            )

          if (s.type === 'text')
            return wrap(
              <div className="max-w-[720px]">
                {s.eyebrow && <p className="ft-label m-0 mb-4">{s.eyebrow}</p>}
                <h2 className="ft-display-l m-0 !text-[32px] md:!text-[42px]">{s.title}</h2>
                <div className="mt-8 flex flex-col gap-5 text-[17px] leading-[29px] text-ink-muted">
                  {s.paragraphs.map((_, k) => (
                    <p key={k} className="m-0">
                      {t.rich(`sections.${i}.paragraphs.${k}`, { b: bold })}
                    </p>
                  ))}
                </div>
              </div>
            )

          if (s.type === 'choose')
            return wrap(
              <>
                <Head eyebrow={s.eyebrow} title={s.title} />
                <div className="grid gap-4 md:grid-cols-2">
                  {s.cards.map((c, k) => (
                    <div key={c.title} className={`rounded-lg border p-7 ${k === 0 ? 'bg-surface border-line-strong' : 'bg-bg border-line'}`}>
                      <h3 className="ft-heading m-0">{c.title}</h3>
                      <ul className="mt-5 p-0 list-none flex flex-col gap-3">
                        {c.items.map((it) => (
                          <li key={it} className="flex gap-3 text-[15px] leading-6 text-ink-muted">
                            <Check className="w-4 h-4 mt-1 flex-none text-ink-faint" strokeWidth={1.5} aria-hidden="true" />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>,
              true
            )

          if (s.type === 'shot')
            return (
              <section key={i} className="ft-container pb-16">
                <figure className="m-0">
                  <div className="ft-window">
                    <AppShot locale={locale} slug={s.slug} alt={s.alt} />
                  </div>
                  {s.caption && <figcaption className="mt-3 ft-data text-ink-faint">{s.caption}</figcaption>}
                </figure>
              </section>
            )
          return null
        })}

        {faq.length > 0 && (
          <section className="border-t border-line">
            <div className="ft-container ft-section grid gap-12 lg:grid-cols-[1fr_1.6fr]">
              <h2 className="ft-display-l m-0 !text-[32px] md:!text-[42px]">{tCommon('faqTitle')}</h2>
              <FaqList items={faq} />
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="border-t border-line">
            <div className="ft-container py-14">
              <h2 className="ft-label m-0">{tCommon('related')}</h2>
              <ul className="mt-5 p-0 list-none grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <li key={r.href} className="border-b border-line">
                    <Link href={r.href} className="group flex items-center justify-between gap-4 py-4 text-[16px] text-ink-muted hover:text-ink transition-colors duration-150">
                      {r.label}
                      <ArrowRight className="w-4 h-4 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Indigo-Abschluss */}
        <section className="ft-container pb-[72px] md:pb-[104px] pt-4">
          <div className="rounded-xl bg-indigo p-8 sm:p-12 md:p-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-[560px]">
              <h2 className="m-0 font-semibold text-[32px] md:text-[48px] leading-[1.04] tracking-[-0.04em] text-on-indigo">{t('ctaTitle')}</h2>
              <p className="m-0 mt-5 text-[18px] leading-[29px] text-on-indigo-muted">{tCommon('ctaLead')}</p>
              <div className="mt-9">
                <TrialButton label={tCommon('trial')} dashboardLabel={tCommon('dashboard')} from={`page_${ns}_cta`} variant="on-indigo" />
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo */}
            <img src="/brand/frametrain-mark-on-dark.svg" alt="" width={220} height={196} className="w-[140px] md:w-[200px] h-auto" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
