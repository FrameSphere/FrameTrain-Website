'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Brain, Zap, Layers, Sparkles, ChevronRight
} from 'lucide-react'
import {
  CHAPTER_META, SubPageLayout,
  InfoBox, SectionTitle, H2, P, Highlight, CodeBlock, Tag, Rich,
  NNDiagram, GradientDescentDiagram
} from '../_shared'

const CHAPTER_ID = 'ml-grundlagen' as const
const CHAPTER = CHAPTER_META.find(c => c.id === CHAPTER_ID)!

// ─── Section Components ───────────────────────────────────────────────────────

function WasIstMLSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />

      <P><Rich html={c.intro} /></P>

      <InfoBox type="info" title={c.infoBoxTitle}>
        <Rich as="div" html={c.infoBoxText} />
      </InfoBox>

      <H2>{c.paradigmsHeading}</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {c.paradigms.map((item: any, i: number) => {
          const colors = ['border-violet-400/30 bg-violet-500/5', 'border-blue-400/30 bg-blue-500/5', 'border-green-400/30 bg-green-500/5']
          return (
            <div key={i} className={`glass border rounded-xl p-5 ${colors[i]}`}>
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
              <p className="text-xs text-gray-500 mb-1">{c.exampleLabel} {item.example}</p>
              <p className="text-xs text-gray-600">{c.useCaseLabel} {item.useCase}</p>
            </div>
          )
        })}
      </div>

      <H2>{c.vocabHeading}</H2>
      <div className="space-y-3">
        {c.vocab.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4 flex gap-4 items-start">
            <Tag>{item.term}</Tag>
            <p className="text-gray-400 text-sm">{item.def}</p>
          </div>
        ))}
      </div>

      <H2>{c.whyFtHeading}</H2>
      <P><Rich html={c.whyFtText} /></P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-gray-500/20 rounded-xl p-5">
          <h3 className="text-gray-400 font-bold mb-3">{c.pretrainTitle}</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            {c.pretrainItems.map((it: string, i: number) => <li key={i}>{it}</li>)}
          </ul>
        </div>
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">{c.ftTitle}</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {c.ftItems.map((it: string, i: number) => <li key={i}>{it}</li>)}
          </ul>
        </div>
      </div>

      <H2>{c.transferHeading}</H2>
      <P><Rich html={c.transferText} /></P>
      <div className="glass border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-24 text-center">
            <div className="text-2xl mb-1">🧠</div>
            <p className="text-xs text-gray-400">{c.transferDiagram.baseModel}<br/>{c.transferDiagram.baseModelSub}</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-violet-400/50 to-transparent relative">
            <div className="absolute -top-3 left-1/3 text-xs text-violet-400">{c.transferDiagram.finetuning}</div>
          </div>
          <div className="w-24 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs text-gray-400">{c.transferDiagram.specialized}<br/>{c.transferDiagram.specializedSub}</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm text-center">{c.transferDiagram.footnote}</p>
      </div>
    </div>
  )
}

function NeuronaleNetzeSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />

      <P><Rich html={c.intro} /></P>

      <NNDiagram />

      <H2>{c.neuronHeading}</H2>
      <P><Rich html={c.neuronText} /></P>
      <CodeBlock>{c.neuronCode}</CodeBlock>

      <H2>{c.activationsHeading}</H2>
      <div className="space-y-3">
        {c.activations.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <code className="text-violet-300 text-xs font-mono">{item.formula}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-600 text-xs">{c.usedInLabel} {item.use}</p>
          </div>
        ))}
      </div>

      <H2>{c.layersHeading}</H2>
      <div className="space-y-3">
        {c.layers.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-1 text-sm">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <H2>{c.depthHeading}</H2>
      <P><Rich html={c.depthText} /></P>
    </div>
  )
}

