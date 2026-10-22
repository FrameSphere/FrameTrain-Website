'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Download, AlertCircle, Terminal, FileCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type Platform = 'macos' | 'windows' | 'linux'

export default function InstallPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('macos')
  const t = useTranslations('Install')

  const macLines1 = t.raw('macos.step1.lines') as string[]
  const winLines2 = t.raw('windows.step2.lines') as string[]
  const winLines3 = t.raw('windows.step3.lines') as string[]
  const winLines4 = t.raw('windows.step4.lines') as string[]
  const linuxLines3a = t.raw('linux.step3a.lines') as string[]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-ink mb-4">
              {t('heading')}
            </h1>
            <p className="text-xl text-ink-muted">
              {t('subtitle')}
            </p>
          </div>

          {/* Platform Tabs */}
          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            <button 
              onClick={() => setSelectedPlatform('macos')}
              className={`px-6 py-3 rounded-sm font-semibold transition duration-200 ease-out ${
                selectedPlatform === 'macos' 
                  ? 'bg-indigo-button text-ink' 
                  : 'bg-surface border border-line text-ink hover:bg-surface-raised'
              }`}
            >
              {t('tabs.macos')}
            </button>
            <button 
              onClick={() => setSelectedPlatform('windows')}
              className={`px-6 py-3 rounded-sm font-semibold transition duration-200 ease-out ${
                selectedPlatform === 'windows' 
                  ? 'bg-indigo-button text-ink' 
                  : 'bg-surface border border-line text-ink hover:bg-surface-raised'
              }`}
            >
              {t('tabs.windows')}
            </button>
            <button 
              onClick={() => setSelectedPlatform('linux')}
              className={`px-6 py-3 rounded-sm font-semibold transition duration-200 ease-out ${
                selectedPlatform === 'linux' 
                  ? 'bg-indigo-button text-ink' 
                  : 'bg-surface border border-line text-ink hover:bg-surface-raised'
              }`}
            >
              {t('tabs.linux')}
            </button>
          </div>

          {/* macOS Installation – SEO: bleibt immer im DOM, nur per CSS (hidden) ausgeblendet */}
          <div className={selectedPlatform === 'macos' ? '' : 'hidden'}>
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Download className="w-8 h-8 text-indigo-text" />
                {t('macos.heading')}
              </h2>

              {/* Warning */}
              <div className="bg-ghost-fill border border-line rounded-sm p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-warning font-semibold mb-1">
                      {t('macos.warningTitle')}
                    </h3>
                    <p className="text-ink text-sm">
                      {t('macos.warningText')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('macos.step1.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-2 text-ink">
                    {macLines1.map((line) => <p key={line}>• {line}</p>)}
                  </div>
                </div>

                {/* Step 2 - Terminal Method */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('macos.step2.title')}</h3>
                  </div>
                  
                  <div className="ml-11 space-y-3">
                    <p className="text-ink">
                      {t('macos.step2.intro')}
                    </p>
                    
                    <div className="bg-surface rounded-sm p-4 border border-line">
                      <code className="text-success text-sm font-mono block">
                        sudo xattr -cr "/Applications/FrameTrain.app"
                      </code>
                    </div>

                    <p className="text-ink-muted text-sm">
                      {t('macos.step2.hint')}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('macos.step3.title')}</h3>
                  </div>
                  <div className="ml-11 text-ink">
                    <p>{t('macos.step3.text')}</p>
                  </div>
                </div>
              </div>

              {/* Why */}
              <div className="mt-6 bg-indigo-soft border border-line rounded-sm p-4">
                <h4 className="text-indigo-text font-semibold mb-2">{t('macos.why.title')}</h4>
                <p className="text-ink text-sm">
                  {t('macos.why.text')}
                </p>
              </div>
            </div>
          </div>

          {/* Windows Installation – SEO: bleibt immer im DOM, nur per CSS (hidden) ausgeblendet */}
          <div className={selectedPlatform === 'windows' ? '' : 'hidden'}>
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Download className="w-8 h-8 text-indigo-text" />
                {t('windows.heading')}
              </h2>

              {/* Warning */}
              <div className="bg-ghost-fill border border-line rounded-sm p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-warning font-semibold mb-1">
                      {t('windows.warningTitle')}
                    </h3>
                    <p className="text-ink text-sm">
                      {t('windows.warningText')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('windows.step1.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-2 text-ink">
                    <p>• {t('windows.step1.line')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('windows.step2.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-2 text-ink">
                    {winLines2.map((line) => <p key={line}>• {line}</p>)}
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('windows.step3.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-3 text-ink">
                    <p>{t('windows.step3.intro')}</p>
                    {winLines3.map((line) => <p key={line}>• {line}</p>)}
                  </div>
                </div>

                {/* Step 4 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      4
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('windows.step4.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-2 text-ink">
                    {winLines4.map((line) => <p key={line}>• {line}</p>)}
                  </div>
                </div>
              </div>

              {/* Why */}
              <div className="mt-6 bg-indigo-soft border border-line rounded-sm p-4">
                <h4 className="text-indigo-text font-semibold mb-2">{t('windows.why.title')}</h4>
                <p className="text-ink text-sm">
                  {t('windows.why.text')}
                </p>
              </div>
            </div>
          </div>

          {/* Linux Installation – SEO: bleibt immer im DOM, nur per CSS (hidden) ausgeblendet */}
          <div className={selectedPlatform === 'linux' ? '' : 'hidden'}>
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
                <Download className="w-8 h-8 text-indigo-text" />
                {t('linux.heading')}
              </h2>

              {/* Info */}
              <div className="bg-indigo-soft border border-line rounded-sm p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-indigo-text flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-indigo-text font-semibold mb-1">
                      {t('linux.infoTitle')}
                    </h3>
                    <p className="text-ink text-sm">
                      {t('linux.infoText')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('linux.step1.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-3">
                    <p className="text-ink">{t('linux.step1.ubuntu22')}</p>
                    <div className="bg-surface rounded-sm p-4 border border-line">
                      <code className="text-success text-sm font-mono block">
                        sudo apt install libfuse2t64
                      </code>
                    </div>
                    <p className="text-ink">{t('linux.step1.ubuntu20')}</p>
                    <div className="bg-surface rounded-sm p-4 border border-line">
                      <code className="text-success text-sm font-mono block">
                        sudo apt install libfuse2
                      </code>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('linux.step2.title')}</h3>
                  </div>
                  <div className="ml-11 text-ink">
                    <p>{t('linux.step2.text')}</p>
                  </div>
                </div>

                {/* Step 3 - GUI Method */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      3a
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('linux.step3a.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-2 text-ink">
                    {linuxLines3a.map((line) => <p key={line}>• {line}</p>)}
                  </div>
                </div>

                {/* Step 3 - Terminal Method */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      3b
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('linux.step3b.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="bg-surface rounded-sm p-4 border border-line">
                      <code className="text-success text-sm font-mono block">
                        chmod +x FrameTrain.2_1.0.1_amd64.AppImage
                      </code>
                    </div>
                    <p className="text-ink-muted text-sm">
                      {t('linux.step3b.hint')}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-button rounded-full flex items-center justify-center text-ink font-semibold">
                      4
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{t('linux.step4.title')}</h3>
                  </div>
                  <div className="ml-11 space-y-2 text-ink">
                    <p>• {t('linux.step4.line')}</p>
                    <p className="text-sm text-ink-muted">{t('linux.step4.orTerminal')}</p>
                    <div className="bg-surface rounded-sm p-4 border border-line">
                      <code className="text-success text-sm font-mono block">
                        ./FrameTrain.2_1.0.1_amd64.AppImage
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="mt-6 bg-ghost-fill border border-line rounded-sm p-4">
                <h4 className="text-warning font-semibold mb-2">{t('linux.troubleshoot.title')}</h4>
                <p className="text-ink text-sm mb-2">
                  {t('linux.troubleshoot.text')}
                </p>
                <div className="bg-surface rounded-sm p-3 border border-line">
                  <code className="text-success text-xs font-mono block">
                    sudo mount -o remount,exec /dev/sdX /mount/point
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-surface border border-line rounded-md p-6 border border-line mb-8">
            <h3 className="text-xl font-semibold text-ink mb-4">{t('systemRequirements.heading')}</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-ink-muted mb-1">{t('systemRequirements.osLabel')}</p>
                <p className="text-ink font-semibold">
                  {t(`systemRequirements.os.${selectedPlatform}`)}
                </p>
              </div>
              <div>
                <p className="text-ink-muted mb-1">{t('systemRequirements.ramLabel')}</p>
                <p className="text-ink font-semibold">{t('systemRequirements.ram')}</p>
              </div>
              <div>
                <p className="text-ink-muted mb-1">{t('systemRequirements.storageLabel')}</p>
                <p className="text-ink font-semibold">{t('systemRequirements.storage')}</p>
              </div>
              {/* Harte Voraussetzung: die App prüft Python beim ersten Start
                  und bricht ohne 3.8+ ab. */}
              <div>
                <p className="text-ink-muted mb-1">{t('systemRequirements.pythonLabel')}</p>
                <p className="text-ink font-semibold">{t('systemRequirements.python')}</p>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-md bg-ghost-fill border border-warning">
              <p className="text-warning text-sm leading-relaxed">
                {t('systemRequirements.pythonNote')}
              </p>
              <a
                href="https://www.python.org/downloads/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-warning hover:text-warning text-sm font-semibold underline underline-offset-4"
              >
                {t('systemRequirements.pythonCta')}
              </a>
            </div>

            {selectedPlatform === 'macos' && (
              <p className="mt-4 text-sm text-ink-muted leading-relaxed">
                {t('systemRequirements.macNote')}
              </p>
            )}
          </div>

          {/* Help */}
          <div className="text-center">
            <p className="text-ink-muted mb-4">{t('help.needHelp')}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="mailto:framesphere@gmx.net" className="text-indigo-text hover:text-indigo-text">
                {t('help.emailSupport')}
              </a>
              <Link href="/docs" className="text-indigo-text hover:text-indigo-text">
                {t('help.docs')}
              </Link>
              <a href="https://github.com/FrameSphere/FrameTrain-App" target="_blank" rel="noopener noreferrer" className="text-indigo-text hover:text-indigo-text">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
