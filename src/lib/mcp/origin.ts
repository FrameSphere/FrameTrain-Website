import { siteOrigin } from './config'

// Origin-Pruefung fuer /api/mcp (MCP Streamable HTTP: Schutz vor DNS-Rebinding
// und Aufrufen aus fremden Webseiten). Server-zu-Server-Aufrufe von Claude und
// ChatGPT senden keinen Origin-Header und sind immer erlaubt.
const ALLOWED_HOSTS = new Set(['claude.ai', 'claude.com', 'chatgpt.com', 'chat.openai.com'])
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

function extraOrigins(): string[] {
  return (process.env.MCP_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (origin === null || origin === '') return true
  let u: URL
  try {
    u = new URL(origin)
  } catch {
    return false // u. a. "null" aus Sandbox-iframes
  }
  const normalized = u.origin
  if (normalized === siteOrigin() || extraOrigins().includes(normalized)) return true
  const host = u.hostname.toLowerCase()
  // MCP Inspector und lokale Entwicklung
  if ((u.protocol === 'http:' || u.protocol === 'https:') && LOOPBACK_HOSTS.has(host)) return true
  return u.protocol === 'https:' && ALLOWED_HOSTS.has(host)
}
