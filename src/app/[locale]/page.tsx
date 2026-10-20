import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, Check, CircleDot, Code2, HardDrive, Layers, Mail, MessagesSquare } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { VideoEmbed } from '@/components/VideoEmbed'
import { VIDEOS } from '@/lib/videos'
import { getFoundingMemberCount, getLatestRelease, FOUNDING_SPOTS } from '@/lib/landing-data'
import { appShotBase } from '@/components/landing/AppShot'
import { NeuronDiagram } from '@/components/landing/NeuronDiagram'
import { LoopPlayer } from '@/components/landing/LoopPlayer'
import { UseCaseSwitcher } from '@/components/landing/UseCaseSwitcher'
import { PricingCard, type PricingCopy } from '@/components/landing/PricingCard'
import { FaqList } from '@/components/landing/FaqList'
import { TrialButton, DemoButton, MobileCtaPill } from '@/components/landing/Ctas'

/*
 * Startseite im Design-System „Neuron" (V2).
 *
 * Server-Komponente: Hero, Kreislauf, Preise und FAQ stehen vollständig im
 * HTML – nichts wartet auf JavaScript oder einen Auth-Check. Interaktiv
 * sind nur kleine Inseln (Island, Rundgang, Use-Case-Wahl, Preis-Umschalter).
 *
 * Aufbau: Hero → Neuron-Diagramm → Kreislauf im App-Fenster → Drei Eingänge
 * → Einsteiger-Projekte → Messwerte → Alles in einer App → Demo → Vertrauen
 * → Preis → Coach → Was ist FrameTrain → FAQ → Indigo-Abschluss.
 */

// Version aus GitHub und Founding-Zähler stündlich auffrischen
export const revalidate = 3600

type Benefit = { title: string; text: string }
type Step = { key: string; label: string; title: string; text: string; shot: string; alt: string }
type Cell = { label: string; title: string; text: string }
type UseCase = { key: string; tag: string; title: string; text: string; stack: string[]; shot: string; alt: string; href?: string }
type Feature = { title: string; text: string; shot: string; alt: string; badge?: string }
type Spec = { label: string; value: string; note: string }
type Platform = { name: string; detail: string; status: string; level: 'ok' | 'exp' }
type FaqEntry = { question: string; answer: string }
type Chapter = { title: string; num: string }
type Reason = { title: string; description: string }

const COACH_HREFS = [
  '/docs/ai-training-guide/ml-grundlagen',
  '/docs/ai-training-guide/training-verstehen',
  '/docs/ai-training-guide/trainingsverlauf',
  '/docs/ai-training-guide/diagnose',
  '/docs/ai-training-guide/hyperparameter',
  '/docs/ai-training-guide/fine-tuning',
  '/docs/ai-training-guide/dataset-mastery',
  '/docs/ai-training-guide/fortgeschrittene',
]

