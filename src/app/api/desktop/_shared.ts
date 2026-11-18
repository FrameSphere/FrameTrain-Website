import { prisma } from '@/lib/prisma'

// Desktop-App authentifiziert sich mit ihrem API-Key (wie bei validate-credentials).
// Liefert Konto und (bei FrameTrain Business) den Platz zu einem aktiven,
// nicht abgelaufenen Key, sonst null.
export async function accountForApiKey(apiKey: unknown): Promise<{ userId: string; seatId: string | null } | null> {
  if (typeof apiKey !== 'string' || !apiKey.startsWith('ft_') || apiKey.length < 24) return null
  const record = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: { userId: true, isActive: true, expiresAt: true, seat: { select: { id: true } } },
  })
  if (!record || !record.isActive) return null
  if (record.expiresAt && record.expiresAt < new Date()) return null
  return { userId: record.userId, seatId: record.seat?.id ?? null }
}

// User-ID nur fuer eigene Schluessel des Kontos. Schluessel von Business-Plaetzen
// gehoeren technisch zum Konto des Inhabers, duerfen aber nicht in seinem Namen
// handeln (KI-Fernverbindungen, Support-Verlauf, Einwilligungen) — deshalb null.
export async function userIdForApiKey(apiKey: unknown): Promise<string | null> {
  const account = await accountForApiKey(apiKey)
  return account && !account.seatId ? account.userId : null
}
