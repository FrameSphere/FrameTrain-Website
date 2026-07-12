import { prisma } from '@/lib/prisma'
import type { PromoCode } from '@prisma/client'

// ─── Promo-Code-Logik (zentral, wird von validate/redeem/create-checkout genutzt) ──
//
// Sicherheitsprinzipien:
// - Codes werden NUR serverseitig geprüft; der Client bekommt nie mehr Infos
//   als nötig (kein Verrat, ob ein Code existiert vs. abgelaufen ist).
// - Rabatt/Trial wird ausschließlich serverseitig auf die Stripe-Session
//   angewendet — der Client kann den Preis nicht manipulieren.
// - Einlösung zählt erst bei erfolgreichem Checkout (Webhook), damit
//   abgebrochene Checkouts keine Codes verbrennen. Lifetime-Codes werden
//   sofort atomar eingelöst.

export const PROMO_TYPES = ['percent', 'free_months', 'lifetime'] as const
export type PromoType = (typeof PROMO_TYPES)[number]

// Nur Großbuchstaben, Ziffern und Bindestriche, 4–32 Zeichen.
// Verhindert nebenbei seltsame Inputs (Whitespace, Unicode-Tricks, SQL-Smuggling-Versuche).
const CODE_FORMAT = /^[A-Z0-9][A-Z0-9-]{2,30}[A-Z0-9]$/

export function normalizePromoCode(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const code = input.trim().toUpperCase()
  return CODE_FORMAT.test(code) ? code : null
}

export type PromoValidation =
  | { ok: true; promo: PromoCode }
  | { ok: false; reason: 'invalid' | 'already_redeemed' }

/**
 * Prüft, ob ein Code für diesen User einlösbar ist (ohne ihn zu verbrauchen).
 * Alle "nicht einlösbar"-Fälle außer Doppel-Einlösung melden einheitlich
 * `invalid`, damit sich Codes nicht per Fehlermeldung enumerieren lassen.
 */
export async function validatePromoCode(rawCode: unknown, userId: string): Promise<PromoValidation> {
  const code = normalizePromoCode(rawCode)
  if (!code) return { ok: false, reason: 'invalid' }

  const promo = await prisma.promoCode.findUnique({ where: { code } })
  if (!promo || !promo.isActive) return { ok: false, reason: 'invalid' }
  if (promo.expiresAt && promo.expiresAt <= new Date()) return { ok: false, reason: 'invalid' }
  if (promo.maxRedemptions !== null && promo.redemptionCount >= promo.maxRedemptions) {
    return { ok: false, reason: 'invalid' }
  }
  if (!isPromoConfigValid(promo)) return { ok: false, reason: 'invalid' }

  const existing = await prisma.promoCodeRedemption.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
  })
  if (existing?.status === 'completed') return { ok: false, reason: 'already_redeemed' }

  return { ok: true, promo }
}

// Fehlkonfigurierte Codes (z. B. percent ohne percentOff) niemals einlösen lassen
function isPromoConfigValid(promo: PromoCode): boolean {
  switch (promo.type) {
    case 'percent':
      return (
        promo.percentOff !== null && promo.percentOff >= 1 && promo.percentOff <= 100 &&
        (promo.percentDuration !== 'repeating' ||
          (promo.percentDurationMonths !== null && promo.percentDurationMonths >= 1))
      )
    case 'free_months':
      return promo.freeMonths !== null && promo.freeMonths >= 1 && promo.freeMonths <= 36
    case 'lifetime':
      return true
    default:
      return false
  }
}

/** Öffentliche (für den Client unbedenkliche) Sicht auf einen validierten Code */
export function publicPromoView(promo: PromoCode) {
  return {
    code: promo.code,
    type: promo.type as PromoType,
    percentOff: promo.type === 'percent' ? promo.percentOff : undefined,
    freeMonths: promo.type === 'free_months' ? promo.freeMonths : undefined,
  }
}

/**
 * Atomarer, race-sicherer Verbrauch einer Einlösung:
 * erhöht redemption_count nur, wenn der Code noch aktiv, nicht abgelaufen
 * und nicht ausgeschöpft ist. Gibt true zurück, wenn der Slot reserviert wurde.
 * (Raw SQL, weil Prisma keine Spalte-mit-Spalte-Vergleiche im where unterstützt.)
 */
export async function consumeRedemptionSlot(
  tx: Pick<typeof prisma, '$executeRaw'>,
  promoCodeId: string
): Promise<boolean> {
  const updated = await tx.$executeRaw`
    UPDATE "promo_codes"
    SET "redemption_count" = "redemption_count" + 1, "updated_at" = NOW()
    WHERE "id" = ${promoCodeId}
      AND "is_active" = true
      AND ("expires_at" IS NULL OR "expires_at" > NOW())
      AND ("max_redemptions" IS NULL OR "redemption_count" < "max_redemptions")
  `
  return updated === 1
}
