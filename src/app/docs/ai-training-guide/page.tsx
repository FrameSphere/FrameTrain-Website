'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Brain, Zap, BookOpen, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, AlertCircle, Settings, Layers, Database, Target,
  ChevronRight, BarChart3, Cpu, Gauge, Activity, Sliders,
  GitBranch, Lightbulb, Shield, Sparkles, FlaskConical,
  ArrowRight, Info, AlertTriangle as TriangleAlert, CheckCircle2 as CircleCheck, Flame,
  LineChart, Microscope, Lock, Wand2
} from 'lucide-react'

// ─── Navigation ─────────────────────────────────────────────────────────────

const navigation = [
  {
    title: '🧠 ML Grundlagen',
    id: 'basics',
    items: [
      { id: 'was-ist-ml', title: 'Was ist Machine Learning?' },
      { id: 'neuronale-netze', title: 'Neuronale Netzwerke' },
      { id: 'transformer', title: 'Transformer & LLMs' },
      { id: 'wie-ki-lernt', title: 'Wie KI "lernt"' },
    ]
  },
  {
    title: '📊 Training verstehen',
    id: 'training',
    items: [
      { id: 'training-loop', title: 'Der Trainings-Loop' },
      { id: 'loss-funktionen', title: 'Loss-Funktionen' },
      { id: 'metriken', title: 'Metriken & Auswertung' },
      { id: 'train-val-test', title: 'Train / Val / Test Split' },
    ]
  },
  {
    title: '📈 Trainingsverlauf lesen',
    id: 'curves',
    items: [
      { id: 'loss-kurven', title: 'Loss-Kurven interpretieren' },
      { id: 'gutes-training', title: 'Gutes Training erkennen' },
      { id: 'overfitting', title: 'Overfitting erkennen' },
      { id: 'underfitting', title: 'Underfitting erkennen' },
      { id: 'instabiles-training', title: 'Instabiles Training' },
    ]
  },
  {
    title: '🩺 Diagnose & Fixes',
    id: 'diagnosis',
    items: [
      { id: 'overfitting-fix', title: 'Overfitting bekämpfen' },
      { id: 'underfitting-fix', title: 'Underfitting beheben' },
      { id: 'lr-probleme', title: 'Learning Rate Probleme' },
      { id: 'loss-spike', title: 'Loss Spikes & Crashes' },
    ]
  },
  {
    title: '⚙️ Hyperparameter-Coaching',
    id: 'hyperparams',
    items: [
      { id: 'learning-rate-deep', title: 'Learning Rate (vertieft)' },
      { id: 'lr-scheduler', title: 'LR Scheduler Strategien' },
      { id: 'batch-size-deep', title: 'Batch Size & Grad. Acc.' },
      { id: 'optimizer-vergleich', title: 'Optimizer Vergleich' },
      { id: 'regularisierung', title: 'Regularisierung' },
    ]
  },
  {
    title: '🔧 Fine-Tuning Methoden',
    id: 'finetuning',
    items: [
      { id: 'full-finetuning', title: 'Full Fine-Tuning' },
      { id: 'lora-deep', title: 'LoRA im Detail' },
      { id: 'qlora', title: 'QLoRA (4-bit)' },
      { id: 'peft-methoden', title: 'PEFT Übersicht' },
      { id: 'wann-was', title: 'Wann welche Methode?' },
    ]
  },
  {
    title: '📦 Dataset-Mastery',
    id: 'datasets',
    items: [
      { id: 'daten-qualitaet', title: 'Datenqualität & -menge' },
      { id: 'preprocessing', title: 'Preprocessing' },
      { id: 'augmentation', title: 'Data Augmentation' },
      { id: 'balancing', title: 'Klassen-Balancing' },
    ]
  },
  {
    title: '🚀 Fortgeschrittene Techniken',
    id: 'advanced',
    items: [
      { id: 'mixed-precision', title: 'Mixed Precision Training' },
      { id: 'gradient-checkpointing', title: 'Gradient Checkpointing' },
      { id: 'early-stopping', title: 'Early Stopping' },
      { id: 'ensembles', title: 'Model Ensembles' },
    ]
  },
]

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AITrainingGuidePage() {
  const [activeSection, setActiveSection] = useState('was-ist-ml')

  const renderSection = () => {
    switch (activeSection) {
      case 'was-ist-ml': return <WasIstMLSection />
      case 'neuronale-netze': return <NeuronaleNetzeSection />
      case 'transformer': return <TransformerSection />
      case 'wie-ki-lernt': return <WieKILerntSection />
      case 'training-loop': return <TrainingLoopSection />
      case 'loss-funktionen': return <LossFunktionenSection />
      case 'metriken': return <MetrikenSection />
      case 'train-val-test': return <TrainValTestSection />
      case 'loss-kurven': return <LossKurvenSection />
      case 'gutes-training': return <GutesTrainingSection />
      case 'overfitting': return <OverfittingSection />
      case 'underfitting': return <UnderfittingSection />
      case 'instabiles-training': return <InstabilesTrainingSection />
      case 'overfitting-fix': return <OverfittingFixSection />
      case 'underfitting-fix': return <UnderfittingFixSection />
      case 'lr-probleme': return <LRProblemeSection />
      case 'loss-spike': return <LossSpikeSection />
      case 'learning-rate-deep': return <LearningRateDeepSection />
      case 'lr-scheduler': return <LRSchedulerSection />
      case 'batch-size-deep': return <BatchSizeDeepSection />
      case 'optimizer-vergleich': return <OptimizerVergleichSection />
      case 'regularisierung': return <RegularisierungSection />
      case 'full-finetuning': return <FullFineTuningSection />
      case 'lora-deep': return <LoRADeepSection />
      case 'qlora': return <QLoRASection />
      case 'peft-methoden': return <PEFTMethodenSection />
      case 'wann-was': return <WannWasSection />
      case 'daten-qualitaet': return <DatenQualitaetSection />
      case 'preprocessing': return <PreprocessingSection />
      case 'augmentation': return <AugmentationSection />
      case 'balancing': return <BalancingSection />
      case 'mixed-precision': return <MixedPrecisionSection />
      case 'gradient-checkpointing': return <GradientCheckpointingSection />
      case 'early-stopping': return <EarlyStoppingSection />
      case 'ensembles': return <EnsemblesSection />
      default: return <WasIstMLSection />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl mb-6 shadow-lg shadow-violet-500/40">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6 text-violet-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Ultimate AI Training Coach
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Der ultimative{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                KI-Training Coach
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Von den absoluten Grundlagen bis zu fortgeschrittenen Fine-Tuning-Techniken – 
              alles was du wissen musst, um KI-Modelle erfolgreich zu trainieren, zu verstehen und zu optimieren.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm text-gray-400">
              {['ML Grundlagen', 'Loss-Kurven lesen', 'Overfitting bekämpfen', 'LoRA & QLoRA', 'Hyperparameter-Tuning', 'Datasets'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="glass-strong rounded-2xl p-6 border border-white/10 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span className="text-white font-semibold text-sm">Training Coach</span>
                  </div>
                  <nav className="space-y-1">
                    {navigation.map((section) => (
                      <div key={section.id} className="mb-5">
                        <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider px-3 mb-2">
                          {section.title}
                        </p>
                        <div className="space-y-0.5">
                          {section.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveSection(item.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                activeSection === item.id
                                  ? 'bg-violet-500/20 text-violet-300 font-medium border border-violet-400/30'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Content */}
              <div className="flex-1 max-w-4xl">
                <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10">
                  {renderSection()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════════════════════

function InfoBox({ type, title, children }: { type: 'success' | 'warning' | 'info' | 'error'; title: string; children: React.ReactNode }) {
  const cfg = {
    success: { border: 'border-green-400/25', bg: 'bg-green-400/5', icon: <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-green-400' },
    warning: { border: 'border-yellow-400/25', bg: 'bg-yellow-400/5', icon: <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-yellow-400' },
    info:    { border: 'border-blue-400/25',   bg: 'bg-blue-400/5',   icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />,           titleColor: 'text-blue-400' },
    error:   { border: 'border-red-400/25',    bg: 'bg-red-400/5',    icon: <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />,   titleColor: 'text-red-400' },
  }[type]
  return (
    <div className={`rounded-xl p-5 border ${cfg.border} ${cfg.bg}`}>
      <div className="flex gap-3">
        {cfg.icon}
        <div>
          <p className={`font-semibold mb-1 ${cfg.titleColor}`}>{title}</p>
          <div className="text-gray-400 text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <span className="text-violet-400">{icon}</span>
        {title}
      </h1>
      {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
    </div>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-white mt-10 mb-5">{children}</h2>
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-white mt-6 mb-3">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 leading-relaxed mb-4">{children}</p>
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-violet-300 font-semibold">{children}</span>
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="bg-gray-900/80 border border-white/10 rounded-xl p-5 mb-4 overflow-x-auto">
      <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{children}</pre>
    </div>
  )
}

function Tag({ children, color = 'purple' }: { children: React.ReactNode; color?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' }) {
  const colors: Record<string, string> = {
    purple: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
    green:  'bg-green-500/20 text-green-300 border-green-400/30',
    red:    'bg-red-500/20 text-red-300 border-red-400/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    blue:   'bg-blue-500/20 text-blue-300 border-blue-400/30',
  }
  return <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded border ${colors[color]}`}>{children}</span>
}

// ─── SVG DIAGRAMS ─────────────────────────────────────────────────────────────

/** Gutes Training: Beide Kurven sinken, kleiner Gap */
function GoodTrainingChart() {
  return (
    <div className="glass border border-white/10 rounded-xl p-4 mb-4">
      <p className="text-sm text-gray-400 mb-3 font-semibold text-center">✅ Gutes Training – Ideal-Verlauf</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Grid */}
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        {/* Axes */}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        {/* Axis labels */}
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        {/* Y-axis ticks */}
        {['1.0','0.6','0.3','0.1'].map((val, i) => (
          <text key={i} x="45" y={40 + i*53} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end">{val}</text>
        ))}
        {/* Training loss path */}
        <path d="M50,35 C80,35 100,50 130,75 C165,100 200,125 240,145 C290,162 340,170 400,173 C430,174 460,175 480,175"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Training fill */}
        <path d="M50,35 C80,35 100,50 130,75 C165,100 200,125 240,145 C290,162 340,170 400,173 C430,174 460,175 480,175 L480,200 L50,200 Z"
          fill="url(#trainGrad)"/>
        {/* Validation loss path (slightly higher) */}
        <path d="M50,45 C80,48 110,65 145,88 C180,112 215,135 255,152 C300,167 345,174 400,178 C430,179 460,180 480,180"
          fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,3" strokeLinecap="round"/>
        {/* Legend */}
        <rect x="55" y="20" width="12" height="3" fill="#8b5cf6" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
        <rect x="160" y="20" width="12" height="3" fill="#06b6d4" rx="1"/>
        <text x="177" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Validation Loss</text>
        {/* Annotation */}
        <text x="380" y="165" fill="rgba(134,239,172,0.9)" fontSize="9">← kleiner Gap ✓</text>
      </svg>
    </div>
  )
}

/** Overfitting: Training sinkt, Val steigt */
function OverfittingChart() {
  return (
    <div className="glass border border-red-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-red-400 mb-3 font-semibold text-center">⚠️ Overfitting – Training sinkt, Validation steigt</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Grid */}
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        {/* Training loss (sinks) */}
        <path d="M50,40 C90,45 130,65 175,90 C215,110 260,130 310,148 C360,162 410,170 480,175"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Validation loss (sinks then rises) */}
        <path d="M50,50 C90,55 130,72 175,90 C210,103 240,108 265,110 C290,112 310,118 340,128 C370,140 410,155 480,175"
          fill="none" stroke="#f87171" strokeWidth="2.5" strokeDasharray="6,3" strokeLinecap="round"/>
        {/* Divergence marker */}
        <line x1="265" y1="30" x2="265" y2="195" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x="240" y="28" fill="rgba(251,191,36,0.8)" fontSize="9">Overfitting</text>
        <text x="236" y="37" fill="rgba(251,191,36,0.8)" fontSize="9">beginnt hier</text>
        {/* Legend */}
        <rect x="55" y="20" width="12" height="3" fill="#8b5cf6" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
        <rect x="160" y="20" width="12" height="3" fill="#f87171" rx="1"/>
        <text x="177" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Validation Loss ↑</text>
      </svg>
    </div>
  )
}

/** Underfitting: Beide hoch und sinken kaum */
function UnderfittingChart() {
  return (
    <div className="glass border border-orange-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-orange-400 mb-3 font-semibold text-center">⚠️ Underfitting – Beide Verluste bleiben hoch</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        {/* Training loss bleibt hoch */}
        <path d="M50,45 C90,48 140,52 200,57 C260,63 330,67 400,70 C440,71 460,72 480,72"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Validation loss auch hoch */}
        <path d="M50,55 C90,59 140,63 200,68 C260,74 330,78 400,82 C440,83 460,84 480,84"
          fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,3" strokeLinecap="round"/>
        {/* Annotation */}
        <text x="290" y="60" fill="rgba(251,146,60,0.9)" fontSize="9">beide Kurven</text>
        <text x="290" y="72" fill="rgba(251,146,60,0.9)" fontSize="9">stagnieren hoch</text>
        <rect x="55" y="20" width="12" height="3" fill="#8b5cf6" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
        <rect x="160" y="20" width="12" height="3" fill="#06b6d4" rx="1"/>
        <text x="177" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Validation Loss</text>
      </svg>
    </div>
  )
}

/** LR zu hoch: Oszillierender Loss */
function HighLRChart() {
  return (
    <div className="glass border border-yellow-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-yellow-400 mb-3 font-semibold text-center">⚠️ Learning Rate zu hoch – Oszillierender Loss</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        {/* Oscillating path */}
        <path d="M50,60 L100,140 L150,50 L200,130 L250,60 L300,145 L350,55 L400,130 L450,75 L480,120"
          fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="200" y="35" fill="rgba(251,191,36,0.9)" fontSize="10">starke Schwankungen = LR zu groß</text>
        <rect x="55" y="20" width="12" height="3" fill="#fbbf24" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
      </svg>
    </div>
  )
}

/** LR zu niedrig: sehr langsamer Abfall */
function LowLRChart() {
  return (
    <div className="glass border border-blue-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-blue-400 mb-3 font-semibold text-center">⚠️ Learning Rate zu niedrig – zu langsamer Fortschritt</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        {/* Very slow descent */}
        <path d="M50,45 C100,46 170,48 240,52 C310,56 380,60 480,65"
          fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="200" y="35" fill="rgba(96,165,250,0.9)" fontSize="10">kaum Fortschritt – LR zu klein</text>
        <rect x="55" y="20" width="12" height="3" fill="#60a5fa" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
      </svg>
    </div>
  )
}

/** LR Warm-up + Cosine Decay */
function LRSchedulerChart() {
  return (
    <div className="glass border border-violet-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-violet-400 mb-3 font-semibold text-center">📈 Warmup + Cosine Decay Scheduler</p>
      <svg viewBox="0 0 500 180" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[30,65,100,135,165].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="165" x2="480" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="178" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Trainingsschritte →</text>
        <text x="18" y="90" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,90)">LR ↑</text>
        {/* Warmup (linear up) then cosine decay */}
        <path d="M50,160 L110,30 C180,30 200,32 240,50 C280,70 320,95 360,120 C400,143 440,155 480,160"
          fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Warmup region */}
        <rect x="50" y="20" width="60" height="140" fill="rgba(167,139,250,0.08)" rx="2"/>
        <text x="80" y="17" fill="rgba(167,139,250,0.7)" fontSize="9" textAnchor="middle">Warmup</text>
        {/* Decay region */}
        <text x="300" y="17" fill="rgba(167,139,250,0.7)" fontSize="9" textAnchor="middle">Cosine Decay</text>
        <rect x="55" y="7" width="12" height="3" fill="#a78bfa" rx="1"/>
        <text x="72" y="11" fill="rgba(255,255,255,0.7)" fontSize="10">Learning Rate</text>
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// SECTION COMPONENTS – WELLE 1: ML GRUNDLAGEN
// ════════════════════════════════════════════════════════════════

function WasIstMLSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title="Was ist Machine Learning?" subtitle="Die Grundlage von allem – verstehe, bevor du trainierst" />

      <P>
        <Highlight>Machine Learning (ML)</Highlight> ist ein Teilgebiet der künstlichen Intelligenz. Statt einem Computer exakte Regeln zu geben, 
        zeigst du ihm <Highlight>Beispieldaten</Highlight> – und er lernt selbst die Muster darin. Das Ergebnis nennt sich <Highlight>Modell</Highlight>.
      </P>

      <InfoBox type="info" title="Einfache Analogie">
        Stell dir vor, du zeigst einem Kind 1.000 Fotos von Katzen und 1.000 Fotos von Hunden – 
        immer mit dem richtigen Label. Nach einer Weile kann das Kind neue Tiere korrekt zuordnen. 
        Genau das macht ein ML-Modell, nur mit Zahlen statt Bildern.
      </InfoBox>

      <H2>Die drei Arten von Machine Learning</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: 'Supervised Learning',
            emoji: '🎯',
            desc: 'Du gibst dem Modell Daten MIT korrekten Antworten (Labels). Es lernt die Zuordnung.',
            example: 'E-Mail → "Spam" oder "Kein Spam"',
            color: 'border-violet-400/30 bg-violet-500/5',
          },
          {
            title: 'Unsupervised Learning',
            emoji: '🔍',
            desc: 'Das Modell bekommt nur Daten, OHNE Labels. Es sucht selbst nach Mustern und Gruppen.',
            example: 'Kunden nach Kaufverhalten gruppieren',
            color: 'border-blue-400/30 bg-blue-500/5',
          },
          {
            title: 'Reinforcement Learning',
            emoji: '🎮',
            desc: 'Das Modell lernt durch Belohnung und Bestrafung. Es probiert Aktionen aus und optimiert seinen Score.',
            example: 'Schach spielen, ChatGPT RLHF',
            color: 'border-green-400/30 bg-green-500/5',
          }
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="text-3xl mb-3">{item.emoji}</div>
            <h3 className="text-white font-bold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <p className="text-xs text-gray-500">Beispiel: {item.example}</p>
          </div>
        ))}
      </div>

      <H2>Wichtige Begriffe im Überblick</H2>
      <div className="space-y-3">
        {[
          { term: 'Modell', def: 'Die "Intelligenz" – eine mathematische Funktion mit Millionen von Parametern, die gelernt wurden.' },
          { term: 'Parameter / Gewichte', def: 'Die internen Zahlen im Modell, die während des Trainings angepasst werden.' },
          { term: 'Training', def: 'Der Prozess, bei dem das Modell seine Parameter durch Beispieldaten optimiert.' },
          { term: 'Inferenz', def: 'Das Anwenden des trainierten Modells auf neue, ungesehene Daten.' },
          { term: 'Dataset', def: 'Die Sammlung von Beispieldaten (Trainings- und Testdaten), mit denen das Modell lernt.' },
          { term: 'Epoch', def: 'Ein vollständiger Durchlauf durch alle Trainingsdaten.' },
          { term: 'Batch', def: 'Eine kleine Teilmenge der Trainingsdaten, die gleichzeitig verarbeitet wird.' },
          { term: 'Loss (Verlust)', def: 'Ein Zahlenwert, der beschreibt wie "falsch" das Modell gerade liegt. Ziel: so niedrig wie möglich.' },
          { term: 'Gradient', def: 'Die mathematische Richtung, in die die Parameter angepasst werden müssen, um den Loss zu reduzieren.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4 flex gap-4">
            <Tag>{item.term}</Tag>
            <p className="text-gray-400 text-sm">{item.def}</p>
          </div>
        ))}
      </div>

      <H2>Warum Fine-Tuning statt Training von Grund auf?</H2>
      <P>
        Ein LLM wie GPT oder LLaMA von Grund auf zu trainieren kostet <Highlight>Millionen von Euro</Highlight> und erfordert tausende GPUs über Wochen. 
        Mit <Highlight>Fine-Tuning</Highlight> nimmst du ein bereits vortrainiertes Modell und spezialisierst es auf deine Aufgabe – 
        in Stunden statt Wochen, mit deinem eigenen Computer.
      </P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-gray-500/20 rounded-xl p-5">
          <h3 className="text-gray-400 font-bold mb-3">Training von Grund auf</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li>⏱ Wochen bis Monate</li>
            <li>💰 Hunderttausende bis Millionen Euro</li>
            <li>📦 Milliarden Trainingsdaten nötig</li>
            <li>🖥 Hunderte bis tausende GPUs</li>
          </ul>
        </div>
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">Fine-Tuning (FrameTrain)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>⏱ Minuten bis Stunden</li>
            <li>💰 Praktisch kostenlos</li>
            <li>📦 Hundert bis tausend Beispiele reichen</li>
            <li>🖥 1 GPU – dein eigener Computer</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function NeuronaleNetzeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title="Neuronale Netzwerke" subtitle="Die Bauweise moderner KI-Modelle" />

      <P>
        Ein <Highlight>künstliches neuronales Netz (ANN)</Highlight> ist inspiriert vom menschlichen Gehirn. 
        Es besteht aus <Highlight>Schichten von Neuronen</Highlight>, die miteinander verbunden sind. 
        Jede Verbindung hat ein <Highlight>Gewicht</Highlight> – das sind die Parameter, die beim Training gelernt werden.
      </P>

      {/* Simplified NN diagram */}
      <div className="glass border border-white/10 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-3 font-semibold text-center">🧠 Vereinfachtes Neuronales Netz (3 Schichten)</p>
        <svg viewBox="0 0 500 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Input layer */}
          {[50,80,110,140,170].map((y,i) => (
            <circle key={i} cx="80" cy={y} r="14" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5"/>
          ))}
          {/* Hidden layer 1 */}
          {[60,90,120,150].map((y,i) => (
            <circle key={i} cx="210" cy={y} r="14" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
          ))}
          {/* Hidden layer 2 */}
          {[60,90,120,150].map((y,i) => (
            <circle key={i} cx="340" cy={y} r="14" fill="rgba(196,181,253,0.2)" stroke="#c4b5fd" strokeWidth="1.5"/>
          ))}
          {/* Output layer */}
          {[80,110,140].map((y,i) => (
            <circle key={i} cx="450" cy={y} r="14" fill="rgba(244,114,182,0.2)" stroke="#f472b6" strokeWidth="1.5"/>
          ))}
          {/* Connections (simplified) */}
          {[50,110,170].map((y1,i) => [60,120].map((y2,j) => (
            <line key={`${i}${j}`} x1="94" y1={y1} x2="196" y2={y2} stroke="rgba(139,92,246,0.15)" strokeWidth="1"/>
          )))}
          {[60,120].map((y1,i) => [60,120].map((y2,j) => (
            <line key={`h${i}${j}`} x1="224" y1={y1} x2="326" y2={y2} stroke="rgba(167,139,250,0.15)" strokeWidth="1"/>
          )))}
          {[60,120].map((y1,i) => [80,110,140].map((y2,j) => (
            <line key={`o${i}${j}`} x1="354" y1={y1} x2="436" y2={y2} stroke="rgba(196,181,253,0.15)" strokeWidth="1"/>
          )))}
          {/* Labels */}
          <text x="80" y="196" fill="rgba(139,92,246,0.7)" fontSize="10" textAnchor="middle">Input</text>
          <text x="210" y="175" fill="rgba(167,139,250,0.7)" fontSize="10" textAnchor="middle">Hidden 1</text>
          <text x="340" y="175" fill="rgba(196,181,253,0.7)" fontSize="10" textAnchor="middle">Hidden 2</text>
          <text x="450" y="165" fill="rgba(244,114,182,0.7)" fontSize="10" textAnchor="middle">Output</text>
          {/* Arrows */}
          <text x="155" y="108" fill="rgba(255,255,255,0.2)" fontSize="18" textAnchor="middle">→</text>
          <text x="285" y="108" fill="rgba(255,255,255,0.2)" fontSize="18" textAnchor="middle">→</text>
          <text x="400" y="108" fill="rgba(255,255,255,0.2)" fontSize="18" textAnchor="middle">→</text>
        </svg>
      </div>

      <H2>Wie ein Neuron funktioniert</H2>
      <P>
        Jedes Neuron empfängt Eingaben, multipliziert sie mit den <Highlight>Gewichten</Highlight>, summiert alles und 
        wendet eine <Highlight>Aktivierungsfunktion</Highlight> an. Das Ergebnis wird an die nächste Schicht weitergegeben.
      </P>
      <CodeBlock>{`Neuron-Berechnung:
  output = Aktivierung(w₁·x₁ + w₂·x₂ + ... + b)

  w = Gewichte (werden gelernt)
  x = Eingaben
  b = Bias (Verschiebung)
  Aktivierung = z.B. ReLU, Sigmoid, Tanh`}</CodeBlock>

      <H2>Wichtige Schichttypen</H2>
      <div className="space-y-3">
        {[
          { name: 'Dense / Fully Connected', desc: 'Jedes Neuron ist mit jedem Neuron der vorherigen Schicht verbunden. Universell einsetzbar.' },
          { name: 'Embedding Layer', desc: 'Wandelt Wörter/Token in Zahlenvektoren um. Fundamental für Sprachmodelle.' },
          { name: 'Attention Layer', desc: 'Das Herzstück von Transformern. Erlaubt dem Modell, Beziehungen über lange Texte hinweg zu lernen.' },
          { name: 'Normalization Layer', desc: 'Stabilisiert das Training, indem Aktivierungen normalisiert werden. Wichtig für tiefe Netze.' },
          { name: 'Dropout Layer', desc: 'Schaltet während des Trainings zufällig Neuronen aus – verhindert Overfitting.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-1">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransformerSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles className="w-9 h-9" />} title="Transformer & LLMs" subtitle="Die Architektur hinter GPT, LLaMA, BERT & Co." />

      <P>
        Seit dem Paper <Highlight>"Attention Is All You Need" (2017)</Highlight> dominiert die 
        <Highlight> Transformer-Architektur</Highlight> die gesamte KI-Welt. Alle modernen großen Sprachmodelle (LLMs) wie 
        GPT-4, LLaMA, Mistral oder BERT basieren darauf.
      </P>

      <H2>Die Kernidee: Self-Attention</H2>
      <P>
        Der Trick von Transformern ist der sogenannte <Highlight>Self-Attention Mechanismus</Highlight>. 
        Er erlaubt dem Modell, bei der Verarbeitung eines Wortes <em>gleichzeitig</em> alle anderen Wörter im Satz zu berücksichtigen – 
        egal wie weit sie entfernt sind. 
      </P>

      <InfoBox type="info" title="Beispiel: Self-Attention in Aktion">
        Satz: "Der Bank gab er das Geld, weil sie pleite war."<br/>
        Das Wort "sie" bezieht sich auf "Bank" – nicht auf "er" oder "Geld". 
        Self-Attention lernt automatisch, solche Referenzen zu verstehen, auch über lange Texte hinweg.
      </InfoBox>

      <H2>LLMs – Large Language Models</H2>
      <P>
        Ein <Highlight>LLM</Highlight> ist ein Transformer-Modell, das auf gewaltigen Textmengen 
        (Bücher, Internet, Code) vortrainiert wurde. Es lernt dabei: Grammatik, Fakten, Logik, Schreibstile. 
        Das Ergebnis ist ein Modell, das Text extrem gut <Highlight>vorhersagen</Highlight> kann – 
        und damit auch generieren, zusammenfassen, übersetzen, etc.
      </P>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: 'BERT / RoBERTa', type: 'Encoder', use: 'Klassifikation, NER, QA', params: '110M–355M' },
          { name: 'GPT-2 / GPT-J', type: 'Decoder', use: 'Text-Generierung', params: '124M–6B' },
          { name: 'LLaMA 2/3', type: 'Decoder', use: 'Chat, Instruction Following', params: '7B–70B' },
          { name: 'Mistral 7B', type: 'Decoder', use: 'Effizient, schnell, stark', params: '7B' },
          { name: 'T5 / Flan-T5', type: 'Encoder-Decoder', use: 'Übersetzung, Zusammenfassung', params: '60M–11B' },
          { name: 'Phi-3 / Gemma', type: 'Decoder', use: 'Kleine, effiziente Modelle', params: '2B–7B' },
        ].map((m, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{m.name}</h3>
              <Tag color="purple">{m.type}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-1">{m.use}</p>
            <p className="text-gray-500 text-xs">{m.params} Parameter</p>
          </div>
        ))}
      </div>

      <H2>Was bedeuten "Parameter"?</H2>
      <P>
        Parameter sind die <Highlight>Gewichte</Highlight> des Netzwerks – also die Zahlen, die beim Training gelernt werden. 
        Ein Modell mit 7 Milliarden Parametern (7B) hat 7.000.000.000 einzelne Zahlen. Jede dieser Zahlen belegt 
        normalerweise 4 Bytes (float32) → 28 GB allein für die Gewichte.
      </P>
      <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5">
        <p className="text-sm text-gray-400 mb-3">VRAM-Bedarf für volle float32 Modelle:</p>
        <div className="space-y-2">
          {[
            { model: '125M', vram: '~0.5 GB', note: 'BERT-Größe' },
            { model: '1B', vram: '~4 GB', note: 'Phi-1.5 Größe' },
            { model: '7B', vram: '~28 GB', note: 'LLaMA-7B, Mistral-7B' },
            { model: '13B', vram: '~52 GB', note: 'LLaMA-13B' },
            { model: '70B', vram: '~280 GB', note: 'LLaMA-70B' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-violet-300 font-mono">{row.model} Parameter</span>
              <span className="text-yellow-400 font-semibold">{row.vram}</span>
              <span className="text-gray-500">{row.note}</span>
            </div>
          ))}
        </div>
        <InfoBox type="warning" title="Deshalb ist LoRA so wichtig!">
          Mit LoRA kannst du ein 7B-Modell auf einer 8GB GPU trainieren. Ohne LoRA bräuchtest du 28+ GB VRAM.
        </InfoBox>
      </div>
    </div>
  )
}

function WieKILerntSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Zap className="w-9 h-9" />} title="Wie KI &quot;lernt&quot;" subtitle="Backpropagation und Gradient Descent verständlich erklärt" />

      <P>
        Das Herzstück des Trainings sind zwei Algorithmen: <Highlight>Backpropagation</Highlight> und 
        <Highlight> Gradient Descent</Highlight>. Zusammen sorgen sie dafür, dass das Modell seinen Fehler schrittweise minimiert.
      </P>

      <H2>Der Lernzyklus Schritt für Schritt</H2>
      <div className="space-y-3">
        {[
          { step: '1', title: 'Forward Pass', color: 'border-violet-400/30', desc: 'Eingabe-Daten werden durch das Netzwerk geleitet. Jede Schicht verarbeitet die Daten und gibt ein Ergebnis (Prediction) aus.' },
          { step: '2', title: 'Loss berechnen', color: 'border-blue-400/30', desc: 'Die Prediction wird mit dem richtigen Ergebnis (Label) verglichen. Der Unterschied = Loss (Fehler). Je größer der Loss, desto schlechter die Prediction.' },
          { step: '3', title: 'Backward Pass (Backprop)', color: 'border-cyan-400/30', desc: 'Der Fehler wird rückwärts durch das Netz geleitet. Für jeden Parameter wird berechnet: Wie stark hat er zum Fehler beigetragen? Das Ergebnis = Gradient.' },
          { step: '4', title: 'Gewichte aktualisieren', color: 'border-green-400/30', desc: 'Die Parameter werden in die Richtung bewegt, die den Loss reduziert. Die Schrittgröße = Learning Rate. W_neu = W_alt - LR × Gradient' },
          { step: '5', title: 'Wiederholen', color: 'border-pink-400/30', desc: 'Dieser Zyklus wiederholt sich für jeden Batch, jede Epoche – tausende bis Millionen Mal, bis das Modell gut genug performt.' },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
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

      <H2>Gradient Descent visualisiert</H2>
      <div className="glass border border-white/10 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-3 font-semibold text-center">🏔 Gradient Descent: Den Loss-Berg hinuntersteigen</p>
        <svg viewBox="0 0 500 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Background gradient for "loss landscape" */}
          <defs>
            <linearGradient id="lossLandscape" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139,92,246,0.1)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
            </linearGradient>
          </defs>
          {/* Loss landscape curve */}
          <path d="M30,40 C80,38 100,60 140,90 C170,112 185,175 250,185 C315,175 330,112 360,90 C400,60 420,38 470,40"
            fill="url(#lossLandscape)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"/>
          {/* Gradient descent path */}
          <circle cx="100" cy="62" r="6" fill="#f472b6"/>
          <circle cx="140" cy="90" r="6" fill="#f472b6"/>
          <circle cx="180" cy="135" r="6" fill="#f472b6"/>
          <circle cx="220" cy="168" r="6" fill="#f472b6"/>
          <circle cx="250" cy="182" r="8" fill="#4ade80" stroke="rgba(74,222,128,0.4)" strokeWidth="3"/>
          {/* Arrows */}
          <path d="M103,65 L137,87" stroke="#f472b6" strokeWidth="1.5" markerEnd="url(#arrowPink)"/>
          <path d="M143,93 L177,132" stroke="#f472b6" strokeWidth="1.5"/>
          <path d="M183,138 L217,165" stroke="#f472b6" strokeWidth="1.5"/>
          {/* Labels */}
          <text x="85" y="55" fill="rgba(244,114,182,0.9)" fontSize="9">Start (hoher Loss)</text>
          <text x="240" y="197" fill="rgba(74,222,128,0.9)" fontSize="9" textAnchor="middle">Minimum (niedriger Loss) ✓</text>
          <text x="155" y="145" fill="rgba(244,114,182,0.7)" fontSize="8">← Schritte = LR × Gradient</text>
        </svg>
      </div>

      <InfoBox type="success" title="Die Kernaussage">
        Jeder Trainingsschritt bewegt die Modellparameter ein kleines Stück in Richtung niedrigerer Loss. 
        Nach tausenden Schritten landet das Modell in einem "Tal" – dem Minimum. Dort macht es die besten Vorhersagen.
      </InfoBox>

      <H2>Lokale vs. Globale Minima</H2>
      <P>
        In der Praxis gibt es viele "Täler" (lokale Minima). Große Modelle mit Millionen Parametern haben so komplexe 
        Loss-Landschaften, dass <Highlight>lokale Minima selten ein Problem sind</Highlight> – 
        in hochdimensionalen Räumen sind fast alle Minima ähnlich gut. 
        Viel wichtiger ist, dass das Training <Highlight>stabil und gleichmäßig</Highlight> verläuft.
      </P>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 2: TRAINING VERSTEHEN
// ════════════════════════════════════════════════════════════════

function TrainingLoopSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Activity className="w-9 h-9" />} title="Der Trainings-Loop" subtitle="Was genau passiert, wenn du auf 'Start Training' klickst?" />

      <P>
        Wenn FrameTrain das Training startet, läuft ein präziser Zyklus ab. 
        Zu verstehen, was in jedem Schritt passiert, hilft dir, Probleme zu erkennen und Hyperparameter richtig einzustellen.
      </P>

      <H2>Vollständiger Trainings-Ablauf</H2>
      <CodeBlock>{`Für jede Epoche (1 bis N_epochs):
  Für jeden Batch (Schritt 1 bis M):
    1. Lade Batch von Trainingsdaten
    2. Forward Pass → Prediction berechnen
    3. Loss berechnen (Prediction vs. Wahrheit)
    4. Backward Pass → Gradienten berechnen
    5. Optimizer.step() → Gewichte aktualisieren
    6. Gradient auf 0 zurücksetzen
  
  Nach jeder Epoche (oder N Schritten):
    7. Validation Loss berechnen (kein Backward Pass!)
    8. Metriken loggen (Accuracy, F1, etc.)
    9. Checkpoint speichern (falls beste Performance)`}</CodeBlock>

      <H2>Trainings-Modus vs. Evaluierungs-Modus</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-violet-400/20 rounded-xl p-5">
          <h3 className="text-violet-300 font-bold mb-3">Training Mode</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Dropout aktiv (schützt vor Overfitting)</li>
            <li>✓ Batch Normalization nutzt Batch-Statistiken</li>
            <li>✓ Gradienten werden berechnet</li>
            <li>✓ Gewichte werden aktualisiert</li>
          </ul>
        </div>
        <div className="glass border border-cyan-400/20 rounded-xl p-5">
          <h3 className="text-cyan-300 font-bold mb-3">Evaluierungs-Modus (Validation)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✗ Dropout deaktiviert</li>
            <li>✓ Batch Normalization nutzt globale Statistiken</li>
            <li>✗ Keine Gradientenberechnung</li>
            <li>✗ Gewichte werden NICHT verändert</li>
          </ul>
        </div>
      </div>

      <InfoBox type="warning" title="Wichtig: Validation ≠ Training">
        Validation Loss und Accuracy werden auf separaten Daten gemessen, die das Modell NIE gesehen hat. 
        Das gibt dir ein ehrliches Bild der echten Performance. Training-Metriken können täuschen!
      </InfoBox>

      <H2>Was ist ein "Schritt" (Step)?</H2>
      <P>
        Ein <Highlight>Schritt</Highlight> = 1 Batch vorwärts + rückwärts propagiert + Gewichte aktualisiert.
        Die Gesamtzahl der Schritte pro Training berechnet sich so:
      </P>
      <CodeBlock>{`Total Steps = (Datenmenge / Batch Size) × Anzahl Epochen

Beispiel:
  Dataset: 1.000 Beispiele
  Batch Size: 8
  Epochen: 3

  Schritte pro Epoch = 1.000 / 8 = 125
  Total Steps = 125 × 3 = 375 Schritte`}</CodeBlock>
    </div>
  )
}

function LossFunktionenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Target className="w-9 h-9" />} title="Loss-Funktionen" subtitle="Welche Verlustfunktion für welche Aufgabe?" />

      <P>
        Die <Highlight>Loss-Funktion</Highlight> (auch Kostenfunktion oder Verlustfunktion) misst, wie falsch das Modell gerade liegt. 
        Sie ist der zentrale Kompass des Trainings. Die Wahl der richtigen Loss-Funktion ist entscheidend.
      </P>

      <H2>Übersicht: Wichtigste Loss-Funktionen</H2>
      <div className="space-y-4">
        {[
          {
            name: 'Cross-Entropy Loss',
            formula: 'L = -Σ y·log(ŷ)',
            use: 'Klassifikation (Text, Bilder)',
            desc: 'Standard für alle Klassifikationsaufgaben. Bestraft falsche Klassen stark. Ideal für LLMs (nächstes Token vorhersagen).',
            example: 'Spam-Erkennung, Sentiment-Analyse, Sprachmodelle',
            color: 'border-violet-400/20',
          },
          {
            name: 'Mean Squared Error (MSE)',
            formula: 'L = (1/n) Σ(y - ŷ)²',
            use: 'Regression',
            desc: 'Misst den mittleren quadratischen Fehler. Gut für kontinuierliche Werte. Sehr sensitiv auf Ausreißer.',
            example: 'Preisvorhersage, Zeitreihen',
            color: 'border-blue-400/20',
          },
          {
            name: 'Mean Absolute Error (MAE)',
            formula: 'L = (1/n) Σ|y - ŷ|',
            use: 'Regression (robuster)',
            desc: 'Weniger sensitiv auf Ausreißer als MSE. Gut wenn Ausreißer im Dataset vorkommen.',
            example: 'Robust-Regression',
            color: 'border-cyan-400/20',
          },
          {
            name: 'Binary Cross-Entropy',
            formula: 'L = -(y·log(ŷ) + (1-y)·log(1-ŷ))',
            use: 'Binäre Klassifikation',
            desc: 'Spezialfall von Cross-Entropy für genau 2 Klassen.',
            example: 'Ja/Nein Entscheidungen',
            color: 'border-green-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <Tag color="purple">{item.use}</Tag>
            </div>
            <code className="text-violet-300 text-sm font-mono block mb-3">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-500 text-xs">Beispiele: {item.example}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Für LLMs in FrameTrain">
        Fast alle Sprachmodelle verwenden <strong>Cross-Entropy Loss</strong>. 
        FrameTrain wählt automatisch die richtige Loss-Funktion basierend auf dem Modelltyp und der Aufgabe.
      </InfoBox>
    </div>
  )
}

function MetrikenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<BarChart3 className="w-9 h-9" />} title="Metriken & Auswertung" subtitle="Was sagen Accuracy, F1, Perplexity wirklich aus?" />

      <P>
        Metriken sind <Highlight>Messgrößen</Highlight> für die Performance deines Modells. 
        Der Loss allein reicht oft nicht – Metriken geben dir ein vollständigeres Bild.
      </P>

      <H2>Klassifikations-Metriken</H2>
      <div className="space-y-4">
        {[
          {
            name: 'Accuracy (Genauigkeit)',
            formula: 'Richtige Predictions / Alle Predictions',
            desc: 'Wie viel Prozent der Vorhersagen sind korrekt? Einfach zu verstehen, aber bei unbalancierten Klassen irreführend.',
            warning: 'Bei 99% negativen Beispielen erreicht ein Modell, das immer "nein" sagt, 99% Accuracy – obwohl es nichts gelernt hat!',
          },
          {
            name: 'Precision',
            formula: 'TP / (TP + FP)',
            desc: 'Von allen als positiv klassifizierten: Wie viele waren wirklich positiv? Wichtig wenn falsch-positive Ergebnisse teuer sind.',
            warning: null,
          },
          {
            name: 'Recall',
            formula: 'TP / (TP + FN)',
            desc: 'Von allen echten Positiven: Wie viele wurden gefunden? Wichtig wenn falsch-negative Ergebnisse gefährlich sind (z.B. Krankheitserkennung).',
            warning: null,
          },
          {
            name: 'F1-Score',
            formula: '2 × (Precision × Recall) / (Precision + Recall)',
            desc: 'Harmonisches Mittel aus Precision und Recall. Beste Einzelzahl bei unbalancierten Datasets.',
            warning: null,
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <code className="text-violet-300 text-sm font-mono block mb-2">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            {item.warning && (
              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 mt-2">
                <p className="text-yellow-400 text-xs">⚠️ {item.warning}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <H2>Sprachmodell-Metriken</H2>
      <div className="space-y-3">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">Perplexity</h3>
          <p className="text-gray-400 text-sm mb-2">
            Misst wie "überrascht" das Modell von den Testdaten ist. 
            <Highlight> Niedrigere Perplexity = besser</Highlight>. Ein Wert von 10 bedeutet: Das Modell ist 
            im Durchschnitt zwischen 10 gleich wahrscheinlichen nächsten Wörtern.
          </p>
          <p className="text-gray-500 text-xs">Perplexity = exp(Cross-Entropy Loss)</p>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">BLEU Score</h3>
          <p className="text-gray-400 text-sm">
            Für Übersetzungen und Text-Generierung. Vergleicht generierte Texte mit Referenz-Texten auf Basis von N-Gramm-Übereinstimmungen. Werte zwischen 0 und 1 (höher = besser).
          </p>
        </div>
      </div>
    </div>
  )
}

function TrainValTestSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<GitBranch className="w-9 h-9" />} title="Train / Validation / Test Split" subtitle="Warum du dein Dataset aufteilen musst" />

      <P>
        Eine der <Highlight>wichtigsten Grundregeln</Highlight>: Dein Dataset wird in mindestens zwei, 
        idealerweise drei Teile aufgeteilt. Jeder Teil hat eine andere Rolle.
      </P>

      <div className="glass border border-white/10 rounded-xl p-5 mb-4">
        <p className="text-sm text-gray-400 mb-4 font-semibold text-center">📊 Typische Dataset-Aufteilung</p>
        <svg viewBox="0 0 500 60" className="w-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="15" width="350" height="35" fill="rgba(139,92,246,0.3)" rx="4"/>
          <rect x="360" y="15" width="65" height="35" fill="rgba(6,182,212,0.3)" rx="4"/>
          <rect x="425" y="15" width="65" height="35" fill="rgba(74,222,128,0.3)" rx="4"/>
          <text x="185" y="38" fill="rgba(167,139,250,0.9)" fontSize="13" fontWeight="bold" textAnchor="middle">Training (70%)</text>
          <text x="392" y="38" fill="rgba(103,232,249,0.9)" fontSize="11" fontWeight="bold" textAnchor="middle">Val. (15%)</text>
          <text x="457" y="38" fill="rgba(74,222,128,0.9)" fontSize="11" fontWeight="bold" textAnchor="middle">Test (15%)</text>
        </svg>
      </div>

      <div className="space-y-4">
        {[
          {
            name: 'Trainings-Set (60–80%)',
            color: 'border-violet-400/30',
            icon: '🏋️',
            desc: 'Das Modell lernt auf diesen Daten. Die Gewichte werden ausschließlich durch diese Daten angepasst.',
            rule: 'Das Modell darf diese Daten "sehen"',
          },
          {
            name: 'Validation-Set (10–20%)',
            color: 'border-cyan-400/30',
            icon: '🔍',
            desc: 'Wird nach jeder Epoche genutzt, um die Performance zu messen und Hyperparameter anzupassen. Das Modell lernt NICHT darauf – aber du schaust danach.',
            rule: 'Dient als "Spiegel" während des Trainings',
          },
          {
            name: 'Test-Set (10–20%)',
            color: 'border-green-400/30',
            icon: '🎯',
            desc: 'Wird erst ganz am Ende verwendet, um die echte Performance zu messen. Niemals für Hyperparameter-Tuning nutzen!',
            rule: 'Nur EINMAL am Ende anfassen',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <h3 className="text-white font-bold mb-2">{item.icon} {item.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-500 text-xs italic">Regel: {item.rule}</p>
          </div>
        ))}
      </div>

      <InfoBox type="error" title="Häufiger Fehler: Data Leakage">
        Wenn Test-Daten in die Trainings- oder Validation-Daten einfließen (Data Leakage), 
        sind deine Metriken wertlos. Das Modell hat "gespickt" und Performance wird dramatisch überschätzt. 
        Immer STRIKT trennen!
      </InfoBox>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 3: TRAININGSVERLAUF LESEN
// ════════════════════════════════════════════════════════════════

function LossKurvenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<LineChart className="w-9 h-9" />} title="Loss-Kurven interpretieren" subtitle="Das Herzstück des Trainingsmonitorings" />

      <P>
        Die <Highlight>Loss-Kurve</Highlight> ist dein wichtigstes Werkzeug beim Training. 
        Sie zeigt, wie sich der Fehler über Zeit entwickelt. Ein geübtes Auge erkennt sofort, 
        ob das Training gut läuft, ob Probleme vorliegen und was zu tun ist.
      </P>

      <H2>Was du in jedem Diagramm siehst</H2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="glass border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">X-Achse: Zeit</h3>
          <p className="text-gray-400 text-sm">Trainingsschritte (Steps) oder Epochen. Je weiter rechts, desto länger wurde trainiert.</p>
        </div>
        <div className="glass border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">Y-Achse: Loss-Wert</h3>
          <p className="text-gray-400 text-sm">Der Fehler. Niedrig = gut. Hoch = schlecht. Ziel: möglichst schnell möglichst tief sinken.</p>
        </div>
        <div className="glass border border-violet-400/20 rounded-xl p-4">
          <h3 className="text-violet-300 font-semibold mb-2">Training Loss (lila)</h3>
          <p className="text-gray-400 text-sm">Fehler auf den Trainingsdaten. Wird nach jedem Step/Batch berechnet. Oft etwas rauschig.</p>
        </div>
        <div className="glass border border-cyan-400/20 rounded-xl p-4">
          <h3 className="text-cyan-300 font-semibold mb-2">Validation Loss (blau/gestrichelt)</h3>
          <p className="text-gray-400 text-sm">Fehler auf Validation-Daten. Glatter, weniger Rauschen. Entscheidend für echte Performance-Bewertung.</p>
        </div>
      </div>

      <H2>Die 4 wichtigsten Muster</H2>
      
      <GoodTrainingChart />
      <P>
        <Highlight>Gutes Training:</Highlight> Beide Kurven sinken gleichmäßig. 
        Der Abstand (Generalisierungs-Gap) bleibt klein und stabil. 
        Am Ende flachen beide Kurven ab – das Modell hat das Maximum aus den Daten herausgeholt.
      </P>

      <OverfittingChart />
      <P>
        <Highlight>Overfitting:</Highlight> Training Loss sinkt weiter, aber Validation Loss steigt wieder an. 
        Das Modell "memoriert" die Trainingsdaten statt zu generalisieren. Der Punkt, wo die Kurven auseinandergehen, 
        ist der ideale Zeitpunkt zum Stoppen (Early Stopping).
      </P>

      <UnderfittingChart />
      <P>
        <Highlight>Underfitting:</Highlight> Beide Kurven stagnieren auf einem hohen Niveau. 
        Das Modell lernt die Muster in den Daten nicht. Mögliche Ursachen: zu wenige Epochs, 
        zu kleine Learning Rate, falsches Modell für die Aufgabe.
      </P>

      <H2>Was ist ein "guter" Loss-Wert?</H2>
      <div className="glass border border-white/10 rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-4">Der absolute Loss-Wert ist kontextabhängig. Was zählt ist der Trend und der Vergleich:</p>
        <div className="space-y-3">
          {[
            { metric: 'Cross-Entropy (Klassifikation)', good: '< 0.3', ok: '0.3–0.7', bad: '> 0.7' },
            { metric: 'Cross-Entropy (LLM)', good: '< 1.5', ok: '1.5–3.0', bad: '> 3.0' },
            { metric: 'MSE (normalisiert)', good: '< 0.05', ok: '0.05–0.2', bad: '> 0.2' },
          ].map((row, i) => (
            <div key={i} className="flex gap-3 items-center text-sm">
              <span className="text-gray-400 flex-1">{row.metric}</span>
              <Tag color="green">✓ {row.good}</Tag>
              <Tag color="yellow">~ {row.ok}</Tag>
              <Tag color="red">✗ {row.bad}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GutesTrainingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<CheckCircle2 className="w-9 h-9" />} title="Gutes Training erkennen" subtitle="Die Zeichen eines erfolgreichen Trainings" />

      <InfoBox type="success" title="Das Ideal-Szenario">
        Training Loss und Validation Loss sinken beide, bleiben nah beieinander und flachen am Ende auf einem niedrigen Wert ab.
      </InfoBox>

      <H2>Checkliste: Gutes Training</H2>
      <div className="space-y-3">
        {[
          { check: 'Beide Losses sinken in den ersten Epochen deutlich', detail: 'Zeigt: Das Modell lernt tatsächlich aus den Daten.' },
          { check: 'Training Loss ≈ Validation Loss (kleiner Gap)', detail: 'Zeigt: Das Modell generalisiert gut, kein Overfitting.' },
          { check: 'Kurven werden am Ende flacher (Plateau)', detail: 'Zeigt: Das Modell nähert sich seinem Maximum auf diesem Dataset.' },
          { check: 'Keine großen Sprünge (Spikes) im Loss', detail: 'Zeigt: Training ist stabil, Learning Rate ist angemessen.' },
          { check: 'Validation Accuracy steigt über alle Epochen', detail: 'Zeigt: Echte Verbesserung auf ungesehenen Daten.' },
          { check: 'Validation Loss erreicht sein Minimum und bleibt dort', detail: 'Zeigt: Kein Overfitting, optimaler Trainingszeitpunkt.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-green-400/20 rounded-xl p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">{item.check}</p>
              <p className="text-gray-500 text-xs mt-1">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Wann ist das Training "fertig"?</H2>
      <P>
        Das Training ist optimal abgeschlossen, wenn der <Highlight>Validation Loss sein globales Minimum</Highlight> erreicht hat. 
        Danach kann das Training beendet werden – weiteres Training würde nur Overfitting riskieren.
      </P>
      <div className="space-y-3">
        {[
          { signal: 'Validation Loss flacht ab und schwankt minimal', action: '→ Noch 2–3 Epochen abwarten, dann stoppen' },
          { signal: 'Validation Loss steigt zum ersten Mal', action: '→ Best Checkpoint laden (diese Epoche war ideal)' },
          { signal: 'Alle geplanten Epochen abgelaufen', action: '→ Prüfe ob Early Stopping Sinn gemacht hätte' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4">
            <p className="text-gray-300 text-sm">{item.signal}</p>
            <p className="text-violet-400 text-sm font-semibold mt-1">{item.action}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function OverfittingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<AlertTriangle className="w-9 h-9" />} title="Overfitting erkennen" subtitle="Wenn das Modell Trainingsdaten auswendig lernt" />

      <P>
        <Highlight>Overfitting</Highlight> ist das häufigste Problem beim Training. Das Modell lernt die Trainingsdaten 
        SO gut, dass es auch das Rauschen und die Zufälligkeiten darin auswendig lernt. 
        Auf neuen Daten versagt es dann.
      </P>

      <OverfittingChart />

      <H2>Klare Erkennungszeichen</H2>
      <div className="space-y-3">
        {[
          { sign: 'Training Loss sinkt, Validation Loss steigt', severity: 'Kritisch', color: 'border-red-400/30' },
          { sign: 'Großer Abstand zwischen Training und Validation Loss', severity: 'Warnung', color: 'border-orange-400/30' },
          { sign: 'Training Accuracy ~99%, Validation Accuracy ~60%', severity: 'Kritisch', color: 'border-red-400/30' },
          { sign: 'Modell performen sehr gut auf bekannten Daten, schlecht auf neuen', severity: 'Kritisch', color: 'border-red-400/30' },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-4 flex justify-between items-center ${item.color}`}>
            <p className="text-gray-300 text-sm">{item.sign}</p>
            <Tag color={item.severity === 'Kritisch' ? 'red' : 'yellow'}>{item.severity}</Tag>
          </div>
        ))}
      </div>

      <H2>Warum passiert Overfitting?</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { cause: 'Zu wenig Daten', detail: 'Das Modell sieht zu wenige Beispiele und lernt sie auswendig.' },
          { cause: 'Zu viele Epochen', detail: 'Zu langes Training – das Modell schleift die Daten immer tiefer ein.' },
          { cause: 'Modell zu groß', detail: 'Zu viele Parameter für die Datenmenge – zu viel Kapazität zum "Memorieren".' },
          { cause: 'Kein Dropout / Regularisierung', detail: 'Ohne Regularisierung lernt das Modell freier – und overfittet leichter.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <h3 className="text-red-300 font-semibold mb-1">{item.cause}</h3>
            <p className="text-gray-400 text-sm">{item.detail}</p>
          </div>
        ))}
      </div>

      <InfoBox type="warning" title="Overfitting ≠ schlechtes Modell grundsätzlich">
        Ein leichtes Overfitting ist normal und oft akzeptabel. 
        Erst wenn Validation Loss deutlich über Training Loss liegt und Validation-Performance stark abfällt, ist es ein Problem.
      </InfoBox>
    </div>
  )
}

function UnderfittingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TrendingDown className="w-9 h-9" />} title="Underfitting erkennen" subtitle="Wenn das Modell gar nichts lernt" />

      <P>
        <Highlight>Underfitting</Highlight> bedeutet: Das Modell ist zu simpel oder wurde zu kurz trainiert, 
        um die Muster in den Daten zu lernen. Es performt auf Training- UND Validation-Daten schlecht.
      </P>

      <UnderfittingChart />

      <H2>Erkennungszeichen</H2>
      <div className="space-y-3">
        {[
          { sign: 'Hoher Training Loss, der sich kaum verändert', detail: 'Das Modell lernt absolut nichts.' },
          { sign: 'Hoher Validation Loss von Anfang an', detail: 'Beide Kurven stagnieren auf hohem Niveau.' },
          { sign: 'Niedrige Accuracy auf Trainingsdaten (< 60%)', detail: 'Kann noch nicht mal die Trainingsdaten gut klassifizieren.' },
          { sign: 'Loss-Kurve flacht nach wenigen Schritten ab ohne zu sinken', detail: 'Frühzeitige Stagnation – kein Lernfortschritt.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-orange-400/20 rounded-xl p-4">
            <p className="text-orange-300 font-semibold text-sm">{item.sign}</p>
            <p className="text-gray-500 text-xs mt-1">{item.detail}</p>
          </div>
        ))}
      </div>

      <H2>Ursachen</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { cause: 'Learning Rate zu niedrig', fix: 'LR erhöhen (z.B. 1e-5 → 5e-5)' },
          { cause: 'Zu wenige Epochen', fix: 'Mehr Epochen trainieren' },
          { cause: 'Zu kleines Modell', fix: 'Größeres Basismodell wählen' },
          { cause: 'Falscher Optimizer', fix: 'AdamW statt SGD versuchen' },
          { cause: 'Falsche Datenformatierung', fix: 'Dataset-Format prüfen' },
          { cause: 'Gradient Vanishing', fix: 'Layer Normalization aktivieren' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4">
            <p className="text-orange-300 text-sm font-semibold">{item.cause}</p>
            <p className="text-gray-400 text-xs mt-1">→ {item.fix}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function InstabilesTrainingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Activity className="w-9 h-9" />} title="Instabiles Training" subtitle="Loss-Spikes, Explosionen und Chaos" />

      <P>
        Manchmal wackelt der Loss stark, springt plötzlich hoch oder das Training bricht ab. 
        Diese Instabilitäten haben meist klare Ursachen.
      </P>

      <HighLRChart />

      <H2>Instabilitäts-Muster und Bedeutungen</H2>
      <div className="space-y-4">
        {[
          {
            pattern: 'Starke Oszillation (hoch-runter-hoch)',
            cause: 'Learning Rate zu hoch',
            desc: 'Das Modell überspringt das Minimum immer wieder. Der Optimizer "springt" zu weit.',
            fix: 'LR um Faktor 3–10 reduzieren',
            color: 'border-yellow-400/20',
          },
          {
            pattern: 'Plötzlicher großer Spike, dann erholt sich Training',
            cause: 'Schlechter Batch / Ausreißer in Daten',
            desc: 'Ein extrem schwieriges oder fehlerhaftes Batch hat einen kurzen Spike verursacht.',
            fix: 'Gradient Clipping aktivieren, Daten bereinigen',
            color: 'border-orange-400/20',
          },
          {
            pattern: 'Loss explodiert (NaN / Inf)',
            cause: 'Gradient Explosion',
            desc: 'Gradienten werden so groß, dass numerische Werte instabil werden.',
            fix: 'Gradient Clipping auf 1.0, LR reduzieren',
            color: 'border-red-400/20',
          },
          {
            pattern: 'Sanfte Wellen / zyklisches Muster',
            cause: 'LR Scheduler mit Warmup/Restarts',
            desc: 'Nicht immer ein Problem – cyclische Scheduler erzeugen bewusst zyklische Muster.',
            fix: 'Prüfen ob Scheduler korrekt konfiguriert',
            color: 'border-blue-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-white font-bold text-sm">{item.pattern}</h3>
              <Tag color="yellow">{item.cause}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs font-semibold">→ Fix: {item.fix}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 4: DIAGNOSE & FIXES
// ════════════════════════════════════════════════════════════════

function OverfittingFixSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Shield className="w-9 h-9" />} title="Overfitting bekämpfen" subtitle="Konkrete Maßnahmen und ihre Wirkung" />

      <P>
        Overfitting ist das häufigste Problem – aber auch das am besten erforschte. 
        Es gibt eine Reihe bewährter Techniken, die einzeln oder kombiniert eingesetzt werden können.
      </P>

      <H2>Maßnahmen im Überblick (nach Effektivität)</H2>
      <div className="space-y-4">
        {[
          {
            rank: '1',
            name: 'Mehr Trainingsdaten',
            effect: 'Sehr hoch',
            desc: 'Mehr diverse Daten ist immer die effektivste Lösung. Mehr Beispiele = weniger Chance, Rauschen zu memorieren.',
            how: 'Dataset vergrößern, Data Augmentation, synthetische Daten generieren',
            color: 'from-green-500 to-emerald-500',
          },
          {
            rank: '2',
            name: 'Early Stopping',
            effect: 'Sehr hoch',
            desc: 'Training stoppen, bevor Overfitting beginnt. Überwache Validation Loss und stoppe wenn er steigt.',
            how: 'Patience=3–5 Epochen. Bestes Checkpoint laden.',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            rank: '3',
            name: 'Dropout erhöhen',
            effect: 'Hoch',
            desc: 'Zufällig Neuronen während Training deaktivieren. Erzwingt Redundanz und robustere Features.',
            how: 'Dropout 0.1 → 0.3 oder 0.5. Nur in Trainings-Modus aktiv.',
            color: 'from-violet-500 to-purple-500',
          },
          {
            rank: '4',
            name: 'Weniger Epochen / früher stoppen',
            effect: 'Mittel',
            desc: 'Einfachste Lösung: einfach weniger trainieren.',
            how: 'Epochs von 5 auf 2–3 reduzieren.',
            color: 'from-orange-500 to-amber-500',
          },
          {
            rank: '5',
            name: 'Weight Decay erhöhen (L2 Regularisierung)',
            effect: 'Mittel',
            desc: 'Bestraft große Gewichte. Hält Modell-Parameter klein und generalisierbar.',
            how: 'weight_decay von 0.01 auf 0.1 erhöhen.',
            color: 'from-pink-500 to-rose-500',
          },
          {
            rank: '6',
            name: 'Learning Rate reduzieren',
            effect: 'Mittel',
            desc: 'Kleinere Schritte = langsameres, vorsichtigeres Anpassen der Gewichte.',
            how: 'LR halbieren oder drittel',
            color: 'from-teal-500 to-cyan-500',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5 flex gap-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white font-black flex-shrink-0`}>
              {item.rank}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-white font-bold">{item.name}</h3>
                <Tag color="green">{item.effect}</Tag>
              </div>
              <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
              <p className="text-violet-300 text-xs font-mono">{item.how}</p>
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="success" title="Beste Kombination für Fine-Tuning">
        Early Stopping + kleines Weight Decay + LoRA (begrenzt trainierbare Parameter) ist die 
        effektivste und unkomplizierteste Kombination beim Fine-Tuning mit FrameTrain.
      </InfoBox>
    </div>
  )
}

function UnderfittingFixSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Flame className="w-9 h-9" />} title="Underfitting beheben" subtitle="Wenn das Modell nicht genug lernt" />

      <H2>Schritt-für-Schritt Diagnose & Fix</H2>
      <div className="space-y-4">
        {[
          {
            step: 'Schritt 1',
            problem: 'Learning Rate zu niedrig?',
            check: 'Loss sinkt extrem langsam (fast horizontal)',
            fix: 'Learning Rate schrittweise erhöhen: 1e-5 → 3e-5 → 1e-4. Test mit kurzen Trainings.',
          },
          {
            step: 'Schritt 2',
            problem: 'Zu wenige Epochen?',
            check: 'Training Loss sinkt noch bei letzter Epoche (kein Plateau erreicht)',
            fix: 'Epochen verdoppeln oder verdreifachen. Loss-Kurve zeigt ob noch Potential da ist.',
          },
          {
            step: 'Schritt 3',
            problem: 'Modell zu klein/einfach für die Aufgabe?',
            check: 'Selbst mit langen Trainings bleibt Loss hoch',
            fix: 'Größeres Basismodell wählen. Für komplexe Texte: von BERT auf RoBERTa oder LLaMA wechseln.',
          },
          {
            step: 'Schritt 4',
            problem: 'Falsche Datenformatierung?',
            check: 'Loss bleibt konstant von Anfang an (NaN-ähnliches Verhalten)',
            fix: 'Dataset-Format genau prüfen. Sind Labels korrekt? Stimmt Tokenisierung?',
          },
          {
            step: 'Schritt 5',
            problem: 'Zu viel Dropout/Regularisierung?',
            check: 'Training bleibt hoch, aber Validation loss ist ähnlich wie Training',
            fix: 'Dropout reduzieren oder deaktivieren zum Testen.',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-orange-400/20 rounded-xl p-5">
            <Tag color="yellow">{item.step}</Tag>
            <h3 className="text-white font-bold mt-2 mb-1">{item.problem}</h3>
            <p className="text-gray-500 text-xs mb-2">Erkennen: {item.check}</p>
            <p className="text-orange-300 text-sm">→ {item.fix}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LRProblemeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sliders className="w-9 h-9" />} title="Learning Rate Probleme" subtitle="Die häufigste Fehlerquelle diagnostizieren" />

      <P>
        Die Learning Rate ist der empfindlichste Hyperparameter. Schon ein falscher Faktor 
        von 10 kann den Unterschied zwischen perfektem Training und komplettem Versagen bedeuten.
      </P>

      <HighLRChart />
      <LowLRChart />

      <H2>Learning Rate Finding</H2>
      <P>
        Der <Highlight>LR Range Test</Highlight> ist die beste Methode, eine gute Learning Rate zu finden: 
        Trainiere für eine kurze Zeit mit exponentiell steigender LR und plotte den Loss. 
        Die optimale LR liegt kurz vor dem Punkt, wo der Loss am steilsten sinkt.
      </P>
      <div className="glass border border-violet-400/20 rounded-xl p-5">
        <p className="text-sm text-gray-400 mb-4 font-semibold text-center">📊 LR Range Test – Interpretation</p>
        <svg viewBox="0 0 500 180" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {[30,70,110,150,170].map(y => (
            <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          ))}
          <line x1="50" y1="15" x2="50" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <line x1="50" y1="165" x2="480" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <text x="260" y="178" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Learning Rate (log scale) →</text>
          <text x="18" y="90" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,90)">Loss ↓</text>
          {/* LR Range test curve: flat, then descend steeply, then rises */}
          <path d="M50,50 C90,50 140,52 190,65 C230,78 250,100 270,130 C290,150 310,160 340,163 C370,165 400,155 430,140 C455,128 470,120 480,100"
            fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Optimal zone marker */}
          <line x1="230" y1="20" x2="230" y2="160" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <text x="215" y="18" fill="rgba(74,222,128,0.9)" fontSize="9">Optimal</text>
          {/* Too high marker */}
          <line x1="360" y1="20" x2="360" y2="160" stroke="rgba(248,113,113,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <text x="355" y="18" fill="rgba(248,113,113,0.9)" fontSize="9">zu hoch</text>
          {/* Labels */}
          <text x="100" y="45" fill="rgba(167,139,250,0.7)" fontSize="8">noch zu niedrig</text>
          <text x="240" y="115" fill="rgba(74,222,128,0.9)" fontSize="8">steilster Abfall</text>
        </svg>
      </div>

      <H2>Faustregeln für Learning Rates</H2>
      <div className="space-y-2">
        {[
          { model: 'BERT / RoBERTa Fine-Tuning', lr: '1e-5 bis 5e-5', note: 'Bewährt für Klassifikation' },
          { model: 'GPT-2 Fine-Tuning', lr: '5e-5 bis 1e-4', note: 'Generative Modelle' },
          { model: 'LLaMA / Mistral LoRA', lr: '2e-4 bis 3e-4', note: 'Standard für LoRA' },
          { model: 'Training von Grund auf', lr: '1e-3 bis 3e-3', note: 'AdamW, größere Batches' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 flex justify-between items-center text-sm">
            <span className="text-gray-400">{row.model}</span>
            <code className="text-violet-300 font-mono">{row.lr}</code>
            <span className="text-gray-500 text-xs">{row.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LossSpikeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TriangleAlert className="w-9 h-9" />} title="Loss Spikes & Crashes" subtitle="Plötzliche Ausreißer im Training diagnostizieren" />

      <H2>Was ist ein Loss Spike?</H2>
      <P>
        Ein <Highlight>Loss Spike</Highlight> ist ein plötzlicher, starker Anstieg des Loss während des Trainings. 
        Das Training kann sich danach erholen – oder komplett abstürzen (Gradient Explosion).
      </P>

      <H2>Häufige Ursachen und Lösungen</H2>
      <div className="space-y-4">
        {[
          {
            cause: 'Schlechtes Batch / Ausreißer in Daten',
            symptoms: 'Einzelner Spike, Training erholt sich danach',
            solution: [
              'Gradient Clipping aktivieren (max_grad_norm = 1.0)',
              'Daten bereinigen – beschädigte oder sehr kurze/lange Beispiele entfernen',
              'Batch Size erhöhen (mittelt Ausreißer heraus)',
            ],
            severity: 'Moderat',
          },
          {
            cause: 'Learning Rate zu hoch (Gradient Explosion)',
            symptoms: 'Mehrere Spikes, Loss explodiert (NaN), Training bricht ab',
            solution: [
              'Learning Rate um Faktor 3–10 reduzieren',
              'Gradient Clipping aktivieren',
              'Warmup Phase hinzufügen',
            ],
            severity: 'Kritisch',
          },
          {
            cause: 'Numerische Instabilität',
            symptoms: 'Loss wird NaN oder Inf',
            solution: [
              'float32 statt float16 testen',
              'Mixed Precision deaktivieren',
              'Layer Normalization prüfen',
            ],
            severity: 'Kritisch',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-red-400/20 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{item.cause}</h3>
              <Tag color={item.severity === 'Kritisch' ? 'red' : 'yellow'}>{item.severity}</Tag>
            </div>
            <p className="text-gray-500 text-xs mb-3">Symptome: {item.symptoms}</p>
            <h4 className="text-green-400 text-sm font-semibold mb-2">Lösungen:</h4>
            <ul className="space-y-1">
              {item.solution.map((s, j) => (
                <li key={j} className="text-gray-400 text-sm flex gap-2">
                  <span className="text-green-400">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Gradient Clipping – Standard in FrameTrain">
        FrameTrain hat Gradient Clipping standardmäßig auf 1.0 gesetzt. Das bedeutet: 
        Gradienten werden automatisch begrenzt, bevor sie zu Explosionen führen können.
      </InfoBox>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 5: HYPERPARAMETER-COACHING
// ════════════════════════════════════════════════════════════════

function LearningRateDeepSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sliders className="w-9 h-9" />} title="Learning Rate (vertieft)" subtitle="Der wichtigste Hyperparameter – vollständig verstehen" />

      <P>
        Die <Highlight>Learning Rate (LR)</Highlight> bestimmt, wie groß die Schritte sind, mit denen das Modell 
        seine Gewichte anpasst. Zu groß: instabiles Training. Zu klein: kein Fortschritt.
        Die Formel lautet: <code className="text-violet-300">W_neu = W_alt - LR × Gradient</code>
      </P>

      <H2>Auswirkungen auf den Trainingsverlauf</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            lr: 'LR zu groß (z.B. 1e-2)',
            color: 'border-red-400/20',
            effects: ['Loss oszilliert stark', 'Kein Konvergieren', 'Mögl. Explosion (NaN)'],
            visual: '⚡ Chaos',
          },
          {
            lr: 'LR ideal (z.B. 2e-5)',
            color: 'border-green-400/20',
            effects: ['Loss sinkt gleichmäßig', 'Stabile Konvergenz', 'Optimale Performance'],
            visual: '✓ Perfekt',
          },
          {
            lr: 'LR zu klein (z.B. 1e-8)',
            color: 'border-yellow-400/20',
            effects: ['Kaum Fortschritt', 'Sehr langsames Training', 'Epochs verpuffen'],
            visual: '🐌 Zu langsam',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <h3 className="text-white font-bold mb-1">{item.lr}</h3>
            <p className="text-2xl mb-3">{item.visual}</p>
            {item.effects.map((e, j) => (
              <p key={j} className="text-gray-400 text-sm">{e}</p>
            ))}
          </div>
        ))}
      </div>

      <H2>Empfehlungen für verschiedene Szenarien</H2>
      <CodeBlock>{`Fine-Tuning (BERT-Familie):
  LR = 2e-5 bis 5e-5  (Standard-Empfehlung)

Fine-Tuning (GPT-Familie / Decoder):
  LR = 1e-5 bis 1e-4

LoRA Fine-Tuning (LLaMA, Mistral):
  LR = 1e-4 bis 3e-4  (höher möglich durch weniger Parameter)

Training von Scratch:
  LR = 1e-3 bis 3e-3  (AdamW, cos. decay)

Faustregel: Starte mit 2e-5, halbiere wenn instabil,
verdopple wenn zu langsam (Validation Loss stagniert)`}</CodeBlock>

      <H2>Linear Scaling Rule</H2>
      <P>
        Wenn du die Batch Size erhöhst, solltest du die Learning Rate proportional erhöhen. 
        Dieses Prinzip nennt sich <Highlight>Linear Scaling Rule</Highlight>.
      </P>
      <CodeBlock>{`Beispiel: Batch Size 8 → LR 2e-5
           Batch Size 16 → LR 4e-5  (verdoppelt)
           Batch Size 32 → LR 8e-5  (vervierfacht)

Wichtig: Nur bei großen Batch-Änderungen relevant.
Bei kleinen Änderungen (8→16) ist es optional.`}</CodeBlock>
    </div>
  )
}

function LRSchedulerSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TrendingDown className="w-9 h-9" />} title="LR Scheduler Strategien" subtitle="Die Learning Rate über das Training hinweg steuern" />

      <P>
        Ein <Highlight>Learning Rate Scheduler</Highlight> passt die LR während des Trainings automatisch an. 
        Das ermöglicht schnelles Lernen am Anfang und präzises Feintunen am Ende.
      </P>

      <LRSchedulerChart />

      <H2>Wichtigste Scheduler im Vergleich</H2>
      <div className="space-y-4">
        {[
          {
            name: 'Warmup + Constant',
            desc: 'LR steigt linear von 0 auf Ziel-LR (Warmup), bleibt dann konstant.',
            use: 'Einfache Aufgaben, kurze Trainings',
            pros: 'Einfach, vorhersehbar',
            cons: 'Kein automatisches Abkühlen',
          },
          {
            name: 'Warmup + Cosine Decay ⭐',
            desc: 'LR steigt linear, sinkt dann sanft als Cosinus-Kurve gegen 0.',
            use: 'Goldstandard für LLM Fine-Tuning',
            pros: 'Sanftes Abkühlen, sehr stabile Ergebnisse, weit verbreitet',
            cons: 'Parameter: Warmup-Schritte festlegen',
          },
          {
            name: 'Warmup + Linear Decay',
            desc: 'LR steigt linear, sinkt dann linear.',
            use: 'BERT Fine-Tuning (original Paper)',
            pros: 'Einfach, gut dokumentiert',
            cons: 'Cosine Decay oft minimal besser',
          },
          {
            name: 'ReduceLROnPlateau',
            desc: 'LR wird automatisch reduziert, wenn Validation Loss stagniert.',
            use: 'Wenn optimale Epochenzahl unbekannt',
            pros: 'Adaptiv, kein manuelles Einstellen',
            cons: 'Kann zu früh/spät reagieren',
          },
          {
            name: 'Cosine Annealing with Restarts',
            desc: 'Wiederholt Cosine-Decay-Zyklen. Hilft aus lokalen Minima zu entkommen.',
            use: 'Exploratives Training, Ensembles',
            pros: 'Diverse Checkpoints, vielseitig',
            cons: 'Komplexer zu konfigurieren',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div><Tag color="blue">Einsatz</Tag><p className="text-gray-400 mt-1">{item.use}</p></div>
              <div><Tag color="green">Vorteile</Tag><p className="text-gray-400 mt-1">{item.pros}</p></div>
              <div><Tag color="red">Nachteile</Tag><p className="text-gray-400 mt-1">{item.cons}</p></div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="success" title="Empfehlung für FrameTrain">
        Nutze <strong>Warmup + Cosine Decay</strong> als Standard. 
        Setze Warmup auf ~5–10% der gesamten Trainingsschritte.
        Für ein kurzes 3-Epochen-Training mit 1000 Steps = 50–100 Warmup-Steps.
      </InfoBox>
    </div>
  )
}

function BatchSizeDeepSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title="Batch Size & Gradient Accumulation" subtitle="Effizienz und Speicher im Griff behalten" />

      <P>
        Die <Highlight>Batch Size</Highlight> bestimmt, wie viele Trainingsbeispiele gleichzeitig verarbeitet werden, 
        bevor die Gewichte aktualisiert werden. Sie hat direkten Einfluss auf Speicherbedarf, 
        Trainingsgeschwindigkeit und oft auch die Modellqualität.
      </P>

      <H2>Auswirkungen der Batch Size</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Kleine Batch Size (1–8)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Wenig GPU-Speicher nötig</li>
            <li>✓ Stochastisches Rauschen → manchmal hilfreich</li>
            <li>✗ Langsamer (weniger parallele Berechnungen)</li>
            <li>✗ Noisige Gradienten</li>
          </ul>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Große Batch Size (32–128+)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Schneller Training</li>
            <li>✓ Stabilere Gradienten</li>
            <li>✗ Viel GPU-Speicher nötig</li>
            <li>✗ Kann Generalisierung verschlechtern (benötigt höhere LR)</li>
          </ul>
        </div>
      </div>

      <H2>Gradient Accumulation – der Trick</H2>
      <P>
        <Highlight>Gradient Accumulation</Highlight> löst das Dilemma: Du verarbeitest kleine Batches, 
        addierst die Gradienten mehrere Schritte lang, und aktualisierst erst dann die Gewichte. 
        Das simuliert eine größere Batch Size ohne mehr Speicher zu brauchen.
      </P>
      <CodeBlock>{`Beispiel: Effektive Batch Size = 32 bei nur 8GB VRAM

  Batch Size = 4   (passt in Speicher)
  Gradient Accumulation Steps = 8
  → Effektive Batch Size = 4 × 8 = 32

  Nach 8 Vorwärtsdurchläufen: 1 Gewichts-Update
  Speicherverbrauch: Nur 4 Samples gleichzeitig!`}</CodeBlock>

      <H2>Empfohlene Batch Sizes nach GPU</H2>
      <div className="space-y-2">
        {[
          { vram: '4 GB VRAM', bs: '1–2', note: 'Mit Gradient Checkpointing', grad_acc: '16–32' },
          { vram: '6 GB VRAM', bs: '2–4', note: '+ fp16/bf16 empfohlen', grad_acc: '8–16' },
          { vram: '8 GB VRAM', bs: '4–8', note: 'RTX 3070/4060 Ti', grad_acc: '4–8' },
          { vram: '12 GB VRAM', bs: '8–16', note: 'RTX 3080/4070', grad_acc: '2–4' },
          { vram: '16 GB VRAM', bs: '16–32', note: 'RTX 3090/4080/A4000', grad_acc: '1–2' },
          { vram: '24 GB+ VRAM', bs: '32–64', note: 'RTX 3090/4090/A6000', grad_acc: '1' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-yellow-300 font-semibold">{row.vram}</span>
            <span className="text-violet-300">BS: {row.bs}</span>
            <span className="text-cyan-300">Grad. Acc.: {row.grad_acc}</span>
            <span className="text-gray-500 text-xs">{row.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptimizerVergleichSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Settings className="w-9 h-9" />} title="Optimizer Vergleich" subtitle="Welcher Optimizer passt zu welchem Training?" />

      <P>
        Der <Highlight>Optimizer</Highlight> ist der Algorithmus, der entscheidet, wie die Gewichte basierend auf den 
        Gradienten aktualisiert werden. Die Wahl beeinflusst Konvergenzgeschwindigkeit, Stabilität und finale Performance.
      </P>

      <H2>Die wichtigsten Optimizer</H2>
      <div className="space-y-4">
        {[
          {
            name: 'AdamW ⭐',
            formula: 'Adam + Weight Decay Decoupling',
            use: 'Standard für Fast alle modernen Transformer',
            desc: 'Kombiniert adaptive Learning Rates (wie Adam) mit korrekt implementiertem Weight Decay. Stabil, schnell, robust.',
            params: 'lr=2e-5, betas=(0.9, 0.999), weight_decay=0.01',
            recommendation: 'Standard-Empfehlung für FrameTrain',
            color: 'border-violet-400/20',
          },
          {
            name: 'SGD (mit Momentum)',
            formula: 'v = momentum·v - lr·grad; W += v',
            use: 'Computer Vision, manchmal besser als Adam',
            desc: 'Einfach, gut verstanden, aber sensibel auf Learning Rate. Benötigt oft LR-Scheduling und Warmup.',
            params: 'lr=0.01, momentum=0.9, weight_decay=1e-4',
            recommendation: 'Für Vision-Modelle oder wenn AdamW nicht konvergiert',
            color: 'border-blue-400/20',
          },
          {
            name: 'Adam',
            formula: 'Adaptive Moment Estimation',
            use: 'Allgemein, Vorgänger von AdamW',
            desc: 'Klassischer adaptiver Optimizer. Gut, aber AdamW übertrifft ihn bei Transformer-Modellen durch korrektes Weight Decay.',
            params: 'lr=2e-5, betas=(0.9, 0.999)',
            recommendation: 'Nimm lieber AdamW',
            color: 'border-gray-400/20',
          },
          {
            name: 'Adafactor',
            formula: 'Speichereffiziente Adam-Variante',
            use: 'Sehr große Modelle (T5, GPT-3 Größe)',
            desc: 'Spart Speicher durch niedrigerer Präzision der Statistiken. Gut wenn AdamW nicht in Speicher passt.',
            params: 'relative_step=True für auto LR',
            recommendation: 'Bei sehr großen Modellen wo AdamW OOM verursacht',
            color: 'border-green-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <code className="text-violet-300 text-xs font-mono block mb-2">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Parameter:</span>
                <code className="text-gray-300 block">{item.params}</code>
              </div>
              <div>
                <span className="text-gray-500">Empfehlung:</span>
                <p className="text-green-400">{item.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegularisierungSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Shield className="w-9 h-9" />} title="Regularisierung" subtitle="Techniken gegen Overfitting und für bessere Generalisierung" />

      <H2>Was ist Regularisierung?</H2>
      <P>
        <Highlight>Regularisierung</Highlight> sind Techniken, die das Modell daran hindern, 
        die Trainingsdaten zu "memorieren". Sie fördern einfachere, generalisierbarere Lösungen.
      </P>

      <H2>Die wichtigsten Techniken</H2>
      <div className="space-y-4">
        {[
          {
            name: 'L2 Regularisierung (Weight Decay)',
            desc: 'Bestraft große Gewichte, indem ein Term hinzugefügt wird, der proportional zum Quadrat der Gewichte ist.',
            formula: 'Loss_total = Loss + λ × Σ w²',
            effect: 'Hält Gewichte klein und gleichmäßig verteilt. Standard in AdamW.',
            param: 'weight_decay = 0.01 (Empfehlung)',
          },
          {
            name: 'Dropout',
            desc: 'Während dem Training werden zufällig Neuronen mit Wahrscheinlichkeit p deaktiviert. Beim Inferenz sind alle aktiv.',
            formula: 'h = mask_binomial(p) × h / (1-p)',
            effect: 'Erzwingt Redundanz. Netzwerk lernt mehrere unabhängige Repräsentationen.',
            param: 'dropout = 0.1 bis 0.5 (je nach Aufgabe)',
          },
          {
            name: 'Label Smoothing',
            desc: 'Statt harter 0/1-Labels werden weiche Labels (z.B. 0.9/0.1) verwendet.',
            formula: 'y_smooth = y × (1-ε) + ε/K',
            effect: 'Verhindert zu selbstbewusste Vorhersagen. Verbessert Kalibrierung.',
            param: 'label_smoothing = 0.1',
          },
          {
            name: 'Data Augmentation',
            desc: 'Trainingsdaten künstlich vergrößern durch Transformationen.',
            formula: 'Bilder: Rotation, Flip. Text: Rephrasierung, Übersetzung zurück.',
            effect: 'Effektivste Regularisierung wenn Daten knapp sind.',
            param: 'Aufgaben-spezifisch',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <code className="text-violet-300 text-xs font-mono block mb-2">{item.formula}</code>
            <p className="text-green-400 text-xs">Effekt: {item.effect}</p>
            <p className="text-gray-500 text-xs mt-1">Parameter: {item.param}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 6: FINE-TUNING METHODEN
// ════════════════════════════════════════════════════════════════

function FullFineTuningSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title="Full Fine-Tuning" subtitle="Alle Parameter eines vortrainierten Modells anpassen" />

      <P>
        Beim <Highlight>Full Fine-Tuning</Highlight> werden alle Parameter des Basismodells 
        auf deinen spezifischen Datensatz trainiert. 
        Das ergibt die höchste Flexibilität, benötigt aber viel Speicher und mehr Daten.
      </P>

      <H2>Vor- und Nachteile</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">Vorteile</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Maximale Anpassungsfähigkeit</li>
            <li>✓ Beste Performance möglich</li>
            <li>✓ Gut für domänen-spezifische Aufgaben</li>
            <li>✓ Keine extra Adapter-Architektur nötig</li>
          </ul>
        </div>
        <div className="glass border border-red-400/20 rounded-xl p-5">
          <h3 className="text-red-400 font-bold mb-3">Nachteile</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✗ Sehr viel VRAM (26GB für 7B Modell)</li>
            <li>✗ Vergessen von Vorwissen (Catastrophic Forgetting)</li>
            <li>✗ Braucht mehr Daten für gute Ergebnisse</li>
            <li>✗ Viele Checkpoints = viel Speicherplatz</li>
          </ul>
        </div>
      </div>

      <H2>Catastrophic Forgetting</H2>
      <P>
        Ein kritisches Problem beim Full Fine-Tuning: Das Modell kann sein allgemeines Wissen "vergessen", 
        wenn es zu aggressiv auf spezifische Daten trainiert wird. 
        Gegenmaßnahme: <Highlight>niedrige Learning Rate</Highlight> und <Highlight>wenige Epochen</Highlight>.
      </P>

      <InfoBox type="info" title="Full Fine-Tuning vs. LoRA: Wann was?">
        Nutze Full Fine-Tuning wenn: Sehr viel VRAM verfügbar (24GB+), maximale Performance nötig, 
        Modell fundamental neu lernen soll. Nutze LoRA wenn: Standard-Hardware, 
        weniger Daten, schnelle Iteration wichtig.
      </InfoBox>
    </div>
  )
}

function LoRADeepSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title="LoRA im Detail" subtitle="Low-Rank Adaptation – der Schlüssel zu effizientem Fine-Tuning" />

      <P>
        <Highlight>LoRA (Low-Rank Adaptation)</Highlight>, eingeführt 2022 von Microsoft, 
        ist die wichtigste Technik für effizientes LLM Fine-Tuning. 
        Es reduziert trainierbare Parameter um 99%+ bei minimaler Performance-Einbuße.
      </P>

      <H2>Die Grundidee von LoRA</H2>
      <P>
        Statt die gesamte Gewichtsmatrix W zu modifizieren, friert LoRA W ein und fügt eine 
        <Highlight> Low-Rank Zerlegung</Highlight> hinzu: zwei kleine Matrizen A und B, 
        deren Produkt den Update darstellt.
      </P>
      <CodeBlock>{`Standard Training:
  W_neu = W_alt + ΔW  (ΔW hat selbe Größe wie W)
  Beispiel: 4096×4096 Matrix = 16.7 Mio. Parameter

LoRA:
  W_neu = W_alt + B × A  (B und A sind klein)
  Beispiel: 4096×r + r×4096 = 2 × 4096 × 16 = 131k Parameter
  
  Bei r=16: 16.7M → 131k trainierbare Parameter!
  Das sind 99.2% weniger Parameter!`}</CodeBlock>

      {/* LoRA Diagram */}
      <div className="glass border border-violet-400/20 rounded-xl p-4">
        <p className="text-sm text-violet-400 mb-3 font-semibold text-center">🔷 LoRA Architektur visualisiert</p>
        <svg viewBox="0 0 500 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Input */}
          <rect x="20" y="80" width="60" height="40" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5" rx="6"/>
          <text x="50" y="105" fill="#c4b5fd" fontSize="11" textAnchor="middle">Input x</text>
          {/* Main path (frozen) */}
          <path d="M80,100 L150,100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" markerEnd="url(#arr)"/>
          <rect x="150" y="65" width="100" height="70" fill="rgba(75,85,99,0.4)" stroke="rgba(107,114,128,0.5)" strokeWidth="1.5" rx="6"/>
          <text x="200" y="97" fill="rgba(209,213,219,0.6)" fontSize="11" textAnchor="middle">W (frozen)</text>
          <text x="200" y="112" fill="rgba(156,163,175,0.5)" fontSize="9" textAnchor="middle">d×d Matrix</text>
          <path d="M250,100 L310,100" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
          {/* LoRA path */}
          <path d="M80,100 L80,165 L150,165" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <rect x="150" y="148" width="55" height="35" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="1.5" rx="6"/>
          <text x="177" y="168" fill="#a78bfa" fontSize="10" textAnchor="middle">A</text>
          <text x="177" y="178" fill="rgba(167,139,250,0.6)" fontSize="8" textAnchor="middle">d×r</text>
          <path d="M205,165 L240,165" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <rect x="240" y="148" width="55" height="35" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="1.5" rx="6"/>
          <text x="267" y="168" fill="#a78bfa" fontSize="10" textAnchor="middle">B</text>
          <text x="267" y="178" fill="rgba(167,139,250,0.6)" fontSize="8" textAnchor="middle">r×d</text>
          <path d="M295,165 L340,165 L340,115" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
          {/* Plus */}
          <circle cx="330" cy="100" r="12" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5"/>
          <text x="330" y="105" fill="#4ade80" fontSize="14" textAnchor="middle">+</text>
          {/* Output */}
          <path d="M342,100 L400,100" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
          <rect x="400" y="80" width="80" height="40" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" rx="6"/>
          <text x="440" y="101" fill="#86efac" fontSize="10" textAnchor="middle">Output</text>
          <text x="440" y="114" fill="rgba(134,239,172,0.6)" fontSize="9" textAnchor="middle">W·x + BAx</text>
          {/* Labels */}
          <text x="177" y="145" fill="rgba(167,139,250,0.8)" fontSize="8" textAnchor="middle">🟣 trainierbar</text>
          <text x="200" y="60" fill="rgba(156,163,175,0.6)" fontSize="8" textAnchor="middle">🔒 eingefroren</text>
        </svg>
      </div>

      <H2>LoRA Hyperparameter erklärt</H2>
      <div className="space-y-4">
        {[
          {
            param: 'rank (r)',
            values: '4, 8, 16, 32, 64',
            desc: 'Rang der Adapter-Matrizen. Höher = mehr trainierbare Parameter = mehr Ausdrucksstärke. Geringerer Rang spart Speicher.',
            recommendation: 'r=8 oder r=16 für gute Balance. r=32 für anspruchsvolle Aufgaben.',
          },
          {
            param: 'alpha (α)',
            values: 'Typisch: 16, 32 (oft = 2×r)',
            desc: 'Skalierungsfaktor: LoRA-Update = (α/r) × BA × x. Höheres Alpha = stärker skalierter Update.',
            recommendation: 'α = r oder α = 2×r als Faustregel.',
          },
          {
            param: 'dropout',
            values: '0.0 bis 0.1',
            desc: 'Dropout innerhalb der LoRA-Adapter. Verhindert Overfitting in den Adaptern.',
            recommendation: '0.05 für Standard. 0 wenn Dataset groß.',
          },
          {
            param: 'target_modules',
            values: 'q_proj, v_proj, k_proj, o_proj...',
            desc: 'Welche Schichten des Modells werden mit LoRA angepasst. Attention-Schichten sind am effektivsten.',
            recommendation: 'Mindestens q_proj und v_proj. Alle Attention-Schichten für beste Performance.',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-violet-400/15 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold font-mono">{item.param}</h3>
              <code className="text-violet-300 text-xs">{item.values}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs">💡 {item.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function QLoRASection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Cpu className="w-9 h-9" />} title="QLoRA (4-bit Fine-Tuning)" subtitle="Noch effizienter: Quantisierung + LoRA kombiniert" />

      <P>
        <Highlight>QLoRA</Highlight> kombiniert LoRA mit 4-bit Quantisierung. 
        Das Basismodell wird in 4-bit geladen (statt 16-bit), die LoRA-Adapter bleiben in float16. 
        Ergebnis: Ein 70B Modell auf einer 48GB GPU finetunen!
      </P>

      <H2>QLoRA vs. LoRA vs. Full Fine-Tuning</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 py-3 pr-4">Methode</th>
              <th className="text-left text-gray-400 py-3 pr-4">VRAM (7B)</th>
              <th className="text-left text-gray-400 py-3 pr-4">Qualität</th>
              <th className="text-left text-gray-400 py-3">Geschwindigkeit</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {[
              { method: 'Full Fine-Tuning (fp32)', vram: '~28 GB', quality: '100%', speed: '⭐⭐⭐' },
              { method: 'Full Fine-Tuning (bf16)', vram: '~14 GB', quality: '99%', speed: '⭐⭐⭐' },
              { method: 'LoRA (fp16)', vram: '~8 GB', quality: '97%', speed: '⭐⭐⭐⭐' },
              { method: 'QLoRA (4-bit)', vram: '~4–5 GB', quality: '93–96%', speed: '⭐⭐⭐' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-300">{row.method}</td>
                <td className="py-3 pr-4 text-yellow-400">{row.vram}</td>
                <td className="py-3 pr-4 text-green-400">{row.quality}</td>
                <td className="py-3 text-gray-400">{row.speed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>NF4 Quantisierung – der Kern von QLoRA</H2>
      <P>
        QLoRA nutzt <Highlight>NF4 (4-bit NormalFloat)</Highlight>, eine speziell optimierte 4-bit Quantisierung 
        für normal-verteilte Gewichte (wie sie in Transformer-Modellen vorkommen). 
        Normale int4-Quantisierung würde mehr Qualität verlieren.
      </P>

      <InfoBox type="success" title="QLoRA für Consumer GPUs">
        Mit QLoRA kannst du LLaMA 7B auf einer 8GB GPU (RTX 3070/4060 Ti) fine-tunen. 
        Sogar 13B Modelle sind mit 16GB VRAM möglich. Das demokratisiert LLM-Training!
      </InfoBox>
    </div>
  )
}

function PEFTMethodenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Wand2 className="w-9 h-9" />} title="PEFT Methoden Übersicht" subtitle="Parameter-Efficient Fine-Tuning im Vergleich" />

      <P>
        <Highlight>PEFT (Parameter-Efficient Fine-Tuning)</Highlight> ist der Oberbegriff für alle Methoden, 
        die nur einen Bruchteil der Modellparameter trainieren. LoRA ist die populärste, aber nicht die einzige.
      </P>

      <H2>PEFT Methoden im Vergleich</H2>
      <div className="space-y-4">
        {[
          {
            name: 'LoRA ⭐ (Low-Rank Adaptation)',
            trainable: '~0.1–1%',
            memory: 'Sehr gut',
            quality: 'Sehr gut',
            desc: 'Fügt trainierbare Low-Rank Matrizen zu Attention-Schichten hinzu. Standard für LLM Fine-Tuning.',
            color: 'border-violet-400/20',
          },
          {
            name: 'Prefix Tuning',
            trainable: '~0.1%',
            memory: 'Gut',
            quality: 'Gut',
            desc: 'Fügt trainierbare "Prefix"-Tokens am Anfang der Eingabe hinzu. Kein Eingriff in Modellgewichte.',
            color: 'border-blue-400/20',
          },
          {
            name: 'Prompt Tuning',
            trainable: '~0.01%',
            memory: 'Exzellent',
            quality: 'Moderat',
            desc: 'Nur Soft-Prompts (Input-Embeddings) werden trainiert. Extrem effizient, aber bei kleinen Modellen schwächer.',
            color: 'border-cyan-400/20',
          },
          {
            name: 'Adapter Layers',
            trainable: '~0.5–3%',
            memory: 'Gut',
            quality: 'Gut',
            desc: 'Kleine Feed-Forward-Netzwerke werden zwischen Transformer-Schichten eingefügt. Ältere Methode vor LoRA.',
            color: 'border-green-400/20',
          },
          {
            name: 'IA³',
            trainable: '~0.01%',
            memory: 'Exzellent',
            quality: 'Gut',
            desc: 'Trainiert nur Skalierungsvektoren für Keys, Values und Feed-Forward. Sehr effizient.',
            color: 'border-orange-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <h3 className="text-white font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="flex gap-4 text-xs">
              <span>Trainierbar: <Tag color="purple">{item.trainable}</Tag></span>
              <span>Speicher: <Tag color="blue">{item.memory}</Tag></span>
              <span>Qualität: <Tag color="green">{item.quality}</Tag></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WannWasSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Lightbulb className="w-9 h-9" />} title="Wann welche Fine-Tuning Methode?" subtitle="Der ultimative Entscheidungsbaum" />

      <H2>Entscheidungsbaum: Fine-Tuning Methode wählen</H2>
      <div className="space-y-4">
        {[
          {
            condition: 'Ich habe < 8 GB VRAM und will ein 7B+ Modell fine-tunen',
            answer: '→ QLoRA',
            detail: '4-bit Quantisierung + LoRA. 7B auf 4–5 GB VRAM möglich.',
            color: 'border-violet-400/20',
          },
          {
            condition: 'Ich habe 8–16 GB VRAM und will ein 7B Modell fine-tunen',
            answer: '→ LoRA (fp16)',
            detail: 'Standard-Empfehlung. r=8 oder r=16, LR=2e-4.',
            color: 'border-violet-400/20',
          },
          {
            condition: 'Ich habe 24+ GB VRAM und will maximale Performance',
            answer: '→ Full Fine-Tuning (bf16)',
            detail: 'Alle Parameter trainieren. Beste Ergebnisse möglich.',
            color: 'border-green-400/20',
          },
          {
            condition: 'Ich will mehrere Aufgaben fine-tunen ohne separate Modelle',
            answer: '→ LoRA (austauschbare Adapter)',
            detail: 'Ein Basismodell + verschiedene LoRA-Adapter für verschiedene Aufgaben.',
            color: 'border-blue-400/20',
          },
          {
            condition: 'Ich habe sehr wenig Daten (< 100 Beispiele)',
            answer: '→ LoRA mit kleinem Rank (r=4–8)',
            detail: 'Weniger Parameter = weniger Overfitting-Risiko.',
            color: 'border-yellow-400/20',
          },
          {
            condition: 'Ich will ein kleines BERT-Modell (< 400M) klassifizieren',
            answer: '→ Full Fine-Tuning möglich',
            detail: 'Kleine Modelle passen leicht in Speicher. Standard: LR=2e-5, 3 Epochen.',
            color: 'border-cyan-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <p className="text-gray-400 text-sm mb-2">{item.condition}</p>
            <p className="text-white font-bold text-lg">{item.answer}</p>
            <p className="text-gray-500 text-xs mt-1">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 7: DATASET MASTERY
// ════════════════════════════════════════════════════════════════

function DatenQualitaetSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Database className="w-9 h-9" />} title="Datenqualität & -menge" subtitle="Die wichtigste Grundlage für gutes Training" />

      <InfoBox type="warning" title="Garbage In, Garbage Out">
        Das beste Modell kann aus schlechten Daten keine guten Ergebnisse machen. 
        Datenqualität ist wichtiger als Modellgröße oder Hyperparameter.
      </InfoBox>

      <H2>Wieviel Daten brauche ich?</H2>
      <div className="space-y-2">
        {[
          { task: 'Binäre Klassifikation (gut/schlecht)', min: '100–500', good: '1.000–5.000', better: '10.000+' },
          { task: 'Multi-Klassen Klassifikation (10 Klassen)', min: '500–2.000', good: '5.000–20.000', better: '50.000+' },
          { task: 'Named Entity Recognition (NER)', min: '1.000', good: '5.000–10.000', better: '50.000+' },
          { task: 'Instruction Following (Chat)', min: '500–1.000', good: '5.000–10.000', better: '50.000+' },
          { task: 'Domain-Adaption (Text-Stil)', min: '100–500', good: '1.000–5.000', better: '10.000+' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid md:grid-cols-4 gap-2 text-sm">
            <span className="text-gray-300 md:col-span-1">{row.task}</span>
            <span className="text-yellow-400">Min: {row.min}</span>
            <span className="text-green-400">Gut: {row.good}</span>
            <span className="text-emerald-400">Ideal: {row.better}</span>
          </div>
        ))}
      </div>

      <H2>Datenqualitäts-Checkliste</H2>
      <div className="space-y-2">
        {[
          { check: 'Keine Duplikate im Dataset', how: 'Deduplizierung mit Hash oder semantischer Ähnlichkeit' },
          { check: 'Korrekte Labels / keine Fehler', how: 'Manuelle Stichproben prüfen, 5–10% des Datasets' },
          { check: 'Konsistente Formatierung', how: 'Einheitliche Spalten, Encoding (UTF-8), Trennzeichen' },
          { check: 'Keine beschädigten Einträge', how: 'Extrem kurze/lange Texte filtern, HTML-Tags entfernen' },
          { check: 'Ausgewogene Klassen', how: 'Imbalance messen, Oversampling/Undersampling anwenden' },
          { check: 'Representativer Inhalt', how: 'Testdaten sollten echter Nutzung entsprechen' },
        ].map((item, i) => (
          <div key={i} className="glass border border-green-400/15 rounded-lg p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">{item.check}</p>
              <p className="text-gray-500 text-xs mt-1">→ {item.how}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreprocessingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Settings className="w-9 h-9" />} title="Preprocessing" subtitle="Daten vorbereiten für optimales Training" />

      <P>
        Gutes <Highlight>Preprocessing</Highlight> kann die Performance eines Modells um 10–30% verbessern. 
        Es lohnt sich, Zeit hier zu investieren.
      </P>

      <H2>Text-Preprocessing Pipeline</H2>
      <CodeBlock>{`1. Encoding normalisieren:
   text = text.encode('utf-8', errors='ignore').decode('utf-8')

2. Whitespace normalisieren:
   text = ' '.join(text.split())

3. Sonderzeichen bereinigen:
   text = re.sub(r'[^\w\s\.,!?-]', '', text)

4. HTML Tags entfernen:
   text = BeautifulSoup(text, 'html.parser').get_text()

5. Extremlängen filtern:
   if len(text.split()) < 5 or len(text.split()) > 512:
       continue  # Skip

6. Labels normalisieren:
   label = label.strip().lower()`}</CodeBlock>

      <H2>Tokenisierung</H2>
      <P>
        <Highlight>Tokenisierung</Highlight> ist die Umwandlung von Text in Zahlen (Token IDs). 
        Jedes Modell hat seinen eigenen Tokenizer, der zum Basismodell passen muss.
      </P>
      <InfoBox type="warning" title="Wichtig: Immer den richtigen Tokenizer nutzen!">
        Nutze immer den Tokenizer des Basismodells. LLaMA-Tokenizer ≠ BERT-Tokenizer. 
        FrameTrain lädt den passenden Tokenizer automatisch mit dem Modell.
      </InfoBox>

      <H2>Sequenzlänge wählen</H2>
      <P>
        Die maximale <Highlight>Sequenzlänge (max_length)</Highlight> bestimmt, wie viel Text das Modell 
        auf einmal verarbeitet. Längere Sequenzen brauchen exponentiell mehr Speicher (Attention ist O(n²)).
      </P>
      <div className="space-y-2">
        {[
          { task: 'Kurze Klassifikation (Sätze)', length: '128', vram: 'Sehr wenig' },
          { task: 'Standard NLP (Absätze)', length: '256–512', vram: 'Normal' },
          { task: 'Lange Dokumente', length: '1.024–2.048', vram: 'Viel' },
          { task: 'LLM Chat (Konversation)', length: '2.048–4.096', vram: 'Sehr viel' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 flex justify-between text-sm">
            <span className="text-gray-400">{row.task}</span>
            <code className="text-violet-300">max_length = {row.length}</code>
            <span className="text-yellow-400">{row.vram}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AugmentationSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles className="w-9 h-9" />} title="Data Augmentation" subtitle="Künstliche Datenerweiterung für bessere Modelle" />

      <P>
        <Highlight>Data Augmentation</Highlight> erstellt neue Trainingsbeispiele aus bestehenden Daten. 
        Besonders wertvoll wenn echte Daten knapp sind.
      </P>

      <H2>Text-Augmentation Techniken</H2>
      <div className="space-y-4">
        {[
          {
            name: 'Back-Translation',
            desc: 'Text auf Englisch → Deutsch übersetzen → zurück übersetzen. Erzeugt semantisch ähnliche, aber sprachlich verschiedene Varianten.',
            example: '"Das Produkt ist gut" → "The product is good" → "Das Produkt ist hochwertig"',
            quality: 'Sehr hoch',
          },
          {
            name: 'Synonym-Replacement',
            desc: 'Wörter durch Synonyme ersetzen (z.B. via WordNet oder LLM). Einfach, aber kann Bedeutung verändern.',
            example: '"Das ist großartig" → "Das ist hervorragend"',
            quality: 'Mittel',
          },
          {
            name: 'LLM-Generierung',
            desc: 'Ein LLM generiert neue, ähnliche Beispiele basierend auf bestehenden. Aktuell beste Methode für NLP.',
            example: 'Prompt: "Generiere 10 ähnliche Sätze wie: [BEISPIEL]"',
            quality: 'Sehr hoch',
          },
          {
            name: 'Random Deletion/Swap',
            desc: 'Wörter zufällig löschen oder tauschen. Macht das Modell robuster gegen kleine Textfehler.',
            example: '"Das Produkt ist sehr gut" → "Produkt ist gut"',
            quality: 'Niedrig–Mittel',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <Tag color="green">Qualität: {item.quality}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <div className="bg-gray-900/60 rounded-lg p-3 text-xs text-gray-400 font-mono">
              Beispiel: {item.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BalancingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<BarChart3 className="w-9 h-9" />} title="Klassen-Balancing" subtitle="Unbalancierte Datasets handhaben" />

      <P>
        Ein <Highlight>unbalanciertes Dataset</Highlight> (z.B. 95% negative, 5% positive Beispiele) 
        führt dazu, dass das Modell die häufige Klasse bevorzugt. 
        Es lernt, "fast immer negativ" zu sagen – was einfach ist aber oft nutzlos.
      </P>

      <H2>Erkennung von Imbalance</H2>
      <CodeBlock>{`Klassenwerte zählen:
  import pandas as pd
  df = pd.read_csv('dataset.csv')
  print(df['label'].value_counts())

# Output:
# negative    950
# positive     50
# → Ratio: 19:1 → starke Imbalance!

# Faustregeln:
# Ratio < 3:1  → meist okay
# Ratio 3–10:1 → Balancing empfohlen
# Ratio > 10:1 → Balancing dringend nötig`}</CodeBlock>

      <H2>Lösungsstrategien</H2>
      <div className="space-y-4">
        {[
          {
            name: 'Oversampling (SMOTE / zufällig)',
            desc: 'Minderheitenklasse wird mehrfach verwendet oder neue synthetische Beispiele generiert.',
            use: 'Wenn Daten knapp. Einfach zu implementieren.',
            code: '# Zufälliges Oversampling:\ndf_minority = df[df.label=="positive"].sample(950, replace=True)\ndf_balanced = pd.concat([df, df_minority])',
          },
          {
            name: 'Undersampling',
            desc: 'Mehrheitsklasse wird auf Größe der Minderheitsklasse reduziert.',
            use: 'Wenn genug Daten vorhanden. Einfach, verliert Daten.',
            code: '# Undersampling:\ndf_majority = df[df.label=="negative"].sample(50)\ndf_balanced = pd.concat([df_majority, df_minority])',
          },
          {
            name: 'Class Weights',
            desc: 'Im Training werden seltene Klassen stärker gewichtet.',
            use: 'Keine Datenveränderung nötig. Direkt im Training.',
            code: '# Class Weights:\nclass_weights = {0: 1.0, 1: 19.0}  # 19:1 Ratio\n# FrameTrain: "Class Weighting" aktivieren',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-500 text-xs mb-3">Einsatz: {item.use}</p>
            <CodeBlock>{item.code}</CodeBlock>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// WELLE 8: FORTGESCHRITTENE TECHNIKEN
// ════════════════════════════════════════════════════════════════

function MixedPrecisionSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Zap className="w-9 h-9" />} title="Mixed Precision Training" subtitle="Schneller trainieren mit fp16 und bf16" />

      <P>
        <Highlight>Mixed Precision Training</Highlight> verwendet 16-bit statt 32-bit Fließkommazahlen. 
        Das halbiert den Speicherbedarf und beschleunigt das Training auf modernen GPUs um 2–3x.
      </P>

      <H2>fp32 vs. fp16 vs. bf16</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 py-3 pr-4">Format</th>
              <th className="text-left text-gray-400 py-3 pr-4">Bits</th>
              <th className="text-left text-gray-400 py-3 pr-4">Range</th>
              <th className="text-left text-gray-400 py-3">Empfehlung</th>
            </tr>
          </thead>
          <tbody>
            {[
              { format: 'float32 (fp32)', bits: '32 bit', range: '±3.4e38', rec: 'Sicher, aber langsam' },
              { format: 'float16 (fp16)', bits: '16 bit', range: '±65.504', rec: 'Schnell, aber Overflow-Risiko' },
              { format: 'bfloat16 (bf16)', bits: '16 bit', range: '±3.4e38 (≈fp32)', rec: '⭐ Beste Wahl (Ampere+ GPUs)' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 text-violet-300 font-mono">{row.format}</td>
                <td className="py-3 pr-4 text-gray-400">{row.bits}</td>
                <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{row.range}</td>
                <td className="py-3 text-green-400 text-xs">{row.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox type="info" title="bf16 ist der Gold-Standard">
        BFloat16 hat denselben Zahlenbereich wie fp32 (verhindert Overflow), 
        ist aber halb so groß. Verfügbar auf: NVIDIA Ampere (RTX 30xx, A100) und neuer, Apple M-Serie.
        Falls verfügbar: immer bf16 nutzen!
      </InfoBox>

      <H2>In FrameTrain aktivieren</H2>
      <P>
        FrameTrain wählt automatisch das beste Precision-Format für deine GPU. 
        Im Training Panel unter "Advanced Options" kannst du es manuell auf bf16, fp16 oder fp32 setzen.
      </P>
    </div>
  )
}

function GradientCheckpointingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Database className="w-9 h-9" />} title="Gradient Checkpointing" subtitle="Speicher sparen durch selektives Neuberechnen" />

      <P>
        <Highlight>Gradient Checkpointing</Highlight> ist eine Technik, die VRAM-Bedarf reduziert, 
        indem Aktivierungen nicht vollständig gespeichert, sondern bei Bedarf neu berechnet werden. 
        Kosten: ~20–30% langsameres Training.
      </P>

      <H2>Wie es funktioniert</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Normales Training</h3>
          <p className="text-gray-400 text-sm mb-2">Alle Zwischenaktivierungen werden im VRAM gespeichert für Backprop.</p>
          <p className="text-yellow-400 text-sm">→ Hoher Speicherbedarf, aber schnell</p>
        </div>
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">Mit Grad. Checkpointing</h3>
          <p className="text-gray-400 text-sm mb-2">Nur "Checkpoints" werden gespeichert. Rest wird beim Backprop neu berechnet.</p>
          <p className="text-green-400 text-sm">→ 40–60% weniger VRAM, 20–30% langsamer</p>
        </div>
      </div>

      <InfoBox type="success" title="Wann aktivieren?">
        Gradient Checkpointing lohnt sich immer wenn VRAM knapp ist. 
        Bei 8GB GPU und 7B Modell ist es praktisch obligatorisch. 
        FrameTrain aktiviert es automatisch wenn nötig.
      </InfoBox>

      <H2>Zusammenspiel der Speicher-Optimierungen</H2>
      <CodeBlock>{`Maximale Speicher-Ersparnis (Kombination):

  Basis 7B Modell (fp32):          ~28 GB VRAM
  + Mixed Precision (bf16):         ÷2 → ~14 GB
  + LoRA (nur Adapter trainieren):  ÷3 →  ~5 GB
  + Gradient Checkpointing:         -1 →  ~4 GB
  + Gradient Accumulation (BS=1):   -1 →  ~3–4 GB
  
  Ergebnis: 7B Fine-Tuning auf 4GB GPU möglich!`}</CodeBlock>
    </div>
  )
}

function EarlyStoppingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Target className="w-9 h-9" />} title="Early Stopping" subtitle="Training automatisch zum richtigen Zeitpunkt beenden" />

      <P>
        <Highlight>Early Stopping</Highlight> überwacht den Validation Loss und stoppt das Training automatisch, 
        wenn keine Verbesserung mehr stattfindet. Es lädt den besten Checkpoint.
      </P>

      <H2>Parameter verstehen</H2>
      <div className="space-y-3">
        {[
          {
            param: 'patience',
            desc: 'Wie viele Epochen ohne Verbesserung toleriert werden, bevor gestoppt wird.',
            values: 'Typisch: 3–5 Epochen',
            effect: 'Höher = mehr Toleranz für temporäre Verschlechterungen',
          },
          {
            param: 'min_delta',
            desc: 'Minimale Verbesserung um als "besser" zu zählen.',
            values: 'Typisch: 0.001–0.01',
            effect: 'Verhindert Stoppen bei minimalen Schwankungen',
          },
          {
            param: 'monitor',
            desc: 'Welche Metrik überwacht wird.',
            values: 'Meist: val_loss (empfohlen)',
            effect: 'val_loss ist robuster als val_accuracy',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold font-mono mb-1">{item.param}</h3>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <div className="flex gap-4 text-xs">
              <span>Wert: <code className="text-violet-300">{item.values}</code></span>
              <span className="text-gray-500">{item.effect}</span>
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="success" title="Early Stopping in FrameTrain">
        Aktiviere Early Stopping im Training Panel unter "Callbacks". 
        Empfehlung: patience=3, monitor="val_loss". 
        FrameTrain lädt automatisch den besten Checkpoint wenn gestoppt wird.
      </InfoBox>

      <H2>Best Practices</H2>
      <div className="space-y-2">
        {[
          'Überwache IMMER val_loss, nicht training_loss',
          'Patience von 3 ist Standard – genug um temporäre Spikes zu überleben',
          'Speichere immer den Best Checkpoint (save_best_only=True)',
          'Kombiniere mit Cosine LR Decay für beste Ergebnisse',
          'Nicht zu klein wählen – zu niedrige Patience stoppt Training zu früh',
        ].map((tip, i) => (
          <div key={i} className="glass border border-green-400/15 rounded-lg p-3 flex gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EnsemblesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<GitBranch className="w-9 h-9" />} title="Model Ensembles" subtitle="Mehrere Modelle kombinieren für bessere Performance" />

      <P>
        <Highlight>Ensembles</Highlight> kombinieren Vorhersagen mehrerer Modelle. 
        Das führt zu stabileren und besseren Ergebnissen als ein einzelnes Modell – 
        auf Kosten von mehr Rechenaufwand.
      </P>

      <H2>Ensemble-Methoden</H2>
      <div className="space-y-4">
        {[
          {
            name: 'Majority Voting',
            desc: 'Jedes Modell gibt eine Vorhersage. Die häufigste Klasse gewinnt.',
            use: 'Klassifikation',
            calc: '3 Modelle: [positiv, positiv, negativ] → positiv',
          },
          {
            name: 'Probability Averaging',
            desc: 'Wahrscheinlichkeiten werden gemittelt, dann die höchste Klasse gewählt.',
            use: 'Klassifikation mit Confidence',
            calc: '[0.8, 0.6, 0.4] → avg = 0.6 → positiv',
          },
          {
            name: 'Checkpoint Ensemble',
            desc: 'Verschiedene Checkpoints desselben Trainings werden kombiniert.',
            use: 'Günstig, kein separates Training nötig',
            calc: 'Checkpoints Epoch 8, 9, 10 mitteln',
          },
          {
            name: 'Stacking',
            desc: 'Meta-Modell lernt, die Outputs der Basis-Modelle zu kombinieren.',
            use: 'Wenn Basis-Modelle stark unterschiedlich sind',
            calc: 'Meta-Klassifikator auf Basis-Modell-Outputs trainieren',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <div className="flex gap-4 text-xs">
              <span>Einsatz: <Tag color="blue">{item.use}</Tag></span>
            </div>
            <p className="text-gray-500 text-xs mt-2 font-mono">Beispiel: {item.calc}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Ensemble mit FrameTrain">
        Du kannst mehrere FrameTrain-Versionen desselben Modells (mit verschiedenen Hyperparametern) 
        trainieren und ihre Checkpoints als Ensemble kombinieren. 
        Das ist besonders effektiv wenn du den besten Checkpoint speicherst und mehrere Läufe machst.
      </InfoBox>

      <div className="mt-8 p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-violet-400" />
          <h2 className="text-2xl font-black text-white">Du bist jetzt ein KI-Training Coach! 🎉</h2>
        </div>
        <p className="text-gray-400 mb-4">
          Du hast alle Grundlagen gemeistert: Von neuronalen Netzwerken über Loss-Kurven-Interpretation 
          bis hin zu fortgeschrittenen Techniken wie QLoRA und Mixed Precision. 
          Jetzt heißt es: ausprobieren, messen, iterieren.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs" className="px-4 py-2 bg-violet-600/20 border border-violet-400/30 rounded-lg text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-all flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            FrameTrain Docs
          </Link>
          <Link href="/docs/ai-training-guide" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Nochmal von Vorne
          </Link>
        </div>
      </div>
    </div>
  )
}


