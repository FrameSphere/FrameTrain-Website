import { track } from '@vercel/analytics'

/**
 * Cookielose Funnel-Ereignisse über Vercel Web Analytics.
 *
 * Unabhängig vom Consent-Banner (kein Cookie, keine personenbezogenen Daten),
 * deshalb passend zum Privacy-Versprechen. Die Ad-Tags in lib/analytics.ts
 * bleiben davon unberührt und feuern weiterhin nur mit Zustimmung.
 *
 * Hinweis: Custom Events zeigt Vercel erst ab dem Pro-Plan im Dashboard an.
 */
export type FunnelEvent =
  | 'trial_click'
  | 'demo_click'
  | 'download_start'
  | 'code_captured'
  | 'code_redeemed'
  | 'pricing_toggle'
  | 'channel_visit'

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean>) {
  try {
    track(name, props)
  } catch {
    // Analytics darf nie eine Nutzeraktion blockieren.
  }
}
