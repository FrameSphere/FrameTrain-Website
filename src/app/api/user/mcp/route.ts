import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMcpStatus, revokeConnection } from '@/lib/mcp/status'

// Dashboard "KI-Verbindungen" (Cookie-Login): Status lesen, Verbindung trennen.
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  try {
    return NextResponse.json(await getMcpStatus(user.userId))
  } catch (err) {
    console.error('user mcp status error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  let body: { action?: string; connectionId?: string } = {}
  try {
    body = await req.json()
  } catch {}
  if (body.action !== 'disconnect') return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
  const ok = await revokeConnection(user.userId, body.connectionId)
  if (!ok) return NextResponse.json({ ok: false, error: 'Verbindung nicht gefunden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