function TransformerSection({ c }: { c: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />

      <P><Rich html={c.intro} /></P>

      <InfoBox type="info" title={c.infoBoxTitle}>
        {c.infoBoxText}
      </InfoBox>

      <H2>{c.attentionHeading}</H2>
      <P><Rich html={c.attentionText} /></P>
      <CodeBlock>{c.attentionCode}</CodeBlock>

      <H2>{c.multiHeadHeading}</H2>
      <P><Rich html={c.multiHeadText} /></P>

      <H2>{c.blockHeading}</H2>
      <div className="glass border border-white/10 rounded-xl p-5">
        <div className="space-y-2 text-sm">
          {c.blockRows.map((row: any, i: number) => {
            const colors = ['text-violet-300', 'text-blue-300', 'text-gray-400', 'text-cyan-300', 'text-gray-400', 'text-green-300']
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                <span className={`${colors[i]} font-mono text-xs flex-1`}>{row.name}</span>
                <span className="text-gray-600 text-xs">{row.desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      <H2>{c.modelsHeading}</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {c.models.map((m: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{m.name}</h3>
              <Tag color="purple">{m.type}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-2">{m.use}</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>📊 {m.params}</span>
              <span>📏 {m.context} {c.contextLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.vramHeading}</H2>
      <div className="glass border border-white/10 rounded-xl p-5">
        <p className="text-sm text-gray-400 mb-4">{c.vramIntro}</p>
        <div className="space-y-2">
          {c.vramRows.map((row: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-white/5">
              <span className="text-gray-300">{row.model}</span>
              <span className="text-red-400">{row.ft}</span>
              <span className="text-yellow-400">{row.lora}</span>
              <span className="text-green-400">{row.qlora}</span>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 pt-2">
            <span>{c.vramHeaders.model}</span>
            <span className="text-red-600">{c.vramHeaders.ft}</span>
            <span className="text-yellow-600">{c.vramHeaders.lora}</span>
            <span className="text-green-600">{c.vramHeaders.qlora}</span>
          </div>
        </div>
      </div>

      <InfoBox type="success" title={c.vramConclusionTitle}>
        <Rich as="div" html={c.vramConclusionText} />
      </InfoBox>
    </div>
  )
}

function WieKILerntSection({ c }: { c: any }) {
  const stepColors = ['border-violet-400/30 bg-violet-500/5', 'border-blue-400/30 bg-blue-500/5', 'border-cyan-400/30 bg-cyan-500/5', 'border-green-400/30 bg-green-500/5', 'border-yellow-400/30 bg-yellow-500/5', 'border-pink-400/30 bg-pink-500/5']
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Zap className="w-9 h-9" />} title={c.title} subtitle={c.subtitle} />

      <P><Rich html={c.intro} /></P>

      <H2>{c.cycleHeading}</H2>
      <div className="space-y-3">
        {c.cycleSteps.map((item: any, i: number) => (
          <div key={i} className={`glass border rounded-xl p-5 ${stepColors[i]}`}>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GradientDescentDiagram />

      <H2>{c.lrHeading}</H2>
      <P><Rich html={c.lrText} /></P>
      <CodeBlock>{c.lrCode}</CodeBlock>

      <H2>{c.sgdHeading}</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {c.sgdTypes.map((item: any, i: number) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">{item.name}</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p>{c.sgdLabels.batch} {item.batch}</p>
              <p>{c.sgdLabels.speed} {item.speed}</p>
              <p>{c.sgdLabels.quality} {item.quality}</p>
              <p>{c.sgdLabels.memory} {item.memory}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>{c.minimaHeading}</H2>
      <P><Rich html={c.minimaText} /></P>

      <InfoBox type="success" title={c.minimaConclusionTitle}>
        {c.minimaConclusionText}
      </InfoBox>

      <H2>{c.gradientsHeading}</H2>
      <P><Rich html={c.gradientsText} /></P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-green-400/20 rounded-xl p-4">
          <h3 className="text-green-400 font-semibold mb-2">{c.vanishingTitle}</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            {c.vanishingItems.map((it: string, i: number) => <li key={i}>✓ {it}</li>)}
          </ul>
        </div>
        <div className="glass border border-red-400/20 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-2">{c.explodingTitle}</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            {c.explodingItems.map((it: string, i: number) => <li key={i}>✓ {it}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MLGrundlagenPage() {
  const t = useTranslations('AICoach')
  const tDocs = useTranslations('Docs')
  const content = t.raw('chapters.mlGrundlagen.content') as any
  const [activeSection, setActiveSection] = useState(CHAPTER.itemIds[0])

  const sectionContent = {
    'was-ist-ml': <WasIstMLSection c={content.wasIstMl} />,
    'neuronale-netze': <NeuronaleNetzeSection c={content.neuronaleNetze} />,
    'transformer': <TransformerSection c={content.transformer} />,
    'wie-ki-lernt': <WieKILerntSection c={content.wieKiLernt} />,
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />
      <main className="flex-1 py-10 px-4">
        {/* Breadcrumb */}
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
          <SubPageLayout
            currentChapterId={CHAPTER_ID}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sections={sectionContent}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
