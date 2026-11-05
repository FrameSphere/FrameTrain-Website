import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { CallToolResult } from './types'
import type { JobRecord, JobStatus, JobStore, NewJob } from './jobs'

type Row = {
  id: string
  userId: string
  deviceId: string | null
  connectionId: string | null
  clientName: string
  tool: string
  args: Prisma.JsonValue
  status: string
  result: Prisma.JsonValue | null
  createdAt: Date
  deliveredAt: Date | null
  completedAt: Date | null
}

function toRecord(r: Row): JobRecord {
  return {
    ...r,
    args: (r.args && typeof r.args === 'object' && !Array.isArray(r.args) ? r.args : {}) as Record<string, unknown>,
    status: r.status as JobStatus,
    result: (r.result ?? null) as CallToolResult | null,
  }
}

export const prismaJobStore: JobStore = {
  async create(job: NewJob, now: Date) {
    const row = await prisma.mcpJob.create({
      data: { ...job, args: job.args as Prisma.InputJsonValue, createdAt: now },
    })
    return toRecord(row)
  },

  async get(id: string) {
    const row = await prisma.mcpJob.findUnique({ where: { id } })
    return row ? toRecord(row) : null
  },

  // UPDATE … RETURNING mit SKIP LOCKED: zwei gleichzeitige Polls bekommen nie denselben Job.
  async claimQueued(userId, deviceId, createdAfter, now, limit) {
    const rows = await prisma.$queryRaw<Row[]>`
      UPDATE "mcp_jobs" SET "status" = 'delivered', "delivered_at" = ${now}, "device_id" = ${deviceId}
      WHERE "id" IN (
        SELECT "id" FROM "mcp_jobs"
        WHERE "user_id" = ${userId} AND "status" = 'queued'
          AND ("device_id" IS NULL OR "device_id" = ${deviceId})
          AND "created_at" > ${createdAfter}
        ORDER BY "created_at" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id", "user_id" AS "userId", "device_id" AS "deviceId", "connection_id" AS "connectionId",
        "client_name" AS "clientName", "tool", "args", "status", "result",
        "created_at" AS "createdAt", "delivered_at" AS "deliveredAt", "completed_at" AS "completedAt"`
    return rows.map(toRecord).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  },

  async complete(id, userId, result, now) {
    const res = await prisma.mcpJob.updateMany({
      where: { id, userId, status: { in: ['queued', 'delivered'] } },
      data: { status: 'done', result: result as unknown as Prisma.InputJsonValue, completedAt: now },
    })
    return res.count === 1
  },

  async expire(id, now) {
    const res = await prisma.mcpJob.updateMany({
      where: { id, status: { in: ['queued', 'delivered'] } },
      data: { status: 'expired', completedAt: now },
    })
    return res.count === 1
  },

  async expireStale(userId, cutoff, now) {
    const res = await prisma.mcpJob.updateMany({
      where: { userId, status: 'queued', createdAt: { lt: cutoff } },
      data: { status: 'expired', completedAt: now },
    })
    return res.count
  },
}
