import { NextRequest, NextResponse } from 'next/server'
import { readRelayBody } from '../_relay'
import { submitJobResult } from '@/lib/mcp/jobs'
import { prismaJobStore } from '@/lib/mcp/jobs-prisma'

export const dynamic = 'force-dynamic'

// POST { apiKey, deviceId, jobId, result: CallToolResult } -> { ok }
export async function POST(req: NextRequest) {
  const auth = await readRelayBody(req, { needDevice: true })
  if (!auth.ok) return auth.response
  try {
    const res = await submitJobResult(prismaJobStore, auth.userId, auth.body.jobId, auth.body.result)
    if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: res.status })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('mcp result error:', err)
    return NextResponse.json({ ok: false, error: 'Interner Fehler' }, { status: 500 })
  }
}
