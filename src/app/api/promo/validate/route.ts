import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { validatePromoCode, publicPromoView } from '@/lib/promo'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Prüft einen Promo-Code, OHNE ihn einzulösen.
// Auth erforderlich + Rate-Limiting gegen Brute-Force-Erraten von Codes.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Brute-Force-Schutz: pro User UND pro IP limitieren
    const ip = getClientIp(req.headers)
    const byUser = rateLimit(`promo:user:${user.userId}`, 10, 10 * 60 * 1000) // 10 Versuche / 10 Min
    const byIp = rateLimit(`promo:ip:${ip}`, 30, 10 * 60 * 1000)              // 30 Versuche / 10 Min
    if (!byUser.ok || !byIp.ok) {
      const retryAfter = Math.max(byUser.retryAfterSeconds, byIp.retryAfterSeconds)
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const result = await validatePromoCode(body.code, user.userId)

    if (!result.ok) {
      // Einheitliche Antwort für ungültig/abgelaufen/ausgeschöpft,
      // damit sich Codes nicht enumerieren lassen
      return NextResponse.json({ valid: false, reason: result.reason }, { status: 200 })
    }

    return NextResponse.json({ valid: true, promo: publicPromoView(result.promo) })
  } catch (error) {
    console.error('Promo validate error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
