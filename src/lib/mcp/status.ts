import { prisma } from '@/lib/prisma'
import { isOnline } from './devices'

/** Daten fuer /api/desktop/mcp/status und das Dashboard "KI-Verbindungen". */
export async function getMcpStatus(userId: string) {
  const [connections, recentJobs, devices] = await Promise.all([
    prisma.mcpConnection.findMany({
      where: { userId, revokedAt: null },
      orderBy: [{ lastUsedAt: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, clientId: true, clientName: true, createdAt: true, lastUsedAt: true },
    }),
    prisma.mcpJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, tool: true, clientName: true, status: true, createdAt: true, completedAt: true },
    }),
    prisma.mcpDevice.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
      select: { id: true, deviceName: true, appVersion: true, lastSeenAt: true, manifest: true },
    }),
  ])
  const now = new Date()
  return {
    connections: connections.map((c) => ({
      id: c.id,
      connectionId: c.id,
      clientId: c.clientId,
      clientName: c.clientName,
      createdAt: c.createdAt.toISOString(),
      lastUsedAt: c.lastUsedAt?.toISOString() ?? null,
    })),
    recentJobs: recentJobs.map((j) => ({
      id: j.id,
      tool: j.tool,
      clientName: j.clientName,
      status: j.status,
      createdAt: j.createdAt.toISOString(),
      completedAt: j.completedAt?.toISOString() ?? null,
    })),
    devices: devices.map((d) => ({
      id: d.id,
      deviceName: d.deviceName,
      appVersion: d.appVersion,
      lastSeenAt: d.lastSeenAt.toISOString(),
      online: isOnline(d.lastSeenAt, now),
      toolCount: Array.isArray(d.manifest) ? d.manifest.length : 0,
    })),
  }
}

/** Verbindung trennen: Connection widerrufen, alle Tokens sofort ungueltig. */
export async function revokeConnection(userId: string, connectionId: unknown): Promise<boolean> {
  if (typeof connectionId !== 'string' || !connectionId) return false
  const now = new Date()
  const res = await prisma.mcpConnection.updateMany({
    where: { id: connectionId, userId, revokedAt: null },
    data: { revokedAt: now },
  })
  if (res.count === 0) return false
  await prisma.oAuthToken.updateMany({
    where: { connectionId, revokedAt: null },
    data: { revokedAt: now },
  })
  return true
}
