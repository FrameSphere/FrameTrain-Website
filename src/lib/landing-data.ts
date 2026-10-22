import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { fetchLatestRelease } from '@/lib/github-releases'

/**
 * Serverseitige Daten für die Startseite. Beide Quellen sind optional: wenn
 * GitHub oder die Datenbank nicht antworten, liefert die Funktion null und
 * die Seite blendet den jeweiligen Baustein aus – sie bricht nie deswegen.
 */

export type LatestRelease = { version: string; publishedAt: string; url: string }

export async function getLatestRelease(): Promise<LatestRelease | null> {
  const found = await fetchLatestRelease({ next: { revalidate: 3600 } })
  if (!found) return null
  return {
    version: found.release.tag_name.replace(/^v/i, ''),
    publishedAt: found.release.published_at,
    url: found.release.html_url,
  }
}

/** Plätze im Founding-Member-Kontingent. Danach greift der höhere Preis. */
export const FOUNDING_SPOTS = 100

/**
 * Zahl der echten Founding Members: zahlende Abonnenten (Stripe-Abo) plus
 * Lifetime-Zugänge. Testphasen und Gratismonate zählen bewusst nicht – der
 * Zähler soll zeigen, wie viele Plätze tatsächlich vergeben sind.
 */
export const getFoundingMemberCount = unstable_cache(
  async (): Promise<number | null> => {
    try {
      return await prisma.user.count({
        where: { OR: [{ stripeSubscriptionId: { not: null } }, { lifetimeAccess: true }] },
      })
    } catch {
      return null
    }
  },
  ['founding-member-count'],
  { revalidate: 3600 }
)
