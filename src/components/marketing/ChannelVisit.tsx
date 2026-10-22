'use client'

import { useEffect } from 'react'
import { storePromoCode, normalizePromoCode } from '@/components/PromoCapture'
import { trackEvent } from '@/lib/events'

/** Merkt den Kanal-Code und zählt den Besuch (cookielos, Vercel Analytics). */
export function ChannelVisit({ channel, code }: { channel: string; code: string | null }) {
  useEffect(() => {
    // Ein ?code= aus dem Link hat Vorrang (z. B. ein Code pro Video)
    const fromUrl = normalizePromoCode(new URLSearchParams(window.location.search).get('code'))
    const value = fromUrl || (code ? normalizePromoCode(code) : '')
    if (value) storePromoCode(value)
    trackEvent('channel_visit', { channel, code: value || 'none' })
  }, [channel, code])
  return null
}
