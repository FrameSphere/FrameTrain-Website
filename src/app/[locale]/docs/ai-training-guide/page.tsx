'use client'

import { Fragment } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Sparkles, ArrowRight, BookOpen } from 'lucide-react'
import { DocSearch } from '@/components/DocSearch'
import { CoachHubJsonLd } from '@/lib/coach-seo'
import { CHAPTER_META } from './_shared'

const CHAPTER_COLORS = [
  { color: ' ', border: 'border-line', accent: 'text-indigo-text' },
  { color: ' ',     border: 'border-line',   accent: 'text-indigo-text' },
  { color: ' ',     border: 'border-line',   accent: 'text-indigo-text' },
  { color: ' ',      border: 'border-danger',    accent: 'text-danger' },
  { color: ' ',  border: 'border-line', accent: 'text-warning' },
  { color: ' ',     border: 'border-line',   accent: 'text-indigo-text' },
  { color: ' ', border: 'border-line',  accent: 'text-success' },
  { color: ' ',border: 'border-line',accent: 'text-indigo-text' },
]

export default function AITrainingGuideHubPage() {
  const t = useTranslations('AICoach')
  const locale = useLocale()
  const hubChapters = t.raw('hub.chapters') as { desc: string; topics: string[] }[]
  const stats = t.raw('hub.stats') as string[]

  return (
    <div className="min-h-screen flex flex-col bg-bg ">
      <CoachHubJsonLd locale={locale} />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-line">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-ghost-fill border border-line rounded-xl mb-6  ">
              <Brain className="w-10 h-10 text-ink" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-soft border border-line rounded-full mb-6 text-indigo-text text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t('hub.badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-ink mb-6">
              {t('hub.headingLine1')}{' '}
              <span className="text-ink">
                {t('hub.headingLine2')}
              </span>
            </h1>
            <p className="text-xl text-ink-muted max-w-3xl mx-auto mb-8">
              {t('hub.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-ink-faint mb-10 flex-wrap">
              {stats.map((stat, i) => (
                <Fragment key={stat}>
                  {i > 0 && <span>·</span>}
                  <span>{stat}</span>
                </Fragment>
              ))}
            </div>
            <DocSearch />
          </div>
        </section>

        {/* Chapter Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {CHAPTER_META.map((ch, idx) => {
                const c = CHAPTER_COLORS[idx]
                const chData = hubChapters[idx]
                const num = String(idx + 1).padStart(2, '0')
                return (
                  <Link key={ch.id} href={ch.href} className="group block">
                    <div className={`bg-surface border border-line border ${c.border} rounded-lg p-7 ${c.color} transition duration-200 ease-out  h-full`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{ch.emoji}</span>
                          <div>
                            <p className={`text-xs font-semibold ${c.accent} mb-0.5 uppercase tracking-wider`}>
                              {t('hub.chapterLabel')} {num}
                            </p>
                            <h2 className="text-ink font-semibold text-xl">{t(`chapters.${ch.key}.title`)}</h2>
                          </div>
                        </div>
                        <ArrowRight className={`w-5 h-5 ${c.accent} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-200 ease-out`} />
                      </div>
                      <p className="text-ink-muted text-sm mb-4 leading-relaxed">{chData.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {chData.topics.map((topic) => (
                          <span key={topic} className="text-xs px-2 py-1 bg-ghost-fill border border-line rounded-sm text-ink-faint">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/docs/ai-training-guide/ml-grundlagen"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-button hover:bg-indigo-hover rounded-md text-ink font-semibold   transition duration-200 ease-out  "
              >
                <BookOpen className="w-5 h-5" />
                {t('hub.startCta')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
