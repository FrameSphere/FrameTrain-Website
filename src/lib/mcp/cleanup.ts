import { prisma } from '@/lib/prisma'

/** Entfernt abgelaufene Codes, Tokens und alte Jobs. Idempotent, billig. */
export async function cleanupOAuthData(now = new Date()) {
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  await prisma.oAuthAuthCode.deleteMany({ where: { expiresAt: { lt: dayAgo } } })
  await prisma.oAuthToken.deleteMany({ where: { refreshExpiresAt: { lt: dayAgo } } })
  await prisma.oAuthToken.deleteMany({ where: { revokedAt: { lt: dayAgo } } })
  await prisma.mcpJob.deleteMany({ where: { createdAt: { lt: monthAgo } } })
}
