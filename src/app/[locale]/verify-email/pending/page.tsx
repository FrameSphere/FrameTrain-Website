'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MailCheck, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'

// Warteseite zwischen Registrierung und Kauf-Seite: Der Nutzer kommt erst
// weiter, wenn seine E-Mail bestätigt ist. Der Link aus der Mail wird oft in
// einem anderen Tab (oder auf dem Handy) geöffnet – deshalb pollt diese Seite
// den Server, statt auf ein Event im selben Tab zu warten.
const POLL_INTERVAL_MS = 5000

export default function VerifyEmailPendingPage() {
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Auth.verifyEmail.pending')

  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  // Ref statt State: verhindert doppelte Weiterleitungen, wenn Polling und
  // manueller Check gleichzeitig ein "verified" sehen.
  const redirected = useRef(false)
  // refreshUser bekommt bei jedem Render des AuthProviders eine neue Identität.
  // Über die Ref bleibt der Polling-Effekt unten stabil und startet nicht bei
  // jedem Context-Update neu.
  const refreshUserRef = useRef(refreshUser)
  useEffect(() => {
    refreshUserRef.current = refreshUser
  }, [refreshUser])

  const continueToNextStep = useCallback(
    async (hasPaid: boolean) => {
      if (redirected.current) return
      redirected.current = true
      setVerified(true)
      // Erst den Context aktualisieren, dann weiterleiten: sonst hält die
      // Kauf-Seite den User noch für unbestätigt und schickt ihn zurück.
      await refreshUserRef.current()
      // Kurz die Erfolgsmeldung stehen lassen, damit der Sprung nicht abrupt wirkt.
      setTimeout(() => router.replace(hasPaid ? '/dashboard' : '/payment'), 1400)
    },
    [router]
  )

  const checkVerification = useCallback(async (): Promise<boolean | null> => {
    if (redirected.current) return true
    setChecking(true)
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) return null
      const data = await res.json()
      if (data.user?.emailVerified) {
        await continueToNextStep(!!data.user.hasPaid)
        return true
      }
      return false
    } catch {
      return null
    } finally {
      setChecking(false)
    }
  }, [continueToNextStep])

  // Nicht eingeloggt → hier gibt es nichts zu bestätigen
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login')
  }, [authLoading, isAuthenticated, router])

  // Polling + Prüfung beim Zurückwechseln in den Tab (typisch: Mail im
  // Nachbartab bestätigt und wieder hierher gewechselt).
  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    checkVerification()
    const interval = setInterval(checkVerification, POLL_INTERVAL_MS)
    const onFocus = () => checkVerification()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [authLoading, isAuthenticated, checkVerification])

  const handleResend = async () => {
    setSending(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error', text: res.status === 429 ? t('rateLimited') : data.error || t('sendError') })
      } else {
        setFeedback({ type: 'success', text: t('sent') })
      }
    } catch {
      setFeedback({ type: 'error', text: t('sendError') })
    } finally {
      setSending(false)
    }
  }

  const handleManualCheck = async () => {
    setFeedback(null)
    const result = await checkVerification()
    if (result === false) setFeedback({ type: 'info', text: t('notYet') })
    if (result === null) setFeedback({ type: 'error', text: t('checkError') })
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-ink-muted">{t('loadingText')}</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-line rounded-lg p-8 border border-line text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 ${
                verified ? ' ' : ' '
              }`}
            >
              {verified ? (
                <CheckCircle2 className="w-8 h-8 text-ink" />
              ) : (
                <MailCheck className="w-8 h-8 text-ink" />
              )}
            </div>

            <h1 className="text-2xl font-semibold text-ink mb-2">
              {verified ? t('verifiedTitle') : t('heading')}
            </h1>

            {verified ? (
              <p className="text-ink-muted mb-6">{t('verifiedText')}</p>
            ) : (
              <>
                <p className="text-ink-muted mb-1">{t('subtitle')}</p>
                <p className="text-ink font-semibold break-all mb-6">{user?.email}</p>

                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-md bg-indigo-soft border border-line">
                  <Loader2 className="w-4 h-4 text-indigo-text animate-spin flex-shrink-0" />
                  <span className="text-sm text-indigo-text">{t('waiting')}</span>
                </div>

                {feedback && (
                  <p
                    className={`text-sm mb-4 ${
                      feedback.type === 'success'
                        ? 'text-success'
                        : feedback.type === 'error'
                          ? 'text-danger'
                          : 'text-warning'
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleManualCheck}
                    disabled={checking}
                    className="w-full py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge rounded-md font-semibold   transition duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checking ? t('checking') : t('checkButton')}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={sending}
                    className="press w-full flex items-center justify-center gap-2 py-3 bg-surface border border-line border border-line rounded-md text-ink hover:border-line-strong hover:text-ink hover:bg-ghost-fill transition duration-200 ease-out disabled:opacity-50 text-sm font-medium"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> {t('sending')}
                      </>
                    ) : (
                      t('resendButton')
                    )}
                  </button>
                </div>

                <p className="mt-6 text-xs text-ink-faint leading-relaxed">{t('spamHint')}</p>

                <p className="mt-4 text-xs text-ink-faint">
                  {t('wrongEmail')}{' '}
                  <button onClick={logout} className="text-indigo-text hover:text-indigo-text transition underline">
                    {t('logoutLink')}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
