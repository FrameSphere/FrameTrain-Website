'use client'

import React from 'react'
import Link from 'next/link'
import {
  Brain, BarChart3, TrendingUp, Activity, Settings,
  Layers, Database, Rocket, ChevronRight, CheckCircle2,
  AlertTriangle, Info, ArrowLeft, ArrowRight
} from 'lucide-react'

// ─── Chapter Config ──────────────────────────────────────────────────────────

export const CHAPTERS = [
  {
    id: 'ml-grundlagen',
    emoji: '🧠',
    title: 'ML Grundlagen',
    href: '/docs/ai-training-guide/ml-grundlagen',
    color: 'violet',
    items: [
      { id: 'was-ist-ml', title: 'Was ist Machine Learning?' },
      { id: 'neuronale-netze', title: 'Neuronale Netzwerke' },
      { id: 'transformer', title: 'Transformer & LLMs' },
      { id: 'wie-ki-lernt', title: 'Wie KI "lernt"' },
    ],
  },
  {
    id: 'training-verstehen',
    emoji: '📊',
    title: 'Training verstehen',
    href: '/docs/ai-training-guide/training-verstehen',
    color: 'blue',
    items: [
      { id: 'training-loop', title: 'Der Trainings-Loop' },
      { id: 'loss-funktionen', title: 'Loss-Funktionen' },
      { id: 'metriken', title: 'Metriken & Auswertung' },
      { id: 'train-val-test', title: 'Train / Val / Test Split' },
    ],
  },
  {
    id: 'trainingsverlauf',
    emoji: '📈',
    title: 'Trainingsverlauf lesen',
    href: '/docs/ai-training-guide/trainingsverlauf',
    color: 'cyan',
    items: [
      { id: 'loss-kurven', title: 'Loss-Kurven interpretieren' },
      { id: 'gutes-training', title: 'Gutes Training erkennen' },
      { id: 'overfitting', title: 'Overfitting erkennen' },
      { id: 'underfitting', title: 'Underfitting erkennen' },
      { id: 'instabiles-training', title: 'Instabiles Training' },
    ],
  },
  {
    id: 'diagnose',
    emoji: '🩺',
    title: 'Diagnose & Fixes',
    href: '/docs/ai-training-guide/diagnose',
    color: 'red',
    items: [
      { id: 'overfitting-fix', title: 'Overfitting bekämpfen' },
      { id: 'underfitting-fix', title: 'Underfitting beheben' },
      { id: 'lr-probleme', title: 'Learning Rate Probleme' },
      { id: 'loss-spike', title: 'Loss Spikes & Crashes' },
    ],
  },
  {
    id: 'hyperparameter',
    emoji: '⚙️',
    title: 'Hyperparameter-Coaching',
    href: '/docs/ai-training-guide/hyperparameter',
    color: 'orange',
    items: [
      { id: 'learning-rate-deep', title: 'Learning Rate (vertieft)' },
      { id: 'lr-scheduler', title: 'LR Scheduler Strategien' },
      { id: 'batch-size-deep', title: 'Batch Size & Grad. Acc.' },
      { id: 'optimizer-vergleich', title: 'Optimizer Vergleich' },
      { id: 'regularisierung', title: 'Regularisierung' },
    ],
  },
  {
    id: 'fine-tuning',
    emoji: '🔧',
    title: 'Fine-Tuning Methoden',
    href: '/docs/ai-training-guide/fine-tuning',
    color: 'pink',
    items: [
      { id: 'full-finetuning', title: 'Full Fine-Tuning' },
      { id: 'lora-deep', title: 'LoRA im Detail' },
      { id: 'qlora', title: 'QLoRA (4-bit)' },
      { id: 'peft-methoden', title: 'PEFT Übersicht' },
      { id: 'wann-was', title: 'Wann welche Methode?' },
    ],
  },
  {
    id: 'dataset-mastery',
    emoji: '📦',
    title: 'Dataset-Mastery',
    href: '/docs/ai-training-guide/dataset-mastery',
    color: 'green',
    items: [
      { id: 'daten-qualitaet', title: 'Datenqualität & -menge' },
      { id: 'preprocessing', title: 'Preprocessing' },
      { id: 'augmentation', title: 'Data Augmentation' },
      { id: 'balancing', title: 'Klassen-Balancing' },
    ],
  },
  {
    id: 'fortgeschrittene',
    emoji: '🚀',
    title: 'Fortgeschrittene Techniken',
    href: '/docs/ai-training-guide/fortgeschrittene',
    color: 'fuchsia',
    items: [
      { id: 'mixed-precision', title: 'Mixed Precision Training' },
      { id: 'gradient-checkpointing', title: 'Gradient Checkpointing' },
      { id: 'early-stopping', title: 'Early Stopping' },
      { id: 'ensembles', title: 'Model Ensembles' },
    ],
  },
]

