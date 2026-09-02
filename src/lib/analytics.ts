'use client'

// ─── Consent & Conversion-Tracking (client-seitig) ─────────────────────────────
//
// Grundregeln:
// - Es wird NICHTS geladen, solange (a) die jeweilige NEXT_PUBLIC-Env-Var fehlt
//   oder (b) der Nutzer nicht aktiv zugestimmt hat.
// - Google Consent Mode v2 steht per Inline-Script im <head> (siehe
//   src/app/[locale]/layout.tsx) standardmäßig auf "denied" — auch dann, wenn
//   später doch ein Tag geladen wird, gilt erst der Update nach Zustimmung.
// - Der Kauf-Event feuert ausschließlich mit serverseitig bestätigten Werten
//   (siehe /api/payment/verify-session) und pro Transaktion nur einmal.
//
// TODO (später, bewusst nicht Teil dieses Schritts): serverseitige Meta
// Conversions API im Stripe-Webhook (checkout.session.completed). Der
// Browser-Event trägt bereits eventID = Stripe-Session-ID, damit Meta beide
// Quellen sauber dedupliziert. Gleiches gilt für GA4 Measurement Protocol
// und Google Ads Enhanced Conversions — beides würde zusätzlich die Käufe
// erfassen, bei denen der Browser-Pixel geblockt ist oder der Nutzer die
// Success-Seite nie erreicht.

export const CONSENT_STORAGE_KEY = 'ft_consent_v1'
export const CONSENT_EVENT = 'ft-consent-change'
/** Öffnet den Banner erneut (Footer-Link „Cookie-Einstellungen"). */
export const CONSENT_REOPEN_EVENT = 'ft-consent-reopen'

export type ConsentStatus = 'granted' | 'denied' | 'unknown'

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
// Conversion-Label aus Google Ads (Format: "AbC-D_efGhIjK"). Ohne Label kann
// Google Ads den Kauf nicht zuordnen — dann wird nur GA4 + Meta gefeuert.
export const GOOGLE_ADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL

/** Mindestens ein Tag konfiguriert? Ohne das brauchen wir auch keinen Banner. */
export function hasAnyTag(): boolean {
  return Boolean(GA_ID || META_PIXEL_ID || GOOGLE_ADS_ID)
}

export function readConsent(): ConsentStatus {
  if (typeof window === 'undefined') return 'unknown'
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return 'unknown'
    const parsed = JSON.parse(raw)
    return parsed?.status === 'granted' ? 'granted' : parsed?.status === 'denied' ? 'denied' : 'unknown'
  } catch {
    // Private Mode / geblockter Storage → wie "noch nicht entschieden" behandeln,
    // es wird also nichts geladen.
    return 'unknown'
  }
}

export function writeConsent(status: 'granted' | 'denied') {
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ status, ts: new Date().toISOString(), v: 1 })
    )
  } catch {
    // Kein Storage → Entscheidung gilt nur für diese Seitenansicht.
  }

  // Google Consent Mode v2 aktualisieren (gtag-Stub existiert immer, siehe Layout)
  const gtag = (window as any).gtag
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      ad_storage: status === 'granted' ? 'granted' : 'denied',
      ad_user_data: status === 'granted' ? 'granted' : 'denied',
      ad_personalization: status === 'granted' ? 'granted' : 'denied',
      analytics_storage: status === 'granted' ? 'granted' : 'denied',
      personalization_storage: status === 'granted' ? 'granted' : 'denied',
    })
  }

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { status } }))
}

/**
 * Widerruf muss so einfach sein wie die Einwilligung (Art. 7 Abs. 3 DSGVO).
 * Öffnet den Banner erneut; die Entscheidung trifft dann wieder der Nutzer.
 * Ein Widerruf setzt den Consent-Mode über writeConsent('denied') zurück auf
 * "denied" — bereits geladene Tags dürfen dann nichts mehr speichern, und beim
 * nächsten Seitenaufruf werden sie gar nicht erst angefordert.
 */
export function openConsentSettings() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CONSENT_REOPEN_EVENT))
}

// ─── Event-Helfer ──────────────────────────────────────────────────────────────

function gtagSafe(...args: any[]) {
  const gtag = (window as any).gtag
  if (typeof gtag === 'function') gtag(...args)
}

/**
 * fbq ist erst nach dem Laden des Pixel-Snippets vorhanden. Auf der
 * Success-Seite feuert der Kauf u.U. bevor das Script durch ist — deshalb
 * kurz (max. ~6s) nachfassen, statt den Event zu verlieren.
 */
function fbqSafe(fn: (fbq: (...a: any[]) => void) => void, attempt = 0) {
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') {
    fn(fbq)
    return
  }
  if (attempt < 30) {
    setTimeout(() => fbqSafe(fn, attempt + 1), 200)
  }
}

export function trackPageView(url: string) {
  if (readConsent() !== 'granted') return
  if (GA_ID) gtagSafe('event', 'page_view', { page_path: url, send_to: GA_ID })
  if (META_PIXEL_ID) fbqSafe((fbq) => fbq('track', 'PageView'))
}

