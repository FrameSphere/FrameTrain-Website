'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useRouter } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GlowCard } from '@/components/ui/spotlight-card'
import {
  Sparkles, Lock, Rocket, Zap, Code2, Database,
  BarChart3, Package, Shield, ArrowRight, Check,
  Brain, Cpu, Cloud, Download, Book, ChevronDown
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
  const spotlightRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('Home')

  // Der Spotlight lief vorher über React-State: jede Mausbewegung hat die
  // komplette Landing Page (Hero, Features, FAQ, Footer …) neu gerendert.
  // Jetzt schreiben wir direkt zwei CSS-Variablen auf das Overlay – kein
  // Re-Render, und der rAF-Puffer koppelt die Updates an den Repaint.
  useEffect(() => {
    const el = spotlightRef.current
    if (!el) return
    // Auf Touch gibt es keinen Cursor, dem man folgen könnte; wer weniger
    // Bewegung möchte, bekommt hier gar nichts.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let x = 0
    let y = 0

    const paint = () => {
      frame = 0
      el.style.setProperty('--spot-x', `${x}px`)
      el.style.setProperty('--spot-y', `${y}px`)
      el.style.opacity = '1'
    }

    const handleMouseMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frame) cancelAnimationFrame(frame)
    }
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
      {/* Cursor-Spotlight. Startet unsichtbar und blendet erst bei der
          ersten echten Mausbewegung ein – sonst klebt beim Laden ein
          Lichtfleck in der oberen linken Ecke. */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="fixed inset-0 opacity-0 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(600px at var(--spot-x, 50%) var(--spot-y, 0px), rgba(168, 85, 247, 0.13), transparent 80%)',
        }}
      />

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden="true" />

      <Header />

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="relative pt-14 sm:pt-20 pb-24 sm:pb-32 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Badges. Vorher schwebten sie dauerhaft auf und ab (animate-float) –
                eine Endlosbewegung ohne Zweck, direkt neben der Headline, die
                man bei jedem Seitenbesuch sieht. Jetzt blenden sie einmal
                gestaffelt ein und stehen dann still. */}
            <div className="flex justify-center gap-2.5 mb-8 flex-wrap">
              <div className="glass px-3.5 py-1.5 rounded-full text-[13px] text-gray-400 animate-enter flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-gray-500" />
                <span>{badges[0]}</span>
              </div>
              <div className="glass px-3.5 py-1.5 rounded-full text-[13px] text-gray-400 animate-enter flex items-center gap-2" style={{ animationDelay: '60ms' }}>
                <Zap className="w-3.5 h-3.5 text-gray-500" />
                <span>{badges[1]}</span>
              </div>
              <div className="glass px-3.5 py-1.5 rounded-full text-[13px] text-gray-400 animate-enter flex items-center gap-2" style={{ animationDelay: '120ms' }}>
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                <span>{badges[2]}</span>
              </div>
              {/* Temporäre UI Anfang, bald herausnehmen */}
              <ComingSoonBadge />
              {/* Temporäre UI Ende */}
            </div>

            {/* Temporäre UI Anfang, bald herausnehmen */}
            <ReleaseBanner />
            {/* Temporäre UI Ende */}

            {/* Main headline
                Vorher: zwei unterschiedliche Regenbogen-Verläufe plus
                text-shadow-Halo mit 0.8 Alpha. Der Halo hat die Buchstaben-
                kanten aufgeweicht (die Headline sah auf Retina unscharf aus)
                und zwei konkurrierende Verläufe haben die zwei Zeilen optisch
                auseinandergerissen. Jetzt: ein durchgehender Verlauf über
                beide Zeilen, engeres Tracking, ruhigere Zeilenhöhe. */}
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-gradient-brand text-glow-purple text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black mb-7 leading-[1.04] tracking-[-0.04em]">
                <span className="block">{t('hero.titleLine1')}</span>
                <span className="block">{t('hero.titleLine2')}</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-11 max-w-2xl mx-auto leading-[1.65]">
                {t('hero.subtitle')}
                <span className="text-gray-200"> {t('hero.subtitleHighlight')}</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                {/* Drei CTAs standen vorher in identischer Größe und Schriftstärke
                    nebeneinander – der Blick hatte keinen Anker. Die primäre
                    Aktion bleibt groß und farbig, die beiden sekundären treten
                    eine Stufe zurück. */}
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="press group relative px-7 py-3.5 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-[18px] h-[18px]" />
                    <span>{isAuthenticated ? t('hero.ctaDashboard') : t('hero.ctaRegister')}</span>
                    <ArrowRight className="w-[18px] h-[18px] transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                  </div>
                </Link>

                <Link
                  href="/#features"
                  className="press glass px-6 py-3.5 rounded-2xl hover:bg-white/[0.09] hover:border-white/20 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">
                    <span>{t('hero.ctaFeatures')}</span>
                    <ArrowRight className="w-[18px] h-[18px] transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                  </div>
                </Link>
                <Link
                  href="/docs/ai-training-guide"
                  className="press glass px-6 py-3.5 rounded-2xl border border-violet-400/20 hover:bg-violet-500/10 hover:border-violet-400/40 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2 text-violet-300/90 group-hover:text-violet-200 transition-colors duration-200 font-medium">
                    <Brain className="w-[18px] h-[18px]" />
                    <span>{t('hero.ctaCoach')}</span>
                    <ArrowRight className="w-[18px] h-[18px] transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
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
        <section className="py-20 sm:py-28 px-4 relative" id="features">
          <div className="max-w-7xl mx-auto">
            <SectionHeading title={t('features.title')} subtitle={t('features.subtitle')} />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <section className="py-20 sm:py-28 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <SectionHeading title={t('howItWorks.title')} subtitle={t('howItWorks.subtitle')} />

            <div className="grid md:grid-cols-3 gap-5">
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
        <section className="py-20 sm:py-28 px-4 relative" id="training-coach">
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
                  <h2 className="text-[1.75rem] sm:text-4xl md:text-[2.75rem] font-bold text-white mb-4 leading-[1.12]">
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
                      className="press inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-[15px] rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-colors duration-200 ease-out shadow-lg shadow-violet-500/25"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('trainingCoach.ctaMain')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/docs/ai-training-guide/ml-grundlagen"
                      className="press inline-flex items-center gap-2 px-5 py-2.5 glass border border-white/15 text-gray-400 font-medium text-[15px] rounded-xl hover:border-white/30 hover:text-white transition-colors duration-200 ease-out"
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
                          className="flex items-center gap-3 px-3.5 py-2 glass border border-white/[0.08] rounded-xl hover:border-violet-400/30 hover:bg-violet-500/[0.07] transition-colors duration-[180ms] ease-out group"
                        >
                          <span className="text-gray-600 text-xs font-mono">{ch.num}</span>
                          <span className="text-base">{ch.emoji}</span>
                          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">{ch.title}</span>
                          <ArrowRight className="w-3 h-3 text-gray-600 ml-auto transition-[color,transform] duration-200 ease-out group-hover:text-violet-400 group-hover:translate-x-0.5" />
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
        <section className="py-20 sm:py-28 px-4 relative" id="pricing">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[1.75rem] sm:text-4xl md:text-5xl font-bold text-white leading-[1.1]">
              {t('pricing.title')}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500">
              {t('pricing.subtitle')}
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400/90 text-[13px] font-medium mt-6 mb-14">
              {t('pricing.increaseNote')}
            </div>

            {/* Die Wrapper hatten hover:scale-105 über 500ms. Eine Glass-Karte
                mit backdrop-filter um 5 % zu skalieren heißt: der Blur wird
                für jeden Frame neu berechnet und der Preistext wird währenddessen
                unscharf. Ersetzt durch card-lift (translateY, 220ms). */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-2xl mx-auto">
              {/* Monthly */}
              <div className="card-lift flex-1 flex rounded-2xl">
              <GlowCard glowColor="purple" customSize className="p-8 flex flex-col w-full">
                <div className="flex-1">
                <div className="text-[11px] font-semibold text-purple-400/90 uppercase tracking-[0.14em] mb-3">{t('pricing.monthly.label')}</div>
                <div className="mb-7">
                  <div className="nums text-5xl font-bold tracking-[-0.03em] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    {t('pricing.monthly.price')}
                  </div>
                  <div className="text-gray-500 text-[13px]">{t('pricing.monthly.billing')}</div>
                </div>
                <ul className="space-y-2.5 mb-7 text-left">
                  {monthlyFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm leading-relaxed">
                      <div className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                </div>
                <Link href={isAuthenticated ? "/payment" : "/register"}
                  className="press group relative block w-full py-3 rounded-xl overflow-hidden text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                  <span className="relative text-white font-semibold text-[15px]">{t('pricing.monthly.cta')}</span>
                </Link>
              </GlowCard>
              </div>
              {/* Yearly */}
              <div className="card-lift flex-1 flex rounded-2xl">
              <GlowCard glowColor="green" customSize className="p-8 relative flex flex-col w-full">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-[11px] font-semibold rounded-full whitespace-nowrap">
                  {t('pricing.yearly.badge')}
                </div>
                <div className="flex-1">
                <div className="text-[11px] font-semibold text-green-400/90 uppercase tracking-[0.14em] mb-3">{t('pricing.yearly.label')}</div>
                <div className="mb-7">
                  <div className="nums text-5xl font-bold tracking-[-0.03em] bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                    {t('pricing.yearly.price')}
                  </div>
                  <div className="text-gray-500 text-[13px]">{t('pricing.yearly.billing')}</div>
                </div>
                <ul className="space-y-2.5 mb-7 text-left">
                  {yearlyFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm leading-relaxed">
                      <div className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                </div>
                <Link href={isAuthenticated ? "/payment?plan=yearly" : "/register"}
                  className="press group relative block w-full py-3 rounded-xl overflow-hidden text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600" />
                  <span className="relative text-white font-semibold text-[15px]">{t('pricing.yearly.cta')}</span>
                </Link>
              </GlowCard>
              </div>
            </div>
          </div>
        </section>

        {/* Was ist FrameTrain – SEO Section */}
        <section className="py-20 sm:py-28 px-4 relative" id="about">
          <div className="max-w-3xl mx-auto">
            <div className="glass-strong rounded-3xl p-8 sm:p-12">
              <h2 className="text-[1.75rem] sm:text-4xl font-bold text-white mb-6 leading-[1.15]">
                {t('whatIs.title')}
              </h2>
              {/* max-w-3xl statt 4xl auf dem Container: die Zeilen lagen bei
                  ~110 Zeichen, angenehm lesbar sind 65–75. */}
              <div className="text-gray-400 space-y-4 text-[17px] leading-[1.7]">
                <p>{t.rich('whatIs.paragraph1', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('whatIs.paragraph2', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t.rich('whatIs.paragraph3', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                <p>{t('whatIs.paragraph4')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Warum lokales ML Training */}
        <section className="py-20 sm:py-28 px-4 relative" id="why-local">
          <div className="max-w-7xl mx-auto">
            <SectionHeading title={t('whyLocal.title')} subtitle={t('whyLocal.subtitle')} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reasons.map((r, i) => (
                <ReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 sm:py-28 px-4 relative" id="use-cases">
          <div className="max-w-7xl mx-auto">
            <SectionHeading title={t('useCases.title')} subtitle={t('useCases.subtitle')} />
            <div className="grid md:grid-cols-2 gap-5">
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
        <section className="py-20 sm:py-28 px-4 relative" id="faq">
          <div className="max-w-3xl mx-auto">
            <SectionHeading title={t('faq.title')} subtitle={t('faq.subtitle')} />
            {/* space-y-4 → space-y-2: die Karten gehören inhaltlich zusammen,
                große Lücken haben sie als acht Einzelobjekte gelesen. */}
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Preview Section */}
        <section className="py-20 sm:py-28 px-4 relative" id="docs">
          <div className="max-w-7xl mx-auto">
            <SectionHeading title={t('docsPreview.title')} subtitle={t('docsPreview.subtitle')} />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
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
              className="card-lift flex items-center gap-4 px-5 py-4 mb-8 glass-strong border border-violet-400/25 rounded-2xl hover:!border-violet-400/50 hover:bg-violet-500/[0.07] group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-[15px]">{t('docsPreview.bannerTitle')}</p>
                <p className="text-gray-400 text-sm">{t('docsPreview.bannerDesc')}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>

            <div className="text-center">
              <Link
                href="/docs"
                className="press inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-[15px] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow duration-200 ease-out group"
              >
                <Book className="w-5 h-5" />
                <span>{t('docsPreview.ctaFull')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-28 px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-dark rounded-3xl px-6 py-14 sm:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
              <div className="relative">
                <h2 className="text-[1.75rem] sm:text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1]">
                  {t('finalCta.title')}
                </h2>
                <p className="text-base sm:text-lg text-gray-400 mb-9 max-w-xl mx-auto leading-relaxed">
                  {t('finalCta.subtitle')}
                </p>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="press inline-block group relative px-8 py-4 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2.5 text-white font-semibold text-lg">
                    <Sparkles className="w-5 h-5" />
                    <span>{isAuthenticated ? t('finalCta.ctaAuthenticated') : t('finalCta.ctaGuest')}</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
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

/**
 * Ein einziger Kopf für alle Abschnitte.
 *
 * Vorher hatte jede Sektion ihren eigenen Farbverlauf (purple→pink,
 * blue→cyan, pink→orange, cyan→blue, …). Acht Verläufe auf einer Seite
 * lesen sich nicht als Gestaltung, sondern als Zufall – und sie nehmen
 * dem Hero seine Sonderstellung. Der Verlauf ist jetzt dem H1 vorbehalten,
 * alle Abschnitts-Überschriften sind ruhiges Weiß in einer Größe.
 */
function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  const centered = align === 'center'
  return (
    <div className={`mb-14 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-[1.75rem] sm:text-4xl md:text-5xl font-bold text-white leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg text-gray-500 leading-relaxed ${
            centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          }`}
        >
          {subtitle}
        </p>
      )}
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
    <div className="card-lift glass-strong rounded-2xl p-5">
      <div className={`nums text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r ${colors[color as keyof typeof colors]} bg-clip-text text-transparent mb-1`}>
        {number}
      </div>
      <div className="text-[13px] text-gray-500 font-medium">{label}</div>
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
    // cursor-pointer entfernt: die Karte ist kein Link, der Zeigefinger hat
    // einen Klick versprochen, den es nicht gibt.
    <div className="card-lift glass-strong rounded-2xl p-7 group">
      <div className={`w-11 h-11 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 ease-out group-hover:scale-[1.06]`}>
        <div className="text-white [&>svg]:w-[18px] [&>svg]:h-[18px]">
          {icon}
        </div>
      </div>
      <h3 className="text-[17px] font-semibold text-white mb-2">{title}</h3>
      <p className="text-[15px] text-gray-400 leading-[1.65]">{description}</p>
    </div>
  )
}

function StepCard({ number, icon, title, description }: any) {
  return (
    <div className="relative">
      <div className="card-lift glass-strong rounded-2xl p-7">
        {/* Schrittzahl und Icon standen vorher übereinander und haben zwei
            konkurrierende Einstiegspunkte erzeugt – jetzt eine Zeile. */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
            <div className="text-white [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </div>
          </div>
          <div className="nums text-4xl font-bold tracking-tight text-white/[0.12] leading-none">{number}</div>
        </div>
        <h3 className="text-[17px] font-semibold text-white mb-2">{title}</h3>
        <p className="text-[15px] text-gray-400 leading-[1.65]">{description}</p>
      </div>
    </div>
  )
}

function ReasonCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card-lift glass-strong rounded-2xl p-7">
      <div className="text-[28px] mb-4 leading-none">{icon}</div>
      <h3 className="text-[17px] font-semibold text-white mb-2">{title}</h3>
      <p className="text-[15px] text-gray-400 leading-[1.65]">{description}</p>
    </div>
  )
}

function UseCaseCard({ tag, title, description, keywords, href, learnMore }: { tag: string; title: string; description: string; keywords: string[]; href?: string; learnMore: string }) {
  const inner = (
    // Der Zeigefinger erscheint jetzt nur noch, wenn die Karte wirklich
    // verlinkt ist (href), nicht mehr pauschal auf allen.
    <div className={`card-lift glass-strong rounded-2xl p-7 h-full group ${href ? 'cursor-pointer' : ''}`}>
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-500/15 text-purple-300/90 border border-purple-500/25 mb-4">
        {tag}
      </span>
      <h3 className="text-[17px] font-semibold text-white mb-2">{title}</h3>
      <p className="text-[15px] text-gray-400 leading-[1.65] mb-5">{description}</p>
      <div className="flex flex-wrap gap-1.5 items-center">
        {keywords.map((kw) => (
          <span key={kw} className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-gray-500 font-mono">{kw}</span>
        ))}
        {href && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-purple-400/80 group-hover:text-purple-300 transition-colors duration-200">
            {learnMore}
            <ArrowRight className="w-3 h-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  )
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner
}

function DocCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="block h-full">
      <div className="card-lift glass-strong rounded-2xl p-7 cursor-pointer group h-full">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 ease-out group-hover:scale-[1.06]">
          <div className="text-white [&>svg]:w-[18px] [&>svg]:h-[18px]">
            {icon}
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-white mb-2">{title}</h3>
        <p className="text-[15px] text-gray-400 leading-[1.65]">{description}</p>
      </div>
    </Link>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="glass-strong rounded-xl overflow-hidden transition-colors duration-200"
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors duration-200"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <h3 className="text-white/90 font-medium text-[15px] sm:text-base" itemProp="name">{question}</h3>
        {/* Vorher ein "+" das um 45° zum "×" kippte – das liest sich als
            "schließen/abbrechen", nicht als "zuklappen". Chevron sagt
            eindeutig, in welche Richtung sich der Inhalt bewegt. */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {/* Antwort bleibt für SEO immer im DOM.
          grid-template-rows 0fr→1fr statt max-h-96: max-h war geraten – bei
          kurzen Antworten lief der Übergang gegen eine Höhe, die nie erreicht
          wurde (das Aufklappen wirkte dadurch abgehackt), bei langen wurde
          abgeschnitten. Die Grid-Variante animiert exakt die echte Höhe. */}
      <div
        itemScope
        itemType="https://schema.org/Answer"
        className={`grid transition-[grid-template-rows] duration-[240ms] ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <p
            className="px-5 sm:px-6 pb-5 text-[15px] text-gray-400 leading-[1.7] max-w-[68ch]"
            itemProp="text"
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}
