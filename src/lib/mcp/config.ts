// Zentrale Konstanten fuer den Remote-MCP-Server und den OAuth-Server.
// Vertrag: docs/mcp/CONTRACT.md, Abschnitte 5 und 6.

/** Oeffentliche Basis-URL ohne trailing Slash (z. B. https://frame-train.com). */
export function siteOrigin(): string {
  const raw = process.env.MCP_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://frame-train.com'
  return raw.replace(/\/+$/, '')
}

/** OAuth-Issuer (RFC 8414). Muss exakt in authorization_servers stehen. */
export function issuer(): string {
  return siteOrigin()
}

/** Kanonische Ressource = MCP-Endpunkt, so wie der Nutzer ihn eingibt. */
export function resourceUrl(): string {
  return `${siteOrigin()}/api/mcp`
}

export function protectedResourceMetadataUrl(): string {
  return `${siteOrigin()}/.well-known/oauth-protected-resource`
}

export const MCP_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'] as const
export const LATEST_PROTOCOL_VERSION = MCP_PROTOCOL_VERSIONS[0]

export const SCOPE = 'frametrain'
export const SCOPES_SUPPORTED = [SCOPE, 'offline_access']

export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 h
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 Tage
export const AUTH_CODE_TTL_MS = 10 * 60 * 1000 // 10 min

export const DEVICE_ONLINE_MS = 90 * 1000 // lastSeen < 90 s = online
export const JOB_PICKUP_TIMEOUT_MS = 2 * 60 * 1000 // nicht abgeholt nach 2 min = expired
export const TOOL_CALL_WAIT_MS = 50 * 1000 // tools/call wartet bis 50 s
export const TOOL_CALL_POLL_MS = 500
export const RELAY_LONG_POLL_MS = 25 * 1000 // /poll haelt bis 25 s
export const RELAY_POLL_INTERVAL_MS = 1000

export const SERVER_INFO = { name: 'frametrain', title: 'FrameTrain', version: '1.0.0' }

export const OFFLINE_TEXT =
  'Die FrameTrain-App ist nicht geoeffnet oder Fernzugriff ist aus. Bitte FrameTrain starten ' +
  '(Einstellungen > KI-Verbindungen > Fernzugriff). / The FrameTrain app is not running or remote ' +
  'access is off. Please start FrameTrain (Settings > AI Connections > Remote access).'

export const TIMEOUT_TEXT =
  'FrameTrain hat nicht innerhalb von 50 Sekunden geantwortet. Die Aktion kann in der App noch laufen ' +
  '(z. B. wartet ein Freigabe-Dialog). Pruefe den Stand mit dem passenden *_status-Werkzeug. / ' +
  'FrameTrain did not answer within 50 seconds. The action may still be running in the app (for example ' +
  'waiting for approval). Check progress with the matching *_status tool.'

export const SUBSCRIPTION_TEXT =
  'Dein FrameTrain-Konto hat kein aktives Abo. Bitte unter https://frame-train.com/dashboard eine Lizenz ' +
  'abschliessen. / Your FrameTrain account has no active subscription. Please get a license at ' +
  'https://frame-train.com/dashboard.'
