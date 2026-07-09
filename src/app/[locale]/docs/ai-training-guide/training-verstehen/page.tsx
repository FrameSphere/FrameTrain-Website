'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Activity, Target, BarChart3, GitBranch, ChevronRight } from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag, Rich, DataSplitDiagram
} from '../_shared'

const CHAPTER_ID = 'training-verstehen' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

function TrainingLoopSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Activity className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.loopHeading}</H2>
      <CodeBlock>{c.loopCode}</CodeBlock>

      <H2>{c.modeHeading}</H2>
      <P><Rich html={c.modeIntro} /></P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-violet-400/20 rounded-xl p-5">
          <h3 className="text-violet-300 font-bold mb-3">{c.trainModeTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.trainModeItems.map((it: string, i: number) => (
              <li key={i}><Rich html={it} /></li>
            ))}
          </ul>
        </div>
        <div className="glass border border-cyan-400/20 rounded-xl p-5">
          <h3 className="text-cyan-300 font-bold mb-3">{c.evalModeTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.evalModeItems.map((it: string, i: number) => (
              <li key={i}><Rich html={it} /></li>
            ))}
          </ul>
        </div>
      </div>

      <InfoBox type="warning" title={c.warningTitle}>
        {c.warningText}
      </InfoBox>

      <H2>{c.stepHeading}</H2>
      <P><Rich html={c.stepIntro} /></P>
      <CodeBlock>{c.stepCode}</CodeBlock>

      <H2>{c.checkpointHeading}</H2>
      <div className="space-y-3">
        {c.checkpointStrategies.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4 flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">{item.name}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
            <Tag color="green">{item.rec}</Tag>
          </div>
        ))}
      </div>
    </div>
  )
}

