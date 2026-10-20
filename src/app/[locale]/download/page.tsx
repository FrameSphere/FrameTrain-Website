'use client';

import { useState, useEffect } from 'react';
import {
  Download, Loader2, CheckCircle2, XCircle, ArrowRight,
  AlertTriangle, Apple, AppWindow, Monitor, KeyRound, ListOrdered, PlayCircle,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AppScreenshot } from '@/components/AppScreenshot';
import { VideoEmbed } from '@/components/VideoEmbed';
import { VIDEOS } from '@/lib/videos';

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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mb-4">
              {t('heading')}
            </h1>
            <p className="text-lg text-ink-muted">{t('subtitle')}</p>
          </div>

          {/* ── Launch-kritischer Hinweis 1: Python ──
              Die Desktop-App bricht beim Pre-Flight-Check ab, wenn kein
              Python 3.8+ installiert ist (vor allem unter Windows). Der Kasten
              steht bewusst ÜBER der Download-Karte: wer das erst nach dem Kauf
              erfährt, sitzt in der Sackgasse. Nicht nach unten schieben und
              nicht einklappen. */}
          <div className="mb-6 rounded-lg border border-warning bg-ghost-fill p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-ghost-fill border border-line flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="min-w-0">
                <h2 className="text-ink font-semibold text-[15px] mb-1.5">
                  {tReq('pythonLabel')} {tReq('python')}
                </h2>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {tReq('pythonNote')}
                </p>
                <a
                  href="https://www.python.org/downloads/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 mt-3 text-warning hover:text-warning font-medium text-sm transition-colors"
                >
                  {tReq('pythonCta')}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* ── Download-Karte ── */}
          <div className="bg-surface border border-line rounded-lg border border-line p-6 sm:p-8 mb-8">

            {/* Plattformwahl */}
            <div className="mb-7">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint mb-3">
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
                      className={`press flex flex-col items-center gap-2 px-3 py-4 rounded-md border transition-colors duration-200 ease-out ${
                        active
                          ? 'border-line-strong bg-indigo-soft text-ink'
                          : 'border-line bg-ghost-fill text-ink-muted hover:border-line-strong hover:text-ink'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${active ? 'text-indigo-text' : 'text-ink-faint'}`} />
                      <span className="text-sm font-medium">{platformNames[p]}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Launch-kritischer Hinweis 2: Apple Silicon ──
                  Es gibt bewusst keinen Intel-Build. Ohne diesen Hinweis
                  bekämen Intel-Nutzer wortlos ein .dmg, das nicht startet. */}
              {platform === 'mac' && (
                <div className="mt-3 flex items-start gap-3 rounded-md border border-line bg-ghost-fill p-4">
                  <Apple className="w-5 h-5 text-ink-muted flex-shrink-0 mt-0.5" />
                  <p className="text-ink-muted text-sm leading-relaxed">{tReq('macNote')}</p>
                </div>
              )}
            </div>

            {/* API-Key */}
            <div className="mb-6">
              <label
                htmlFor="api-key"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint mb-3"
              >
                {t('apiKeyLabel')}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                <input
                  id="api-key"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder')}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 bg-ghost-fill border border-line rounded-md text-ink placeholder-ink-faint font-mono text-sm hover:border-line-strong focus:border-line-strong focus:bg-ghost-fill focus:outline-none transition-colors duration-[180ms] ease-out"
                />
              </div>
              <p className="mt-2.5 text-sm text-ink-faint">
                {t.rich('apiKeyHint', {
                  link: (chunks) => (
                    <Link href="/payment" className="text-indigo-text hover:text-indigo-text transition-colors">
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
              className="press group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-md overflow-hidden font-semibold text-[15px] text-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:active:transform-none"
            >
              <div className="absolute inset-0 bg-indigo-button hover:bg-indigo-hover " />
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
              <div className="mt-4 flex items-start gap-3 p-4 rounded-md bg-ghost-fill border border-line">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-success font-medium text-sm">{successMessage}</p>
                  {downloadInfo && (
                    <p className="text-success text-sm mt-1">
                      {t('versionInfo', { version: downloadInfo.version, size: downloadInfo.size_mb })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Fehler */}
            {error && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-md bg-ghost-fill border border-danger">
                <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Install-Video – die Stelle mit der höchsten Absicht: direkt unter
              der Download-Karte fängt es die Leute ab, die runterladen,
              hängenbleiben und sonst wieder gehen. Die Fassade lädt nichts von
              YouTube, bis bewusst auf Play geklickt wird. */}
          <div className="bg-surface border border-line rounded-lg border border-line p-6 sm:p-8 mb-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-ink mb-1.5">
              <PlayCircle className="w-5 h-5 text-indigo-text" />
              {t('installVideoHeading')}
            </h2>
            <p className="text-ink-muted text-sm mb-5">{t('installVideoSubtitle')}</p>
            <VideoEmbed id={VIDEOS.install} title={t('installVideoTitle')} />
          </div>

          {/* Was nach dem Download auf einen zukommt – steht bewusst unter der
              Download-Karte, damit die Primäraktion oben bleibt. */}
          <div className="mb-10">
            <AppScreenshot
              locale={locale}
              slug="home"
              alt={t('shotAlt')}
              caption={t('shotCaption')}
            />
            <Link
              href="/screenshots"
              className="group inline-flex items-center gap-1.5 mt-4 text-indigo-text hover:text-indigo-text text-sm font-medium transition-colors"
            >
              {t('shotLink')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Installationsschritte */}
          <div className="bg-surface border border-line rounded-lg border border-line p-6 sm:p-8 mb-6">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-ink mb-5">
              <ListOrdered className="w-5 h-5 text-indigo-text" />
              {t('installGuideHeading')}
            </h2>
            <ol className="space-y-3">
              {steps[platform].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-soft border border-line text-indigo-text flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-ink text-sm leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              href="/install"
              className="group inline-flex items-center gap-1.5 mt-6 text-indigo-text hover:text-indigo-text text-sm font-medium transition-colors"
            >
              {t('installGuideLink')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Support */}
          <p className="mt-8 text-center text-sm text-ink-faint">
            {t.rich('supportText', {
              link: (chunks) => (
                <a href="mailto:framesphere@gmx.net" className="text-indigo-text hover:text-indigo-text transition-colors">
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
