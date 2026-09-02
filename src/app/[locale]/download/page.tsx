'use client';

import { useState, useEffect } from 'react';
import {
  Download, Loader2, CheckCircle2, XCircle, Terminal, ArrowRight,
  AlertTriangle, Apple, AppWindow, Monitor, KeyRound, ListOrdered,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AppScreenshot } from '@/components/AppScreenshot';

type Platform = 'windows' | 'mac' | 'linux';

interface DownloadInfo {
  version: string;
  platform: Platform;
  download_url: string;
  filename: string;
  size_mb: string;
}

// Plattform-Symbole als echte Icons statt Emoji: Emoji rendern je nach OS und
// Schriftart unterschiedlich groß und farbig und brechen die Bildsprache der
// restlichen Seite (überall lucide-Strichicons).
const PLATFORM_ICONS: Record<Platform, typeof AppWindow> = {
  windows: AppWindow,
  mac: Apple,
  linux: Monitor,
};

export default function DownloadPage() {
  const t = useTranslations('Download');
  // Voraussetzungen kommen aus dem Install-Namespace, damit Download- und
  // Installationsseite nicht auseinanderlaufen.
  const tReq = useTranslations('Install.systemRequirements');
  const locale = useLocale();
  const [platform, setPlatform] = useState<Platform>('windows');
  const [apiKey, setApiKey] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const platformNames = t.raw('platformNames') as Record<Platform, string>;
  const steps = t.raw('steps') as Record<Platform, string[]>;

  // Detect user's platform
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setPlatform('windows');
    } else if (userAgent.includes('mac')) {
      setPlatform('mac');
    } else if (userAgent.includes('linux')) {
      setPlatform('linux');
    }
  }, []);

  const handleDownload = async () => {
    if (!apiKey.trim()) {
      setError(t('missingKeyError'));
      return;
    }

    setIsDownloading(true);
    setError(null);
    setSuccessMessage(null);
    setDownloadInfo(null);

    try {
      // Get download info from API
      const response = await fetch(
        `/api/download-app?platform=${platform}&key=${encodeURIComponent(apiKey)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || t('downloadFailedError'));
      }

      setDownloadInfo(data);
      setSuccessMessage(t('startingDownload'));

      // Start download by opening the URL
      window.location.href = data.download_url;

    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">

          {/* ── Kopf ── */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
              {t('heading')}
            </h1>
            <p className="text-lg text-gray-400">{t('subtitle')}</p>
          </div>

          {/* ── Launch-kritischer Hinweis 1: Python ──
              Die Desktop-App bricht beim Pre-Flight-Check ab, wenn kein
              Python 3.9+ installiert ist (vor allem unter Windows). Der Kasten
              steht bewusst ÜBER der Download-Karte: wer das erst nach dem Kauf
              erfährt, sitzt in der Sackgasse. Nicht nach unten schieben und
              nicht einklappen. */}
          <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/[0.07] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-semibold text-[15px] mb-1.5">
                  {tReq('pythonLabel')} {tReq('python')}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {tReq('pythonNote')}
                </p>
                <a
                  href="https://www.python.org/downloads/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 mt-3 text-amber-300 hover:text-amber-200 font-medium text-sm transition-colors"
                >
                  {tReq('pythonCta')}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* ── Download-Karte ── */}
          <div className="glass-strong rounded-2xl border border-white/10 p-6 sm:p-8 mb-8">

            {/* Plattformwahl */}
            <div className="mb-7">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">
                {t('platformLabel')}
              </label>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {(['windows', 'mac', 'linux'] as Platform[]).map((p) => {
                  const Icon = PLATFORM_ICONS[p];
                  const active = platform === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      aria-pressed={active}
                      className={`press flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-colors duration-200 ease-out ${
                        active
                          ? 'border-purple-400/50 bg-purple-500/[0.12] text-white'
                          : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25 hover:text-gray-200'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${active ? 'text-purple-300' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">{platformNames[p]}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Launch-kritischer Hinweis 2: Apple Silicon ──
                  Es gibt bewusst keinen Intel-Build. Ohne diesen Hinweis
                  bekämen Intel-Nutzer wortlos ein .dmg, das nicht startet. */}
              {platform === 'mac' && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <Apple className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm leading-relaxed">{tReq('macNote')}</p>
                </div>
              )}
            </div>

            {/* API-Key */}
            <div className="mb-6">
              <label
                htmlFor="api-key"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3"
              >
                {t('apiKeyLabel')}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="api-key"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder')}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-600 font-mono text-sm hover:border-white/20 focus:border-purple-500/60 focus:bg-white/[0.06] focus:outline-none transition-colors duration-[180ms] ease-out"
                />
              </div>
              <p className="mt-2.5 text-sm text-gray-500">
                {t.rich('apiKeyHint', {
                  link: (chunks) => (
                    <Link href="/payment" className="text-purple-400 hover:text-purple-300 transition-colors">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>

            {/* Download-Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || !apiKey.trim()}
              className="press group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl overflow-hidden font-semibold text-[15px] text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:active:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
              {isDownloading ? (
                <>
                  <Loader2 className="relative w-5 h-5 animate-spin" />
                  <span className="relative">{t('downloading')}</span>
                </>
              ) : (
                <>
                  <Download className="relative w-5 h-5" />
                  <span className="relative">
                    {t('downloadButton', { platform: platformNames[platform] })}
                  </span>
                </>
              )}
            </button>

            {/* Erfolg */}
            {successMessage && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/25">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium text-sm">{successMessage}</p>
                  {downloadInfo && (
                    <p className="text-green-400/70 text-sm mt-1">
                      {t('versionInfo', { version: downloadInfo.version, size: downloadInfo.size_mb })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Fehler */}
            {error && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Was nach dem Download auf einen zukommt – steht bewusst unter der
              Download-Karte, damit die Primäraktion oben bleibt. */}
          <div className="mb-10">
            <AppScreenshot
              locale={locale}
              slug="models"
              alt={t('shotAlt')}
              caption={t('shotCaption')}
            />
            <Link
              href="/screenshots"
              className="group inline-flex items-center gap-1.5 mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {t('shotLink')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Installationsschritte */}
          <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 mb-6">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
              <ListOrdered className="w-5 h-5 text-purple-400" />
              {t('installGuideHeading')}
            </h2>
            <ol className="space-y-3">
              {steps[platform].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/15 border border-purple-400/25 text-purple-300 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-300 text-sm leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              href="/install"
              className="group inline-flex items-center gap-1.5 mt-6 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {t('installGuideLink')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* CLI-Alternative */}
          <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-3">
              <Terminal className="w-5 h-5 text-purple-400" />
              {t('cli.heading')}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{t('cli.intro')}</p>
            <div className="rounded-xl bg-black/40 border border-white/5 p-4 font-mono text-[13px] overflow-x-auto">
              <div className="text-gray-600">{t('cli.commentInstallCli')}</div>
              <div className="text-green-400 mb-4">pip install frametrain-cli</div>

              <div className="text-gray-600">{t('cli.commentInstallApp')}</div>
              <div className="text-green-400 mb-4">frametrain install --key YOUR_API_KEY</div>

              <div className="text-gray-600">{t('cli.commentStart')}</div>
              <div className="text-green-400">frametrain start</div>
            </div>
          </div>

          {/* Support */}
          <p className="mt-8 text-center text-sm text-gray-500">
            {t.rich('supportText', {
              link: (chunks) => (
                <a href="mailto:support@frametrain.ai" className="text-purple-400 hover:text-purple-300 transition-colors">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
