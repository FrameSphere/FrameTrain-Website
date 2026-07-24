'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Mail, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const t = useTranslations('Auth.verifyEmail.banner')
  const locale = useLocale()
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user || user.emailVerified) return null

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
        const text = res.status === 429 ? t('rateLimited') : (data.error || t('sendError'))
        setFeedback({ type: 'error', text })
      } else {
        setFeedback({ type: 'success', text: t('sent') })
      }
    } catch {
      setFeedback({ type: 'error', text: t('sendError') })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mb-8 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-white font-bold">{t('title')}</p>
          <p className="text-amber-300 text-sm mt-0.5">{t('text')}</p>
          {feedback && (
            <p className={`text-sm mt-1 ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={handleResend}
        disabled={sending}
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
      >
        {sending ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('sending')}</> : t('resendButton')}
      </button>
    </div>
  )
}
