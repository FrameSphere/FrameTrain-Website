// Job-Lebenszyklus fuer das Relay (Vertrag Abschnitte 5/6):
//   queued --poll--> delivered --result--> done
//   queued/delivered --Timeout/2 min nicht abgeholt--> expired
// Die Logik haengt nur an JobStore, damit sie ohne Datenbank testbar ist.

import { sanitizeCallToolResult, textResult, type CallToolResult } from './types'
import {
  JOB_PICKUP_TIMEOUT_MS,
  RELAY_LONG_POLL_MS,
  RELAY_POLL_INTERVAL_MS,
  TIMEOUT_TEXT,
  TOOL_CALL_POLL_MS,
  TOOL_CALL_WAIT_MS,
} from './config'

export type JobStatus = 'queued' | 'delivered' | 'done' | 'expired'

export interface JobRecord {
  id: string
  userId: string
  deviceId: string | null
  connectionId: string | null
  clientName: string
  tool: string
  args: Record<string, unknown>
  status: JobStatus
  result: CallToolResult | null
  createdAt: Date
  deliveredAt: Date | null
  completedAt: Date | null
}

export interface NewJob {
  userId: string
  deviceId: string | null
  connectionId: string | null
  clientName: string
  tool: string
  args: Record<string, unknown>
}

export interface JobStore {
  create(job: NewJob, now: Date): Promise<JobRecord>
  get(id: string): Promise<JobRecord | null>
  /** Atomar: wartende Jobs des Nutzers fuer dieses Geraet auf delivered setzen und zurueckgeben. */
  claimQueued(userId: string, deviceId: string, createdAfter: Date, now: Date, limit: number): Promise<JobRecord[]>
  /** Nur queued/delivered -> done. false, wenn Job fehlt, fremd oder schon abgeschlossen. */
  complete(id: string, userId: string, result: CallToolResult, now: Date): Promise<boolean>
  /** Nur queued/delivered -> expired. */
  expire(id: string, now: Date): Promise<boolean>
  /** Alle queued-Jobs des Nutzers aelter als cutoff -> expired. */
  expireStale(userId: string, cutoff: Date, now: Date): Promise<number>
}

export interface Clock {
  now(): Date
  sleep(ms: number): Promise<void>
}

export const realClock: Clock = {
  now: () => new Date(),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
}

export interface RelayJob {
  id: string
  tool: string
  args: Record<string, unknown>
  client: { name: string }
  createdAt: string
}

export function toRelayJob(job: JobRecord): RelayJob {
  return {
    id: job.id,
    tool: job.tool,
    args: job.args,
    client: { name: job.clientName },
    createdAt: job.createdAt.toISOString(),
  }
}

/**
 * Long-Poll der Desktop-App: liefert sofort, sobald Jobs da sind, sonst nach
 * spaetestens timeoutMs eine leere Liste. Abbruch ueber signal (Client weg).
 */
export async function longPollJobs(
  store: JobStore,
  userId: string,
  deviceId: string,
  opts: { timeoutMs?: number; intervalMs?: number; clock?: Clock; signal?: AbortSignal; limit?: number } = {},
): Promise<JobRecord[]> {
  const clock = opts.clock ?? realClock
  const timeoutMs = opts.timeoutMs ?? RELAY_LONG_POLL_MS
  const intervalMs = opts.intervalMs ?? RELAY_POLL_INTERVAL_MS
  const start = clock.now().getTime()

  await store.expireStale(userId, new Date(start - JOB_PICKUP_TIMEOUT_MS), clock.now())

  for (;;) {
    const now = clock.now()
    const jobs = await store.claimQueued(
      userId,
      deviceId,
      new Date(now.getTime() - JOB_PICKUP_TIMEOUT_MS),
      now,
      opts.limit ?? 10,
    )
    if (jobs.length > 0) return jobs
    if (opts.signal?.aborted) return []
    if (clock.now().getTime() - start + intervalMs > timeoutMs) return []
    await clock.sleep(intervalMs)
  }
}

export type WaitOutcome = { status: 'done'; result: CallToolResult } | { status: 'timeout' }

