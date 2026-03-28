'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Database, Settings, Sparkles, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react'
import {
  CHAPTERS, SubPageLayout,
  InfoBox, SectionTitle, H2, H3, P, Highlight, CodeBlock, Tag
} from '../_shared'

const CHAPTER_ID = 'dataset-mastery'
const sections = CHAPTERS.find(c => c.id === CHAPTER_ID)!.items

function DatenQualitaetSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Database className="w-9 h-9" />} title="Datenqualität & -menge" subtitle="Die wichtigste Grundlage für jedes erfolgreiche Training" />

      <InfoBox type="warning" title="Garbage In, Garbage Out – das eiserne Gesetz des ML">
        Das beste Modell und die perfektesten Hyperparameter können aus schlechten Daten keine guten Ergebnisse machen. 
        Datenqualität übertrumpft fast immer Modellgröße und Hyperparameter-Tuning.
      </InfoBox>

      <H2>Wie viele Daten brauche ich?</H2>
      <P>
        Die benötigte Datenmenge hängt stark von der Aufgabe, dem Basismodell und der gewünschten Qualität ab. 
        Als grobe Richtlinien (für Fine-Tuning auf vortrainierten Modellen):
      </P>
      <div className="space-y-2">
        {[
          { task: 'Binäre Klassifikation (z.B. Positiv/Negativ)', min: '100–500', good: '1.000–5.000', ideal: '10.000+' },
          { task: 'Multi-Klassen (5–20 Klassen)', min: '500–2.000', good: '5.000–20.000', ideal: '50.000+' },
          { task: 'Named Entity Recognition (NER)', min: '1.000 Sätze', good: '5.000–10.000', ideal: '50.000+' },
          { task: 'Instruction Following / Chat', min: '500–1.000', good: '5.000–10.000', ideal: '50.000+' },
          { task: 'Stilanpassung / Domain Adaptation', min: '100–500', good: '1.000–5.000', ideal: '10.000+' },
          { task: 'Übersetzung (spezifische Domäne)', min: '2.000 Paare', good: '10.000–50.000', ideal: '100.000+' },
          { task: 'Zusammenfassung', min: '1.000 Paare', good: '5.000–20.000', ideal: '50.000+' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid md:grid-cols-4 gap-2 text-sm">
            <span className="text-gray-300 md:col-span-1">{row.task}</span>
            <span className="text-red-400">Min: {row.min}</span>
            <span className="text-yellow-400">Gut: {row.good}</span>
            <span className="text-green-400">Ideal: {row.ideal}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs">Hinweis: Diese Werte gelten für Fine-Tuning auf starken vortrainierten Modellen. Training von Scratch benötigt 10–100× mehr Daten.</p>

      <H2>Qualität &gt; Quantität</H2>
      <P>
        Bei LLMs ist <Highlight>Qualität deutlich wichtiger als Quantität</Highlight>. 
        100 perfekt kuratierte Beispiele schlagen oft 1.000 schlechte. 
        Das InstructGPT-Paper zeigte: 13.000 sorgfältig ausgewählte RLHF-Beispiele reichten, 
        um GPT-3 zu einem hilfreichen Assistenten zu machen.
      </P>

      <H2>Datenqualitäts-Checkliste</H2>
      <div className="space-y-2">
        {[
          { check: 'Keine oder wenige Duplikate', how: 'Exact-Match oder Fuzzy-Dedup (MinHash). Duplikate lassen das Modell diese Beispiele stärker gewichten.', critical: true },
          { check: 'Korrekte Labels (manuelle Stichproben)', how: '5–10% des Datasets manuell prüfen. Fehlerhafte Labels sind häufiger als gedacht.', critical: true },
          { check: 'Konsistente Formatierung', how: 'Einheitliches Encoding (UTF-8), konsistente Trennzeichen, einheitliche Label-Schreibweise.', critical: true },
          { check: 'Keine korrupten/extremen Einträge', how: 'Filter: min_length=10 Zeichen, max_length=2048 Token. HTML-Tags entfernen.', critical: false },
          { check: 'Ausgewogene Klassenverteilung', how: 'Imbalance-Ratio messen. Wenn >5:1: Balancing erwägen (Kapitel 4 in diesem Abschnitt).', critical: false },
          { check: 'Repräsentativer Inhalt', how: 'Testdaten sollen echter späterer Nutzung entsprechen. Kein "einfacheres" Dataset als in Produktion.', critical: true },
          { check: 'Kein Data Leakage', how: 'Strikte Trennung Train/Val/Test. Kein Test-Material im Training.', critical: true },
          { check: 'Datenschutz und Lizenzen geprüft', how: 'Keine PII (personenbezogene Daten) ohne Anonymisierung. Lizenzen der Quelldaten prüfen.', critical: false },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-4 flex gap-3 ${item.critical ? 'border-green-400/20' : 'border-white/10'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.critical ? 'text-green-400' : 'text-gray-600'}`} />
            <div>
              <p className="text-white font-semibold text-sm">{item.check}</p>
              <p className="text-gray-500 text-xs mt-1">{item.how}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Datenquellen und ihre Qualität</H2>
      <div className="space-y-2">
        {[
          { source: 'Manuell annotierte Daten', quality: 'Sehr hoch', cost: 'Sehr hoch', note: 'Gold-Standard' },
          { source: 'Crowd-sourced (MTurk, etc.)', quality: 'Mittel–Hoch', cost: 'Mittel', note: 'Qualitätskontrolle nötig' },
          { source: 'LLM-generierte Daten', quality: 'Mittel', cost: 'Niedrig', note: 'Halluzinationen filtern' },
          { source: 'Web-Scraping (gefiltert)', quality: 'Mittel', cost: 'Niedrig', note: 'Intensive Filterung nötig' },
          { source: 'Synthetisch (Regel-basiert)', quality: 'Niedrig–Mittel', cost: 'Sehr niedrig', note: 'Begrenzte Vielfalt' },
          { source: 'Bestehende öffentliche Datasets', quality: 'Variiert', cost: 'Sehr niedrig', note: 'Lizenz prüfen!' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
            <span className="text-gray-300">{row.source}</span>
            <span className={`font-semibold ${row.quality.includes('Sehr hoch') ? 'text-green-400' : row.quality.includes('hoch') || row.quality.includes('Hoch') ? 'text-yellow-400' : 'text-orange-400'}`}>{row.quality}</span>
            <span className="text-gray-500">{row.cost}</span>
            <span className="text-gray-600 text-xs">{row.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreprocessingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Settings className="w-9 h-9" />} title="Preprocessing" subtitle="Daten optimal vorbereiten für maximale Trainingsqualität" />
      <P>
        Gutes <Highlight>Preprocessing</Highlight> kann die Modell-Performance um 10–30% verbessern. 
        Es ist die am meisten unterschätzte Phase des ML-Pipelines.
      </P>

      <H2>Text-Preprocessing Pipeline</H2>
      <CodeBlock>{`# Vollständige Text-Preprocessing Pipeline:

import re
from bs4 import BeautifulSoup

def preprocess_text(text: str) -> str | None:
    # 1. Encoding normalisieren
    text = text.encode('utf-8', errors='ignore').decode('utf-8')
    
    # 2. HTML-Tags entfernen
    text = BeautifulSoup(text, 'html.parser').get_text()
    
    # 3. URLs entfernen (optional)
    text = re.sub(r'https?://\S+', '[URL]', text)
    
    # 4. Whitespace normalisieren
    text = ' '.join(text.split())
    
    # 5. Sonderzeichen bereinigen (vorsichtig!)
    # Achtung: Nicht zu aggressiv – Satzzeichen sind wichtig!
    text = re.sub(r'[^\w\s\.,!?;:\'\"()\-–—€$%@#]', '', text)
    
    # 6. Längen filtern
    word_count = len(text.split())
    if word_count < 5:
        return None  # Zu kurz
    if word_count > 512:
        text = ' '.join(text.split()[:512])  # Truncate
    
    return text.strip()

# Labels normalisieren
def normalize_label(label: str) -> str:
    return label.strip().lower().replace(' ', '_')`}</CodeBlock>

      <H2>Deduplication – unterschätzter Qualitätsbooster</H2>
      <P>
        Duplikate im Training lassen das Modell diese Beispiele überproportional stark gewichten. 
        Bei Web-Scraping kann bis zu 30% des Datasets dupliziert sein!
      </P>
      <CodeBlock>{`# Exact Deduplication:
import hashlib

def deduplicate_exact(dataset: list[dict]) -> list[dict]:
    seen = set()
    unique = []
    for item in dataset:
        h = hashlib.md5(item['text'].encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            unique.append(item)
    return unique

# Fuzzy Deduplication (ähnliche Texte):
# Nutze MinHash / LSH für effiziente Near-Duplicate Detection
# Library: datasketch
from datasketch import MinHash, MinHashLSH
# → findet auch Duplikate mit kleinen Abweichungen`}</CodeBlock>

      <H2>Tokenisierung verstehen</H2>
      <P>
        <Highlight>Tokenisierung</Highlight> wandelt Text in Zahlen (Token-IDs) um. 
        Jedes Modell hat seinen eigenen Tokenizer – falsche Tokenisierung = Garbage-Daten.
      </P>
      <CodeBlock>{`# Tokenisierung mit dem richtigen Tokenizer:
from transformers import AutoTokenizer

# WICHTIG: Immer den Tokenizer des Basismodells nutzen!
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# Token-Länge messen VOR dem Training:
lengths = [len(tokenizer(text)['input_ids']) for text in texts]
print(f"Median: {sorted(lengths)[len(lengths)//2]} Token")
print(f"P95:    {sorted(lengths)[int(len(lengths)*0.95)]} Token")
print(f"Max:    {max(lengths)} Token")

# max_length basierend auf P95 wählen (nicht Max!)
# → spart Speicher, verliert nur 5% der Länge`}</CodeBlock>

      <H2>Sequenzlänge (max_length) richtig wählen</H2>
      <div className="space-y-2">
        {[
          { task: 'Kurze Satz-Klassifikation', length: '64–128', note: 'Sentiment, Spam' },
          { task: 'Absatz-Klassifikation / NER', length: '256–512', note: 'Reviews, News' },
          { task: 'Dokument-Klassifikation', length: '512–1.024', note: 'Lange Texte' },
          { task: 'LLM Instruction Tuning', length: '1.024–2.048', note: 'Chat-Konversationen' },
          { task: 'LLM Long-Context Fine-Tuning', length: '4.096–8.192', note: 'Benötigt viel VRAM!' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 flex justify-between items-center text-sm">
            <span className="text-gray-400">{row.task}</span>
            <code className="text-violet-300 font-mono">max_length = {row.length}</code>
            <span className="text-gray-600 text-xs hidden md:block">{row.note}</span>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="VRAM und Sequenzlänge">
        Attention ist O(n²) bzgl. Sequenzlänge. Verdopplung der Sequenzlänge = 4× mehr VRAM für Attention. 
        Wähle max_length basierend auf dem 95. Perzentil deiner Daten, nicht dem Maximum.
      </InfoBox>

      <H2>Dataset-Format für FrameTrain</H2>
      <CodeBlock>{`# Klassifikation (JSON):
{"text": "Das Produkt ist toll!", "label": "positiv"}
{"text": "Lieferung kam nie an.", "label": "negativ"}

# Instruction Following / Chat (JSON):
{"instruction": "Übersetze auf Englisch:", 
 "input": "Das Wetter ist schön.",
 "output": "The weather is nice."}

# NER (JSON mit Spans):
{"text": "Apple wurde 1976 in Cupertino gegründet.",
 "entities": [{"start": 0, "end": 5, "label": "ORG"},
               {"start": 22, "end": 31, "label": "LOC"}]}`}</CodeBlock>
    </div>
  )
}

function AugmentationSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles className="w-9 h-9" />} title="Data Augmentation" subtitle="Dataset künstlich vergrößern und diversifizieren" />
      <P>
        <Highlight>Data Augmentation</Highlight> erstellt neue, sinnvolle Trainingsbeispiele aus bestehenden. 
        Besonders wertvoll wenn Daten knapp sind oder die Verteilung diversifiziert werden soll.
      </P>

      <H2>Text-Augmentation Techniken im Detail</H2>
      <div className="space-y-5">
        {[
          {
            name: 'Back-Translation ⭐',
            quality: 'Sehr hoch',
            desc: 'Text in eine andere Sprache übersetzen, dann zurückübersetzten. Erstellt semantisch identische, sprachlich diverse Varianten.',
            example: '"Das Produkt ist sehr hochwertig." → EN: "The product is very high-quality." → DE: "Das Produkt ist äußerst qualitativ."',
            code: `# Mit Helsinki-NLP Modellen:
from transformers import pipeline
de_to_en = pipeline("translation_de_to_en")
en_to_de = pipeline("translation_en_to_de")

def back_translate(text):
    en = de_to_en(text)[0]['translation_text']
    return en_to_de(en)[0]['translation_text']`,
            pros: 'Semantisch korrekt, natürliche Sprachvarianz',
            cons: 'Langsam (2× Übersetzung), API-Kosten',
          },
          {
            name: 'LLM-basierte Paraphrase ⭐',
            quality: 'Sehr hoch',
            desc: 'Ein LLM generiert semantisch äquivalente Varianten eines Textes. Aktuell beste Methode für NLP-Augmentation.',
            example: '"Generiere 3 verschiedene Formulierungen mit gleicher Bedeutung: Das Gerät ist defekt."',
            code: `# Mit lokalem LLM (Ollama/LM Studio):
prompt = """Erstelle 3 verschiedene Formulierungen 
mit der exakt gleichen Bedeutung:
{original_text}
Gib nur die 3 Varianten aus, eine pro Zeile."""`,
            pros: 'Höchste Qualität, sehr divers',
            cons: 'API-Kosten oder lokale GPU nötig',
          },
          {
            name: 'Synonym-Replacement',
            quality: 'Mittel',
            desc: 'Wörter durch Synonyme ersetzen (via WordNet, GermaNet für Deutsch). Einfach, aber Bedeutung kann sich leicht verschieben.',
            example: '"Das Produkt ist gut." → "Das Produkt ist prima."',
            code: `# Mit NLTK WordNet:
from nltk.corpus import wordnet

def replace_synonyms(text, n_replace=2):
    words = text.split()
    # Zufällige Wörter durch Synonyme ersetzen
    ...`,
            pros: 'Sehr schnell, kein LLM nötig',
            cons: 'Kann Bedeutung ändern, begrenzte Vielfalt',
          },
          {
            name: 'Random Deletion / Insertion',
            quality: 'Niedrig–Mittel',
            desc: 'Zufällig Wörter löschen, hinzufügen oder tauschen. Macht das Modell robuster gegen Rauschen.',
            example: '"Das Produkt ist sehr gut." → "Das Produkt gut." (Deletion)',
            code: `def random_deletion(text, p=0.1):
    words = text.split()
    if len(words) == 1: return text
    return ' '.join([w for w in words 
                     if random.random() > p])`,
            pros: 'Sehr schnell, einfach implementiert',
            cons: 'Kann Texte sinnlos machen, niedrige Qualität',
          },
        ].map((item, i) => (
          <div key={i} className="glass border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <h3 className="text-white font-bold">{item.name}</h3>
              <Tag color="green">Qualität: {item.quality}</Tag>
            </div>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <div className="bg-gray-900/60 rounded-lg p-3 text-xs text-gray-400 font-mono mb-3">
              Beispiel: {item.example}
            </div>
            <CodeBlock>{item.code}</CodeBlock>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-green-400 font-semibold mb-1">✓ Vorteile:</p><p className="text-gray-400">{item.pros}</p></div>
              <div><p className="text-red-400 font-semibold mb-1">✗ Nachteile:</p><p className="text-gray-400">{item.cons}</p></div>
            </div>
          </div>
        ))}
      </div>

      <H2>Augmentation-Strategie</H2>
      <CodeBlock>{`Empfohlene Augmentation-Pipeline:

  1. Originaldaten bereinigen (Preprocessing)
  2. Back-Translation für wichtige/seltene Klassen (×2)
  3. LLM-Paraphrase für kritische Beispiele (×2–3)
  4. Synonym-Replacement für schnelle Vervielfachung (×1)

  Ergebnis: Dataset-Größe ×5–8 mit hoher Qualität

Wichtig: Augmentierte Daten IMMER separat labeln
  → z.B. source: "original" vs. source: "augmented"
  → ermöglicht Qualitäts-Analyse nach dem Training`}</CodeBlock>

      <InfoBox type="warning" title="Augmentation richtig einsetzen">
        Augmentation ersetzt keine echten Daten – es ergänzt sie. 
        Wenn möglich: Priorität auf echte Daten sammeln. 
        Augmentation für seltene Klassen oder zur Diversifizierung, nicht als Ersatz.
      </InfoBox>
    </div>
  )
}

function BalancingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={<BarChart3 className="w-9 h-9" />} title="Klassen-Balancing" subtitle="Unbalancierte Datasets korrekt behandeln" />
      <P>
        Ein <Highlight>unbalanciertes Dataset</Highlight> – z.B. 95% negative, 5% positive Beispiele – 
        führt dazu, dass das Modell die häufige Klasse bevorzugt. Es lernt, "fast immer negativ" 
        zu sagen: trivial, aber nützlos.
      </P>

      <H2>Imbalance erkennen und messen</H2>
      <CodeBlock>{`# Imbalance messen:
import pandas as pd
df = pd.read_csv('train.csv')
counts = df['label'].value_counts()
print(counts)
# negativ    4750
# positiv     250
# → Ratio 19:1 → starke Imbalance!

# Faustregel:
# < 3:1    → meist okay, kein Balancing nötig
# 3:1–10:1 → Balancing empfohlen
# > 10:1   → Balancing dringend nötig

# Imbalance Ratio:
ratio = counts.max() / counts.min()
print(f"Imbalance Ratio: {ratio:.1f}:1")`}</CodeBlock>

      <H2>Lösungsstrategien im Detail</H2>
      <div className="space-y-5">
        {[
          {
            name: 'Class Weights ⭐ (Empfohlen)',
            desc: 'Im Training werden seltene Klassen stärker gewichtet. Keine Datenveränderung nötig. Einfachste und sauberste Methode.',
            code: `# Class Weights berechnen:
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

weights = compute_class_weight(
    'balanced',
    classes=np.unique(labels),
    y=labels
)
class_weights = dict(enumerate(weights))
# {0: 0.53, 1: 10.0}  ← seltene Klasse 19× stärker

# In FrameTrain: "Class Weighting" aktivieren`,
            pros: 'Keine Datenverfälschung, einfach, direkt in den Optimizer',
            cons: 'Funktioniert nicht bei extremen Ratios (> 100:1)',
            color: 'border-violet-400/20',
          },
          {
            name: 'Oversampling (Minderheitsklasse vervielfachen)',
            desc: 'Seltene Klasse wird mehrfach im Training verwendet (mit oder ohne Augmentation). Einfach zu implementieren.',
            code: `# Random Oversampling:
from imblearn.over_sampling import RandomOverSampler

ros = RandomOverSampler(random_state=42)
X_res, y_res = ros.fit_resample(X, y)

# SMOTE (synthetische Beispiele):
from imblearn.over_sampling import SMOTE
smote = SMOTE(random_state=42)
X_res, y_res = smote.fit_resample(X, y)
# SMOTE für Text: Back-Translation besser!`,
            pros: 'Mehr Trainingsdaten, kein Informationsverlust',
            cons: 'Bei Random Oversampling: exakte Duplikate → leichtes Overfitting',
            color: 'border-blue-400/20',
          },
          {
            name: 'Undersampling (Mehrheitsklasse reduzieren)',
            desc: 'Häufige Klasse wird auf die Größe der seltenen Klasse reduziert. Einfach, verliert aber Informationen.',
            code: `# Random Undersampling:
from imblearn.under_sampling import RandomUnderSampler

rus = RandomUnderSampler(random_state=42)
X_res, y_res = rus.fit_resample(X, y)

# Kontrollierter: stratifiziert
min_class_size = y.value_counts().min()
balanced = df.groupby('label').sample(
    min_class_size, random_state=42)`,
            pros: 'Schnell, kein Overfitting durch Duplikate',
            cons: 'Verliert Daten. Bei kleinen Datasets problematisch',
            color: 'border-cyan-400/20',
          },
          {
            name: 'Kombination: Oversample + Undersample',
            desc: 'Hybrid-Ansatz: Minderheitsklasse leicht hochgezogen, Mehrheitsklasse leicht reduziert. Oft beste Lösung.',
            code: `# Ziel: 3:1 Ratio statt 19:1
n_minority = len(df[df.label=='positiv'])  # 250
target_majority = n_minority * 3  # 750

majority_down = df[df.label=='negativ'].sample(target_majority)
minority_up = df[df.label=='positiv'].sample(
    n_minority * 3, replace=True)  # ×3 oversample

balanced = pd.concat([majority_down, minority_up])`,
            pros: 'Gute Balance zwischen Informationsverlust und Overfitting',
            cons: 'Mehr Konfiguration nötig',
            color: 'border-green-400/20',
          },
        ].map((item, i) => (
          <div key={i} className={`glass border rounded-xl p-6 ${item.color}`}>
            <h3 className="text-white font-bold mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
            <CodeBlock>{item.code}</CodeBlock>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-green-400 font-semibold mb-1">✓</p><p className="text-gray-400">{item.pros}</p></div>
              <div><p className="text-red-400 font-semibold mb-1">✗</p><p className="text-gray-400">{item.cons}</p></div>
            </div>
          </div>
        ))}
      </div>

      <H2>Metriken bei unbalancierten Daten</H2>
      <P>
        Bei unbalancierten Datasets ist <Highlight>Accuracy täuschend</Highlight>. 
        Nutze stattdessen:
      </P>
      <div className="space-y-2">
        {[
          { metric: 'F1-Score (Macro)', when: 'Alle Klassen gleich wichtig', note: 'Mittelt F1 über alle Klassen ohne Gewichtung' },
          { metric: 'F1-Score (Weighted)', when: 'Häufige Klassen wichtiger', note: 'Gewichtet nach Klassengröße' },
          { metric: 'AUC-ROC', when: 'Binäre Klassifikation', note: 'Threshold-unabhängig, robust bei Imbalance' },
          { metric: 'MCC (Matthews Correlation)', when: 'Binär, extreme Imbalance', note: 'Beste Einzelzahl bei extremer Imbalance' },
        ].map((row, i) => (
          <div key={i} className="glass border border-white/10 rounded-lg p-3 grid md:grid-cols-3 gap-2 text-sm">
            <span className="text-violet-300 font-semibold">{row.metric}</span>
            <span className="text-gray-400">{row.when}</span>
            <span className="text-gray-600 text-xs">{row.note}</span>
          </div>
        ))}
      </div>

      <InfoBox type="success" title="FrameTrain Empfehlung">
        Nutze Class Weights als ersten Ansatz – es ist am einfachsten und meist ausreichend. 
        Wenn Imbalance-Ratio &gt; 20:1 und Class Weights nicht reichen: 
        zusätzlich Oversampling der Minderheitsklasse mit Data Augmentation (Back-Translation).
      </InfoBox>
    </div>
  )
}

export default function DatasetMasteryPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const renderSection = () => {
    switch (activeSection) {
      case 'daten-qualitaet': return <DatenQualitaetSection />
      case 'preprocessing': return <PreprocessingSection />
      case 'augmentation': return <AugmentationSection />
      case 'balancing': return <BalancingSection />
      default: return <DatenQualitaetSection />
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
            <span className="text-gray-300">📦 Dataset-Mastery</span>
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
