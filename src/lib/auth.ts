import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// KEIN Fallback-Secret: Ein hartcodierter Default wäre ein kritisches
// Sicherheitsrisiko (jeder, der den Quellcode kennt, könnte gültige
// Auth-Tokens fälschen, falls JWT_SECRET in der Deployment-Umgebung
// fehlt). Lieber beim Start hart fehlschlagen als leise unsicher laufen.
const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET ist nicht gesetzt. Bitte in den Umgebungsvariablen konfigurieren.')
}

export interface JWTPayload {
  userId: string
  email: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

/**
 * Löst einen User über einen Desktop-API-Key (Format `ft_…`) auf.
 * Gleiche Logik wie /api/keys/verify: Plaintext-Lookup + isActive-Check.
 */
export async function getUserFromApiKey(key: string): Promise<JWTPayload | null> {
  if (!key || !key.startsWith('ft_') || key.length < 24) return null

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: { select: { id: true, email: true } } },
  })

  if (!apiKey || !apiKey.isActive || !apiKey.user) return null

  // last-used aktualisieren, aber den Request nicht blockieren
  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {})

  return { userId: apiKey.user.id, email: apiKey.user.email }
}

/**
 * Authentifiziert einen Request entweder über den `Authorization: Bearer ft_…`
 * Header (Desktop-App, cross-origin ohne Cookie) oder das `auth-token`-Cookie
 * (Web-Browser). So funktioniert derselbe Endpoint für beide Clients.
 */
export async function getRequestUser(req: Request): Promise<JWTPayload | null> {
  const authz = req.headers.get('authorization')
  if (authz?.startsWith('Bearer ')) {
    const user = await getUserFromApiKey(authz.slice(7).trim())
    if (user) return user
  }
  return getCurrentUser()
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}
