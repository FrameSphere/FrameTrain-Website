import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sweepScripts, recheckReason, type ReviewCandidate } from '@/lib/scriptReviewSweep'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Täglicher Cron (siehe vercel.json): prüft Open-Library-Skripte nach, die beim
// Upload keine Prüfung bekommen haben (KI-Prüfung ausgefallen) oder die eine
// inzwischen korrigierte Sperr-Regel fälschlich abgelehnt hat.
//
// Von Hand anstoßen:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://frame-train.com/api/cron/review-library-scripts
//
// Pro Lauf höchstens BATCH Skripte, damit der Lauf im Zeitlimit bleibt; der Rest
// kommt beim nächsten Lauf dran. Antwort 502, wenn die KI-Prüfung bei allen
// Skripten ausfiel – dann stimmt etwas Grundsätzliches nicht (API-Key, Modell).
const BATCH = 4

const SELECT = {
  id: true, name: true, description: true, author: true, model_type: true, task_type: true,
  framework: true, script_type: true, tags: true, script: true, verified: true,
  aiCheckedAt: true, rejectedAt: true, rejectedReason: true,
} as const

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET nicht konfiguriert' }, { status: 503 })
  }
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [unchecked, ruleRejected] = await Promise.all([
      prisma.libraryScript.findMany({
        where: { verified: false, rejectedAt: null, aiCheckedAt: null },
        orderBy: { createdAt: 'asc' }, take: BATCH, select: SELECT,
      }),
      prisma.libraryScript.findMany({
        where: { verified: false, rejectedAt: { not: null }, rejectedReason: { contains: 'Blockierte Muster' } },
        orderBy: { createdAt: 'asc' }, take: 50, select: SELECT,
      }),
    ])

    const candidates = ([...unchecked, ...ruleRejected] as ReviewCandidate[])
      .filter((s) => recheckReason(s) !== null)
    const batch = candidates.slice(0, BATCH)

    const outcomes = await sweepScripts(batch, {
      save: (id, data) => prisma.libraryScript.update({ where: { id }, data }),
    })

    const failed = outcomes.filter((o) => o.error)
    if (failed.length) {
      console.error('[cron/review-library-scripts] KI-Prüfung fehlgeschlagen:', failed.map((f) => `${f.name}: ${f.error}`).join(' | '))
    }
    const body = {
      checked: outcomes.length - failed.length,
      failed: failed.length,
      remaining: candidates.length - batch.length,
      outcomes: outcomes.map(({ id, name, why, decision, reason, error }) => ({ id, name, why, decision, reason, error })),
    }
    const allFailed = outcomes.length > 0 && failed.length === outcomes.length
    return NextResponse.json(body, { status: allFailed ? 502 : 200 })
  } catch (err) {
    console.error('[cron/review-library-scripts]', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
