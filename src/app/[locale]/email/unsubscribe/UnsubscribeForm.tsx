'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

type State = 'confirm' | 'sending' | 'unsubscribed' | 'resubscribed' | 'error'

export function UnsubscribeForm() {
  const t = useTranslations('Unsubscribe')
  const params = useSearchParams()
  const u = params.get('u') || ''
  const tok = params.get('t') || ''
  const [state, setState] = useState<State>(u && tok ? 'confirm' : 'error')

  const send = async (action: 'unsubscribe' | 'resubscribe') => {
    setState('sending')
    try {
      const res = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u, t: tok, action }),
      })
      if (!res.ok) throw new Error()
      setState(action === 'unsubscribe' ? 'unsubscribed' : 'resubscribed')
    } catch {
      setState('error')
    }
  }

  const title =
    state === 'unsubscribed' ? t('doneTitle') : state === 'resubscribed' ? t('backTitle') : state === 'error' ? t('errorTitle') : t('title')
  const text =
    state === 'unsubscribed' ? t('doneText') : state === 'resubscribed' ? t('backText') : state === 'error' ? t('errorText') : t('text')

  return (
    <div className="max-w-[520px] mx-auto rounded-xl border border-line bg-surface p-6 sm:p-8">
      <p className="ft-label m-0">{t('label')}</p>
      <h1 className="ft-heading mt-2 mb-0" aria-live="polite">
        {title}
      </h1>
      <p className="ft-small mt-3 mb-0">{text}</p>

      {(state === 'confirm' || state === 'sending') && (
        <button type="button" onClick={() => send('unsubscribe')} disabled={state === 'sending'} className="ft-btn ft-btn--primary mt-6">
          {state === 'sending' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {t('button')}
        </button>
      )}
      {state === 'unsubscribed' && (
        <button type="button" onClick={() => send('resubscribe')} className="ft-btn ft-btn--ghost ft-btn--sm mt-6">
          {t('undo')}
        </button>
      )}
    </div>
  )
}
