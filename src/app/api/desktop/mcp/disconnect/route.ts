import { NextRequest, NextResponse } from 'next/server'
import { readRelayBody } from '../_relay'
import { revokeConnection } from '@/lib/mcp/status'

export const dynamic = 'force-dynamic'

// POST { apiKey, connectionId } -> { ok }
export async function POST(req: NextRequest) {
  const auth = await readRelayBody(req)
  if (!auth.ok) return auth.response
  try {
    const ok = await revokeConnection(auth.userId, auth.body.connectionId)
    if (!ok) return NextResponse.json({ ok: false, error: 'Verbindung nicht gefunden' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('mcp disconnect error:', err)
    return NextResponse.json({ ok: false, error: 'Interner Fehler' }, { status: 500 })
  }
}
