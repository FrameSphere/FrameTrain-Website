'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Zap, Database, Target, GitBranch, ChevronRight, CheckCircle2, BookOpen, ArrowRight, Brain } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Highlight, CodeBlock, Tag, Rich
} from '../_shared'

const CHAPTER_ID = 'fortgeschrittene' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

function MixedPrecisionSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Zap className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.comparisonHeading}</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {c.comparisonHeaders.map((h: string) => (
                <th key={h} className="text-left text-gray-400 py-3 pr-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.comparisonRows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-white/5">
                <td className={`py-3 pr-3 font-mono font-bold ${row.color}`}>{row.f}</td>
                <td className="py-3 pr-3 text-gray-400">{row.b}</td>
                <td className="py-3 pr-3 text-gray-400">{row.e}</td>
                <td className="py-3 pr-3 text-gray-400">{row.m}</td>
                <td className="py-3 pr-3 text-gray-400 font-mono text-xs">{row.range}</td>
                <td className="py-3 pr-3 text-gray-400">{row.prec}</td>
                <td className="py-3 text-xs text-gray-500">{row.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>{c.bf16Heading}</H2>
      <P><Rich html={c.bf16Text} /></P>
      <CodeBlock>{c.bf16Code}</CodeBlock>

      <H2>{c.ampHeading}</H2>
      <P><Rich html={c.ampText} /></P>
      <CodeBlock>{c.ampCode}</CodeBlock>

      <H2>{c.savingsHeading}</H2>
      <div className="space-y-2">
        {c.savingsRows.map((row: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-gray-300">{row.model}</span>
            <span className="text-red-400">{row.fp32} (fp32)</span>
            <span className="text-yellow-400">{row.fp16} (fp16)</span>
            <span className="text-green-400">{row.bf16} (bf16) ⭐</span>
          </div>
        ))}
      </div>

      <InfoBox type="success" title={c.frameTrainTitle}>
        {c.frameTrainText}
      </InfoBox>
    </div>
  )
}

function GradientCheckpointingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Database className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.problemHeading}</H2>
      <P>{c.problemText}</P>
      <CodeBlock>{c.problemCode}</CodeBlock>

      <H2>{c.savingsHeading}</H2>
      <div className="space-y-2">
        {c.savingsRows.map((row: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-gray-400">{row.scenario}</span>
            <span className="text-red-400">{c.ohneLabel} {row.ohne}</span>
            <span className="text-green-400">{c.mitLabel} {row.mit}</span>
            <span className="text-yellow-400">{c.speedLabel} {row.speed}</span>
          </div>
        ))}
      </div>

      <H2>{c.comboHeading}</H2>
      <CodeBlock>{c.comboCode}</CodeBlock>

      <H2>{c.frameTrainHeading}</H2>
      <P><Rich html={c.frameTrainText} /></P>

      <InfoBox type="info" title={c.whenTitle}>
        {c.whenText}
      </InfoBox>
    </div>
  )
}

function EarlyStoppingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Target className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.whyHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-red-400/20 rounded-xl p-5">
          <h3 className="text-red-400 font-bold mb-2">{c.withoutTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.withoutItems.map((it: string, i: number) => <li key={i}>{it}</li>)}
          </ul>
        </div>
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-2">{c.withTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.withItems.map((it: string, i: number) => <li key={i}>{it}</li>)}
          </ul>
        </div>
      </div>

      <H2>{c.paramsHeading}</H2>
      <div className="space-y-4">
        {c.params.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <h3 className="text-white font-bold font-mono">{item.param}</h3>
              <code className="text-violet-300 text-xs">{item.values}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-600 text-xs mb-1">{c.effectLabel} {item.effect}</p>
            <p className="text-green-400 text-xs">💡 {item.recommendation}</p>
          </div>
        ))}
      </div>

      <H2>{c.strategyHeading}</H2>
      <CodeBlock>{c.strategyCode}</CodeBlock>

      <H2>{c.bestPracticesHeading}</H2>
      <div className="space-y-2">
        {c.bestPractices.map((tip: string, i: number) => (
          <div key={i} className="glass border border-green-400/15 rounded-lg p-3 flex gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EnsemblesSection({ c }: { c: any }) {
  const t = useTranslations('AICoach.finalCta')
  return (
    <div className="space-y-6">
      <SectionTitle icon={<GitBranch className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.methodsHeading}</H2>
      <div className="space-y-5">
        {c.methods.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <Tag color="green">Ø {item.improvement}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <CodeBlock>{item.code}</CodeBlock>
            <p className="text-gray-600 text-xs">{c.useLabel} {item.use}</p>
          </div>
        ))}
      </div>

      <H2>{c.diversityHeading}</H2>
      <P><Rich html={c.diversityIntro} /></P>
      <div className="grid md:grid-cols-2 gap-4">
        {c.diversitySources.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3">
            <p className="text-violet-300 text-sm font-semibold">{item.source}</p>
            <p className="text-gray-500 text-xs mt-1">{item.benefit}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title={c.frameTrainTitle}>
        {c.frameTrainText}
      </InfoBox>

      {/* Final CTA */}
      <div className="mt-10 p-8 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-violet-400" />
          <h2 className="text-2xl font-black text-white">{t('heading')}</h2>
        </div>
        <p className="text-gray-400 mb-6">
          {t('text')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/ai-training-guide" className="px-4 py-2 bg-violet-600/20 border border-violet-400/30 rounded-lg text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-all flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t('allChapters')}
          </Link>
          <Link href="/docs/ai-training-guide/ml-grundlagen" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {t('restart')}
          </Link>
          <Link href="/download" className="px-4 py-2 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 border border-violet-400/30 rounded-lg text-white text-sm font-semibold hover:from-violet-600/70 hover:to-fuchsia-600/70 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t('startCta')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FortgeschrittenePage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const content = t.raw('chapters.fortgeschrittene.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'mixed-precision': <MixedPrecisionSection c={content.mixedPrecision} />,
    'gradient-checkpointing': <GradientCheckpointingSection c={content.gradientCheckpointing} />,
    'early-stopping': <EarlyStoppingSection c={content.earlyStopping} />,
    'ensembles': <EnsemblesSection c={content.ensembles} />,
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