// ─── Shared Layout ────────────────────────────────────────────────────────────

interface SubPageLayoutProps {
  currentChapterId: string
  activeSection: string
  setActiveSection: (id: string) => void
  children: React.ReactNode
}

export function SubPageLayout({ currentChapterId, activeSection, setActiveSection, children }: SubPageLayoutProps) {
  const currentIdx = CHAPTERS.findIndex(c => c.id === currentChapterId)
  const current = CHAPTERS[currentIdx]
  const prev = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null
  const next = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Sidebar ── */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="glass-strong rounded-2xl p-5 border border-white/10 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Back link */}
          <Link href="/docs/ai-training-guide" className="flex items-center gap-2 text-gray-500 hover:text-white text-xs mb-4 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Alle Kapitel
          </Link>

          {/* All chapters nav */}
          <div className="space-y-1 mb-5 pb-5 border-b border-white/10">
            {CHAPTERS.map((ch) => (
              <Link
                key={ch.id}
                href={ch.href}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                  ch.id === currentChapterId
                    ? 'bg-violet-500/20 text-violet-300 font-semibold border border-violet-400/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{ch.emoji}</span>
                <span>{ch.title}</span>
              </Link>
            ))}
          </div>

          {/* Current chapter sub-sections */}
          <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold px-2 mb-2">In diesem Kapitel</p>
          <div className="space-y-0.5">
            {current.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-2 py-2 rounded-lg text-xs transition-all ${
                  activeSection === item.id
                    ? 'bg-violet-500/15 text-violet-300 font-medium'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0">
        <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10">
          {children}
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between gap-4 mt-6">
          {prev ? (
            <Link href={prev.href} className="flex items-center gap-3 glass border border-white/10 rounded-xl p-4 hover:border-violet-400/30 transition-all group flex-1">
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-violet-400 transition-colors" />
              <div>
                <p className="text-gray-600 text-xs">Vorheriges</p>
                <p className="text-white font-semibold text-sm">{prev.emoji} {prev.title}</p>
              </div>
            </Link>
          ) : <div />}

          {next ? (
            <Link href={next.href} className="flex items-center gap-3 glass border border-white/10 rounded-xl p-4 hover:border-violet-400/30 transition-all group flex-1 justify-end text-right">
              <div>
                <p className="text-gray-600 text-xs">Nächstes</p>
                <p className="text-white font-semibold text-sm">{next.emoji} {next.title}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 transition-colors" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

export function InfoBox({ type, title, children }: { type: 'success' | 'warning' | 'info' | 'error'; title: string; children: React.ReactNode }) {
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

export function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
        <span className="text-violet-400">{icon}</span>
        {title}
      </h1>
      {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
    </div>
  )
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-white mt-10 mb-5">{children}</h2>
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-white mt-6 mb-3">{children}</h3>
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 leading-relaxed mb-4">{children}</p>
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-violet-300 font-semibold">{children}</span>
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <div className="bg-gray-900/80 border border-white/10 rounded-xl p-5 mb-4 overflow-x-auto">
      <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{children}</pre>
    </div>
  )
}

export function Tag({ children, color = 'purple' }: { children: React.ReactNode; color?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'cyan' }) {
  const colors: Record<string, string> = {
    purple: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
    green:  'bg-green-500/20 text-green-300 border-green-400/30',
    red:    'bg-red-500/20 text-red-300 border-red-400/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    blue:   'bg-blue-500/20 text-blue-300 border-blue-400/30',
    cyan:   'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
  }
  return <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded border ${colors[color]}`}>{children}</span>
}

// ─── SVG Diagrams ─────────────────────────────────────────────────────────────

export function GoodTrainingChart() {
  return (
    <div className="glass border border-white/10 rounded-xl p-4 mb-4">
      <p className="text-sm text-green-400 mb-3 font-semibold text-center">✅ Gutes Training – Ideal-Verlauf</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        {['1.0','0.6','0.3','0.1'].map((val, i) => (
          <text key={i} x="45" y={40 + i*53} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end">{val}</text>
        ))}
        <path d="M50,35 C80,35 100,50 130,75 C165,100 200,125 240,145 C290,162 340,170 400,173 C430,174 460,175 480,175"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M50,35 C80,35 100,50 130,75 C165,100 200,125 240,145 C290,162 340,170 400,173 C430,174 460,175 480,175 L480,200 L50,200 Z"
          fill="url(#trainGrad)"/>
        <path d="M50,45 C80,48 110,65 145,88 C180,112 215,135 255,152 C300,167 345,174 400,178 C430,179 460,180 480,180"
          fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,3" strokeLinecap="round"/>
        <rect x="55" y="20" width="12" height="3" fill="#8b5cf6" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
        <rect x="160" y="20" width="12" height="3" fill="#06b6d4" rx="1"/>
        <text x="177" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Validation Loss</text>
        <text x="370" y="165" fill="rgba(134,239,172,0.9)" fontSize="9">← kleiner Gap ✓</text>
      </svg>
    </div>
  )
}

export function OverfittingChart() {
  return (
    <div className="glass border border-red-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-red-400 mb-3 font-semibold text-center">⚠️ Overfitting – Training sinkt, Validation steigt</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        <path d="M50,40 C90,45 130,65 175,90 C215,110 260,130 310,148 C360,162 410,170 480,175"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M50,50 C90,55 130,72 175,90 C210,103 240,108 265,110 C290,112 310,118 340,128 C370,140 410,155 480,175"
          fill="none" stroke="#f87171" strokeWidth="2.5" strokeDasharray="6,3" strokeLinecap="round"/>
        <line x1="265" y1="30" x2="265" y2="195" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x="240" y="28" fill="rgba(251,191,36,0.8)" fontSize="9">Overfitting</text>
        <text x="236" y="37" fill="rgba(251,191,36,0.8)" fontSize="9">beginnt hier</text>
        <rect x="55" y="20" width="12" height="3" fill="#8b5cf6" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
        <rect x="160" y="20" width="12" height="3" fill="#f87171" rx="1"/>
        <text x="177" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Validation Loss ↑</text>
      </svg>
    </div>
  )
}

export function UnderfittingChart() {
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
        <path d="M50,45 C90,48 140,52 200,57 C260,63 330,67 400,70 C440,71 460,72 480,72"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M50,55 C90,59 140,63 200,68 C260,74 330,78 400,82 C440,83 460,84 480,84"
          fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,3" strokeLinecap="round"/>
        <text x="285" y="58" fill="rgba(251,146,60,0.9)" fontSize="9">beide Kurven stagnieren hoch</text>
        <rect x="55" y="20" width="12" height="3" fill="#8b5cf6" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
        <rect x="160" y="20" width="12" height="3" fill="#06b6d4" rx="1"/>
        <text x="177" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Validation Loss</text>
      </svg>
    </div>
  )
}

export function HighLRChart() {
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
        <path d="M50,60 L100,140 L150,50 L200,130 L250,60 L300,145 L350,55 L400,130 L450,75 L480,120"
          fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="200" y="35" fill="rgba(251,191,36,0.9)" fontSize="10">starke Schwankungen = LR zu groß</text>
        <rect x="55" y="20" width="12" height="3" fill="#fbbf24" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
      </svg>
    </div>
  )
}

export function LowLRChart() {
  return (
    <div className="glass border border-blue-400/20 rounded-xl p-4 mb-4">
      <p className="text-sm text-blue-400 mb-3 font-semibold text-center">⚠️ Learning Rate zu niedrig – kaum Fortschritt</p>
      <svg viewBox="0 0 500 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[40,80,120,160,200].map(y => (
          <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <line x1="50" y1="15" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <line x1="50" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <text x="260" y="218" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">Epochen →</text>
        <text x="18" y="108" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" transform="rotate(-90,18,108)">Loss ↓</text>
        <path d="M50,45 C100,46 170,48 240,52 C310,56 380,60 480,65"
          fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="200" y="35" fill="rgba(96,165,250,0.9)" fontSize="10">kaum Fortschritt – LR zu klein</text>
        <rect x="55" y="20" width="12" height="3" fill="#60a5fa" rx="1"/>
        <text x="72" y="24" fill="rgba(255,255,255,0.7)" fontSize="10">Training Loss</text>
      </svg>
    </div>
  )
}

export function LRSchedulerChart() {
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
        <path d="M50,160 L110,30 C180,30 200,32 240,50 C280,70 320,95 360,120 C400,143 440,155 480,160"
          fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="50" y="20" width="60" height="140" fill="rgba(167,139,250,0.08)" rx="2"/>
        <text x="80" y="17" fill="rgba(167,139,250,0.7)" fontSize="9" textAnchor="middle">Warmup</text>
        <text x="300" y="17" fill="rgba(167,139,250,0.7)" fontSize="9" textAnchor="middle">Cosine Decay</text>
        <rect x="55" y="7" width="12" height="3" fill="#a78bfa" rx="1"/>
        <text x="72" y="11" fill="rgba(255,255,255,0.7)" fontSize="10">Learning Rate</text>
      </svg>
    </div>
  )
}

export function LoRADiagram() {
  return (
    <div className="glass border border-violet-400/20 rounded-xl p-4">
      <p className="text-sm text-violet-400 mb-3 font-semibold text-center">🔷 LoRA Architektur visualisiert</p>
      <svg viewBox="0 0 500 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="80" width="60" height="40" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5" rx="6"/>
        <text x="50" y="105" fill="#c4b5fd" fontSize="11" textAnchor="middle">Input x</text>
        <path d="M80,100 L150,100" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <rect x="150" y="65" width="100" height="70" fill="rgba(75,85,99,0.4)" stroke="rgba(107,114,128,0.5)" strokeWidth="1.5" rx="6"/>
        <text x="200" y="97" fill="rgba(209,213,219,0.6)" fontSize="11" textAnchor="middle">W (frozen)</text>
        <text x="200" y="112" fill="rgba(156,163,175,0.5)" fontSize="9" textAnchor="middle">d×d Matrix</text>
        <path d="M250,100 L310,100" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <path d="M80,100 L80,165 L150,165" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <rect x="150" y="148" width="55" height="35" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="1.5" rx="6"/>
        <text x="177" y="168" fill="#a78bfa" fontSize="10" textAnchor="middle">A (d×r)</text>
        <path d="M205,165 L240,165" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <rect x="240" y="148" width="55" height="35" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="1.5" rx="6"/>
        <text x="267" y="168" fill="#a78bfa" fontSize="10" textAnchor="middle">B (r×d)</text>
        <path d="M295,165 L340,165 L340,115" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <circle cx="330" cy="100" r="12" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5"/>
        <text x="330" y="105" fill="#4ade80" fontSize="14" textAnchor="middle">+</text>
        <path d="M342,100 L400,100" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <rect x="400" y="80" width="80" height="40" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" rx="6"/>
        <text x="440" y="101" fill="#86efac" fontSize="10" textAnchor="middle">Output</text>
        <text x="440" y="114" fill="rgba(134,239,172,0.6)" fontSize="9" textAnchor="middle">W·x + BAx</text>
        <text x="177" y="145" fill="rgba(167,139,250,0.8)" fontSize="8" textAnchor="middle">🟣 trainierbar</text>
        <text x="200" y="60" fill="rgba(156,163,175,0.6)" fontSize="8" textAnchor="middle">🔒 eingefroren</text>
      </svg>
    </div>
  )
}

export function NNDiagram() {
  return (
    <div className="glass border border-white/10 rounded-xl p-4">
      <p className="text-sm text-gray-400 mb-3 font-semibold text-center">🧠 Vereinfachtes Neuronales Netz</p>
      <svg viewBox="0 0 500 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {[50,80,110,140,170].map((y,i) => (
          <circle key={i} cx="80" cy={y} r="14" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5"/>
        ))}
        {[60,90,120,150].map((y,i) => (
          <circle key={i} cx="210" cy={y} r="14" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        ))}
        {[60,90,120,150].map((y,i) => (
          <circle key={i} cx="340" cy={y} r="14" fill="rgba(196,181,253,0.2)" stroke="#c4b5fd" strokeWidth="1.5"/>
        ))}
        {[80,110,140].map((y,i) => (
          <circle key={i} cx="450" cy={y} r="14" fill="rgba(244,114,182,0.2)" stroke="#f472b6" strokeWidth="1.5"/>
        ))}
        {[50,110,170].map((y1,i) => [60,120].map((y2,j) => (
          <line key={`${i}${j}`} x1="94" y1={y1} x2="196" y2={y2} stroke="rgba(139,92,246,0.15)" strokeWidth="1"/>
        )))}
        {[60,120].map((y1,i) => [60,120].map((y2,j) => (
          <line key={`h${i}${j}`} x1="224" y1={y1} x2="326" y2={y2} stroke="rgba(167,139,250,0.15)" strokeWidth="1"/>
        )))}
        {[60,120].map((y1,i) => [80,110,140].map((y2,j) => (
          <line key={`o${i}${j}`} x1="354" y1={y1} x2="436" y2={y2} stroke="rgba(196,181,253,0.15)" strokeWidth="1"/>
        )))}
        <text x="80" y="196" fill="rgba(139,92,246,0.7)" fontSize="10" textAnchor="middle">Input</text>
        <text x="210" y="175" fill="rgba(167,139,250,0.7)" fontSize="10" textAnchor="middle">Hidden 1</text>
        <text x="340" y="175" fill="rgba(196,181,253,0.7)" fontSize="10" textAnchor="middle">Hidden 2</text>
        <text x="450" y="165" fill="rgba(244,114,182,0.7)" fontSize="10" textAnchor="middle">Output</text>
        <text x="155" y="108" fill="rgba(255,255,255,0.2)" fontSize="18" textAnchor="middle">→</text>
        <text x="285" y="108" fill="rgba(255,255,255,0.2)" fontSize="18" textAnchor="middle">→</text>
        <text x="400" y="108" fill="rgba(255,255,255,0.2)" fontSize="18" textAnchor="middle">→</text>
      </svg>
    </div>
  )
}

export function GradientDescentDiagram() {
  return (
    <div className="glass border border-white/10 rounded-xl p-4">
      <p className="text-sm text-gray-400 mb-3 font-semibold text-center">🏔 Gradient Descent: Den Loss-Berg hinuntersteigen</p>
      <svg viewBox="0 0 500 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lossLandscape" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.1)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </linearGradient>
        </defs>
        <path d="M30,40 C80,38 100,60 140,90 C170,112 185,175 250,185 C315,175 330,112 360,90 C400,60 420,38 470,40"
          fill="url(#lossLandscape)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"/>
        <circle cx="100" cy="62" r="6" fill="#f472b6"/>
        <circle cx="140" cy="90" r="6" fill="#f472b6"/>
        <circle cx="180" cy="135" r="6" fill="#f472b6"/>
        <circle cx="220" cy="168" r="6" fill="#f472b6"/>
        <circle cx="250" cy="182" r="8" fill="#4ade80" stroke="rgba(74,222,128,0.4)" strokeWidth="3"/>
        <path d="M103,65 L137,87" stroke="#f472b6" strokeWidth="1.5"/>
        <path d="M143,93 L177,132" stroke="#f472b6" strokeWidth="1.5"/>
        <path d="M183,138 L217,165" stroke="#f472b6" strokeWidth="1.5"/>
        <text x="85" y="55" fill="rgba(244,114,182,0.9)" fontSize="9">Start (hoher Loss)</text>
        <text x="240" y="197" fill="rgba(74,222,128,0.9)" fontSize="9" textAnchor="middle">Minimum ✓</text>
      </svg>
    </div>
  )
}

export function DataSplitDiagram() {
  return (
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
  )
}
