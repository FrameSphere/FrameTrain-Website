import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CURRENT_TERMS_VERSION } from '@/lib/legal-version'

export const dynamic = 'force-dynamic'

// Ausdrückliche Zustimmung zur aktuellen AGB-Fassung (Dashboard-Banner).
// Einziger Weg auf der Website, eine veraltete Version hochzusetzen.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (body.accepted !== true || body.version !== CURRENT_TERMS_VERSION) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.userId },
    data: { termsAcceptedAt: new Date(), termsVersion: CURRENT_TERMS_VERSION },
  })
  return NextResponse.json({ ok: true, version: CURRENT_TERMS_VERSION })
}
