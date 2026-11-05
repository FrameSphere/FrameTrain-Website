import { NextRequest, NextResponse } from 'next/server'
import { readRelayBody } from '../_relay'
import { getMcpStatus } from '@/lib/mcp/status'

export const dynamic = 'force-dynamic'

// POST { apiKey } -> { connections, recentJobs } (+ devices als Zusatz)
export async function POST(req: NextRequest) {
  const auth = await readRelayBody(req)
  if (!auth.ok) return auth.response
  try {
    return NextResponse.json(await getMcpStatus(auth.userId))
  } catch (err) {
    console.error('mcp status error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
