'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  HelpCircle, Search, Cpu, Shield, DollarSign, Download,
  Brain, Code2, Zap, Settings, Package, BarChart3,
  ChevronDown, ArrowRight, Sparkles, Database, Cloud
} from 'lucide-react'

type FAQ = {
  q: string
  a: string | React.ReactNode
  tags?: string[]
}

type Category = {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  faqs: FAQ[]
}

const categories: Category[] = [
  {
    id: 'general',
    label: 'Allgemein',
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'purple',
    faqs: [
      {
        q: 'Was ist FrameTrain genau?',
        a: 'FrameTrain ist eine native Desktop-Applikation für lokales Machine Learning Training. Sie ermöglicht es, vortrainierte KI-Modelle von HuggingFace auf eigene Datensätze anzupassen (Fine-Tuning) – vollständig auf deiner eigenen Hardware, ohne Cloud-Dienste, ohne Internetverbindung während des Trainings. Die App kapselt PyTorch, HuggingFace Transformers und LoRA in einer grafischen Oberfläche.',
        tags: ['Was ist FrameTrain', 'Überblick'],
      },
      {
        q: 'Für wen ist FrameTrain gedacht?',
        a: 'FrameTrain richtet sich an ML Engineers, Data Scientists, Forscher, Entwickler und technisch affine Nutzer, die KI-Modelle lokal trainieren möchten. Auch Einsteiger ohne tiefes Python-Wissen können FrameTrain nutzen, da alle Parameter über eine grafische Oberfläche konfigurierbar sind. Besonders wertvoll ist es für alle, die mit sensiblen Daten arbeiten und auf DSGVO-Konformität angewiesen sind.',
        tags: ['Zielgruppe'],
      },
      {
        q: 'Brauche ich Programmierkenntnisse?',
        a: 'Nein. FrameTrain ist so konzipiert, dass kein Code geschrieben werden muss. Modelle, Datensätze, Hyperparameter und Training-Konfigurationen werden über eine grafische Oberfläche gesteuert. Fortgeschrittene Nutzer können zusätzlich YAML-Konfigurationsdateien verwenden, das ist aber optional.',
        tags: ['Vorkenntnisse', 'Einsteiger'],
      },
      {
        q: 'Auf welchen Betriebssystemen läuft FrameTrain?',
        a: 'FrameTrain läuft nativ auf Windows 10/11 (64-bit), macOS 11+ (Intel & Apple Silicon), und Linux (Ubuntu 20.04+, Fedora 35+). Alle drei Plattformen werden vollständig unterstützt. Auf macOS Apple Silicon werden die GPUs über Metal Performance Shaders (MPS) genutzt, auf Windows und Linux über NVIDIA CUDA.',
        tags: ['Windows', 'macOS', 'Linux', 'Betriebssystem'],
      },
      {
        q: 'Was unterscheidet FrameTrain von einem einfachen Python-Script?',
        a: 'Ein Python-Script muss für jeden Use Case manuell angepasst werden. FrameTrain bietet eine stabile, getestete Umgebung mit GUI, automatischem Model Versioning, Live-Monitoring, Checkpoint-Management und reproduzierbaren Trainingsläufen – ohne dass bei jedem Projekt die Abhängigkeiten neu eingerichtet werden müssen. Außerdem ist die gesamte Trainings-Pipeline optimiert und für gängige GPU-Architekturen getestet.',
        tags: ['Vergleich', 'Python', 'Vorteil'],
      },
      {
        q: 'Kann ich FrameTrain auch ohne GPU nutzen?',
        a: 'Ja. CPU-Training ist möglich, aber deutlich langsamer als GPU-Training. Für kleine Modelle (unter 1B Parameter) und Proof-of-Concepts ist CPU-Training praktikabel. Für LLM Fine-Tuning (7B+) ist eine GPU unbedingt empfohlen.',
        tags: ['CPU', 'kein GPU'],
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Preis & Lizenz',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'green',
    faqs: [
      {
        q: 'Warum kostet FrameTrain nur 1,99€?',
        a: 'FrameTrain befindet sich in der Early-Access-Phase. Der bewusst niedrige Preis soll sicherstellen, dass möglichst viele Entwickler, Studenten und Forscher Zugang erhalten – unabhängig vom Budget. Als Gegenleistung helfen frühe Nutzer dabei, das Produkt durch Feedback und reale Use Cases zu verbessern. Der Preis wird mit zukünftigen Feature-Updates und dem Übergang aus dem Early Access steigen.',
        tags: ['Preis', 'Early Access', 'Günstig'],
      },
      {
        q: 'Ist die Zahlung wirklich einmalig? Kein verstecktes Abo?',
        a: 'Ja, vollständig einmalig. Du bezahlst 1,99€ und erhältst lebenslangen Zugang zu allen aktuellen und zukünftigen Updates der App. Es gibt keine monatliche Gebühr, kein Abo, keine Per-Training-Abrechnung. Das ist einer der Kernunterschiede zu Cloud-Diensten.',
        tags: ['Einmalig', 'Kein Abo', 'Lifetime'],
      },
      {
        q: 'Was passiert, wenn ich bezahle – bekomme ich sofort Zugang?',
        a: 'Ja. Nach der Registrierung und dem Zahlungsabschluss erhältst du sofort deinen API-Key und Zugang zum Download-Bereich für die Desktop-App. Es gibt keine manuelle Freischaltung oder Wartezeit.',
        tags: ['Zahlung', 'Sofortzugang'],
      },
      {
        q: 'Welche Zahlungsmethoden werden akzeptiert?',
        a: 'Die Zahlung wird über Stripe abgewickelt. Akzeptiert werden alle gängigen Kreditkarten (Visa, Mastercard, American Express), SEPA-Lastschrift sowie je nach Region weitere Methoden wie Google Pay und Apple Pay.',
        tags: ['Zahlung', 'Stripe', 'Kreditkarte'],
      },
      {
        q: 'Gibt es eine Rückerstattungsrichtlinie?',
        a: 'Da FrameTrain digitale Software ist, sind Rückerstattungen in der Regel nicht möglich – außer bei nachgewiesenen technischen Problemen, bei denen die Software gar nicht funktioniert. Wir empfehlen, vor dem Kauf die Systemanforderungen zu prüfen. Bei Fragen helfen wir gerne vorher weiter.',
        tags: ['Refund', 'Rückerstattung'],
      },
      {
        q: 'Gilt die Lizenz für mehrere Geräte?',
        a: 'Eine Lizenz gilt für eine Person und kann auf bis zu zwei eigenen Geräten gleichzeitig genutzt werden (z.B. Desktop + Laptop). Bei Unternehmenslizenzen für mehr Nutzer nehme bitte Kontakt auf.',
        tags: ['Lizenz', 'Mehrere Geräte', 'Team'],
      },
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware & GPU',
    icon: <Cpu className="w-5 h-5" />,
    color: 'orange',
    faqs: [
      {
        q: 'Welche GPUs werden unterstützt?',
        a: 'Unterstützt werden: alle NVIDIA-GPUs ab der GTX 10-Serie (Pascal) mit CUDA 11.0+, sowie Apple Silicon (M1, M2, M3, M4) über Metal Performance Shaders (MPS). AMD-GPUs sind aktuell nicht vollständig unterstützt (ROCm-Unterstützung ist in Planung). CPU-Fallback ist immer verfügbar.',
        tags: ['GPU', 'NVIDIA', 'CUDA', 'Apple Silicon'],
      },
      {
        q: 'Wie viel VRAM brauche ich mindestens?',
        a: (
          <div className="space-y-3">
            <p>Das hängt stark vom Modell und der Methode ab:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Szenario</th>
                    <th className="text-left py-2 text-gray-400 font-semibold">Min. VRAM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Kleine Modelle (&lt;1B, Klassifikation)', '4 GB'],
                    ['7B Modell mit QLoRA (4-Bit)', '8–10 GB'],
                    ['7B Modell mit LoRA (FP16)', '14–18 GB'],
                    ['13B Modell mit QLoRA', '12–16 GB'],
                    ['13B Modell mit LoRA (FP16)', '28+ GB'],
                  ].map(([s, v], i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 text-gray-300" dangerouslySetInnerHTML={{ __html: s }} />
                      <td className="py-2 text-green-400 font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-sm">Für den Einstieg reicht eine RTX 3060 mit 12 GB VRAM für QLoRA auf 7B-Modellen.</p>
          </div>
        ),
        tags: ['VRAM', 'GPU Anforderungen'],
      },
      {
        q: 'Funktioniert FrameTrain auf Apple M1 / M2 / M3 / M4?',
        a: 'Ja. FrameTrain unterstützt Apple Silicon vollständig über Metal Performance Shaders (MPS). Training läuft nativ auf dem Neural Engine / GPU des M-Chips. Apple M3 Max und M4 Max mit 64–128 GB Unified Memory eignen sich sogar sehr gut für das Fine-Tuning größerer Modelle.',
        tags: ['Apple', 'M1', 'M2', 'M3', 'M4', 'Metal', 'MPS'],
      },
      {
        q: 'Kann ich mehrere GPUs gleichzeitig verwenden?',
        a: 'Multi-GPU-Training (Data Parallel auf mehreren NVIDIA-GPUs) ist aktuell in der Roadmap und wird in einer der nächsten Versionen unterstützt. Single-GPU-Training ist vollständig optimiert. Wenn du auf mehrere GPUs angewiesen bist, melde dich gerne – wir priorisieren nach Community-Feedback.',
        tags: ['Multi-GPU', 'Roadmap'],
      },
      {
        q: 'Welche CUDA-Version wird benötigt?',
        a: 'Empfohlen wird CUDA 11.8 oder CUDA 12.x. FrameTrain bringt eine isolierte Python-Umgebung mit, sodass du keine globale CUDA-Installation benötigst. Der CUDA-Treiber auf dem System muss jedoch kompatibel sein (NVIDIA Treiber 520+ für CUDA 12).',
        tags: ['CUDA', 'NVIDIA Treiber'],
      },
      {
        q: 'Wie viel RAM brauche ich?',
        a: 'Minimum: 8 GB RAM. Empfohlen: 16 GB RAM. Für das Fine-Tuning großer Modelle (13B+) sind 32 GB RAM von Vorteil, da Datensatz-Preprocessing und Model Loading RAM-intensiv sein können. VRAM und RAM addieren sich dabei nicht – VRAM ist der Engpass, RAM ist sekundär.',
        tags: ['RAM', 'Arbeitsspeicher', 'Anforderungen'],
      },
    ],
  },
  {
    id: 'training',
    label: 'Training & Modelle',
    icon: <Brain className="w-5 h-5" />,
    color: 'pink',
    faqs: [
      {
        q: 'Welche Modellarchitekturen werden unterstützt?',
        a: 'FrameTrain unterstützt alle Transformer-basierten Modelle von HuggingFace, die mit dem PEFT-Framework kompatibel sind. Das umfasst: LLMs (Llama 2/3, Mistral, Phi, Falcon, Gemma), Encoder-Modelle (BERT, RoBERTa, DeBERTa), Encoder-Decoder (T5, BART) und Vision Transformer (ViT) – für Klassifikation und Regression. Vision-LLMs (LLaVA-Style) sind in der Roadmap.',
        tags: ['Llama', 'Mistral', 'BERT', 'T5', 'Architektur'],
      },
      {
        q: 'Was ist der Unterschied zwischen LoRA und QLoRA?',
        a: 'LoRA (Low-Rank Adaptation) trainiert kleine Adapter-Matrizen statt des vollständigen Modells und reduziert so den VRAM-Bedarf erheblich. QLoRA geht einen Schritt weiter: Das Basismodell wird in 4-Bit-Quantisierung geladen (noch weniger VRAM), während die Adapter-Matrizen in 16-Bit trainiert werden. QLoRA halbiert den VRAM-Bedarf gegenüber normalem LoRA, mit nur minimalen Qualitätseinbußen.',
        tags: ['LoRA', 'QLoRA', 'Unterschied', 'VRAM'],
      },
      {
        q: 'Welche Dateiformate werden für Datensätze akzeptiert?',
        a: 'Unterstützte Formate: CSV (mit konfigurierter Spalten-Zuweisung), JSON, JSONL (zeilenweise JSON, Standard für Chat-Datensätze), TXT (für einfache Text-Pretraining-Aufgaben). Außerdem können Datensätze direkt vom HuggingFace Datasets Hub importiert werden – mit Suchfunktion und Dataset Preview.',
        tags: ['CSV', 'JSON', 'JSONL', 'Datensatz', 'Format'],
      },
      {
        q: 'Wie groß kann der Datensatz sein?',
        a: 'Es gibt kein hartes Limit. FrameTrain lädt Datensätze nicht vollständig in den Speicher, sondern verarbeitet sie per Batch-Streaming. Datensätze mit Millionen von Einträgen sind technisch möglich. Praktisch ist die Trainingszeit der limitierende Faktor. Für Instruktions-Tuning von LLMs sind typischerweise 1.000–50.000 Beispiele ausreichend.',
        tags: ['Datensatzgröße', 'Limits'],
      },
      {
        q: 'Kann ich den Trainingsprozess unterbrechen und fortsetzen?',
        a: 'Ja. FrameTrain erstellt automatisch Checkpoints in konfigurierbaren Intervallen (z.B. alle 100 Schritte oder nach jeder Epoche). Ein unterbrochenes Training kann von jedem Checkpoint aus fortgesetzt werden – sowohl über die GUI als auch über die CLI mit dem Flag --resume-from-checkpoint.',
        tags: ['Checkpoint', 'Resume', 'Unterbrechen'],
      },
      {
        q: 'Was sind gute Startwerte für Hyperparameter bei LLM Fine-Tuning?',
        a: (
          <div className="space-y-3">
            <p>Bewährte Startwerte für LoRA Fine-Tuning eines 7B LLMs:</p>
            <div className="bg-gray-900/60 rounded-xl p-4 font-mono text-sm space-y-1">
              <div><span className="text-gray-500"># Training</span></div>
              <div><span className="text-blue-400">learning_rate</span>: <span className="text-green-400">2e-4</span></div>
              <div><span className="text-blue-400">num_epochs</span>: <span className="text-green-400">3</span></div>
              <div><span className="text-blue-400">batch_size</span>: <span className="text-green-400">4</span> <span className="text-gray-500"># mit gradient_accumulation=4 → eff. 16</span></div>
              <div><span className="text-blue-400">max_seq_length</span>: <span className="text-green-400">2048</span></div>
              <div className="mt-2"><span className="text-gray-500"># LoRA</span></div>
              <div><span className="text-blue-400">lora_r</span>: <span className="text-green-400">16</span></div>
              <div><span className="text-blue-400">lora_alpha</span>: <span className="text-green-400">32</span></div>
              <div><span className="text-blue-400">lora_dropout</span>: <span className="text-green-400">0.05</span></div>
              <div><span className="text-blue-400">target_modules</span>: <span className="text-green-400">q_proj, v_proj, k_proj, o_proj</span></div>
            </div>
            <p className="text-gray-400 text-sm">Diese Werte funktionieren als sicherer Ausgangspunkt. FrameTrain bietet auch Auto-Tuning-Vorschläge basierend auf deinem Modell und VRAM.</p>
          </div>
        ),
        tags: ['Hyperparameter', 'Learning Rate', 'LoRA Rank', 'Startwerte'],
      },
      {
        q: 'Wie lange dauert ein typisches Fine-Tuning?',
        a: (
          <div className="space-y-3">
            <p>Die Dauer hängt stark von Modellgröße, Datensatz und GPU ab. Orientierungswerte:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Setup</th>
                    <th className="text-left py-2 text-gray-400 font-semibold">Zeit für 1000 Schritte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['7B QLoRA, RTX 3090 24GB, BS=4', '~15–20 Min'],
                    ['7B QLoRA, RTX 4090, BS=8', '~8–12 Min'],
                    ['7B LoRA FP16, A100 80GB', '~5–8 Min'],
                    ['13B QLoRA, RTX 4090, BS=2', '~25–35 Min'],
                    ['Apple M3 Max (96 GB), 7B QLoRA', '~30–45 Min'],
                  ].map(([s, t], i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 text-gray-300">{s}</td>
                      <td className="py-2 text-yellow-400 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
        tags: ['Trainingsdauer', 'Zeit', 'Performance'],
      },
      {
        q: 'Unterstützt FrameTrain Mixed Precision Training?',
        a: 'Ja. FP16 (half precision) und BF16 (brain float 16, empfohlen für Ampere+-GPUs, z.B. RTX 3000/4000) sind vollständig unterstützt. Mixed Precision reduziert den VRAM-Bedarf um ~50% gegenüber FP32 bei nahezu gleichem Ergebnis. FrameTrain wählt automatisch das beste Format für deine GPU.',
        tags: ['Mixed Precision', 'FP16', 'BF16'],
      },
      {
        q: 'Was ist Gradient Checkpointing und sollte ich es aktivieren?',
        a: 'Gradient Checkpointing ist eine Technik, die Trainings-Zwischenergebnisse nicht im VRAM hält, sondern bei Bedarf neu berechnet. Das spart bis zu 60% VRAM auf Kosten von ~20% mehr Rechenzeit. Bei GPUs mit wenig VRAM (12–16 GB) ist es fast immer sinnvoll zu aktivieren. FrameTrain aktiviert es bei Bedarf automatisch.',
        tags: ['Gradient Checkpointing', 'VRAM Optimierung'],
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Datenschutz & DSGVO',
    icon: <Shield className="w-5 h-5" />,
    color: 'blue',
    faqs: [
      {
        q: 'Verlassen meine Daten beim Training mein Gerät?',
        a: 'Nein. Das Training findet vollständig lokal auf deiner Hardware statt. Weder Trainingsdaten noch Modellgewichte werden hochgeladen oder an externe Server übermittelt. FrameTrain benötigt für das Training keine Internetverbindung.',
        tags: ['Datenschutz', 'Lokal', 'Daten'],
      },
      {
        q: 'Ist FrameTrain DSGVO-konform?',
        a: 'Ja. Da keine Daten die eigene Hardware verlassen, gibt es keine Übertragung in Drittländer, keine Auftragsverarbeitung mit externen Anbietern und keine Cloud-Speicherung. FrameTrain ist damit ideal für Anwendungsfälle, bei denen personenbezogene Daten, Patientendaten (§ 22 BDSG) oder sonstige schützenswerte Informationen verarbeitet werden.',
        tags: ['DSGVO', 'Datenschutz', 'Unternehmen'],
      },
      {
        q: 'Welche Daten werden von der App gesammelt?',
        a: 'FrameTrain sammelt minimal: Bei der Registrierung werden E-Mail und gehashtes Passwort gespeichert. Zur Authentifizierung wird der API-Key verifiziert. Es werden keine Trainingsdaten, Modelle, Datensätze oder persönliche Inhalte erfasst oder übertragen. Optionale Fehlerberichte (anonymisiert) können in den Einstellungen aktiviert oder deaktiviert werden.',
        tags: ['Datenerhebung', 'Telemetrie'],
      },
      {
        q: 'Kann ich FrameTrain in einem Unternehmen mit sensiblen Daten einsetzen?',
        a: 'Ja, das ist einer der Hauptanwendungsfälle. Da keine Daten nach außen übertragen werden, ist FrameTrain besonders für Unternehmen geeignet, die mit Kundendaten, Unternehmensdokumenten oder proprietären Datensätzen arbeiten. Für Enterprise-Lizenzen und On-Premise-Deployments bitte Kontakt aufnehmen.',
        tags: ['Unternehmen', 'Enterprise', 'On-Premise'],
      },
      {
        q: 'Wie läuft die Authentifizierung – brauche ich immer Internet?',
        a: 'Die initiale Aktivierung benötigt eine einmalige Internetverbindung. Danach kann der API-Key offline gespeichert werden. Training und alle lokalen Funktionen laufen ohne Internet. Nur optionale Funktionen wie der HuggingFace-Modell-Browser oder Datensatz-Downloads benötigen eine Verbindung.',
        tags: ['Offline', 'Internet', 'Auth'],
      },
    ],
  },
  {
    id: 'models',
    label: 'Modelle & Export',
    icon: <Package className="w-5 h-5" />,
    color: 'cyan',
    faqs: [
      {
        q: 'In welchen Formaten kann ich mein trainiertes Modell exportieren?',
        a: 'Exportformate: SafeTensors (.safetensors, empfohlen, sicherer als .bin), PyTorch Bin (.bin, kompatibel mit älterer Software), GGUF (für lokale LLM-Inferenz mit llama.cpp, Ollama, LM Studio). LoRA-Adapter können separat oder zusammengeführt (merged) mit dem Basismodell exportiert werden.',
        tags: ['Export', 'SafeTensors', 'GGUF', 'Format'],
      },
      {
        q: 'Kann ich trainierte Modelle mit Ollama oder LM Studio nutzen?',
        a: 'Ja. Exportiere dein Fine-Tuned-Modell im GGUF-Format (mit konfigurierbarer Quantisierung: Q4_K_M, Q5_K_M, Q8_0). Diese Datei kann direkt in Ollama (ollama create), LM Studio oder jedem anderen llama.cpp-kompatiblen Tool verwendet werden.',
        tags: ['Ollama', 'LM Studio', 'llama.cpp', 'GGUF', 'Inferenz'],
      },
      {
        q: 'Wie funktioniert Model Versioning?',
        a: 'Jeder Trainingsrun erstellt automatisch eine neue Version mit Metadaten (Timestamp, Hyperparameter, Datensatz-Hash, Metriken). Im Versions-Manager kannst du alle Versionen vergleichen, einzelne Checkpoints laden, Versionen taggen (z.B. "best", "prod") und nicht mehr benötigte Versionen löschen.',
        tags: ['Versioning', 'Checkpoint', 'History'],
      },
      {
        q: 'Kann ich Modelle von HuggingFace direkt importieren?',
        a: 'Ja. FrameTrain hat einen integrierten HuggingFace Model Browser mit Suchfunktion, Filterung nach Modellgröße, Architektur und Lizenz. Modelle werden direkt heruntergeladen und lokal gespeichert. Auch private HuggingFace-Modelle können mit HF-Token importiert werden.',
        tags: ['HuggingFace', 'Import', 'Model Hub'],
      },
      {
        q: 'Kann ich mein eigenes Basismodell laden (ohne HuggingFace)?',
        a: 'Ja. Lokale Modelle im HuggingFace-Format (config.json + Gewichtsdateien) können direkt über einen Ordner-Dialog importiert werden. Das ist ideal für Modelle, die du aus anderen Quellen hast oder selbst trainiert hast.',
        tags: ['Lokales Modell', 'Custom Model', 'Import'],
      },
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring & Debugging',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'yellow',
    faqs: [
      {
        q: 'Welche Trainingsmetriken werden live angezeigt?',
        a: 'Live angezeigt werden: Training Loss, Validation Loss (falls Eval-Set konfiguriert), Perplexity, Lernrate (mit LR-Schedule-Visualisierung), GPU-Auslastung (%), GPU-Temperatur (°C), VRAM-Nutzung, Training-Geschwindigkeit (Tokens/Sekunde, Samples/Sekunde) und verbleibende Zeit.',
        tags: ['Metriken', 'Loss', 'GPU Monitor'],
      },
      {
        q: 'Kann ich Trainingsläufe untereinander vergleichen?',
        a: 'Ja. Im Runs-Vergleich können mehrere Trainingsläufe nebeneinander visualisiert werden. Die Charts werden überlagert, sodass du direkt siehst, welche Hyperparameter-Kombinationen besser konvergieren. Alle Metriken können als CSV exportiert werden.',
        tags: ['Vergleich', 'Runs', 'Experiment Tracking'],
      },
      {
        q: 'Was bedeutet, wenn der Loss nicht sinkt oder explodiert?',
        a: (
          <div className="space-y-2">
            <p>Mögliche Ursachen und Lösungen:</p>
            <ul className="space-y-2 mt-2">
              {[
                ['Loss sinkt nicht', 'Learning Rate zu niedrig → erhöhe auf 2e-4. Datensatz zu klein → mehr Daten.'],
                ['Loss explodiert', 'Learning Rate zu hoch → reduziere um Faktor 10. Gradient Clipping aktivieren.'],
                ['Loss sehr niedrig, aber schlechte Outputs', 'Overfitting → weniger Epochs oder mehr Dropout.'],
                ['Loss oszilliert stark', 'Batch Size zu klein → erhöhe oder nutze Gradient Accumulation.'],
              ].map(([prob, sol]) => (
                <li key={prob as string} className="glass rounded-lg px-4 py-3 border border-white/10">
                  <div className="text-white font-semibold text-sm mb-1">{prob}</div>
                  <div className="text-gray-400 text-sm">{sol}</div>
                </li>
              ))}
            </ul>
          </div>
        ),
        tags: ['Debugging', 'Loss', 'Overfitting'],
      },
      {
        q: 'Unterstützt FrameTrain WandB oder TensorBoard?',
        a: 'TensorBoard-Export ist eingebaut – alle Metriken werden automatisch als TensorBoard-Logs gespeichert. WandB-Integration ist in der Roadmap für eine der nächsten Versionen. Das lokale Dashboard deckt für die meisten Anwendungsfälle alles ab.',
        tags: ['WandB', 'TensorBoard', 'Logging'],
      },
    ],
  },
  {
    id: 'install',
    label: 'Installation & Setup',
    icon: <Download className="w-5 h-5" />,
    color: 'teal',
    faqs: [
      {
        q: 'Wie installiere ich FrameTrain?',
        a: 'Registriere dich auf der Website, zahle einmalig 1,99€ und lade die Desktop-App für dein Betriebssystem herunter. Auf Windows: Setup-Installer (.exe) ausführen. Auf macOS: .dmg öffnen, App in Applications ziehen. Auf Linux: AppImage herunterladen und ausführbar machen (chmod +x). Beim ersten Start wirst du nach deinem API-Key gefragt.',
        tags: ['Installation', 'Setup', 'Erster Start'],
      },
      {
        q: 'Muss ich Python oder PyTorch selbst installieren?',
        a: 'Nein. FrameTrain liefert eine isolierte Python-Umgebung mit allen benötigten Abhängigkeiten (PyTorch, Transformers, PEFT, etc.) mit. Du musst nichts selbst einrichten. Die Gesamtgröße der App inklusive ML-Stack beträgt ca. 4–6 GB.',
        tags: ['Python', 'PyTorch', 'Abhängigkeiten', 'kein Setup'],
      },
      {
        q: 'Wie groß ist der Download?',
        a: 'Die Desktop-App selbst ist ca. 50–80 MB. Beim ersten Start werden die ML-Bibliotheken (PyTorch, Transformers, etc.) heruntergeladen – das sind insgesamt ca. 3–5 GB. Modelle von HuggingFace kommen on demand hinzu (7B-Modell: ca. 14 GB in FP16 oder 4 GB in 4-Bit).',
        tags: ['Downloadgröße', 'Installation', 'Speicher'],
      },
      {
        q: 'Funktioniert FrameTrain hinter einer Firewall / in einem Unternehmensnetzwerk?',
        a: 'Für das Training selbst: ja, vollständig offline. Für die initiale Aktivierung und optionale Funktionen wie Modell-Downloads: ausgehende HTTPS-Verbindungen zu frame-train.vercel.app und huggingface.co werden benötigt. Wenn diese blockiert sind, können Modelle auf einem anderen Gerät heruntergeladen und manuell übertragen werden.',
        tags: ['Firewall', 'Netzwerk', 'Unternehmen', 'Offline'],
      },
      {
        q: 'Wie bekomme ich Updates?',
        a: 'FrameTrain hat einen eingebauten Auto-Updater. Bei Verfügbarkeit eines neuen Releases wirst du beim App-Start benachrichtigt und kannst das Update mit einem Klick installieren. Es sind keine manuellen Downloads nötig.',
        tags: ['Update', 'Auto-Update', 'Release'],
      },
    ],
  },
]

const colorAccents: Record<string, { border: string; badge: string; dot: string }> = {
  purple: {
    border: 'border-purple-500/20',
    badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    dot: 'bg-purple-500',
  },
  green: {
    border: 'border-green-500/20',
    badge: 'text-green-400 bg-green-500/10 border-green-500/20',
    dot: 'bg-green-500',
  },
  orange: {
    border: 'border-orange-500/20',
    badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    dot: 'bg-orange-500',
  },
  pink: {
    border: 'border-pink-500/20',
    badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    dot: 'bg-pink-500',
  },
  blue: {
    border: 'border-blue-500/20',
    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-500',
  },
  cyan: {
    border: 'border-cyan-500/20',
    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    dot: 'bg-cyan-500',
  },
  yellow: {
    border: 'border-yellow-500/20',
    badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    dot: 'bg-yellow-500',
  },
  teal: {
    border: 'border-teal-500/20',
    badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    dot: 'bg-teal-500',
  },
}

function FAQAccordion({ faq, accent }: { faq: FAQ; accent: typeof colorAccents[string] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`glass-strong rounded-2xl overflow-hidden border ${open ? accent.border : 'border-white/10'} transition-colors duration-300`}>
      <button
        className="w-full text-left px-7 py-5 flex items-start justify-between gap-4 hover:bg-white/3 transition-colors group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-white font-semibold text-base leading-snug group-hover:text-purple-200 transition-colors pr-2">
          {faq.q}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180 text-purple-400' : 'text-gray-500'}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="px-7 pb-6 text-gray-300 leading-relaxed text-sm border-t border-white/5 pt-4">
          {typeof faq.a === 'string' ? <p>{faq.a}</p> : faq.a}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [search, setSearch] = useState('')

  const totalFAQs = categories.reduce((acc, c) => acc + c.faqs.length, 0)

  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    const results: { category: Category; faq: FAQ }[] = []
    for (const cat of categories) {
      for (const faq of cat.faqs) {
        const inQ = faq.q.toLowerCase().includes(q)
        const inA = typeof faq.a === 'string' && faq.a.toLowerCase().includes(q)
        const inTags = faq.tags?.some((t) => t.toLowerCase().includes(q))
        if (inQ || inA || inTags) results.push({ category: cat, faq })
      }
    }
    return results
  }, [search])

  const activecat = categories.find((c) => c.id === activeCategory) ?? categories[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">

        {/* ─── HERO ─── */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 pointer-events-none" />
          <div className="absolute top-20 left-1/3 w-80 h-80 bg-purple-600 rounded-full blur-[150px] opacity-10 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-8">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              FAQ
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-3">
              {totalFAQs} Antworten auf die häufigsten Fragen zu FrameTrain –
              von Installation bis DSGVO, von GPU-Auswahl bis Hyperparameter-Tuning.
            </p>
            <p className="text-gray-600 text-sm">
              Keine Antwort gefunden?{' '}
              <a href="https://github.com/FrameSphere/FrameTrain-Website" target="_blank" className="text-purple-400 hover:text-purple-300 transition">
                GitHub öffnen
              </a>{' '}
              oder im Discord fragen.
            </p>
          </div>
        </section>

        {/* ─── SEARCH ─── */}
        <section className="px-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="FAQ durchsuchen… z.B. VRAM, LoRA, DSGVO, Export"
                className="w-full glass-strong border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── SEARCH RESULTS ─── */}
        {search && searchResults !== null && (
          <section className="px-4 py-4">
            <div className="max-w-3xl mx-auto">
              {searchResults.length === 0 ? (
                <div className="glass-strong rounded-2xl p-8 border border-white/10 text-center">
                  <p className="text-gray-400 mb-2">Keine Ergebnisse für <span className="text-white">„{search}"</span></p>
                  <p className="text-gray-600 text-sm">Versuch einen anderen Suchbegriff oder stell die Frage im Discord.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-500 text-sm px-1 mb-4">
                    {searchResults.length} Ergebnis{searchResults.length !== 1 ? 'se' : ''} für „{search}"
                  </p>
                  {searchResults.map(({ category, faq }, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${colorAccents[category.color].badge}`}>
                          {category.label}
                        </span>
                      </div>
                      <FAQAccordion faq={faq} accent={colorAccents[category.color]} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── CATEGORY + FAQS ─── */}
        {!search && (
          <section className="py-4 px-4 pb-24">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

              {/* Sidebar */}
              <aside className="lg:w-56 flex-shrink-0">
                <div className="glass-strong rounded-2xl p-4 border border-white/10 sticky top-24">
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-bold px-2 mb-3">Kategorien</p>
                  <nav className="space-y-1">
                    {categories.map((cat) => {
                      const a = colorAccents[cat.color]
                      const isActive = activeCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                            isActive
                              ? `${a.badge} font-semibold`
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${isActive ? '' : 'text-gray-600'}`}>{cat.icon}</div>
                          <span className="flex-1">{cat.label}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-white/20' : 'bg-white/5 text-gray-600'}`}>
                            {cat.faqs.length}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-600 px-2">{totalFAQs} Fragen gesamt</p>
                  </div>
                </div>
              </aside>

              {/* FAQ List */}
              <div className="flex-1 min-w-0">
                {/* Category header */}
                <div className={`flex items-center gap-3 mb-6 pb-5 border-b border-white/10`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorAccents[activecat.color].badge}`}>
                    {activecat.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{activecat.label}</h2>
                    <p className="text-gray-500 text-sm">{activecat.faqs.length} Fragen</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activecat.faqs.map((faq, i) => (
                    <FAQAccordion key={i} faq={faq} accent={colorAccents[activecat.color]} />
                  ))}
                </div>

                {/* Link to next category */}
                {categories.findIndex((c) => c.id === activeCategory) < categories.length - 1 && (
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => {
                        const idx = categories.findIndex((c) => c.id === activeCategory)
                        setActiveCategory(categories[idx + 1].id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition"
                    >
                      <span>Nächste Kategorie: {categories[categories.findIndex((c) => c.id === activeCategory) + 1].label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ─── STILL QUESTIONS ─── */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-strong rounded-3xl p-10 border border-white/10">
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-5" />
              <h3 className="text-2xl font-black text-white mb-4">Noch Fragen?</h3>
              <p className="text-gray-400 mb-7 max-w-lg mx-auto">
                Stell deine Frage direkt im GitHub oder Discord.
                Wir antworten typischerweise innerhalb von 24 Stunden.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="https://github.com/FrameSphere/FrameTrain-Website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-strong px-6 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold border border-white/10 flex items-center gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  GitHub Issues
                </a>
                <Link href="/register" className="relative group inline-block px-6 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Jetzt starten – 1,99€</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