function SectionHead({
  eyebrow,
  titleA,
  titleB,
  lead,
  align = 'left',
  id,
}: {
  eyebrow: string
  titleA: string
  titleB?: string
  lead?: string
  align?: 'left' | 'center'
  id?: string
}) {
  const center = align === 'center'
  return (
    <div className={`mb-12 md:mb-14 ${center ? 'text-center mx-auto' : ''} max-w-[760px]`}>
      <p className="ft-label m-0">{eyebrow}</p>
      <h2 id={id} className="ft-display-l mt-4 mb-0">
        {titleA}
        {titleB && (
          <>
            {' '}
            <span className="text-ink-muted">{titleB}</span>
          </>
        )}
      </h2>
      {lead && <p className={`ft-lead mt-5 mb-0 max-w-[620px] ${center ? 'mx-auto' : ''}`}>{lead}</p>}
    </div>
  )
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Landing')
  const tHome = await getTranslations('Home')
  const [release, foundingCount] = await Promise.all([getLatestRelease(), getFoundingMemberCount()])

  const benefits = t.raw('hero.benefits') as Benefit[]
  const steps = t.raw('loop.steps') as Step[]
  const cells = t.raw('io.cells') as Cell[]
  const useCases = t.raw('useCases.items') as UseCase[]
  const features = t.raw('features.items') as Feature[]
  const specs = t.raw('specs.items') as Spec[]
  const platforms = t.raw('trust.platforms.items') as Platform[]
  const privacy = t.raw('trust.privacy.items') as Benefit[]
  const chapters = tHome.raw('trainingCoach.chapters') as Chapter[]
  const reasons = tHome.raw('whyLocal.reasons') as Reason[]
  const faqItems = [...(t.raw('faqExtra') as FaqEntry[]), ...(tHome.raw('faq.items') as FaqEntry[])]
  const pricingCopy = t.raw('pricing') as PricingCopy

  const version = release?.version ?? '1.5'
  const releaseDate = release
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(release.publishedAt)
      )
    : null

  const benefitIcons = [Code2, HardDrive, Layers]
  const bold = (chunks: React.ReactNode) => <strong className="font-semibold text-ink">{chunks}</strong>

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }),
        }}
      />

      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section id="hero" className="ft-container pt-14 md:pt-[104px] text-center">
          <p className="ft-label m-0">{t('hero.eyebrow', { version })}</p>
          <h1 className="ft-display-xl mt-6 mb-0 mx-auto max-w-[980px]">
            {t('hero.titleA')} <span className="text-ink-muted">{t('hero.titleB')}</span>
          </h1>
          <p className="ft-lead mt-7 mb-0 mx-auto max-w-[600px]">{t('hero.lead')}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <TrialButton label={t('hero.ctaTrial')} dashboardLabel={t('hero.ctaDashboard')} from="hero" />
            <DemoButton label={t('hero.ctaDemo')} />
          </div>
          <p className="mt-5 ft-data text-ink-faint">{t('hero.note')}</p>

          <ul className="mt-16 grid gap-6 sm:grid-cols-3 text-left max-w-[900px] mx-auto p-0 list-none">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i] ?? Check
              return (
                <li key={b.title} className="flex gap-3.5">
                  <Icon className="w-5 h-5 mt-[3px] flex-none text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="m-0 text-[16px] font-semibold text-ink">{b.title}</p>
                    <p className="m-0 mt-1 text-[15px] leading-6 text-ink-muted">{b.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ── Neuron-Diagramm: das Logo in groß ───────────────── */}
        <section className="ft-container mt-16 md:mt-24" aria-label={t('neuron.aria')}>
          <NeuronDiagram
            aria={t('neuron.aria')}
            inputs={t.raw('neuron.inputs')}
            outputLabel={t('neuron.outputLabel')}
            outputTitle={t('neuron.outputTitle')}
            outputFile={t('neuron.outputFile')}
            exportLabel={t('neuron.export')}
          />
        </section>

        {/* ── Der Kreislauf im App-Fenster ─────────────────────── */}
        <section id="loop" className="ft-container ft-section scroll-mt-24">
          <SectionHead eyebrow={t('loop.eyebrow')} titleA={t('loop.titleA')} titleB={t('loop.titleB')} lead={t('loop.lead')} />
          <LoopPlayer
            steps={steps}
            locale={locale}
            loopBack={t('loop.loopBack')}
            pauseLabel={t('loop.pause')}
            playLabel={t('loop.play')}
          />
        </section>

        {/* ── Drei Eingänge, ein Ergebnis ──────────────────────── */}
        <section className="ft-container pb-[72px] md:pb-[104px]">
          <SectionHead eyebrow={t('io.eyebrow')} titleA={t('io.titleA')} titleB={t('io.titleB')} />
          <div className="ft-io">
            {cells.map((c, i) => (
              <div key={c.label} className={`ft-io__cell ${i === cells.length - 1 ? 'ft-io__cell--output' : ''}`}>
                <span className={`ft-label flex items-center gap-2.5 ${i === cells.length - 1 ? '!text-output-text' : ''}`}>
                  <span className="ft-io__node" aria-hidden="true" />
                  {c.label}
                </span>
                <h3 className="ft-heading m-0">{c.title}</h3>
                <p className="ft-small m-0">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Einsteiger-Projekte ──────────────────────────────── */}
        <section className="border-t border-line">
          <div className="ft-container ft-section">
            <SectionHead
              eyebrow={t('useCases.eyebrow')}
              titleA={t('useCases.titleA')}
              titleB={t('useCases.titleB')}
              lead={t('useCases.lead')}
            />
            <UseCaseSwitcher items={useCases} locale={locale} learnMore={t('useCases.learnMore')} />
          </div>
        </section>

        {/* ── Messwerte ───────────────────────────────────────── */}
        <section className="border-y border-line bg-surface" aria-label={t('specs.label')}>
          <dl className="ft-container py-14 md:py-16 grid gap-10 grid-cols-2 lg:grid-cols-4 m-0">
            {specs.map((s) => (
              <div key={s.label}>
                <dt className="ft-label">{s.label}</dt>
                <dd className="m-0 mt-3 ft-stat">{s.value}</dd>
                <dd className="m-0 mt-2 text-[14px] leading-[22px] text-ink-muted">{s.note}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Alles in einer App ───────────────────────────────── */}
        <section id="features" className="ft-container ft-section scroll-mt-24">
          <SectionHead
            eyebrow={t('features.eyebrow')}
            titleA={t('features.titleA')}
            titleB={t('features.titleB')}
            lead={t('features.lead')}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((f) => (
              <article key={f.title} className="ft-card flex flex-col gap-3 !p-0 overflow-hidden">
                <div className="p-7 pb-2">
                  <h3 className="ft-heading m-0 flex items-center gap-3">
                    {f.title}
                    {f.badge && <span className="ft-label !text-indigo-text">{f.badge}</span>}
                  </h3>
                  <p className="ft-small mt-3 mb-0">{f.text}</p>
                </div>
                <div className="mt-auto ml-7 rounded-tl-md overflow-hidden border-t border-l border-line aspect-[16/10]">
                  {/* Ausschnitt oben links – dort sitzt in jeder Ansicht das Wesentliche */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${appShotBase(locale, f.shot)}.webp`}
                    srcSet={`${appShotBase(locale, f.shot)}.webp 1200w, ${appShotBase(locale, f.shot)}@2x.webp 2400w`}
                    sizes="(min-width: 1120px) 900px, 160vw"
                    width={1200}
                    height={772}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-[160%] max-w-none h-auto block"
                  />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/screenshots" className="ft-link inline-flex items-center gap-1.5 text-[16px] font-medium">
              {t('features.cta')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── Demo-Videos ─────────────────────────────────────── */}
        <section id="demo" className="border-t border-line scroll-mt-24">
          <div className="ft-container ft-section">
            <SectionHead eyebrow={t('demo.eyebrow')} titleA={t('demo.titleA')} titleB={t('demo.titleB')} lead={t('demo.lead')} />
            <div className="grid gap-4 md:grid-cols-2">
              <VideoEmbed
                id={VIDEOS.install}
                title={tHome('howItWorks.videos.installTitle')}
                poster={`${appShotBase(locale, 'home')}.webp`}
              />
              <VideoEmbed
                id={VIDEOS.train}
                title={tHome('howItWorks.videos.trainTitle')}
                poster={`${appShotBase(locale, 'training')}.webp`}
              />
            </div>
          </div>
        </section>

        {/* ── Vertrauen ───────────────────────────────────────── */}
        <section id="trust" className="border-t border-line bg-surface">
          <div className="ft-container ft-section">
            <SectionHead eyebrow={t('trust.eyebrow')} titleA={t('trust.titleA')} titleB={t('trust.titleB')} />

            <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              {/* Gründer */}
              <article className="rounded-lg border border-line bg-bg p-7 sm:p-9 flex flex-col">
                <div className="flex items-center gap-4">
                  {/* TODO: echtes Foto unter /images/founder.webp einsetzen */}
                  <div
                    className="w-14 h-14 rounded-pill bg-indigo-soft text-indigo-text flex items-center justify-center font-semibold text-[18px] tracking-[-0.01em]"
                    aria-hidden="true"
                  >
                    KP
                  </div>
                  <div>
                    <p className="m-0 text-[17px] font-semibold text-ink">{t('trust.founder.name')}</p>
                    <p className="m-0 ft-data text-ink-faint">{t('trust.founder.role')}</p>
                  </div>
                </div>
                <p className="mt-6 mb-0 text-[17px] leading-[29px] text-ink-muted">{t('trust.founder.text')}</p>
                <Link href="/about" className="ft-link mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium self-start">
                  {t('trust.founder.cta')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </article>

              {/* Plattform-Status + Build in Public */}
              <div className="grid gap-4">
                <div className="rounded-lg border border-line bg-bg p-7">
                  <h3 className="ft-label m-0">{t('trust.platforms.heading')}</h3>
                  <ul className="mt-4 p-0 list-none divide-y divide-line">
                    {platforms.map((p) => (
                      <li key={p.name} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="m-0 text-[16px] font-semibold text-ink">{p.name}</p>
                          <p className="m-0 ft-data text-ink-faint">{p.detail}</p>
                        </div>
                        <span className="flex items-center gap-2 ft-data text-ink-muted whitespace-nowrap">
                          <span
                            className={`block w-[7px] h-[7px] rounded-pill ${p.level === 'ok' ? 'bg-success' : 'bg-warning'}`}
                            aria-hidden="true"
                          />
                          {p.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="m-0 mt-2 ft-data text-ink-faint">{t('trust.platforms.intel')}</p>
                </div>

                <div className="rounded-lg border border-line bg-bg p-7">
                  <h3 className="ft-label m-0">{t('trust.build.heading')}</h3>
                  {release && (
                    <p className="m-0 mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-[15px] text-ink-muted">{t('trust.build.latest')}</span>
                      <span className="font-mono text-[20px] text-ink">v{release.version}</span>
                      {releaseDate && (
                        <span className="ft-data text-ink-faint">{t('trust.build.released', { date: releaseDate })}</span>
                      )}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/changelog" className="ft-btn ft-btn--ghost ft-btn--sm">
                      {t('trust.build.changelog')}
                    </Link>
                    <a
                      href={release?.url ?? 'https://github.com/FrameSphere/FrameTrain-App/releases'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ft-btn ft-btn--ghost ft-btn--sm"
                    >
                      {t('trust.build.github')}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Datenschutz – exakt formuliert */}
            <div className="mt-4 rounded-lg border border-line bg-bg">
              <h3 className="ft-label m-0 px-7 pt-6">{t('trust.privacy.heading')}</h3>
              <ul className="grid md:grid-cols-3 p-0 m-0 list-none">
                {privacy.map((p, i) => (
                  <li key={p.title} className={`p-7 ${i > 0 ? 'border-t md:border-t-0 md:border-l border-line' : ''}`}>
                    <p className="m-0 flex items-center gap-2.5 text-[16px] font-semibold text-ink">
                      <CircleDot className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                      {p.title}
                    </p>
                    <p className="m-0 mt-2 text-[15px] leading-6 text-ink-muted">{p.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support-Wege: nur die, die es wirklich gibt */}
            <div className="mt-4 rounded-lg border border-line bg-bg p-7 flex flex-col md:flex-row md:items-center gap-5 justify-between">
              <div>
                <h3 className="ft-label m-0">{t('trust.support.heading')}</h3>
                <p className="m-0 mt-2 text-[16px] text-ink-muted">{t('trust.support.text')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="mailto:framesphere@gmx.net" className="ft-btn ft-btn--ghost ft-btn--sm">
                  <Mail className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                  {t('trust.support.email')}
                </a>
                <a
                  href="https://www.reddit.com/r/FrameTrain/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-btn ft-btn--ghost ft-btn--sm"
                >
                  <MessagesSquare className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                  {t('trust.support.reddit')}
                </a>
              </div>
            </div>
            {/* Nutzerstimmen: Platz ist vorgesehen, erscheinen aber erst mit
                echten, freigegebenen Zitaten (Name oder Handle). */}
          </div>
        </section>

        {/* ── Preis ───────────────────────────────────────────── */}
        <section id="pricing" className="ft-container ft-section scroll-mt-24">
          <SectionHead
            eyebrow={t('pricing.eyebrow')}
            titleA={t('pricing.titleA')}
            titleB={t('pricing.titleB')}
            lead={t('pricing.lead')}
          />
          <PricingCard copy={pricingCopy} foundingCount={foundingCount} foundingSpots={FOUNDING_SPOTS} />
        </section>

        {/* ── KI Training Coach ───────────────────────────────── */}
        <section className="border-t border-line">
          <div className="ft-container ft-section grid gap-12 lg:grid-cols-[1fr_1fr] items-start">
            <div>
              <SectionHead eyebrow={t('coach.eyebrow')} titleA={t('coach.titleA')} titleB={t('coach.titleB')} lead={t('coach.lead')} />
              <div className="flex flex-wrap items-center gap-5 -mt-4">
                <Link href="/docs/ai-training-guide" className="ft-btn ft-btn--ghost">
                  {t('coach.cta')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
                <Link href="/guides" className="ft-link text-[15px] font-medium">
                  {t('coach.guides')}
                </Link>
              </div>
            </div>
            <ol className="m-0 p-0 list-none border-t border-line">
              {chapters.map((ch, i) => (
                <li key={ch.title} className="border-b border-line">
                  <Link
                    href={COACH_HREFS[i] ?? '/docs/ai-training-guide'}
                    className="group flex items-center gap-5 py-4 text-ink-muted hover:text-ink transition-colors duration-150"
                  >
                    <span className="ft-label w-6">{ch.num}</span>
                    <span className="flex-1 text-[17px] font-medium">{ch.title}</span>
                    <ArrowRight
                      className="w-4 h-4 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Was ist FrameTrain? (SEO-Text) ──────────────────── */}
        <section id="about" className="border-t border-line bg-surface">
          <div className="ft-container ft-section grid gap-14 lg:grid-cols-2">
            <div>
              <h2 className="ft-display-l m-0">{t('about.titleA')}</h2>
              <div className="mt-8 flex flex-col gap-5 text-[17px] leading-[29px] text-ink-muted max-w-[62ch]">
                <p className="m-0">{tHome.rich('whatIs.paragraph1', { b: bold })}</p>
                <p className="m-0">{tHome.rich('whatIs.paragraph2', { b: bold })}</p>
                <p className="m-0">{tHome.rich('whatIs.paragraph3', { b: bold })}</p>
                <p className="m-0">{tHome('whatIs.paragraph4')}</p>
              </div>
            </div>
            <div>
              <h2 className="ft-display-l m-0">{t('about.whyTitle')}</h2>
              <ol className="mt-8 p-0 list-none border-t border-line">
                {reasons.map((r, i) => (
                  <li key={r.title} className="py-5 border-b border-line flex gap-5">
                    <span className="ft-label w-6 pt-1">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="m-0 text-[17px] font-semibold text-ink">{r.title}</h3>
                      <p className="m-0 mt-1.5 text-[15px] leading-6 text-ink-muted">{r.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section id="faq" className="ft-container ft-section scroll-mt-24 grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="ft-display-l m-0">{t('faqTitle')}</h2>
            <Link href="/faq" className="ft-link mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium">
              {t('faqMore')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
          <FaqList items={faqItems} />
        </section>

        {/* ── Indigo-Abschluss ────────────────────────────────── */}
        <section id="final-cta" className="ft-container pb-[72px] md:pb-[104px]">
          <div className="rounded-xl bg-indigo p-8 sm:p-12 md:p-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-[560px]">
              <h2 className="m-0 font-semibold text-[34px] md:text-[52px] leading-[1.04] tracking-[-0.04em] text-on-indigo">
                {t('finalCta.title')}
              </h2>
              <p className="m-0 mt-5 text-[18px] leading-[29px] text-on-indigo-muted">{t('finalCta.lead')}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <TrialButton
                  label={t('finalCta.primary')}
                  dashboardLabel={t('hero.ctaDashboard')}
                  from="final_cta"
                  variant="on-indigo"
                />
                <DemoButton label={t('finalCta.secondary')} variant="on-indigo-outline" />
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo */}
            <img
              src="/brand/frametrain-mark-on-dark.svg"
              alt=""
              width={240}
              height={213}
              className="w-[160px] md:w-[220px] h-auto self-center md:self-auto"
            />
          </div>
        </section>
      </main>

      <Footer />

      <MobileCtaPill cta={t('mobilePill.cta')} price={t('mobilePill.price')} heroId="hero" endId="final-cta" />
    </div>
  )
}
