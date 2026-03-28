import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Sparkles, ArrowRight, BookOpen } from 'lucide-react'

const chapters = [
  {
    id: 'ml-grundlagen',
    emoji: '🧠',
    title: 'ML Grundlagen',
    href: '/docs/ai-training-guide/ml-grundlagen',
    desc: 'Was ist Machine Learning? Neuronale Netzwerke, Transformer, LLMs, Backpropagation und wie KI wirklich lernt.',
    topics: ['Was ist ML?', 'Neuronale Netze', 'Transformer & LLMs', 'Gradient Descent'],
    color: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-400/20',
    accent: 'text-violet-400',
    num: '01',
  },
  {
    id: 'training-verstehen',
    emoji: '📊',
    title: 'Training verstehen',
    href: '/docs/ai-training-guide/training-verstehen',
    desc: 'Der Trainings-Loop Schritt für Schritt, Loss-Funktionen, Metriken wie Accuracy und F1, Dataset-Split.',
    topics: ['Trainings-Loop', 'Loss-Funktionen', 'Accuracy, F1, Perplexity', 'Train/Val/Test Split'],
    color: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-400/20',
    accent: 'text-blue-400',
    num: '02',
  },
  {
    id: 'trainingsverlauf',
    emoji: '📈',
    title: 'Trainingsverlauf lesen',
    href: '/docs/ai-training-guide/trainingsverlauf',
    desc: 'Loss-Kurven interpretieren, gutes Training erkennen, Overfitting und Underfitting diagnostizieren.',
    topics: ['Loss-Kurven', 'Gutes Training', 'Overfitting', 'Underfitting', 'Instabiles Training'],
    color: 'from-cyan-500/10 to-teal-500/5',
    border: 'border-cyan-400/20',
    accent: 'text-cyan-400',
    num: '03',
  },
  {
    id: 'diagnose',
    emoji: '🩺',
    title: 'Diagnose & Fixes',
    href: '/docs/ai-training-guide/diagnose',
    desc: 'Konkrete Maßnahmen gegen Overfitting, Underfitting beheben, LR-Probleme lösen, Loss Spikes stoppen.',
    topics: ['Overfitting bekämpfen', 'Underfitting beheben', 'LR-Probleme', 'Loss Spikes'],
    color: 'from-red-500/10 to-pink-500/5',
    border: 'border-red-400/20',
    accent: 'text-red-400',
    num: '04',
  },
  {
    id: 'hyperparameter',
    emoji: '⚙️',
    title: 'Hyperparameter-Coaching',
    href: '/docs/ai-training-guide/hyperparameter',
    desc: 'Learning Rate, LR Scheduler, Batch Size, Gradient Accumulation, Optimizer-Vergleich, Regularisierung.',
    topics: ['Learning Rate (vertieft)', 'LR Scheduler', 'Batch Size', 'AdamW vs SGD', 'Weight Decay'],
    color: 'from-orange-500/10 to-amber-500/5',
    border: 'border-orange-400/20',
    accent: 'text-orange-400',
    num: '05',
  },
  {
    id: 'fine-tuning',
    emoji: '🔧',
    title: 'Fine-Tuning Methoden',
    href: '/docs/ai-training-guide/fine-tuning',
    desc: 'Full Fine-Tuning, LoRA im Detail mit Architektur-Diagramm, QLoRA (4-bit), PEFT-Überblick, Entscheidungsbaum.',
    topics: ['Full Fine-Tuning', 'LoRA im Detail', 'QLoRA (4-bit)', 'PEFT Methoden', 'Wann welche Methode?'],
    color: 'from-pink-500/10 to-rose-500/5',
    border: 'border-pink-400/20',
    accent: 'text-pink-400',
    num: '06',
  },
  {
    id: 'dataset-mastery',
    emoji: '📦',
    title: 'Dataset-Mastery',
    href: '/docs/ai-training-guide/dataset-mastery',
    desc: 'Datenqualität, wie viel Daten brauche ich, Preprocessing-Pipeline, Data Augmentation, Klassen-Balancing.',
    topics: ['Datenqualität & -menge', 'Preprocessing', 'Data Augmentation', 'Klassen-Balancing'],
    color: 'from-green-500/10 to-emerald-500/5',
    border: 'border-green-400/20',
    accent: 'text-green-400',
    num: '07',
  },
  {
    id: 'fortgeschrittene',
    emoji: '🚀',
    title: 'Fortgeschrittene Techniken',
    href: '/docs/ai-training-guide/fortgeschrittene',
    desc: 'Mixed Precision (bf16/fp16), Gradient Checkpointing, Early Stopping, Model Ensembles.',
    topics: ['Mixed Precision (bf16)', 'Gradient Checkpointing', 'Early Stopping', 'Model Ensembles'],
    color: 'from-fuchsia-500/10 to-violet-500/5',
    border: 'border-fuchsia-400/20',
    accent: 'text-fuchsia-400',
    num: '08',
  },
]

export default function AITrainingGuideHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="max-w-5xl mx-auto text-center">
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
              in 8 ausführlichen Kapiteln. Alles, was du brauchst, um KI-Modelle zu verstehen und zu optimieren.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>8 Kapitel</span>
              <span>·</span>
              <span>38 Themen</span>
              <span>·</span>
              <span>Interaktive Diagramme</span>
              <span>·</span>
              <span>Code-Beispiele</span>
            </div>
          </div>
        </section>

        {/* Chapter Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {chapters.map((ch) => (
                <Link key={ch.id} href={ch.href} className="group block">
                  <div className={`glass border ${ch.border} rounded-2xl p-7 bg-gradient-to-br ${ch.color} hover:scale-[1.01] transition-all duration-200 hover:shadow-lg h-full`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ch.emoji}</span>
                        <div>
                          <p className={`text-xs font-bold ${ch.accent} mb-0.5 uppercase tracking-wider`}>Kapitel {ch.num}</p>
                          <h2 className="text-white font-black text-xl">{ch.title}</h2>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${ch.accent} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </div>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{ch.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {ch.topics.map((t) => (
                        <span key={t} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-500">{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <Link href="/docs/ai-training-guide/ml-grundlagen"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30">
                <BookOpen className="w-5 h-5" />
                Jetzt mit Kapitel 1 starten
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
