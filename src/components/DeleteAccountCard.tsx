'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'

// Konto löschen (Art. 17 DSGVO) – Bestätigung durch Eintippen der E-Mail.
export function DeleteAccountCard({ email, hasSubscription }: { email: string; hasSubscription: boolean }) {
  const t = useTranslations('Dashboard.deleteAccount')
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const matches = confirm.trim().toLowerCase() === email.toLowerCase()

  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmEmail: confirm }),
      })
      if (!res.ok) throw new Error()
      window.location.href = '/'
    } catch {
      setError(t('error'))
      setBusy(false)
    }
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-8 mb-8">
      <div className="flex items-center mb-2">
        <Trash2 className="w-6 h-6 text-danger mr-3" />
        <h2 className="text-2xl font-semibold text-ink">{t('title')}</h2>
      </div>
      <p className="text-ink-muted text-sm">{t('description')}</p>
      {hasSubscription && <p className="text-warning text-sm mt-3">{t('subscriptionWarning')}</p>}

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-6 text-sm font-semibold text-danger hover:underline">
          {t('open')}
        </button>
      ) : (
        <div className="mt-6 flex flex-col gap-3 max-w-md">
          <label className="text-sm text-ink">
            {t('confirmLabel', { email })}
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full bg-ghost-fill border border-line rounded-md px-4 py-3 text-ink focus:outline-none focus:border-line-strong text-sm"
              autoComplete="off"
            />
          </label>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={remove}
              disabled={!matches || busy}
              className="px-5 py-3 rounded-md bg-danger text-white text-sm font-semibold disabled:opacity-50"
            >
              {busy ? t('deleting') : t('confirm')}
            </button>
            <button type="button" onClick={() => { setOpen(false); setConfirm('') }} className="px-5 py-3 text-sm text-ink-muted">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
