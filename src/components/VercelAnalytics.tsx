'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'

// ─── Vercel Web Analytics ─────────────────────────────────────────────────────
//
// Cookielos und ohne Cross-Site-Tracking, läuft daher unabhängig vom
// Cookie-Banner (anders als GA4/Meta in ./Analytics.tsx).
// Query-Parameter werden vor dem Senden entfernt, weil einige Routen
// sensible Werte in der URL tragen (verify-email?token=…,
// payment/success?session_id=…). Nur utm_* bleibt für die Kanal-Auswertung.

function stripQuery(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url)
  for (const key of Array.from(url.searchParams.keys())) {
    if (!key.startsWith('utm_')) url.searchParams.delete(key)
  }
  return { ...event, url: url.toString() }
}

export function VercelAnalytics() {
  return <Analytics beforeSend={stripQuery} />
}
