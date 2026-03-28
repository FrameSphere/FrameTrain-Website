'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield, Flame, Sliders, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag,
  HighLRChart, LowLRChart, OverfittingChart
} from '../_shared'

const CHAPTER_ID = 'diagnose'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function OverfittingFixSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Shield className="w-9 h-9" />} title="Overfitting bekämpfen" subtitle="Konkrete Maßnahmen nach Effektivität sortiert" />
      <P>
        Overfitting ist das häufigste Problem beim Training. Die gute Nachricht: Es ist gut erforscht 
        und es gibt viele bewährte Techniken. Einzeln oder kombiniert eingesetzt, lösen sie 
        praktisch jeden Overfitting-Fall.
      </P>
      <OverfittingChart />

      <H2>Die 7 effektivsten Maßnahmen gegen Overfitting</H2>
      <div className="space-y-4">
        {[
          {
            rank: '1',
            name: 'Mehr diverse Trainingsdaten',
            effect: 'Sehr hoch',
            desc: 'Mehr und diversere Daten ist immer die effektivste Maßnahme. Mehr Beispiele = das Modell kann nicht einzelne auswendig lernen.',
            how: 'Dataset vergrößern (echte Daten), Data Augmentation (Kapitel 7), synthetische Daten via LLM generieren.',
            cost: 'Hoch (Aufwand)',
            gradient: 'from-green-500 to-emerald-500',
          },
          {
            rank: '2',
            name: 'Early Stopping aktivieren',
            effect: 'Sehr hoch',
            desc: 'Stoppe das Training, bevor Overfitting beginnt. Überwache Validation Loss und stoppe wenn er aufhört zu sinken.',
            how: 'patience=3–5, monitor="val_loss", speichere immer den besten Checkpoint.',
            cost: 'Sehr niedrig',
            gradient: 'from-blue-500 to-cyan-500',
          },
          {
            rank: '3',
            name: 'LoRA mit kleinem Rank nutzen',
            effect: 'Hoch',
            desc: 'LoRA limitiert die Anzahl trainierbarer Parameter drastisch. Weniger freie Parameter = weniger Overfitting-Kapazität.',
            how: 'rank=4 oder rank=8 statt rank=32. Nur q_proj und v_proj als target_modules.',
            cost: 'Niedrig',
            gradient: 'from-violet-500 to-purple-500',
          },
          {
            rank: '4',
            name: 'Dropout erhöhen',
            effect: 'Hoch',
            desc: 'Höherer Dropout-Wert deaktiviert mehr Neuronen zufällig. Das Netz muss robustere, redundante Repräsentationen lernen.',
            how: 'LoRA dropout von 0.05 auf 0.1–0.2 erhöhen. Aufpassen: zu hoch → Underfitting.',
            cost: 'Sehr niedrig',
            gradient: 'from-orange-500 to-amber-500',
          },
          {
            rank: '5',
            name: 'Weniger Epochen trainieren',
            effect: 'Mittel',
            desc: 'Die einfachste Lösung: Einfach früher aufhören. Wenn Early Stopping zu spät reagiert.',
            how: 'Epochen halbieren. Validation Loss-Kurve zeigt wann der Wendepunkt war.',
            cost: 'Null',
            gradient: 'from-pink-500 to-rose-500',
          },
          {
            rank: '6',
            name: 'Weight Decay erhöhen (L2 Regularisierung)',
            effect: 'Mittel',
            desc: 'Bestraft große Gewichte. Hält Modell-Parameter klein und verhindert, dass das Modell einzelne Features zu stark gewichtet.',
            how: 'weight_decay von 0.01 auf 0.05–0.1 erhöhen im AdamW Optimizer.',
            cost: 'Sehr niedrig',
            gradient: 'from-teal-500 to-cyan-500',
          },
          {
            rank: '7',
            name: 'Label Smoothing aktivieren',
            effect: 'Niedrig–Mittel',
            desc: 'Statt harter 0/1-Labels werden weiche Labels verwendet (z.B. 0.9/0.05). Verhindert zu selbstsichere Vorhersagen.',
            how: 'label_smoothing=0.1. Gut wenn Modell zu confident ist.',
            cost: 'Sehr niedrig',
            gradient: 'from-indigo-500 to-violet-500',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5 flex gap-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-white font-black flex-shrink-0`}>
              {item.rank}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                <h3 className="text-white font-bold">{item.name}</h3>
                <div className="flex gap-2">
                  <Tag color="green">{item.effect}</Tag>
                  <Tag color="blue">Aufwand: {item.cost}</Tag>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
              <p className="text-violet-300 text-xs font-mono bg-gray-900/40 rounded-lg px-3 py-1">{item.how}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Kombinations-Strategien nach Situation</H2>
      <div className="space-y-3">
        {[
          {
            situation: 'Fine-Tuning mit wenig Daten (< 500 Beispiele)',
            combo: 'Early Stopping + LoRA rank=4–8 + weight_decay=0.1 + dropout=0.1',
            prio: 'Datenlimitierung ist das Hauptproblem',
          },
          {
            situation: 'Fine-Tuning mit mittelgroßem Dataset (500–5.000)',
            combo: 'Early Stopping + LoRA rank=16 + weight_decay=0.01',
            prio: 'Standard-Setup, sollte gut funktionieren',
          },
          {
            situation: 'Full Fine-Tuning mit wenig Daten',
            combo: 'Early Stopping + kleines LR (1e-5) + weight_decay=0.1 + dropout=0.2',
            prio: 'Vorsichtig! Full FT mit wenig Daten = hohes Overfitting-Risiko',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-violet-400/20 rounded-xl p-4">
            <h3 className="text-violet-300 font-semibold text-sm mb-1">{item.situation}</h3>
            <code className="text-green-400 text-xs block mb-1">{item.combo}</code>
            <p className="text-gray-600 text-xs">{item.prio}</p>
          </div>
        ))}
      </div>

      <InfoBox type="success" title="Goldene Regel für FrameTrain Fine-Tuning">
        Early Stopping + LoRA (rank=8–16) + weight_decay=0.01 ist die effektivste und unkomplizierteste Kombination. 
        Sie deckt 90% aller Overfitting-Fälle ab.
      </InfoBox>
    </div>
  )
}

function UnderfittingFixSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Flame className="w-9 h-9" />} title="Underfitting beheben" subtitle="Schritt-für-Schritt Diagnose und Lösungen" />
      <P>
        Underfitting ist oft einfacher zu beheben als Overfitting. Der erste Schritt ist immer, 
        die genaue Ursache zu identifizieren – dann folgt der passende Fix.
      </P>

      <H2>Systematischer Diagnosebaum</H2>
      <div className="space-y-4">
        {[
          {
            step: 'Schritt 1',
            question: 'Sinkt der Training Loss überhaupt in den ersten 100 Steps?',
            yes: 'Ja → weiter zu Schritt 2',
            no: 'NEIN → sofort: LR prüfen (wahrscheinlich zu niedrig), Dataset-Format prüfen (Labels korrekt?)',
            color: 'border-violet-400/20',
          },
          {
            step: 'Schritt 2',
            question: 'Sinkt Training Loss noch bei der letzten Epoche ohne Plateau?',
            yes: 'Ja → mehr Epochen trainieren (früher gestoppt)',
            no: 'Nein (Plateau aber hoch) → Schritt 3',
            color: 'border-blue-400/20',
          },
          {
            step: 'Schritt 3',
            question: 'Kann das Modell ein Mini-Dataset (50 Beispiele) overfitten?',
            yes: 'Ja (100% Train Acc) → Datenmenge erhöhen, mehr Epochen, LR prüfen',
            no: 'NEIN → fundamentales Problem: LR, Modellgröße oder Datenformat falsch',
            color: 'border-cyan-400/20',
          },
          {
            step: 'Schritt 4',
            question: 'Ist Dropout zu hoch oder Regularisierung zu stark?',
            yes: 'Ja → Dropout auf 0 setzen zum Test, Weight Decay reduzieren',
            no: 'Nein → Modell zu klein, falscher Optimizer oder LR noch immer falsch',
            color: 'border-green-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <Tag color="purple">{item.step}</Tag>
              <h3 className="text-white font-semibold text-sm">{item.question}</h3>
            </div>
            <p className="text-green-400 text-xs">✓ {item.yes}</p>
            <p className="text-red-400 text-xs mt-1">✗ {item.no}</p>
          </div>
        ))}
      </div>

      <H2>Konkrete Fixes nach Ursache</H2>
      <div className="space-y-3">
        {[
          { cause: 'Learning Rate zu niedrig', fix: 'LR schrittweise erhöhen: 1e-6 → 1e-5 → 5e-5 → 1e-4. Jedes Mal kurzes Training zum Testen.', priority: 'Sehr hoch' },
          { cause: 'Zu wenige Epochen', fix: 'Epochen verdoppeln oder verdreifachen. Auf Loss-Kurve achten: sinkt sie noch?', priority: 'Hoch' },
          { cause: 'Falsches Basismodell', fix: 'Größeres Modell: 1B → 7B, oder spezialisierteres Modell für die Domäne.', priority: 'Mittel' },
          { cause: 'Falscher Optimizer', fix: 'AdamW ist Standard. SGD ohne Warmup ist bei Transformern fast immer falsch.', priority: 'Mittel' },
          { cause: 'Fehler im Dataset', fix: 'Stichproben manuell prüfen. Sind Labels korrekt? Stimmt Tokenisierung? Encoding-Probleme?', priority: 'Sehr hoch' },
          { cause: 'Zu hoher Dropout', fix: 'Dropout temporär auf 0.0 setzen. Wenn Modell dann lernt: Dropout war zu hoch.', priority: 'Mittel' },
          { cause: 'Batch Size zu klein / Gradienten zu noisig', fix: 'Batch Size erhöhen oder Gradient Accumulation. Mehr stabile Gradienten.', priority: 'Niedrig–Mittel' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4 flex justify-between gap-4">
            <div className="flex-1">
              <p className="text-orange-300 font-semibold text-sm mb-1">{item.cause}</p>
              <p className="text-gray-400 text-sm">{item.fix}</p>
            </div>
            <Tag color={item.priority === 'Sehr hoch' ? 'red' : item.priority === 'Hoch' ? 'yellow' : 'blue'}>{item.priority}</Tag>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Der Mini-Dataset-Test – dein wichtigstes Debug-Tool">
        Trainiere 10 Epochen auf 50–100 Beispielen. Das Modell MUSS diese Daten overfitten (100% Training Accuracy).
        Falls nicht: fundamentales Problem mit LR, Datenformat oder Modell. 
        Falls ja: Konfiguration ist grundsätzlich korrekt, mehr Daten und Early Stopping lösen den Rest.
      </InfoBox>
    </div>
  )
}

function LRProblemeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sliders className="w-9 h-9" />} title="Learning Rate Probleme" subtitle="Die häufigste Fehlerquelle vollständig diagnostizieren" />
      <P>
        Die Learning Rate ist der empfindlichste aller Hyperparameter. 
        Ein Faktor von 10 zu hoch oder zu niedrig kann den Unterschied zwischen 
        perfektem Training und komplettem Versagen bedeuten.
      </P>

      <HighLRChart />
      <LowLRChart />

      <H2>LR Diagnose-Matrix</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 py-3 pr-4">Symptom</th>
              <th className="text-left text-gray-400 py-3 pr-4">Diagnose</th>
              <th className="text-left text-gray-400 py-3">Fix</th>
            </tr>
          </thead>
          <tbody>
            {[
              { symptom: 'Loss oszilliert stark, kein Konvergieren', diag: 'LR zu hoch', fix: 'LR ÷ 5–10' },
              { symptom: 'Loss sinkt <0.001 pro Epoche', diag: 'LR zu niedrig', fix: 'LR × 3–5' },
              { symptom: 'Loss explodiert (NaN/Inf)', diag: 'LR extrem zu hoch', fix: 'LR ÷ 100, Clipping prüfen' },
              { symptom: 'Loss sinkt gut, dann plötzlich Spike', diag: 'LR zu hoch ohne Warmup', fix: 'Warmup hinzufügen' },
              { symptom: 'Sehr langsamer Start, dann okay', diag: 'LR startet zu niedrig', fix: 'Warmup kürzer oder LR erhöhen' },
              { symptom: 'Plateau nach 20% Training', diag: 'LR zu niedrig für Fine-Tuning', fix: 'Cyclischen Scheduler testen' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-400 text-xs">{row.symptom}</td>
                <td className="py-3 pr-4"><Tag color="yellow">{row.diag}</Tag></td>
                <td className="py-3 text-green-400 text-xs font-mono">{row.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>LR Range Test – die beste Methode zur LR-Findung</H2>
      <P>
        Der <Highlight>LR Range Test</Highlight> ist die systematischste Methode: 
        Trainiere 1 Epoche mit exponentiell steigender LR und plotte den Loss. 
        Die optimale LR liegt kurz vor dem steilsten Abstieg.
      </P>
      <CodeBlock>{`LR Range Test Ablauf:
  1. Starte mit sehr kleiner LR (z.B. 1e-8)
  2. Erhöhe LR exponentiell jeden Step: LR × 1.3
  3. Plotte Loss vs. LR
  4. Finde den Punkt des steilsten Loss-Abstiegs
  5. Optimale LR ≈ 1/10 dieses Punktes

  Beispiel:
    Steilster Abstieg bei LR = 1e-4
    → Gute Start-LR ≈ 1e-5

  Faustregel für Transformer Fine-Tuning:
    BERT-Familie:   2e-5 bis 5e-5
    GPT/Decoder:    1e-5 bis 1e-4
    LoRA (LLaMA):   1e-4 bis 3e-4`}</CodeBlock>

      <H2>LR und Batch Size: Der Zusammenhang</H2>
      <P>
        Eine größere Batch Size bedeutet stabiler Gradienten, was eine höhere LR erlaubt. 
        Die <Highlight>Linear Scaling Rule</Highlight>:
      </P>
      <CodeBlock>{`Wenn Batch Size × 2 → LR × 2 (Linear Scaling)

Beispiel:
  Batch Size 8, LR = 2e-5 (baseline)
  Batch Size 16 → LR ≈ 4e-5
  Batch Size 32 → LR ≈ 8e-5

Achtung: Bei sehr großen Batch Sizes (> 512)
  versagt Linear Scaling → Square Root Scaling besser:
  LR ∝ sqrt(Batch Size)`}</CodeBlock>

      <H2>Warmup: Warum er so wichtig ist</H2>
      <P>
        Am Anfang des Trainings sind Gradienten unzuverlässig (zufällige Initialisierung). 
        Ein <Highlight>LR Warmup</Highlight> beginnt mit einer sehr kleinen LR und steigert sie 
        linear auf die Ziel-LR:
      </P>
      <CodeBlock>{`Ohne Warmup: sofortiger großer Update auf unzuverlässige Gradienten
            → Instabilität, mögliche frühe Divergenz

Mit Warmup:
  Steps 1–100:  LR steigt von 0 → 2e-5 (linear)
  Steps 101+:   LR bei 2e-5 oder Cosine Decay

Empfehlung: Warmup = 5–10% der Total Steps
  Bei 1000 Total Steps: 50–100 Warmup Steps`}</CodeBlock>

      <InfoBox type="success" title="Schnelle LR-Empfehlungen für FrameTrain">
        Für die meisten Fine-Tuning-Jobs: Starte mit <code className="text-violet-300">2e-5</code> für BERT-artige, 
        <code className="text-violet-300"> 2e-4</code> für LoRA. Wenn instabil: halbieren. 
        Wenn zu langsam: verdoppeln. Warmup immer aktivieren.
      </InfoBox>
    </div>
  )
}

function LossSpikeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<AlertTriangle className="w-9 h-9" />} title="Loss Spikes & Crashes" subtitle="Plötzliche Ausreißer im Training verstehen und lösen" />
      <P>
        Ein <Highlight>Loss Spike</Highlight> ist ein plötzlicher, starker Anstieg des Loss während 
        des Trainings. Das Training kann sich danach erholen – oder komplett abstürzen (Gradient Explosion).
      </P>

      <H2>Spike-Typen und ihre Diagnose</H2>
      <div className="space-y-4">
        {[
          {
            type: 'Einzelner Spike, erholt sich schnell',
            cause: 'Schlechtes Batch / Ausreißer in Daten',
            symptoms: 'Loss springt 2–10× hoch für 1–3 Steps, dann zurück zum Trend',
            solutions: [
              'Gradient Clipping aktivieren/verstärken (max_grad_norm = 0.5)',
              'Datensatz auf fehlerhafte Einträge prüfen (extrem kurze/lange Texte)',
              'Batch Size erhöhen (mittelt Ausreißer heraus)',
              'Wenn häufig: Daten-Qualitätsprüfung dringend empfohlen',
            ],
            severity: 'Moderat',
          },
          {
            type: 'Mehrere Spikes, kein Erholen',
            cause: 'LR zu hoch ohne ausreichendes Clipping',
            symptoms: 'Wiederkehrende große Spikes, allgemeine Instabilität, kein Fortschritt',
            solutions: [
              'LR um Faktor 5–10 reduzieren',
              'Warmup Phase länger machen',
              'Gradient Clipping auf 0.5 oder 0.3 senken',
              'AdamW Epsilon erhöhen (1e-8 → 1e-6)',
            ],
            severity: 'Hoch',
          },
          {
            type: 'Loss explodiert auf NaN oder Inf',
            cause: 'Gradient Explosion, numerische Instabilität',
            symptoms: 'Loss wird NaN, Training bricht ab oder gibt Fehler',
            solutions: [
              'LR drastisch reduzieren (÷100)',
              'Gradient Clipping auf 0.5 senken',
              'Mixed Precision auf fp32 wechseln (deaktiviert bf16/fp16)',
              'Layer Normalization im Modell prüfen',
              'Dataset auf extrem seltene Zeichen / Encoding-Fehler prüfen',
            ],
            severity: 'Kritisch',
          },
          {
            type: 'Loss Crash: sinkt plötzlich stark',
            cause: 'Meist POSITIV: Modell hat wichtiges Muster gelernt (Phasentransition)',
            symptoms: 'Loss fällt in kurzer Zeit auf neues niedrigeres Niveau und bleibt dort',
            solutions: [
              'Abwarten! Meist kein Problem',
              'Wenn danach wieder steigt: war echter Spike → Normal-Verhalten nach Clipping',
              'Wenn instabil bleibt: LR leicht reduzieren',
            ],
            severity: 'Meist positiv',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${
            item.severity === 'Kritisch' ? 'border-red-400/20' :
            item.severity === 'Hoch' ? 'border-orange-400/20' :
            item.severity === 'Meist positiv' ? 'border-green-400/20' : 'border-yellow-400/20'
          }`}>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
              <h3 className="text-white font-bold">{item.type}</h3>
              <Tag color={item.severity === 'Kritisch' ? 'red' : item.severity === 'Hoch' ? 'yellow' : item.severity === 'Meist positiv' ? 'green' : 'yellow'}>
                {item.severity}
              </Tag>
            </div>
            <p className="text-gray-500 text-xs mb-1">Ursache: <span className="text-gray-400">{item.cause}</span></p>
            <p className="text-gray-500 text-xs mb-3">Symptome: <span className="text-gray-400">{item.symptoms}</span></p>
            <p className="text-green-400 text-xs font-semibold mb-2">Lösungen:</p>
            <ul className="space-y-1">
              {item.solutions.map((s, j) => (
                <li key={j} className="text-gray-400 text-sm flex gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <H2>Präventive Maßnahmen gegen Spikes</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: 'Gradient Clipping', config: 'max_grad_norm = 1.0 (Standard)', desc: 'Begrenzt maximale Gradient-Norm. Schutz Nummer 1 gegen Explosionen.' },
          { name: 'LR Warmup', config: 'warmup_steps = 5–10% total', desc: 'Verhindert frühe Spikes durch unzuverlässige Gradienten am Anfang.' },
          { name: 'Daten-Bereinigung', config: 'max_length filtern, Duplikate entfernen', desc: 'Fehlerhafte oder extreme Datenpunkte sind häufige Spike-Ursachen.' },
          { name: 'bf16 statt fp16', config: 'torch_dtype=bfloat16', desc: 'BFloat16 hat größeren Zahlenbereich, weniger Overflow-Risiko als fp16.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-1 text-sm">{item.name}</h3>
            <code className="text-violet-300 text-xs block mb-2">{item.config}</code>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="FrameTrain Schutz-Defaults">
        Gradient Clipping (1.0), Warmup (100 Steps), bf16 (wenn GPU unterstützt) und 
        Daten-Validierung sind in FrameTrain standardmäßig aktiv. 
        Bei NaN-Loss: Zuerst die Daten auf fehlerhafte Zeichen und Encoding-Probleme prüfen.
      </InfoBox>
    </div>
  )
}

export default function DiagnosePage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'overfitting-fix': return <OverfittingFixSection />
      case 'underfitting-fix': return <UnderfittingFixSection />
      case 'lr-probleme': return <LRProblemeSection />
      case 'loss-spike': return <LossSpikeSection />
      default: return <OverfittingFixSection />
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
            <span className="text-gray-300">🩺 Diagnose & Fixes</span>
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
