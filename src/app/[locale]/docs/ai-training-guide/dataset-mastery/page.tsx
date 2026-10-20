'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppScreenshot } from '@/components/AppScreenshot'
import { Database, Settings, Sparkles, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Rich, CodeBlock, Tag
} from '../_shared'

const CHAPTER_ID = 'dataset-mastery' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

function qualityColor(key: string): 'green' | 'yellow' | 'red' | 'blue' {
  if (key === 'veryHigh') return 'green'
  if (key === 'high') return 'yellow'
  if (key === 'medium') return 'blue'
  return 'red'
}

const STRATEGY_COLORS: Record<string, string> = {
  violet: 'border-line',
  blue: 'border-line',
  cyan: 'border-line',
  green: 'border-line',
}

function DatenQualitaetSection({ c, locale }: { c: any; locale: string }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Database className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />

      <InfoBox type="warning" title={c.warningTitle}>
        {c.warningText}
      </InfoBox>

      <H2>{c.dataAmountHeading}</H2>
      <P>{c.dataAmountIntro}</P>
      <div className="space-y-2">
        {c.dataAmountTable.map((row: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-3 grid md:grid-cols-4 gap-2 text-sm">
            <span className="text-ink md:col-span-1">{row.task}</span>
            <span className="text-danger">Min: {row.min}</span>
            <span className="text-warning">{row.good}</span>
            <span className="text-success">{row.ideal}</span>
          </div>
        ))}
      </div>
      <p className="text-ink-faint text-xs">{c.dataAmountNote}</p>

      <H2>{c.qualityHeading}</H2>
      <P><Rich html={c.qualityText} /></P>

      <H2>{c.checklistHeading}</H2>
      <div className="space-y-2">
        {c.checklist.map((item: any, i: number) => (
          <div key={i} className={`bg-surface border border-line border rounded-md p-4 flex gap-3 ${item.critical ? 'border-line' : 'border-line'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.critical ? 'text-success' : 'text-ink-faint'}`} />
            <div>
              <p className="text-ink font-semibold text-sm">{item.check}</p>
              <p className="text-ink-faint text-xs mt-1">{item.how}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.sourcesHeading}</H2>
      <div className="space-y-2">
        {c.sources.map((row: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-ink">{row.source}</span>
            <Tag color={qualityColor(row.qualityKey)}>{row.quality}</Tag>
            <span className="text-ink-faint">{row.cost}</span>
            <span className="text-ink-faint text-xs">{row.note}</span>
          </div>
        ))}
      </div>

      <H2>{c.screenshotHeading}</H2>
      <P>{c.screenshotText}</P>
      <AppScreenshot
        locale={locale}
        slug="datasets"
        alt={c.screenshotAlt}
        caption={c.screenshotCaption}
      />
    </div>
  )
}

function PreprocessingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Settings className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.pipelineHeading}</H2>
      <CodeBlock>{c.pipelineCode}</CodeBlock>

      <H2>{c.dedupHeading}</H2>
      <P>{c.dedupText}</P>
      <CodeBlock>{c.dedupCode}</CodeBlock>

      <H2>{c.tokenHeading}</H2>
      <P><Rich html={c.tokenText} /></P>
      <CodeBlock>{c.tokenCode}</CodeBlock>

      <H2>{c.lengthHeading}</H2>
      <div className="space-y-2">
        {c.lengthTable.map((row: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-3 flex justify-between items-center text-sm">
            <span className="text-ink-muted">{row.task}</span>
            <code className="text-indigo-text font-mono">max_length = {row.length}</code>
            <span className="text-ink-faint text-xs hidden md:block">{row.note}</span>
          </div>
        ))}
      </div>

      <InfoBox type="info" title={c.vramTitle}>
        {c.vramText}
      </InfoBox>

      <H2>{c.formatHeading}</H2>
      <CodeBlock>{c.formatCode}</CodeBlock>
    </div>
  )
}

function AugmentationSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.techniquesHeading}</H2>
      <div className="space-y-5">
        {c.techniques.map((item: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-md p-6">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <h3 className="text-ink font-semibold">{item.name}</h3>
              <Tag color="green">{item.quality}</Tag>
            </div>
            <p className="text-ink-muted text-sm mb-3">{item.desc}</p>
            <div className="bg-surface rounded-sm p-3 text-xs text-ink-muted font-mono mb-3">
              {c.exampleLabel} {item.example}
            </div>
            <CodeBlock>{item.code}</CodeBlock>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-success font-semibold mb-1">{c.prosLabel}</p><p className="text-ink-muted">{item.pros}</p></div>
              <div><p className="text-danger font-semibold mb-1">{c.consLabel}</p><p className="text-ink-muted">{item.cons}</p></div>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.strategyHeading}</H2>
      <CodeBlock>{c.strategyCode}</CodeBlock>

      <InfoBox type="warning" title={c.warningTitle}>
        {c.warningText}
      </InfoBox>
    </div>
  )
}

function BalancingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<BarChart3 className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.detectHeading}</H2>
      <CodeBlock>{c.detectCode}</CodeBlock>

      <H2>{c.strategiesHeading}</H2>
      <div className="space-y-5">
        {c.strategies.map((item: any, i: number) => (
          <div key={i} className={`bg-surface border border-line border rounded-md p-6 ${STRATEGY_COLORS[item.colorKey] ?? 'border-line'}`}>
            <h3 className="text-ink font-semibold mb-2">{item.name}</h3>
            <p className="text-ink-muted text-sm mb-3">{item.desc}</p>
            <CodeBlock>{item.code}</CodeBlock>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-success font-semibold mb-1">✓</p><p className="text-ink-muted">{item.pros}</p></div>
              <div><p className="text-danger font-semibold mb-1">✗</p><p className="text-ink-muted">{item.cons}</p></div>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.metricsHeading}</H2>
      <P><Rich html={c.metricsIntro} /></P>
      <div className="space-y-2">
        {c.metricsTable.map((row: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-3 grid md:grid-cols-3 gap-2 text-sm">
            <span className="text-indigo-text font-semibold">{row.metric}</span>
            <span className="text-ink-muted">{row.when}</span>
            <span className="text-ink-faint text-xs">{row.note}</span>
          </div>
        ))}
      </div>

      <InfoBox type="success" title={c.recommendationTitle}>
        {c.recommendationText}
      </InfoBox>
    </div>
  )
}

export default function DatasetMasteryPage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const locale = useLocale()
  const content = t.raw('chapters.datasetMastery.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'daten-qualitaet': <DatenQualitaetSection c={content.datenQualitaet} locale={locale} />,
    'preprocessing': <PreprocessingSection c={content.preprocessing} />,
    'augmentation': <AugmentationSection c={content.augmentation} />,
    'balancing': <BalancingSection c={content.balancing} />,
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
