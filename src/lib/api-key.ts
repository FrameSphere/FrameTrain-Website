import crypto from 'crypto'

export function generateApiKey(): string {
  return 'ft_' + crypto.randomBytes(32).toString('hex')
}

export function hashApiKey(key: string): string {
  const salt = process.env.API_KEY_SALT
  if (!salt) {
    // Kein Fallback-Salt: ein hartcodierter Default würde die Hashes
    // wertlos machen, sobald der Quellcode bekannt ist.
    throw new Error('API_KEY_SALT ist nicht gesetzt. Bitte in den Umgebungsvariablen konfigurieren.')
  }
  return crypto
    .createHash('sha256')
    .update(key + salt)
    .digest('hex')
}

export function validateApiKeyFormat(key: string): boolean {
  return /^ft_[a-f0-9]{64}$/.test(key)
}
