'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Sparkles, ArrowRight, BookOpen } from 'lucide-react'
import { DocSearch } from '@/components/DocSearch'
import { CHAPTER_META } from './_shared'

const CHAPTER_COLORS = [
  { color: 'from-violet-500/10 to-purple-500/5', border: 'border-violet-400/20', accent: 'text-violet-400' },
  { color: 'from-blue-500/10 to-cyan-500/5',     border: 'border-blue-400/20',   accent: 'text-blue-400' },
  { color: 'from-cyan-500/10 to-teal-500/5',     border: 'border-cyan-400/20',   accent: 'text-cyan-400' },
  { color: 'from-red-500/10 to-pink-500/5',      border: 'border-red-400/20',    accent: 'text-red-400' },
  { color: 'from-orange-500/10 to-amber-500/5',  border: 'border-orange-400/20', accent: 'text-orange-400' },
  { color: 'from-pink-500/10 to-rose-500/5',     border: 'border-pink-400/20',   accent: 'text-pink-400' },
  { color: 'from-green-500/10 to-emerald-500/5', border: 'border-green-400/20',  accent: 'text-green-400' },
  { color: 'from-fuchsia-500/10 to-violet-500/5',border: 'border-fuchsia-400/20',accent: 'text-fuchsia-400' },
]

export default function AITrainingGuideHubPage() {
  const t = useTranslations('AICoach')
  const hubChapters = t.raw('hub.chapters') as { desc: string; topics: string[] }[]
  const stats = t.raw('hub.stats') as string[]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl mb-6 shadow-lg shadow-violet-500/40">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6 text-violet-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t('hub.badge')}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              {t('hub.headingLine1')}{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                {t('hub.headingLine2')}
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              {t('hub.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-10 flex-wrap">
              {stats.map((stat, i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`}>·</span>}
                  <span key={stat}>{stat}</span>
                </>
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
                    <div className={`glass border ${c.border} rounded-2xl p-7 bg-gradient-to-br ${c.color} hover:scale-[1.01] transition-all duration-200 hover:shadow-lg h-full`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{ch.emoji}</span>
                          <div>
                            <p className={`text-xs font-bold ${c.accent} mb-0.5 uppercase tracking-wider`}>
                              {t('hub.chapterLabel')} {num}
                            </p>
                            <h2 className="text-white font-black text-xl">{t(`chapters.${ch.key}.title`)}</h2>
                          </div>
                        </div>
                        <ArrowRight className={`w-5 h-5 ${c.accent} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                      </div>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{chData.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {chData.topics.map((topic) => (
                          <span key={topic} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-500">
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
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30"
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
