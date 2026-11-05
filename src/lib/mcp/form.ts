/** Liest form-urlencoded (RFC 6749) und – tolerant – JSON-Bodies. */
export async function readFormOrJson(req: Request): Promise<Record<string, string>> {
  const type = (req.headers.get('content-type') || '').toLowerCase()
  const text = await req.text()
  if (type.includes('application/json')) {
    try {
      const obj = JSON.parse(text)
      const out: Record<string, string> = {}
      if (obj && typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) if (typeof v === 'string') out[k] = v
      }
      return out
    } catch {
      return {}
    }
  }
  return Object.fromEntries(new URLSearchParams(text))
}
