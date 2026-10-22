import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTranslations, useLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph, siteUrl } from '@/lib/seo'
import {
  Sparkles, Heart, Shield, Zap, Brain, Globe, Lock,
  Code2, Cpu, ArrowRight, Github, Users, Rocket, Star,
  Target, Eye, Lightbulb
} from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/about'),
    openGraph: pageOpenGraph({
      locale,
      path: '/about',
      title: t('ogTitle'),
      description: t('ogDescription'),
    }),
  }
}

const valueIcons = [<Lock key="0" className="w-7 h-7" />, <Zap key="1" className="w-7 h-7" />, <Globe key="2" className="w-7 h-7" />, <Code2 key="3" className="w-7 h-7" />]
const valueColors = [' ', ' ', ' ', ' ']

const milestoneIcons = [<Rocket key="0" className="w-5 h-5" />, <Cpu key="1" className="w-5 h-5" />, <Star key="2" className="w-5 h-5" />, <Lightbulb key="3" className="w-5 h-5" />]

const colorMap: Record<string, string> = {
  purple: 'bg-indigo-soft border-line text-indigo-text',
  blue: 'bg-indigo-soft border-line text-indigo-text',
  pink: 'bg-indigo-soft border-line text-indigo-text',
  green: 'bg-ghost-fill border-success text-success',
}

const categoryColors: Record<string, string> = {
  ML: 'text-indigo-text bg-indigo-soft border-line',
  App: 'text-indigo-text bg-indigo-soft border-line',
  Web: 'text-indigo-text bg-indigo-soft border-line',
  HW: 'text-warning bg-ghost-fill border-line',
}

const statColors: Record<string, string> = {
  0: ' ',
  1: ' ',
  2: ' ',
  3: ' ',
}
const statIcons = [<Lock key="0" className="w-5 h-5" />, <Globe key="1" className="w-5 h-5" />, <Cpu key="2" className="w-5 h-5" />, <Sparkles key="3" className="w-5 h-5" />]

type ValueItem = { title: string; description: string }
type TechItem = { name: string; desc: string; category: string }
type Milestone = { date: string; title: string; desc: string; color: string; future?: boolean }
type StatItem = { number: string; label: string }

