'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Layers, Cpu, Wand2, Lightbulb, ChevronRight } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Rich, CodeBlock, Tag, LoRADiagram
} from '../_shared'

const CHAPTER_ID = 'fine-tuning' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

const TREE_COLORS: Record<string, string> = {
  violet: 'border-violet-400/20',
  blue: 'border-blue-400/20',
  cyan: 'border-cyan-400/20',
}

const METHOD_COLORS: Record<string, string> = {
  violet: 'border-violet-400/20',
  blue: 'border-blue-400/20',
  cyan: 'border-cyan-400/20',
  green: 'border-green-400/20',
  orange: 'border-orange-400/20',
  pink: 'border-pink-400/20',
}

function FullFineTuningSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.prosConsHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">{c.prosTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.prosItems.map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="glass border border-red-400/20 rounded-xl p-5">
          <h3 className="text-red-400 font-bold mb-3">{c.consTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.consItems.map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>

      <H2>{c.forgettingHeading}</H2>
      <P>{c.forgettingText}</P>
      <CodeBlock>{c.forgettingCode}</CodeBlock>

      <H2>{c.comparisonHeading}</H2>
      <div className="space-y-3">
        {c.comparisonRows.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4 grid md:grid-cols-3 gap-2 items-center">
            <span className="text-gray-400 text-sm">{item.condition}</span>
            <span className="text-violet-300 font-bold text-center">{item.winner}</span>
            <span className="text-gray-600 text-xs">{item.reason}</span>
          </div>
        ))}
      </div>

      <InfoBox type="info" title={c.checklistTitle}>
        {c.checklistText}
      </InfoBox>
    </div>
  )
}

function LoRADeepSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.mathHeading}</H2>
      <P>{c.mathText}</P>
      <CodeBlock>{c.mathCode}</CodeBlock>

      <LoRADiagram />

      <H2>{c.hyperparamsHeading}</H2>
      <div className="space-y-4">
        {c.hyperparams.map((item: any, i: number) => (
          <div key={i} className="glass border border-violet-400/15 rounded-xl p-5">
            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
              <h3 className="text-white font-bold font-mono">{item.param}</h3>
              <code className="text-cyan-300 text-xs">{item.values}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs mb-1">💡 {item.recommendation}</p>
            <p className="text-gray-600 text-xs">{c.memoryLabel} {item.memory}</p>
          </div>
        ))}
      </div>

      <H2>{c.modelsHeading}</H2>
      <div className="space-y-2">
        {c.modelsTable.map((row: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-xs">
            <span className="text-white font-semibold">{row.model}</span>
            <span className="text-violet-300 font-mono">{row.modules}</span>
            <span className="text-cyan-300">{row.rank}</span>
            <span className="text-yellow-300">LR: {row.lr}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QLoRASection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Cpu className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.howHeading}</H2>
      <CodeBlock>{c.howCode}</CodeBlock>

      <H2>{c.nf4Heading}</H2>
      <P><Rich html={c.nf4Text} /></P>
      <CodeBlock>{c.nf4Code}</CodeBlock>

      <H2>{c.comparisonHeading}</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {c.comparisonHeaders.map((h: string) => (
                <th key={h} className="text-left text-gray-400 py-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.comparisonRows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-300">{row.m}</td>
                <td className="py-3 pr-4 text-yellow-400">{row.v}</td>
                <td className="py-3 pr-4 text-green-400">{row.q}</td>
                <td className="py-3 pr-4 text-gray-400">{row.s}</td>
                <td className="py-3 text-gray-500 text-xs">{row.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-gray-600 text-xs mt-2">{c.footnote}</p>
      </div>

      <InfoBox type="success" title={c.successTitle}>
        {c.successText}
      </InfoBox>
    </div>
  )
}

function PEFTMethodenSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Wand2 className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.methodsHeading}</H2>
      <div className="space-y-4">
        {c.methods.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-5 ${METHOD_COLORS[item.colorKey] ?? 'border-white/10'}`}>
            <h3 className="text-white font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="flex flex-wrap gap-3 text-xs mb-3">
              <span>{c.trainableLabel} <Tag color="purple">{item.trainable}</Tag></span>
              <span>{c.memoryLabel} <Tag color="blue">{item.memory}</Tag></span>
              <span>{c.qualityLabel} <Tag color="green">{item.quality}</Tag></span>
              <span>{c.speedLabel} <Tag color="cyan">{item.speed}</Tag></span>
            </div>
            <p className="text-gray-600 text-xs">{c.whenLabel} {item.when}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function WannWasSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Lightbulb className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P>{c.intro}</P>

      <H2>{c.treeHeading}</H2>
      <div className="space-y-4">
        {c.tree.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-6 ${TREE_COLORS[item.colorKey] ?? 'border-white/10'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Tag color="purple">{item.step}</Tag>
              <h3 className="text-white font-bold">{item.question}</h3>
            </div>
            <div className="space-y-2">
              {item.options.map((opt: any, j: number) => (
                <div key={j} className="flex flex-wrap gap-3 items-start text-sm py-2 border-b border-white/5 last:border-0">
                  <Tag color="yellow">{opt.label}</Tag>
                  <span className="text-violet-300 font-bold">{opt.result}</span>
                  <span className="text-gray-500 text-xs">{opt.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <H2>{c.quickRefHeading}</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {c.quickRefHeaders.map((h: string) => (
                <th key={h} className="text-left text-gray-400 py-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.quickRefRows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-2 pr-4 text-gray-400">{row.s}</td>
                <td className="py-2 pr-4 text-violet-300 font-mono">{row.m}</td>
                <td className="py-2 pr-4 text-cyan-300">{row.r}</td>
                <td className="py-2 pr-4 text-yellow-300">{row.lr}</td>
                <td className="py-2 text-green-300">{row.e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox type="success" title={c.recommendationTitle}>
        {c.recommendationText}
      </InfoBox>
    </div>
  )
}

export default function FineTuningPage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const content = t.raw('chapters.fineTuning.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'full-finetuning': <FullFineTuningSection c={content.fullFinetuning} />,
    'lora-deep': <LoRADeepSection c={content.loraDeep} />,
    'qlora': <QLoRASection c={content.qlora} />,
    'peft-methoden': <PEFTMethodenSection c={content.peftMethoden} />,
    'wann-was': <WannWasSection c={content.wannWas} />,
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
