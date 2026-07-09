import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
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
    keywords: t.raw('keywords') as string[],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/og-image.svg'],
    },
  }
}

const valueIcons = [<Lock key="0" className="w-7 h-7" />, <Zap key="1" className="w-7 h-7" />, <Globe key="2" className="w-7 h-7" />, <Code2 key="3" className="w-7 h-7" />]
const valueColors = ['from-purple-500 to-pink-500', 'from-yellow-500 to-orange-500', 'from-green-500 to-cyan-500', 'from-blue-500 to-purple-500']

const milestoneIcons = [<Rocket key="0" className="w-5 h-5" />, <Cpu key="1" className="w-5 h-5" />, <Star key="2" className="w-5 h-5" />, <Lightbulb key="3" className="w-5 h-5" />]

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
  green: 'bg-green-500/20 border-green-500/30 text-green-400',
}

const categoryColors: Record<string, string> = {
  ML: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  App: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Web: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  HW: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

const statColors: Record<string, string> = {
  0: 'from-purple-500 to-pink-500',
  1: 'from-blue-500 to-cyan-500',
  2: 'from-green-500 to-emerald-500',
  3: 'from-pink-500 to-rose-500',
}
const statIcons = [<Lock key="0" className="w-5 h-5" />, <Globe key="1" className="w-5 h-5" />, <Cpu key="2" className="w-5 h-5" />, <Sparkles key="3" className="w-5 h-5" />]

type ValueItem = { title: string; description: string }
type TechItem = { name: string; desc: string; category: string }
type Milestone = { date: string; title: string; desc: string; color: string; future?: boolean }
type StatItem = { number: string; label: string }

export default function AboutPage() {
  const t = useTranslations('About')

  const values = t.raw('values.items') as ValueItem[]
  const techStack = t.raw('techStack.items') as TechItem[]
  const milestones = t.raw('milestones.items') as Milestone[]
  const stats = t.raw('stats') as StatItem[]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">

        {/* ─── HERO ─── */}
        <section className="relative py-28 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-transparent to-blue-900/10 pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[160px] opacity-10 pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[140px] opacity-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto relative text-center">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-gray-400 mb-8 border border-white/10">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('hero.titleLine1')}
              </span>
              <br />
              <span className="text-white">{t('hero.titleLine2')}</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* ─── ORIGIN STORY ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-10 md:p-14 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white">{t('origin.heading')}</h2>
                </div>

                <div className="space-y-5 text-gray-300 text-lg leading-relaxed">
                  <p>{t('origin.p1')}</p>
                  <p>{t.rich('origin.p2', { b: (chunks) => <span className="text-white font-semibold">{chunks}</span> })}</p>
                  <p>{t.rich('origin.p3', { b2: (chunks) => <span className="text-purple-400 font-semibold">{chunks}</span> })}</p>
                  <p>{t.rich('origin.p4', { b3: (chunks) => <span className="text-green-400 font-semibold">{chunks}</span> })}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MISSION / VISION ─── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="glass-strong rounded-3xl p-10 border border-purple-500/20 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">{t('mission.heading')}</h2>
                <p className="text-gray-300 text-lg leading-relaxed">{t('mission.text')}</p>
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-10 border border-blue-500/20 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">{t('vision.heading')}</h2>
                <p className="text-gray-300 text-lg leading-relaxed">{t('vision.text')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VALUES ─── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t('values.heading')}</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">{t('values.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <div key={v.title} className="glass-strong rounded-2xl p-8 border border-white/10 hover:scale-[1.01] transition-transform duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${valueColors[i]} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                    {valueIcons[i]}
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{v.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TECH STACK ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-10 border border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white">{t('techStack.heading')}</h2>
              </div>
              <p className="text-gray-400 mb-8 leading-relaxed">{t('techStack.intro')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {techStack.map((item) => (
                  <div key={item.name} className="glass rounded-xl px-5 py-4 border border-white/10 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                    <div>
                      <div className="text-white font-semibold text-sm">{item.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{item.desc}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border flex-shrink-0 ${categoryColors[item.category]}`}>
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
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t('milestones.heading')}</h2>
              <p className="text-gray-400 text-lg">{t('milestones.subtitle')}</p>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent hidden md:block" />

              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className={`relative flex gap-6 ${m.future ? 'opacity-60' : ''}`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 hidden md:flex ${colorMap[m.color]}`}>
                      {milestoneIcons[i]}
                    </div>

                    <div className={`glass-strong rounded-2xl p-6 border border-white/10 flex-1 hover:border-white/20 transition-colors ${m.future ? 'border-dashed' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colorMap[m.color]}`}>
                          {m.date}
                        </span>
                        {m.future && (
                          <span className="text-xs text-gray-600 border border-gray-700 rounded-full px-2 py-0.5">{t('milestones.plannedLabel')}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">{m.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/changelog"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-semibold"
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
            <div className="glass-strong rounded-3xl p-10 border border-white/10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">{t('openSource.heading')}</h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">{t('openSource.text')}</p>
                <a
                  href="https://github.com/FrameSphere/FrameTrain-Website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 glass-strong px-6 py-3 rounded-xl text-gray-200 hover:text-white border border-white/20 hover:border-white/30 transition font-semibold"
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
                <div key={s.label} className="glass-strong rounded-2xl p-6 border border-white/10 text-center hover:scale-105 transition-transform">
                  <div className={`w-10 h-10 bg-gradient-to-br ${statColors[i]} rounded-xl flex items-center justify-center text-white mx-auto mb-3`}>
                    {statIcons[i]}
                  </div>
                  <div className={`text-3xl font-black bg-gradient-to-r ${statColors[i]} bg-clip-text text-transparent mb-1`}>
                    {s.number}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-dark rounded-3xl p-14 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/10 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">{t('cta.communityLabel')}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
                  {t('cta.heading')}
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                  {t('cta.subtitle')}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/register" className="relative group inline-block px-8 py-4 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    <div className="relative flex items-center gap-2 text-white font-bold text-lg">
                      <Sparkles className="w-5 h-5" />
                      <span>{t('cta.ctaStart')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/faq" className="glass-strong px-8 py-4 rounded-2xl text-gray-300 hover:text-white transition font-bold text-lg border border-white/10">
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
