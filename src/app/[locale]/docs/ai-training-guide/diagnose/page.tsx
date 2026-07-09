'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield, Flame, Sliders, AlertTriangle, ChevronRight } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Highlight, CodeBlock, Tag, Rich,
  HighLRChart, LowLRChart, OverfittingChart
} from '../_shared'

const CHAPTER_ID = 'diagnose' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

const PRIORITY_COLOR: Record<string, 'red' | 'yellow' | 'blue'> = {
  veryHigh: 'red', high: 'yellow', medium: 'blue', lowMedium: 'blue',
}
const SEVERITY_COLOR: Record<string, 'red' | 'yellow' | 'green'> = {
  critical: 'red', high: 'yellow', moderate: 'yellow', positive: 'green',
}
const SEVERITY_BORDER: Record<string, string> = {
  critical: 'border-red-400/20', high: 'border-orange-400/20', moderate: 'border-yellow-400/20', positive: 'border-green-400/20',
}

function OverfittingFixSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Shield className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P>{c.intro}</P>
      <OverfittingChart />

      <H2>{c.measuresHeading}</H2>
      <div className="space-y-4">
        {c.measures.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5 flex gap-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-white font-black flex-shrink-0`}>
              {item.rank}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                <h3 className="text-white font-bold">{item.name}</h3>
                <div className="flex gap-2">
                  <Tag color="green">{item.effect}</Tag>
                  <Tag color="blue">{c.effortLabel} {item.cost}</Tag>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
              <p className="text-violet-300 text-xs font-mono bg-gray-900/40 rounded-lg px-3 py-1">{item.how}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.comboHeading}</H2>
      <div className="space-y-3">
        {c.combos.map((item: any, i: number) => (
          <div key={i} className="glass border border-violet-400/20 rounded-xl p-4">
            <h3 className="text-violet-300 font-semibold text-sm mb-1">{item.situation}</h3>
            <code className="text-green-400 text-xs block mb-1">{item.combo}</code>
            <p className="text-gray-600 text-xs">{item.prio}</p>
          </div>
        ))}
      </div>

      <InfoBox type="success" title={c.goldenRuleTitle}>
        {c.goldenRuleText}
      </InfoBox>
    </div>
  )
}

function UnderfittingFixSection({ c }: { c: any }) {
  const stepColors = ['border-violet-400/20', 'border-blue-400/20', 'border-cyan-400/20', 'border-green-400/20']
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Flame className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P>{c.intro}</P>

      <H2>{c.treeHeading}</H2>
      <div className="space-y-4">
        {c.treeSteps.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-5 ${stepColors[i]}`}>
            <div className="flex items-center gap-2 mb-2">
              <Tag color="purple">{item.step}</Tag>
              <h3 className="text-white font-semibold text-sm">{item.question}</h3>
            </div>
            <p className="text-green-400 text-xs">✓ {item.yes}</p>
            <p className="text-red-400 text-xs mt-1">✗ {item.no}</p>
          </div>
        ))}
      </div>

      <H2>{c.fixesHeading}</H2>
      <div className="space-y-3">
        {c.fixes.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4 flex justify-between gap-4">
            <div className="flex-1">
              <p className="text-orange-300 font-semibold text-sm mb-1">{item.cause}</p>
              <p className="text-gray-400 text-sm">{item.fix}</p>
            </div>
            <Tag color={PRIORITY_COLOR[item.priorityKey] || 'blue'}>{item.priority}</Tag>
          </div>
        ))}
      </div>

      <InfoBox type="info" title={c.miniDatasetTitle}>
        {c.miniDatasetText}
      </InfoBox>
    </div>
  )
}

function LRProblemeSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sliders className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P>{c.intro}</P>

      <HighLRChart />
      <LowLRChart />

      <H2>{c.matrixHeading}</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 py-3 pr-4">{c.matrixHeaders.symptom}</th>
              <th className="text-left text-gray-400 py-3 pr-4">{c.matrixHeaders.diagnosis}</th>
              <th className="text-left text-gray-400 py-3">{c.matrixHeaders.fix}</th>
            </tr>
          </thead>
          <tbody>
            {c.matrixRows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-400 text-xs">{row.symptom}</td>
                <td className="py-3 pr-4"><Tag color="yellow">{row.diag}</Tag></td>
                <td className="py-3 text-green-400 text-xs font-mono">{row.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>{c.rangeTestHeading}</H2>
      <P><Rich html={c.rangeTestIntro} /></P>
      <CodeBlock>{c.rangeTestCode}</CodeBlock>

      <H2>{c.batchHeading}</H2>
      <P><Rich html={c.batchIntro} /></P>
      <CodeBlock>{c.batchCode}</CodeBlock>

      <H2>{c.warmupHeading}</H2>
      <P><Rich html={c.warmupIntro} /></P>
      <CodeBlock>{c.warmupCode}</CodeBlock>

      <InfoBox type="success" title={c.recommendationTitle}>
        <Rich as="div" html={c.recommendationText} />
      </InfoBox>
    </div>
  )
}

function LossSpikeSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<AlertTriangle className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.typesHeading}</H2>
      <div className="space-y-4">
        {c.types.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-5 ${SEVERITY_BORDER[item.severityKey] || 'border-yellow-400/20'}`}>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
              <h3 className="text-white font-bold">{item.type}</h3>
              <Tag color={SEVERITY_COLOR[item.severityKey] || 'yellow'}>{item.severity}</Tag>
            </div>
            <p className="text-gray-500 text-xs mb-1">{c.causeLabel} <span className="text-gray-400">{item.cause}</span></p>
            <p className="text-gray-500 text-xs mb-3">{c.symptomsLabel} <span className="text-gray-400">{item.symptoms}</span></p>
            <p className="text-green-400 text-xs font-semibold mb-2">{c.solutionsLabel}</p>
            <ul className="space-y-1">
              {item.solutions.map((s: string, j: number) => (
                <li key={j} className="text-gray-400 text-sm flex gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <H2>{c.preventionHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {c.preventions.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-1 text-sm">{item.name}</h3>
            <code className="text-violet-300 text-xs block mb-2">{item.config}</code>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title={c.defaultsTitle}>
        {c.defaultsText}
      </InfoBox>
    </div>
  )
}

export default function DiagnosePage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const content = t.raw('chapters.diagnose.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'overfitting-fix': <OverfittingFixSection c={content.overfittingFix} />,
    'underfitting-fix': <UnderfittingFixSection c={content.underfittingFix} />,
    'lr-probleme': <LRProblemeSection c={content.lrProbleme} />,
    'loss-spike': <LossSpikeSection c={content.lossSpike} />,
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
