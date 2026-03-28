'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Brain, Zap, Layers, Sparkles, BookOpen, ChevronRight
} from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag,
  NNDiagram, GradientDescentDiagram
} from '../_shared'

const CHAPTER_ID = 'ml-grundlagen'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

// ─── Section Components ───────────────────────────────────────────────────────

function WasIstMLSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Brain className="w-9 h-9" />} title="Was ist Machine Learning?" subtitle="Die Grundlage von allem – verstehe, bevor du trainierst" />

      <P>
        <Highlight>Machine Learning (ML)</Highlight> ist ein Teilgebiet der künstlichen Intelligenz, das Computer befähigt, 
        aus Erfahrung zu lernen. Statt einem Computer exakte Regeln zu geben, 
        zeigst du ihm <Highlight>Beispieldaten</Highlight> – und er findet selbst die Muster darin. 
        Das Ergebnis heißt <Highlight>Modell</Highlight>.
      </P>

      <InfoBox type="info" title="Klassische Programmierung vs. Machine Learning">
        <strong>Klassisch:</strong> Regeln + Daten → Antworten<br/>
        <strong>ML:</strong> Daten + Antworten → Regeln (das Modell)<br/>
        Beim ML lernt der Computer die Regeln selbst heraus.
      </InfoBox>

      <H2>Die drei grundlegenden Lernparadigmen</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: 'Supervised Learning',
            emoji: '🎯',
            desc: 'Du gibst dem Modell Daten MIT korrekten Antworten (Labels). Es lernt die Zuordnung von Eingabe zu Ausgabe.',
            example: 'E-Mail → "Spam" oder "Kein Spam"',
            useCase: 'Klassifikation, Regression, NLP',
            color: 'border-violet-400/30 bg-violet-500/5',
          },
          {
            title: 'Unsupervised Learning',
            emoji: '🔍',
            desc: 'Das Modell bekommt nur Daten OHNE Labels. Es sucht selbst nach Mustern, Clustern und Strukturen.',
            example: 'Kunden nach Kaufverhalten gruppieren',
            useCase: 'Clustering, Dimensionsreduktion',
            color: 'border-blue-400/30 bg-blue-500/5',
          },
          {
            title: 'Reinforcement Learning',
            emoji: '🎮',
            desc: 'Das Modell lernt durch Belohnung und Bestrafung in einer Umgebung. Es optimiert seine Strategie.',
            example: 'Schach spielen, RLHF bei ChatGPT',
            useCase: 'Robotik, Spiele, RLHF',
            color: 'border-green-400/30 bg-green-500/5',
          }
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="text-3xl mb-3">{item.emoji}</div>
            <h3 className="text-white font-bold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <p className="text-xs text-gray-500 mb-1">Beispiel: {item.example}</p>
            <p className="text-xs text-gray-600">Anwendung: {item.useCase}</p>
          </div>
        ))}
      </div>

      <H2>Wichtige ML-Begriffe – das Vokabular</H2>
      <div className="space-y-3">
        {[
          { term: 'Modell', def: 'Die "Intelligenz" – eine mathematische Funktion mit Millionen gelernter Parameter, die Eingaben auf Ausgaben abbildet.' },
          { term: 'Parameter / Gewichte', def: 'Die internen Zahlen des Modells. Sie werden beim Training optimiert und sind das "Wissen" des Modells.' },
          { term: 'Training', def: 'Der Prozess, bei dem das Modell seine Parameter durch Beispieldaten iterativ verbessert.' },
          { term: 'Inferenz', def: 'Das Anwenden des fertig trainierten Modells auf neue, ungesehene Daten.' },
          { term: 'Dataset', def: 'Die Sammlung von Trainingsbeispielen. Qualität und Quantität sind entscheidend.' },
          { term: 'Epoch', def: 'Ein vollständiger Durchlauf durch ALLE Trainingsdaten.' },
          { term: 'Batch', def: 'Eine kleine Untergruppe der Trainingsdaten, die gleichzeitig verarbeitet wird.' },
          { term: 'Loss (Verlust)', def: 'Ein Zahlenwert, der angibt, wie "falsch" das Modell aktuell liegt. Je niedriger, desto besser.' },
          { term: 'Gradient', def: 'Die mathematische Richtungsangabe, in die Parameter geändert werden müssen, um den Loss zu senken.' },
          { term: 'Overfitting', def: 'Das Modell lernt Trainingsdaten "auswendig" statt zu generalisieren – schlechte Performance auf neuen Daten.' },
          { term: 'Underfitting', def: 'Das Modell ist zu einfach oder zu kurz trainiert – schlechte Performance auf Training UND Testdaten.' },
          { term: 'Generalisierung', def: 'Die Fähigkeit, auf ungesehenen Daten gut zu performen. Das eigentliche Ziel des Trainings.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4 flex gap-4 items-start">
            <Tag>{item.term}</Tag>
            <p className="text-gray-400 text-sm">{item.def}</p>
          </div>
        ))}
      </div>

      <H2>Warum Fine-Tuning statt Training von Grund auf?</H2>
      <P>
        Ein LLM wie GPT oder LLaMA von Grund auf zu trainieren kostet <Highlight>Millionen von Euro</Highlight> 
        und erfordert tausende GPUs über Wochen. Mit <Highlight>Fine-Tuning</Highlight> nimmst du ein 
        bereits vortrainiertes Modell – das schon Sprache, Fakten und Logik kennt – und spezialisierst 
        es für deine Aufgabe. In Stunden statt Monaten, auf deiner eigenen GPU.
      </P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-gray-500/20 rounded-xl p-5">
          <h3 className="text-gray-400 font-bold mb-3">Training von Grund auf (Pretraining)</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li>⏱ Wochen bis Monate Rechenzeit</li>
            <li>💰 Hunderttausende bis Millionen €</li>
            <li>📦 Milliarden Trainingsdaten benötigt</li>
            <li>🖥 Hunderte bis tausende GPUs gleichzeitig</li>
            <li>🧑‍💻 Nur für große Organisationen realistisch</li>
          </ul>
        </div>
        <div className="glass border border-green-400/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3">Fine-Tuning (mit FrameTrain)</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>⏱ Minuten bis wenige Stunden</li>
            <li>💰 Praktisch kostenlos (eigene Hardware)</li>
            <li>📦 Hundert bis tausend Beispiele reichen</li>
            <li>🖥 1 GPU – dein eigener Computer</li>
            <li>🧑‍💻 Für jeden machbar</li>
          </ul>
        </div>
      </div>

      <H2>Transferlernen: Das Fundament von Fine-Tuning</H2>
      <P>
        Fine-Tuning basiert auf <Highlight>Transfer Learning</Highlight>: Das Vorwissen eines großen 
        vortrainierten Modells (Grammatik, Fakten, Logik, Code) wird auf eine neue, spezifische 
        Aufgabe übertragen. Nur ein Bruchteil der Parameter muss angepasst werden.
      </P>
      <div className="glass border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-24 text-center">
            <div className="text-2xl mb-1">🧠</div>
            <p className="text-xs text-gray-400">Basismodell<br/>(7B Parameter)</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-violet-400/50 to-transparent relative">
            <div className="absolute -top-3 left-1/3 text-xs text-violet-400">Fine-Tuning</div>
          </div>
          <div className="w-24 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs text-gray-400">Spezialisiertes<br/>Modell</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm text-center">
          Das Basismodell "kennt" bereits Sprache. Fine-Tuning lehrt es deinen spezifischen Anwendungsfall.
        </p>
      </div>
    </div>
  )
}

function NeuronaleNetzeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Layers className="w-9 h-9" />} title="Neuronale Netzwerke" subtitle="Die Bauweise moderner KI-Modelle verstehen" />

      <P>
        Ein <Highlight>künstliches neuronales Netz (ANN)</Highlight> ist lose vom menschlichen Gehirn inspiriert. 
        Es besteht aus Schichten von <Highlight>Neuronen</Highlight>, die miteinander verbunden sind. 
        Jede Verbindung hat ein <Highlight>Gewicht</Highlight> – das Wissen, das beim Training gelernt wird.
      </P>

      <NNDiagram />

      <H2>Wie ein einzelnes Neuron funktioniert</H2>
      <P>
        Jedes Neuron empfängt Eingaben von allen Neuronen der vorherigen Schicht, 
        multipliziert sie mit Gewichten, summiert alles auf und wendet eine 
        <Highlight> Aktivierungsfunktion</Highlight> an:
      </P>
      <CodeBlock>{`Neuron-Berechnung (vereinfacht):
  output = Aktivierung(w₁·x₁ + w₂·x₂ + ... + wₙ·xₙ + b)

  w₁...wₙ = Gewichte (werden beim Training gelernt)
  x₁...xₙ = Eingaben vom vorherigen Layer
  b        = Bias (Verschiebungswert)
  Aktivierung = Nichtlineare Funktion (ReLU, Sigmoid, etc.)

Beispiel mit ReLU:
  output = max(0, w₁·x₁ + w₂·x₂ + b)
  → alles < 0 wird zu 0 → Netz lernt "feuert / feuert nicht"`}</CodeBlock>

      <H2>Aktivierungsfunktionen</H2>
      <div className="space-y-3">
        {[
          {
            name: 'ReLU (Rectified Linear Unit)',
            formula: 'f(x) = max(0, x)',
            desc: 'Einfachste und häufigste Aktivierung. Alles unter 0 → 0, sonst linear. Schnell, wenig Vanishing Gradient.',
            use: 'Standard in Hidden Layers von klassischen Netzen',
          },
          {
            name: 'GeLU (Gaussian Error Linear Unit)',
            formula: 'f(x) ≈ x · Φ(x)',
            desc: 'Sanftere Version von ReLU, verwendet von BERT, GPT. Leicht besser für Transformer-Architekturen.',
            use: 'Transformer Feed-Forward Layers (BERT, GPT, LLaMA)',
          },
          {
            name: 'SiLU / Swish',
            formula: 'f(x) = x · σ(x)',
            desc: 'Selbstgegated, glatt und differenzierbar überall. Verwendet in neueren Architekturen wie LLaMA 2/3.',
            use: 'LLaMA, Mistral, neuere Decoder-Modelle',
          },
          {
            name: 'Softmax',
            formula: 'f(xᵢ) = e^xᵢ / Σe^xⱼ',
            desc: 'Wandelt rohe Scores in Wahrscheinlichkeiten um, die sich zu 1 summieren. Nur in Output-Layer für Klassifikation.',
            use: 'Output-Layer bei Klassifikation und LM-Head',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <code className="text-violet-300 text-xs font-mono">{item.formula}</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
            <p className="text-gray-600 text-xs">Verwendet in: {item.use}</p>
          </div>
        ))}
      </div>

      <H2>Wichtige Schichttypen in modernen Netzen</H2>
      <div className="space-y-3">
        {[
          { name: 'Dense / Fully Connected (Linear)', desc: 'Jedes Neuron mit jedem der vorherigen Schicht verbunden. Universell für Klassifikation und Regression. In Transformer: FFN-Schichten.' },
          { name: 'Embedding Layer', desc: 'Wandelt diskrete Tokens (Wörter/Zeichen) in kontinuierliche Vektoren um. Fundamental für Sprachmodelle – die "Repräsentation" jedes Wortes.' },
          { name: 'Multi-Head Attention', desc: 'Kernstück von Transformern. Mehrere parallele Attention-Köpfe berechnen Beziehungen zwischen allen Token-Paaren in der Sequenz.' },
          { name: 'Layer Normalization', desc: 'Normalisiert Aktivierungen innerhalb eines Layers. Unverzichtbar für stabile Transformer-Trainings. Verhindert explodierendes/verschwindendes Gradient-Problem.' },
          { name: 'Dropout', desc: 'Schaltet zufällig Neuronen während des Trainings ab. Erzwingt Redundanz, wirkt als starker Regularisierer gegen Overfitting.' },
          { name: 'Residual / Skip Connections', desc: 'Direktverbindung vom Eingang zum Ausgang eines Blocks (x + f(x)). Ermöglicht sehr tiefe Netze ohne Gradient-Degradierung.' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-1 text-sm">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <H2>Tiefe vs. Breite: Warum Tiefe besser ist</H2>
      <P>
        Ein tiefes Netz (viele Schichten) lernt <Highlight>hierarchische Repräsentationen</Highlight>: 
        Untere Schichten lernen einfache Muster (Kanten, Silben), mittlere Schichten kombinieren sie 
        (Formen, Wörter), obere Schichten erkennen komplexe Konzepte (Gesichter, Bedeutungen). 
        Breite allein reicht nicht.
      </P>
    </div>
  )
}

function TransformerSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles className="w-9 h-9" />} title="Transformer & LLMs" subtitle="Die Architektur hinter GPT, LLaMA, BERT & Co." />

      <P>
        Seit dem Paper <Highlight>"Attention Is All You Need" (Vaswani et al., 2017)</Highlight> dominiert 
        die Transformer-Architektur die KI-Welt. Alle modernen LLMs – GPT-4, LLaMA, Mistral, BERT – 
        basieren auf ihr. Der Schlüssel: der <Highlight>Self-Attention Mechanismus</Highlight>.
      </P>

      <InfoBox type="info" title="Revolutionäre Idee: Nur Attention, keine Rekurrenz">
        Vor Transformern wurden RNNs/LSTMs verwendet, die Text Wort für Wort verarbeiteten – 
        langsam und schlecht bei langen Kontexten. Transformer verarbeiten alle Tokens 
        gleichzeitig und können Beziehungen über beliebig lange Distanzen direkt lernen.
      </InfoBox>

      <H2>Self-Attention: Die Kernidee</H2>
      <P>
        Self-Attention erlaubt jedem Token im Text, <Highlight>jeden anderen Token zu "betrachten"</Highlight>, 
        um seinen Kontext zu verstehen. Drei Projektionen (Query, Key, Value) bestimmen, 
        wie stark jedes Token auf andere achtet:
      </P>
      <CodeBlock>{`Für jeden Token i:
  Query_i  = Token_i × W_Q    (Was suche ich?)
  Key_j    = Token_j × W_K    (Was biete ich an?)
  Value_j  = Token_j × W_V    (Was ist mein Inhalt?)

Attention-Score(i,j) = softmax(Query_i · Key_j / √d_k)
Output_i = Σ_j [Attention-Score(i,j) × Value_j]

→ Jeder Token bekommt einen Output, der eine
  gewichtete Kombination aller anderen Token ist.`}</CodeBlock>

      <H2>Multi-Head Attention</H2>
      <P>
        Statt einer einzigen Attention-Berechnung verwendet man <Highlight>h parallele Heads</Highlight>. 
        Jeder Head lernt, auf andere Arten von Beziehungen zu achten:
        Head 1 → syntaktische Abhängigkeiten, Head 2 → Koreeferenz, Head 3 → semantische Ähnlichkeit, etc.
      </P>

      <H2>Transformer-Block Aufbau</H2>
      <div className="glass border border-white/10 rounded-xl p-5">
        <div className="space-y-2 text-sm">
          {[
            { name: 'Input Embeddings + Positional Encoding', color: 'text-violet-300', desc: 'Token → Vektor; Position im Satz enkodiert' },
            { name: 'Multi-Head Self-Attention', color: 'text-blue-300', desc: 'Kontextuelles Verständnis der Beziehungen' },
            { name: '+ Residual Connection + LayerNorm', color: 'text-gray-400', desc: 'x = LayerNorm(x + Attention(x))' },
            { name: 'Feed-Forward Network (2 Dense Layers)', color: 'text-cyan-300', desc: 'Nichtlineare Transformation pro Token' },
            { name: '+ Residual Connection + LayerNorm', color: 'text-gray-400', desc: 'x = LayerNorm(x + FFN(x))' },
            { name: '→ Wiederholt für N Schichten', color: 'text-green-300', desc: 'GPT-2: 12×, LLaMA-7B: 32×, GPT-3: 96×' },
          ].map((row, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
              <span className={`${row.color} font-mono text-xs flex-1`}>{row.name}</span>
              <span className="text-gray-600 text-xs">{row.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <H2>Moderne LLMs im Überblick</H2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: 'BERT / RoBERTa', type: 'Encoder', use: 'Klassifikation, NER, Question Answering', params: '110M–355M', context: '512 Token' },
          { name: 'GPT-2 / GPT-J', type: 'Decoder', use: 'Text-Generierung, Completion', params: '124M–6B', context: '1.024–2.048' },
          { name: 'LLaMA 2/3', type: 'Decoder', use: 'Chat, Instruction Following', params: '7B–70B', context: '4.096–128K' },
          { name: 'Mistral 7B', type: 'Decoder', use: 'Effizient, stark (GQA, SWA)', params: '7B', context: '32K' },
          { name: 'T5 / Flan-T5', type: 'Enc-Dec', use: 'Übersetzung, Summarisierung', params: '60M–11B', context: '512' },
          { name: 'Phi-3 / Gemma 2B', type: 'Decoder', use: 'Kleine, effiziente Modelle', params: '2B–3.8B', context: '4K–8K' },
        ].map((m, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{m.name}</h3>
              <Tag color="purple">{m.type}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-2">{m.use}</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>📊 {m.params}</span>
              <span>📏 {m.context} Kontext</span>
            </div>
          </div>
        ))}
      </div>

      <H2>VRAM-Bedarf für LLM Fine-Tuning</H2>
      <div className="glass border border-white/10 rounded-xl p-5">
        <p className="text-sm text-gray-400 mb-4">Speicherbedarf für Full Fine-Tuning (optimistische Schätzung mit mixed precision):</p>
        <div className="space-y-2">
          {[
            { model: '125M (BERT)', ft: '~1 GB', lora: '~0.5 GB', qlora: '< 0.5 GB' },
            { model: '1B (Phi-1.5)', ft: '~6 GB', lora: '~3 GB', qlora: '~1.5 GB' },
            { model: '7B (LLaMA, Mistral)', ft: '~28 GB', lora: '~8 GB', qlora: '~4 GB' },
            { model: '13B (LLaMA-13B)', ft: '~52 GB', lora: '~14 GB', qlora: '~7 GB' },
            { model: '70B (LLaMA-70B)', ft: '~280 GB', lora: '~70 GB', qlora: '~35 GB' },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-white/5">
              <span className="text-gray-300">{row.model}</span>
              <span className="text-red-400">{row.ft}</span>
              <span className="text-yellow-400">{row.lora}</span>
              <span className="text-green-400">{row.qlora}</span>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 pt-2">
            <span>Modell</span>
            <span className="text-red-600">Full FT</span>
            <span className="text-yellow-600">LoRA</span>
            <span className="text-green-600">QLoRA</span>
          </div>
        </div>
      </div>

      <InfoBox type="success" title="Die Konsequenz: LoRA & QLoRA sind Game-Changer">
        Ohne LoRA: 7B Fine-Tuning = 28 GB VRAM (unmöglich für Consumer-GPUs).<br/>
        Mit QLoRA: 7B Fine-Tuning = ~4 GB VRAM (RTX 3070 reicht!).
      </InfoBox>
    </div>
  )
}

function WieKILerntSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Zap className="w-9 h-9" />} title='Wie KI "lernt"' subtitle="Backpropagation und Gradient Descent vollständig verstehen" />

      <P>
        Hinter jedem Training stecken zwei fundamentale Algorithmen: 
        <Highlight> Backpropagation</Highlight> (berechnet, wie falsch das Modell liegt und warum) 
        und <Highlight>Gradient Descent</Highlight> (passt die Parameter in die richtige Richtung an).
      </P>

      <H2>Der vollständige Lernzyklus</H2>
      <div className="space-y-3">
        {[
          { step: '1', title: 'Forward Pass', color: 'border-violet-400/30 bg-violet-500/5', desc: 'Trainingsdaten laufen vorwärts durch alle Schichten. Jede Schicht transformiert die Eingabe, bis eine Vorhersage (Prediction) entsteht.' },
          { step: '2', title: 'Loss berechnen', color: 'border-blue-400/30 bg-blue-500/5', desc: 'Die Prediction wird mit dem korrekten Label verglichen. Eine Loss-Funktion quantifiziert den Fehler als einzelne Zahl. Je größer, desto schlechter.' },
          { step: '3', title: 'Backward Pass (Backpropagation)', color: 'border-cyan-400/30 bg-cyan-500/5', desc: 'Mithilfe der Kettenregel der Differentialrechnung wird berechnet, wie viel jeder einzelne Parameter zum Gesamtfehler beigetragen hat. Ergebnis: ein Gradient für jeden Parameter.' },
          { step: '4', title: 'Gewichte aktualisieren', color: 'border-green-400/30 bg-green-500/5', desc: 'Optimizer verschiebt jeden Parameter entgegen dem Gradienten: W_neu = W_alt - LR × Gradient. Die Schrittgröße bestimmt die Learning Rate.' },
          { step: '5', title: 'Gradient zurücksetzen', color: 'border-yellow-400/30 bg-yellow-500/5', desc: 'Gradienten werden auf 0 gesetzt. Wichtig! Sonst akkumulieren sich Gradienten über Batches (außer bei absichtlicher Gradient Accumulation).' },
          { step: '6', title: 'Wiederholen', color: 'border-pink-400/30 bg-pink-500/5', desc: 'Dieser Zyklus wiederholt sich für jeden Batch in jeder Epoche. Nach tausenden bis Millionen Iterationen hat das Modell die Daten "gelernt".' },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-5 ${item.color}`}>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GradientDescentDiagram />

      <H2>Die Learning Rate: Der Schieberegler des Lernens</H2>
      <P>
        Die <Highlight>Learning Rate (LR)</Highlight> bestimmt, wie groß jeder Schritt bergab ist. 
        Zu groß: Man überspringt das Minimum und springt wild umher. 
        Zu klein: Man kommt fast nie an.
      </P>
      <CodeBlock>{`Gewichts-Update:
  W_neu = W_alt - α × ∂L/∂W

  α (alpha) = Learning Rate (z.B. 0.00002 = 2e-5)
  ∂L/∂W    = Gradient (Ableitung des Loss nach W)

Beispiel:
  W_alt = 0.5, Gradient = 0.3, LR = 0.01
  W_neu = 0.5 - 0.01 × 0.3 = 0.5 - 0.003 = 0.497`}</CodeBlock>

      <H2>Stochastisches Gradient Descent (SGD) vs. Batch GD</H2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: 'Full Batch GD', batch: 'Alle Daten', speed: '🐌 Langsam', quality: '🎯 Stabil', memory: '💾 Viel' },
          { name: 'Mini-Batch GD ⭐', batch: 'Kleine Batches (8–64)', speed: '⚡ Schnell', quality: '🎯 Gut', memory: '💾 Wenig' },
          { name: 'Stochastic GD', batch: '1 Beispiel', speed: '⚡ Sehr schnell', quality: '📉 Noisig', memory: '💾 Minimal' },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">{item.name}</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Batch: {item.batch}</p>
              <p>Speed: {item.speed}</p>
              <p>Qualität: {item.quality}</p>
              <p>Speicher: {item.memory}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Warum Lokale Minima kein Problem sind (bei großen LLMs)</H2>
      <P>
        In niedrig-dimensionalen Räumen (2D oder 3D) gibt es viele lokale Minima, aus denen man nicht 
        herauskommt. In hochdimensionalen Parameterräumen mit Milliarden Parametern ist das 
        <Highlight> fundamentell anders</Highlight>: Fast alle kritischen Punkte sind Sattelpunkte 
        oder flache Regionen, keine echten lokalen Minima. Zudem sind alle "guten" lokalen Minima 
        ähnlich gut wie das globale Minimum.
      </P>

      <InfoBox type="success" title="Die Kernaussage">
        Beim Fine-Tuning moderner LLMs mit AdamW und Cosine Decay ist Gradient Descent extrem stabil. 
        Das eigentliche Problem ist nicht "in welchem Minimum landet man", 
        sondern "konvergiert das Training überhaupt stabil und schnell genug?".
      </InfoBox>

      <H2>Vanishing & Exploding Gradients</H2>
      <P>
        Bei sehr tiefen Netzen können Gradienten beim Rückwärtsdurchlauf 
        <Highlight> verschwinden</Highlight> (→ Gewichte ändern sich kaum, Training stagniert) oder 
        <Highlight> explodieren</Highlight> (→ Gewichte werden riesig, Training bricht ab). 
        Moderne Architekturen lösen dies durch:
      </P>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass border border-green-400/20 rounded-xl p-4">
          <h3 className="text-green-400 font-semibold mb-2">Gegen Vanishing:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>✓ Residual Connections (Skip-Verbindungen)</li>
            <li>✓ Layer Normalization</li>
            <li>✓ Bessere Aktivierungen (ReLU, GeLU)</li>
            <li>✓ Sorgfältige Initialisierung</li>
          </ul>
        </div>
        <div className="glass border border-red-400/20 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-2">Gegen Exploding:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>✓ Gradient Clipping (max_grad_norm = 1.0)</li>
            <li>✓ Niedrigere Learning Rate</li>
            <li>✓ LR Warmup am Anfang</li>
            <li>✓ Adaptive Optimizer (Adam, AdamW)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MLGrundlagenPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)

  const renderSection = () => {
    switch (activeSection) {
      case 'was-ist-ml': return <WasIstMLSection />
      case 'neuronale-netze': return <NeuronaleNetzeSection />
      case 'transformer': return <TransformerSection />
      case 'wie-ki-lernt': return <WieKILerntSection />
      default: return <WasIstMLSection />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />
      <main className="flex-1 py-10 px-4">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/docs/ai-training-guide" className="hover:text-white transition-colors">AI Training Guide</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">🧠 ML Grundlagen</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <SubPageLayout
            currentChapterId={CHAPTER_ID}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          >
            {renderSection()}
          </SubPageLayout>
        </div>
      </main>
      <Footer />
    </div>
  )
}
