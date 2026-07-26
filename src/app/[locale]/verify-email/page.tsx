'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Status = 'verifying' | 'success' | 'error'
// Wohin es nach der Bestätigung weitergeht. Der Mail-Link wird oft in einem
// Browser ohne Session geöffnet (z. B. auf dem Handy) – dann führt der Button
// zur Anmeldung statt in einen geschützten Bereich.
type Destination = 'payment' | 'dashboard' | 'login'

const DESTINATION_HREF: Record<Destination, string> = {
  payment: '/payment',
  dashboard: '/dashboard',
  login: '/login',
}

const DESTINATION_LABEL: Record<Destination, string> = {
  payment: 'continuePayment',
  dashboard: 'continueButton',
  login: 'continueLogin',
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const t = useTranslations('Auth.verifyEmail.page')
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState('')
  const [destination, setDestination] = useState<Destination>('login')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage(t('missingToken'))
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setStatus('error')
          setMessage(data.error || t('genericError'))
          return
        }
        setStatus('success')
        setMessage(data.alreadyVerified ? t('alreadyVerified') : t('success'))
        refreshUser()

        // Ziel des Weiter-Buttons anhand der Session bestimmen. Eigenes
        // try/catch: die Bestätigung selbst war erfolgreich und darf durch
        // einen Fehler beim Nachschlagen nicht als Fehler dargestellt werden.
        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' })
          if (cancelled) return
          if (meRes.ok) {
            const me = await meRes.json()
            if (!cancelled) setDestination(me.user?.hasPaid ? 'dashboard' : 'payment')
          }
        } catch {
          // Session unbekannt → Button führt zur Anmeldung (Default)
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
          setMessage(t('genericError'))
        }
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="glass-strong rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-purple-500 to-pink-500">
        {status === 'verifying' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
        {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
        {status === 'error' && <XCircle className="w-8 h-8 text-white" />}
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">
        {status === 'verifying' ? t('verifyingTitle') : status === 'success' ? t('successTitle') : t('errorTitle')}
      </h1>
      <p className="text-gray-400 mb-6">{status === 'verifying' ? t('verifyingText') : message}</p>

      {status !== 'verifying' && (
        <Link
          href={DESTINATION_HREF[destination]}
          className="inline-block w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition duration-200 ease-out"
        >
          {t(DESTINATION_LABEL[destination] as any)}
        </Link>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  const t = useTranslations('Auth.verifyEmail.page')
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="glass-strong rounded-2xl shadow-2xl p-8 border border-white/10 flex items-center justify-center min-h-[300px]">
              <div className="text-gray-400">{t('verifyingText')}</div>
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
