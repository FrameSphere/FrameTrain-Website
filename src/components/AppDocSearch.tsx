'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'

const APP_DOCS_INDEX = [
  // Erste Schritte
  { title: 'Installation', section: 'installation', chapter: '🚀 Erste Schritte', desc: 'Account erstellen, App herunterladen, API-Key einrichten, Systemanforderungen', kw: ['installation', 'installieren', 'download', 'setup', 'api key', 'registrieren', 'systemanforderungen', 'cuda', 'windows', 'macos', 'linux'] },
  { title: 'Quick Start (5 Min)', section: 'quick-start', chapter: '🚀 Erste Schritte', desc: 'In 5 Minuten zum ersten Modell: Anmelden, Modell wählen, Dataset hochladen, Training starten', kw: ['quick start', 'schnellstart', 'erste schritte', '5 minuten', 'tutorial', 'anfänger', 'einstieg'] },
  { title: 'Erstes Training', section: 'first-training', chapter: '🚀 Erste Schritte', desc: 'Daten vorbereiten, Modell importieren, Hyperparameter, Training überwachen', kw: ['erstes training', 'first training', 'anleitung', 'schritt für schritt', 'daten vorbereiten', 'hyperparameter', 'training starten'] },
  // App Features
  { title: 'Model Manager', section: 'model-manager', chapter: '✨ App-Features', desc: 'Modelle importieren von HuggingFace, lokalen Dateien oder URLs, Versionen verwalten', kw: ['model manager', 'modell importieren', 'huggingface import', 'modell verwalten', 'bert import', 'llama download'] },
  { title: 'Training Panel', section: 'training-panel', chapter: '✨ App-Features', desc: 'Training konfigurieren, Hyperparameter setzen, Presets nutzen, Training steuern (Pause/Stop)', kw: ['training panel', 'training konfigurieren', 'presets', 'pause training', 'stop training', 'hyperparameter einstellen'] },
  { title: 'Dataset Management', section: 'dataset-upload', chapter: '✨ App-Features', desc: 'CSV, JSON, JSONL, TXT hochladen, Dataset validieren, Best Practices', kw: ['dataset', 'daten hochladen', 'csv upload', 'json format', 'dataset management', 'trainingsdaten'] },
  { title: 'Analysis & Monitoring', section: 'analysis', chapter: '✨ App-Features', desc: 'Live-Metriken verfolgen: Training Loss, Validation Loss, Accuracy, Throughput, ETA', kw: ['analysis', 'monitoring', 'live metriken', 'loss verfolgen', 'accuracy live', 'training fortschritt', 'charts'] },
  { title: 'Model Testing', section: 'testing', chapter: '✨ App-Features', desc: 'Einzelne Predictions, Batch Testing, Confidence Scores, Modell-Versionen vergleichen', kw: ['model testing', 'modell testen', 'predictions', 'confidence score', 'batch testing', 'inferenz'] },
  { title: 'Version Management', section: 'versioning', chapter: '✨ App-Features', desc: 'Automatische Versionierung, Versionen klonen, History, Tags setzen', kw: ['version management', 'versionierung', 'checkpoint', 'modell versionen', 'history', 'klonen'] },
  // Training & ML
  { title: 'Training Grundlagen', section: 'training-basics', chapter: '🧠 Training & ML', desc: 'Fine-Tuning vs. Pretraining, Epochs, Loss & Accuracy verstehen', kw: ['training grundlagen', 'fine tuning', 'pretraining', 'epoch', 'loss', 'accuracy', 'was ist fine tuning'] },
  { title: 'Hyperparameter', section: 'hyperparameters', chapter: '🧠 Training & ML', desc: 'Learning Rate, Batch Size, Epochs, Weight Decay – Bedeutung, Defaults, Tipps', kw: ['hyperparameter', 'learning rate', 'batch size', 'epochs', 'weight decay', 'optimizer', 'parameter einstellen'] },
  { title: 'LoRA Fine-Tuning', section: 'lora-training', chapter: '🧠 Training & ML', desc: 'Was ist LoRA? LoRA vs. volles Training, Speicherbedarf, Konfiguration in FrameTrain', kw: ['lora', 'low rank adaptation', 'lora fine tuning', 'lora rank', 'lora alpha', 'speicher sparen', 'adapter'] },
  { title: 'Dataset Formate', section: 'datasets-format', chapter: '🧠 Training & ML', desc: 'CSV, JSON, JSONL Formate, Spaltenbezeichnungen, Best Practices, Beispiele', kw: ['dataset format', 'csv format', 'json format', 'jsonl', 'spalten', 'label spalte', 'text spalte', 'datenformat'] },
  { title: 'Live Monitoring', section: 'monitoring', chapter: '🧠 Training & ML', desc: 'Analysis Panel, Loss-Charts, Checkpoint-Speicherung, ETA, Training fortsetzen', kw: ['live monitoring', 'training beobachten', 'loss chart', 'checkpoint', 'training fortsetzen', 'eta', 'progress'] },
  // Erweiterte Themen
  { title: 'Performance Tuning', section: 'optimization', chapter: '⚙️ Erweiterte Themen', desc: 'Batch Size optimieren, LoRA für Speicher-Effizienz, Gradient Accumulation', kw: ['performance', 'optimierung', 'schneller trainieren', 'gradient accumulation', 'batch size optimieren', 'vram optimierung'] },
  { title: 'GPU Optimierung', section: 'gpu-setup', chapter: '⚙️ Erweiterte Themen', desc: 'NVIDIA CUDA Setup, Apple Silicon M1/M2/M3/M4, unterstützte GPUs', kw: ['gpu', 'nvidia', 'cuda', 'apple silicon', 'm1', 'm2', 'm3', 'm4', 'metal', 'rtx', 'gpu setup'] },
  { title: 'Model Export & Deploy', section: 'export', chapter: '⚙️ Erweiterte Themen', desc: 'PyTorch, SafeTensors, ONNX exportieren, FastAPI, HuggingFace Hub deployen', kw: ['export', 'deployen', 'onnx', 'safetensors', 'pytorch export', 'model deployment', 'api server', 'huggingface hub upload'] },
  { title: 'Problemlösung', section: 'troubleshooting', chapter: '⚙️ Erweiterte Themen', desc: 'GPU nicht erkannt, Out of Memory, Training langsam, schlechte Accuracy beheben', kw: ['troubleshooting', 'fehler', 'problem', 'gpu nicht erkannt', 'out of memory', 'oom', 'langsam', 'debugging', 'error'] },
  { title: 'Einstellungen & Config', section: 'settings', chapter: '⚙️ Erweiterte Themen', desc: 'GPU Device wählen, Auto Save, GPU Memory Limit, Workers', kw: ['einstellungen', 'settings', 'konfiguration', 'config', 'gpu device', 'auto save', 'memory limit'] },
  // Ressourcen
  { title: 'Themes & UI', section: 'themes', chapter: '🎨 Ressourcen', desc: 'Dark Themes (Midnight, Slate), Light Themes, UI personalisieren', kw: ['themes', 'ui', 'dark mode', 'light mode', 'design', 'aussehen', 'personalisieren'] },
  { title: 'Training Presets', section: 'presets', chapter: '🎨 Ressourcen', desc: 'Quick & Dirty, Balanced, Precision, Memory Efficient – vorgefertigte Konfigurationen', kw: ['presets', 'voreinstellungen', 'quick training', 'balanced preset', 'memory efficient preset', 'konfiguration vorlage'] },
  { title: 'Updates & Versioning', section: 'updates', chapter: '🎨 Ressourcen', desc: 'Auto-Update System, aktuelle Version prüfen, kostenlose Updates', kw: ['updates', 'update', 'neue version', 'aktualisieren', 'changelog', 'auto update'] },
]

