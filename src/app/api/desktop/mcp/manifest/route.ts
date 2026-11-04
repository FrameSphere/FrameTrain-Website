import { NextRequest, NextResponse } from 'next/server'
import { readRelayBody } from '../_relay'
import { saveManifest } from '@/lib/mcp/devices'

export const dynamic = 'force-dynamic'

// POST { apiKey, deviceId, manifestHash, tools } -> { ok }
export async function POST(req: NextRequest) {
  const auth = await readRelayBody(req, { needDevice: true })
  if (!auth.ok) return auth.response
  try {
    const res = await saveManifest(auth.userId, auth.deviceId, auth.body.manifestHash, auth.body.tools)
    if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 })
    return NextResponse.json({ ok: true, tools: res.count })
  } catch (err) {
    console.error('mcp manifest error:', err)
    return NextResponse.json({ ok: false, error: 'Interner Fehler' }, { status: 500 })
  }
}
