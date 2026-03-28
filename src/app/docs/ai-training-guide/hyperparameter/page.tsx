'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sliders, TrendingDown, Layers, Settings, Shield, ChevronRight } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag, LRSchedulerChart
} from '../_shared'

const CHAPTER_ID = 'hyperparameter'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function LearningRateDeepSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sliders className="w-9 h-9" />} title="Learning Rate (vertieft)" subtitle="Der wichtigste Hyperparameter vollständig verstehen" />
      <P>
        Die <Highlight>Learning Rate (LR)</Highlight> bestimmt die Schrittgröße beim Gradient Descent. 
        Sie ist der einflussreichste Hyperparameter: kein anderer Parameter kann das Training 
        so stark positiv oder negativ beeinflussen.
      </P>

      <H2>Auswirkungen auf den Trainingsverlauf</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { lr: 'LR zu groß (z.B. 1e-2)', color: 'border-red-400/20', effects: ['Loss oszilliert extrem', 'Kein Konvergieren', 'Mögliche Gradient-Explosion (NaN)'], label: '⚡ Chaos', bg: 'bg-red-500/5' },
          { lr: 'LR ideal (z.B. 2e-5)', color: 'border-green-400/20', effects: ['Loss sinkt gleichmäßig', 'Stabile Konvergenz', 'Erreicht niedriges Minimum'], label: '✓ Optimal', bg: 'bg-green-500/5' },
          { lr: 'LR zu klein (z.B. 1e-8)', color: 'border-yellow-400/20', effects: ['Kaum Fortschritt pro Epoche', 'Sehr langsames Training', 'Praktisch kein Lernen'], label: '🐌 Zu langsam', bg: 'bg-yellow-500/5' },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color} ${item.bg}`}>
            <p className="text-2xl mb-2">{item.label}</p>
            <h3 className="text-white font-bold mb-3 text-sm">{item.lr}</h3>
            {item.effects.map((e, j) => <p key={j} className="text-gray-400 text-sm">• {e}</p>)}
          </div>
        ))}
      </div>

      <H2>LR-Empfehlungen nach Modelltyp und Aufgabe</H2>
      <div className="space-y-2">
        {[
          { scenario: 'BERT / RoBERTa Fine-Tuning (Klassifikation)', lr: '2e-5 bis 5e-5', note: 'Original Paper: 2e-5 für 3 Epochen' },
          { scenario: 'DeBERTa / ELECTRA Fine-Tuning', lr: '1e-5 bis 3e-5', note: 'Etwas niedriger als BERT' },
          { scenario: 'GPT-2 Fine-Tuning (Generierung)', lr: '5e-5 bis 1e-4', note: 'Decoder-Modelle vertragen etwas höhere LR' },
          { scenario: 'LLaMA / Mistral LoRA (rank=8–16)', lr: '1e-4 bis 3e-4', note: 'Standard LoRA: viele Parameter eingefroren' },
          { scenario: 'LLaMA / Mistral LoRA (rank=32–64)', lr: '5e-5 bis 1e-4', note: 'Höherer Rank = mehr Parameter = niedrigere LR' },
          { scenario: 'QLoRA (4-bit) Fine-Tuning', lr: '2e-4 bis 3e-4', note: 'Ähnlich wie LoRA, ggf. etwas höher' },
          { scenario: 'Full Fine-Tuning (7B, fp16)', lr: '1e-5 bis 5e-5', note: 'Niedrig wegen Catastrophic Forgetting-Risiko' },
          { scenario: 'Training von Scratch (kleines Modell)', lr: '1e-3 bis 3e-3', note: 'Viel höher: alle Parameter müssen neu lernen' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-gray-400">{row.scenario}</span>
            <div className="flex gap-3 items-center">
              <code className="text-violet-300 font-mono">{row.lr}</code>
              <span className="text-gray-600 text-xs hidden md:block">{row.note}</span>
            </div>
          </div>
        ))}
      </div>

      <H2>Der LR Range Test – systematische Findung</H2>
      <CodeBlock>{`LR Range Test (implementierung):

  1. Initialisiere Modell frisch
  2. Trainiere 1 Epoche mit LR Schedule: 1e-8 → 1e-1
     (exponentiell steigend über alle Steps)
  3. Plotte Loss vs. LR (log-Skala)
  4. Identifiziere:
     - Punkt wo Loss am steilsten sinkt → LR_steep
     - Punkt wo Loss beginnt zu steigen → LR_max
  5. Gute LR = LR_steep / 10 bis LR_steep

