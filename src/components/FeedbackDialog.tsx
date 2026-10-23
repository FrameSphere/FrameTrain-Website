'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { detectPlatform } from '@/lib/platform'

/**
 * Feedback-Fenster für die ganze Website.
 *
 * Landet als Ticket im selben Support-System wie die Tickets aus dem Dashboard
 * (WebControl-HQ-Manager-API). Angemeldete sehen die Antwort danach im
 * Dashboard unter "Support" – dafür wird das Ticket mit demselben
 * localStorage-Schlüssel abgelegt, den das Dashboard liest.
 *
 * Öffnen von überall: `openFeedback()` (Island, Footer, …).
 */
const MANAGER_API = process.env.NEXT_PUBLIC_MANAGER_API_URL || 'https://webcontrol-hq-api.karol-paschek.workers.dev'
const OPEN_EVENT = 'ft-open-feedback'
const LAST_SENT_KEY = 'ft_feedback_last_sent'
const MIN_INTERVAL_MS = 60 * 1000

type FeedbackType = 'bug' | 'idea' | 'praise' | 'other'

export function openFeedback() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function FeedbackDialog() {
  const t = useTranslations('Feedback')
  const locale = useLocale()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // Honeypot: Menschen sehen das Feld nicht
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    const open = () => {
      setState('idle')
      setHint(null)
      dialogRef.current?.showModal()
    }
    window.addEventListener(OPEN_EVENT, open)
    return () => window.removeEventListener(OPEN_EVENT, open)
  }, [])

  const close = () => dialogRef.current?.close()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHint(null)
    if (website) return // Bot
    if (message.trim().length < 10) {
      setHint(t('tooShort'))
      return
    }
    try {
      const last = Number(window.localStorage.getItem(LAST_SENT_KEY) || 0)
      if (Date.now() - last < MIN_INTERVAL_MS) {
        setHint(t('tooFast'))
        return
      }
    } catch {}

    setState('sending')
    const platform = detectPlatform()
    const context = [
      `Seite: ${pathname} (${locale})`,
      `System: ${platform.mobile ? 'Handy/Tablet' : platform.os ?? 'unbekannt'}${platform.os === 'mac' ? ` (${platform.macChip})` : ''}`,
      `Konto: ${isAuthenticated ? 'angemeldet' : 'Gast'}`,
    ].join('\n')
    const firstLine = message.trim().split('\n')[0].slice(0, 60)
    const subject = `[Feedback · ${t(`types.${type}`)}] ${firstLine}`

    try {
      const res = await fetch(`${MANAGER_API}/api/support/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'guest',
          name: user?.email?.split('@')[0] || 'Website-Feedback',
          email: user?.email || email.trim(),
          subject,
          message: `${message.trim()}\n\n---\n${context}`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error()

      // Für angemeldete Nutzer im Dashboard sichtbar machen (gleicher Schlüssel wie dort)
      if (user?.id && data.ticket_id && data.user_token) {
        try {
          const key = `ft_tickets_${user.id}`
          const list = JSON.parse(window.localStorage.getItem(key) || '[]')
          window.localStorage.setItem(
            key,
            JSON.stringify([{ ticket_id: data.ticket_id, user_token: data.user_token, subject }, ...list])
          )
        } catch {}
      }
      try {
        window.localStorage.setItem(LAST_SENT_KEY, String(Date.now()))
      } catch {}
      setState('sent')
      setMessage('')
    } catch {
      setState('error')
    }
  }

  const types: FeedbackType[] = ['bug', 'idea', 'praise', 'other']

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="feedback-title"
      className="m-auto w-[calc(100%-24px)] max-w-[480px] p-0 rounded-xl border border-line bg-surface text-ink backdrop:bg-[rgba(5,5,10,0.72)]"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="feedback-title" className="ft-heading m-0">
              {t('title')}
            </h2>
            <p className="ft-small mt-1.5 mb-0">{t('lead')}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t('close')}
            className="flex-none w-9 h-9 rounded-pill flex items-center justify-center text-ink-faint hover:text-ink hover:bg-ghost-fill transition-colors duration-150"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {state === 'sent' ? (
          <div className="mt-6">
            <p role="status" className="m-0 flex items-start gap-2.5 text-[15px] leading-6 text-ink">
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-success flex-none" strokeWidth={1.5} aria-hidden="true" />
              {isAuthenticated ? t('successSignedIn') : t('success')}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {isAuthenticated && (
                <Link href="/dashboard?support=open" onClick={close} className="ft-btn ft-btn--ghost ft-btn--sm">
                  {t('toDashboard')}
                </Link>
              )}
              <button type="button" onClick={close} className="ft-btn ft-btn--primary ft-btn--sm">
                {t('close')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
            <fieldset className="m-0 p-0 border-0">
              <legend className="ft-label mb-3">{t('typeLabel')}</legend>
              <div className="flex flex-wrap gap-2">
                {types.map((ty) => (
                  <button
                    key={ty}
                    type="button"
                    role="radio"
                    aria-checked={type === ty}
                    onClick={() => setType(ty)}
                    className={`h-9 px-4 rounded-pill border text-[14px] transition-colors duration-150 ${
                      type === ty ? 'bg-surface-raised border-line-strong text-ink' : 'bg-bg border-line text-ink-muted hover:text-ink'
                    }`}
                  >
                    {t(`types.${ty}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="feedback-message" className="block text-[14px] font-semibold text-ink mb-2">
                {t('messageLabel')}
              </label>
              <textarea
                id="feedback-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                className="ft-input !h-auto py-3 resize-y min-h-[120px] leading-6"
              />
            </div>

            {isAuthenticated ? (
              <p className="m-0 text-[13px] leading-5 text-ink-muted">{t('signedIn')}</p>
            ) : (
              <div>
                <label htmlFor="feedback-email" className="block text-[14px] font-semibold text-ink mb-2">
                  {t('emailLabel')}
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  className="ft-input"
                />
              </div>
            )}

            {/* Honeypot gegen Bots – für Menschen unsichtbar und nicht fokussierbar */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] w-px h-px opacity-0"
            />

            {(hint || state === 'error') && (
              <p role="alert" className="m-0 text-[14px] text-danger">
                {hint ?? t('error')}
              </p>
            )}

            <button type="submit" disabled={state === 'sending'} className="ft-btn ft-btn--primary w-full">
              {state === 'sending' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {state === 'sending' ? t('sending') : t('send')}
            </button>
          </form>
        )}
      </div>
    </dialog>
  )
}
