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
          <div className="text-gray-400">{t('loadingText')}</div>
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
          <div className="glass-strong rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br ${
                verified ? 'from-emerald-500 to-green-500' : 'from-purple-500 to-pink-500'
              }`}
            >
              {verified ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <MailCheck className="w-8 h-8 text-white" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {verified ? t('verifiedTitle') : t('heading')}
            </h1>

            {verified ? (
              <p className="text-gray-400 mb-6">{t('verifiedText')}</p>
            ) : (
              <>
                <p className="text-gray-400 mb-1">{t('subtitle')}</p>
                <p className="text-white font-semibold break-all mb-6">{user?.email}</p>

                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Loader2 className="w-4 h-4 text-purple-300 animate-spin flex-shrink-0" />
                  <span className="text-sm text-purple-200">{t('waiting')}</span>
                </div>

                {feedback && (
                  <p
                    className={`text-sm mb-4 ${
                      feedback.type === 'success'
                        ? 'text-green-400'
                        : feedback.type === 'error'
                          ? 'text-red-400'
                          : 'text-amber-300'
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleManualCheck}
                    disabled={checking}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checking ? t('checking') : t('checkButton')}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={sending}
                    className="press w-full flex items-center justify-center gap-2 py-3 glass border border-white/10 rounded-xl text-gray-300 hover:border-white/25 hover:text-white hover:bg-white/5 transition duration-200 ease-out disabled:opacity-50 text-sm font-medium"
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

                <p className="mt-6 text-xs text-gray-500 leading-relaxed">{t('spamHint')}</p>

                <p className="mt-4 text-xs text-gray-600">
                  {t('wrongEmail')}{' '}
                  <button onClick={logout} className="text-purple-400 hover:text-purple-300 transition underline">
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
