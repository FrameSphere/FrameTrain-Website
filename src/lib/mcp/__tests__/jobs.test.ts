import { describe, expect, it } from 'vitest'
import { longPollJobs, MemoryJobStore, submitJobResult, toRelayJob, waitForJobResult, type Clock } from '../jobs'

/** Virtuelle Uhr: sleep laesst die Zeit springen und fuehrt Hooks aus. */
function fakeClock(start = new Date('2026-11-04T10:00:00Z')) {
  let t = start.getTime()
  const hooks: { at: number; fn: () => Promise<void> | void }[] = []
  const clock: Clock & { at(ms: number, fn: () => Promise<void> | void): void; advance(ms: number): void } = {
    now: () => new Date(t),
    async sleep(ms) {
      t += ms
      for (const h of hooks.filter((h) => h.at <= t)) {
        hooks.splice(hooks.indexOf(h), 1)
        await h.fn()
      }
    },
    at(ms, fn) {
      hooks.push({ at: start.getTime() + ms, fn })
    },
    advance(ms) {
      t += ms
    },
  }
  return clock
}

const newJob = { userId: 'u1', deviceId: 'dev1', connectionId: 'conn1', clientName: 'Claude', tool: 'models_list', args: { limit: 3 } }
const ok = { content: [{ type: 'text', text: '3 models' }], structuredContent: { models: [] } }

describe('job lifecycle', () => {
  it('queued -> delivered -> done, and tools/call receives the result', async () => {
    const store = new MemoryJobStore()
    const clock = fakeClock()
    const job = await store.create(newJob, clock.now())
    expect(job.status).toBe('queued')

    // Die App holt den Job nach 1 s und liefert nach 3 s das Ergebnis.
    clock.at(1000, async () => {
      const claimed = await longPollJobs(store, 'u1', 'dev1', { clock, timeoutMs: 0 })
      expect(claimed.map(toRelayJob)).toEqual([
        { id: job.id, tool: 'models_list', args: { limit: 3 }, client: { name: 'Claude' }, createdAt: job.createdAt.toISOString() },
      ])
      expect((await store.get(job.id))?.status).toBe('delivered')
    })
    clock.at(3000, async () => {
      expect(await submitJobResult(store, 'u1', job.id, ok, clock.now())).toEqual({ ok: true })
    })

    const outcome = await waitForJobResult(store, job.id, { clock, timeoutMs: 50_000, intervalMs: 500 })
    expect(outcome).toEqual({ status: 'done', result: ok })
    expect((await store.get(job.id))?.status).toBe('done')
  })

  it('expires the job when the app does not answer within the wait time', async () => {
    const store = new MemoryJobStore()
    const clock = fakeClock()
    const job = await store.create(newJob, clock.now())
    const outcome = await waitForJobResult(store, job.id, { clock, timeoutMs: 50_000, intervalMs: 500 })
    expect(outcome).toEqual({ status: 'timeout' })
    expect((await store.get(job.id))?.status).toBe('expired')
    // Ein spaetes Ergebnis wird abgelehnt.
    expect(await submitJobResult(store, 'u1', job.id, ok, clock.now())).toMatchObject({ ok: false, status: 409 })
  })

  it('a late poll does not deliver jobs older than 2 minutes', async () => {
    const store = new MemoryJobStore()
    const clock = fakeClock()
    const job = await store.create(newJob, clock.now())
    clock.advance(2 * 60 * 1000 + 1)
    const claimed = await longPollJobs(store, 'u1', 'dev1', { clock, timeoutMs: 0 })
    expect(claimed).toEqual([])
    expect((await store.get(job.id))?.status).toBe('expired')
  })

  it('long-poll returns empty after the timeout and picks up jobs created meanwhile', async () => {
    const store = new MemoryJobStore()
    const clock = fakeClock()
    expect(await longPollJobs(store, 'u1', 'dev1', { clock, timeoutMs: 25_000, intervalMs: 1000 })).toEqual([])

    const clock2 = fakeClock()
    clock2.at(5000, async () => {
      await store.create(newJob, clock2.now())
    })
    const jobs = await longPollJobs(store, 'u1', 'dev1', { clock: clock2, timeoutMs: 25_000, intervalMs: 1000 })
    expect(jobs).toHaveLength(1)
  })

  it('never hands jobs to another user or another device', async () => {
    const store = new MemoryJobStore()
    const clock = fakeClock()
    await store.create(newJob, clock.now())
    expect(await longPollJobs(store, 'u2', 'dev1', { clock, timeoutMs: 0 })).toEqual([])
    expect(await longPollJobs(store, 'u1', 'dev2', { clock, timeoutMs: 0 })).toEqual([])
    expect(await longPollJobs(store, 'u1', 'dev1', { clock, timeoutMs: 0 })).toHaveLength(1)
    // Zweiter Poll bekommt denselben Job nicht noch einmal.
    expect(await longPollJobs(store, 'u1', 'dev1', { clock, timeoutMs: 0 })).toEqual([])
  })

  it('rejects results from another user and invalid result shapes', async () => {
    const store = new MemoryJobStore()
    const clock = fakeClock()
    const job = await store.create(newJob, clock.now())
    expect(await submitJobResult(store, 'u2', job.id, ok)).toMatchObject({ ok: false, status: 409 })
    expect(await submitJobResult(store, 'u1', job.id, { text: 'no content array' })).toMatchObject({ ok: false, status: 400 })
    expect(await submitJobResult(store, 'u1', undefined, ok)).toMatchObject({ ok: false, status: 400 })
  })
})
