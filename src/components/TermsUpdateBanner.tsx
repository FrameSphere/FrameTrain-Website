'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FileText } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CURRENT_TERMS_VERSION } from '@/lib/legal-version'

// Neuzustimmung zu geänderten AGB (Bestandskonten mit älterer terms_version).
// Bewusst ein eigener Schritt mit Haken: Der Login setzt eine veraltete
// Version nie stillschweigend hoch. Ohne Zustimmung gelten laut AGB die
// bisherigen Bedingungen weiter – das Banner blockiert deshalb nichts.
export function TermsUpdateBanner() {
  const t = useTranslations('Dashboard.termsUpdate')
  const { user, refreshUser } = useAuth()
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  if (!user?.termsUpdateRequired) return null

  const accept = async () => {
    setBusy(true)
    setError(false)
    try {
      const res = await fetch('/api/user/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accepted: true, version: CURRENT_TERMS_VERSION }),
      })
      if (!res.ok) throw new Error()
      await refreshUser()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="region" aria-label={t('title')} className="mb-8 p-5 rounded-lg border border-line-strong bg-surface">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-indigo-text flex-none" />
        <p className="m-0 font-semibold text-ink">{t('title')}</p>
      </div>
      <p className="mt-2 mb-0 text-sm text-ink-muted">{t('text')}</p>
      <ul className="mt-2 mb-0 text-sm text-ink-muted list-disc list-inside">
        {(t.raw('changes') as string[]).map((c) => <li key={c}>{c}</li>)}
      </ul>
      <label className="mt-4 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 w-5 h-5 flex-shrink-0 accent-[var(--indigo-button)]"
        />
        <span className="text-sm text-ink">
          {t.rich('consent', {
            terms: (chunks) => <Link href="/terms" target="_blank" className="ft-link">{chunks}</Link>,
            privacy: (chunks) => <Link href="/privacy" target="_blank" className="ft-link">{chunks}</Link>,
          })}
        </span>
      </label>
      {error && <p role="alert" className="mt-3 mb-0 text-sm text-danger">{t('error')}</p>}
      <button type="button" onClick={accept} disabled={!checked || busy} className="ft-btn ft-btn--primary mt-4">
        {busy ? t('saving') : t('accept')}
      </button>
    </div>
  )
}
