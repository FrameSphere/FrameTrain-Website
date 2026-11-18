import { NextRequest, NextResponse } from 'next/server'
import { accountForApiKey } from '../_shared'
import { isValidDeviceId } from '@/lib/mcp/devices'

// Gemeinsame Auth fuer /api/desktop/mcp/*: apiKey im JSON-Body (Vertrag Abschnitt 5).
export async function readRelayBody(
  req: NextRequest,
  opts: { needDevice?: boolean } = {},
): Promise<
  | { ok: true; userId: string; body: Record<string, unknown>; deviceId: string }
  | { ok: false; response: NextResponse }
> {
  let body: Record<string, unknown>
  try {
    const parsed = await req.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad body')
    body = parsed
  } catch {
    return { ok: false, response: NextResponse.json({ ok: false, error: 'Ungueltiger JSON-Body' }, { status: 400 }) }
  }
  const account = await accountForApiKey(body.apiKey)
  if (!account) {
    return { ok: false, response: NextResponse.json({ ok: false, error: 'Ungueltiger API-Key' }, { status: 401 }) }
  }
  // Ein Business-Platz wuerde sich sonst als Geraet des Inhabers melden und
  // dessen KI-Verbindungen koennten Werkzeuge auf dem Rechner der Person ausfuehren.
  if (account.seatId) {
    return { ok: false, response: NextResponse.json({ ok: false, error: 'KI-Fernverbindungen sind mit einem Team-Platz noch nicht verfuegbar.', code: 'team_seat' }, { status: 403 }) }
  }
  const userId = account.userId
  if (opts.needDevice && !isValidDeviceId(body.deviceId)) {
    return { ok: false, response: NextResponse.json({ ok: false, error: 'deviceId fehlt oder ungueltig' }, { status: 400 }) }
  }
  return { ok: true, userId, body, deviceId: typeof body.deviceId === 'string' ? body.deviceId : '' }
}
