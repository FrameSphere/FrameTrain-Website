'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/events'

/**
 * Kanal-Codes merken: Ein Link wie frame-train.com/?code=REDDIT-FT-01 legt
 * den Code im Browser ab, egal auf welcher Seite man landet. Registrierung,
 * Gutschein- und Bezahlseite füllen ihn dann automatisch vor.
 */
export const PROMO_STORAGE_KEY = 'ft_promo_code'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

/** Gleiche Normalisierung wie serverseitig in lib/promo.ts. */
export function normalizePromoCode(raw: string | null | undefined): string {
  return (raw ?? '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40)
}

export function readStoredPromoCode(): string {
  try {
    const raw = window.localStorage.getItem(PROMO_STORAGE_KEY)
    if (!raw) return ''
    const { code, at } = JSON.parse(raw) as { code: string; at: number }
    if (!code || Date.now() - at > MAX_AGE_MS) return ''
    return normalizePromoCode(code)
  } catch {
    return ''
  }
}

export function storePromoCode(code: string) {
  try {
    window.localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify({ code, at: Date.now() }))
  } catch {
    // Privater Modus o. Ä. – dann eben ohne Vorbelegung.
  }
}

export function clearStoredPromoCode() {
  try {
    window.localStorage.removeItem(PROMO_STORAGE_KEY)
  } catch {}
}

export function PromoCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = normalizePromoCode(params.get('code'))
    if (!code) return
    storePromoCode(code)
    trackEvent('code_captured', { code, source: params.get('utm_source') ?? 'direct' })
  }, [])
  return null
}
