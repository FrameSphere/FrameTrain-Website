import crypto from 'crypto'

// ─── Serverseitiges Conversion-Tracking (Meta CAPI + GA4 Measurement Protocol) ─
//
// Warum überhaupt serverseitig?
// Der Browser-Pixel auf /payment/success erfasst NUR die erste Zahlung und nur
// dann, wenn der Nutzer die Seite erreicht und kein Adblocker greift. Er
// verpasst systematisch:
//   - trial → paid (die erste echte Abbuchung nach Gratismonaten passiert
//     Wochen später ganz ohne Browser)
//   - Verlängerungen
//   - Käufe mit geblocktem Pixel
// Dieses Modul schließt genau diese Lücke aus dem Stripe-Webhook heraus.
//
// DEDUPLIZIERUNG (kritisch, sonst zählt der erste Kauf doppelt):
// Die eventId ist bei der ERSTEN Rechnung dieselbe Stripe-Checkout-Session-ID,
// die der Browser-Event als `transaction_id` / Meta-`eventID` verwendet
// (siehe src/lib/analytics.ts). Meta dedupliziert darüber automatisch, GA4
// über die identische transaction_id. Bei Verlängerungen gibt es kein
// Browser-Pendant — dort ist die eventId die Stripe-Invoice-ID.
//
// SICHERHEIT/DSGVO: Übertragen werden Betrag, Währung, Transaktions-ID und —
// nur an Meta — die zu SHA-256 gehashte E-Mail (Standard-Matching, Klartext
// verlässt den Server nie). Keine Namen, keine Zahlungsdaten.
//
// Ohne konfigurierte Secrets ist jede Funktion hier ein No-Op: Es werden weder
// Requests gesendet noch Fehler geworfen — der Webhook läuft unverändert weiter.

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const META_CAPI_TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE
const META_API_VERSION = 'v21.0'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID
const GA_API_SECRET = process.env.GA4_API_SECRET

export type ServerPurchase = {
  /** Dedupe-Schlüssel: Checkout-Session-ID (1. Rechnung) oder Invoice-ID */
  eventId: string
  /** Betrag in Hauptwährungseinheit (z.B. 4.99) */
  value: number
  currency: string
  email?: string | null
  /** Stripe-Customer-ID – dient als stabile Pseudo-Client-ID für GA4 */
  stripeCustomerId?: string | null
  /** Interne User-ID für GA4 user_id (kein Klarname) */
  userId?: string | null
  /** 'subscription_create' | 'subscription_cycle' | … (Stripe billing_reason) */
  billingReason?: string | null
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

/** Meta Conversions API – serverseitiges Purchase-Event */
async function sendMetaPurchase(p: ServerPurchase): Promise<'sent' | 'skipped' | 'failed'> {
  if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) return 'skipped'

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        // Identisch zur Browser-eventID → Meta dedupliziert automatisch.
        event_id: p.eventId,
        action_source: 'website',
        user_data: {
          ...(p.email ? { em: [sha256(p.email)] } : {}),
          ...(p.stripeCustomerId ? { external_id: [sha256(p.stripeCustomerId)] } : {}),
        },
        custom_data: {
          currency: p.currency.toUpperCase(),
          value: p.value,
          ...(p.billingReason ? { content_name: p.billingReason } : {}),
        },
      },
    ],
    ...(META_CAPI_TEST_EVENT_CODE ? { test_event_code: META_CAPI_TEST_EVENT_CODE } : {}),
  }

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_ACCESS_TOKEN)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    // Body bewusst nur gekürzt loggen – er kann das Access-Token spiegeln.
    console.error('❌ Meta CAPI purchase failed:', res.status, (await res.text()).slice(0, 300))
    return 'failed'
  }
  return 'sent'
}

/** GA4 Measurement Protocol – serverseitiges purchase-Event */
async function sendGa4Purchase(p: ServerPurchase): Promise<'sent' | 'skipped' | 'failed'> {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) return 'skipped'

  // GA4 verlangt eine client_id. Serverseitig existiert kein _ga-Cookie, also
  // eine stabile Pseudo-ID aus der Stripe-Customer-ID ableiten. Folge: die
  // Conversion wird der ursprünglichen Browser-Session NICHT zugeordnet
  // (Kanal/Kampagne fehlen). Für die Kampagnenzuordnung bleibt der Browser-Event
  // die Quelle; dieser hier stellt sicher, dass der Umsatz überhaupt ankommt.
  const seed = p.stripeCustomerId || p.userId || p.eventId
  const hash = sha256(seed)
  const clientId = `${parseInt(hash.slice(0, 8), 16)}.${parseInt(hash.slice(8, 16), 16)}`

  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(GA_MEASUREMENT_ID)}&api_secret=${encodeURIComponent(GA_API_SECRET)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        ...(p.userId ? { user_id: p.userId } : {}),
        non_personalized_ads: false,
        events: [
          {
            name: 'purchase',
            params: {
              // Gleiche transaction_id wie im Browser-Event → GA4 verwirft das
              // Duplikat bei der ersten Rechnung.
              transaction_id: p.eventId,
              value: p.value,
              currency: p.currency.toUpperCase(),
              items: [
                {
                  item_id: 'frametrain-subscription',
                  item_name: 'FrameTrain Subscription',
                  price: p.value,
                  quantity: 1,
                },
              ],
            },
          },
        ],
      }),
    }
  )

  if (!res.ok) {
    console.error('❌ GA4 Measurement Protocol purchase failed:', res.status)
    return 'failed'
  }
  return 'sent'
}

/**
 * Sendet den Kauf an alle konfigurierten serverseitigen Ziele.
 * Wirft NIE — Tracking darf einen Stripe-Webhook nicht scheitern lassen
 * (Stripe würde sonst retryen und die Zahlung mehrfach verbuchen).
 */
export async function sendServerPurchase(p: ServerPurchase): Promise<void> {
  if (!(p.value > 0) || !p.eventId) return

  const targets: Array<Promise<string>> = []
  try {
    targets.push(sendMetaPurchase(p).catch((e) => { console.error('Meta CAPI error:', e); return 'failed' }))
    targets.push(sendGa4Purchase(p).catch((e) => { console.error('GA4 MP error:', e); return 'failed' }))
    const [meta, ga4] = await Promise.all(targets)

    if (meta === 'skipped' && ga4 === 'skipped') {
      // Nicht als Fehler loggen: ohne Secrets ist das der erwartete Zustand.
      console.log(
        'ℹ️ Server-side purchase tracking inactive (META_CAPI_ACCESS_TOKEN / GA4_API_SECRET not set) – event:',
        p.eventId
      )
      return
    }
    console.log(`✅ Server-side purchase sent (meta=${meta}, ga4=${ga4}) – event:`, p.eventId)
  } catch (err) {
    console.error('❌ sendServerPurchase failed (ignored):', err)
  }
}