Beispiel-Ergebnis:
  LR_steep  = 5e-4
  LR_max    = 2e-3
  → Gute LR = 5e-5 (sicher unter steep)
             oder 1e-4 (aggressiver)`}</CodeBlock>

      <H2>Linear Scaling Rule & Batch-LR-Beziehung</H2>
      <CodeBlock>{`Linear Scaling Rule:
  LR_neu = LR_basis × (Batch_Size_neu / Batch_Size_basis)

Beispiel:
  Basis: BS=8, LR=2e-5
  Neu:   BS=32 → LR = 2e-5 × (32/8) = 8e-5

Für Batch Size < 512:  Linear Scaling gut
Für Batch Size > 512:  Square Root Scaling besser:
  LR_neu = LR_basis × sqrt(BS_neu / BS_basis)

Hinweis: Bei kleinen Änderungen (8→16) oft optional.`}</CodeBlock>

      <InfoBox type="success" title="Praktischer Ansatz für FrameTrain">
        Starte immer mit dem Standardwert des gewählten Modells. 
        Wenn nach 1–2 Epochen Loss kaum sinkt: LR × 3. 
        Wenn Loss oszilliert: LR ÷ 5. 
        Warmup immer auf 5–10% der Steps setzen.
      </InfoBox>
    </div>
  )
}

function LRSchedulerSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TrendingDown className="w-9 h-9" />} title="LR Scheduler Strategien" subtitle="Die Learning Rate intelligent über das Training steuern" />
      <P>
        Ein <Highlight>LR Scheduler</Highlight> passt die LR während des Trainings automatisch an. 
        Statt einer konstanten LR ermöglicht er schnelles Lernen am Anfang und präzises Fine-Tuning am Ende.
      </P>

      <LRSchedulerChart />

      <H2>Die 5 wichtigsten Scheduler im Detail</H2>
      <div className="space-y-5">
        {[
          {
            name: 'Warmup + Cosine Decay ⭐ (Goldstandard)',
            desc: 'LR steigt linear von 0 auf Ziel-LR (Warmup), danach sanfte Cosinus-Kurve bis fast 0.',
            use: 'Goldstandard für alle LLM Fine-Tuning-Jobs',
            config: 'warmup_steps = 5–10% total; scheduler_type = "cosine"',
            pros: 'Sanftes Abkühlen am Ende. Sehr stabile, reproduzierbare Ergebnisse. Weit verbreitet und gut erprobt.',
            cons: 'Warmup-Schritte müssen vorab festgelegt werden.',
            color: 'border-violet-400/20',
            star: true,
          },
          {
            name: 'Warmup + Linear Decay',
            desc: 'LR steigt linear (Warmup), dann linearer Abfall bis 0.',
            use: 'BERT Fine-Tuning (original Paper), einfache Klassifikation',
            config: 'warmup_ratio = 0.06; scheduler_type = "linear"',
            pros: 'Einfach, gut dokumentiert, BERT-Standard.',
            cons: 'Cosine Decay minimal besser bei LLMs.',
            color: 'border-blue-400/20',
            star: false,
          },
          {
            name: 'Warmup + Constant',
            desc: 'LR steigt linear auf Ziel-LR, bleibt dann konstant.',
            use: 'Kurze Fine-Tuning-Jobs, wenn Konvergenz nicht kritisch',
            config: 'warmup_steps = 100; scheduler_type = "constant_with_warmup"',
            pros: 'Einfachste Konfiguration.',
            cons: 'Kein automatisches Abkühlen – kann am Ende zu instabil sein.',
            color: 'border-cyan-400/20',
            star: false,
          },
          {
            name: 'Cosine Annealing with Warm Restarts (SGDR)',
            desc: 'Wiederholt Cosine-Decay-Zyklen mit Restarts. Nach jedem Zyklus: neue Exploration.',
            use: 'Ensemble-Training, wenn mehrere gute Checkpoints gewünscht',
            config: 'T_0 = 100 (erste Zykluslänge), T_mult = 2 (Verlängerung)',
            pros: 'Diverse Checkpoints aus verschiedenen Minima. Hilfreich für Ensembles.',
            cons: 'Komplexer. Loss-Kurve sieht zyklisch aus – kann verwirrend sein.',
            color: 'border-orange-400/20',
            star: false,
          },
          {
            name: 'ReduceLROnPlateau',
            desc: 'LR wird automatisch reduziert, wenn Validation Loss für N Epochen nicht sinkt.',
            use: 'Wenn optimale Epochenzahl unbekannt, exploratives Training',
            config: 'factor = 0.5 (LR × 0.5 wenn Plateau); patience = 2',
            pros: 'Völlig adaptiv, kein manuelles Tuning.',
            cons: 'Kann zu früh oder zu spät reagieren. Braucht Validation Loss nach jeder Epoche.',
            color: 'border-green-400/20',
            star: false,
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color} ${item.star ? 'ring-1 ring-violet-400/30' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              {item.star && <Tag color="purple">⭐ Empfohlen</Tag>}
            </div>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <code className="text-violet-300 text-xs font-mono block mb-3 bg-gray-900/40 rounded-lg px-3 py-2">{item.config}</code>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-green-400 font-semibold mb-1">✓ Vorteile:</p>
                <p className="text-gray-400">{item.pros}</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-1">✗ Nachteile:</p>
                <p className="text-gray-400">{item.cons}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <H2>Warmup berechnen – praktische Formel</H2>
      <CodeBlock>{`Warmup-Schritte berechnen:
  warmup_steps = total_steps × warmup_ratio (z.B. 0.06)