export default function AboutPage() {
  const t = useTranslations('About')
  const locale = useLocale()

  const values = t.raw('values.items') as ValueItem[]
  const techStack = t.raw('techStack.items') as TechItem[]
  const milestones = t.raw('milestones.items') as Milestone[]
  const stats = t.raw('stats') as StatItem[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t('metaTitle'), item: `${siteUrl}/${locale}/about` },
        ],
      },
      {
        '@type': 'AboutPage',
        name: t('metaTitle'),
        description: t('metaDescription'),
        url: `${siteUrl}/${locale}/about`,
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        mainEntity: {
          '@type': 'Organization',
          name: 'FrameTrain',
          url: siteUrl,
          logo: `${siteUrl}/favicon.svg`,
          sameAs: ['https://github.com/FrameSphere/FrameTrain-App'],
        },
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

        {/* ─── HERO ─── */}
        <section className="relative py-28 px-4 overflow-hidden">
          <div className="absolute inset-0 via-transparent  pointer-events-none" />

          <div className="max-w-4xl mx-auto relative text-center">
            <div className="inline-flex items-center gap-2 bg-surface border border-line px-4 py-2 rounded-full text-sm text-ink-muted mb-8 border border-line">
              <Heart className="w-3.5 h-3.5 text-indigo-text fill-indigo-text" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 leading-tight">
              <span className="text-ink">
                {t('hero.titleLine1')}
              </span>
              <br />
              <span className="text-ink">{t('hero.titleLine2')}</span>
            </h1>

            <p className="text-lg md:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* ─── ORIGIN STORY ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface border border-line rounded-xl p-10 md:p-14 border border-line relative overflow-hidden">
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-ghost-fill border border-line rounded-md flex items-center justify-center">
                    <Brain className="w-5 h-5 text-ink" />
                  </div>
                  <h2 className="text-3xl font-semibold text-ink">{t('origin.heading')}</h2>
                </div>

                <div className="space-y-5 text-ink text-lg leading-relaxed">
                  <p>{t('origin.p1')}</p>
                  <p>{t.rich('origin.p2', { b: (chunks) => <span className="text-ink font-semibold">{chunks}</span> })}</p>
                  <p>{t.rich('origin.p3', { b2: (chunks) => <span className="text-indigo-text font-semibold">{chunks}</span> })}</p>
                  <p>{t.rich('origin.p4', { b3: (chunks) => <span className="text-success font-semibold">{chunks}</span> })}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MISSION / VISION ─── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-line rounded-xl p-10 border border-line relative overflow-hidden group transition-transform duration-300">
              <div className="absolute inset-0 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-ghost-fill border border-line rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-ink" />
                </div>
                <h2 className="text-2xl font-semibold text-ink mb-4">{t('mission.heading')}</h2>
                <p className="text-ink text-lg leading-relaxed">{t('mission.text')}</p>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-xl p-10 border border-line relative overflow-hidden group transition-transform duration-300">
              <div className="absolute inset-0 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-ghost-fill border border-line rounded-lg flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6 text-ink" />
                </div>
                <h2 className="text-2xl font-semibold text-ink mb-4">{t('vision.heading')}</h2>
                <p className="text-ink text-lg leading-relaxed">{t('vision.text')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VALUES ─── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-semibold text-ink mb-4">{t('values.heading')}</h2>
              <p className="text-ink-muted text-lg max-w-xl mx-auto">{t('values.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <div key={v.title} className="bg-surface border border-line rounded-lg p-8 border border-line transition-transform duration-300">
                  <div className={`w-14 h-14 ${valueColors[i]} rounded-lg flex items-center justify-center mb-6 text-ink`}>
                    {valueIcons[i]}
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">{v.title}</h3>
                  <p className="text-ink-muted leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TECH STACK ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface border border-line rounded-xl p-10 border border-line">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-ghost-fill border border-line rounded-md flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-ink" />
                </div>
                <h2 className="text-3xl font-semibold text-ink">{t('techStack.heading')}</h2>
              </div>
              <p className="text-ink-muted mb-8 leading-relaxed">{t('techStack.intro')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {techStack.map((item) => (
                  <div key={item.name} className="card-lift bg-surface border border-line rounded-md px-5 py-4 border border-line flex items-center justify-between gap-4 hover:bg-ghost-fill transition-colors">
                    <div>
                      <div className="text-ink font-semibold text-sm">{item.name}</div>
                      <div className="text-ink-faint text-xs mt-0.5">{item.desc}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border flex-shrink-0 ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── MILESTONES ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-semibold text-ink mb-4">{t('milestones.heading')}</h2>
              <p className="text-ink-muted text-lg">{t('milestones.subtitle')}</p>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px to-transparent hidden md:block" />

              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className={`relative flex gap-6 ${m.future ? 'opacity-60' : ''}`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 hidden md:flex ${colorMap[m.color]}`}>
                      {milestoneIcons[i]}
                    </div>

                    <div className={`bg-surface border border-line rounded-lg p-6 border border-line flex-1 hover:border-line-strong transition-colors ${m.future ? 'border-dashed' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colorMap[m.color]}`}>
                          {m.date}
                        </span>
                        {m.future && (
                          <span className="text-xs text-ink-faint border border-line rounded-full px-2 py-0.5">{t('milestones.plannedLabel')}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-ink mb-2">{m.title}</h3>
                      <p className="text-ink-muted text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/changelog"
                className="inline-flex items-center gap-2 text-indigo-text hover:text-indigo-text transition font-semibold"
              >
                <span>{t('milestones.changelogLink')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── OPEN SOURCE ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface border border-line rounded-xl p-10 border border-line text-center relative overflow-hidden">
              <div className="absolute inset-0 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-16 h-16 bg-surface-raised rounded-lg flex items-center justify-center mx-auto mb-6 border border-line-strong">
                  <Github className="w-8 h-8 text-ink" />
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-4">{t('openSource.heading')}</h2>
                <p className="text-ink text-lg leading-relaxed max-w-2xl mx-auto mb-8">{t('openSource.text')}</p>
                <a
                  href="https://github.com/FrameSphere/FrameTrain-App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift inline-flex items-center gap-2 bg-surface border border-line px-6 py-3 rounded-md text-ink hover:text-ink border border-line-strong hover:border-line-strong transition font-semibold"
                >
                  <Github className="w-5 h-5" />
                  <span>{t('openSource.cta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={s.label} className="card-lift bg-surface border border-line rounded-lg p-6 border border-line text-center">
                  <div className={`w-10 h-10 ${statColors[i]} rounded-md flex items-center justify-center text-ink mx-auto mb-3`}>
                    {statIcons[i]}
                  </div>
                  <div className={`text-3xl font-semibold ${statColors[i]}  text-ink mb-1`}>
                    {s.number}
                  </div>
                  <div className="text-xs text-ink-faint font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface border border-line rounded-xl p-14 relative overflow-hidden text-center">
              <div className="absolute inset-0 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-indigo-text" />
                  <span className="text-ink-muted text-sm">{t('cta.communityLabel')}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-ink mb-5">
                  {t('cta.heading')}
                </h2>
                <p className="text-ink text-lg mb-8 max-w-xl mx-auto">
                  {t('cta.subtitle')}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/register" className="relative group inline-block px-8 py-4 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
                    <div className="relative flex items-center gap-2 text-ink font-semibold text-lg">
                      <Sparkles className="w-5 h-5" />
                      <span>{t('cta.ctaStart')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/faq" className="bg-surface border border-line px-8 py-4 rounded-lg text-ink hover:text-ink transition font-semibold text-lg border border-line">
                    {t('cta.ctaFaq')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
