'use client';

import { useState, useEffect } from 'react';
import {
  Download, Loader2, CheckCircle2, XCircle, ArrowRight, AlertTriangle, Apple,
  AppWindow, Monitor, KeyRound, ListOrdered, PlayCircle, Smartphone, Mail, ChevronDown,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AppScreenshot } from '@/components/AppScreenshot';
import { VideoEmbed } from '@/components/VideoEmbed';
import { VIDEOS } from '@/lib/videos';
import { useAuth } from '@/contexts/AuthContext';
import { detectPlatform, type PlatformInfo } from '@/lib/platform';
import { trackEvent } from '@/lib/events';

type Platform = 'windows' | 'mac' | 'linux';

interface DownloadInfo {
  version: string;
  platform: Platform;
  download_url: string;
  filename: string;
  size_mb: string;
}

const PLATFORM_ICONS: Record<Platform, typeof AppWindow> = {
  windows: AppWindow,
  mac: Apple,
  linux: Monitor,
};

const labelCls = 'ft-label block mb-3';

/**
 * Download-Seite.
 *
 * Wege je nach Besucher:
 * - Handy: FrameTrain läuft dort nicht → Link per Mail an das eigene Konto
 *   (angemeldet) bzw. zuerst der kostenlose Test (Gast).
 * - Angemeldet mit Zugang: Ein-Klick-Download über das Login-Cookie.
 * - Angemeldet ohne Zugang: Weg zu Abo oder Gutschein.
 * - Gast am Rechner: Test starten oder anmelden; wer schon einen API-Key hat,
 *   klappt das Feld dafür auf.
 * Erkannte Intel-Macs bekommen vor dem Download eine deutliche Warnung.
 */
