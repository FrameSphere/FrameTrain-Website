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
  violet: 'border-line',
  blue: 'border-line',
  cyan: 'border-line',
}

const METHOD_COLORS: Record<string, string> = {
  violet: 'border-line',
  blue: 'border-line',
  cyan: 'border-line',
  green: 'border-line',
  orange: 'border-line',
  pink: 'border-line',
}

function FullFineTuningSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.prosConsHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface border border-line border border-line rounded-md p-5">
          <h3 className="text-success font-semibold mb-3">{c.prosTitle}</h3>
          <ul className="space-y-2 text-ink-muted text-sm">
            {c.prosItems.map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="bg-surface border border-line border border-danger rounded-md p-5">
          <h3 className="text-danger font-semibold mb-3">{c.consTitle}</h3>
          <ul className="space-y-2 text-ink-muted text-sm">
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
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-4 grid md:grid-cols-3 gap-2 items-center">
            <span className="text-ink-muted text-sm">{item.condition}</span>
            <span className="text-indigo-text font-semibold text-center">{item.winner}</span>
            <span className="text-ink-faint text-xs">{item.reason}</span>
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
          <div key={i} className="bg-surface border border-line border border-line rounded-md p-5">
            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
              <h3 className="text-ink font-semibold font-mono">{item.param}</h3>
              <code className="text-indigo-text text-xs">{item.values}</code>
            </div>
            <p className="text-ink-muted text-sm mb-2">{item.desc}</p>
            <p className="text-success text-xs mb-1">{item.recommendation}</p>
            <p className="text-ink-faint text-xs">{c.memoryLabel} {item.memory}</p>
          </div>
        ))}
      </div>

      <H2>{c.modelsHeading}</H2>
      <div className="space-y-2">
        {c.modelsTable.map((row: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-3 grid grid-cols-4 gap-2 text-xs">
            <span className="text-ink font-semibold">{row.model}</span>
            <span className="text-indigo-text font-mono">{row.modules}</span>
            <span className="text-indigo-text">{row.rank}</span>
            <span className="text-warning">LR: {row.lr}</span>
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
            <tr className="border-b border-line">
              {c.comparisonHeaders.map((h: string) => (
                <th key={h} className="text-left text-ink-muted py-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.comparisonRows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-line">
                <td className="py-3 pr-4 text-ink">{row.m}</td>
                <td className="py-3 pr-4 text-warning">{row.v}</td>
                <td className="py-3 pr-4 text-success">{row.q}</td>
                <td className="py-3 pr-4 text-ink-muted">{row.s}</td>
                <td className="py-3 text-ink-faint text-xs">{row.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-ink-faint text-xs mt-2">{c.footnote}</p>
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
          <div key={i} className={`bg-surface border border-line border rounded-md p-5 ${METHOD_COLORS[item.colorKey] ?? 'border-line'}`}>
            <h3 className="text-ink font-semibold mb-2">{item.name}</h3>
            <p className="text-ink-muted text-sm mb-3">{item.desc}</p>
            <div className="flex flex-wrap gap-3 text-xs mb-3">
              <span>{c.trainableLabel} <Tag color="purple">{item.trainable}</Tag></span>
              <span>{c.memoryLabel} <Tag color="blue">{item.memory}</Tag></span>
              <span>{c.qualityLabel} <Tag color="green">{item.quality}</Tag></span>
              <span>{c.speedLabel} <Tag color="cyan">{item.speed}</Tag></span>
            </div>
            <p className="text-ink-faint text-xs">{c.whenLabel} {item.when}</p>
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
          <div key={i} className={`bg-surface border border-line border rounded-md p-6 ${TREE_COLORS[item.colorKey] ?? 'border-line'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Tag color="purple">{item.step}</Tag>
              <h3 className="text-ink font-semibold">{item.question}</h3>
            </div>
            <div className="space-y-2">
              {item.options.map((opt: any, j: number) => (
                <div key={j} className="flex flex-wrap gap-3 items-start text-sm py-2 border-b border-line last:border-0">
                  <Tag color="yellow">{opt.label}</Tag>
                  <span className="text-indigo-text font-semibold">{opt.result}</span>
                  <span className="text-ink-faint text-xs">{opt.detail}</span>
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
            <tr className="border-b border-line">
              {c.quickRefHeaders.map((h: string) => (
                <th key={h} className="text-left text-ink-muted py-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.quickRefRows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2 pr-4 text-ink-muted">{row.s}</td>
                <td className="py-2 pr-4 text-indigo-text font-mono">{row.m}</td>
                <td className="py-2 pr-4 text-indigo-text">{row.r}</td>
                <td className="py-2 pr-4 text-warning">{row.lr}</td>
                <td className="py-2 text-success">{row.e}</td>
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
    <div className="min-h-screen flex flex-col bg-bg ">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center gap-2 text-sm text-ink-faint">
            <Link href="/docs" className="hover:text-ink transition-colors">Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/docs/ai-training-guide" className="hover:text-ink transition-colors">{tDocs('coachSidebar.title')}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">{CHAPTER.emoji} {t(`chapters.${CHAPTER.key}.title`)}</span>
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