/** tools/call: wartet bis zum Ergebnis oder Timeout; bei Timeout wird der Job expired. */
export async function waitForJobResult(
  store: JobStore,
  jobId: string,
  opts: { timeoutMs?: number; intervalMs?: number; clock?: Clock; signal?: AbortSignal } = {},
): Promise<WaitOutcome> {
  const clock = opts.clock ?? realClock
  const timeoutMs = opts.timeoutMs ?? TOOL_CALL_WAIT_MS
  const intervalMs = opts.intervalMs ?? TOOL_CALL_POLL_MS
  const start = clock.now().getTime()

  for (;;) {
    const job = await store.get(jobId)
    if (job?.status === 'done' && job.result) return { status: 'done', result: job.result }
    if (!job || job.status === 'expired') return { status: 'timeout' }
    if (opts.signal?.aborted || clock.now().getTime() - start + intervalMs > timeoutMs) {
      await store.expire(jobId, clock.now())
      // Kann genau zwischen get und expire fertig geworden sein.
      const last = await store.get(jobId)
      if (last?.status === 'done' && last.result) return { status: 'done', result: last.result }
      return { status: 'timeout' }
    }
    await clock.sleep(intervalMs)
  }
}

export function timeoutResult(): CallToolResult {
  return textResult(TIMEOUT_TEXT, true)
}

/** Ergebnis der App annehmen (Route /result). */
export async function submitJobResult(
  store: JobStore,
  userId: string,
  jobId: unknown,
  rawResult: unknown,
  now: Date = new Date(),
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (typeof jobId !== 'string' || !jobId) return { ok: false, error: 'jobId fehlt', status: 400 }
  const result = sanitizeCallToolResult(rawResult)
  if (!result) return { ok: false, error: 'result ist kein gueltiges CallToolResult', status: 400 }
  const ok = await store.complete(jobId, userId, result, now)
  if (!ok) return { ok: false, error: 'Job unbekannt oder bereits abgeschlossen', status: 409 }
  return { ok: true }
}

// ── In-Memory-Store (Tests, lokale Entwicklung ohne DB) ─────────────────────

export class MemoryJobStore implements JobStore {
  jobs = new Map<string, JobRecord>()
  private seq = 0

  async create(job: NewJob, now: Date): Promise<JobRecord> {
    const rec: JobRecord = {
      ...job,
      id: `job_${++this.seq}`,
      status: 'queued',
      result: null,
      createdAt: now,
      deliveredAt: null,
      completedAt: null,
    }
    this.jobs.set(rec.id, rec)
    return { ...rec }
  }

  async get(id: string) {
    const j = this.jobs.get(id)
    return j ? { ...j } : null
  }

  async claimQueued(userId: string, deviceId: string, createdAfter: Date, now: Date, limit: number) {
    const out: JobRecord[] = []
    for (const j of this.jobs.values()) {
      if (out.length >= limit) break
      if (j.userId !== userId || j.status !== 'queued') continue
      if (j.deviceId && j.deviceId !== deviceId) continue
      if (j.createdAt <= createdAfter) continue
      j.status = 'delivered'
      j.deliveredAt = now
      j.deviceId = deviceId
      out.push({ ...j })
    }
    return out
  }

  async complete(id: string, userId: string, result: CallToolResult, now: Date) {
    const j = this.jobs.get(id)
    if (!j || j.userId !== userId || (j.status !== 'queued' && j.status !== 'delivered')) return false
    j.status = 'done'
    j.result = result
    j.completedAt = now
    return true
  }

  async expire(id: string, now: Date) {
    const j = this.jobs.get(id)
    if (!j || (j.status !== 'queued' && j.status !== 'delivered')) return false
    j.status = 'expired'
    j.completedAt = now
    return true
  }

  async expireStale(userId: string, cutoff: Date, now: Date) {
    let n = 0
    for (const j of this.jobs.values()) {
      if (j.userId === userId && j.status === 'queued' && j.createdAt < cutoff) {
        j.status = 'expired'
        j.completedAt = now
        n++
      }
    }
    return n
  }
}
