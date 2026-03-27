'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Book, Code2, Zap, Download, Key, Settings, Database,
  Terminal, Rocket, ChevronRight, FileCode, Cpu, Cloud,
  Shield, Package, BarChart3, Play, CheckCircle2, AlertCircle,
  Sparkles, Lightbulb, TrendingUp, GitBranch, Gauge, Layers,
  Brain, Workflow, Lock, Zap as ZapIcon,
  AlertTriangle,
  TrendingDown,
  Clock
} from 'lucide-react'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('installation')

  const navigation = [
    {
      title: 'Erste Schritte',
      id: 'getting-started',
      icon: <Rocket className="w-4 h-4" />,
      items: [
        { id: 'installation', title: 'Installation' },
        { id: 'quick-start', title: 'Quick Start (5 Min)' },
        { id: 'first-training', title: 'Erstes Training' },
      ]
    },
    {
      title: 'App-Features',
      id: 'app-features',
      icon: <Sparkles className="w-4 h-4" />,
      items: [
        { id: 'model-manager', title: 'Model Manager' },
        { id: 'training-panel', title: 'Training Panel' },
        { id: 'dataset-upload', title: 'Dataset Management' },
        { id: 'analysis', title: 'Analysis & Monitoring' },
        { id: 'testing', title: 'Model Testing' },
        { id: 'versioning', title: 'Version Management' },
      ]
    },
    {
      title: 'Training & ML',
      id: 'training',
      icon: <Brain className="w-4 h-4" />,
      items: [
        { id: 'training-basics', title: 'Training Grundlagen' },
        { id: 'hyperparameters', title: 'Hyperparameter' },
        { id: 'lora-training', title: 'LoRA Fine-Tuning' },
        { id: 'datasets-format', title: 'Dataset Formate' },
        { id: 'monitoring', title: 'Live Monitoring' },
      ]
    },
    {
      title: 'Erweiterte Themen',
      id: 'advanced',
      icon: <Code2 className="w-4 h-4" />,
      items: [
        { id: 'optimization', title: 'Performance Tuning' },
        { id: 'gpu-setup', title: 'GPU Optimierung' },
        { id: 'export', title: 'Model Export & Deploy' },
        { id: 'troubleshooting', title: 'Problemlösung' },
        { id: 'settings', title: 'Einstellungen & Config' },
      ]
    },
    {
      title: 'Ressourcen',
      id: 'resources',
      icon: <Lightbulb className="w-4 h-4" />,
      items: [
        { id: 'themes', title: 'Themes & UI' },
        { id: 'presets', title: 'Training Presets' },
        { id: 'updates', title: 'Updates & Versioning' },
      ]
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
                <Book className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                FrameTrain Dokumentation
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Alles was du brauchst, um mit FrameTrain zu starten, deine eigenen LLMs zu fine-tunen und professionelle ML-Modelle zu trainieren – ohne Cloud, ohne Abhängigkeiten
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Navigation */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="glass-strong rounded-2xl p-6 border border-white/10 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <nav className="space-y-1">
                    {navigation.map((section) => (
                      <div key={section.id} className="mb-6">
                        <div className="flex items-center gap-2 text-gray-400 font-semibold mb-3 px-3">
                          {section.icon}
                          <span className="text-xs uppercase tracking-wider">{section.title}</span>
                        </div>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveSection(item.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                                activeSection === item.id
                                  ? 'bg-purple-500/20 text-purple-400 font-medium border border-purple-400/30'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Content Area */}
              <div className="flex-1 max-w-4xl">
                <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 prose prose-invert max-w-none">
                  {activeSection === 'installation' && <InstallationSection />}
                  {activeSection === 'quick-start' && <QuickStartSection />}
                  {activeSection === 'first-training' && <FirstTrainingSection />}
                  {activeSection === 'model-manager' && <ModelManagerSection />}
                  {activeSection === 'training-panel' && <TrainingPanelSection />}
                  {activeSection === 'dataset-upload' && <DatasetUploadSection />}
                  {activeSection === 'analysis' && <AnalysisSection />}
                  {activeSection === 'testing' && <TestingSection />}
                  {activeSection === 'versioning' && <VersioningSection />}
                  {activeSection === 'training-basics' && <TrainingBasicsSection />}
                  {activeSection === 'hyperparameters' && <HyperparametersSection />}
                  {activeSection === 'lora-training' && <LoRASection />}
                  {activeSection === 'datasets-format' && <DatasetsFormatSection />}
                  {activeSection === 'monitoring' && <MonitoringSection />}
                  {activeSection === 'optimization' && <OptimizationSection />}
                  {activeSection === 'gpu-setup' && <GPUSetupSection />}
                  {activeSection === 'export' && <ExportSection />}
                  {activeSection === 'troubleshooting' && <TroubleshootingSection />}
                  {activeSection === 'settings' && <SettingsSection />}
                  {activeSection === 'themes' && <ThemesSection />}
                  {activeSection === 'presets' && <PresetsSection />}
                  {activeSection === 'updates' && <UpdatesSection />}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ============ SECTION COMPONENTS ============

function InstallationSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Download className="w-8 h-8 text-purple-400" />
        Installation
      </h1>
      <p className="text-gray-400 mb-8">Richte FrameTrain auf deinem System ein und starte dein erstes Training in Minuten</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Schritt 1: Account erstellen</h2>
          <p className="text-gray-400 mb-4">
            Registriere dich auf unserer Website. Die einmalige Gebühr von <span className="text-green-400 font-semibold">1,99€</span> gibt dir lebenslangen Zugang.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            <Rocket className="w-4 h-4" />
            Jetzt registrieren
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Schritt 2: Desktop-App herunterladen</h2>
          <p className="text-gray-400 mb-4">
            Lade FrameTrain für dein Betriebssystem herunter. Alle Versionen sind kostenlos.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Windows', desc: 'Windows 10/11 (64-bit)', file: 'FrameTrain-Setup.exe' },
              { name: 'macOS', desc: 'macOS 11+ (Intel/Apple Silicon M1-M4)', file: 'FrameTrain.dmg' },
              { name: 'Linux', desc: 'Ubuntu 20.04+, Fedora 35+', file: 'FrameTrain.AppImage' }
            ].map((os) => (
              <div key={os.name} className="glass border border-white/10 rounded-xl p-5 hover:border-purple-400/30 transition-colors">
                <h3 className="text-white font-bold mb-1">{os.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{os.desc}</p>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  {os.file}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Schritt 3: API-Key abrufen</h2>
          <p className="text-gray-400 mb-4">
            Nach der Registrierung findest du deinen eindeutigen <span className="text-purple-400">API-Key</span> im Dashboard.
          </p>
          <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4 text-sm font-mono text-gray-300">
            frametrain_sk_1a2b3c4d5e6f7g8h9i0j
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Schritt 4: App starten & anmelden</h2>
          <p className="text-gray-400 mb-4">
            Öffne die FrameTrain App und melde dich mit deinem API-Key an. Die App speichert deine Anmeldedaten sicher.
          </p>
          <InfoBox 
            type="success"
            title="Fertig! 🎉"
            description="Du kannst jetzt dein erstes Modell trainieren. Siehe 'Quick Start' für die nächsten Schritte."
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Systemanforderungen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Minimum
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 8GB RAM</li>
                <li>• 5GB Festplattenspeicher</li>
                <li>• Multi-Core CPU</li>
              </ul>
            </div>
            <div className="glass border border-green-400/20 rounded-lg p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Empfohlen
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 16GB RAM</li>
                <li>• NVIDIA GPU mit CUDA 11.0+</li>
                <li>• 20GB+ SSD</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStartSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Zap className="w-8 h-8 text-purple-400" />
        Quick Start (5 Minuten)
      </h1>
      <p className="text-gray-400 mb-8">Trainiere dein erstes Modell in nur 5 Minuten</p>
      
      <div className="space-y-6">
        {[
          {
            number: 1,
            title: 'FrameTrain öffnen & anmelden',
            desc: 'Starte die App und melde dich mit deinem API-Key an',
            details: 'Die App wird deine Anmeldedaten speichern für Zukünftige Sessions'
          },
          {
            number: 2,
            title: 'Modell auswählen',
            desc: 'Klicke im "Model Manager" auf "Import Model" → "HuggingFace Hub"',
            details: 'Wähle ein beliebtes Modell wie "bert-base-uncased" oder "distilbert-base-uncased"'
          },
          {
            number: 3,
            title: 'Dataset hochladen',
            desc: 'Gehe zu "Datasets" und lade eine CSV oder JSON-Datei hoch',
            details: 'Format: CSV mit Spalten wie "text" und "label" für Text-Klassifikation'
          },
          {
            number: 4,
            title: 'Training konfigurieren',
            desc: 'Wechsle zum "Training Panel" und setze Hyperparameter',
            details: 'Starte mit Default-Werten: epochs=3, batch_size=8, learning_rate=2e-5'
          },
          {
            number: 5,
            title: 'Training starten',
            desc: 'Klicke "Start Training" und beobachte den Fortschritt live',
            details: 'Du siehst Loss, Accuracy, und andere Metriken in Echtzeit'
          },
        ].map((step, idx) => (
          <div key={idx} className="flex gap-5">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                {step.number}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{step.desc}</p>
              <p className="text-gray-500 text-xs">{step.details}</p>
            </div>
          </div>
        ))}
      </div>

      <InfoBox 
        type="success"
        title="Dein erstes Modell ist trainiert! 🎉"
        description="Das trainierte Modell ist jetzt im Model Manager sichtbar. Du kannst es testen, exportieren oder weitertrainieren."
      />
    </div>
  )
}

function FirstTrainingSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Play className="w-8 h-8 text-purple-400" />
        Erstes Training
      </h1>
      <p className="text-gray-400 mb-8">Detaillierte Schritt-für-Schritt Anleitung für dein erstes erfolgreiches Training</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">1. Daten vorbereiten</h2>
          <p className="text-gray-400 mb-4">Dein Dataset sollte korrekt formatiert sein. Hier ein Beispiel für Text-Klassifikation:</p>
          <div className="bg-gray-900/60 rounded-lg p-4 text-sm overflow-x-auto">
            <pre className="text-green-400 font-mono">{`text,label
"Das ist ein positiver Review",positive
"Mir hat das nicht gefallen",negative
"Sehr zufrieden mit dem Produkt!",positive`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">2. Modell importieren</h2>
          <p className="text-gray-400 mb-4">Im Model Manager kannst du Modelle auf verschiedene Arten importieren:</p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span><span className="text-white font-semibold">HuggingFace Hub:</span> Durchsuche und importiere kostenlos aus 100.000+ Modellen</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span><span className="text-white font-semibold">Lokale Dateien:</span> Importiere .bin, .pt oder .safetensors Dateien</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span><span className="text-white font-semibold">URLs:</span> Lade Modelle direkt von URLs herunter</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">3. Hyperparameter einstellen</h2>
          <p className="text-gray-400 mb-4">
            Die App zeigt empfohlene Werte basierend auf deinem Hardware und Modell. Hier sind gute Startwerte:
          </p>
          <div className="bg-gray-900/60 rounded-lg p-5 space-y-3 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Epochs:</span>
              <span className="text-purple-400 font-semibold">3</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Batch Size:</span>
              <span className="text-purple-400 font-semibold">8</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Learning Rate:</span>
              <span className="text-purple-400 font-semibold">2e-5</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Optimizer:</span>
              <span className="text-purple-400 font-semibold">AdamW</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">4. Training überwachen</h2>
          <p className="text-gray-400 mb-4">
            Das Training Panel zeigt dir Live-Metriken:
          </p>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>📈 <span className="text-white">Training Loss</span> - sollte über Zeit sinken</li>
            <li>📊 <span className="text-white">Validation Loss</span> - Modell-Performance auf Validierungsdaten</li>
            <li>⚡ <span className="text-white">Learning Rate</span> - aktuelle Learning Rate mit Scheduler</li>
            <li>💾 <span className="text-white">Checkpoints</span> - automatische Sicherungen während Training</li>
          </ul>
        </div>

        <InfoBox 
          type="warning"
          title="Tipps für erfolgreiches Training"
          description="Verwende mindestens 100 Beispiele pro Klasse. Bei kleinen GPUs (< 8GB VRAM) reduziere batch_size auf 4."
        />
      </div>
    </div>
  )
}

function ModelManagerSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Package className="w-8 h-8 text-purple-400" />
        Model Manager
      </h1>
      <p className="text-gray-400 mb-8">Importiere, verwalte und organisiere deine ML-Modelle zentral</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Hauptfunktionen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Download className="w-6 h-6" />}
              title="Import"
              desc="Lade Modelle von HuggingFace, lokale Dateien oder URLs"
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6" />}
              title="Versioning"
              desc="Jedes Modell hat automatische Versionshistorie"
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6" />}
              title="Verwaltung"
              desc="Lösche, benenne oder dupliziere Modelle"
            />
            <FeatureCard 
              icon={<GitBranch className="w-6 h-6" />}
              title="Verzweigung"
              desc="Erstelle Modell-Varianten für Experimente"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Modelle von HuggingFace importieren</h2>
          <p className="text-gray-400 mb-4">
            FrameTrain hat eine native Integration mit HuggingFace Hub. Du kannst direkt in der App durchsuchen und importieren:
          </p>
          <ol className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <span className="text-purple-400">1.</span>
              <span>Klicke "Import Model" im Model Manager</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">2.</span>
              <span>Wähle "HuggingFace Hub" als Quelle</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">3.</span>
              <span>Durchsuche Modelle nach Task (Classification, QA, etc.)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">4.</span>
              <span>Klicke "Import" - Download beginnt automatisch</span>
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Empfohlene Starter-Modelle</h2>
          <div className="space-y-3">
            {[
              { name: 'bert-base-uncased', task: 'Classification', params: '110M', desc: 'Guter All-Purpose Starter' },
              { name: 'distilbert-base-uncased', task: 'Classification', params: '66M', desc: 'Schneller, kleiner, aber gut' },
              { name: 'gpt2', task: 'Language Modeling', params: '124M', desc: 'Text-Generierung & Completion' },
              { name: 'roberta-base', task: 'Classification', params: '125M', desc: 'Moderne BERT Alternative' },
            ].map((model, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold font-mono text-sm">{model.name}</h3>
                  <span className="text-xs text-gray-400">{model.params}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{model.desc}</p>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{model.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TrainingPanelSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Brain className="w-8 h-8 text-purple-400" />
        Training Panel
      </h1>
      <p className="text-gray-400 mb-8">Konfiguriere und starte deine Trainings mit vollständiger Kontrolle über Hyperparameter</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Training Workflow</h2>
          <div className="space-y-3">
            {[
              { icon: '📦', title: 'Modell wählen', desc: 'Wähle dein Basis-Modell aus der Modellbibliothek' },
              { icon: '📊', title: 'Dataset auswählen', desc: 'Wähle dein vorbereitetes Trainings-Dataset' },
              { icon: '⚙️', title: 'Hyperparameter setzen', desc: 'Passe alle Parameter nach deinen Bedürfnissen an' },
              { icon: '🎯', title: 'Output-Ordner wählen', desc: 'Definiere wo Checkpoints und Ergebnisse gespeichert werden' },
              { icon: '▶️', title: 'Training starten', desc: 'Klick "Start" und beobachte den Live-Fortschritt' },
            ].map((step, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4 flex gap-4">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <h3 className="text-white font-semibold">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Training Kontrollen</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Pause:</span> Unterbreche Training und speichere Checkpoint</span>
            </li>
            <li className="flex gap-3">
              <Square className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Stop:</span> Beende Training (speichert letzten Checkpoint)</span>
            </li>
            <li className="flex gap-3">
              <RefreshCw className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Resume:</span> Fortsetzen von letztem Checkpoint</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Pre-training Presets</h2>
          <p className="text-gray-400 mb-4">
            FrameTrain bietet optimierte Presets für verschiedene Aufgaben:
          </p>
          <div className="space-y-3">
            {[
              { name: 'Fast', lr: '5e-5', epochs: 2, batch: 16, desc: 'Schnelles Training auf Standard GPUs' },
              { name: 'Balanced', lr: '2e-5', epochs: 3, batch: 8, desc: 'Best Practice für die meisten Fälle' },
              { name: 'Precision', lr: '1e-5', epochs: 5, batch: 4, desc: 'Längeres Training für bessere Ergebnisse' },
              { name: 'Memory-Efficient', lr: '3e-5', epochs: 2, batch: 1, desc: 'Für GPUs mit <8GB VRAM' },
            ].map((preset, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">{preset.name}</h3>
                  <span className="text-gray-400">{preset.desc}</span>
                </div>
                <div className="flex gap-6 text-xs text-gray-400">
                  <span>LR: <span className="text-purple-400">{preset.lr}</span></span>
                  <span>Epochs: <span className="text-purple-400">{preset.epochs}</span></span>
                  <span>Batch: <span className="text-purple-400">{preset.batch}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DatasetUploadSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Database className="w-8 h-8 text-purple-400" />
        Dataset Management
      </h1>
      <p className="text-gray-400 mb-8">Lade und verwalte deine Trainingsdaten direkt in der App</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Unterstützte Formate</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { format: 'CSV', example: 'text,label\n"Hello",positive' },
              { format: 'JSON', example: '{"text": "Hello", "label": "positive"}' },
              { format: 'JSONL', example: '{"text": "Hello", "label": "positive"}\n{"text": "Bye", "label": "negative"}' },
              { format: 'TXT', example: 'Zeilenweise Text\nJede Zeile = 1 Beispiel' },
            ].map((fmt, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">{fmt.format}</h3>
                <div className="bg-gray-900/60 rounded p-3 text-xs font-mono text-gray-400 overflow-x-auto">
                  {fmt.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Upload-Prozess</h2>
          <ol className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">1.</span>
              <span>Gehe zum "Dataset Upload" Tab</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">2.</span>
              <span>Drag-and-drop deine Datei oder klicke zum Durchsuchen</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">3.</span>
              <span>Wähle das Modell aus, für das das Dataset ist</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">4.</span>
              <span>FrameTrain verarbeitet und validiert die Daten automatisch</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">5.</span>
              <span>Dataset ist bereit zum Training!</span>
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Dataset-Vorbereitung</h2>
          <p className="text-gray-400 mb-4">Deine Daten sollten gut formatiert und bereinigt sein:</p>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><span className="text-white font-semibold">Ausreichend Daten:</span> Mindestens 100-200 Beispiele pro Klasse</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><span className="text-white font-semibold">Balanciert:</span> Ähnliche Anzahl Beispiele pro Klasse</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><span className="text-white font-semibold">Sauber:</span> Entferne Duplikate und Fehler</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><span className="text-white font-semibold">Korrekt gelabelt:</span> Alle Beispiele sollten korrekt kategorisiert sein</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function AnalysisSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-purple-400" />
        Analysis & Monitoring
      </h1>
      <p className="text-gray-400 mb-8">Überwache Training in Echtzeit und analysiere Ergebnisse detailliert</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Live-Metriken im Analysis Panel</h2>
          <div className="space-y-3">
            {[
              { metric: 'Training Loss', desc: 'Hauptverlust während Training - sollte sinken', good: 'Kontinuierlicher Abfall' },
              { metric: 'Validation Loss', desc: 'Performance auf separaten Validierungsdaten', good: 'Ähnlich wie Training Loss' },
              { metric: 'Accuracy', desc: 'Prozentsatz korrekter Vorhersagen', good: '>90% bei guten Daten' },
              { metric: 'Learning Rate', desc: 'Aktuelle LR mit Scheduler-Anpassung', good: 'Sinkend über Zeit' },
              { metric: 'Throughput', desc: 'Beispiele pro Sekunde', good: 'Konsistent hoch' },
            ].map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold">{item.metric}</h3>
                  <span className="text-xs text-green-400">{item.good}</span>
                </div>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Probleme erkennen</h2>
          <div className="space-y-3">
            <div className="glass border border-red-400/20 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Overfitting
              </h3>
              <p className="text-gray-400 text-sm mb-2">Training Loss sinkt, aber Validation Loss steigt</p>
              <p className="text-gray-500 text-xs">Lösung: Reduziere Epochs oder erhöhe Dropout</p>
            </div>
            <div className="glass border border-orange-400/20 rounded-lg p-4">
              <h3 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Underfitting
              </h3>
              <p className="text-gray-400 text-sm mb-2">Loss sinkt nicht oder bleibt hoch</p>
              <p className="text-gray-500 text-xs">Lösung: Erhöhe Learning Rate oder Epochs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestingSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Play className="w-8 h-8 text-purple-400" />
        Model Testing
      </h1>
      <p className="text-gray-400 mb-8">Teste deine trainierten Modelle ohne sie zu deployen</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Testing Features</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Single Predictions:</span> Teste einzelne Inputs und siehe Outputs</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Batch Testing:</span> Teste mehrere Inputs gleichzeitig</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Confidence Scores:</span> Sieh die Wahrscheinlichkeit für jede Vorhersage</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Compare Versions:</span> Vergleiche Predictions verschiedener Modell-Versionen</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Beispiel: Text-Klassifikation testen</h2>
          <div className="bg-gray-900/60 rounded-lg p-6">
            <p className="text-gray-300 text-sm mb-4">Eingabe:</p>
            <div className="bg-gray-900 rounded p-3 mb-4 border border-white/5">
              <p className="text-gray-400 text-sm font-mono">
                "Dies ist ein großartiges Produkt, sehr zufrieden!"
              </p>
            </div>
            <p className="text-gray-300 text-sm mb-3">Ausgabe:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">positive</span>
                <div className="flex items-center gap-2">
                  <div className="w-40 h-2 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold text-sm">94.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">negative</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-2 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-400 font-semibold text-sm">5.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VersioningSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <GitBranch className="w-8 h-8 text-purple-400" />
        Version Management
      </h1>
      <p className="text-gray-400 mb-8">Verwalte mehrere Modell-Versionen und experimentiere mit Varianten</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Was sind Versionen?</h2>
          <p className="text-gray-400 mb-4">
            Jedes trainierte Modell wird automatisch als neue Version gespeichert. Du kannst zwischen Versionen wechseln, sie vergleichen und auch alte Versionen trainieren.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Version Workflow</h2>
          <div className="space-y-3">
            {[
              { step: 'Train v1', desc: 'Trainiere dein Basis-Modell mit Dataset A' },
              { step: 'Clone zu v2', desc: 'Dupliziere v1 und trainiere mit anderen Hyperparameter' },
              { step: 'Train v2', desc: 'Trainiere v2 mit Dataset B und mehr Epochs' },
              { step: 'Compare', desc: 'Vergleiche Performance von v1 und v2' },
              { step: 'Deploy v2', desc: 'Wähle v2 als produktives Modell' },
            ].map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4 flex gap-4 items-start">
                <div className="bg-purple-500/20 text-purple-300 rounded-lg px-3 py-2 text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Version History</h2>
          <p className="text-gray-400 mb-4">
            Im Version Manager siehst du alle Versionen mit Metadaten:
          </p>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex gap-3">
              <span className="text-purple-400">•</span>
              <span>Erstellt: Wann wurde die Version trainiert</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">•</span>
              <span>Training Metriken: Loss, Accuracy, etc.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">•</span>
              <span>Dateigröße: RAM und Storage-Anforderungen</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">•</span>
              <span>Tags: Markiere wichtige Versionen (z.B. "Production")</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function TrainingBasicsSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-purple-400" />
        Training Grundlagen
      </h1>
      <p className="text-gray-400 mb-8">Verstehe die fundamentalen Konzepte des Machine Learning Trainings</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Fine-Tuning vs. Training von Grund auf</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-purple-400/20 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">Fine-Tuning (FrameTrain)</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Starte mit vortrainiertem Modell</li>
                <li>• Training dauert Minuten bis Stunden</li>
                <li>• Weniger Daten erforderlich (100+ Beispiele)</li>
                <li>• Bessere Ergebnisse mit weniger Aufwand</li>
              </ul>
            </div>
            <div className="glass border border-gray-400/20 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">Training von Grund auf</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Beginne mit zufälligen Gewichten</li>
                <li>• Training dauert Tage bis Wochen</li>
                <li>• Große Datenmengen erforderlich (Millionen)</li>
                <li>• Sehr rechenintensiv</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Trainingszyklen</h2>
          <p className="text-gray-400 mb-4">Ein <span className="text-purple-400">Epoch</span> ist ein kompletter Durchlauf durch alle Trainingsdaten:</p>
          <div className="bg-gray-900/60 rounded-lg p-5">
            <p className="text-gray-400 text-sm mb-3">Beispiel: 1000 Trainingsdaten, Batch Size 32</p>
            <p className="text-gray-300 text-sm font-mono">
              1 Epoch = 1000 / 32 = ~31 Batches ✓
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Loss & Accuracy</h2>
          <div className="space-y-3">
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Loss (Verlust)</h3>
              <p className="text-gray-400 text-sm">Misst wie schlecht die Vorhersagen sind. <span className="text-green-400">Niedriger ist besser!</span> Ideal: <span className="text-purple-400">&lt; 0.1</span></p>
            </div>
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Accuracy (Genauigkeit)</h3>
              <p className="text-gray-400 text-sm">Prozentsatz korrekter Vorhersagen. <span className="text-green-400">Höher ist besser!</span> Ziel: <span className="text-purple-400">&gt; 90%</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HyperparametersSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Settings className="w-8 h-8 text-purple-400" />
        Hyperparameter
      </h1>
      <p className="text-gray-400 mb-8">Die wichtigsten Knöpfe zum Einstellen deines Trainings</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Wichtigste Hyperparameter</h2>
          <div className="space-y-4">
            {[
              {
                name: 'Learning Rate',
                range: '1e-5 bis 1e-3',
                default: '2e-5',
                impact: 'Wie schnell Gewichte angepasst werden',
                tips: 'Höher = schneller Lernen aber möglicherweise unstabil'
              },
              {
                name: 'Batch Size',
                range: '1 bis 128',
                default: '8 bis 16',
                impact: 'Anzahl Beispiele pro Update',
                tips: 'Größere Batches = schneller aber mehr GPU-Speicher'
              },
              {
                name: 'Epochs',
                range: '1 bis 20',
                default: '3 bis 5',
                impact: 'Wie oft durchläufst du alle Daten',
                tips: 'Zu wenig = unzureichend Training. Zu viel = Overfitting'
              },
              {
                name: 'Weight Decay',
                range: '0 bis 0.1',
                default: '0.01',
                impact: 'Bestraft große Gewichte (Regularisierung)',
                tips: 'Verhindert Overfitting'
              },
            ].map((hp, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-bold">{hp.name}</h3>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded">
                    Standard: {hp.default}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{hp.impact}</p>
                <p className="text-gray-500 text-xs">
                  Bereich: <span className="text-gray-300">{hp.range}</span>
                </p>
                <p className="text-gray-500 text-xs mt-2">💡 {hp.tips}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoRASection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Layers className="w-8 h-8 text-purple-400" />
        LoRA Fine-Tuning
      </h1>
      <p className="text-gray-400 mb-8">Trainiere große Modelle effizient mit Low-Rank Adaptation</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Was ist LoRA?</h2>
          <p className="text-gray-400 mb-4">
            <span className="text-purple-400 font-semibold">LoRA (Low-Rank Adaptation)</span> ist eine Technik, um große Modelle mit 10-100x weniger Speicher zu trainieren.
          </p>
          <p className="text-gray-400">
            Statt alle Gewichte zu trainieren, trainierst du nur kleine "Adapter"-Matrizen, die mit dem Basis-Modell kombiniert werden.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">LoRA vs. Vollständiges Training</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">Vollständiges Training</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 13B Modell = ~26GB VRAM</li>
                <li>• Training: 4-8 Stunden (V100)</li>
                <li>• Speicher für Checkpoints: 50GB+</li>
                <li>• Teuer ($200+)</li>
              </ul>
            </div>
            <div className="glass border border-green-400/20 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">LoRA Training</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 13B Modell = ~4GB VRAM</li>
                <li>• Training: 1-2 Stunden (RTX 3080)</li>
                <li>• Speicher für Checkpoint: 500MB</li>
                <li>• Günstig ($5-20)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">LoRA konfigurieren</h2>
          <div className="space-y-3">
            {[
              { param: 'LoRA Rank (r)', desc: 'Größe der Adapter - höher = ausdrucksstärker aber mehr Parameter' },
              { param: 'LoRA Alpha', desc: 'Skalierungsfaktor - typisch: 16 oder 32' },
              { param: 'LoRA Dropout', desc: 'Dropout in Adaptern - typisch: 0.05 bis 0.1' },
            ].map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-1">{item.param}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <InfoBox 
          type="success"
          title="LoRA ist perfekt für FrameTrain"
          description="FrameTrain hat native LoRA-Unterstützung. Einfach 'Use LoRA' aktivieren und trainieren - das war's!"
        />
      </div>
    </div>
  )
}

function DatasetsFormatSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Database className="w-8 h-8 text-purple-400" />
        Dataset Formate
      </h1>
      <p className="text-gray-400 mb-8">Wie du deine Daten formatierst, ist entscheidend für erfolgreiches Training</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">CSV Format (empfohlen)</h2>
          <p className="text-gray-400 mb-4">Einfaches und unterstütztes Format für fast alle Aufgaben:</p>
          <div className="bg-gray-900/60 rounded-lg p-4 overflow-x-auto text-sm">
            <pre className="text-green-400 font-mono">{`text,label
"Dies ist positiv",positive
"Das gefällt mir nicht",negative
"Sehr gut!",positive
"Schrecklich",negative`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">JSON Format</h2>
          <p className="text-gray-400 mb-4">Für komplexere Strukturen oder mehrere Felder:</p>
          <div className="bg-gray-900/60 rounded-lg p-4 overflow-x-auto text-sm">
            <pre className="text-green-400 font-mono">{`{
  "text": "Dies ist positiv",
  "label": "positive",
  "source": "review"
}
{
  "text": "Das gefällt mir nicht",
  "label": "negative",
  "source": "comment"
}`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Stelle sicher dass <span className="text-white font-semibold">Text-Spalte "text"</span> heißt</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Stelle sicher dass <span className="text-white font-semibold">Label-Spalte "label"</span> heißt</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Entferne <span className="text-white font-semibold">extra Leerzeichen</span> und Zeilenumbrüche</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Verwende <span className="text-white font-semibold">konsistente Label-Namen</span> (z.B. immer "positive" nicht "pos")</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function MonitoringSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-purple-400" />
        Live Monitoring
      </h1>
      <p className="text-gray-400 mb-8">Überwache dein Training in Echtzeit mit detaillierten Metriken</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Das Analysis Panel</h2>
          <p className="text-gray-400 mb-4">
            Während dein Modell trainiert, siehst du Live-Updates:
          </p>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <Gauge className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Progress:</span> Aktueller Epoch und Batch</span>
            </li>
            <li className="flex gap-3">
              <TrendingDown className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Loss Chart:</span> Visueller Verlauf der Loss über Zeit</span>
            </li>
            <li className="flex gap-3">
              <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Metrics Table:</span> Alle numerischen Werte in Tabelle</span>
            </li>
            <li className="flex gap-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">ETA:</span> Geschätzte verbleibende Zeit</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Checkpoints</h2>
          <p className="text-gray-400 mb-4">
            FrameTrain speichert automatisch Checkpoints während des Trainings:
          </p>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Gespeichert nach jedem Epoch</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Du kannst von Checkpoint fortsetzen falls Training stoppt</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Beste Checkpoints werden markiert</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function OptimizationSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Zap className="w-8 h-8 text-purple-400" />
        Performance Tuning
      </h1>
      <p className="text-gray-400 mb-8">Optimiere dein Training für Geschwindigkeit und bessere Ergebnisse</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Batch Size Optimierung</h2>
          <p className="text-gray-400 mb-4">
            Größere Batch Sizes sind schneller aber brauchen mehr GPU-Memory:
          </p>
          <div className="space-y-3">
            {[
              { gpu: '6GB VRAM', bs: '2-4' },
              { gpu: '8GB VRAM', bs: '4-8' },
              { gpu: '12GB VRAM', bs: '8-16' },
              { gpu: '16GB+ VRAM', bs: '16-32' },
            ].map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-3 flex justify-between">
                <span className="text-gray-400">{item.gpu}</span>
                <span className="text-purple-400 font-semibold">Batch Size: {item.bs}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">LoRA für Speicher-Effizienz</h2>
          <p className="text-gray-400 mb-4">
            Aktiviere LoRA um mit weniger Speicher größere Modelle zu trainieren:
          </p>
          <div className="glass border border-green-400/20 rounded-lg p-5">
            <p className="text-gray-300 text-sm mb-2">Standard Training: 13B Modell</p>
            <p className="text-gray-400 text-xs mb-4">Speicher: 26GB VRAM erforderlich</p>
            <p className="text-gray-300 text-sm mb-2">Mit LoRA: 13B Modell</p>
            <p className="text-green-400 text-xs">Speicher: 4GB VRAM erforderlich ✓</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Gradient Accumulation</h2>
          <p className="text-gray-400 mb-4">
            Simuliere größere Batch Sizes ohne extra Speicher:
          </p>
          <p className="text-gray-400 text-sm">
            Mit Gradient Accumulation: 4, kannst du effektiv mit Batch Size 32 trainieren selbst wenn du nur 8 passt
          </p>
        </div>
      </div>
    </div>
  )
}

function GPUSetupSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Cpu className="w-8 h-8 text-purple-400" />
        GPU Optimierung
      </h1>
      <p className="text-gray-400 mb-8">Richte deine GPU-Umgebung optimal ein für maximale Performance</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">NVIDIA CUDA Setup</h2>
          <p className="text-gray-400 mb-4">Für NVIDIA GPUs brauchst du CUDA und cuDNN:</p>
          <div className="space-y-3">
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">1. CUDA 11.8+ installieren</h3>
              <p className="text-gray-400 text-sm">Lade von nvidia.com herunter und installiere</p>
            </div>
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">2. cuDNN 8.0+ installieren</h3>
              <p className="text-gray-400 text-sm">Kopiere cuDNN Dateien in CUDA Verzeichnis</p>
            </div>
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">3. FrameTrain starten</h3>
              <p className="text-gray-400 text-sm">Die App erkennt automatisch deine GPU</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Apple Silicon (M1/M2/M3/M4)</h2>
          <p className="text-gray-400 mb-4">
            Apple Silicon wird nativ unterstützt via Metal Performance Shaders. Es funktioniert automatisch ohne Setup!
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Unterstützte GPUs</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">NVIDIA</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• RTX 40 Series</li>
                <li>• RTX 30 Series</li>
                <li>• RTX 20 Series</li>
                <li>• A100, H100</li>
              </ul>
            </div>
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">Apple</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Apple M4</li>
                <li>• Apple M3</li>
                <li>• Apple M2</li>
                <li>• Apple M1</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Download className="w-8 h-8 text-purple-400" />
        Model Export & Deployment
      </h1>
      <p className="text-gray-400 mb-8">Exportiere trainierte Modelle und deploye sie in Production</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Export Formate</h2>
          <div className="space-y-3">
            {[
              { format: 'PyTorch (.pt)', use: 'PyTorch Projekte, FrameTrain' },
              { format: 'SafeTensors', use: 'Modern, sicher, schnell' },
              { format: 'ONNX', use: 'Cross-Platform Deployment' },
              { format: 'TorchScript', use: 'Production Server' },
            ].map((fmt, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-semibold">{fmt.format}</h3>
                  <span className="text-xs text-gray-400">{fmt.use}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Deployment Optionen</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">FastAPI Server:</span> Hoste dein Modell als REST API</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">HuggingFace Hub:</span> Teile Modelle mit der Community</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Docker:</span> Containerisiere für Cloud</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span><span className="text-white font-semibold">Edge Devices:</span> Deploye auf Telefonen/IoT</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function TroubleshootingSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <AlertCircle className="w-8 h-8 text-purple-400" />
        Problemlösung
      </h1>
      <p className="text-gray-400 mb-8">Lösungen für häufige Probleme beim Training</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Häufige Fehler</h2>
          <div className="space-y-4">
            {[
              {
                problem: 'GPU wird nicht erkannt',
                causes: ['CUDA nicht installiert', 'Falscher Treiber', 'GPU nicht unterstützt'],
                solution: 'Überprüfe CUDA Version und GPU-Treiber. Siehe GPU Setup Guide.'
              },
              {
                problem: 'Out of Memory Error',
                causes: ['Batch Size zu groß', 'Modell zu groß', 'Andere Apps nutzen GPU'],
                solution: 'Reduziere Batch Size oder aktiviere LoRA für speichereffizientes Training'
              },
              {
                problem: 'Training läuft sehr langsam',
                causes: ['Nutzt nur CPU statt GPU', 'Batch Size zu klein', 'Zu viele Worker'],
                solution: 'Überprüfe GPU-Nutzung. Erhöhe Batch Size. Reduziere Workers.'
              },
              {
                problem: 'Schlechte Accuracy',
                causes: ['Zu wenig Trainingsdaten', 'Falsche Label', 'Learning Rate falsch'],
                solution: 'Erhöhe Datenmengen, überprüfe Labels, passe Learning Rate an.'
              },
            ].map((item, idx) => (
              <div key={idx} className="glass border border-red-400/20 rounded-lg p-5">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {item.problem}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  <span className="text-white font-semibold">Mögliche Ursachen:</span> {item.causes.join(', ')}
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-semibold">Lösung:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Settings className="w-8 h-8 text-purple-400" />
        Einstellungen & Konfiguration
      </h1>
      <p className="text-gray-400 mb-8">Passe FrameTrain an deine Bedürfnisse an</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Haupteinstellungen</h2>
          <div className="space-y-3">
            {[
              { setting: 'GPU Device', desc: 'Wähle welche GPU für Training verwendet wird' },
              { setting: 'Auto Save Interval', desc: 'Wie oft Checkpoints automatisch gespeichert werden' },
              { setting: 'GPU Memory Limit', desc: 'Beschränke GPU-Speichernutzung (für Multitasking)' },
              { setting: 'Num Workers', desc: 'Data Loading Parallelisierung' },
            ].map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-1">{item.setting}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemesSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-purple-400" />
        Themes & UI
      </h1>
      <p className="text-gray-400 mb-8">Personalisiere die Benutzeroberfläche nach deinen Vorlieben</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Dark Themes</h2>
          <p className="text-gray-400 mb-4">Perfekt für lange Trainingssessions:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {['Midnight', 'Slate', 'Charcoal', 'Deep Purple'].map((theme) => (
              <div key={theme} className="glass border border-white/10 rounded-lg p-4 text-center">
                <p className="text-white font-semibold">{theme}</p>
                <p className="text-gray-500 text-xs mt-1">Dark Mode</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Light Themes</h2>
          <p className="text-gray-400 mb-4">Für helle Umgebungen:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {['Light Gray', 'Pure White', 'Cream'].map((theme) => (
              <div key={theme} className="glass border border-white/10 rounded-lg p-4 text-center">
                <p className="text-white font-semibold">{theme}</p>
                <p className="text-gray-500 text-xs mt-1">Light Mode</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PresetsSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <Lightbulb className="w-8 h-8 text-purple-400" />
        Training Presets
      </h1>
      <p className="text-gray-400 mb-8">Voroptimierte Konfigurationen für verschiedene Use Cases</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Verfügbare Presets</h2>
          <div className="space-y-3">
            {[
              { preset: 'Quick & Dirty', epochs: 1, bs: 16, lr: '5e-5', use: 'Testing & Prototyping' },
              { preset: 'Balanced (Empfohlen)', epochs: 3, bs: 8, lr: '2e-5', use: 'Allgemeine Verwendung' },
              { preset: 'Precision & Quality', epochs: 5, bs: 4, lr: '1e-5', use: 'Production-ready Modelle' },
              { preset: 'Memory Efficient', epochs: 2, bs: 1, lr: '3e-5', use: 'Kleine GPUs (<8GB)' },
            ].map((p, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">{p.preset}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-2">
                  <span>Epochs: <span className="text-purple-400">{p.epochs}</span></span>
                  <span>Batch: <span className="text-purple-400">{p.bs}</span></span>
                  <span>LR: <span className="text-purple-400">{p.lr}</span></span>
                  <span>Use: <span className="text-gray-300">{p.use}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UpdatesSection() {
  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <RefreshCw className="w-8 h-8 text-purple-400" />
        Updates & Versioning
      </h1>
      <p className="text-gray-400 mb-8">Halte deine FrameTrain Installation aktuell</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Auto-Update System</h2>
          <p className="text-gray-400 mb-4">
            FrameTrain überprüft automatisch auf Updates. Wenn eine neue Version verfügbar ist, siehst du eine Benachrichtigung.
          </p>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Updates sind kostenlos</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Update wird im Hintergrund heruntergeladen</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Du kannst es installieren wann du willst</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Aktuelle Version</h2>
          <p className="text-gray-400 mb-4">Um deine aktuelle Version zu überprüfen:</p>
          <div className="bg-gray-900/60 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-400">Gehe zu: Settings → About → Version</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ HELPER COMPONENTS ============

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="glass border border-white/10 rounded-lg p-4 text-center">
      <div className="text-purple-400 flex justify-center mb-3">{icon}</div>
      <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
      <p className="text-gray-400 text-xs">{desc}</p>
    </div>
  )
}

function InfoBox({ type, title, description }: { type: 'success' | 'warning' | 'info'; title: string; description: string }) {
  const styles = {
    success: 'border-green-400/20 bg-green-400/5',
    warning: 'border-yellow-400/20 bg-yellow-400/5',
    info: 'border-blue-400/20 bg-blue-400/5',
  }
  const colors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  }

  return (
    <div className={`glass rounded-lg p-5 border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <div className={colors[type]}>{icons[type]}</div>
        <div>
          <p className={`${colors[type]} font-semibold mb-1`}>{title}</p>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}

// Missing imports
const Square = Zap
const RefreshCw = ZapIcon