interface Result {
  title: string
  desc: string
  section: string
  chapter: string
}

function search(query: string): Result[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return APP_DOCS_INDEX
    .filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q) ||
      item.kw.some(k => k.includes(q))
    )
    .slice(0, 8)
}

interface AppDocSearchProps {
  onNavigate: (section: string) => void
}

export function AppDocSearch({ onNavigate }: AppDocSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResults(search(query))
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(result: Result) {
    setOpen(false)
    setQuery('')
    onNavigate(result.section)
    // Scroll to top of content smoothly
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const popular = ['Installation', 'LoRA', 'GPU', 'Dataset', 'Out of Memory', 'Hyperparameter']

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="w-full flex items-center gap-3 px-4 py-3 glass border border-white/10 rounded-xl text-gray-400 hover:border-purple-400/30 hover:text-gray-300 transition-all text-sm"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Docs durchsuchen… (Installation, LoRA, GPU…)</span>
        <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded text-gray-500">⌘K</kbd>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 glass-strong border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="z.B. LoRA, GPU Setup, Out of Memory…"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Empty state – show popular */}
            {!query.trim() && (
              <div className="px-4 py-4">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Häufig gesucht</p>
                <div className="flex flex-wrap gap-2">
                  {popular.map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-purple-500/10 border border-purple-400/20 rounded-lg text-purple-300 text-xs hover:bg-purple-500/20 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Keine Ergebnisse für „{query}"</p>
            )}

            {/* Results */}
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs mb-0.5">{result.chapter}</p>
                  <p className="text-white text-sm font-semibold">{result.title}</p>
                  <p className="text-gray-500 text-xs truncate">{result.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
