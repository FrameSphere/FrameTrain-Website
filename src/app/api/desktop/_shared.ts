import { prisma } from '@/lib/prisma'

// Desktop-App authentifiziert sich mit ihrem API-Key (wie bei validate-credentials).
// Liefert die User-ID zu einem aktiven, nicht abgelaufenen Key, sonst null.
export async function userIdForApiKey(apiKey: unknown): Promise<string | null> {
  if (typeof apiKey !== 'string' || !apiKey.startsWith('ft_') || apiKey.length < 24) return null
  const record = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: { userId: true, isActive: true, expiresAt: true },
  })
  if (!record || !record.isActive) return null
  if (record.expiresAt && record.expiresAt < new Date()) return null
  return record.userId
}