total_steps = (dataset_size / batch_size) × num_epochs

Beispiele:
  1.000 Beispiele, BS=8, 3 Epochen:
    total_steps = 125 × 3 = 375
    warmup_steps = 375 × 0.06 = ~23 Steps

  5.000 Beispiele, BS=16, 2 Epochen:
    total_steps = 313 × 2 = 625
    warmup_steps = 625 × 0.06 = ~38 Steps

Faustregel: 50–200 Warmup-Steps für die meisten Jobs`}</CodeBlock>
    </div>
  )
}

function BatchSizeDeepSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title="Batch Size & Gradient Accumulation" subtitle="Effizienz, Speicher und Qualität ausbalancieren" />
      <P>
        Die <Highlight>Batch Size</Highlight> bestimmt, wie viele Trainingsbeispiele gleichzeitig 
        verarbeitet werden, bevor Gewichte aktualisiert werden. Sie beeinflusst direkt 
        Speicherbedarf, Trainingsgeschwindigkeit und oft auch die Generalisierungsqualität.
      </P>

      <H2>Kleine vs. Große Batch Size</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Kleine Batch Size (1–8)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><span className="text-green-400">✓</span> Wenig GPU-Speicher</li>
            <li><span className="text-green-400">✓</span> Stochastisches Rauschen → manchmal bessere Generalisierung</li>
            <li><span className="text-green-400">✓</span> Häufigere Gewichts-Updates</li>
            <li><span className="text-red-400">✗</span> Noisige Gradienten (weniger Samples)</li>
            <li><span className="text-red-400">✗</span> Langsamer (weniger Parallelismus)</li>
            <li><span className="text-red-400">✗</span> Braucht niedrigere LR</li>
          </ul>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Große Batch Size (32–256)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><span className="text-green-400">✓</span> Schnelleres Training (besserer GPU-Auslastung)</li>
            <li><span className="text-green-400">✓</span> Stabilere Gradienten</li>
            <li><span className="text-green-400">✓</span> Erlaubt höhere LR (Linear Scaling)</li>
            <li><span className="text-red-400">✗</span> Viel mehr VRAM</li>
            <li><span className="text-red-400">✗</span> Kann schlechtere Generalisierung bei sehr großen BS</li>
            <li><span className="text-red-400">✗</span> Braucht LR-Anpassung</li>
          </ul>
        </div>
      </div>

      <InfoBox type="info" title="Sweet Spot für LLM Fine-Tuning">
        Effektive Batch Size von 16–32 ist für die meisten Fine-Tuning-Jobs ideal. 
        Größer bringt oft keinen weiteren Vorteil bei konstanter LR-Anpassung. 
        Kleiner als 8 kann Training destabilisieren.
      </InfoBox>

      <H2>Gradient Accumulation – der VRAM-Trick</H2>
      <P>
        <Highlight>Gradient Accumulation</Highlight> löst das Dilemma zwischen kleinem VRAM 
        und großer effektiver Batch Size: Du verarbeitest kleine Batches, akkumulierst die 
        Gradienten über mehrere Steps, und führst erst dann ein Gewichts-Update durch.
      </P>
      <CodeBlock>{`Gradient Accumulation Beispiel:

  Ziel: Effektive Batch Size = 32, aber nur 6 GB VRAM

  Batch Size:                4  (passt in VRAM)
  Gradient Accumulation:     8  (akkumuliere 8 Steps)
  Effektive Batch Size:   4×8 = 32  ✓

  Ablauf:
    Step 1: Forward(Batch1) → Gradient ÷8 akkumulieren
    Step 2: Forward(Batch2) → Gradient ÷8 akkumulieren
    ...
    Step 8: Forward(Batch8) → Gradient ÷8 akkumulieren
            → optimizer.step()  (1 Update aus 32 Samples)
            → optimizer.zero_grad()

  Wichtig: Gradienten durch accumulation_steps dividieren!
  Sonst: zu große Updates`}</CodeBlock>

      <H2>VRAM-Empfehlungen nach GPU</H2>
      <div className="space-y-2">
        {[
          { vram: '4 GB VRAM', bs: '1', acc: '32', note: 'z.B. GTX 1650 + Gradient Checkpointing, QLoRA' },
          { vram: '6 GB VRAM', bs: '2', acc: '16', note: 'RTX 3060 – bf16 + QLoRA empfohlen' },
          { vram: '8 GB VRAM', bs: '4', acc: '8', note: 'RTX 3070/4060 Ti – LoRA gut machbar' },
          { vram: '12 GB VRAM', bs: '8', acc: '4', note: 'RTX 3080/4070 – LoRA komfortabel' },
          { vram: '16 GB VRAM', bs: '16', acc: '2', note: 'RTX 4080/A4000 – Full FT kleiner Modelle' },
          { vram: '24 GB VRAM', bs: '32', acc: '1', note: 'RTX 3090/4090/A6000 – 7B Full FT in bf16' },
          { vram: '40–80 GB VRAM', bs: '64+', acc: '1', note: 'A100/H100 – 13B–70B Full FT möglich' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-yellow-300 font-semibold">{row.vram}</span>
            <span className="text-violet-300">BS: {row.bs}</span>
            <span className="text-cyan-300">Grad. Acc.: {row.acc}</span>
            <span className="text-gray-500 text-xs">{row.note}</span>
          </div>
        ))}
      </div>

      <H2>Effektive Batch Size berechnen</H2>
      <CodeBlock>{`Effektive Batch Size = batch_size × gradient_accumulation_steps
                         × num_gpus  (bei Multi-GPU)

