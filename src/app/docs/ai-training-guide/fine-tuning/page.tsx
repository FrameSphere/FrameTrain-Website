'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Layers, Cpu, Wand2, Lightbulb, ChevronRight } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag, LoRADiagram
} from '../_shared'

const CHAPTER_ID = 'fine-tuning'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function FullFineTuningSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title="Full Fine-Tuning" subtitle="Alle Modell-Parameter anpassen – maximale Kontrolle" />
      <P>
        Beim <Highlight>Full Fine-Tuning</Highlight> werden <em>alle</em> Parameter des Basismodells 
        trainiert und angepasst. Maximale Ausdrucksstärke, aber maximaler Speicherbedarf.
      </P>

      <H2>Vor- und Nachteile</H2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">✓ Vorteile</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Maximale Anpassungsfähigkeit</li>
            <li>Beste mögliche Performance</li>
            <li>Kein Extra-Overhead durch Adapter</li>
            <li>Gut für fundamentale Domain-Shifts</li>
          </ul>
        </div>
        <div className="glass border border-red-400/20 rounded-xl p-5">
          <h3 className="text-red-400 font-bold mb-3">✗ Nachteile</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Riesiger VRAM-Bedarf (~28GB für 7B)</li>
            <li>Catastrophic Forgetting möglich</li>
            <li>Viel mehr Daten nötig</li>
            <li>Jeder Checkpoint = volle Modellgröße</li>
          </ul>
        </div>
      </div>

      <H2>Catastrophic Forgetting – das Hauptrisiko</H2>
      <P>
        Beim Full Fine-Tuning kann das Modell sein allgemeines Vorwissen "vergessen", 
        wenn es zu aggressiv auf neue Daten trainiert wird. Das passiert, wenn das neue 
        Wissen die alten Gewichte überschreibt.
      </P>
      <CodeBlock>{`Gegenmassnahmen gegen Catastrophic Forgetting:

  1. Niedrige Learning Rate (1e-5 oder niedriger)
     → Kleine Updates erhalten vorhandenes Wissen

  2. Wenige Epochen (1–3)
     → Modell nicht zu lange auf neuen Daten "einschleifen"

  3. Elastic Weight Consolidation (EWC)
     → Bestraft starke Änderungen wichtiger Parameter
     → Komplexer, aber effektiv

  4. Replay (gemischtes Training)
     → Mix aus alten (generellen) und neuen (spezifischen) Daten
     → z.B. 80% neue Aufgabe + 20% allgemeine Texte`}</CodeBlock>

      <H2>Full Fine-Tuning vs. LoRA: Wann was?</H2>
      <div className="space-y-3">
        {[
          { condition: 'VRAM < 24 GB', winner: 'LoRA / QLoRA', reason: 'Full FT passt nicht in Speicher' },
          { condition: 'VRAM 24–40 GB, maximale Performance gewünscht', winner: 'Full Fine-Tuning (bf16)', reason: 'Bestes Ergebnis wenn Speicher reicht' },
          { condition: 'Wenig Trainingsdaten (< 1.000 Beispiele)', winner: 'LoRA (kleiner Rank)', reason: 'Weniger trainierbare Parameter = weniger Overfitting' },
          { condition: 'Schnelle Iteration, viele Experimente', winner: 'LoRA', reason: 'Kleinere Checkpoints, schneller Training' },
          { condition: 'Mehrere Task-spezifische Versionen eines Modells', winner: 'LoRA Adapter', reason: 'Basis-Modell einmal laden, Adapter tauschen' },
          { condition: 'Modell soll fundamental neues Wissen lernen', winner: 'Full Fine-Tuning', reason: 'Alle Schichten anpassen für tiefgreifende Änderungen' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4 grid md:grid-cols-3 gap-2 items-center">
            <span className="text-gray-400 text-sm">{item.condition}</span>
            <span className="text-violet-300 font-bold text-center">{item.winner}</span>
            <span className="text-gray-600 text-xs">{item.reason}</span>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Full Fine-Tuning Checkliste">
        Bevor du Full Fine-Tuning startest: ✓ VRAM ≥ 24 GB, ✓ bf16 aktiviert, 
        ✓ LR maximal 5e-5, ✓ maximal 3 Epochen geplant, ✓ Early Stopping aktiviert, 
        ✓ Best Checkpoint Speicherung an.
      </InfoBox>
    </div>
  )
}

function LoRADeepSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title="LoRA im Detail" subtitle="Low-Rank Adaptation – der Schlüssel zu effizientem Fine-Tuning" />
      <P>
        <Highlight>LoRA (Low-Rank Adaptation)</Highlight>, eingeführt 2022 von Hu et al. (Microsoft), 
        ist die wichtigste Technik für effizientes LLM Fine-Tuning. 
        Es reduziert trainierbare Parameter um 99%+ bei minimalem Performance-Verlust.
      </P>

      <H2>Die mathematische Grundidee</H2>
      <P>
        Statt die gesamte Gewichtsmatrix W (d×d) zu verändern, friert LoRA W ein und 
        fügt zwei kleine Matrizen A (d×r) und B (r×d) hinzu, deren Produkt die Änderung darstellt:
      </P>
      <CodeBlock>{`Standard Fine-Tuning:
  W_neu = W + ΔW    (ΔW hat selbe Größe wie W!)
  7B Modell: ΔW ≈ 7 Milliarden Parameter zu trainieren

LoRA:
  W_neu = W + B·A   (W bleibt eingefroren)
  A: d×r  (Downprojection)
  B: r×d  (Upprojection)

Beispiel (d=4096, r=16):
  Ursprüngliche Matrix:  4096 × 4096 = 16.7M Parameter
  LoRA Matrizen:         4096×16 + 16×4096 = 131K Parameter
  Reduktion:             99.2% weniger trainierbare Parameter!

  Beim Fine-Tuning:  Nur A und B werden trainiert
  B wird mit 0 initialisiert → zu Beginn: BA = 0 → kein Einfluss`}</CodeBlock>

      <LoRADiagram />

      <H2>LoRA Hyperparameter erklärt</H2>
      <div className="space-y-4">
        {[
          {
            param: 'rank (r)',
            values: '4, 8, 16, 32, 64',
            desc: 'Bestimmt die "Kapazität" der LoRA-Adapter. Höherer Rank = mehr trainierbare Parameter = mehr Ausdrucksstärke, aber mehr Speicher und Overfitting-Risiko.',
            recommendation: 'r=8 für einfache Aufgaben/wenig Daten. r=16 für Standard. r=32–64 für komplexe Aufgaben mit viel Daten.',
            memory: 'r=8: ~2× weniger Parameter als r=16',
          },
          {
            param: 'alpha (α)',
            values: 'Typisch: gleich r oder 2×r (z.B. 16 oder 32)',
            desc: 'Skalierungsfaktor für den LoRA-Update: tatsächlicher Update = (α/r) × B·A·x. Alpha/r bestimmt die "Lernstärke" der Adapter.',
            recommendation: 'α = r (Update-Stärke = 1) oder α = 2r (stärkere Updates). Starte mit α=16 (bei r=16).',
            memory: 'Kein Speicher-Effekt (nur Skalierungskonstante)',
          },
          {
            param: 'dropout',
            values: '0.0 bis 0.1',
            desc: 'Dropout innerhalb der LoRA-Adapter-Matrizen. Verhindert Overfitting der Adapter, besonders bei kleinen Datasets.',
            recommendation: '0.05 Standard. Bei < 500 Beispielen: 0.1. Bei > 5.000 Beispielen: 0.0',
            memory: 'Kein Speicher-Effekt',
          },
          {
            param: 'target_modules',
            values: 'q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj',
            desc: 'Welche Schichten des Transformers mit LoRA erweitert werden. Mehr Module = mehr trainierbare Parameter = bessere Performance, aber mehr Speicher.',
            recommendation: 'Minimum: q_proj + v_proj. Standard: alle Attention-Layer. Maximum: alle linear layers inklusive FFN.',
            memory: 'Jedes target_module fügt ~2×r Parameter pro Schicht hinzu',
          },
          {
            param: 'bias',
            values: '"none" (Standard), "all", "lora_only"',
            desc: 'Ob Bias-Parameter mittrainiert werden. "none" = nur LoRA-Matrizen. "all" = auch alle Biases.',
            recommendation: '"none" ist Standard und reicht fast immer.',
            memory: '"all" fügt minimal extra Parameter hinzu',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-violet-400/15 rounded-xl p-5">
            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
              <h3 className="text-white font-bold font-mono">{item.param}</h3>
              <code className="text-cyan-300 text-xs">{item.values}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs mb-1">💡 {item.recommendation}</p>
            <p className="text-gray-600 text-xs">Speicher: {item.memory}</p>
          </div>
        ))}
      </div>

      <H2>LoRA für verschiedene Modelltypen</H2>
      <div className="space-y-2">
        {[
          { model: 'BERT / RoBERTa', modules: 'query, value (attention)', rank: 'r=8–16', lr: '2e-5' },
          { model: 'GPT-2', modules: 'c_attn, c_proj', rank: 'r=8–16', lr: '5e-5' },
          { model: 'LLaMA 2/3', modules: 'q_proj,k_proj,v_proj,o_proj', rank: 'r=16–32', lr: '2e-4' },
          { model: 'Mistral 7B', modules: 'q_proj,k_proj,v_proj,o_proj', rank: 'r=16', lr: '2e-4' },
          { model: 'Phi-3 / Gemma', modules: 'q_proj,v_proj', rank: 'r=8–16', lr: '1e-4' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-xs">
            <span className="text-white font-semibold">{row.model}</span>
            <span className="text-violet-300 font-mono">{row.modules}</span>
            <span className="text-cyan-300">{row.rank}</span>
            <span className="text-yellow-300">LR: {row.lr}</span>
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
        <Highlight>QLoRA</Highlight> (Dettmers et al., 2023) kombiniert 4-bit Quantisierung des 
        Basismodells mit LoRA-Adaptern in voller Präzision. Ergebnis: Ein 7B Modell in ~4 GB VRAM fine-tunen!
      </P>

      <H2>Wie QLoRA funktioniert</H2>
      <CodeBlock>{`QLoRA = Quantisiertes Basismodell + LoRA

Schritt 1: Basismodell in 4-bit laden (NF4 Quantisierung)
  → 7B Modell: 28 GB (fp32) → ~4 GB (NF4)

Schritt 2: LoRA-Adapter in bf16/fp16 hinzufügen
  → Adapter bleiben in voller Präzision für Qualität

Schritt 3: Beim Training:
  → Forward Pass: 4-bit Gewichte on-the-fly auf bf16 "dequantisiert"
  → Gradienten nur für LoRA-Adapter (bf16)
  → Basismodell bleibt eingefroren und 4-bit

Gesamtspeicher 7B:
  Basismodell (NF4):    ~4 GB
  LoRA-Adapter (bf16):  ~0.3 GB
  Aktivierungen:        ~1 GB
  Optimizer States:     ~0.6 GB
  Total:                ~6 GB → RTX 3070 reicht!`}</CodeBlock>

      <H2>NF4 Quantisierung – die Innovation hinter QLoRA</H2>
      <P>
        Standard int4-Quantisierung quantisiert Gewichte gleichmäßig. 
        <Highlight> NF4 (4-bit NormalFloat)</Highlight> berücksichtigt, dass Transformer-Gewichte 
        normalverteilt sind – es weist Bit-Werten die Grenzen zu, die die Normalverteilung optimal aufteilen:
      </P>
      <CodeBlock>{`Int4 (gleichmäßige Abstufungen):
  Bit-Werte: -8, -7, -6, ..., 7, 8  (16 Stufen)
  Problem: Die meisten Gewichte liegen nahe 0, 
           Extremwerte selten → schlechte Auflösung

NF4 (normalverteilte Abstufungen):
  Bit-Werte: -1, -0.69, -0.52, ..., 0.52, 0.69, 1
  (Quantile der Normalverteilung)
  Vorteil: Bessere Auflösung dort wo die meisten Gewichte liegen
  Ergebnis: Deutlich bessere Qualität als int4`}</CodeBlock>

      <H2>QLoRA vs. LoRA vs. Full FT im Vergleich</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Methode', 'VRAM (7B)', 'Qualität (rel.)', 'Geschw.', 'Empfehlung'].map(h => (
                <th key={h} className="text-left text-gray-400 py-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { m: 'Full FT (fp32)', v: '~60 GB', q: '100%', s: '⭐⭐⭐', r: 'A100/H100 Cluster' },
              { m: 'Full FT (bf16)', v: '~40 GB', q: '99%', s: '⭐⭐⭐', r: 'A100 40GB' },
              { m: 'Full FT (8-bit)', v: '~30 GB', q: '97%', s: '⭐⭐', r: 'A100/RTX 3090×2' },
              { m: 'LoRA (bf16)', v: '~16 GB', q: '97%', s: '⭐⭐⭐⭐', r: 'RTX 3090 / A6000' },
              { m: 'QLoRA (4-bit) ⭐', v: '~6 GB', q: '93–96%', s: '⭐⭐⭐', r: 'RTX 3070/4060 Ti' },
              { m: 'QLoRA (4-bit, GC)', v: '~4–5 GB', q: '92–95%', s: '⭐⭐', r: 'GTX 1660 Ti oder besser' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-300">{row.m}</td>
                <td className="py-3 pr-4 text-yellow-400">{row.v}</td>
                <td className="py-3 pr-4 text-green-400">{row.q}</td>
                <td className="py-3 pr-4 text-gray-400">{row.s}</td>
                <td className="py-3 text-gray-500 text-xs">{row.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-gray-600 text-xs mt-2">GC = Gradient Checkpointing aktiv. Qualität bezogen auf Full FT fp32.</p>
      </div>

      <InfoBox type="success" title="QLoRA: Die Demokratisierung des LLM-Trainings">
        Vor QLoRA benötigte 7B Fine-Tuning 28 GB+ VRAM (nur High-End-Server).
        Mit QLoRA funktioniert es auf einer RTX 3070 (8 GB VRAM). 
        13B Modelle sind mit 16 GB möglich. Das macht LLM Fine-Tuning für alle zugänglich.
      </InfoBox>
    </div>
  )
}

function PEFTMethodenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Wand2 className="w-9 h-9" />} title="PEFT Methoden Übersicht" subtitle="Parameter-Efficient Fine-Tuning im Vergleich" />
      <P>
        <Highlight>PEFT (Parameter-Efficient Fine-Tuning)</Highlight> ist der Oberbegriff für Methoden, 
        die nur einen Bruchteil der Modellparameter trainieren. LoRA ist die populärste, aber es gibt weitere.
      </P>

      <H2>Alle PEFT-Methoden im Vergleich</H2>
      <div className="space-y-4">
        {[
          {
            name: 'LoRA ⭐ (Low-Rank Adaptation)',
            trainable: '0.1–1%',
            memory: 'Sehr gut',
            quality: 'Sehr gut (97%+)',
            speed: 'Schnell',
            desc: 'Trainiert low-rank Matrizen parallel zu frozen Attention-Gewichten. Standard für fast alle LLM Fine-Tuning-Jobs 2023+.',
            when: 'Standard-Empfehlung für alle Fälle',
            color: 'border-violet-400/20',
          },
          {
            name: 'QLoRA (Quantized LoRA)',
            trainable: '0.1–1%',
            memory: 'Exzellent',
            quality: 'Gut (93–96%)',
            speed: 'Mittel',
            desc: '4-bit quantisiertes Basismodell + LoRA-Adapter in bf16. Minimaler VRAM für maximale Modellgröße.',
            when: 'Wenn VRAM sehr begrenzt (< 12 GB für 7B)',
            color: 'border-blue-400/20',
          },
          {
            name: 'Prefix Tuning',
            trainable: '0.01–0.1%',
            memory: 'Gut',
            quality: 'Gut (85–92%)',
            speed: 'Schnell',
            desc: 'Fügt trainierbare "Prefix"-Tokens am Anfang aller Transformer-Schichten ein. Kein Eingriff in Modellgewichte selbst.',
            when: 'Wenn Modell-Gewichte nicht verändert werden dürfen',
            color: 'border-cyan-400/20',
          },
          {
            name: 'Prompt Tuning',
            trainable: '~0.01%',
            memory: 'Exzellent',
            quality: 'Moderat (75–85%)',
            speed: 'Sehr schnell',
            desc: 'Nur "Soft-Prompts" (trainierbare Input-Embeddings) werden gelernt. Sehr effizient, aber schwächere Performance bei kleinen Modellen.',
            when: 'Nur für sehr große Modelle (> 10B) oder wenn Geschwindigkeit oberste Priorität',
            color: 'border-green-400/20',
          },
          {
            name: 'Adapter Layers',
            trainable: '0.5–3%',
            memory: 'Gut',
            quality: 'Gut (90–95%)',
            speed: 'Etwas langsamer',
            desc: 'Kleine Feed-Forward-Netzwerke zwischen Transformer-Schichten eingefügt. Ältere Methode (vor LoRA), immer noch solide.',
            when: 'Historisch wichtig, heute meist von LoRA übertroffen',
            color: 'border-orange-400/20',
          },
          {
            name: 'IA³ (Infused Adapter by Inhibiting and Amplifying)',
            trainable: '~0.01%',
            memory: 'Exzellent',
            quality: 'Gut (88–93%)',
            speed: 'Sehr schnell',
            desc: 'Trainiert nur Skalierungsvektoren für Keys, Values und Feed-Forward. Extrem wenige Parameter bei guter Qualität.',
            when: 'Sehr wenige Daten, extrem schnelle Iteration gewünscht',
            color: 'border-pink-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <h3 className="text-white font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="flex flex-wrap gap-3 text-xs mb-3">
              <span>Trainierbar: <Tag color="purple">{item.trainable}</Tag></span>
              <span>Speicher: <Tag color="blue">{item.memory}</Tag></span>
              <span>Qualität: <Tag color="green">{item.quality}</Tag></span>
              <span>Speed: <Tag color="cyan">{item.speed}</Tag></span>
            </div>
            <p className="text-gray-600 text-xs">💡 Wann: {item.when}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function WannWasSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Lightbulb className="w-9 h-9" />} title="Wann welche Fine-Tuning Methode?" subtitle="Der vollständige Entscheidungsbaum" />
      <P>
        Die Wahl der Fine-Tuning-Methode hängt von VRAM, Datenmenge, Qualitätsanforderungen und 
        Trainingsgeschwindigkeit ab. Dieser Entscheidungsbaum führt dich zur optimalen Wahl.
      </P>

      <H2>Schritt-für-Schritt Entscheidungsbaum</H2>
      <div className="space-y-4">
        {[
          {
            step: '1. VRAM ermitteln',
            question: 'Wie viel GPU-VRAM hast du?',
            options: [
              { label: '< 6 GB', result: '→ QLoRA mit Gradient Checkpointing', detail: 'Einzige realistische Option. RTX 3060 6GB: 7B mit QLoRA gerade so möglich.' },
              { label: '6–10 GB', result: '→ QLoRA oder LoRA (kleines Modell)', detail: 'RTX 3070/4060 Ti: QLoRA für 7B, LoRA für 1B–3B Modelle.' },
              { label: '12–16 GB', result: '→ LoRA (fp16/bf16) für 7B', detail: 'RTX 3080/4070: Standard LoRA sehr komfortabel. QLoRA für 13B.' },
              { label: '24+ GB', result: '→ Full FT oder LoRA', detail: 'RTX 3090/4090: Full FT für kleine Modelle, LoRA für 7B sehr effizient.' },
            ],
            color: 'border-violet-400/20',
          },
          {
            step: '2. Datenmenge prüfen',
            question: 'Wie viele Trainingsbeispiele hast du?',
            options: [
              { label: '< 200 Beispiele', result: '→ LoRA rank=4–8, hoher Dropout', detail: 'Wenige Parameter trainieren = weniger Overfitting-Risiko.' },
              { label: '200–2.000 Beispiele', result: '→ LoRA rank=8–16', detail: 'Standard Setup. Early Stopping aktivieren.' },
              { label: '> 2.000 Beispiele', result: '→ LoRA rank=16–32 oder Full FT (wenn VRAM)', detail: 'Genug Daten für mehr Modellkapazität.' },
            ],
            color: 'border-blue-400/20',
          },
          {
            step: '3. Use Case bewerten',
            question: 'Was soll das Modell lernen?',
            options: [
              { label: 'Stil/Ton anpassen', result: '→ LoRA rank=4–8 reicht', detail: 'Einfache Aufgabe – wenig LoRA-Kapazität nötig.' },
              { label: 'Neue Domäne lernen', result: '→ LoRA rank=16–32', detail: 'Mehr Kapazität für neues Domänenwissen.' },
              { label: 'Fundamental neu trainieren', result: '→ Full Fine-Tuning', detail: 'Wenn Modell sein Kernverhalten ändern soll.' },
              { label: 'Mehrere Tasks, ein Modell', result: '→ LoRA Adapter pro Task', detail: 'Basis-Modell einmal, Adapter für jeden Task separat.' },
            ],
            color: 'border-cyan-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <Tag color="purple">{item.step}</Tag>
              <h3 className="text-white font-bold">{item.question}</h3>
            </div>
            <div className="space-y-2">
              {item.options.map((opt, j) => (
                <div key={j} className="flex flex-wrap gap-3 items-start text-sm py-2 border-b border-white/5 last:border-0">
                  <Tag color="yellow">{opt.label}</Tag>
                  <span className="text-violet-300 font-bold">{opt.result}</span>
                  <span className="text-gray-500 text-xs">{opt.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <H2>Quick-Reference Tabelle</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {['Szenario', 'Methode', 'Rank', 'LR', 'Epochen'].map(h => (
                <th key={h} className="text-left text-gray-400 py-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { s: '7B LoRA, RTX 3070', m: 'QLoRA', r: '16', lr: '2e-4', e: '3–5' },
              { s: '7B LoRA, RTX 3090', m: 'LoRA (bf16)', r: '16', lr: '2e-4', e: '3–5' },
              { s: '1B Full FT, RTX 3080', m: 'Full FT (bf16)', r: '—', lr: '5e-5', e: '2–3' },
              { s: 'BERT Klassifikation', m: 'Full FT oder LoRA', r: '8', lr: '2e-5', e: '3' },
              { s: 'Wenig Daten (< 300)', m: 'QLoRA rank=4', r: '4', lr: '1e-4', e: '5–10' },
              { s: 'Viel Daten (> 10K)', m: 'LoRA rank=32', r: '32', lr: '2e-4', e: '1–3' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-2 pr-4 text-gray-400">{row.s}</td>
                <td className="py-2 pr-4 text-violet-300 font-mono">{row.m}</td>
                <td className="py-2 pr-4 text-cyan-300">{row.r}</td>
                <td className="py-2 pr-4 text-yellow-300">{row.lr}</td>
                <td className="py-2 text-green-300">{row.e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox type="success" title="FrameTrain Empfehlung für 90% der Fälle">
        LoRA (rank=16) + QLoRA wenn VRAM knapp + Early Stopping + Cosine LR Decay + 
        weight_decay=0.01 + warmup=5% der Steps. Damit funktioniert nahezu jedes Fine-Tuning-Projekt.
      </InfoBox>
    </div>
  )
}

export default function FineTuningPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'full-finetuning': return <FullFineTuningSection />
      case 'lora-deep': return <LoRADeepSection />
      case 'qlora': return <QLoRASection />
      case 'peft-methoden': return <PEFTMethodenSection />
      case 'wann-was': return <WannWasSection />
      default: return <FullFineTuningSection />
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
            <span className="text-gray-300">🔧 Fine-Tuning Methoden</span>
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
