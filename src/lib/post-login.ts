// Ruecksprung nach dem Login (z. B. zur OAuth-Zustimmung fuer KI-Verbindungen).
// Nur relative Pfade auf dieser Website – nie fremde Hosts (Open Redirect).

export const POST_LOGIN_COOKIE = 'post_login_next'

export function safeNextPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 4000) return null
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null
  if (/[\u0000-\u001f\\]/.test(raw)) return null
  try {
    const u = new URL(raw, 'https://frame-train.invalid')
    if (u.host !== 'frame-train.invalid') return null
  } catch {
    return null
  }
  return raw
}

export const postLoginCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 15,
  path: '/',
}
