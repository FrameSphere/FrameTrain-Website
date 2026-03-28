'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Activity, Target, BarChart3, GitBranch, ChevronRight } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag, DataSplitDiagram
} from '../_shared'

const CHAPTER_ID = 'training-verstehen'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function TrainingLoopSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Activity className="w-9 h-9" />} title="Der Trainings-Loop" subtitle="Was genau passiert, wenn du auf 'Training starten' klickst?" />
      <P>
        Wenn FrameTrain das Training startet, läuft ein präziser, sich wiederholender Zyklus ab. 
        Jeder dieser Zyklen heißt <Highlight>Step</Highlight>. Das Verstehen dieses Loops hilft dir, 
        Probleme zu erkennen, Logs zu lesen und Hyperparameter sinnvoll einzustellen.
      </P>

      <H2>Der vollständige Trainings-Loop</H2>
      <CodeBlock>{`Für jede Epoche (1 bis num_epochs):
  ┌─ Für jeden Batch (1 bis dataset_size / batch_size):
  │   1. Batch laden           → nächste B Trainingsbeispiele
  │   2. Forward Pass          → Prediction berechnen
  │   3. Loss berechnen        → Prediction vs. Label
  │   4. Backward Pass         → Gradienten berechnen (autograd)
  │   5. Gradient Clipping     → max_grad_norm (optional, verhindert Explosion)
  │   6. optimizer.step()      → Gewichte aktualisieren
  │   7. optimizer.zero_grad() → Gradienten zurücksetzen (!)
  │   8. scheduler.step()      → LR anpassen (falls Scheduler aktiv)
  └─ Ende Batch

  Nach jeder Epoche (oder alle N Steps):
  9. Validation Loop        → Loss & Metriken auf Val-Set messen
  10. Metriken loggen       → Accuracy, F1, Perplexity etc.
  11. Checkpoint speichern  → wenn beste Val-Performance erreicht
  12. Early Stopping prüfen → Abbruch falls keine Verbesserung`}</CodeBlock>

      <H2>Trainings-Modus vs. Evaluierungs-Modus</H2>
      <P>
        Pytorch und alle modernen Frameworks unterscheiden zwei Modi. Dieser Unterschied ist 
        <Highlight> kritisch</Highlight> und wird oft vergessen:
      </P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-violet-400/20 rounded-xl p-5">
          <h3 className="text-violet-300 font-bold mb-3">model.train() – Training Mode</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Dropout-Layer ist <strong className="text-white">aktiv</strong></li>
            <li>✓ BatchNorm nutzt Batch-Statistiken</li>
            <li>✓ Gradienten werden berechnet</li>
            <li>✓ Gewichte werden angepasst</li>
            <li className="text-gray-600">→ Höherer Loss als beim Evaluieren (Dropout)</li>
          </ul>
        </div>
        <div className="glass border border-cyan-400/20 rounded-xl p-5">
          <h3 className="text-cyan-300 font-bold mb-3">model.eval() – Evaluation Mode</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✗ Dropout-Layer ist <strong className="text-white">deaktiviert</strong></li>
            <li>✓ BatchNorm nutzt globale Laufstatistiken</li>
            <li>✗ Gradienten werden NICHT berechnet (torch.no_grad())</li>
            <li>✗ Gewichte werden NICHT verändert</li>
            <li className="text-gray-600">→ Ehrliche Messung der echten Performance</li>
          </ul>
        </div>
      </div>

      <InfoBox type="warning" title="Häufiger Fehler: Validation im falschen Modus">
        Wer vergisst, vor der Validation auf eval() zu wechseln, bekommt einen niedrigeren 
        Validation Loss als in Wirklichkeit (Dropout deaktiviert Neuronen im Train-Modus).
        FrameTrain behandelt das automatisch korrekt.
      </InfoBox>

      <H2>Was ist ein "Step" genau?</H2>
      <P>
        Ein <Highlight>Step</Highlight> = 1 Batch forward + backward + Gewichts-Update. 
        Die Gesamtzahl der Steps bestimmt, wie viel das Modell insgesamt lernt:
      </P>
      <CodeBlock>{`Total Steps = ⌈dataset_size / batch_size⌉ × num_epochs

Beispiel:
  Dataset:   1.000 Trainingsbeispiele
  Batch Size: 8
  Epochen:   3

  Steps/Epoche = ⌈1.000/8⌉ = 125
  Total Steps  = 125 × 3 = 375

Praktische Faustregel:
  Für LLM Fine-Tuning: ~500–2.000 Steps meist ausreichend
  Für Klassifikation:  ~200–1.000 Steps reichen oft`}</CodeBlock>

      <H2>Checkpointing-Strategie</H2>
      <div className="space-y-3">
        {[
          { name: 'Best Checkpoint', desc: 'Speichere nur das Modell mit dem besten Validation Loss. Spart Speicherplatz. Empfohlen für Produktion.', rec: '⭐ Standard' },
          { name: 'Every N Steps/Epochs', desc: 'Speichere regelmäßig, unabhängig von Performance. Nützlich um Training fortzusetzen nach Absturz.', rec: 'Für lange Trainings' },
          { name: 'Last N Checkpoints', desc: 'Behalte nur die letzten N Checkpoints. Für Ensemble-Training oder Analyse des Trainingsverlaufs.', rec: 'Für Experimente' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4 flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">{item.name}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
            <Tag color="green">{item.rec}</Tag>
          </div>
        ))}
      </div>
    </div>
  )
}

function LossFunktionenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Target className="w-9 h-9" />} title="Loss-Funktionen" subtitle="Der Kompass des Trainings – welche Funktion für welche Aufgabe?" />
      <P>
        Die <Highlight>Loss-Funktion</Highlight> ist das Herzstück des Trainings: Sie misst, wie falsch das Modell 
        aktuell liegt und gibt dem Optimizer die Richtung vor. Die Wahl der richtigen Loss-Funktion 
        ist genauso wichtig wie die Modellarchitektur.
      </P>

      <H2>Die wichtigsten Loss-Funktionen im Detail</H2>
      <div className="space-y-5">
        {[
          {
            name: 'Cross-Entropy Loss (CE)',
            formula: 'L = -1/N Σᵢ Σₖ yᵢₖ · log(ŷᵢₖ)',
            use: 'Klassifikation & Sprachmodelle',
            desc: 'Standard für alle Klassifikationsaufgaben. Bestraft falsche Klassen logarithmisch – je sicherer das Modell falsch liegt, desto drastischer die Strafe. Wird auch beim LLM-Training zur Token-Vorhersage genutzt.',
            example: 'Spam-Erkennung, Sentiment-Analyse, alle LLMs',
            color: 'border-violet-400/20',
            tip: 'In FrameTrain: automatisch für Sprachmodelle und Klassifikation gewählt.',
          },
          {
            name: 'Binary Cross-Entropy (BCE)',
            formula: 'L = -(y·log(ŷ) + (1-y)·log(1-ŷ))',
            use: 'Binäre Klassifikation',
            desc: 'Spezialfall von CE für genau zwei Klassen. Sigmoid-Ausgabe zwischen 0 und 1. Gut für Ja/Nein-Entscheidungen.',
            example: 'Gut/Schlecht, Positiv/Negativ, Spam/Kein Spam',
            color: 'border-blue-400/20',
            tip: 'Effizienter als CE mit 2 Klassen, bei großen Datasets merkbar.',
          },
          {
            name: 'Mean Squared Error (MSE)',
            formula: 'L = 1/N Σᵢ (yᵢ - ŷᵢ)²',
            use: 'Regression (kontinuierliche Werte)',
            desc: 'Misst quadratischen Abstand zwischen Vorhersage und Ziel. Sehr sensitiv auf Ausreißer (quadratische Strafe). Glatter Gradient als MAE.',
            example: 'Preisvorhersage, Temperatur-Regression',
            color: 'border-cyan-400/20',
            tip: 'Wenn Ausreißer im Dataset: lieber MAE oder Huber Loss verwenden.',
          },
          {
            name: 'Mean Absolute Error (MAE)',
            formula: 'L = 1/N Σᵢ |yᵢ - ŷᵢ|',
            use: 'Regression (robust gegen Ausreißer)',
            desc: 'Misst absoluten Abstand. Robuster als MSE bei Ausreißern, weil Strafe linear statt quadratisch. Kein differenzierbarer Gradient bei 0.',
            example: 'Zeitreihen mit Ausreißern, finanzielle Daten',
            color: 'border-green-400/20',
            tip: 'Huber Loss kombiniert MSE (nahe am Ziel) und MAE (weit entfernt) – beste Kombination.',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color}`}>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
              <h3 className="text-white font-bold text-lg">{item.name}</h3>
              <Tag color="purple">{item.use}</Tag>
            </div>
            <code className="text-violet-300 text-sm font-mono block mb-3 bg-gray-900/40 rounded-lg px-3 py-2">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-500 text-xs mb-3">Beispiele: {item.example}</p>
            <div className="flex items-start gap-2 bg-white/3 rounded-lg p-3">
              <span className="text-blue-400 text-xs">💡</span>
              <p className="text-blue-300 text-xs">{item.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Spezielle Loss-Funktionen für LLMs</H2>
      <div className="space-y-3">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">Causal Language Modeling Loss (CLM)</h3>
          <p className="text-gray-400 text-sm mb-3">
            Standard für alle autoregressive Decoder-Modelle (GPT, LLaMA, Mistral). 
            Cross-Entropy über alle Token-Positionen: Das Modell lernt, das nächste Token vorherzusagen.
          </p>
          <CodeBlock>{`Input:  [BOS] "Ich liebe "
Target: "Ich liebe " [Pizza]  ← das nächste Token vorhersagen

Loss = -log P(Pizza | "Ich liebe")
       + eventuell weitere Token-Positionen`}</CodeBlock>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">Masked Language Modeling Loss (MLM)</h3>
          <p className="text-gray-400 text-sm mb-3">
            Für BERT-artige Encoder. 15% der Token werden maskiert, das Modell soll sie vorhersagen. 
            Bidirektionaler Kontext – das Modell sieht Tokens vor und nach dem maskierten Token.
          </p>
          <CodeBlock>{`Input:  "Ich [MASK] Pizza sehr gern."
Target: "Ich  liebe  Pizza sehr gern."  ← [MASK] = "liebe"

Loss = Cross-Entropy nur auf maskierten Positionen`}</CodeBlock>
        </div>
      </div>

      <InfoBox type="info" title="FrameTrain wählt automatisch">
        Für LLMs (GPT, LLaMA etc.): CLM Loss. Für BERT-artige: MLM Loss. 
        Für Klassifikations-Heads: Cross-Entropy. Du musst nur das Modell und die Aufgabe wählen.
      </InfoBox>
    </div>
  )
}

function MetrikenSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<BarChart3 className="w-9 h-9" />} title="Metriken & Auswertung" subtitle="Was sagen Accuracy, F1, Perplexity und BLEU wirklich aus?" />
      <P>
        Der Loss ist der interne Trainingskompass. Metriken sind die 
        <Highlight> menschlich interpretierbaren</Highlight> Leistungsindikatoren. 
        Ein niedriger Loss garantiert keine guten Metriken – und umgekehrt.
      </P>

      <H2>Klassifikations-Metriken im Detail</H2>

      <H3>Die Konfusionsmatrix – das Fundament</H3>
      <div className="glass border border-white/10 rounded-xl p-5 mb-4">
        <div className="grid grid-cols-3 gap-2 text-sm text-center max-w-sm mx-auto">
          <div className="text-gray-600 col-start-2 pb-2">Vorhergesagt: Pos.</div>
          <div className="text-gray-600 pb-2">Vorhergesagt: Neg.</div>
          <div className="text-gray-600 flex items-center justify-end pr-2">Tatsächlich: Pos.</div>
          <div className="bg-green-500/20 border border-green-400/30 rounded p-3 font-bold text-green-400">TP<br/><span className="text-xs font-normal">True Positive</span></div>
          <div className="bg-red-500/20 border border-red-400/30 rounded p-3 font-bold text-red-400">FN<br/><span className="text-xs font-normal">False Negative</span></div>
          <div className="text-gray-600 flex items-center justify-end pr-2">Tatsächlich: Neg.</div>
          <div className="bg-red-500/20 border border-red-400/30 rounded p-3 font-bold text-orange-400">FP<br/><span className="text-xs font-normal">False Positive</span></div>
          <div className="bg-green-500/20 border border-green-400/30 rounded p-3 font-bold text-cyan-400">TN<br/><span className="text-xs font-normal">True Negative</span></div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          {
            name: 'Accuracy (Genauigkeit)',
            formula: '(TP + TN) / (TP + TN + FP + FN)',
            desc: 'Anteil aller korrekten Vorhersagen. Einfach zu verstehen, aber bei unbalancierten Datasets irreführend.',
            warning: 'Problem: Bei 99% negativen Beispielen erreicht ein Modell, das IMMER "negativ" sagt, 99% Accuracy – und hat nichts gelernt!',
          },
          {
            name: 'Precision (Präzision)',
            formula: 'TP / (TP + FP)',
            desc: 'Von allen als positiv klassifizierten Fällen: wie viele sind wirklich positiv? Wichtig wenn False Positives teuer sind (z.B. Spam-Filter → kein echtes Mail soll als Spam markiert werden).',
            warning: null,
          },
          {
            name: 'Recall (Trefferquote / Sensitivity)',
            formula: 'TP / (TP + FN)',
            desc: 'Von allen echten positiven Fällen: wie viele wurden gefunden? Wichtig wenn False Negatives gefährlich sind (z.B. Krankheitserkennung → keine echte Krankheit soll übersehen werden).',
            warning: null,
          },
          {
            name: 'F1-Score',
            formula: '2 × (Precision × Recall) / (Precision + Recall)',
            desc: 'Harmonisches Mittel aus Precision und Recall. Die beste Einzelzahl bei unbalancierten Datasets. Bestraft extreme Ungleichgewichte zwischen Precision und Recall.',
            warning: null,
          },
          {
            name: 'AUC-ROC',
            formula: 'Fläche unter der ROC-Kurve (0–1)',
            desc: 'Misst die Fähigkeit des Modells, Klassen zu trennen, unabhängig vom Klassifikations-Threshold. 1.0 = perfekt, 0.5 = zufällig.',
            warning: null,
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">{item.name}</h3>
            <code className="text-violet-300 text-sm font-mono block mb-2">{item.formula}</code>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            {item.warning && (
              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
                <p className="text-yellow-400 text-xs">⚠️ {item.warning}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <H2>Sprachmodell-Metriken</H2>
      <div className="space-y-4">
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">Perplexity (PPL)</h3>
          <p className="text-gray-400 text-sm mb-3">
            Die wichtigste Metrik für Sprachmodelle. Misst, wie "überrascht" das Modell von den Testdaten ist. 
            <Highlight> Niedrigere Perplexity = besser</Highlight>. 
            Ein Wert von 10 bedeutet: Das Modell muss im Durchschnitt zwischen ~10 gleich wahrscheinlichen Token wählen.
          </p>
          <CodeBlock>{`Perplexity = exp(Cross-Entropy Loss)

Beispiele:
  PPL = 5   → sehr gutes Sprachmodell (sicher in Vorhersagen)
  PPL = 20  → mittelmäßig
  PPL = 100 → schlechtes Modell (sehr unsicher)
  PPL = e^0 = 1 → perfekte Vorhersage (unmöglich in der Praxis)`}</CodeBlock>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">BLEU Score</h3>
          <p className="text-gray-400 text-sm mb-2">
            Für Übersetzung und Text-Generierung. Vergleicht generierte Texte mit Referenz-Texten 
            auf Basis von N-Gramm-Übereinstimmungen (1-Gram bis 4-Gram). Wert zwischen 0 und 1.
          </p>
          <p className="text-gray-500 text-xs">Richtlinien: BLEU &gt; 0.4 = gute Übersetzung, &gt; 0.6 = sehr gut, &gt; 0.8 = fast menschlich</p>
        </div>
        <div className="glass border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">ROUGE (für Zusammenfassungen)</h3>
          <p className="text-gray-400 text-sm">
            ROUGE-1, ROUGE-2, ROUGE-L messen Recall von N-Grammen gegenüber Referenz-Zusammenfassungen. 
            Standard für Summarization Tasks.
          </p>
        </div>
      </div>

      <H2>Wann welche Metrik vertrauen?</H2>
      <div className="space-y-2">
        {[
          { situation: 'Ausgeglichenes Dataset (50/50 Klassen)', metric: 'Accuracy', reason: 'Direkt interpretierbar' },
          { situation: 'Stark unbalanciertes Dataset', metric: 'F1-Score oder AUC-ROC', reason: 'Accuracy täuscht' },
          { situation: 'False Positives teuer (Spam)', metric: 'Precision', reason: 'Kein Echtes als Spam markieren' },
          { situation: 'False Negatives teuer (Krankheit)', metric: 'Recall', reason: 'Nichts Echtes übersehen' },
          { situation: 'Sprachmodell evaluieren', metric: 'Perplexity + menschl. Eval', reason: 'Beide Dimensionen nötig' },
          { situation: 'Übersetzungsqualität', metric: 'BLEU + ROUGE', reason: 'N-Gramm-Überlappung als Proxy' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid md:grid-cols-3 gap-2 text-sm">
            <span className="text-gray-400">{row.situation}</span>
            <span className="text-violet-300 font-semibold">{row.metric}</span>
            <span className="text-gray-500">{row.reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrainValTestSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<GitBranch className="w-9 h-9" />} title="Train / Validation / Test Split" subtitle="Die goldene Regel des Machine Learnings" />
      <P>
        Eine der <Highlight>fundamentalsten Regeln</Highlight> des ML: Dein Dataset wird in strikt 
        getrennte Teile aufgeteilt. Ohne diese Trennung sind deine Metriken wertlos.
      </P>

      <DataSplitDiagram />

      <div className="space-y-4">
        {[
          {
            name: '🏋️ Trainings-Set (60–80%)',
            color: 'border-violet-400/30',
            role: 'Das Modell lernt AUSSCHLIESSLICH auf diesen Daten. Gewichte werden angepasst.',
            rule: 'Einzige Daten, die das Modell "sehen" darf beim Lernen.',
            dos: ['Alle Daten nutzen', 'Augmentation erlaubt', 'Shuffle zwischen Epochen'],
            donts: ['Validation/Test-Daten hier mischen'],
          },
          {
            name: '🔍 Validation-Set (10–20%)',
            color: 'border-cyan-400/30',
            role: 'Nach jeder Epoche gemessen. Dient zur Hyperparameter-Auswahl und Early Stopping. Modell lernt NICHT darauf.',
            rule: 'Darf mehrfach verwendet werden, aber nicht zum Lernen!',
            dos: ['Hyperparameter nach val_loss wählen', 'Early Stopping basierend auf val_loss', 'Checkpoint-Auswahl'],
            donts: ['Auf Validation-Daten trainieren', 'Test-Daten als Validation verwenden'],
          },
          {
            name: '🎯 Test-Set (10–20%)',
            color: 'border-green-400/30',
            role: 'Nur EINMAL am absoluten Ende verwendet. Gibt die ehrliche finale Performance-Schätzung.',
            rule: 'Das Test-Set ist heilig. Nur EINMAL anfassen!',
            dos: ['Einmalig am Ende evaluieren', 'Finale Publikation/Report'],
            donts: ['Mehrmals evaluieren', 'Hyperparameter danach noch anpassen', 'Als zweites Validation nutzen'],
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color}`}>
            <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.role}</p>
            <p className="text-gray-600 text-xs italic mb-4">Regel: {item.rule}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-green-400 text-xs font-semibold mb-2">✓ Erlaubt:</p>
                {item.dos.map((d, j) => <p key={j} className="text-gray-400 text-xs">• {d}</p>)}
              </div>
              <div>
                <p className="text-red-400 text-xs font-semibold mb-2">✗ Verboten:</p>
                {item.donts.map((d, j) => <p key={j} className="text-gray-400 text-xs">• {d}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="error" title="Data Leakage – der häufigste und verheerendste Fehler">
        <strong>Definition:</strong> Test- oder Validation-Daten "lecken" in die Trainingsdaten.<br/>
        <strong>Folge:</strong> Metriken sind optimistisch und völlig wertlos. Das Modell hat "gespickt".<br/>
        <strong>Häufige Ursache:</strong> Normalisierung/Standardisierung über gesamtes Dataset statt nur Trainingsdaten.
        Korrekt: Scaler nur auf Trainingsdaten fitten, dann auf Val/Test anwenden.
      </InfoBox>

      <H2>Cross-Validation: Wenn Daten knapp sind</H2>
      <P>
        Bei sehr wenig Daten kann ein einzelner Split unrepräsentativ sein. 
        <Highlight> K-Fold Cross-Validation</Highlight> hilft:
      </P>
      <CodeBlock>{`K-Fold Cross-Validation (k=5):

  Fold 1: [████ Train ████ Train ████ Train ████ Train] [Val]
  Fold 2: [████ Train ████ Train ████ Train] [Val] [████ Train]
  Fold 3: [████ Train ████ Train] [Val] [████ Train ████ Train]
  ...

  → 5 Modelle trainieren, 5 Val-Scores mitteln
  → Robustere Schätzung der wahren Performance
  → Aber: 5× so teuer!

  Empfohlen wenn: Dataset < 1.000 Beispiele`}</CodeBlock>

      <H2>Stratified Split – unverzichtbar bei Imbalance</H2>
      <P>
        Bei unbalancierten Klassen sicherstellt ein <Highlight>stratified split</Highlight>, 
        dass alle Splits die gleiche Klassenverteilung haben. Ohne Stratifikation kann ein Split 
        zufällig sehr wenige Beispiele einer seltenen Klasse im Validation-Set haben.
      </P>
      <CodeBlock>{`# Zufälliger Split (schlecht bei Imbalance):
  Train: 95% negativ, 5% positiv
  Val:   80% negativ, 20% positiv  ← zufällig unrepräsentativ!

# Stratified Split (immer empfohlen):
  Train: 95% negativ, 5% positiv
  Val:   95% negativ, 5% positiv  ← gleiche Verteilung ✓`}</CodeBlock>

      <InfoBox type="success" title="FrameTrain-Empfehlung">
        Nutze immer Stratified Split. Bei kleinen Datasets (&lt;1.000 Beispiele) erwäge K-Fold Cross-Validation. 
        Das Test-Set niemals für Hyperparameter-Entscheidungen nutzen.
      </InfoBox>
    </div>
  )
}

export default function TrainingVerstehenPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'training-loop': return <TrainingLoopSection />
      case 'loss-funktionen': return <LossFunktionenSection />
      case 'metriken': return <MetrikenSection />
      case 'train-val-test': return <TrainValTestSection />
      default: return <TrainingLoopSection />
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
            <span className="text-gray-300">📊 Training verstehen</span>
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