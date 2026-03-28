'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight } from 'lucide-react'

// ─── Search Index ─────────────────────────────────────────────────────────────
// Every entry: { title, description, href, chapter, keywords[] }
const SEARCH_INDEX = [
  // ML Grundlagen
  { title: 'Was ist Machine Learning?', desc: 'ML-Grundlagen, Supervised/Unsupervised/RL, Glossar, Fine-Tuning vs. Pretraining', href: '/docs/ai-training-guide/ml-grundlagen', section: 'was-ist-ml', chapter: '🧠 ML Grundlagen', kw: ['machine learning', 'ml', 'supervised', 'unsupervised', 'reinforcement', 'modell', 'parameter', 'gewichte', 'training', 'inferenz', 'epoch', 'batch', 'loss', 'gradient'] },
  { title: 'Neuronale Netzwerke', desc: 'Aufbau, Schichten, Aktivierungsfunktionen, ReLU, GeLU, Embedding Layer', href: '/docs/ai-training-guide/ml-grundlagen', section: 'neuronale-netze', chapter: '🧠 ML Grundlagen', kw: ['neuron', 'neural network', 'netzwerk', 'relu', 'gelu', 'sigmoid', 'softmax', 'schicht', 'layer', 'aktivierung', 'embedding', 'dropout', 'residual', 'attention'] },
  { title: 'Transformer & LLMs', desc: 'Self-Attention, Multi-Head Attention, BERT, GPT, LLaMA, Mistral, VRAM-Bedarf', href: '/docs/ai-training-guide/ml-grundlagen', section: 'transformer', chapter: '🧠 ML Grundlagen', kw: ['transformer', 'attention', 'llm', 'bert', 'gpt', 'llama', 'mistral', 'phi', 'vram', 'parameter', 'self-attention', 'context length'] },
  { title: 'Wie KI "lernt"', desc: 'Backpropagation, Gradient Descent, Learning Rate, Vanishing Exploding Gradients', href: '/docs/ai-training-guide/ml-grundlagen', section: 'wie-ki-lernt', chapter: '🧠 ML Grundlagen', kw: ['backpropagation', 'gradient descent', 'learning rate', 'kettenregel', 'forward pass', 'backward pass', 'vanishing gradient', 'exploding gradient', 'sgd', 'momentum'] },
  // Training verstehen
  { title: 'Der Trainings-Loop', desc: 'Forward Pass, Loss, Backward Pass, Optimizer Step, Gradient Reset, Checkpoint', href: '/docs/ai-training-guide/training-verstehen', section: 'training-loop', chapter: '📊 Training verstehen', kw: ['training loop', 'forward pass', 'backward pass', 'optimizer step', 'zero grad', 'checkpoint', 'epoch', 'batch', 'steps', 'gradient accumulation', 'eval mode', 'train mode'] },
  { title: 'Loss-Funktionen', desc: 'Cross-Entropy, MSE, MAE, Binary Cross-Entropy, Huber Loss, KL-Divergenz', href: '/docs/ai-training-guide/training-verstehen', section: 'loss-funktionen', chapter: '📊 Training verstehen', kw: ['loss funktion', 'cross entropy', 'mse mean squared error', 'mae', 'binary cross entropy', 'huber loss', 'kl divergenz', 'verlustfunktion', 'label smoothing'] },
  { title: 'Metriken & Auswertung', desc: 'Accuracy, Precision, Recall, F1-Score, Perplexity, BLEU, ROUGE', href: '/docs/ai-training-guide/training-verstehen', section: 'metriken', chapter: '📊 Training verstehen', kw: ['accuracy', 'precision', 'recall', 'f1 score', 'perplexity', 'bleu', 'rouge', 'metriken', 'confusion matrix', 'tp fp fn tn'] },
  { title: 'Train / Val / Test Split', desc: 'Datensatz aufteilen, Stratified Split, K-Fold, Data Leakage vermeiden', href: '/docs/ai-training-guide/training-verstehen', section: 'train-val-test', chapter: '📊 Training verstehen', kw: ['train val test split', 'validation set', 'test set', 'stratified split', 'k-fold', 'data leakage', 'datensatz aufteilen'] },
  // Trainingsverlauf
  { title: 'Loss-Kurven interpretieren', desc: 'Training Loss, Validation Loss, Achsen lesen, 4 Muster erkennen', href: '/docs/ai-training-guide/trainingsverlauf', section: 'loss-kurven', chapter: '📈 Trainingsverlauf lesen', kw: ['loss kurve', 'training loss', 'validation loss', 'loss kurven interpretieren', 'diagramm', 'loss wert', 'training monitoring'] },
  { title: 'Gutes Training erkennen', desc: 'Checkliste: Beide Losses sinken, kleiner Gap, Plateau, keine Spikes', href: '/docs/ai-training-guide/trainingsverlauf', section: 'gutes-training', chapter: '📈 Trainingsverlauf lesen', kw: ['gutes training', 'training checkliste', 'validation loss sinkt', 'generalisierung', 'training plateau', 'generalisierungs gap'] },
  { title: 'Overfitting erkennen', desc: 'Training Loss sinkt, Validation Loss steigt – Ursachen und Erkennung', href: '/docs/ai-training-guide/trainingsverlauf', section: 'overfitting', chapter: '📈 Trainingsverlauf lesen', kw: ['overfitting', 'validation loss steigt', 'training loss sinkt', 'generalisierung', 'memorieren', 'overfitting diagramm'] },
  { title: 'Underfitting erkennen', desc: 'Beide Losses bleiben hoch – Stagnation, zu wenige Epochen, zu kleines Modell', href: '/docs/ai-training-guide/trainingsverlauf', section: 'underfitting', chapter: '📈 Trainingsverlauf lesen', kw: ['underfitting', 'loss stagniert', 'beide losses hoch', 'modell zu simpel', 'zu wenige epochen', 'underfitting diagramm'] },
  { title: 'Instabiles Training', desc: 'Loss-Spikes, Oszillation, Gradient Explosion (NaN), Ursachen & Fixes', href: '/docs/ai-training-guide/trainingsverlauf', section: 'instabiles-training', chapter: '📈 Trainingsverlauf lesen', kw: ['instabiles training', 'loss spike', 'oszillation', 'gradient explosion', 'nan inf loss', 'loss springt'] },
  // Diagnose & Fixes
  { title: 'Overfitting bekämpfen', desc: 'Mehr Daten, Early Stopping, Dropout, Weight Decay, LR reduzieren – nach Effektivität sortiert', href: '/docs/ai-training-guide/diagnose', section: 'overfitting-fix', chapter: '🩺 Diagnose & Fixes', kw: ['overfitting bekämpfen', 'overfitting lösung', 'early stopping', 'dropout erhöhen', 'weight decay', 'data augmentation', 'regularisierung'] },
  { title: 'Underfitting beheben', desc: 'LR erhöhen, mehr Epochen, größeres Modell, Datenformat prüfen', href: '/docs/ai-training-guide/diagnose', section: 'underfitting-fix', chapter: '🩺 Diagnose & Fixes', kw: ['underfitting beheben', 'learning rate erhöhen', 'mehr epochen', 'größeres modell', 'underfitting lösung'] },
  { title: 'Learning Rate Probleme', desc: 'LR zu groß (Chaos), LR zu klein (kein Fortschritt), LR Range Test, Faustregeln', href: '/docs/ai-training-guide/diagnose', section: 'lr-probleme', chapter: '🩺 Diagnose & Fixes', kw: ['learning rate probleme', 'lr zu groß', 'lr zu klein', 'lr range test', 'learning rate finden', 'learning rate fine-tuning werte'] },
  { title: 'Loss Spikes & Crashes', desc: 'Ursachen: schlechter Batch, Gradient Explosion – Gradient Clipping, LR anpassen', href: '/docs/ai-training-guide/diagnose', section: 'loss-spike', chapter: '🩺 Diagnose & Fixes', kw: ['loss spike', 'gradient explosion', 'nan loss', 'gradient clipping', 'loss crash', 'training abgebrochen'] },
  // Hyperparameter
  { title: 'Learning Rate (vertieft)', desc: 'Auswirkungen, Empfehlungen für BERT/LLaMA/LoRA, Linear Scaling Rule', href: '/docs/ai-training-guide/hyperparameter', section: 'learning-rate-deep', chapter: '⚙️ Hyperparameter', kw: ['learning rate', 'lernrate', 'lr werte', 'bert learning rate', 'llama learning rate', 'lora learning rate', 'linear scaling rule'] },
  { title: 'LR Scheduler Strategien', desc: 'Warmup, Cosine Decay, Linear Decay, ReduceLROnPlateau, Cosine Restarts', href: '/docs/ai-training-guide/hyperparameter', section: 'lr-scheduler', chapter: '⚙️ Hyperparameter', kw: ['lr scheduler', 'cosine decay', 'warmup', 'linear decay', 'reduceLRonPlateau', 'lernrate anpassen', 'cosine annealing'] },
  { title: 'Batch Size & Gradient Accumulation', desc: 'Kleine vs. große Batches, Gradient Accumulation, Empfehlungen nach GPU', href: '/docs/ai-training-guide/hyperparameter', section: 'batch-size-deep', chapter: '⚙️ Hyperparameter', kw: ['batch size', 'gradient accumulation', 'batch größe gpu', 'effektive batch size', 'vram batch'] },
  { title: 'Optimizer Vergleich', desc: 'AdamW, SGD, Adam, Adafactor – welcher für welche Aufgabe?', href: '/docs/ai-training-guide/hyperparameter', section: 'optimizer-vergleich', chapter: '⚙️ Hyperparameter', kw: ['optimizer', 'adamw', 'sgd', 'adam', 'adafactor', 'optimizer vergleich', 'weight decay optimizer'] },
  { title: 'Regularisierung', desc: 'L2 / Weight Decay, Dropout, Label Smoothing, Data Augmentation', href: '/docs/ai-training-guide/hyperparameter', section: 'regularisierung', chapter: '⚙️ Hyperparameter', kw: ['regularisierung', 'l2 regularisierung', 'weight decay', 'dropout', 'label smoothing', 'regularization ml'] },
  // Fine-Tuning
  { title: 'Full Fine-Tuning', desc: 'Alle Parameter trainieren, VRAM-Bedarf, Catastrophic Forgetting', href: '/docs/ai-training-guide/fine-tuning', section: 'full-finetuning', chapter: '🔧 Fine-Tuning Methoden', kw: ['full fine tuning', 'alle parameter trainieren', 'catastrophic forgetting', 'full ft vram'] },
  { title: 'LoRA im Detail', desc: 'Low-Rank Adaptation, Rank r, Alpha, Target Modules, 99% weniger Parameter', href: '/docs/ai-training-guide/fine-tuning', section: 'lora-deep', chapter: '🔧 Fine-Tuning Methoden', kw: ['lora', 'low rank adaptation', 'lora rank', 'lora alpha', 'target modules', 'q_proj v_proj', 'lora adapter', 'peft lora'] },
  { title: 'QLoRA (4-bit)', desc: 'Quantisierung + LoRA, NF4, 4-bit Training auf Consumer GPUs', href: '/docs/ai-training-guide/fine-tuning', section: 'qlora', chapter: '🔧 Fine-Tuning Methoden', kw: ['qlora', '4-bit quantisierung', 'nf4', 'qlora training', '4 bit fine tuning', 'consumer gpu llm'] },
  { title: 'PEFT Übersicht', desc: 'LoRA, Prefix Tuning, Prompt Tuning, Adapter Layers, IA³ im Vergleich', href: '/docs/ai-training-guide/fine-tuning', section: 'peft-methoden', chapter: '🔧 Fine-Tuning Methoden', kw: ['peft', 'parameter efficient fine tuning', 'prefix tuning', 'prompt tuning', 'adapter layers', 'ia3'] },
  { title: 'Wann welche Methode?', desc: 'Entscheidungsbaum: VRAM < 8GB → QLoRA, 8-16GB → LoRA, 24GB+ → Full FT', href: '/docs/ai-training-guide/fine-tuning', section: 'wann-was', chapter: '🔧 Fine-Tuning Methoden', kw: ['welche fine tuning methode', 'entscheidungsbaum fine tuning', 'lora vs qlora', 'wann lora wann qlora', 'fine tuning methode wählen'] },
  // Dataset
  { title: 'Datenqualität & -menge', desc: 'Wie viele Daten brauche ich? Qualitäts-Checkliste, Duplikate, Labels prüfen', href: '/docs/ai-training-guide/dataset-mastery', section: 'daten-qualitaet', chapter: '📦 Dataset-Mastery', kw: ['datenqualität', 'wie viele daten fine tuning', 'duplikate dataset', 'labels prüfen', 'garbage in garbage out', 'dataset größe'] },
  { title: 'Preprocessing', desc: 'Text-Preprocessing Pipeline, Tokenisierung, max_length, Sonderzeichen', href: '/docs/ai-training-guide/dataset-mastery', section: 'preprocessing', chapter: '📦 Dataset-Mastery', kw: ['preprocessing', 'text preprocessing', 'tokenisierung', 'max length', 'tokenizer', 'sequenzlänge', 'text bereinigung'] },
  { title: 'Data Augmentation', desc: 'Back-Translation, Synonym-Replacement, LLM-Generierung, Random Deletion', href: '/docs/ai-training-guide/dataset-mastery', section: 'augmentation', chapter: '📦 Dataset-Mastery', kw: ['data augmentation', 'text augmentation', 'back translation', 'synonym replacement', 'llm datengenerierung', 'dataset erweitern'] },
  { title: 'Klassen-Balancing', desc: 'Imbalance erkennen, Oversampling, Undersampling, Class Weights', href: '/docs/ai-training-guide/dataset-mastery', section: 'balancing', chapter: '📦 Dataset-Mastery', kw: ['klassen balancing', 'imbalanced dataset', 'oversampling', 'undersampling', 'class weights', 'smote', 'klassenungleichgewicht'] },
  // Fortgeschrittene
  { title: 'Mixed Precision Training', desc: 'fp32, fp16, bf16 – Unterschiede, VRAM-Ersparnis, wann bf16 nutzen', href: '/docs/ai-training-guide/fortgeschrittene', section: 'mixed-precision', chapter: '🚀 Fortgeschrittene Techniken', kw: ['mixed precision', 'fp16', 'bf16', 'bfloat16', 'float16', 'mixed precision training', 'vram halbieren', 'amp'] },
  { title: 'Gradient Checkpointing', desc: 'Aktivierungen nicht speichern – 40-60% VRAM sparen auf Kosten von 20-30% Speed', href: '/docs/ai-training-guide/fortgeschrittene', section: 'gradient-checkpointing', chapter: '🚀 Fortgeschrittene Techniken', kw: ['gradient checkpointing', 'vram sparen', 'aktivierungen speichern', 'speicher optimierung training'] },
  { title: 'Early Stopping', desc: 'Patience, min_delta, monitor val_loss – Training optimal stoppen', href: '/docs/ai-training-guide/fortgeschrittene', section: 'early-stopping', chapter: '🚀 Fortgeschrittene Techniken', kw: ['early stopping', 'patience', 'val loss monitor', 'training stoppen', 'bester checkpoint', 'save best only'] },
  { title: 'Model Ensembles', desc: 'Majority Voting, Probability Averaging, Checkpoint Ensembles, Stacking', href: '/docs/ai-training-guide/fortgeschrittene', section: 'ensembles', chapter: '🚀 Fortgeschrittene Techniken', kw: ['model ensembles', 'ensemble methoden', 'majority voting', 'checkpoint ensemble', 'stacking', 'modell kombination'] },
]

