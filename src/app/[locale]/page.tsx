'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useRouter } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GlowCard } from '@/components/ui/spotlight-card'
import {
  Sparkles, Lock, Rocket, Zap, Code2, Database,
  BarChart3, Package, Shield, ArrowRight, Check,
  Brain, Cpu, Cloud, Download, Book
} from 'lucide-react'
/* Temporäre UI Anfang, bald herausnehmen */
import { ReleaseBanner, ComingSoonBadge, ReleasePromoSection } from '@/components/ReleaseCountdown'
/* Temporäre UI Ende */

type Stat = { number: string; label: string }
type Feature = { title: string; description: string }
type Step = { number: string; title: string; description: string }
type Chapter = { emoji: string; title: string; num: string }
type Reason = { icon: string; title: string; description: string }
type UseCase = { tag: string; title: string; description: string; keywords: string[]; href?: string }
type FaqEntry = { question: string; answer: string }
type DocCardData = { title: string; description: string; href: string }

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const t = useTranslations('Home')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // WICHTIG fuer SEO/Performance: Die Seite wird NIE mehr komplett hinter
  // einem Auth-Check versteckt. isAuthenticated startet sicher auf false,
  // das CTA zeigt also zunaechst "Jetzt starten" und wechselt erst nach dem
  // Auth-Check ggf. zu "Zum Dashboard". So ist der gesamte Content (Hero,
  // Features, FAQ etc.) sofort im SSR-HTML vorhanden statt hinter einem
  // "Loading..."-Spinner zu verschwinden.

  const badges = t.raw('badges') as string[]
  const stats = t.raw('stats') as Stat[]
  const features = t.raw('features.items') as Feature[]
  const steps = t.raw('howItWorks.steps') as Step[]
  const checklist = t.raw('trainingCoach.checklist') as string[]
  const chapters = t.raw('trainingCoach.chapters') as Chapter[]
  const monthlyFeatures = t.raw('pricing.monthly.features') as string[]
  const yearlyFeatures = t.raw('pricing.yearly.features') as string[]
  const reasons = t.raw('whyLocal.reasons') as Reason[]
  const useCases = t.raw('useCases.items') as UseCase[]
  const faqItems = t.raw('faq.items') as FaqEntry[]
  const docCards = t.raw('docsPreview.cards') as DocCardData[]

  const featureColors = ['purple', 'pink', 'blue', 'green', 'yellow', 'cyan'] as const

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.15), transparent 80%)`
        }}
      />

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none" />

      <Header />

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Floating badges */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 animate-float flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                <span>{badges[0]}</span>
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 animate-float flex items-center gap-2" style={{ animationDelay: '1s' }}>
                <Zap className="w-4 h-4" />
                <span>{badges[1]}</span>
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 animate-float flex items-center gap-2" style={{ animationDelay: '2s' }}>
                <Lock className="w-4 h-4" />
                <span>{badges[2]}</span>
              </div>
              {/* Temporäre UI Anfang, bald herausnehmen */}
              <ComingSoonBadge />
              {/* Temporäre UI Ende */}
            </div>

            {/* Temporäre UI Anfang, bald herausnehmen */}
            <ReleaseBanner />
            {/* Temporäre UI Ende */}

            {/* Main headline */}
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                <span className="block text-glow-purple bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {t('hero.titleLine1')}
                </span>
                <span className="block text-glow-blue bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  {t('hero.titleLine2')}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
                <span className="text-purple-400"> {t('hero.subtitleHighlight')}</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="group relative px-8 py-4 rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    <div className="relative flex items-center gap-2 text-white font-bold text-lg">
                      <Sparkles className="w-5 h-5" />
                      <span>{t('hero.ctaDashboard')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="group relative px-8 py-4 rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    <div className="relative flex items-center gap-2 text-white font-bold text-lg">
                      <Sparkles className="w-5 h-5" />
                      <span>{t('hero.ctaRegister')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )}

                <Link
                  href="/#features"
                  className="glass-strong px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 text-gray-200 font-semibold text-lg">
                    <span>{t('hero.ctaFeatures')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link
                  href="/docs/ai-training-guide"
                  className="glass-strong px-8 py-4 rounded-2xl hover:bg-violet-500/10 border border-violet-400/20 hover:border-violet-400/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 text-violet-300 font-semibold text-lg">
                    <Brain className="w-5 h-5" />
                    <span>{t('hero.ctaCoach')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((s, i) => (
                  <StatCard key={i} number={s.number} label={s.label} color={(['purple', 'blue', 'pink', 'green'] as const)[i]} />
                ))}
              </div>
            </div>
          </div>

          {/* Animated orbs */}
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-600 rounded-full blur-[128px] opacity-20 animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-blue-600 rounded-full blur-[128px] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </section>

        {/* Features Section */}
        <section className="py-32 px-4 relative" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('features.title')}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <FeatureCard
                  key={i}
                  icon={[<Lock key="0" className="w-6 h-6" />, <Brain key="1" className="w-6 h-6" />, <BarChart3 key="2" className="w-6 h-6" />, <Package key="3" className="w-6 h-6" />, <Zap key="4" className="w-6 h-6" />, <Shield key="5" className="w-6 h-6" />][i]}
                  title={f.title}
                  description={f.description}
                  color={featureColors[i]}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-32 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('howItWorks.title')}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <StepCard
                  key={i}
                  number={s.number}
                  icon={[<Download key="0" className="w-8 h-8" />, <Database key="1" className="w-8 h-8" />, <Rocket key="2" className="w-8 h-8" />][i]}
                  title={s.title}
                  description={s.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── KI Training Coach Section ── */}
        <section className="py-24 px-4 relative" id="training-coach">
          <div className="max-w-7xl mx-auto">
            <div className="glass-strong rounded-3xl p-12 border border-white/10 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row items-center gap-10">
                {/* Left: text */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/15 border border-violet-400/25 rounded-full text-violet-300 text-xs font-semibold mb-5">
                    <Brain className="w-3.5 h-3.5" />
                    {t('trainingCoach.badge')}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                    {t('trainingCoach.headingPre')}{' '}
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      {t('trainingCoach.headingHighlight')}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    {t('trainingCoach.paragraph')}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {checklist.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/docs/ai-training-guide"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('trainingCoach.ctaMain')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/docs/ai-training-guide/ml-grundlagen"
                      className="inline-flex items-center gap-2 px-6 py-3 glass border border-white/15 text-gray-300 font-semibold rounded-xl hover:border-white/30 hover:text-white transition-all"
                    >
                      {t('trainingCoach.ctaChapter1')}
                    </Link>
                  </div>
                </div>
                {/* Right: chapter pills */}
                <div className="flex-shrink-0 w-full lg:w-72">
                  <div className="space-y-2">
                    {chapters.map((ch, i) => {
                      const hrefs = [
                        '/docs/ai-training-guide/ml-grundlagen',
                        '/docs/ai-training-guide/training-verstehen',
                        '/docs/ai-training-guide/trainingsverlauf',
                        '/docs/ai-training-guide/diagnose',
                        '/docs/ai-training-guide/hyperparameter',
                        '/docs/ai-training-guide/fine-tuning',
                        '/docs/ai-training-guide/dataset-mastery',
                        '/docs/ai-training-guide/fortgeschrittene',
                      ]
                      return (
                        <Link key={ch.title} href={hrefs[i]}
                          className="flex items-center gap-3 px-4 py-2.5 glass border border-white/8 rounded-xl hover:border-violet-400/30 hover:bg-violet-500/5 transition-all group"
                        >
                          <span className="text-gray-600 text-xs font-mono">{ch.num}</span>
                          <span className="text-base">{ch.emoji}</span>
                          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">{ch.title}</span>
                          <ArrowRight className="w-3 h-3 text-gray-600 ml-auto group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Temporäre UI Anfang, bald herausnehmen */}
        <ReleasePromoSection />
        {/* Temporäre UI Ende */}

        {/* Pricing Section */}
        <section className="py-32 px-4 relative" id="pricing">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 mb-4">
              {t('pricing.subtitle')}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-semibold mb-16">
              {t('pricing.increaseNote')}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
              {/* Monthly */}
              <div className="flex-1 flex hover:scale-105 transition-transform duration-500">
              <GlowCard glowColor="purple" customSize className="p-10 flex flex-col w-full">
                <div className="flex-1">
                <div className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">{t('pricing.monthly.label')}</div>
                <div className="mb-6">
                  <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    {t('pricing.monthly.price')}
                  </div>
                  <div className="text-gray-400 text-sm">{t('pricing.monthly.billing')}</div>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {monthlyFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                </div>
                <Link href={isAuthenticated ? "/payment" : "/register"}
                  className="group relative block w-full py-3 rounded-2xl overflow-hidden text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                  <span className="relative text-white font-bold">{t('pricing.monthly.cta')}</span>
                </Link>
              </GlowCard>
              </div>
              {/* Yearly */}
              <div className="flex-1 flex hover:scale-105 transition-transform duration-500">
              <GlowCard glowColor="green" customSize className="p-10 relative flex flex-col w-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {t('pricing.yearly.badge')}
                </div>
                <div className="flex-1">
                <div className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4">{t('pricing.yearly.label')}</div>
                <div className="mb-6">
                  <div className="text-6xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                    {t('pricing.yearly.price')}
                  </div>
                  <div className="text-gray-400 text-sm">{t('pricing.yearly.billing')}</div>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {yearlyFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                </div>
                <Link href={isAuthenticated ? "/payment?plan=yearly" : "/register"}
                  className="group relative block w-full py-3 rounded-2xl overflow-hidden text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600" />
                  <span className="relative text-white font-bold">{t('pricing.yearly.cta')}</span>
                </Link>
              </GlowCard>
              </div>
            </div>
          </div>
        </section>

        {/* Was ist FrameTrain – SEO Section */}
        <section className="py-24 px-4 relative" id="about">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-12">
              <h2 className="text-4xl font-black mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('whatIs.title')}
              </h2>
              <div className="text-gray-300 space-y-4 text-lg leading-relaxed">
                <p>{t.rich('whatIs.paragraph1', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('whatIs.paragraph2', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('whatIs.paragraph3', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t('whatIs.paragraph4')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Warum lokales ML Training */}
        <section className="py-24 px-4 relative" id="why-local">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                {t('whyLocal.title')}
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t('whyLocal.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reasons.map((r, i) => (
                <ReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 px-4 relative" id="use-cases">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                {t('useCases.title')}
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t('useCases.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((u, i) => (
                <UseCaseCard
                  key={i}
                  tag={u.tag}
                  title={u.title}
                  description={u.description}
                  keywords={u.keywords}
                  href={u.href}
                  learnMore={t('useCases.learnMore')}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 relative" id="faq">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t('faq.title')}
              </h2>
              <p className="text-gray-400 text-lg">{t('faq.subtitle')}</p>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Preview Section */}
        <section className="py-24 px-4 relative" id="docs">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('docsPreview.title')}
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t('docsPreview.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {docCards.map((c, i) => (
                <DocCard
                  key={i}
                  icon={[<Rocket key="0" className="w-6 h-6" />, <Brain key="1" className="w-6 h-6" />, <Database key="2" className="w-6 h-6" />, <Zap key="3" className="w-6 h-6" />][i]}
                  title={c.title}
                  description={c.description}
                  href={c.href}
                />
              ))}
            </div>

            {/* Training Coach Banner */}
            <Link href="/docs/ai-training-guide"
              className="flex items-center gap-4 px-6 py-5 mb-8 glass-strong border border-violet-400/25 rounded-2xl hover:border-violet-400/50 hover:bg-violet-500/5 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{t('docsPreview.bannerTitle')}</p>
                <p className="text-gray-400 text-sm">{t('docsPreview.bannerDesc')}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>

            <div className="text-center">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all group"
              >
                <Book className="w-5 h-5" />
                <span>{t('docsPreview.ctaFull')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-dark rounded-3xl p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
                  {t('finalCta.title')}
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  {t('finalCta.subtitle')}
                </p>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="inline-block group relative px-10 py-5 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <div className="relative flex items-center gap-3 text-white font-bold text-xl">
                    <Sparkles className="w-6 h-6" />
                    <span>{isAuthenticated ? t('finalCta.ctaAuthenticated') : t('finalCta.ctaGuest')}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
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

function StatCard({ number, label, color }: { number: string; label: string; color: string }) {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-green-500 to-emerald-500',
  }

  return (
    <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-transform">
      <div className={`text-4xl font-black bg-gradient-to-r ${colors[color as keyof typeof colors]} bg-clip-text text-transparent mb-2`}>
        {number}
      </div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: any) {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    cyan: 'from-cyan-500 to-blue-500',
  }

  return (
    <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 group cursor-pointer">
      <div className={`w-14 h-14 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, icon, title, description }: any) {
  return (
    <div className="relative">
      <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300">
        <div className="text-6xl font-black text-purple-500/20 mb-4">{number}</div>
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ReasonCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

function UseCaseCard({ tag, title, description, keywords, href, learnMore }: { tag: string; title: string; description: string; keywords: string[]; href?: string; learnMore: string }) {
  const inner = (
    <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer group">
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-4">
        {tag}
      </span>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2 items-center">
        {keywords.map((kw) => (
          <span key={kw} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500 font-mono">{kw}</span>
        ))}
        {href && <span className="ml-auto text-xs text-purple-400 group-hover:text-purple-300">{learnMore}</span>}
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function DocCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer group h-full">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-strong rounded-2xl overflow-hidden" itemScope itemType="https://schema.org/Question">
      <button
        className="w-full text-left px-8 py-6 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <h3 className="text-white font-semibold text-lg" itemProp="name">{question}</h3>
        <span className={`text-purple-400 text-2xl transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {/* Answer always in DOM for SEO – only visually hidden when closed */}
      <div
        itemScope
        itemType="https://schema.org/Answer"
        className={`px-8 overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-6' : 'max-h-0'}`}
        aria-hidden={!open}
      >
        <p className="text-gray-400 leading-relaxed" itemProp="text">{answer}</p>
      </div>
    </div>
  )
}
