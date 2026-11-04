import crypto from 'crypto'

/** Zufaelliges, URL-sicheres Geheimnis mit Praefix (z. B. ftat_…). */
export function randomSecret(prefix: string, bytes = 32): string {
  return `${prefix}${crypto.randomBytes(bytes).toString('base64url')}`
}

/** SHA-256 hex – so werden Tokens und Codes gespeichert, nie im Klartext. */
export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

/** RFC 7636: code_verifier = 43–128 Zeichen aus [A-Z a-z 0-9 - . _ ~]. */
export function isValidCodeVerifier(verifier: unknown): verifier is string {
  return typeof verifier === 'string' && /^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)
}

/** S256-Challenge ist base64url(SHA-256(verifier)) ohne Padding = 43 Zeichen. */
export function isValidCodeChallenge(challenge: unknown): challenge is string {
  return typeof challenge === 'string' && /^[A-Za-z0-9\-_]{43}$/.test(challenge)
}

export function s256Challenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

/** PKCE-Pruefung (nur S256, plain ist nicht erlaubt). */
export function verifyPkceS256(verifier: unknown, challenge: string): boolean {
  if (!isValidCodeVerifier(verifier)) return false
  return timingSafeEqualStr(s256Challenge(verifier), challenge)
}