export default function DownloadPage() {
  const t = useTranslations('Download');
  // Voraussetzungen kommen aus dem Install-Namespace, damit Download- und
  // Installationsseite nicht auseinanderlaufen.
  const tReq = useTranslations('Install.systemRequirements');
  const locale = useLocale();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [platform, setPlatform] = useState<Platform>('windows');
  const [detected, setDetected] = useState<PlatformInfo | null>(null);
  const [showDesktopOnMobile, setShowDesktopOnMobile] = useState(false);
  const [showKeyField, setShowKeyField] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mailState, setMailState] = useState<'idle' | 'sending' | 'sent' | 'rate_limited' | 'error'>('idle');

  const platformNames = t.raw('platformNames') as Record<Platform, string>;
  const steps = t.raw('steps') as Record<Platform, string[]>;

  useEffect(() => {
    const info = detectPlatform();
    setDetected(info);
    if (info.os) setPlatform(info.os);
  }, []);

  const hasAccess = isAuthenticated && user?.hasPaid === true;
  const isMobile = detected?.mobile === true;
  const showDesktop = !isMobile || showDesktopOnMobile;
  const intelMac = platform === 'mac' && detected?.os === 'mac' && detected.macChip === 'intel';

  const handleDownload = async () => {
    const useKey = !hasAccess;
    if (useKey && !apiKey.trim()) {
      setError(t('missingKeyError'));
      return;
    }

    setIsDownloading(true);
    setError(null);
    setSuccessMessage(null);
    setDownloadInfo(null);

    try {
      // Angemeldet: das Login-Cookie reicht. Sonst über den API-Key.
      const keyParam = useKey ? `&key=${encodeURIComponent(apiKey.trim())}` : '';
      const response = await fetch(`/api/download-app?platform=${platform}${keyParam}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || t('downloadFailedError'));

      setDownloadInfo(data);
      setSuccessMessage(t('startingDownload'));
      trackEvent('download_start', { platform, via: useKey ? 'api_key' : 'account' });
      try { window.localStorage.setItem('ft_app_downloaded', '1') } catch {}
      window.location.href = data.download_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsDownloading(false);
    }
  };

  const sendLink = async () => {
    setMailState('sending');
    try {
      const res = await fetch('/api/download-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locale }),
      });
      setMailState(res.ok ? 'sent' : res.status === 429 ? 'rate_limited' : 'error');
      if (res.ok) trackEvent('download_start', { platform: 'mobile', via: 'email_link' });
    } catch {
      setMailState('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 ft-container py-12 md:py-16">
        <div className="max-w-[720px] mx-auto">
          {/* ── Kopf ── */}
          <div className="text-center mb-10">
            <h1 className="ft-display-l m-0">{t('heading')}</h1>
            <p className="ft-lead mt-4 mb-0">{t('subtitle')}</p>
            {detected?.os && !isMobile && (
              <p className="mt-4 mb-0 ft-label inline-flex items-center gap-2">
                <span className="ft-dot !bg-success" aria-hidden="true" />
                {t('detected', { os: platformNames[detected.os] })}
              </p>
            )}
          </div>

          {/* ── Handy: FrameTrain läuft nur am Rechner ── */}
          {isMobile && (
            <section className="mb-6 rounded-xl border border-line bg-surface p-6 sm:p-8">
              <p className="ft-label m-0 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('mobile.label')}
              </p>
              <h2 className="ft-heading mt-3 mb-0">{t('mobile.title')}</h2>
              <p className="ft-small mt-2 mb-0">{t('mobile.text')}</p>

              <div className="mt-6">
                {authLoading ? null : isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={sendLink}
                      disabled={mailState === 'sending' || mailState === 'sent'}
                      className="ft-btn ft-btn--primary w-full"
                    >
                      {mailState === 'sending' ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Mail className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      )}
                      {mailState === 'sending' ? t('mobile.sending') : t('mobile.send')}
                    </button>
                    <p role="status" className="mt-3 mb-0 text-[14px] leading-[22px]">
                      {mailState === 'sent' && <span className="text-success">{t('mobile.sent', { email: user?.email ?? '' })}</span>}
                      {mailState === 'rate_limited' && <span className="text-ink-muted">{t('mobile.rateLimited')}</span>}
                      {mailState === 'error' && <span className="text-danger">{t('mobile.error')}</span>}
                    </p>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => trackEvent('trial_click', { from: 'download_mobile' })}
                      className="ft-btn ft-btn--primary w-full"
                    >
                      {t('account.trial')}
                    </Link>
                    <p className="mt-3 mb-0 text-[14px] leading-[22px] text-ink-muted">{t('mobile.guestText')}</p>
                  </>
                )}
              </div>

              {!showDesktopOnMobile && (
                <button
                  type="button"
                  onClick={() => setShowDesktopOnMobile(true)}
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] text-ink-faint hover:text-ink transition-colors duration-150"
                >
                  {t('mobile.showAnyway')}
                  <ChevronDown className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              )}
            </section>
          )}

          {showDesktop && (
            <>
              {/* ── Launch-kritischer Hinweis 1: Python ──
                  Die Desktop-App bricht beim Pre-Flight-Check ab, wenn kein
                  Python 3.10–3.13 installiert ist (vor allem unter Windows). Der
                  Kasten steht bewusst ÜBER der Download-Karte. */}
              <div className="mb-6 rounded-lg border border-warning bg-surface p-5 sm:p-6 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 mt-0.5 text-warning flex-none" strokeWidth={1.5} aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-ink font-semibold text-[15px] m-0">
                    {tReq('pythonLabel')} {tReq('python')}
                  </h2>
                  <p className="text-ink-muted text-[14px] leading-[22px] mt-1.5 mb-0">{tReq('pythonNote')}</p>
                  <a
                    href="https://www.python.org/downloads/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-link inline-flex items-center gap-1.5 mt-3 text-[14px] font-medium"
                  >
                    {tReq('pythonCta')}
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* ── Download-Karte ── */}
              <div className="rounded-xl border border-line bg-surface p-6 sm:p-8 mb-8">
                {/* Plattformwahl */}
                <div className="mb-7">
                  <span className={labelCls}>{t('platformLabel')}</span>
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {(['windows', 'mac', 'linux'] as Platform[]).map((p) => {
                      const Icon = PLATFORM_ICONS[p];
                      const active = platform === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          aria-pressed={active}
                          className={`flex flex-col items-center gap-2 px-3 py-4 rounded-md border transition-colors duration-150 ease-out ${
                            active ? 'border-line-strong bg-surface-raised text-ink' : 'border-line bg-bg text-ink-muted hover:border-line-strong hover:text-ink'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${active ? 'text-ink' : 'text-ink-faint'}`} strokeWidth={1.5} aria-hidden="true" />
                          <span className="text-[14px] font-medium">{platformNames[p]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Launch-kritischer Hinweis 2: Apple Silicon ──
                      Es gibt bewusst keinen Intel-Build. Erkannte Intel-Macs
                      bekommen die Warnung deutlich, alle anderen den Hinweis. */}
                  {platform === 'mac' &&
                    (intelMac ? (
                      <div role="alert" className="mt-3 flex items-start gap-3 rounded-md border border-danger bg-bg p-4">
                        <XCircle className="w-5 h-5 text-danger flex-none mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                        <div>
                          <p className="m-0 text-[15px] font-semibold text-ink">{t('intel.title')}</p>
                          <p className="m-0 mt-1 text-[14px] leading-[22px] text-ink-muted">{t('intel.text')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-start gap-3 rounded-md border border-line bg-bg p-4">
                        <Apple className="w-5 h-5 text-ink-muted flex-none mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                        <p className="m-0 text-ink-muted text-[14px] leading-[22px]">{tReq('macNote')}</p>
                      </div>
                    ))}
                </div>

                {/* Zugang: angemeldet / ohne Zugang / Gast */}
                {authLoading ? null : hasAccess ? (
                  <p className="mb-5 mt-0 flex items-center gap-2 text-[14px] text-ink-muted">
                    <CheckCircle2 className="w-4 h-4 text-success flex-none" strokeWidth={1.5} aria-hidden="true" />
                    {t('account.signedInAs', { email: user?.email ?? '' })}
                  </p>
                ) : isAuthenticated ? (
                  <div className="mb-6 rounded-md border border-line bg-bg p-4">
                    <p className="m-0 text-[15px] font-semibold text-ink">{t('account.noAccessTitle')}</p>
                    <p className="m-0 mt-1 text-[14px] leading-[22px] text-ink-muted">{t('account.noAccessText')}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/payment" className="ft-btn ft-btn--primary ft-btn--sm">
                        {t('account.subscribe')}
                      </Link>
                      <Link href="/redeem" className="ft-btn ft-btn--ghost ft-btn--sm">
                        {t('account.redeem')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 rounded-md border border-line bg-bg p-4">
                    <p className="m-0 text-[15px] font-semibold text-ink">{t('account.guestTitle')}</p>
                    <p className="m-0 mt-1 text-[14px] leading-[22px] text-ink-muted">{t('account.guestText')}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        onClick={() => trackEvent('trial_click', { from: 'download' })}
                        className="ft-btn ft-btn--primary ft-btn--sm"
                      >
                        {t('account.trial')}
                      </Link>
                      <Link href="/login" className="ft-btn ft-btn--ghost ft-btn--sm">
                        {t('account.login')}
                      </Link>
                    </div>
                    {!showKeyField && (
                      <button
                        type="button"
                        onClick={() => setShowKeyField(true)}
                        className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-ink-faint hover:text-ink transition-colors duration-150"
                      >
                        {t('account.haveKey')}
                        <ChevronDown className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* API-Key nur für Gäste, die schon einen haben (z. B. vom Dashboard eines anderen Geräts) */}
                {!authLoading && !isAuthenticated && showKeyField && (
                  <div className="mb-6">
                    <label htmlFor="api-key" className={labelCls}>
                      {t('apiKeyLabel')}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" strokeWidth={1.5} aria-hidden="true" />
                      <input
                        id="api-key"
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={t('apiKeyPlaceholder')}
                        spellCheck={false}
                        autoComplete="off"
                        className="ft-input !pl-10 font-mono !text-[14px]"
                      />
                    </div>
                    <p className="mt-2.5 mb-0 text-[14px] text-ink-faint">
                      {t.rich('apiKeyHint', {
                        link: (chunks) => (
                          <Link href="/dashboard" className="ft-link">
                            {chunks}
                          </Link>
                        ),
                      })}
                    </p>
                  </div>
                )}

                {/* Download-Button: angemeldet mit Zugang oder mit eingegebenem Key */}
                {(hasAccess || (!isAuthenticated && showKeyField)) && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading || (!hasAccess && !apiKey.trim())}
                    className="ft-btn ft-btn--primary w-full"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        {t('downloading')}
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                        {t('downloadButton', { platform: platformNames[platform] })}
                      </>
                    )}
                  </button>
                )}

                {successMessage && (
                  <div role="status" className="mt-4 flex items-start gap-3 p-4 rounded-md border border-line bg-bg">
                    <CheckCircle2 className="w-5 h-5 text-success flex-none mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                    <div>
                      <p className="m-0 text-success font-medium text-[14px]">{successMessage}</p>
                      {downloadInfo && (
                        <p className="m-0 mt-1 ft-data text-ink-muted">
                          {t('versionInfo', { version: downloadInfo.version, size: downloadInfo.size_mb })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div role="alert" className="mt-4 flex items-start gap-3 p-4 rounded-md border border-danger bg-bg">
                    <XCircle className="w-5 h-5 text-danger flex-none mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                    <p className="m-0 text-danger text-[14px]">{error}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Install-Video – direkt unter der Download-Karte fängt es die Leute
              ab, die nach dem Download hängenbleiben. Die Fassade lädt nichts
              von YouTube, bis bewusst auf Play geklickt wird. */}
          <section className="rounded-xl border border-line bg-surface p-6 sm:p-8 mb-8">
            <h2 className="flex items-center gap-2.5 ft-heading m-0">
              <PlayCircle className="w-5 h-5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              {t('installVideoHeading')}
            </h2>
            <p className="ft-small mt-1.5 mb-5">{t('installVideoSubtitle')}</p>
            <VideoEmbed id={VIDEOS.install} title={t('installVideoTitle')} />
          </section>

          <div className="mb-10">
            <AppScreenshot locale={locale} slug="home" alt={t('shotAlt')} caption={t('shotCaption')} />
            <Link href="/screenshots" className="ft-link inline-flex items-center gap-1.5 mt-4 text-[14px] font-medium">
              {t('shotLink')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          {/* Installationsschritte für die gewählte Plattform */}
          <section className="rounded-xl border border-line bg-surface p-6 sm:p-8 mb-6">
            <h2 className="flex items-center gap-2.5 ft-heading m-0 mb-5">
              <ListOrdered className="w-5 h-5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              {t('installGuideHeading')}
            </h2>
            <ol className="m-0 p-0 list-none flex flex-col gap-3">
              {steps[platform].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="ft-label w-6 pt-1 flex-none">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-ink text-[15px] leading-6">{step}</span>
                </li>
              ))}
            </ol>
            <Link href="/install" className="ft-link inline-flex items-center gap-1.5 mt-6 text-[14px] font-medium">
              {t('installGuideLink')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </section>

          <p className="mt-8 mb-0 text-center text-[14px] text-ink-faint">
            {t.rich('supportText', {
              link: (chunks) => (
                <a href="mailto:framesphere@gmx.net" className="ft-link">
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
