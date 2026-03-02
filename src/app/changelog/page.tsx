import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sparkles, Zap, Bug, Shield, Rocket } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog – FrameTrain',
  description: 'Alle Updates, neuen Features und Bugfixes von FrameTrain. Bleib auf dem neuesten Stand mit unserem Changelog.',
  openGraph: {
    title: 'Changelog – FrameTrain',
    description: 'Alle Updates und neuen Features von FrameTrain.',
    images: ['/og-image.svg'],
  },
}

const releases = [
  {
    version: '0.9.2',
    date: '2025-01-15',
    tag: 'Early Access',
    tagColor: 'purple',
    highlights: ['QLoRA Support', 'Apple M4 Chip Optimierungen'],
    changes: [
      { type: 'feature', text: 'QLoRA (Quantized LoRA) vollständig integriert – Training jetzt auch auf GPUs mit 6GB VRAM' },
      { type: 'feature', text: 'Apple M4 Chip: Verbesserte MPS-Performance durch optimierte Metal-Shader' },
      { type: 'feature', text: 'Batch-Processing für Datensätze über 10.000 Einträge' },
      { type: 'improvement', text: 'Training Dashboard: Neue Verlust-Kurve mit Glättungsfilter (EMA)' },
      { type: 'improvement', text: 'HuggingFace Modell-Browser: Filterung nach Größe, Architektur, Lizenz' },
      { type: 'fix', text: 'Fixed: Gradient Checkpointing führte unter Windows zu Memory Leak' },
      { type: 'fix', text: 'Fixed: GGUF Export bei Modellen über 7B Parameter' },
    ],
  },
  {
    version: '0.9.1',
    date: '2024-12-10',
    tag: 'Early Access',
    tagColor: 'purple',
    highlights: ['Mixed Precision BF16', 'Datensatz-Validierung'],
    changes: [
      { type: 'feature', text: 'BF16 Mixed Precision Training für NVIDIA Ampere+ GPUs (RTX 3000 / RTX 4000 Series)' },
      { type: 'feature', text: 'Datensatz-Validierung: Automatische Erkennung fehlerhafter JSON/JSONL-Zeilen vor dem Training' },
      { type: 'feature', text: 'Checkpoint-Manager: Manuelle Auswahl des besten Checkpoints zum Export' },
      { type: 'improvement', text: 'Startup-Zeit um ~40% reduziert durch lazy loading der ML-Bibliotheken' },
      { type: 'improvement', text: 'CLI: Neue Flags --resume und --from-checkpoint für unterbrochene Trainings' },
      { type: 'fix', text: 'Fixed: LoRA-Adapter wurden beim Zusammenführen (merge) nicht korrekt normalisiert' },
      { type: 'security', text: 'Dependency-Updates: PyTorch 2.2.1, Transformers 4.38.x, Safetensors 0.4.x' },
    ],
  },
  {
    version: '0.9.0',
    date: '2024-11-01',
    tag: 'Early Access Launch',
    tagColor: 'green',
    highlights: ['Erster Public Release', 'LoRA Fine-Tuning', 'HuggingFace Integration'],
    changes: [
      { type: 'feature', text: '🚀 Erster öffentlicher Early Access Launch von FrameTrain' },
      { type: 'feature', text: 'LoRA Fine-Tuning: Rank, Alpha, Dropout und Target-Module konfigurierbar' },
      { type: 'feature', text: 'HuggingFace Hub Integration: Direkter Modell-Import über Suchfunktion' },
      { type: 'feature', text: 'Live Training Monitor: Echtzeit-Charts für Loss, Accuracy und Lernrate' },
      { type: 'feature', text: 'Model Versioning: Automatisches Checkpointing alle N Schritte' },
      { type: 'feature', text: 'Export: SafeTensors, PyTorch .bin, GGUF' },
      { type: 'feature', text: 'GPU Support: NVIDIA CUDA ab GTX 1060, Apple Silicon M1/M2/M3' },
      { type: 'feature', text: 'Datensatz-Import: CSV, JSON, JSONL, TXT' },
    ],
  },
]

function getChangeIcon(type: string) {
  switch (type) {
    case 'feature': return <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
    case 'improvement': return <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
    case 'fix': return <Bug className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
    case 'security': return <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
    default: return <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
  }
}

function getChangeLabel(type: string) {
  switch (type) {
    case 'feature': return 'New'
    case 'improvement': return 'Improved'
    case 'fix': return 'Fixed'
    case 'security': return 'Security'
    default: return 'Change'
  }
}

function getChangeLabelColor(type: string) {
  switch (type) {
    case 'feature': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    case 'improvement': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    case 'fix': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    case 'security': return 'text-green-400 bg-green-500/10 border-green-500/20'
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Changelog
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Alle Updates, neuen Features und Bugfixes – was sich in FrameTrain verändert hat.
            </p>
            <div className="mt-8 flex gap-6 justify-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>New Feature</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Improvement</span>
              </div>
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-orange-400" />
                <span>Bugfix</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Security</span>
              </div>
            </div>
          </div>
        </section>

        {/* Releases */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {releases.map((release) => (
              <article key={release.version} className="relative">
                {/* Version Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="glass-strong rounded-2xl px-6 py-4 border border-white/10 flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl font-black text-white">v{release.version}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          release.tagColor === 'green'
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                        }`}>
                          {release.tag}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(release.date).toLocaleDateString('de-DE', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Highlights */}
                  <div className="hidden md:flex flex-wrap gap-2">
                    {release.highlights.map((h) => (
                      <span key={h} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Changes */}
                <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {release.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                        {getChangeIcon(change.type)}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${getChangeLabelColor(change.type)}`}>
                          {getChangeLabel(change.type)}
                        </span>
                        <p className="text-gray-300 text-sm leading-relaxed">{change.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-strong rounded-3xl p-10 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Immer auf dem neuesten Stand</h2>
              <p className="text-gray-400 mb-6">
                FrameTrain erhält mit jeder Version automatisch Updates über den eingebauten Auto-Updater.
                Kein manuelles Herunterladen nötig.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="relative group px-6 py-3 rounded-xl overflow-hidden inline-block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <span className="relative text-white font-semibold">Jetzt starten</span>
                </Link>
                <Link
                  href="/docs"
                  className="glass-strong px-6 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold"
                >
                  Dokumentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