function LossFunktionenSection({ c }: { c: any }) {
  const colors = ['border-violet-400/20', 'border-blue-400/20', 'border-cyan-400/20', 'border-green-400/20']
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Target className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.mainHeading}</H2>
      <div className="space-y-5">
        {c.losses.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-6 ${colors[i]}`}>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
              <h3 className="text-white font-bold text-lg">{item.name}</h3>
              <Tag color="purple">{item.use}</Tag>
            </div>
            <code className="text-violet-300 text-sm font-mono block mb-3 bg-gray-900/40 rounded-lg px-3 py-2">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-500 text-xs mb-3">{c.exampleLabel} {item.example}</p>
            <div className="flex items-start gap-2 bg-white/3 rounded-lg p-3">
              <span className="text-blue-400 text-xs">💡</span>
              <p className="text-blue-300 text-xs">{item.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.llmHeading}</H2>
      <div className="space-y-3">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">{c.clmTitle}</h3>
          <p className="text-gray-400 text-sm mb-3">{c.clmText}</p>
          <CodeBlock>{c.clmCode}</CodeBlock>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">{c.mlmTitle}</h3>
          <p className="text-gray-400 text-sm mb-3">{c.mlmText}</p>
          <CodeBlock>{c.mlmCode}</CodeBlock>
        </div>
      </div>

      <InfoBox type="info" title={c.autoBoxTitle}>
        {c.autoBoxText}
      </InfoBox>
    </div>
  )
}

function MetrikenSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<BarChart3 className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <H2>{c.classificationHeading}</H2>

      <H3>{c.confusionHeading}</H3>
      <div className="glass border border-white/10 rounded-xl p-5 mb-4">
        <div className="grid grid-cols-3 gap-2 text-sm text-center max-w-sm mx-auto">
          <div className="text-gray-600 col-start-2 pb-2">{c.confusion.predPos}</div>
          <div className="text-gray-600 pb-2">{c.confusion.predNeg}</div>
          <div className="text-gray-600 flex items-center justify-end pr-2">{c.confusion.actualPos}</div>
          <div className="bg-green-500/20 border border-green-400/30 rounded p-3 font-bold text-green-400">TP<br/><span className="text-xs font-normal">{c.confusion.tp}</span></div>
          <div className="bg-red-500/20 border border-red-400/30 rounded p-3 font-bold text-red-400">FN<br/><span className="text-xs font-normal">{c.confusion.fn}</span></div>
          <div className="text-gray-600 flex items-center justify-end pr-2">{c.confusion.actualNeg}</div>
          <div className="bg-red-500/20 border border-red-400/30 rounded p-3 font-bold text-orange-400">FP<br/><span className="text-xs font-normal">{c.confusion.fp}</span></div>
          <div className="bg-green-500/20 border border-green-400/30 rounded p-3 font-bold text-cyan-400">TN<br/><span className="text-xs font-normal">{c.confusion.tn}</span></div>
        </div>
      </div>

      <div className="space-y-4">
        {c.metrics.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <code className="text-violet-300 text-sm font-mono block mb-2">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            {item.warning && (
              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
                <p className="text-yellow-400 text-xs">⚠️ {item.warning}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <H2>{c.lmHeading}</H2>
      <div className="space-y-4">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">{c.pplTitle}</h3>
          <p className="text-gray-400 text-sm mb-3"><Rich html={c.pplText} /></p>
          <CodeBlock>{c.pplCode}</CodeBlock>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">{c.bleuTitle}</h3>
          <p className="text-gray-400 text-sm mb-2">{c.bleuText}</p>
          <p className="text-gray-500 text-xs">{c.bleuGuidelines}</p>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">{c.rougeTitle}</h3>
          <p className="text-gray-400 text-sm">{c.rougeText}</p>
        </div>
      </div>

      <H2>{c.whichHeading}</H2>
      <div className="space-y-2">
        {c.whichTable.map((row: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid md:grid-cols-3 gap-2 text-sm">
            <span className="text-gray-400">{row.situation}</span>
            <span className="text-violet-300 font-semibold">{row.metric}</span>
            <span className="text-gray-500">{row.reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrainValTestSection({ c }: { c: any }) {
  const colors = ['border-violet-400/30', 'border-cyan-400/30', 'border-green-400/30']
  return (
    <div className="space-y-6">
      <SectionTitle icon={<GitBranch className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />
      <P><Rich html={c.intro} /></P>

      <DataSplitDiagram />

      <div className="space-y-4">
        {c.splits.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-6 ${colors[i]}`}>
            <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.role}</p>
            <p className="text-gray-600 text-xs italic mb-4">{c.ruleLabel} {item.rule}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-green-400 text-xs font-semibold mb-2">✓ {c.allowedLabel}</p>
                {item.dos.map((d: string, j: number) => <p key={j} className="text-gray-400 text-xs">• {d}</p>)}
              </div>
              <div>
                <p className="text-red-400 text-xs font-semibold mb-2">✗ {c.forbiddenLabel}</p>
                {item.donts.map((d: string, j: number) => <p key={j} className="text-gray-400 text-xs">• {d}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="error" title={c.leakageTitle}>
        <Rich as="div" html={c.leakageText} />
      </InfoBox>

      <H2>{c.cvHeading}</H2>
      <P><Rich html={c.cvIntro} /></P>
      <CodeBlock>{c.cvCode}</CodeBlock>

      <H2>{c.stratHeading}</H2>
      <P><Rich html={c.stratText} /></P>
      <CodeBlock>{c.stratCode}</CodeBlock>

      <InfoBox type="success" title={c.recommendationTitle}>
        {c.recommendationText}
      </InfoBox>
    </div>
  )
}

export default function TrainingVerstehenPage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const content = t.raw('chapters.trainingVerstehen.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])
  const sectionContent = {
    'training-loop': <TrainingLoopSection c={content.trainingLoop} />,
    'loss-funktionen': <LossFunktionenSection c={content.lossFunktionen} />,
    'metriken': <MetrikenSection c={content.metriken} />,
    'train-val-test': <TrainValTestSection c={content.trainValTest} />,
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
