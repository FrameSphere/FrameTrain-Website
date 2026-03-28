'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LineChart, CheckCircle2, AlertTriangle, TrendingDown, Activity, ChevronRight } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag,
  GoodTrainingChart, OverfittingChart, UnderfittingChart, HighLRChart
} from '../_shared'

const CHAPTER_ID = 'trainingsverlauf'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function LossKurvenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<LineChart className="w-9 h-9" />} title="Loss-Kurven interpretieren" subtitle="Das Herzstück des Trainingsmonitorings" />
      <P>
        Die <Highlight>Loss-Kurve</Highlight> ist dein wichtigstes Diagnosewerkzeug. 
        Ein geübtes Auge erkennt in Sekunden, ob das Training gesund läuft, Probleme entstehen 
        oder sofortiger Handlungsbedarf besteht.
      </P>

      <H2>Anatomie einer Loss-Kurve</H2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { title: 'X-Achse: Zeit', color: 'border-white/10', desc: 'Trainingsschritte (Steps) oder Epochen. Je weiter rechts, desto länger wurde trainiert. Steps geben mehr Granularität.' },
          { title: 'Y-Achse: Loss-Wert', color: 'border-white/10', desc: 'Der Fehler des Modells. Niedriger = besser. Ziel: möglichst schnell auf ein niedriges, stabiles Niveau sinken.' },
          { title: 'Training Loss (lila)', color: 'border-violet-400/20', desc: 'Fehler auf Trainingsdaten. Berechnet nach jedem Batch. Oft etwas rauschig durch Stochastizität.' },
          { title: 'Validation Loss (gestrichelt)', color: 'border-cyan-400/20', desc: 'Fehler auf Validation-Daten. Glatter als Training Loss. Der entscheidende Indikator für echte Performance.' },
        ].map((item, i) => (
          <div key={i} className={`glass border ${item.color} rounded-xl p-4`}>
            <h3 className="text-white font-semibold mb-2 text-sm">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <H2>Die 4 grundlegenden Loss-Kurven-Muster</H2>
      <GoodTrainingChart />
      <P><Highlight>Gutes Training:</Highlight> Beide Kurven sinken gleichmäßig und konvergieren auf einen niedrigen Wert. 
      Kleiner, stabiler Gap zwischen Training und Validation Loss. Am Ende flacht es ab (Plateau).</P>

      <OverfittingChart />
      <P><Highlight>Overfitting:</Highlight> Training Loss sinkt weiter, Validation Loss beginnt zu steigen. 
      Der Divergenzpunkt markiert den optimalen Trainingszeitpunkt (Early Stopping!)</P>

      <UnderfittingChart />
      <P><Highlight>Underfitting:</Highlight> Beide Kurven stagnieren auf hohem Niveau. 
      Das Modell lernt die Muster nicht. Ursachen: LR zu niedrig, zu wenige Epochen, falsches Modell.</P>

      <HighLRChart />
      <P><Highlight>Instabiles Training (LR zu hoch):</Highlight> Starke Oszillation, kein Konvergieren. 
      Der Optimizer springt immer über das Minimum hinaus. Lösung: LR reduzieren.</P>

      <H2>Richtwerte für "gute" Loss-Werte</H2>
      <div className="glass border border-white/10 rounded-xl p-5">
        <div className="space-y-3">
          {[
            { metric: 'Cross-Entropy (Binäre Klassifikation)', good: '< 0.2', ok: '0.2–0.5', bad: '> 0.5' },
            { metric: 'Cross-Entropy (Multi-Klassen)', good: '< 0.5', ok: '0.5–1.0', bad: '> 1.0' },
            { metric: 'Cross-Entropy (LLM / Sprachmodell)', good: '< 1.5', ok: '1.5–3.0', bad: '> 3.0' },
            { metric: 'Perplexity (LLM)', good: '< 10', ok: '10–50', bad: '> 50' },
            { metric: 'MSE (normalisierte Daten)', good: '< 0.05', ok: '0.05–0.2', bad: '> 0.2' },
          ].map((row, i) => (
            <div key={i} className="flex gap-3 items-center text-sm flex-wrap">
              <span className="text-gray-400 flex-1 min-w-0">{row.metric}</span>
              <Tag color="green">✓ {row.good}</Tag>
              <Tag color="yellow">~ {row.ok}</Tag>
              <Tag color="red">✗ {row.bad}</Tag>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-4">Hinweis: Absolute Werte hängen stark von Task und Modell ab. Trend und Vergleich sind wichtiger als absolute Zahlen.</p>
      </div>

      <H2>Loss-Kurven in FrameTrain lesen</H2>
      <P>
        Im FrameTrain Monitoring-Panel siehst du Training Loss und Validation Loss in Echtzeit. 
        Das Dashboard zeigt sowohl Steps als auch Epochen auf der X-Achse. 
        <Highlight> Aktionen basierend auf dem Validation Loss</Highlight> — nicht dem Training Loss!
      </P>
    </div>
  )
}

function GutesTrainingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<CheckCircle2 className="w-9 h-9" />} title="Gutes Training erkennen" subtitle="Die Zeichen eines erfolgreichen, stabilen Trainings" />

      <InfoBox type="success" title="Das Ideal-Szenario">
        Training Loss und Validation Loss sinken beide gleichmäßig, bleiben nah beieinander (kleiner Generalisierungsgap) und flachen am Ende auf einem niedrigen, stabilen Plateau ab.
      </InfoBox>

      <GoodTrainingChart />

      <H2>Checkliste: 6 Zeichen von gutem Training</H2>
      <div className="space-y-3">
        {[
          { check: 'Beide Losses sinken in den ersten Epochen deutlich', detail: 'Zeigt aktives Lernen. Wenn Losses ab Epoche 1 kaum sinken → Underfitting, LR zu niedrig oder Datenproblem.' },
          { check: 'Training Loss ≈ Validation Loss (kleiner, stabiler Gap)', detail: 'Typischerweise ist Val Loss 5–15% höher. Riesiger Gap = Overfitting. Kein Gap = Underfitting oder identische Daten (Data Leakage!).' },
          { check: 'Kurven werden am Ende flacher (Plateau)', detail: 'Das Modell nähert sich seinem Maximum auf diesem Dataset. Normal und gewünscht.' },
          { check: 'Keine großen Sprünge (Spikes) im Loss', detail: 'Gelegentlich kleine Spikes sind normal. Große, wiederkehrende Spikes = LR zu hoch oder fehlerhafte Daten.' },
          { check: 'Validation Accuracy steigt monoton oder nahezu so', detail: 'Kleine Schwankungen sind normal. Langfristiger Aufwärtstrend zeigt echte Verbesserung.' },
          { check: 'Validation Loss erreicht Minimum und stabilisiert sich', detail: 'Das ist der optimale Checkpoint. Hier ist das ideale Modell gespeichert.' },
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

      <H2>Training-Phasen verstehen</H2>
      <div className="space-y-3">
        {[
          { phase: 'Phase 1: Schnelles Lernen (Epochen 1–3)', desc: 'Loss fällt steil. Das Modell lernt die offensichtlichsten Muster. Validation Loss folgt eng dem Training Loss.', color: 'border-violet-400/30' },
          { phase: 'Phase 2: Verfeinerung (Epochen 4–8)', desc: 'Loss sinkt langsamer. Subtilere Muster werden gelernt. Der Generalisierungs-Gap kann sich leicht öffnen.', color: 'border-blue-400/30' },
          { phase: 'Phase 3: Konvergenz / Plateau (ab Epoche 8+)', desc: 'Kaum noch Verbesserung. Training Loss minimal unter Validation Loss. Guter Zeitpunkt zum Stoppen.', color: 'border-cyan-400/30' },
          { phase: 'Phase 4 (falls zu lange): Overfitting', desc: 'Training Loss sinkt weiter, Validation Loss steigt. Ab hier: besten Checkpoint laden.', color: 'border-red-400/30' },
        ].map((item, i) => (
          <div key={i} className={`glass border ${item.color} rounded-xl p-4`}>
            <h3 className="text-white font-semibold mb-1 text-sm">{item.phase}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <H2>Wann ist das Training optimal beendet?</H2>
      <div className="space-y-2">
        {[
          { signal: 'Validation Loss flacht ab, schwankt nur minimal (±0.001)', action: 'Noch 2–3 Epochen Geduld, dann stoppen. Besten Checkpoint laden.' },
          { signal: 'Validation Loss steigt zum ersten Mal an', action: 'Das war die beste Epoche. Best Checkpoint laden und stoppen.' },
          { signal: 'Validation Loss steigt für 3 Epochen in Folge', action: 'Early Stopping ausgelöst. Best Checkpoint ist optimal.' },
          { signal: 'Training Loss << Validation Loss (großer Gap)', action: 'Overfitting. Entweder zurück zum besten Checkpoint oder Training abbrechen.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4">
            <p className="text-gray-300 text-sm">{item.signal}</p>
            <p className="text-violet-400 text-xs font-semibold mt-1">→ {item.action}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function OverfittingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<AlertTriangle className="w-9 h-9" />} title="Overfitting erkennen" subtitle="Wenn das Modell die Trainingsdaten auswendig lernt" />
      <P>
        <Highlight>Overfitting</Highlight> ist das häufigste Problem beim Training tiefer Netze. 
        Das Modell lernt die Trainingsdaten so gut, dass es auch Rauschen und zufällige Artefakte 
        memoriert. Auf neuen, ungesehenen Daten performt es dann deutlich schlechter.
      </P>

      <OverfittingChart />

      <H2>Klare Erkennungszeichen</H2>
      <div className="space-y-3">
        {[
          { sign: 'Training Loss sinkt kontinuierlich, Validation Loss steigt', severity: 'Kritisch' },
          { sign: 'Großer, wachsender Abstand zwischen Training und Validation Loss', severity: 'Warnung' },
          { sign: 'Training Accuracy nahe 100%, Validation Accuracy deutlich niedriger', severity: 'Kritisch' },
          { sign: 'Modell performt auf Trainingsdaten sehr gut, auf neuen Daten schlecht', severity: 'Kritisch' },
          { sign: 'Validation Loss macht nach anfänglichem Sinken eine U-Kurve', severity: 'Warnung' },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-4 flex justify-between items-center ${item.severity === 'Kritisch' ? 'border-red-400/30' : 'border-orange-400/30'}`}>
            <p className="text-gray-300 text-sm">{item.sign}</p>
            <Tag color={item.severity === 'Kritisch' ? 'red' : 'yellow'}>{item.severity}</Tag>
          </div>
        ))}
      </div>

      <H2>Warum passiert Overfitting? (Ursachen)</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { cause: 'Zu wenig Trainingsdaten', detail: 'Wenig Beispiele = Modell lernt sie auswendig statt Muster. Lösung: Mehr Daten sammeln oder Augmentation.' },
          { cause: 'Zu viele Trainings-Epochen', detail: 'Langes Training schleift Trainingsdaten immer tiefer ein. Early Stopping wäre die Lösung gewesen.' },
          { cause: 'Modell zu komplex für die Datenmenge', detail: 'Zu viele Parameter für wenig Daten = zu viel Kapazität zum Memorieren. Kleineres Modell oder LoRA mit kleinem Rank.' },
          { cause: 'Kein Dropout / zu wenig Regularisierung', detail: 'Ohne Regularisierung: Modell lernt freier. Mehr Dropout oder Weight Decay einsetzen.' },
          { cause: 'Zu homogenes Dataset', detail: 'Dataset enthält Duplikate oder sehr ähnliche Beispiele. Deduplizierung hilft.' },
          { cause: 'Datenleck (Data Leakage)', detail: 'Test-Daten im Training: Modell hat "gespickt". Metriken scheinbar gut, echte Performance schlecht.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <h3 className="text-red-300 font-semibold mb-1 text-sm">{item.cause}</h3>
            <p className="text-gray-400 text-sm">{item.detail}</p>
          </div>
        ))}
      </div>

      <H2>Der Bias-Varianz-Tradeoff</H2>
      <P>
        Overfitting und Underfitting sind die zwei Seiten des klassischen 
        <Highlight> Bias-Varianz-Tradeoffs</Highlight>:
      </P>
      <div className="glass border border-white/10 rounded-xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="glass border border-orange-400/20 rounded-xl p-4">
            <p className="text-orange-400 font-bold text-lg mb-2">Underfitting</p>
            <p className="text-gray-400">Hoher Bias</p>
            <p className="text-gray-400">Niedrige Varianz</p>
            <p className="text-gray-500 text-xs mt-2">Modell zu einfach</p>
          </div>
          <div className="glass border border-green-400/20 rounded-xl p-4">
            <p className="text-green-400 font-bold text-lg mb-2">Ideal</p>
            <p className="text-gray-400">Bias ↔ Varianz</p>
            <p className="text-gray-400">Ausgewogen</p>
            <p className="text-gray-500 text-xs mt-2">Sweet Spot</p>
          </div>
          <div className="glass border border-red-400/20 rounded-xl p-4">
            <p className="text-red-400 font-bold text-lg mb-2">Overfitting</p>
            <p className="text-gray-400">Niedriger Bias</p>
            <p className="text-gray-400">Hohe Varianz</p>
            <p className="text-gray-500 text-xs mt-2">Modell zu komplex</p>
          </div>
        </div>
      </div>

      <InfoBox type="info" title="Leichtes Overfitting ist normal">
        Ein kleiner Gap zwischen Training Loss und Validation Loss ist immer vorhanden und normal. 
        Erst wenn der Gap groß ist UND Validation Loss steigt, wird es problematisch.
        Im Fine-Tuning mit LoRA ist Overfitting seltener, da nur wenige Parameter trainiert werden.
      </InfoBox>
    </div>
  )
}

function UnderfittingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<TrendingDown className="w-9 h-9" />} title="Underfitting erkennen" subtitle="Wenn das Modell die Muster nicht lernt" />
      <P>
        <Highlight>Underfitting</Highlight> bedeutet, dass das Modell die zugrundeliegenden Muster 
        in den Daten nicht erfasst. Es performt sowohl auf Trainings- als auch auf Validation-Daten schlecht. 
        Es ist das Gegenteil von Overfitting.
      </P>

      <UnderfittingChart />

      <H2>Erkennungszeichen</H2>
      <div className="space-y-3">
        {[
          { sign: 'Hoher Training Loss, der sich nach Epochen kaum verändert', detail: 'Das schlimmste Zeichen – das Modell lernt praktisch nichts.' },
          { sign: 'Hoher Validation Loss korreliert mit Training Loss (beide hoch)', detail: 'Beide Kurven liegen nahe beieinander, aber auf hohem Niveau.' },
          { sign: 'Niedrige Training Accuracy (< 60–70% auf einfachen Tasks)', detail: 'Kann noch nicht mal die eigenen Trainingsdaten klassifizieren.' },
          { sign: 'Loss-Kurve flacht sehr früh ab ohne tief zu sinken', detail: 'Stagnation nach wenigen Steps – kein weiterer Lernfortschritt.' },
          { sign: 'Val Loss und Train Loss fast identisch, aber beide hoch', detail: 'Kein Overfitting, aber auch kein Lernen – Modell ist zu simpel.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-orange-400/20 rounded-xl p-4">
            <p className="text-orange-300 font-semibold text-sm">{item.sign}</p>
            <p className="text-gray-500 text-xs mt-1">{item.detail}</p>
          </div>
        ))}
      </div>

      <H2>Ursachen und direkte Fixes</H2>
      <div className="space-y-3">
        {[
          { cause: 'Learning Rate zu niedrig', check: 'Loss sinkt <0.01 pro Epoche', fix: 'LR um Faktor 3–10 erhöhen. Starte mit 1e-5, probiere 3e-5, dann 1e-4.' },
          { cause: 'Zu wenige Epochen', check: 'Training Loss sinkt noch bei letzter Epoche', fix: 'Epochen verdoppeln. Loss-Kurve zeigt, ob Potential noch vorhanden.' },
          { cause: 'Modell zu klein / zu simpel', check: 'Auch lange Training verbessert nicht', fix: 'Größeres Basismodell wählen: BERT → RoBERTa → DeBERTa oder 7B Modell statt 1B.' },
          { cause: 'Falscher Optimizer', check: 'SGD ohne Momentum bei transformers', fix: 'AdamW statt SGD. AdamW ist Standard für alle Transformer-Trainings.' },
          { cause: 'Zu hoher Dropout', check: 'Train und Val Loss beide hoch und ähnlich', fix: 'Dropout auf 0.0 setzen zum Testen, dann schrittweise erhöhen.' },
          { cause: 'Falsche Daten-Formatierung', check: 'Loss ist von Anfang an konstant (kein Sinken)', fix: 'Dataset-Format genau prüfen: Stimmt Tokenisierung? Stimmen Labels (0-indiziert vs. 1-indiziert)?' },
          { cause: 'Gradient Vanishing bei sehr tiefen Netzen', check: 'Gradienten nahe 0 in frühen Layers', fix: 'Layer Normalization prüfen, Residual Connections sicherstellen, Initialisierung.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <div className="flex gap-2 items-start mb-2">
              <Tag color="yellow">Ursache</Tag>
              <h3 className="text-orange-300 font-semibold text-sm">{item.cause}</h3>
            </div>
            <p className="text-gray-600 text-xs mb-2">Erkennen: {item.check}</p>
            <p className="text-gray-400 text-sm">→ Fix: {item.fix}</p>
          </div>
        ))}
      </div>

      <InfoBox type="warning" title="Underfitting schnell diagnostizieren">
        Trainiere kurz (1–2 Epochen) auf einem sehr kleinen Subset (~50 Beispiele). 
        Ein gut konfiguriertes Modell sollte auf 50 Beispielen fast 100% Training Accuracy erreichen (Overfitting auf Mini-Dataset). 
        Falls nicht → Underfitting-Problem auf Daten-Format oder LR prüfen.
      </InfoBox>
    </div>
  )
}

function InstabilesTrainingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Activity className="w-9 h-9" />} title="Instabiles Training" subtitle="Loss-Spikes, Explosionen und Chaos diagnostizieren" />
      <P>
        Instabiles Training äußert sich durch starke Schwankungen, plötzliche Sprünge oder den 
        kompletten Absturz des Loss. Diese Muster haben klare Ursachen und lösbare Fixes.
      </P>

      <HighLRChart />

      <H2>Instabilitätsmuster und ihre Bedeutung</H2>
      <div className="space-y-4">
        {[
          {
            pattern: 'Starke Oszillation: Loss springt hoch und runter jede Epoche',
            cause: 'Learning Rate zu hoch',
            desc: 'Der Optimizer "springt" über das Minimum hinaus und schaukelt sich auf. Kein Konvergieren möglich.',
            fix: 'LR um Faktor 5–10 reduzieren. LR-Warmup hinzufügen.',
            color: 'border-yellow-400/20',
          },
          {
            pattern: 'Einzelner großer Spike → Training erholt sich',
            cause: 'Schlechtes Batch / Ausreißer in Daten',
            desc: 'Ein fehlerhaftes oder extrem schwieriges Batch hat einen temporären Spike verursacht. Gradient Clipping hilft.',
            fix: 'Gradient Clipping (max_grad_norm=1.0) aktivieren. Datensatz auf Ausreißer prüfen.',
            color: 'border-orange-400/20',
          },
          {
            pattern: 'Loss explodiert und wird NaN oder Inf',
            cause: 'Gradient Explosion',
            desc: 'Gradienten wachsen exponentiell, bis numerische Werte instabil werden. Training bricht ab.',
            fix: 'Gradient Clipping auf 1.0. LR drastisch reduzieren. Mixed Precision deaktivieren oder auf fp32 wechseln.',
            color: 'border-red-400/20',
          },
          {
            pattern: 'Loss steigt plötzlich nach vielen guten Epochen',
            cause: 'LR Spike durch falschen Scheduler / zu langer Warmup',
            desc: 'Ein falscher LR-Scheduler kann die LR plötzlich erhöhen. Oder: ein sehr ungewöhnlicher Batch nach langer Stabilität.',
            fix: 'Scheduler-Konfiguration prüfen. Best Checkpoint laden. Gradient Clipping.',
            color: 'border-pink-400/20',
          },
          {
            pattern: 'Regelmäßige, sanfte Wellen im Loss',
            cause: 'Cosine Annealing mit Restarts (SGDR)',
            desc: 'Kein Problem! Cyclische LR-Scheduler erzeugen bewusst zyklische Loss-Muster. Jeder Zyklus konvergiert neu.',
            fix: 'Nur wenn unerwünscht: anderen Scheduler wählen. Sonst: geplantes Verhalten.',
            color: 'border-blue-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <h3 className="text-white font-bold text-sm flex-1">{item.pattern}</h3>
              <Tag color="yellow">{item.cause}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-green-400 text-xs font-semibold">→ Fix: {item.fix}</p>
          </div>
        ))}
      </div>

      <H2>Gradient Clipping – die wichtigste Schutzmaßnahme</H2>
      <P>
        <Highlight>Gradient Clipping</Highlight> begrenzt die maximale Norm der Gradienten. 
        Falls Gradienten zu groß werden, werden sie proportional skaliert. 
        Standard-Wert: <code className="text-violet-300">max_grad_norm = 1.0</code>
      </P>
      <CodeBlock>{`Ohne Gradient Clipping:
  Gradient = [0.01, 0.02, ..., 500.0]  ← Explosion!
  → Weight Update riesig → Training bricht ab (NaN)

Mit Gradient Clipping (max_norm = 1.0):
  Gradient-Norm = sqrt(sum(g²)) = 500.01
  Wenn norm > 1.0: gradient = gradient × (1.0 / norm)
  → Gradient wird skaliert, Richtung bleibt erhalten
  → sicherer Update, Training bleibt stabil

In FrameTrain: standardmäßig auf 1.0 gesetzt.`}</CodeBlock>

      <InfoBox type="success" title="FrameTrain schützt automatisch">
        Gradient Clipping ist in FrameTrain standardmäßig aktiviert (max_grad_norm = 1.0). 
        Das fängt die meisten Explosions-Probleme automatisch ab. 
        Bei NaN-Loss trotzdem: LR reduzieren und Daten auf Ausreißer prüfen.
      </InfoBox>
    </div>
  )
}

export default function TrainingsverlaufPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'loss-kurven': return <LossKurvenSection />
      case 'gutes-training': return <GutesTrainingSection />
      case 'overfitting': return <OverfittingSection />
      case 'underfitting': return <UnderfittingSection />
      case 'instabiles-training': return <InstabilesTrainingSection />
      default: return <LossKurvenSection />
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
            <span className="text-gray-300">📈 Trainingsverlauf lesen</span>
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
