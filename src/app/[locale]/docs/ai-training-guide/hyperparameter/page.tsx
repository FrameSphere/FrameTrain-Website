'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sliders, TrendingDown, Layers, Settings, Shield, ChevronRight } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Rich, CodeBlock, Tag, LRSchedulerChart
} from '../_shared'

const CHAPTER_ID = 'hyperparameter' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

const IMPACT_STYLES: Record<string, { border: string; bg: string }> = {
  chaos: { border: 'border-red-400/20', bg: 'bg-red-500/5' },
  optimal: { border: 'border-green-400/20', bg: 'bg-green-500/5' },
  slow: { border: 'border-yellow-400/20', bg: 'bg-yellow-500/5' },
}

const SCHEDULER_COLORS: Record<string, string> = {
  violet: 'border-violet-400/20',
  blue: 'border-blue-400/20',
  cyan: 'border-cyan-400/20',
  orange: 'border-orange-400/20',
  green: 'border-green-400/20',
}

const OPTIMIZER_COLORS: Record<string, string> = {
  violet: 'border-violet-400/20',
  blue: 'border-blue-400/20',
  gray: 'border-gray-400/20',
  green: 'border-green-400/20',
}

const REG_COLORS: Record<string, string> = {
  violet: 'border-violet-400/20',
  blue: 'border-blue-400/20',
  cyan: 'border-cyan-400/20',
  orange: 'border-orange-400/20',
  green: 'border-green-400/20',
}

function LearningRateDeepSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sliders className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.impactHeading}</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {c.impactCards.map((item: any, i: number) => {
          const style = IMPACT_STYLES[item.key] ?? IMPACT_STYLES.optimal
          return (
            <div key={i} className={`glass border rounded-xl p-5 ${style.border} ${style.bg}`}>
              <p className="text-2xl mb-2">{item.label}</p>
              <h3 className="text-white font-bold mb-3 text-sm">{item.lr}</h3>
              {item.effects.map((e: string, j: number) => <p key={j} className="text-gray-400 text-sm">• {e}</p>)}
            </div>
          )
        })}
      </div>

      <H2>{c.recommendationsHeading}</H2>
      <div className="space-y-2">
        {c.recommendations.map((row: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-gray-400">{row.scenario}</span>
            <div className="flex gap-3 items-center">
              <code className="text-violet-300 font-mono">{row.lr}</code>
              <span className="text-gray-600 text-xs hidden md:block">{row.note}</span>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.rangeTestHeading}</H2>
      <CodeBlock>{c.rangeTestCode}</CodeBlock>

      <H2>{c.scalingHeading}</H2>
      <CodeBlock>{c.scalingCode}</CodeBlock>

      <InfoBox type="success" title={c.practicalTitle}>
        {c.practicalText}
      </InfoBox>
    </div>
  )
}

function LRSchedulerSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TrendingDown className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <LRSchedulerChart />

      <H2>{c.schedulersHeading}</H2>
      <div className="space-y-5">
        {c.schedulers.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-6 ${SCHEDULER_COLORS[item.colorKey] ?? 'border-white/10'} ${item.star ? 'ring-1 ring-violet-400/30' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              {item.star && <Tag color="purple">{c.recommendedLabel}</Tag>}
            </div>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <code className="text-violet-300 text-xs font-mono block mb-3 bg-gray-900/40 rounded-lg px-3 py-2">{item.config}</code>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-green-400 font-semibold mb-1">✓ {c.prosLabel}</p>
                <p className="text-gray-400">{item.pros}</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-1">✗ {c.consLabel}</p>
                <p className="text-gray-400">{item.cons}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.warmupHeading}</H2>
      <CodeBlock>{c.warmupCode}</CodeBlock>
    </div>
  )
}

function BatchSizeDeepSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.compareHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">{c.smallTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.smallItems.map((item: any, i: number) => (
              <li key={i}><span className={item.good ? 'text-green-400' : 'text-red-400'}>{item.good ? '✓' : '✗'}</span> {item.text}</li>
            ))}
          </ul>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">{c.largeTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.largeItems.map((item: any, i: number) => (
              <li key={i}><span className={item.good ? 'text-green-400' : 'text-red-400'}>{item.good ? '✓' : '✗'}</span> {item.text}</li>
            ))}
          </ul>
        </div>
      </div>

      <InfoBox type="info" title={c.sweetSpotTitle}>
        {c.sweetSpotText}
      </InfoBox>

      <H2>{c.gradAccHeading}</H2>
      <P><Rich html={c.gradAccIntro} /></P>
      <CodeBlock>{c.gradAccCode}</CodeBlock>

      <H2>{c.vramHeading}</H2>
      <div className="space-y-2">
        {c.vramTable.map((row: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-yellow-300 font-semibold">{row.vram}</span>
            <span className="text-violet-300">BS: {row.bs}</span>
            <span className="text-cyan-300">Grad. Acc.: {row.acc}</span>
            <span className="text-gray-500 text-xs">{row.note}</span>
          </div>
        ))}
      </div>

      <H2>{c.effectiveHeading}</H2>
      <CodeBlock>{c.effectiveCode}</CodeBlock>
    </div>
  )
}

function OptimizerVergleichSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Settings className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.optimizersHeading}</H2>
      <div className="space-y-5">
        {c.optimizers.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-6 ${OPTIMIZER_COLORS[item.colorKey] ?? 'border-white/10'}`}>
            <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
            <code className="text-violet-300 text-xs font-mono block mb-3">{item.params}</code>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <p className="text-green-400 font-semibold mb-1">✓ {c.prosLabel}</p>
                <p className="text-gray-400">{item.pros}</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-1">✗ {c.consLabel}</p>
                <p className="text-gray-400">{item.cons}</p>
              </div>
            </div>
            <div className="bg-white/3 rounded-lg p-2">
              <p className="text-blue-300 text-xs">💡 {item.rec}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.memoryHeading}</H2>
      <CodeBlock>{c.memoryCode}</CodeBlock>
    </div>
  )
}

function RegularisierungSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Shield className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.techniquesHeading}</H2>
      <div className="space-y-5">
        {c.techniques.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-6 ${REG_COLORS[item.colorKey] ?? 'border-white/10'}`}>
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <div className="flex flex-wrap gap-3 mb-3">
              <code className="text-violet-300 text-xs font-mono">{item.formula}</code>
              <code className="text-cyan-300 text-xs font-mono bg-gray-900/40 px-2 py-0.5 rounded">{item.param}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs mb-2">{c.effectLabel} {item.effect}</p>
            <div className="bg-white/3 rounded-lg p-2">
              <p className="text-blue-300 text-xs">💡 {item.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.combineHeading}</H2>
      <CodeBlock>{c.combineCode}</CodeBlock>
    </div>
  )
}

export default function HyperparameterPage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const content = t.raw('chapters.hyperparameter.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'learning-rate-deep': <LearningRateDeepSection c={content.learningRateDeep} />,
    'lr-scheduler': <LRSchedulerSection c={content.lrScheduler} />,
    'batch-size-deep': <BatchSizeDeepSection c={content.batchSizeDeep} />,
    'optimizer-vergleich': <OptimizerVergleichSection c={content.optimizerVergleich} />,
    'regularisierung': <RegularisierungSection c={content.regularisierung} />,
  }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/docs/ai-training-guide" className="hover:text-white transition-colors">{tDocs('coachSidebar.title')}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">{CHAPTER.emoji} {t(`chapters.${CHAPTER.key}.title`)}</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <SubPageLayout currentChapterId={CHAPTER_ID} activeSection={activeSection} setActiveSection={setActiveSection} sections={sectionContent} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
