import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { userIdForApiKey } from '../_shared'
import { CURRENT_TERMS_VERSION } from '@/lib/legal-version'

export const dynamic = 'force-dynamic'

// Zustimmung zu AGB & Datenschutz aus der Desktop-App — für Konten ohne
// Zustimmung zur aktuellen Fassung. Wer schon zugestimmt hat, bleibt unverändert.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`accept-terms:${ip}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const { apiKey } = await req.json().catch(() => ({}))
  const userId = await userIdForApiKey(apiKey)
  if (!userId) return NextResponse.json({ error: 'invalid api key' }, { status: 401 })

  await prisma.user.updateMany({
    // NULL explizit: "NOT version = X" trifft in SQL keine NULL-Zeilen
    where: { id: userId, OR: [{ termsVersion: null }, { termsVersion: { not: CURRENT_TERMS_VERSION } }] },
    data: { termsAcceptedAt: new Date(), termsVersion: CURRENT_TERMS_VERSION },
  })
  return NextResponse.json({ ok: true })
}
