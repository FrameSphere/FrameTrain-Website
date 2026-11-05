import { NextRequest, NextResponse } from 'next/server'
import { readRelayBody } from '../_relay'
import { deviceRowId, touchDevice } from '@/lib/mcp/devices'
import { longPollJobs, toRelayJob } from '@/lib/mcp/jobs'
import { prismaJobStore } from '@/lib/mcp/jobs-prisma'

export const dynamic = 'force-dynamic'
// Long-Poll haelt bis 25 s; etwas Luft fuer DB-Zugriffe.
export const maxDuration = 35

// POST { apiKey, deviceId } -> { jobs: [{ id, tool, args, client: { name }, createdAt }] }
export async function POST(req: NextRequest) {
  const auth = await readRelayBody(req, { needDevice: true })
  if (!auth.ok) return auth.response
  try {
    const rowId = await deviceRowId(auth.userId, auth.deviceId)
    if (!rowId) {
      return NextResponse.json({ jobs: [], error: 'Unbekanntes Geraet – zuerst heartbeat senden' }, { status: 409 })
    }
    // Ein laufender Poll zaehlt als Lebenszeichen (Geraet bleibt online).
    await touchDevice(rowId)
    const jobs = await longPollJobs(prismaJobStore, auth.userId, rowId, { signal: req.signal })
    if (jobs.length > 0) await touchDevice(rowId)
    return NextResponse.json({ jobs: jobs.map(toRelayJob) })
  } catch (err) {
    console.error('mcp poll error:', err)
    return NextResponse.json({ jobs: [], error: 'Interner Fehler' }, { status: 500 })
  }
}
