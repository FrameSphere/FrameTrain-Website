'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Zap, Database, Target, GitBranch, ChevronRight, CheckCircle2, BookOpen, ArrowRight, Brain } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag
} from '../_shared'

const CHAPTER_ID = 'fortgeschrittene'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function MixedPrecisionSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Zap className="w-9 h-9" />} title="Mixed Precision Training" subtitle="Schneller trainieren mit fp16 und bf16 – halbierter Speicher" />
      <P>
        <Highlight>Mixed Precision Training</Highlight> nutzt 16-bit statt 32-bit Fließkommazahlen 
        für den Großteil der Berechnungen. Das halbiert den Speicherbedarf und beschleunigt 
        Training auf modernen GPUs um 2–3×.
      </P>

      <H2>fp32 vs. fp16 vs. bf16 – der detaillierte Vergleich</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Format', 'Bits', 'Exp. Bits', 'Mantissa', 'Zahlenbereich', 'Präzision', 'Empfehlung'].map(h => (
                <th key={h} className="text-left text-gray-400 py-3 pr-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { f: 'float32', b: '32', e: '8', m: '23', range: '±3.4e38', prec: 'Sehr hoch', rec: 'Sicher, aber langsam', color: 'text-gray-300' },
              { f: 'float16', b: '16', e: '5', m: '10', range: '±65.504', prec: 'Mittel', rec: '⚠️ Overflow-Risiko', color: 'text-yellow-300' },
              { f: 'bfloat16', b: '16', e: '8', m: '7', range: '±3.4e38', prec: 'Niedrig-Mittel', rec: '⭐ Beste Wahl', color: 'text-green-300' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className={`py-3 pr-3 font-mono font-bold ${row.color}`}>{row.f}</td>
                <td className="py-3 pr-3 text-gray-400">{row.b}</td>
                <td className="py-3 pr-3 text-gray-400">{row.e}</td>
                <td className="py-3 pr-3 text-gray-400">{row.m}</td>
                <td className="py-3 pr-3 text-gray-400 font-mono text-xs">{row.range}</td>
                <td className="py-3 pr-3 text-gray-400">{row.prec}</td>
                <td className="py-3 text-xs text-gray-500">{row.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Warum bf16 besser ist als fp16</H2>
      <P>
        BFloat16 hat den <Highlight>gleichen Exponent-Bereich wie fp32</Highlight> (8 Bits Exponent), 
        aber weniger Mantissa-Bits. fp16 hat nur 5 Exponent-Bits → viel kleinerer Zahlenbereich → 
        Overflow bei großen Aktivierungen. bf16 löst dieses Problem.
      </P>
      <CodeBlock>{`fp16 Overflow-Problem:
  Wenn Aktivierungen > 65.504:
  → Overflow → NaN → Training bricht ab!
  Abhilfe: Loss Scaling (automatisch, aber komplex)

bf16 kein Overflow:
  Gleicher Zahlenbereich wie fp32
  → Kein Loss Scaling nötig
  → Einfacher, stabiler

GPU-Support für bf16:
  NVIDIA Ampere (RTX 30xx, A100): bf16 Hardware-Support ✓
  NVIDIA Turing (RTX 20xx, T4):   Nur fp16 Hardware ✗
  NVIDIA Volta (V100):             Nur fp16 Hardware ✗
  Apple Silicon (M1/M2/M3):       bf16 Hardware-Support ✓
  AMD RDNA3+:                      bf16 Hardware-Support ✓`}</CodeBlock>

      <H2>Automatic Mixed Precision (AMP)</H2>
      <P>
        Beim Mixed Precision Training werden nicht <em>alle</em> Berechnungen in 16-bit durchgeführt. 
        Einige kritische Operationen bleiben in fp32:
      </P>
      <CodeBlock>{`Mixed Precision Training – was in welcher Präzision:

  fp16/bf16 (schnell, wenig Speicher):
    ✓ Forward Pass (Aktivierungen)
    ✓ Backward Pass (Gradienten)
    ✓ Modell-Gewichte (Inference-Kopie)

  fp32 (sicher, genau):
    ✓ Master-Kopie der Gewichte (Optimizer States)
    ✓ Gewichts-Updates
    ✓ Loss Berechnung
    ✓ Batch Normalization (Statistiken)

  Ergebnis: ~2× weniger VRAM, 2–3× schneller
            bei minimalem Qualitätsverlust`}</CodeBlock>

      <H2>Speicherersparnis durch Mixed Precision</H2>
      <div className="space-y-2">
        {[
          { model: '7B Modell', fp32: '28 GB', fp16: '14 GB', bf16: '14 GB' },
          { model: '13B Modell', fp32: '52 GB', fp16: '26 GB', bf16: '26 GB' },
          { model: '1B Modell', fp32: '4 GB', fp16: '2 GB', bf16: '2 GB' },
          { model: '125M (BERT)', fp32: '0.5 GB', fp16: '0.25 GB', bf16: '0.25 GB' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-gray-300">{row.model}</span>
            <span className="text-red-400">{row.fp32} (fp32)</span>
            <span className="text-yellow-400">{row.fp16} (fp16)</span>
            <span className="text-green-400">{row.bf16} (bf16) ⭐</span>
          </div>
        ))}
      </div>

      <InfoBox type="success" title="In FrameTrain">
        FrameTrain wählt automatisch das beste Precision-Format basierend auf deiner GPU. 
        RTX 30xx/40xx und neuere: automatisch bf16. Ältere GPUs: fp16 oder fp32.
        Im "Advanced Settings" Panel kannst du es manuell überschreiben.
      </InfoBox>
    </div>
  )
}

function GradientCheckpointingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Database className="w-9 h-9" />} title="Gradient Checkpointing" subtitle="VRAM halbieren durch selektives Neuberechnen von Aktivierungen" />
      <P>
        <Highlight>Gradient Checkpointing</Highlight> (auch Activation Checkpointing) ist eine Technik, 
        die den VRAM-Bedarf auf Kosten von etwas Rechenzeit reduziert. 
        Ideal wenn VRAM der limitierende Faktor ist.
      </P>

      <H2>Das Problem: Aktivierungsspeicher</H2>
      <P>
        Beim normalen Backpropagation müssen alle Zwischenaktivierungen (Outputs jeder Schicht) 
        im VRAM gespeichert werden, um Gradienten berechnen zu können:
      </P>
      <CodeBlock>{`Normales Training (N=32 Schichten, L=7B):
  Forward Pass: alle 32 Schichten-Outputs speichern
  Aktivierungs-Speicher: ~4–8 GB (bei BS=4, seq=512)
  
  Problem: Bei großen BS oder langen Sequenzen:
    BS=16, seq=2048 → ~32 GB NUR für Aktivierungen!

Gradient Checkpointing:
  Speichere nur jeden K-ten "Checkpoint" (z.B. jede 4. Schicht)
  Beim Backward Pass: Nicht-gespeicherte Aktivierungen
                      werden FEU BERECHNET
  
  Trade-off:
    Speicher: ÷2 bis ÷4  (ca. 30–60% weniger)
    Geschwindigkeit: ×0.7–0.8 (20–30% langsamer)`}</CodeBlock>

      <H2>Wie viel Speicher Gradient Checkpointing spart</H2>
      <div className="space-y-2">
        {[
          { scenario: '7B LoRA, BS=4, seq=512', ohne: '~16 GB', mit: '~10 GB', speed: '-20%' },
          { scenario: '7B LoRA, BS=8, seq=1024', ohne: '~32 GB', mit: '~18 GB', speed: '-25%' },
          { scenario: '7B QLoRA, BS=4, seq=2048', ohne: '~12 GB', mit: '~7 GB', speed: '-30%' },
          { scenario: '13B LoRA, BS=4, seq=512', ohne: '~28 GB', mit: '~16 GB', speed: '-25%' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-gray-400">{row.scenario}</span>
            <span className="text-red-400">Ohne: {row.ohne}</span>
            <span className="text-green-400">Mit: {row.mit}</span>
            <span className="text-yellow-400">Speed: {row.speed}</span>
          </div>
        ))}
      </div>

      <H2>Die ultimative Speicher-Optimierungs-Kombination</H2>
      <CodeBlock>{`Maximale Speicherersparnis – alle Tricks kombiniert:

  Basis 7B Modell (fp32):                  28 GB VRAM
  
  + Mixed Precision (bf16):          ÷2    14 GB
  + LoRA (nur Adapter trainieren):   ÷3    ~5 GB Gradients
  + QLoRA (4-bit Basis):             ÷4    ~3.5 GB Basis
  + Gradient Checkpointing:          -2GB  ~4 GB Aktivierungen
  + Gradient Accumulation (BS=1):    -1GB  ~3 GB Batches
  
  Total:  ~5–6 GB VRAM für 7B Fine-Tuning!
          → Möglich auf RTX 3070 (8 GB) ✓

  Ohne irgendeine Optimierung: 60+ GB → unmöglich auf Consumer-GPU`}</CodeBlock>

      <H2>Gradient Checkpointing in FrameTrain</H2>
      <P>
        In FrameTrain kannst du Gradient Checkpointing im Training-Panel aktivieren. 
        Es wird automatisch empfohlen wenn das System erkennt, dass VRAM knapp werden könnte. 
        Als Faustregel: <Highlight>aktiviere es immer wenn VRAM < 12 GB</Highlight> und Modell > 1B Parameter.
      </P>

      <InfoBox type="info" title="Wann Gradient Checkpointing lohnt sich">
        Wenn Training-Geschwindigkeit wichtig ist und VRAM ausreichend: deaktiviert lassen. 
        Wenn VRAM der Engpass ist oder OOM-Fehler auftreten: aktivieren. 
        Der 20–30% Speed-Nachteil ist meist akzeptabel um Training überhaupt zu ermöglichen.
      </InfoBox>
    </div>
  )
}

function EarlyStoppingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Target className="w-9 h-9" />} title="Early Stopping" subtitle="Automatisch zum optimalen Zeitpunkt aufhören" />
      <P>
        <Highlight>Early Stopping</Highlight> überwacht den Validation Loss und stoppt das Training 
        automatisch, wenn keine sinnvolle Verbesserung mehr stattfindet. Es lädt automatisch den 
        besten Checkpoint.
      </P>

      <H2>Warum Early Stopping so wichtig ist</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-red-400/20 rounded-xl p-5">
          <h3 className="text-red-400 font-bold mb-2">Ohne Early Stopping</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Training läuft alle geplanten Epochen</li>
            <li>Modell overfittet nach optimalem Punkt</li>
            <li>Letzter Checkpoint ≠ bester Checkpoint</li>
            <li>Verschwenderisch: Training nach Overfitting-Punkt nutzlos</li>
          </ul>
        </div>
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-2">Mit Early Stopping</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Training stoppt automatisch am optimalen Punkt</li>
            <li>Best Checkpoint wird automatisch geladen</li>
            <li>Kein Overfitting durch zu langes Training</li>
            <li>Spart Rechenzeit wenn Plateau früh erreicht</li>
          </ul>
        </div>
      </div>

      <H2>Early Stopping Parameter erklärt</H2>
      <div className="space-y-4">
        {[
          {
            param: 'patience',
            desc: 'Wie viele Epochen ohne Verbesserung toleriert werden, bevor gestoppt wird.',
            values: 'Typisch: 3–5 Epochen',
            effect: 'Zu niedrig: stoppt zu früh (bei temporären Schwankungen). Zu hoch: Overfitting passiert trotzdem.',
            recommendation: 'patience=3 für kurze Trainings. patience=5 für lange Trainings mit Schwankungen.',
          },
          {
            param: 'min_delta',
            desc: 'Minimale Verbesserung des Validation Loss um als "besser" zu zählen.',
            values: 'Typisch: 0.0001–0.001',
            effect: 'Verhindert Stoppen wenn nur minimales Rauschen die Metrik leicht verbessert.',
            recommendation: 'min_delta=0.001 ist ein guter Startwert.',
          },
          {
            param: 'monitor',
            desc: 'Welche Metrik überwacht wird.',
            values: '"val_loss" oder "val_accuracy"',
            effect: 'val_loss ist stabiler und direkter. val_accuracy kann plateauen während val_loss noch sinkt.',
            recommendation: 'Immer val_loss monitoren, nicht val_accuracy.',
          },
          {
            param: 'restore_best_weights',
            desc: 'Ob der beste Checkpoint automatisch geladen wird wenn gestoppt wird.',
            values: 'True (immer empfohlen)',
            effect: 'Ohne: letzter Checkpoint (nach Overfitting). Mit: bester Checkpoint geladen.',
            recommendation: 'Immer True. Nur Ausnahme: wenn der letzte Checkpoint explizit gewünscht.',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <h3 className="text-white font-bold font-mono">{item.param}</h3>
              <code className="text-violet-300 text-xs">{item.values}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-600 text-xs mb-1">Effekt: {item.effect}</p>
            <p className="text-green-400 text-xs">💡 {item.recommendation}</p>
          </div>
        ))}
      </div>

      <H2>Early Stopping Strategie nach Training-Typ</H2>
      <CodeBlock>{`Kurzes Fine-Tuning (3–5 geplante Epochen):
  patience = 2
  min_delta = 0.001
  → Wenig Toleranz für Schwankungen

Mittleres Fine-Tuning (5–20 Epochen):
  patience = 3
  min_delta = 0.0005
  → Standard-Setup

Langes Fine-Tuning (20+ Epochen):
  patience = 5
  min_delta = 0.0001
  → Genug Toleranz für Lernkurven-Plateaus

Kombination mit LR Scheduler (ReduceLROnPlateau):
  LR wird reduziert bei Plateau, dann noch 3 Epochen versucht
  → Early Stopping erst danach → bessere Ausnutzung des Trainings`}</CodeBlock>

      <H2>Best Practices</H2>
      <div className="space-y-2">
        {[
          'Monitor IMMER val_loss, nicht train_loss (train_loss sinkt immer weiter)',
          'Aktiviere restore_best_weights=True – sonst lädst du das schlechteste Modell',
          'Speichere den besten Checkpoint separat (save_best_only=True)',
          'Patience von 3 überlebt kurze Spikes, ist aber nicht zu lasch',
          'Kombiniere mit Cosine LR Decay: LR kühlt ab, bevor Early Stopping greift',
          'Bei wenig Daten: Early Stopping nach Validation F1, nicht nur Loss',
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
      <SectionTitle icon={<GitBranch className="w-9 h-9" />} title="Model Ensembles" subtitle="Mehrere Modelle kombinieren für maximale Performance" />
      <P>
        <Highlight>Ensembles</Highlight> kombinieren die Vorhersagen mehrerer Modelle. 
        Sie sind fast immer besser als ein einzelnes Modell – auf Kosten von mehr Rechenaufwand 
        zur Inferenzzeit.
      </P>

      <H2>Ensemble-Methoden im Detail</H2>
      <div className="space-y-5">
        {[
          {
            name: 'Majority Voting (Classification)',
            desc: 'Jedes Modell gibt eine Klassen-Vorhersage. Die häufigste Klasse gewinnt (wie eine Wahl).',
            code: `# 3 Modell-Vorhersagen kombinieren:
predictions = [model1.predict(x),  # "positiv"
               model2.predict(x),  # "positiv"  
               model3.predict(x)]  # "negativ"
from collections import Counter
final = Counter(predictions).most_common(1)[0][0]
# → "positiv" (2 von 3 Modellen)`,
            use: 'Wenn Klassen-Label (nicht Wahrscheinlichkeit) verfügbar',
            improvement: '+1–5% Accuracy typisch',
          },
          {
            name: 'Probability Averaging ⭐ (Empfohlen)',
            desc: 'Softmax-Wahrscheinlichkeiten aller Modelle werden gemittelt. Dann höchste Wahrscheinlichkeit als Klasse.',
            code: `# Wahrscheinlichkeiten mitteln:
probs_1 = model1.predict_proba(x)  # [0.8, 0.2]
probs_2 = model2.predict_proba(x)  # [0.6, 0.4]
probs_3 = model3.predict_proba(x)  # [0.9, 0.1]

avg_probs = np.mean([probs_1, probs_2, probs_3], axis=0)
# → [0.77, 0.23]
final_class = np.argmax(avg_probs)  # Klasse 0 = "positiv"`,
            use: 'Wenn Softmax-Wahrscheinlichkeiten verfügbar – fast immer besser als Majority Voting',
            improvement: '+2–8% typisch gegenüber einzelnem Modell',
          },
          {
            name: 'Checkpoint Ensemble',
            desc: 'Verschiedene Checkpoints desselben Trainings werden kombiniert. Kostengünstig – kein separates Training nötig.',
            code: `# Letzte N Checkpoints aus einem Training:
checkpoints = [
    'model_epoch_8.pt',
    'model_epoch_9.pt', 
    'model_epoch_10.pt'
]
# Vorhersagen aller Checkpoints mitteln
ensemble_probs = np.mean([
    load_and_predict(ckpt, x) 
    for ckpt in checkpoints
], axis=0)`,
            use: 'Wenn mehrmalige Training-Runs zu teuer sind – nutzt bereits vorhandene Checkpoints',
            improvement: '+1–3% typisch',
          },
          {
            name: 'Diverse Ensemble (verschiedene Seeds/HPs)',
            desc: 'Selbes Modell, aber verschiedene Random Seeds oder leicht verschiedene Hyperparameter. Mehr Diversität = besser.',
            code: `# 5 Runs mit verschiedenen Seeds:
models = []
for seed in [42, 123, 456, 789, 1337]:
    model = train_with_seed(seed, lr=2e-5)
    models.append(model)

# Ensemble der 5 Modelle:
ensemble_pred = np.mean([
    m.predict_proba(x) for m in models
], axis=0)`,
            use: 'Wettbewerbe, wenn maximale Performance nötig',
            improvement: '+3–10% typisch',
          },
          {
            name: 'Stacking (Meta-Learning)',
            desc: 'Ein Meta-Modell lernt, die Outputs der Basis-Modelle optimal zu kombinieren. Komplexer aber mächtiger.',
            code: `# Stacking Ablauf:
# 1. Basis-Modelle trainieren (cross-validation)
# 2. Basis-Modell-Predictions als Features verwenden
# 3. Meta-Modell auf diese Features trainieren

# Einfachster Meta-Learner: Logistische Regression
from sklearn.linear_model import LogisticRegression
meta_features = np.column_stack([
    model1.predict_proba(X_val),
    model2.predict_proba(X_val),
    model3.predict_proba(X_val)
])
meta_model = LogisticRegression().fit(meta_features, y_val)`,
            use: 'Wenn Basis-Modelle sehr verschieden sind (unterschiedliche Architekturen)',
            improvement: '+3–15% möglich, hoher Aufwand',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <Tag color="green">Ø {item.improvement}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <CodeBlock>{item.code}</CodeBlock>
            <p className="text-gray-600 text-xs">Einsatz: {item.use}</p>
          </div>
        ))}
      </div>

      <H2>Ensemble-Diversität – der Schlüssel zum Erfolg</H2>
      <P>
        Ensembles funktionieren am besten, wenn die Einzelmodelle 
        <Highlight> unterschiedliche Fehler machen</Highlight>. Diversität entsteht durch:
      </P>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { source: 'Verschiedene Random Seeds', benefit: 'Einfachste Methode, immer empfohlen' },
          { source: 'Verschiedene Hyperparameter', benefit: 'LR, rank, dropout leicht variieren' },
          { source: 'Verschiedene Modell-Architekturen', benefit: 'BERT + RoBERTa + DeBERTa kombinieren' },
          { source: 'Verschiedene Trainings-Splits', benefit: 'Cross-Validation Folds als Ensemble' },
          { source: 'Verschiedene Daten-Augmentation', benefit: 'Jedes Modell auf leicht verschiedenen Daten' },
          { source: 'Checkpoint Ensemble', benefit: 'Verschiedene Trainings-Zeitpunkte' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3">
            <p className="text-violet-300 text-sm font-semibold">{item.source}</p>
            <p className="text-gray-500 text-xs mt-1">{item.benefit}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Ensembles mit FrameTrain">
        Trainiere mehrere FrameTrain-Läufe des gleichen Modells mit verschiedenen Seeds 
        und speichere die besten Checkpoints. Danach: einfaches Probability Averaging der 
        Softmax-Outputs ergibt typisch 2–5% Verbesserung ohne weiteren Trainingsaufwand.
      </InfoBox>

      {/* Final CTA */}
      <div className="mt-10 p-8 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-violet-400" />
          <h2 className="text-2xl font-black text-white">Du bist jetzt ein KI-Training Coach! 🎉</h2>
        </div>
        <p className="text-gray-400 mb-6">
          Von neuronalen Netzwerken über Loss-Kurven-Interpretation und LoRA bis zu 
          Mixed Precision und Ensembles – du hast alle Grundlagen und fortgeschrittenen Techniken 
          gemeistert. Jetzt heißt es: ausprobieren, messen, iterieren!
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/ai-training-guide" className="px-4 py-2 bg-violet-600/20 border border-violet-400/30 rounded-lg text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-all flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Alle Kapitel
          </Link>
          <Link href="/docs/ai-training-guide/ml-grundlagen" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Nochmal von Vorne
          </Link>
          <Link href="/download" className="px-4 py-2 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 border border-violet-400/30 rounded-lg text-white text-sm font-semibold hover:from-violet-600/70 hover:to-fuchsia-600/70 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            FrameTrain starten
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FortgeschrittenePage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'mixed-precision': return <MixedPrecisionSection />
      case 'gradient-checkpointing': return <GradientCheckpointingSection />
      case 'early-stopping': return <EarlyStoppingSection />
      case 'ensembles': return <EnsemblesSection />
      default: return <MixedPrecisionSection />
    }
  }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/docs/ai-training-guide" className="hover:text-white transition-colors">AI Training Guide</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">🚀 Fortgeschrittene Techniken</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <SubPageLayout currentChapterId={CHAPTER_ID} activeSection={activeSection} setActiveSection={setActiveSection}>
            {renderSection()}
          </SubPageLayout>
        </div>
      </main>
      <Footer />
    </div>
  )
}
