import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { DEVICE_ONLINE_MS } from './config'
import { sanitizeManifest, type ManifestTool } from './types'

const DEVICE_ID_RE = /^[A-Za-z0-9-]{8,64}$/

export function isValidDeviceId(v: unknown): v is string {
  return typeof v === 'string' && DEVICE_ID_RE.test(v)
}

function clip(v: unknown, max: number, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback
}

export function isOnline(lastSeenAt: Date, now = new Date()): boolean {
  return now.getTime() - lastSeenAt.getTime() < DEVICE_ONLINE_MS
}

/** Heartbeat: Geraet anlegen/aktualisieren; wantManifest, wenn der Hash neu ist. */
export async function recordHeartbeat(
  userId: string,
  body: { deviceId: string; deviceName?: unknown; appVersion?: unknown; manifestHash?: unknown },
) {
  const manifestHash = typeof body.manifestHash === 'string' ? body.manifestHash.slice(0, 128) : null
  const deviceName = clip(body.deviceName, 120, 'FrameTrain')
  const appVersion = clip(body.appVersion, 40, 'unknown')
  const now = new Date()

  const existing = await prisma.mcpDevice.findUnique({
    where: { userId_deviceId: { userId, deviceId: body.deviceId } },
    select: { id: true, manifestHash: true, manifest: true },
  })
  if (existing) {
    await prisma.mcpDevice.update({
      where: { id: existing.id },
      data: { deviceName, appVersion, lastSeenAt: now },
    })
  } else {
    await prisma.mcpDevice.create({
      data: { userId, deviceId: body.deviceId, deviceName, appVersion, lastSeenAt: now },
    })
  }
  const wantManifest = !existing || !existing.manifest || !manifestHash || existing.manifestHash !== manifestHash
  return { wantManifest }
}

export async function saveManifest(userId: string, deviceId: string, manifestHash: unknown, tools: unknown) {
  const clean = sanitizeManifest(tools)
  if (!clean) return { ok: false as const, error: 'tools muss ein Array sein' }
  const res = await prisma.mcpDevice.updateMany({
    where: { userId, deviceId },
    data: {
      manifest: clean as unknown as Prisma.InputJsonValue,
      manifestHash: typeof manifestHash === 'string' ? manifestHash.slice(0, 128) : null,
      lastSeenAt: new Date(),
    },
  })
  if (res.count === 0) return { ok: false as const, error: 'Unbekanntes Geraet – zuerst heartbeat senden' }
  return { ok: true as const, count: clean.length }
}

/** Interne ID (McpDevice.id) des Geraets fuer Poll/Result. */
export async function deviceRowId(userId: string, deviceId: string): Promise<string | null> {
  const d = await prisma.mcpDevice.findUnique({
    where: { userId_deviceId: { userId, deviceId } },
    select: { id: true },
  })
  return d?.id ?? null
}

export async function touchDevice(id: string) {
  await prisma.mcpDevice.update({ where: { id }, data: { lastSeenAt: new Date() } }).catch(() => {})
}

/** Zuletzt gesehenes Geraet des Nutzers (online oder nicht). */
export async function latestDevice(userId: string) {
  return prisma.mcpDevice.findFirst({
    where: { userId },
    orderBy: { lastSeenAt: 'desc' },
  })
}

export function deviceManifest(device: { manifest: Prisma.JsonValue | null } | null): ManifestTool[] | null {
  if (!device?.manifest) return null
  return sanitizeManifest(device.manifest)
}
