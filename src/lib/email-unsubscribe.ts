import { createHmac, timingSafeEqual } from 'crypto'
import { siteUrl } from '@/lib/seo'

/**
 * Abmelde-Links für Onboarding-Mails.
 *
 * Der Link trägt die Nutzer-ID plus eine HMAC-Signatur – so kann sich jeder
 * ohne Login abmelden, aber niemand fremde Konten abmelden, indem er IDs rät.
 */
const SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.JWT_SECRET

function sign(userId: string) {
  if (!SECRET) throw new Error('EMAIL_UNSUBSCRIBE_SECRET bzw. JWT_SECRET fehlt')
  return createHmac('sha256', SECRET).update(`unsubscribe:${userId}`).digest('base64url')
}

export function verifyUnsubscribeToken(userId: string, token: string) {
  if (!userId || !token) return false
  const expected = Buffer.from(sign(userId))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** Sichtbarer Link in der Mail: Seite mit Bestätigungs-Button (Link-Scanner melden so niemanden versehentlich ab). */
export function unsubscribePageUrl(userId: string, locale: 'de' | 'en') {
  return `${siteUrl}/${locale}/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${sign(userId)}`
}

/** Ziel für den List-Unsubscribe-Header (RFC 8058, Ein-Klick-Abmeldung im Mailprogramm). */
export function unsubscribeApiUrl(userId: string) {
  return `${siteUrl}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${sign(userId)}`
}