/**
 * Frühes Funnel-Signal: erfolgreiche Registrierung.
 * Wichtig für trial-first-Funnels — die Ad-Plattform bekommt damit ein
 * Optimierungsziel, lange bevor Geld fließt.
 */
export function trackSignUp(method: string = 'email'): boolean {
  if (typeof window === 'undefined') return false
  if (readConsent() !== 'granted') return false

  if (GA_ID) gtagSafe('event', 'sign_up', { send_to: GA_ID, method })
  if (META_PIXEL_ID) fbqSafe((fbq) => fbq('track', 'CompleteRegistration', { status: method }))
  return true
}

export type TrialPayload = {
  /** Promo-Typ aus src/lib/promo.ts: 'free_months' | 'lifetime' | 'percent' */
  promoType: string
  /** Gratismonate, falls bekannt */
  freeMonths?: number
  /** Dedupe-Schlüssel (Promo-Code oder Stripe-Session-ID) */
  dedupeId: string
}

/**
 * Funnel-Signal für den Trial-/Gutschein-Pfad: Zugang freigeschaltet, aber
 * noch kein Umsatz. Bewusst ein eigenes Event (kein purchase mit Wert 0),
 * damit Umsatzreports sauber bleiben und die Ad-Plattform trotzdem ein
 * Conversion-Signal zum Optimieren hat.
 */
export function trackStartTrial({ promoType, freeMonths, dedupeId }: TrialPayload): boolean {
  if (typeof window === 'undefined') return false
  if (readConsent() !== 'granted') return false
  if (!dedupeId) return false

  const dedupeKey = `ft_trial_tracked_${dedupeId}`
  try {
    if (window.localStorage.getItem(dedupeKey)) return false
    window.localStorage.setItem(dedupeKey, String(Date.now()))
  } catch {
    try {
      if (window.sessionStorage.getItem(dedupeKey)) return false
      window.sessionStorage.setItem(dedupeKey, String(Date.now()))
    } catch {
      /* beides blockiert: lieber einmal feuern als gar nicht */
    }
  }

  if (GA_ID) {
    gtagSafe('event', 'start_trial', {
      send_to: GA_ID,
      promo_type: promoType,
      ...(freeMonths ? { free_months: freeMonths } : {}),
    })
  }
  if (META_PIXEL_ID) {
    fbqSafe((fbq) =>
      fbq(
        'track',
        'StartTrial',
        { currency: 'EUR', value: 0, predicted_ltv: 0, content_name: promoType },
        { eventID: `trial_${dedupeId}` }
      )
    )
  }
  return true
}

export type PurchasePayload = {
  /** Stripe-Checkout-Session-ID — dient zugleich als Dedupe-Schlüssel */
  transactionId: string
  /** Betrag in Euro/Hauptwährungseinheit, serverseitig von Stripe bestätigt */
  value: number
  currency: string
  plan?: string
}

/**
 * Feuert den Kauf-Conversion an GA4, Meta und Google Ads.
 * Vorbedingungen (alle Pflicht):
 * - Consent erteilt
 * - Zahlung serverseitig bestätigt (Aufrufer!)
 * - Diese Transaktion wurde noch nie getrackt (Dedupe über localStorage)
 */
export function trackPurchase({ transactionId, value, currency, plan }: PurchasePayload): boolean {
  if (typeof window === 'undefined') return false
  if (readConsent() !== 'granted') return false
  if (!transactionId || !(value > 0) || !currency) return false

  // Dedupe: pro Transaktion genau einmal, auch über Reloads hinweg.
  const dedupeKey = `ft_purchase_tracked_${transactionId}`
  try {
    if (window.localStorage.getItem(dedupeKey)) return false
    window.localStorage.setItem(dedupeKey, String(Date.now()))
  } catch {
    // Ohne Storage kein Dedupe möglich → sessionStorage als Fallback
    try {
      if (window.sessionStorage.getItem(dedupeKey)) return false
      window.sessionStorage.setItem(dedupeKey, String(Date.now()))
    } catch {
      /* beides blockiert: lieber einmal feuern als gar nicht */
    }
  }

  const upperCurrency = currency.toUpperCase()

  // GA4
  if (GA_ID) {
    gtagSafe('event', 'purchase', {
      send_to: GA_ID,
      transaction_id: transactionId,
      value,
      currency: upperCurrency,
      items: [
        {
          item_id: plan ? `frametrain-${plan}` : 'frametrain-subscription',
          item_name: plan ? `FrameTrain ${plan}` : 'FrameTrain Subscription',
          price: value,
          quantity: 1,
        },
      ],
    })
  }

  // Google Ads (braucht send_to = "AW-XXXX/LABEL")
  if (GOOGLE_ADS_ID && GOOGLE_ADS_PURCHASE_LABEL) {
    gtagSafe('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`,
      transaction_id: transactionId,
      value,
      currency: upperCurrency,
    })
  }

  // Meta Pixel — eventID = Stripe-Session-ID, damit eine später ergänzte
  // Conversions API (serverseitig) sauber deduplizieren kann.
  if (META_PIXEL_ID) {
    fbqSafe((fbq) =>
      fbq(
        'track',
        'Purchase',
        { value, currency: upperCurrency, content_name: plan ?? 'subscription' },
        { eventID: transactionId }
      )
    )
  }

  return true
}
