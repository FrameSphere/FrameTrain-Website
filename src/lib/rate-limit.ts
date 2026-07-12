// Einfacher In-Memory-Rate-Limiter (Fixed Window).
//
// Schützt sensible Endpunkte (z. B. Promo-Code-Prüfung) vor Brute-Force.
// Funktioniert pro Server-Prozess — bei horizontalem Scaling (mehrere
// Instanzen) sollte stattdessen ein zentraler Store (Redis) verwendet
// werden. Für ein Single-Instance-Deployment ist das hier ausreichend.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Speicher begrenzen: abgelaufene Buckets regelmäßig aufräumen
const MAX_BUCKETS = 10_000

function cleanup(now: number) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  retryAfterSeconds: number
}

/**
 * Zählt einen Versuch für `key` und prüft, ob das Limit im Zeitfenster
 * überschritten wurde.
 *
 * @param key      Eindeutiger Schlüssel, z. B. `promo:user:<userId>`
 * @param limit    Max. Versuche pro Fenster
 * @param windowMs Fensterlänge in Millisekunden
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  cleanup(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  bucket.count++
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfterSeconds: 0 }
}

/** Client-IP aus Proxy-Headern ermitteln (best effort, nur fürs Rate-Limiting) */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