Beispiel (1 GPU):
  batch_size = 4, accumulation = 8, gpus = 1
  → effektiv = 4 × 8 = 32

Empfehlung: Effektive BS von 16–32 anstreben
  Wenn BS 32 nicht in VRAM passt:
  → BS=4, accumulation=8 ist gleichwertig`}</CodeBlock>
    </div>
  )
}

function OptimizerVergleichSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Settings className="w-9 h-9" />} title="Optimizer Vergleich" subtitle="Welcher Optimizer für welche Situation?" />
      <P>
        Der <Highlight>Optimizer</Highlight> bestimmt, wie Gradienten in Gewichts-Updates 
        umgewandelt werden. Neben der LR ist er der wichtigste Einflussfaktor auf 
        Trainingsgeschwindigkeit, Stabilität und finale Performance.
      </P>

      <H2>Die wichtigsten Optimizer im Detail</H2>
      <div className="space-y-5">
        {[
          {
            name: 'AdamW ⭐ (Standard)',
            formula: 'Adam + korrektes Weight Decay (decoupled)',
            params: 'lr=2e-5, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.01',
            use: 'Standard für alle modernen Transformer-Modelle',
            desc: 'Kombiniert adaptives Lernen (Adam) mit korrekt entkoppeltem Weight Decay. Der Unterschied zu Adam: Weight Decay wird direkt auf Gewichte angewendet, nicht in den Gradienten integriert. Ergebnis: bessere Regularisierung.',
            pros: 'Stabil, schnell, robust. Funktioniert out-of-the-box für fast alle LLM Fine-Tuning-Jobs.',
            cons: 'Benötigt ~3× den Speicher der Modellgewichte (Moment-Statistiken). Bei 7B = ~14 GB extra.',
            rec: '⭐ Nutze immer AdamW als ersten Versuch',
            color: 'border-violet-400/20',
          },
          {
            name: 'AdamW 8-bit (bitsandbytes)',
            formula: 'AdamW mit 8-bit quantisierten Optimizer-States',
            params: 'bnb.optim.AdamW8bit(...)',
            use: 'Speicheroptimierung für große Modelle auf Consumer-GPUs',
            desc: 'Quantisiert die Adam-Moment-Statistiken auf 8-bit. Spart ~75% Optimizer-Speicher bei minimalem Qualitätsverlust. Essentiell für Full Fine-Tuning auf 24GB GPUs.',
            pros: 'Drittelt den Optimizer-Speicher. Qualität nahezu identisch zu fp32 AdamW.',
            cons: 'Benötigt bitsandbytes-Library. Minimal langsamer durch Dequantisierung.',
            rec: 'Verwende wenn GPU-Speicher knapp bei Full Fine-Tuning',
            color: 'border-blue-400/20',
          },
          {
            name: 'SGD mit Momentum',
            formula: 'v = β·v + (1-β)·g; W -= α·v',
            params: 'lr=0.01–0.1, momentum=0.9, weight_decay=1e-4',
            use: 'Computer Vision, manchmal besser als Adam für CV',
            desc: 'Einfachster Optimizer mit Momentum. Gut verstanden und theoretisch fundiert. Oft besser für Vision-Modelle (ResNet, etc.), aber selten besser als AdamW für NLP/LLMs.',
            pros: 'Einfach, weniger Speicher als Adam (keine Moment-Statistiken). Theoretisch gut verstanden.',
            cons: 'Sehr sensitiv auf LR. Braucht sorgfältiges LR-Tuning. Für LLMs fast immer schlechter als AdamW.',
            rec: 'Für NLP/LLMs: immer AdamW bevorzugen',
            color: 'border-gray-400/20',
          },
          {
            name: 'Adafactor',
            formula: 'Adam-Variante mit faktorisierter Kovarianzmatrix',
            params: 'relative_step=True (auto-LR) oder feste LR',
            use: 'Sehr große Modelle (T5, GPT-3 Größenklasse) wo AdamW OOM',
            desc: 'Spart Speicher durch faktorisierte statt vollständige Moment-Statistiken. Für sehr große Modelle wo AdamW zu viel Speicher braucht. Standard bei Google-Modellen (T5, PaLM).',
            pros: 'Dramatisch weniger Speicher als AdamW. Skaliert zu sehr großen Modellen.',
            cons: 'Erfordert sorgfältigeres LR-Tuning. Konvergenz manchmal schlechter als AdamW.',
            rec: 'Fallback wenn AdamW OOM verursacht',
            color: 'border-green-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color}`}>
            <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
            <code className="text-violet-300 text-xs font-mono block mb-3">{item.params}</code>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <p className="text-green-400 font-semibold mb-1">✓ Vorteile:</p>
                <p className="text-gray-400">{item.pros}</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-1">✗ Nachteile:</p>
                <p className="text-gray-400">{item.cons}</p>
              </div>
            </div>
            <div className="bg-white/3 rounded-lg p-2">
              <p className="text-blue-300 text-xs">💡 {item.rec}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Optimizer Memory Budget</H2>
      <CodeBlock>{`Speicher-Übersicht (für 7B Modell, bf16):

  Modell-Gewichte (bf16):  ~14 GB
  Aktivierungen (BS=4):    ~4 GB
  Gradients:               ~14 GB (wie Gewichte)
  Optimizer States:
    AdamW (fp32):          ~28 GB (2× Gewichte für Momente)
    AdamW 8bit:            ~7 GB  (1/4 von AdamW fp32)
    SGD:                   ~14 GB (nur 1× Moment)
    Adafactor:             ~2 GB  (faktorisiert)

  Total (AdamW):   14+4+14+28 = ~60 GB → braucht A100!
  Total (AdamW8b): 14+4+14+7  = ~39 GB → RTX 3090×2 oder A100
  Mit LoRA (kein Gradient für frozen layers):
    Total (AdamW LoRA): ~14+1+1+2 = ~18 GB → RTX 3090!`}</CodeBlock>
    </div>
  )
}

function RegularisierungSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Shield className="w-9 h-9" />} title="Regularisierung" subtitle="Techniken für bessere Generalisierung und stabiles Training" />
      <P>
        <Highlight>Regularisierung</Highlight> umfasst Techniken, die das Modell daran hindern, 
        die Trainingsdaten zu "memorieren", und stattdessen bessere Generalisierung fördern.
      </P>

      <H2>Die wichtigsten Regularisierungstechniken</H2>
      <div className="space-y-5">
        {[
          {
            name: 'L2 Regularisierung (Weight Decay)',
            formula: 'L_total = L_task + λ · Σ w²',
            param: 'weight_decay = 0.01 (Standard), 0.1 (stark)',
            desc: 'Fügt dem Loss einen Term hinzu, der proportional zum Quadrat der Gewichte ist. Bestraft große Gewichte und hält das Modell "bescheiden". In AdamW korrekt entkoppelt implementiert.',
            effect: 'Verhindert extreme Gewichtswerte. Implizite "Occams Razor" – einfachere Lösungen werden bevorzugt.',
            tip: 'Erhöhe weight_decay auf 0.05–0.1 bei starkem Overfitting.',
            color: 'border-violet-400/20',
          },
          {
            name: 'Dropout',
            formula: 'während Training: h_i = 0 mit Wahrscheinlichkeit p',
            param: 'dropout = 0.1 (Standard), 0.3–0.5 (stark)',
            desc: 'Deaktiviert zufällig Neuronen während des Trainings. Das Netz kann sich nicht auf einzelne Neuronen verlassen und lernt redundante Repräsentationen.',
            effect: 'Stärkstes Regularisierungs-Werkzeug. Verhindert Co-Adaptation von Neuronen.',
            tip: 'Immer nur im Training aktiv! Bei Inferenz: alle Neuronen aktiv (skaliert).',
            color: 'border-blue-400/20',
          },
          {
            name: 'Label Smoothing',
            formula: 'y_smooth = y × (1-ε) + ε/K',
            param: 'label_smoothing = 0.1 (Standard)',
            desc: 'Statt harter 0/1-Labels werden weiche Targets genutzt (z.B. 0.9 für Positiv, 0.1/(K-1) für alle anderen). Verhindert "überself-sicheres" Modell.',
            effect: 'Verbessert Kalibrierung (Confindence = echte Wahrscheinlichkeit). Leichte Overfitting-Reduktion.',
            tip: 'Besonders hilfreich bei NLP-Aufgaben mit viel Label-Rauschen.',
            color: 'border-cyan-400/20',
          },
          {
            name: 'Gradient Clipping',
            formula: 'if ||g|| > max_norm: g = g × (max_norm / ||g||)',
            param: 'max_grad_norm = 1.0 (Standard)',
            desc: 'Begrenzt die maximale Gradient-Norm. Kein eigentlicher Regularisierer, aber stabilisiert das Training und verhindert Explosionen.',
            effect: 'Verhindert Gradient-Explosion und NaN-Loss. Essenziell bei großen Modellen.',
            tip: 'Standard in FrameTrain: immer aktiviert. Bei sehr stabilen Trainings: 0.5 für strengeres Clipping.',
            color: 'border-orange-400/20',
          },
          {
            name: 'Early Stopping',
            formula: 'Stoppe wenn val_loss >= best_val_loss für patience Epochen',
            param: 'patience = 3 (Standard), monitor = "val_loss"',
            desc: 'Beendet das Training, wenn Validation Loss aufhört sich zu verbessern. Verhindert Overfitting durch zu langes Training implizit.',
            effect: 'Verhindert die Overfitting-Phase durch rechtzeitigen Stopp. Lädt besten Checkpoint.',
            tip: 'Kombiniere immer mit save_best_only=True für automatisches Best-Checkpoint-Speichern.',
            color: 'border-green-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color}`}>
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <div className="flex flex-wrap gap-3 mb-3">
              <code className="text-violet-300 text-xs font-mono">{item.formula}</code>
              <code className="text-cyan-300 text-xs font-mono bg-gray-900/40 px-2 py-0.5 rounded">{item.param}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs mb-2">Effekt: {item.effect}</p>
            <div className="bg-white/3 rounded-lg p-2">
              <p className="text-blue-300 text-xs">💡 {item.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Regularisierung kombinieren</H2>
      <CodeBlock>{`Empfohlene Kombination für FrameTrain Fine-Tuning:

  # Standard (wenig Overfitting):
  weight_decay = 0.01
  dropout      = 0.05 (LoRA dropout)
  early_stopping patience = 3

  # Moderat (mittleres Overfitting):
  weight_decay = 0.05
  dropout      = 0.1
  label_smoothing = 0.05
  early_stopping patience = 2

  # Stark (starkes Overfitting, wenig Daten):
  weight_decay = 0.1
  dropout      = 0.2
  label_smoothing = 0.1
  early_stopping patience = 2
  lora_rank    = 4 (weniger trainierbare Parameter)`}</CodeBlock>
    </div>
  )
}

export default function HyperparameterPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'learning-rate-deep': return <LearningRateDeepSection />
      case 'lr-scheduler': return <LRSchedulerSection />
      case 'batch-size-deep': return <BatchSizeDeepSection />
      case 'optimizer-vergleich': return <OptimizerVergleichSection />
      case 'regularisierung': return <RegularisierungSection />
      default: return <LearningRateDeepSection />
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
            <span className="text-gray-300">⚙️ Hyperparameter-Coaching</span>
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
