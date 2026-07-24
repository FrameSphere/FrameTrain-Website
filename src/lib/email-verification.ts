import crypto from 'crypto'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24h

export interface VerificationToken {
  token: string // Klartext – landet im Link der Mail, wird nie gespeichert
  tokenHash: string // SHA-256-Hash – wird in der DB abgelegt
  expiresAt: Date
}

// Hohe Entropie (32 zufällige Bytes) macht den Hash brute-force-resistent
// auch ohne Salt – anders als bei Passwörtern, wo Nutzer schwache Werte wählen.
export function generateVerificationToken(): VerificationToken {
  const token = crypto.randomBytes(32).toString('hex')
  return {
    token,
    tokenHash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  }
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
