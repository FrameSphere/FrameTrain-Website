import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { userIdForApiKey } from '../_shared'

export const dynamic = 'force-dynamic'

// Schalter "Fehler automatisch melden" in der Desktop-App. Die Einwilligung
// liegt in der DB, damit sie geräteübergreifend gilt und nachweisbar ist
// (Art. 7 Abs. 1 DSGVO: Zeitpunkt in diagnosticsConsentAt).
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`diag-consent:${ip}`, 20, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  const { apiKey, consent } = await req.json().catch(() => ({}))
  if (typeof consent !== 'boolean') {
    return NextResponse.json({ error: 'consent must be boolean' }, { status: 400 })
  }
  const userId = await userIdForApiKey(apiKey)
  if (!userId) return NextResponse.json({ error: 'invalid api key' }, { status: 401 })

  await prisma.user.update({
    where: { id: userId },
    data: { diagnosticsConsent: consent, diagnosticsConsentAt: new Date() },
  })
  return NextResponse.json({ ok: true, diagnosticsConsent: consent })
}
