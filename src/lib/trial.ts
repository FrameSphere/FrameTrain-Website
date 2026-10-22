import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'

/**
 * Kostenlose Testphase ohne Zahlungsdaten.
 *
 * Nutzt denselben Mechanismus wie Gratismonate-Codes: hasPaid + ein Ablauf-
 * datum in promo_access_until. Der tägliche Cron (/api/cron/expire-promo-access)
 * nimmt nach Ablauf Zugang und API-Key automatisch zurück – es wird nie etwas
 * abgebucht, und es braucht kein eigenes Datenbankfeld.
 *
 * Vergeben wird der Test genau einmal pro Konto, nämlich beim Entstehen eines
 * bestätigten Kontos: bei OAuth/SSO direkt bei der Anlage, bei E-Mail-Konten
 * erst mit der E-Mail-Bestätigung (sonst ließe sich mit Wegwerf-Adressen
 * beliebig oft testen).
 */
export const TRIAL_DAYS = 14

export function trialEndsAt(from = new Date()) {
  return new Date(from.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
}

/**
 * Schaltet die Testphase frei, wenn das Konto noch nie Zugang hatte.
 * Gibt das Enddatum zurück oder null, wenn nichts freigeschaltet wurde.
 * Fehler werden geloggt und nicht weitergereicht: eine fehlgeschlagene
 * Freischaltung darf Registrierung oder Login nie blockieren.
 */
export async function grantTrialIfEligible(userId: string): Promise<Date | null> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          hasPaid: true,
          lifetimeAccess: true,
          promoAccessUntil: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          _count: { select: { promoRedemptions: true, payments: true } },
        },
      })
      if (!user) return null
      const hadAccessBefore =
        user.hasPaid ||
        user.lifetimeAccess ||
        user.promoAccessUntil !== null ||
        user.stripeCustomerId !== null ||
        user.stripeSubscriptionId !== null ||
        user._count.promoRedemptions > 0 ||
        user._count.payments > 0
      if (hadAccessBefore) return null

      const until = trialEndsAt()
      await tx.user.update({
        where: { id: userId },
        data: { hasPaid: true, promoAccessUntil: until },
      })

      const existingKey = await tx.apiKey.findFirst({ where: { userId, isActive: true } })
      if (!existingKey) {
        await tx.apiKey.create({ data: { userId, key: generateApiKey(), isActive: true } })
      }
      return until
    })
  } catch (err) {
    console.error('Trial konnte nicht freigeschaltet werden:', err)
    return null
  }
}
