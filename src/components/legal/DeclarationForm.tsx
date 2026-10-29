'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'

// Bestätigungsseite für Kündigung (§ 312k Abs. 2 BGB) und Widerruf
// (§ 356a BGB). Funktioniert ohne Login; ein eingeloggter Nutzer bekommt
// seine E-Mail vorausgefüllt. Nach dem Absenden zeigen wir Inhalt und
// Zeitpunkt der Erklärung an – die Bestätigung per Mail kommt zusätzlich.
export function DeclarationForm({ kind }: { kind: 'cancel' | 'withdrawal' }) {
  const t = useTranslations('Declaration')
  const locale = useLocale()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [contractRef, setContractRef] = useState('')
  const [cancelType, setCancelType] = useState<'ordinary' | 'extraordinary'>('ordinary')
  const [reason, setReason] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ receivedAt: string; outcome: string; mailed: boolean } | null>(null)

  const effectiveEmail = email || user?.email || ''
  const k = kind === 'cancel' ? 'cancel' : 'withdrawal'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/legal/declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          locale,
          name,
          email: effectiveEmail,
          contractRef,
          ...(kind === 'cancel' ? { cancelType } : {}),
          reason,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error()
      setResult(data)
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done' && result) {
    const when = new Date(result.receivedAt).toLocaleString(locale === 'en' ? 'en-GB' : 'de-DE', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
    return (
      <div role="status" className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink m-0">{t(`${k}.doneTitle`)}</h2>
        <p className="mt-3 text-sm text-ink">{t('doneReceived', { when })}</p>
        <p className="mt-3 text-sm text-ink-muted">{result.outcome}</p>
        <p className="mt-3 text-sm text-ink-muted">
          {result.mailed ? t('doneMailed', { email: effectiveEmail }) : t('doneNotMailed')}
        </p>
      </div>
    )
  }

  const input = 'w-full h-11 px-3 rounded-md border border-line bg-bg text-ink text-[15px]'
  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-surface p-6 sm:p-8 flex flex-col gap-5">
      {kind === 'cancel' && (
        <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
          <legend className="text-sm font-semibold text-ink mb-2">{t('cancel.typeLabel')}</legend>
          {(['ordinary', 'extraordinary'] as const).map((v) => (
            <label key={v} className="flex items-start gap-3 text-sm text-ink cursor-pointer">
              <input type="radio" name="cancelType" className="mt-1" checked={cancelType === v} onChange={() => setCancelType(v)} />
              <span>{t(`cancel.type.${v}`)}</span>
            </label>
          ))}
        </fieldset>
      )}

      <label className="flex flex-col gap-1.5 text-sm text-ink">
        {t('nameLabel')}
        <input required minLength={2} maxLength={120} className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        {t('emailLabel')}
        <input required type="email" maxLength={200} className={input} value={effectiveEmail} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <span className="text-xs text-ink-faint">{t('emailHint')}</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        {t('contractLabel')}
        <input maxLength={200} className={input} value={contractRef} onChange={(e) => setContractRef(e.target.value)} placeholder={t('contractPlaceholder')} />
      </label>
      {(kind === 'withdrawal' || cancelType === 'extraordinary') && (
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          {kind === 'cancel' ? t('cancel.reasonLabel') : t('withdrawal.reasonLabel')}
          <textarea
            required={kind === 'cancel'}
            maxLength={2000}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-line bg-bg text-ink text-[15px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      )}

      {state === 'error' && (
        <div role="alert" className="px-4 py-3 rounded-sm border border-danger text-danger text-[14px]">{t('error')}</div>
      )}

      <button type="submit" disabled={state === 'sending'} className="ft-btn ft-btn--primary w-full">
        {state === 'sending' ? t('sending') : t(`${k}.submit`)}
      </button>
    </form>
  )
}
