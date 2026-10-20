'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppScreenshot } from '@/components/AppScreenshot'
import { LineChart, CheckCircle2, AlertTriangle, TrendingDown, Activity, ChevronRight } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Highlight, CodeBlock, Tag, Rich,
  GoodTrainingChart, OverfittingChart, UnderfittingChart, HighLRChart
} from '../_shared'

const CHAPTER_ID = 'trainingsverlauf' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

function LossKurvenSection({ c, locale }: { c: any; locale: string }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<LineChart className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.anatomyHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {c.anatomyItems.map((item: any, i: number) => (
          <div key={i} className={`bg-surface border border-line border ${i < 2 ? 'border-line' : i === 2 ? 'border-line' : 'border-line'} rounded-md p-4`}>
            <h3 className="text-ink font-semibold mb-2 text-sm">{item.title}</h3>
            <p className="text-ink-muted text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <H2>{c.patternsHeading}</H2>
      <GoodTrainingChart />
      <P><Highlight>{c.goodLabel}</Highlight> {c.goodText}</P>

      <OverfittingChart />
      <P><Highlight>{c.overfittingLabel}</Highlight> {c.overfittingText}</P>

      <UnderfittingChart />
      <P><Highlight>{c.underfittingLabel}</Highlight> {c.underfittingText}</P>

      <HighLRChart />
      <P><Highlight>{c.highLrLabel}</Highlight> {c.highLrText}</P>

      <H2>{c.benchmarksHeading}</H2>
      <div className="bg-surface border border-line border border-line rounded-md p-5">
        <div className="space-y-3">
          {c.benchmarksTable.map((row: any, i: number) => (
            <div key={i} className="flex gap-3 items-center text-sm flex-wrap">
              <span className="text-ink-muted flex-1 min-w-0">{row.metric}</span>
              <Tag color="green">✓ {row.good}</Tag>
              <Tag color="yellow">~ {row.ok}</Tag>
              <Tag color="red">✗ {row.bad}</Tag>
            </div>
          ))}
        </div>
        <p className="text-ink-faint text-xs mt-4">{c.benchmarksNote}</p>
      </div>

      <H2>{c.frametrainHeading}</H2>
      <P><Rich html={c.frametrainText} /></P>
      {/* Der Screenshot der Analyse-Charts liegt bislang nur in der deutschen
          Oberfläche vor. Sobald die englische Fassung existiert, kann die
          Locale-Bedingung ersatzlos raus. */}
      {locale === 'de' && (
        <AppScreenshot
          locale="de"
          slug="analysis-charts"
          alt={c.screenshotAlt}
          caption={c.screenshotCaption}
          className="mt-6"
        />
      )}
    </div>
  )
}

function GutesTrainingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<CheckCircle2 className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />

      <InfoBox type="success" title={c.idealTitle}>
        {c.idealText}
      </InfoBox>

      <GoodTrainingChart />

      <H2>{c.checklistHeading}</H2>
      <div className="space-y-3">
        {c.checklist.map((item: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-md p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-ink font-semibold text-sm">{item.check}</p>
              <p className="text-ink-faint text-xs mt-1">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.phasesHeading}</H2>
      <div className="space-y-3">
        {c.phases.map((item: any, i: number) => {
          const colors = ['border-line', 'border-line', 'border-line', 'border-danger']
          return (
            <div key={i} className={`bg-surface border border-line border ${colors[i]} rounded-md p-4`}>
              <h3 className="text-ink font-semibold mb-1 text-sm">{item.phase}</h3>
              <p className="text-ink-muted text-sm">{item.desc}</p>
            </div>
          )
        })}
      </div>

      <H2>{c.whenHeading}</H2>
      <div className="space-y-2">
        {c.whenTable.map((item: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-sm p-4">
            <p className="text-ink text-sm">{item.signal}</p>
            <p className="text-indigo-text text-xs font-semibold mt-1">→ {item.action}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function OverfittingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<AlertTriangle className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <OverfittingChart />

      <H2>{c.signsHeading}</H2>
      <div className="space-y-3">
        {c.signs.map((item: any, i: number) => (
          <div key={i} className={`bg-surface border border-line border rounded-md p-4 flex justify-between items-center ${item.severityKey === 'critical' ? 'border-danger' : 'border-warning'}`}>
            <p className="text-ink text-sm">{item.sign}</p>
            <Tag color={item.severityKey === 'critical' ? 'red' : 'yellow'}>{item.severityLabel}</Tag>
          </div>
        ))}
      </div>

      <H2>{c.causesHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {c.causes.map((item: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-md p-4">
            <h3 className="text-danger font-semibold mb-1 text-sm">{item.cause}</h3>
            <p className="text-ink-muted text-sm">{item.detail}</p>
          </div>
        ))}
      </div>

      <H2>{c.tradeoffHeading}</H2>
      <P><Rich html={c.tradeoffIntro} /></P>
      <div className="bg-surface border border-line border border-line rounded-md p-5">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {c.tradeoffCards.map((card: any, i: number) => {
            const styles = [
              { border: 'border-line', text: 'text-warning' },
              { border: 'border-line', text: 'text-success' },
              { border: 'border-danger', text: 'text-danger' },
            ]
            const style = styles[i]
            return (
              <div key={i} className={`bg-surface border border-line border ${style.border} rounded-md p-4`}>
                <p className={`${style.text} font-semibold text-lg mb-2`}>{card.name}</p>
                <p className="text-ink-muted">{card.bias}</p>
                <p className="text-ink-muted">{card.variance}</p>
                <p className="text-ink-faint text-xs mt-2">{card.note}</p>
              </div>
            )
          })}
        </div>
      </div>

      <InfoBox type="info" title={c.infoTitle}>
        {c.infoText}
      </InfoBox>
    </div>
  )
}

function UnderfittingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TrendingDown className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <UnderfittingChart />

      <H2>{c.signsHeading}</H2>
      <div className="space-y-3">
        {c.signs.map((item: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-md p-4">
            <p className="text-warning font-semibold text-sm">{item.sign}</p>
            <p className="text-ink-faint text-xs mt-1">{item.detail}</p>
          </div>
        ))}
      </div>

      <H2>{c.causesHeading}</H2>
      <div className="space-y-3">
        {c.causes.map((item: any, i: number) => (
          <div key={i} className="bg-surface border border-line border border-line rounded-md p-4">
            <div className="flex gap-2 items-start mb-2">
              <Tag color="yellow">{c.causeLabel}</Tag>
              <h3 className="text-warning font-semibold text-sm">{item.cause}</h3>
            </div>
            <p className="text-ink-faint text-xs mb-2">{c.checkLabel} {item.check}</p>
            <p className="text-ink-muted text-sm">→ {c.fixLabel} {item.fix}</p>
          </div>
        ))}
      </div>

      <InfoBox type="warning" title={c.warningTitle}>
        {c.warningText}
      </InfoBox>
    </div>
  )
}

function InstabilesTrainingSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Activity className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P>{c.intro}</P>

      <HighLRChart />

      <H2>{c.patternsHeading}</H2>
      <div className="space-y-4">
        {c.patterns.map((item: any, i: number) => {
          const colors = ['border-line', 'border-line', 'border-danger', 'border-line', 'border-line']
          return (
            <div key={i} className={`bg-surface border border-line border rounded-md p-5 ${colors[i]}`}>
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <h3 className="text-ink font-semibold text-sm flex-1">{item.pattern}</h3>
                <Tag color="yellow">{item.cause}</Tag>
              </div>
              <p className="text-ink-muted text-sm mb-2">{item.desc}</p>
              <p className="text-success text-xs font-semibold">→ {item.fix}</p>
            </div>
          )
        })}
      </div>

      <H2>{c.clipHeading}</H2>
      <P><Rich html={c.clipIntro} /></P>
      <CodeBlock>{c.clipCode}</CodeBlock>

      <InfoBox type="success" title={c.successTitle}>
        {c.successText}
      </InfoBox>
    </div>
  )
}

export default function TrainingsverlaufPage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const locale = useLocale()
  const content = t.raw('chapters.trainingsverlauf.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'loss-kurven': <LossKurvenSection c={content.lossKurven} locale={locale} />,
    'gutes-training': <GutesTrainingSection c={content.gutesTraining} />,
    'overfitting': <OverfittingSection c={content.overfitting} />,
    'underfitting': <UnderfittingSection c={content.underfitting} />,
    'instabiles-training': <InstabilesTrainingSection c={content.instabilesTraining} />,
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
