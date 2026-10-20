'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Check, Ticket } from 'lucide-react'
import { trackSignUp } from '@/lib/analytics'
import { trackEvent } from '@/lib/events'
import { normalizePromoCode, readStoredPromoCode, storePromoCode } from '@/components/PromoCapture'
import { useTranslations, useLocale } from 'next-intl'

const oauthCls =
  'w-full flex items-center gap-3 h-12 px-4 rounded-pill bg-ghost-fill border border-ghost-edge text-ink hover:bg-surface-raised transition-colors duration-150 ease-out'

function OAuthButtons() {
  const t = useTranslations('Auth.oauth')
  const tRegister = useTranslations('Auth.register')
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <a href="/api/auth/oauth/google" className={oauthCls} onClick={() => trackEvent('trial_click', { from: 'register_google' })}>
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-[15px]">{t('googleRegister')}</span>
        </a>

        <a href="/api/auth/oauth/github" className={oauthCls} onClick={() => trackEvent('trial_click', { from: 'register_github' })}>
          <svg className="w-5 h-5 flex-shrink-0 text-ink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className="font-medium text-[15px]">{t('githubRegister')}</span>
        </a>

        {/* FrameSphere SSO – identisch mit Login-Seite */}
        <a href="/api/auth/framesphere" className={oauthCls}>
          <span className="w-5 h-5 flex-shrink-0 rounded-[6px] bg-indigo-soft text-indigo-text flex items-center justify-center font-mono text-[9px] font-medium">
            FS
          </span>
          <span className="font-medium text-[15px]">{t('frameSphereRegister')}</span>
          <span className="ml-auto ft-label !text-[10px]">{t('ssoBadge')}</span>
        </a>
      </div>
      <p className="mt-3 text-center text-[13px] leading-5 text-ink-faint">
        {tRegister.rich('oauthConsentNotice', {
          terms: (chunks) => <Link href="/terms" target="_blank" className="ft-link">{chunks}</Link>,
          privacy: (chunks) => <Link href="/privacy" target="_blank" className="ft-link">{chunks}</Link>,
        })}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const locale = useLocale()
  const t = useTranslations('Auth.register')
  const tFields = useTranslations('Auth.fields')
  const tOauth = useTranslations('Auth.oauth')
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })
  const [promoCode, setPromoCode] = useState('')
  const [promoFromLink, setPromoFromLink] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [diagnosticsConsent, setDiagnosticsConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const points = t.raw('trialPoints') as string[]

  // Kanal-Code (?code=… in dieser URL oder vorher auf einer anderen Seite)
  useEffect(() => {
    const fromUrl = normalizePromoCode(new URLSearchParams(window.location.search).get('code'))
    const code = fromUrl || readStoredPromoCode()
    if (code) {
      setPromoCode(code)
      setPromoFromLink(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'))
      return
    }

    if (!acceptedTerms) {
      setError(t('consentRequired'))
      return
    }

    setLoading(true)

    try {
      const code = normalizePromoCode(promoCode)
      if (code) storePromoCode(code)

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          acceptedTerms,
          diagnosticsConsent,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errors.registrationFailed'))
      // Frühes Funnel-Signal für die Ad-Plattformen (nur mit Consent, sonst
      // No-Op). Muss VOR dem Redirect feuern — danach ist die Seite weg.
      trackSignUp('email')
      trackEvent('trial_click', { from: 'register_email', code: code || 'none' })
      // Nicht direkt weiter: zuerst muss die E-Mail bestätigt werden – damit
      // startet auch die Testphase. Voller Reload, damit der AuthContext das
      // frisch gesetzte Cookie liest.
      window.location.href = `/${locale}/verify-email/pending`
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelCls = 'block text-[14px] font-semibold text-ink mb-2'

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 ft-container py-12 md:py-20">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_440px] items-start">
          {/* Nutzenversprechen */}
          <div className="lg:pt-6">
            <p className="ft-label m-0 !text-output-text flex items-center gap-2.5">
              <span className="ft-dot" aria-hidden="true" />
              {t('trialEyebrow')}
            </p>
            <h1 className="ft-display-l mt-5 mb-0">{t('trialHeading')}</h1>
            <p className="ft-lead mt-5 mb-0 max-w-[520px]">{t('trialSubtitle')}</p>
            <ul className="mt-8 p-0 list-none flex flex-col gap-3.5">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[16px] text-ink">
                  <Check className="w-[18px] h-[18px] text-ink-muted flex-none" strokeWidth={1.5} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo */}
            <img
              src="/brand/frametrain-mark-on-dark.svg"
              alt=""
              width={180}
              height={160}
              className="hidden lg:block mt-14 w-[150px] h-auto opacity-90"
            />
          </div>

          {/* Formular */}
          <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="ft-heading m-0">{t('heading')}</h2>

            <div className="mt-6">
              <OAuthButtons />
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-line" />
              <span className="ft-label !text-[10px]">{tOauth('divider')}</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {error && (
              <div role="alert" className="mb-5 px-4 py-3 rounded-sm border border-danger text-danger text-[14px]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className={labelCls}>
                  {tFields('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ft-input"
                  placeholder={tFields('emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelCls}>
                  {tFields('passwordLabel')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="ft-input"
                  placeholder={t('passwordPlaceholder')}
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelCls}>
                  {t('confirmPasswordLabel')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="ft-input"
                  placeholder={t('confirmPasswordPlaceholder')}
                />
              </div>

              {/* Gutscheincode – sichtbar, über Kanal-Links vorausgefüllt */}
              <div>
                <label htmlFor="promo" className={`${labelCls} flex items-center gap-2`}>
                  <Ticket className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                  {t('promoLabel')}
                </label>
                <input
                  id="promo"
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase())
                    setPromoFromLink(false)
                  }}
                  className="ft-input font-mono tracking-[0.04em]"
                  placeholder={t('promoPlaceholder')}
                  aria-describedby="promo-note"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
                <p id="promo-note" className="mt-2 mb-0 text-[13px] leading-5 text-ink-muted">
                  {promoFromLink && promoCode ? (
                    <span className="text-success">{t('promoDetected', { code: promoCode })} · </span>
                  ) : null}
                  {t('promoNote')}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-5 h-5 flex-shrink-0 accent-[var(--indigo-button)]"
                  />
                  <span className="text-[14px] leading-[22px] text-ink-muted">
                    {t.rich('consentLabel', {
                      terms: (chunks) => <Link href="/terms" target="_blank" className="ft-link">{chunks}</Link>,
                      privacy: (chunks) => <Link href="/privacy" target="_blank" className="ft-link">{chunks}</Link>,
                    })}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diagnosticsConsent}
                    onChange={(e) => setDiagnosticsConsent(e.target.checked)}
                    className="mt-0.5 w-5 h-5 flex-shrink-0 accent-[var(--indigo-button)]"
                  />
                  <span className="text-[13px] leading-5 text-ink-faint">{t('diagnosticsLabel')}</span>
                </label>
              </div>

              <button type="submit" disabled={loading || !acceptedTerms} className="ft-btn ft-btn--primary w-full mt-1">
                {loading ? t('submitLoading') : t('submit')}
              </button>
            </form>

            <p className="mt-6 mb-0 text-center text-[14px] text-ink-muted">
              {t('haveAccount')}{' '}
              <Link href="/login" className="ft-link font-medium">
                {t('loginLink')}
              </Link>
            </p>

            <p className="mt-3 mb-0 text-center text-[13px] text-ink-faint">
              {t('frameSphereHint')}{' '}
              <a href="https://frame-sphere.vercel.app/register" target="_blank" rel="noopener noreferrer" className="ft-link">
                {t('frameSphereCta')}
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