interface Result {
  title: string
  desc: string
  href: string
  section: string
  chapter: string
}

function search(query: string): Result[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return SEARCH_INDEX
    .filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q) ||
      item.kw.some(k => k.includes(q))
    )
    .slice(0, 8)
}

export function DocSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const router = useRouter()
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

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  function navigate(result: Result) {
    setOpen(false)
    setQuery('')
    router.push(`${result.href}?section=${result.section}`)
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      {/* Search trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="w-full flex items-center gap-3 px-4 py-3 glass border border-white/10 rounded-xl text-gray-400 hover:border-violet-400/30 hover:text-gray-300 transition-all text-sm"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Suche in Docs... (LoRA, Loss, Optimizer…)</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded text-gray-500">⌘K</kbd>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 glass-strong border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Suchen… z.B. LoRA, Overfitting, Batch Size"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && query.trim() && (
              <p className="text-gray-500 text-sm text-center py-8">Keine Ergebnisse für „{query}"</p>
            )}
            {results.length === 0 && !query.trim() && (
              <div className="px-4 py-4">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Beliebte Themen</p>
                <div className="flex flex-wrap gap-2">
                  {['LoRA', 'Overfitting', 'Loss Kurven', 'Learning Rate', 'QLoRA', 'Gradient Descent', 'Batch Size'].map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-violet-500/10 border border-violet-400/20 rounded-lg text-violet-300 text-xs hover:bg-violet-500/20 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => navigate(result)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-gray-500 text-xs">{result.chapter}</span>
                  </div>
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
