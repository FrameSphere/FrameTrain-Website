'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { siteUrl } from '@/lib/seo'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppDocSearch } from '@/components/AppDocSearch'
import { AppScreenshot } from '@/components/AppScreenshot'
import {
  Book, Code2, Zap, Download, Key, Settings, Database,
  Terminal, Rocket, ChevronRight, FileCode, Cpu, Cloud,
  Shield, Package, BarChart3, Play, CheckCircle2, AlertCircle,
  Sparkles, Lightbulb, TrendingUp, GitBranch, Gauge, Layers,
  Brain, Workflow, Lock, Zap as ZapIcon,
  Home, Activity, Trophy, HardDrive,
  AlertTriangle,
  TrendingDown,
  Clock,
  Bot, KeyRound, SlidersHorizontal, MemoryStick, MousePointerClick,
  Hammer, Globe, FolderInput, Mic, PenLine, Film, Keyboard, Wand2, Target,
  Eye, ShieldCheck, FileOutput, RotateCcw, GraduationCap
} from 'lucide-react'

export default function DocsPage() {
  const t = useTranslations('Docs')
  const locale = useLocale()
  const [activeSection, setActiveSection] = useState('installation')
  const navigateTo = (section: string) => setActiveSection(section)

  // Deep-Links wie /docs#dataset-builder (z.B. von der Startseite) öffnen
  // direkt den passenden Abschnitt statt immer "Installation".
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.slice(1)
      if (!navigation.some((group) => group.items.some((item) => item.id === id))) return
      setActiveSection(id)
      // Kurz warten: Next scrollt nach der Navigation selbst noch nach oben.
      setTimeout(() => document.getElementById('docs-content')?.scrollIntoView({ block: 'start' }), 150)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pageUrl = `${siteUrl}/${locale}/docs`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t('metaTitle'), item: pageUrl },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: t('metaTitle'),
        description: t('metaDescription'),
        url: pageUrl,
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        isPartOf: { '@type': 'WebSite', name: 'FrameTrain', url: siteUrl },
      },
    ],
  }

  const navigation = [
    {
      title: t('navigation.gettingStarted.title'),
      id: 'getting-started',
      icon: <Rocket className="w-4 h-4" />,
      items: [
        { id: 'installation', title: t('navigation.gettingStarted.items.installation') },
        { id: 'quick-start', title: t('navigation.gettingStarted.items.quickStart') },
        { id: 'first-training', title: t('navigation.gettingStarted.items.firstTraining') },
      ]
    },
    {
      title: t('navigation.appFeatures.title'),
      id: 'app-features',
      icon: <Sparkles className="w-4 h-4" />,
      items: [
        { id: 'home-panel', title: t('navigation.appFeatures.items.homePanel') },
        { id: 'model-manager', title: t('navigation.appFeatures.items.modelManager') },
        { id: 'training-panel', title: t('navigation.appFeatures.items.trainingPanel') },
        { id: 'dataset-upload', title: t('navigation.appFeatures.items.datasetUpload') },
        { id: 'dataset-builder', title: t('navigation.appFeatures.items.datasetBuilder') },
        { id: 'analysis', title: t('navigation.appFeatures.items.analysis') },
        { id: 'testing', title: t('navigation.appFeatures.items.testing') },
        { id: 'versioning', title: t('navigation.appFeatures.items.versioning') },
        { id: 'ai-assistant', title: t('navigation.appFeatures.items.aiAssistant') },
      ]
    },
    {
      title: t('navigation.training.title'),
      id: 'training',
      icon: <Brain className="w-4 h-4" />,
      items: [
        { id: 'training-basics', title: t('navigation.training.items.trainingBasics') },
        { id: 'hyperparameters', title: t('navigation.training.items.hyperparameters') },
        { id: 'lora-training', title: t('navigation.training.items.loraTraining') },
        { id: 'datasets-format', title: t('navigation.training.items.datasetsFormat') },
        { id: 'monitoring', title: t('navigation.training.items.monitoring') },
      ]
    },
    {
      title: t('navigation.advanced.title'),
      id: 'advanced',
      icon: <Code2 className="w-4 h-4" />,
      items: [
        { id: 'optimization', title: t('navigation.advanced.items.optimization') },
        { id: 'gpu-setup', title: t('navigation.advanced.items.gpuSetup') },
        { id: 'export', title: t('navigation.advanced.items.export') },
        { id: 'troubleshooting', title: t('navigation.advanced.items.troubleshooting') },
        { id: 'settings', title: t('navigation.advanced.items.settings') },
      ]
    },
    {
      title: t('navigation.resources.title'),
      id: 'resources',
      icon: <Lightbulb className="w-4 h-4" />,
      items: [
        { id: 'themes', title: t('navigation.resources.items.themes') },
        { id: 'presets', title: t('navigation.resources.items.presets') },
        { id: 'updates', title: t('navigation.resources.items.updates') },
      ]
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
                <Book className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                {t('heroSubtitle')}
              </p>
              {/* Search */}
              <div className="mb-6">
                <AppDocSearch onNavigate={navigateTo} />
              </div>

              {/* AI Training Coach Banner */}
              <Link
                href="/docs/ai-training-guide"
                className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/30 rounded-2xl hover:border-violet-400/60 hover:from-violet-600/30 hover:to-fuchsia-600/30 transition duration-200 ease-out group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">{t('coachBanner.title')}</p>
                  <p className="text-gray-400 text-sm">{t('coachBanner.desc')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform ml-2" />
              </Link>
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
                  {/* AI Coach Link */}
                  <Link href="/docs/ai-training-guide" className="flex items-center gap-2 w-full px-3 py-2.5 mb-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-400/25 hover:border-violet-400/50 transition duration-200 ease-out group">
                    <Brain className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-violet-300 text-xs font-bold">{t('coachSidebar.title')}</p>
                      <p className="text-gray-500 text-xs">{t('coachSidebar.desc')}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

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
                              className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg transition duration-200 ease-out text-sm ${
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
              <div id="docs-content" className="flex-1 max-w-4xl scroll-mt-24">
                <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 prose prose-invert max-w-none">
                  {/* SEO: alle Sections bleiben im DOM, nur die inaktive wird per CSS (hidden) ausgeblendet,
                      damit Googlebot den gesamten Doku-Inhalt sieht statt nur den aktiven Tab. */}
                  <div className={activeSection === 'installation' ? '' : 'hidden'}><InstallationSection /></div>
                  <div className={activeSection === 'quick-start' ? '' : 'hidden'}><QuickStartSection /></div>
                  <div className={activeSection === 'first-training' ? '' : 'hidden'}><FirstTrainingSection /></div>
                  <div className={activeSection === 'home-panel' ? '' : 'hidden'}><HomePanelSection /></div>
                  <div className={activeSection === 'model-manager' ? '' : 'hidden'}><ModelManagerSection /></div>
                  <div className={activeSection === 'training-panel' ? '' : 'hidden'}><TrainingPanelSection /></div>
                  <div className={activeSection === 'dataset-upload' ? '' : 'hidden'}><DatasetUploadSection /></div>
                  <div className={activeSection === 'dataset-builder' ? '' : 'hidden'}><DatasetBuilderSection /></div>
                  <div className={activeSection === 'analysis' ? '' : 'hidden'}><AnalysisSection /></div>
                  <div className={activeSection === 'testing' ? '' : 'hidden'}><TestingSection /></div>
                  <div className={activeSection === 'versioning' ? '' : 'hidden'}><VersioningSection /></div>
                  <div className={activeSection === 'ai-assistant' ? '' : 'hidden'}><AIAssistantSection /></div>
                  <div className={activeSection === 'training-basics' ? '' : 'hidden'}><TrainingBasicsSection /></div>
                  <div className={activeSection === 'hyperparameters' ? '' : 'hidden'}><HyperparametersSection /></div>
                  <div className={activeSection === 'lora-training' ? '' : 'hidden'}><LoRASection /></div>
                  <div className={activeSection === 'datasets-format' ? '' : 'hidden'}><DatasetsFormatSection /></div>
                  <div className={activeSection === 'monitoring' ? '' : 'hidden'}><MonitoringSection /></div>
                  <div className={activeSection === 'optimization' ? '' : 'hidden'}><OptimizationSection /></div>
                  <div className={activeSection === 'gpu-setup' ? '' : 'hidden'}><GPUSetupSection /></div>
                  <div className={activeSection === 'export' ? '' : 'hidden'}><ExportSection /></div>
                  <div className={activeSection === 'troubleshooting' ? '' : 'hidden'}><TroubleshootingSection /></div>
                  <div className={activeSection === 'settings' ? '' : 'hidden'}><SettingsSection /></div>
                  <div className={activeSection === 'themes' ? '' : 'hidden'}><ThemesSection /></div>
                  <div className={activeSection === 'presets' ? '' : 'hidden'}><PresetsSection /></div>
                  <div className={activeSection === 'updates' ? '' : 'hidden'}><UpdatesSection /></div>
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
  const t = useTranslations('Docs.installation')
  const osList = t.raw('step2.os') as { name: string; desc: string; file: string }[]
  const minItems = t.raw('requirements.minItems') as string[]
  const recItems = t.raw('requirements.recItems') as string[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Download className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step1.heading')}</h2>
          <p className="text-gray-400 mb-4" dangerouslySetInnerHTML={{ __html: t.raw('step1.text') }} />
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition duration-200 ease-out">
            <Rocket className="w-4 h-4" />
            {t('step1.cta')}
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step2.heading')}</h2>
          <p className="text-gray-400 mb-4">{t('step2.text')}</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {osList.map((os) => (
              <div key={os.name} className="card-lift glass border border-white/10 rounded-xl p-5 hover:border-purple-400/30 transition-colors">
                <h3 className="text-white font-bold mb-1">{os.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{os.desc}</p>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-flex items-center gap-2 min-h-[44px] transition-colors">
                  <Download className="w-4 h-4" />
                  {os.file}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step3.heading')}</h2>
          <p className="text-gray-400 mb-4" dangerouslySetInnerHTML={{ __html: t.raw('step3.text') }} />
          <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4 text-sm font-mono text-gray-300">
            frametrain_sk_1a2b3c4d5e6f7g8h9i0j
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step4.heading')}</h2>
          <p className="text-gray-400 mb-4">{t('step4.text')}</p>
          <InfoBox 
            type="success"
            title={t('step4.successTitle')}
            description={t('step4.successDesc')}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('requirements.heading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                {t('requirements.minTitle')}
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {minItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="glass border border-green-400/20 rounded-lg p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                {t('requirements.recTitle')}
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {recItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStartSection() {
  const t = useTranslations('Docs.quickStart')
  const steps = t.raw('steps') as { title: string; desc: string; details: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Zap className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-5">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                {idx + 1}
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
        title={t('successTitle')}
        description={t('successDesc')}
      />
    </div>
  )
}

function FirstTrainingSection() {
  const t = useTranslations('Docs.firstTraining')
  const step2Items = t.raw('step2.items') as { title: string; desc: string }[]
  const step4Items = t.raw('step4.items') as { label: string; desc: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Play className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step1.heading')}</h2>
          <p className="text-gray-400 mb-4">{t('step1.text')}</p>
          <div className="bg-gray-900/60 rounded-lg p-4 text-sm overflow-x-auto">
            <pre className="text-green-400 font-mono">{`text,label
"Das ist ein positiver Review",positive
"Mir hat das nicht gefallen",negative
"Sehr zufrieden mit dem Produkt!",positive`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step2.heading')}</h2>
          <p className="text-gray-400 mb-4">{t('step2.text')}</p>
          <ul className="space-y-3 text-gray-400">
            {step2Items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span><span className="text-white font-semibold">{item.title}</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('step3.heading')}</h2>
          <p className="text-gray-400 mb-4">{t('step3.text')}</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">{t('step4.heading')}</h2>
          <p className="text-gray-400 mb-4">{t('step4.text')}</p>
          <ul className="space-y-2 text-gray-400 text-sm">
            {step4Items.map((item, i) => (
              <li key={item.label}>{['📈', '📊', '⚡', '💾'][i]} <span className="text-white">{item.label}</span> - {item.desc}</li>
            ))}
          </ul>
        </div>

        <InfoBox 
          type="warning"
          title={t('tipTitle')}
          description={t('tipDesc')}
        />
      </div>
    </div>
  )
}

// Die Startseite ist seit 1.2.46 der Landepunkt nach dem Login – davor landete
// man direkt in der Modell-Liste. Deshalb steht sie hier vor dem Model Manager.
function HomePanelSection() {
  const t = useTranslations('Docs.homePanel')
  const features = t.raw('features') as { title: string; desc: string }[]
  const insights = t.raw('insights') as string[]
  const featureIcons = [
    <Activity className="w-6 h-6" />,
    <Clock className="w-6 h-6" />,
    <HardDrive className="w-6 h-6" />,
    <Trophy className="w-6 h-6" />,
  ]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Home className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>

      <div className="space-y-8">
        <div>
          <p className="text-gray-400 mb-4">{t('intro')}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={featureIcons[i]} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('insightsHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('insightsText')}</p>
          <ul className="space-y-3 text-gray-400 text-sm">
            {insights.map((item, i) => (
              <li key={i} className="flex gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('briefingHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('briefingText')}</p>
          <InfoBox
            type="info"
            title={t('briefingTipTitle')}
            description={t('briefingTipDesc')}
          />
        </div>
      </div>
    </div>
  )
}

function ModelManagerSection() {
  const t = useTranslations('Docs.modelManager')
  const features = t.raw('features') as { title: string; desc: string }[]
  const importSteps = t.raw('importSteps') as string[]
  const starters = t.raw('starters') as { name: string; task: string; params: string; desc: string }[]
  const featureIcons = [<Download className="w-6 h-6" />, <Layers className="w-6 h-6" />, <Database className="w-6 h-6" />, <GitBranch className="w-6 h-6" />]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Package className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('featuresHeading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={featureIcons[i]} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('importHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('importText')}</p>
          <ol className="space-y-3 text-gray-400 text-sm">
            {importSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-purple-400">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('startersHeading')}</h2>
          <div className="space-y-3">
            {starters.map((model, idx) => (
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
  const t = useTranslations('Docs.trainingPanel')
  const workflow = t.raw('workflow') as { icon: string; title: string; desc: string }[]
  const controls = t.raw('controls') as { title: string; desc: string }[]
  const presets = t.raw('presets') as { name: string; lr: string; epochs: number; batch: number; desc: string }[]
  const controlIcons = [<Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />, <Square className="w-5 h-5 text-red-400 flex-shrink-0" />, <RefreshCw className="w-5 h-5 text-blue-400 flex-shrink-0" />]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Brain className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('workflowHeading')}</h2>
          <div className="space-y-3">
            {workflow.map((step, idx) => (
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
          <h2 className="text-2xl font-bold text-white mb-4">{t('controlsHeading')}</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            {controls.map((c, i) => (
              <li key={c.title} className="flex gap-3">
                {controlIcons[i]}
                <span><span className="text-white font-semibold">{c.title}</span> {c.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('presetsHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('presetsText')}</p>
          <div className="space-y-3">
            {presets.map((preset, idx) => (
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
  const t = useTranslations('Docs.datasetUpload')
  const formats = t.raw('formats') as { format: string; example: string }[]
  const uploadSteps = t.raw('uploadSteps') as string[]
  const prepItems = t.raw('prepItems') as { title: string; desc: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Database className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('formatsHeading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {formats.map((fmt, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">{fmt.format}</h3>
                <div className="bg-gray-900/60 rounded p-3 text-xs font-mono text-gray-400 overflow-x-auto whitespace-pre-wrap">
                  {fmt.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('uploadHeading')}</h2>
          <ol className="space-y-3 text-gray-400 text-sm">
            {uploadSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-purple-400 font-bold">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('prepHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('prepText')}</p>
          <ul className="space-y-3 text-gray-400 text-sm">
            {prepItems.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><span className="text-white font-semibold">{item.title}</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Datensatz-Werkstatt der Desktop-App (seit 1.3.4): Datensätze in der App
// sammeln, beschriften, prüfen und exportieren. Die Grenzen am Ende stammen
// aus dem Prüfbericht zur 1.3.4 – dort nichts versprechen, was fehlt.
function DatasetBuilderSection() {
  const t = useTranslations('Docs.datasetBuilder')
  const locale = useLocale()
  // Screenshots aus der App 1.3.4 (public/images/screenshots/<locale>/frametrain-dataset-builder-*)
  const shot = (key: string, slug: string) => (
    <AppScreenshot
      locale={locale}
      slug={`dataset-builder-${slug}`}
      alt={t(`shots.${key}.alt`)}
      caption={t(`shots.${key}.caption`)}
      sizes="(min-width: 1024px) 800px, 100vw"
      className="not-prose"
    />
  )
  const flow = t.raw('flow') as { title: string; desc: string }[]
  const types = t.raw('types') as { type: string; export: string; models: string; suggest: string }[]
  const features = t.raw('features') as { title: string; desc: string }[]
  const webModes = t.raw('webModes') as { title: string; desc: string }[]
  const webRules = t.raw('webRules') as string[]
  const limits = t.raw('limits') as string[]
  const featureIcons = [FolderInput, Mic, PenLine, Film, Keyboard, Wand2, Target, Eye, ShieldCheck, FileOutput]
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-purple-500/15 border border-purple-400/25 rounded-full text-purple-300 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        {t('badge')}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Hammer className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>

      <div className="space-y-8">
        <p className="text-gray-400">{t('intro')}</p>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-purple-400" />
            {t('flowHeading')}
          </h2>
          <p className="text-gray-400 mb-4">{t('flowText')}</p>
          <ol className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {flow.map((step, i) => (
              <li
                key={step.title}
                className={`glass rounded-lg p-4 border ${i === flow.length - 1 ? 'border-purple-400/40 bg-purple-500/[0.07]' : 'border-white/10'}`}
              >
                <span className="text-purple-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-white font-semibold mt-1">{step.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{step.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex items-start gap-2 text-sm text-purple-300">
            <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{t('flowLoop')}</span>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('typesHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('typesText')}</p>
          <div className="mb-6">{shot('newProject', 'new-project')}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 text-gray-300 font-semibold">{t('typesColType')}</th>
                  <th className="py-2 pr-4 text-gray-300 font-semibold">{t('typesColExport')}</th>
                  <th className="py-2 pr-4 text-gray-300 font-semibold">{t('typesColModels')}</th>
                  <th className="py-2 text-gray-300 font-semibold">{t('typesColSuggest')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {types.map((row) => (
                  <tr key={row.type}>
                    <td className="py-2 pr-4 text-white font-medium">{row.type}</td>
                    <td className="py-2 pr-4 text-gray-400">{row.export}</td>
                    <td className="py-2 pr-4 text-purple-300">{row.models}</td>
                    <td className="py-2 text-gray-400">{row.suggest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-4">{t('typesNote')}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('featuresHeading')}</h2>
          <div className="space-y-6 mb-6">
            {shot('imageBoxes', 'image-boxes')}
            {shot('video', 'video')}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => {
              const Icon = featureIcons[i] ?? Sparkles
              return (
                <div key={f.title} className="glass border border-white/10 rounded-lg p-4 flex gap-3">
                  <Icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" />
            {t('webHeading')}
          </h2>
          <p className="text-gray-400 mb-4">{t('webText')}</p>
          <div className="mb-6">{shot('web', 'web')}</div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {webModes.map((mode) => (
              <div key={mode.title} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-1">{mode.title}</h3>
                <p className="text-gray-400 text-sm">{mode.desc}</p>
              </div>
            ))}
          </div>
          <h3 className="text-white font-semibold mb-3">{t('webRulesHeading')}</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            {webRules.map((rule) => (
              <li key={rule} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {shot('exportReport', 'export-report')}

        <div className="glass rounded-lg p-5 border border-green-400/20 bg-green-400/5">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-semibold mb-1">{t('beginnerTitle')}</p>
              <p className="text-gray-400 text-sm">{t('beginnerDesc')}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg p-5 border border-yellow-400/20 bg-yellow-400/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-semibold mb-2">{t('limitsTitle')}</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-400 text-sm">
                {limits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalysisSection() {
  const t = useTranslations('Docs.analysis')
  const metrics = t.raw('metrics') as { metric: string; desc: string; good: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('metricsHeading')}</h2>
          <div className="space-y-3">
            {metrics.map((item, idx) => (
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
          <h2 className="text-2xl font-bold text-white mb-4">{t('problemsHeading')}</h2>
          <div className="space-y-3">
            <div className="glass border border-red-400/20 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t('overfitting.title')}
              </h3>
              <p className="text-gray-400 text-sm mb-2">{t('overfitting.desc')}</p>
              <p className="text-gray-500 text-xs">{t('overfitting.solution')}</p>
            </div>
            <div className="glass border border-orange-400/20 rounded-lg p-4">
              <h3 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t('underfitting.title')}
              </h3>
              <p className="text-gray-400 text-sm mb-2">{t('underfitting.desc')}</p>
              <p className="text-gray-500 text-xs">{t('underfitting.solution')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestingSection() {
  const t = useTranslations('Docs.testing')
  const features = t.raw('features') as { title: string; desc: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Play className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('featuresHeading')}</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span><span className="text-white font-semibold">{f.title}</span> {f.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('exampleHeading')}</h2>
          <div className="bg-gray-900/60 rounded-lg p-6">
            <p className="text-gray-300 text-sm mb-4">{t('inputLabel')}</p>
            <div className="bg-gray-900 rounded p-3 mb-4 border border-white/5">
              <p className="text-gray-400 text-sm font-mono">
                "{t('exampleInput')}"
              </p>
            </div>
            <p className="text-gray-300 text-sm mb-3">{t('outputLabel')}</p>
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
  const t = useTranslations('Docs.versioning')
  const workflow = t.raw('workflow') as { step: string; desc: string }[]
  const historyItems = t.raw('historyItems') as string[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <GitBranch className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('whatHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('whatText')}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('workflowHeading')}</h2>
          <div className="space-y-3">
            {workflow.map((item, idx) => (
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
          <h2 className="text-2xl font-bold text-white mb-4">{t('historyHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('historyText')}</p>
          <ul className="space-y-2 text-gray-400 text-sm">
            {historyItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-purple-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// KI-Funktionen der Desktop-App (Anbieter, Token-Budget, Coach, Skills).
// Nicht zu verwechseln mit dem "KI-Training Coach" der Website unter
// /docs/ai-training-guide – das ist ein Theorie-Guide, dieser Abschnitt
// beschreibt den Chat-Coach und die Assistenten in der App.
function AIAssistantSection() {
  const t = useTranslations('Docs.aiAssistant')
  const providers = t.raw('providers') as { title: string; desc: string }[]
  const budgetLevels = t.raw('budgetLevels') as { name: string; desc: string }[]
  const coachFeatures = t.raw('coachFeatures') as { title: string; desc: string }[]
  const skills = t.raw('skills') as { page: string; commands: string }[]
  const areas = t.raw('areas') as { title: string; desc: string }[]
  const coachIcons = [
    <MousePointerClick className="w-6 h-6" />,
    <MemoryStick className="w-6 h-6" />,
    <Layers className="w-6 h-6" />,
    <Play className="w-6 h-6" />,
  ]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Bot className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>

      <div className="space-y-8">
        <p className="text-gray-400">{t('intro')}</p>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-purple-400" />
            {t('providersHeading')}
          </h2>
          <p className="text-gray-400 mb-4">{t('providersText')}</p>
          <ul className="space-y-3 text-gray-400 text-sm">
            {providers.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span><span className="text-white font-semibold">{item.title}</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-purple-400" />
            {t('budgetHeading')}
          </h2>
          <p className="text-gray-400 mb-4">{t('budgetText')}</p>
          <div className="space-y-2 mb-4">
            {budgetLevels.map((level) => (
              <div key={level.name} className="glass border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span className="text-purple-400 font-semibold sm:w-28 flex-shrink-0">{level.name}</span>
                <span className="text-gray-400 text-sm">{level.desc}</span>
              </div>
            ))}
          </div>
          <InfoBox type="warning" title={t('budgetTipTitle')} description={t('budgetTipDesc')} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('coachHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('coachText')}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {coachFeatures.map((f, i) => (
              <FeatureCard key={f.title} icon={coachIcons[i]} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('skillsHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('skillsText')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 text-gray-300 font-semibold">{t('skillsPageLabel')}</th>
                  <th className="py-2 text-gray-300 font-semibold">{t('skillsCommandLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {skills.map((row) => (
                  <tr key={row.page}>
                    <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{row.page}</td>
                    <td className="py-2 font-mono text-purple-300">{row.commands}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('areasHeading')}</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            {areas.map((item) => (
              <li key={item.title} className="flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span><span className="text-white font-semibold">{item.title}</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <InfoBox type="info" title={t('privacyTitle')} description={t('privacyDesc')} />
      </div>
    </div>
  )
}

function TrainingBasicsSection() {
  const t = useTranslations('Docs.trainingBasics')
  const fineTuneItems = t.raw('fineTuneItems') as string[]
  const scratchItems = t.raw('scratchItems') as string[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('compareHeading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-purple-400/20 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">{t('fineTuneTitle')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {fineTuneItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="glass border border-gray-400/20 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">{t('scratchTitle')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {scratchItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('cyclesHeading')}</h2>
          <p className="text-gray-400 mb-4" dangerouslySetInnerHTML={{ __html: t.raw('cyclesIntro') }} />
          <div className="bg-gray-900/60 rounded-lg p-5">
            <p className="text-gray-400 text-sm mb-3">{t('cyclesExampleLabel')}</p>
            <p className="text-gray-300 text-sm font-mono">
              1 Epoch = 1000 / 32 = ~31 Batches ✓
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('lossAccHeading')}</h2>
          <div className="space-y-3">
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">{t('lossTitle')}</h3>
              <p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: t.raw('lossDesc') }} />
            </div>
            <div className="glass border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">{t('accTitle')}</h3>
              <p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: t.raw('accDesc') }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HyperparametersSection() {
  const t = useTranslations('Docs.hyperparameters')
  const items = t.raw('items') as { name: string; range: string; default: string; impact: string; tips: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Settings className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('mainHeading')}</h2>
          <div className="space-y-4">
            {items.map((hp, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-bold">{hp.name}</h3>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded">
                    {t('defaultLabel')} {hp.default}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{hp.impact}</p>
                <p className="text-gray-500 text-xs">
                  {t('rangeLabel')} <span className="text-gray-300">{hp.range}</span>
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
  const t = useTranslations('Docs.lora')
  const fullItems = t.raw('fullItems') as string[]
  const loraItems = t.raw('loraItems') as string[]
  const configItems = t.raw('configItems') as { param: string; desc: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Layers className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('whatHeading')}</h2>
          <p className="text-gray-400 mb-4" dangerouslySetInnerHTML={{ __html: t.raw('whatText1') }} />
          <p className="text-gray-400">{t('whatText2')}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('compareHeading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">{t('fullTitle')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {fullItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="glass border border-green-400/20 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">{t('loraTitle')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {loraItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('configHeading')}</h2>
          <div className="space-y-3">
            {configItems.map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-1">{item.param}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <InfoBox 
          type="success"
          title={t('successTitle')}
          description={t('successDesc')}
        />
      </div>
    </div>
  )
}

function DatasetsFormatSection() {
  const t = useTranslations('Docs.datasetsFormat')
  const bestPractices = t.raw('bestPractices') as { title: string; rest: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Database className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('csvHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('csvText')}</p>
          <div className="bg-gray-900/60 rounded-lg p-4 overflow-x-auto text-sm">
            <pre className="text-green-400 font-mono">{`text,label
"Dies ist positiv",positive
"Das gefällt mir nicht",negative
"Sehr gut!",positive
"Schrecklich",negative`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('jsonHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('jsonText')}</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">{t('bestPracticesHeading')}</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            {bestPractices.map((bp) => (
              <li key={bp.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span><span className="text-white font-semibold">{bp.title}</span> {bp.rest}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function MonitoringSection() {
  const t = useTranslations('Docs.monitoring')
  const panelItems = t.raw('panelItems') as { title: string; desc: string }[]
  const checkpointsItems = t.raw('checkpointsItems') as string[]
  const panelIcons = [<Gauge className="w-5 h-5 text-purple-400 flex-shrink-0" />, <TrendingDown className="w-5 h-5 text-green-400 flex-shrink-0" />, <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0" />, <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('panelHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('panelText')}</p>
          <ul className="space-y-3 text-gray-400 text-sm">
            {panelItems.map((item, i) => (
              <li key={item.title} className="flex gap-3">
                {panelIcons[i]}
                <span><span className="text-white font-semibold">{item.title}</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('checkpointsHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('checkpointsText')}</p>
          <ul className="space-y-2 text-gray-400 text-sm">
            {checkpointsItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function OptimizationSection() {
  const t = useTranslations('Docs.optimization')
  const batchTable = t.raw('batchTable') as { gpu: string; bs: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Zap className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('batchHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('batchText')}</p>
          <div className="space-y-3">
            {batchTable.map((item, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-3 flex justify-between">
                <span className="text-gray-400">{item.gpu}</span>
                <span className="text-purple-400 font-semibold">Batch Size: {item.bs}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('loraHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('loraText')}</p>
          <div className="glass border border-green-400/20 rounded-lg p-5">
            <p className="text-gray-300 text-sm mb-2">{t('loraStandardLabel')}</p>
            <p className="text-gray-400 text-xs mb-4">{t('loraStandardDesc')}</p>
            <p className="text-gray-300 text-sm mb-2">{t('loraLoraLabel')}</p>
            <p className="text-green-400 text-xs">{t('loraLoraDesc')}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('gradHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('gradText')}</p>
          <p className="text-gray-400 text-sm">{t('gradExample')}</p>
        </div>
      </div>
    </div>
  )
}

function GPUSetupSection() {
  const t = useTranslations('Docs.gpuSetup')
  const cudaSteps = t.raw('cudaSteps') as { title: string; desc: string }[]
  const nvidiaItems = t.raw('nvidiaItems') as string[]
  const appleItems = t.raw('appleItems') as string[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Cpu className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('cudaHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('cudaText')}</p>
          <div className="space-y-3">
            {cudaSteps.map((step, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('appleHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('appleText')}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('supportedHeading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">{t('nvidiaTitle')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {nvidiaItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="glass border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">{t('appleTitle')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {appleItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportSection() {
  const t = useTranslations('Docs.export')
  const formats = t.raw('formats') as { format: string; use: string }[]
  const deployItems = t.raw('deployItems') as { title: string; desc: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Download className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('formatsHeading')}</h2>
          <div className="space-y-3">
            {formats.map((fmt, idx) => (
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
          <h2 className="text-2xl font-bold text-white mb-4">{t('deployHeading')}</h2>
          <ul className="space-y-3 text-gray-400 text-sm">
            {deployItems.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span><span className="text-white font-semibold">{item.title}</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function TroubleshootingSection() {
  const t = useTranslations('Docs.troubleshooting')
  const errors = t.raw('errors') as { problem: string; causes: string[]; solution: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <AlertCircle className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('errorsHeading')}</h2>
          <div className="space-y-4">
            {errors.map((item, idx) => (
              <div key={idx} className="glass border border-red-400/20 rounded-lg p-5">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {item.problem}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  <span className="text-white font-semibold">{t('causesLabel')}</span> {item.causes.join(', ')}
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-semibold">{t('solutionLabel')}</span> {item.solution}
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
  const t = useTranslations('Docs.settings')
  const items = t.raw('items') as { setting: string; desc: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Settings className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('mainHeading')}</h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
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
  const t = useTranslations('Docs.themes')
  const darkThemes = t.raw('darkThemes') as string[]
  const lightThemes = t.raw('lightThemes') as string[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('darkHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('darkText')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {darkThemes.map((theme) => (
              <div key={theme} className="glass border border-white/10 rounded-lg p-4 text-center">
                <p className="text-white font-semibold">{theme}</p>
                <p className="text-gray-500 text-xs mt-1">{t('darkModeLabel')}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('lightHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('lightText')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lightThemes.map((theme) => (
              <div key={theme} className="glass border border-white/10 rounded-lg p-4 text-center">
                <p className="text-white font-semibold">{theme}</p>
                <p className="text-gray-500 text-xs mt-1">{t('lightModeLabel')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PresetsSection() {
  const t = useTranslations('Docs.presets')
  // Die LoRA-/QLoRA-Templates setzen weder Epochen noch LR – dort steht "–".
  const presets = t.raw('presets') as { preset: string; epochs: number | string; bs: number; lr: string; use: string }[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Lightbulb className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('availableHeading')}</h2>
          <div className="space-y-3">
            {presets.map((p, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">{p.preset}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-2">
                  <span>{t('epochsLabel')} <span className="text-purple-400">{p.epochs}</span></span>
                  <span>{t('batchLabel')} <span className="text-purple-400">{p.bs}</span></span>
                  <span>{t('lrLabel')} <span className="text-purple-400">{p.lr}</span></span>
                  <span>{t('useLabel')} <span className="text-gray-300">{p.use}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InfoBox type="info" title={t('customTitle')} description={t('customNote')} />
      </div>
    </div>
  )
}

function UpdatesSection() {
  const t = useTranslations('Docs.updates')
  const autoItems = t.raw('autoItems') as string[]
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <RefreshCw className="w-8 h-8 text-purple-400" />
        {t('heading')}
      </h2>
      <p className="text-gray-400 mb-8">{t('subtitle')}</p>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('autoHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('autoText')}</p>
          <ul className="space-y-2 text-gray-400 text-sm">
            {autoItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('versionHeading')}</h2>
          <p className="text-gray-400 mb-4">{t('versionText')}</p>
          <div className="bg-gray-900/60 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-400">{t('versionCode')}</p>
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
