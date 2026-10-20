import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Serverseitige Daten für die Startseite. Beide Quellen sind optional: wenn
 * GitHub oder die Datenbank nicht antworten, liefert die Funktion null und
 * die Seite blendet den jeweiligen Baustein aus – sie bricht nie deswegen.
 */

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'FrameSphere'
const GITHUB_REPO = process.env.GITHUB_REPO || 'FrameTrain-App'

export type LatestRelease = { version: string; publishedAt: string; url: string }

export async function getLatestRelease(): Promise<LatestRelease | null> {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=10`, {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const releases: { tag_name: string; published_at: string; html_url: string; draft: boolean; prerelease: boolean }[] =
      await res.json()
    const latest = releases
      .filter((r) => !r.draft && !r.prerelease)
      .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))[0]
    if (!latest) return null
    return {
      version: latest.tag_name.replace(/^v/i, ''),
      publishedAt: latest.published_at,
      url: latest.html_url,
    }
  } catch {
    return null
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
