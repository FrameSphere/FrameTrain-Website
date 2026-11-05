import { NextRequest, NextResponse } from 'next/server'
import { readRelayBody } from '../_relay'
import { recordHeartbeat } from '@/lib/mcp/devices'

export const dynamic = 'force-dynamic'

// POST { apiKey, deviceId, deviceName, appVersion, manifestHash } -> { ok, wantManifest }
export async function POST(req: NextRequest) {
  const auth = await readRelayBody(req, { needDevice: true })
  if (!auth.ok) return auth.response
  try {
    const { wantManifest } = await recordHeartbeat(auth.userId, { ...auth.body, deviceId: auth.deviceId })
    return NextResponse.json({ ok: true, wantManifest })
  } catch (err) {
    console.error('mcp heartbeat error:', err)
    return NextResponse.json({ ok: false, error: 'Interner Fehler' }, { status: 500 })
  }
}
