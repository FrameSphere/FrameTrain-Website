'use client'

import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  CONSENT_EVENT,
  CONSENT_REOPEN_EVENT,
  hasAnyTag,
  readConsent,
  writeConsent,
} from '@/lib/analytics'

// ─── Cookie-Consent-Banner ─────────────────────────────────────────────────────
//
// Bewusst schlank: zwei gleichwertige Buttons (Ablehnen/Akzeptieren), kein
// Dark Pattern, keine Vorauswahl. Erscheint NUR, wenn überhaupt ein Analytics-
// Tag konfiguriert ist — ohne gesetzte NEXT_PUBLIC-IDs gibt es nichts
// einzuwilligen und der Banner bleibt komplett aus.
// Zustand liegt in localStorage (siehe src/lib/analytics.ts), nicht in einem
// Cookie, damit ohne Zustimmung auch nichts gesetzt wird.

export function CookieBanner() {
  const t = useTranslations('Consent')
  const [visible, setVisible] = useState(false)
  // Wurde der Banner über den Footer-Link erneut geöffnet? Dann zeigt er den
  // aktuellen Stand und erlaubt den Widerruf, statt nur beim ersten Besuch
  // aufzutauchen.
  const [reopened, setReopened] = useState(false)
  const [current, setCurrent] = useState<'granted' | 'denied' | 'unknown'>('unknown')

  useEffect(() => {
    if (!hasAnyTag()) return
    setCurrent(readConsent())
    if (readConsent() === 'unknown') setVisible(true)

    const onChange = () => {
      setCurrent(readConsent())
      setVisible(readConsent() === 'unknown')
    }
    const onReopen = () => {
      setCurrent(readConsent())
      setReopened(true)
      setVisible(true)
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    window.addEventListener(CONSENT_REOPEN_EVENT, onReopen)
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange)
      window.removeEventListener(CONSENT_REOPEN_EVENT, onReopen)
    }
  }, [])

  if (!visible) return null

  const decide = (status: 'granted' | 'denied') => {
    // writeConsent schickt in beide Richtungen ein Consent-Mode-Update:
    // Bei 'denied' gehen alle Signale zurück auf "denied", und <Analytics />
    // hängt die Tags ab, sodass sie beim nächsten Seitenaufruf nicht mehr
    // geladen werden.
    writeConsent(status)
    setReopened(false)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('heading')}
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-5"
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-line-strong bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-indigo-text flex-shrink-0 mt-0.5" aria-hidden />
          <div className="flex-1 min-w-0">
            <h2 className="text-ink font-semibold text-[15px] mb-1.5">{t('heading')}</h2>
            {reopened && current !== 'unknown' && (
              <p className="text-xs text-ink-faint mb-2">
                {current === 'granted' ? t('statusGranted') : t('statusDenied')}
              </p>
            )}
            <p className="text-ink-muted text-sm leading-relaxed">
              {t('text')}{' '}
              <Link href="/cookies" className="text-indigo-text hover:text-indigo-text underline">
                {t('cookiesLink')}
              </Link>
              {' · '}
              <Link href="/privacy" className="text-indigo-text hover:text-indigo-text underline">
                {t('privacyLink')}
              </Link>
            </p>
          </div>
          {/* Beim Wiederöffnen schließt das X, ohne die Entscheidung zu ändern;
              beim Erstbesuch gilt Wegklicken als Ablehnung. */}
          <button
            type="button"
            onClick={() => (reopened ? (setReopened(false), setVisible(false)) : decide('denied'))}
            aria-label={reopened ? t('close') : t('decline')}
            className={`flex-shrink-0 text-ink-faint hover:text-ink transition-colors ${reopened ? '' : 'sm:hidden'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="press px-5 py-2.5 rounded-md border border-line-strong text-ink hover:text-ink hover:border-line-strong text-sm font-semibold transition-colors"
          >
            {reopened && current === 'granted' ? t('revoke') : t('decline')}
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="press px-5 py-2.5 rounded-md bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge text-sm font-semibold     transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
