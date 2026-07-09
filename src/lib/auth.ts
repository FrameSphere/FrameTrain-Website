import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

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
