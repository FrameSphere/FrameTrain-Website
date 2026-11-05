// Typen laut Vertrag Abschnitt 1 (Werkzeug-Manifest, CallToolResult).

export interface ToolAnnotations {
  title?: string
  readOnlyHint?: boolean
  destructiveHint?: boolean
  idempotentHint?: boolean
  openWorldHint?: boolean
}

export interface ManifestTool {
  name: string
  title?: string
  description?: string
  inputSchema: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  annotations?: ToolAnnotations
  _meta?: Record<string, unknown>
}

export interface ContentBlock {
  type: string
  text?: string
  [key: string]: unknown
}

export interface CallToolResult {
  content: ContentBlock[]
  structuredContent?: Record<string, unknown>
  isError?: boolean
}

export function textResult(text: string, isError = false): CallToolResult {
  return isError ? { content: [{ type: 'text', text }], isError: true } : { content: [{ type: 'text', text }] }
}

/** Prueft und saeubert ein CallToolResult aus der Desktop-App. */
export function sanitizeCallToolResult(raw: unknown): CallToolResult | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.content)) return null
  const content = r.content.filter(
    (c): c is ContentBlock => !!c && typeof c === 'object' && typeof (c as ContentBlock).type === 'string',
  )
  const out: CallToolResult = { content }
  if (r.structuredContent && typeof r.structuredContent === 'object' && !Array.isArray(r.structuredContent)) {
    out.structuredContent = r.structuredContent as Record<string, unknown>
  }
  if (r.isError === true) out.isError = true
  return out
}

const TOOL_NAME_RE = /^[a-z][a-z0-9_]{0,63}$/

/** Prueft ein Manifest der App; ungueltige Eintraege werden verworfen. */
export function sanitizeManifest(raw: unknown, maxTools = 500): ManifestTool[] | null {
  if (!Array.isArray(raw)) return null
  const seen = new Set<string>()
  const tools: ManifestTool[] = []
  for (const t of raw.slice(0, maxTools)) {
    if (!t || typeof t !== 'object') continue
    const tool = t as ManifestTool
    if (typeof tool.name !== 'string' || !TOOL_NAME_RE.test(tool.name) || seen.has(tool.name)) continue
    if (!tool.inputSchema || typeof tool.inputSchema !== 'object') continue
    seen.add(tool.name)
    tools.push(tool)
  }
  return tools
}

/** Lesbarer Titel aus dem Werkzeugnamen, falls die App keinen liefert: models_list -> "Models list". */
export function titleFromName(name: string): string {
  const words = name.split('_').filter(Boolean).join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Annotations fuer die Verzeichnisse (Anthropic: title + readOnlyHint/destructiveHint,
 * OpenAI zusaetzlich openWorldHint) immer explizit ausliefern. Fehlende Werte bekommen
 * die sicheren MCP-Standardwerte (nicht nur lesend, destruktiv, offene Welt);
 * frametrain/approval = "always" erzwingt destructiveHint = true.
 */
export function normalizeAnnotations(tool: ManifestTool): Required<Pick<ToolAnnotations, 'readOnlyHint' | 'destructiveHint' | 'openWorldHint'>> & ToolAnnotations {
  const a = tool.annotations ?? {}
  const approval = tool._meta?.['frametrain/approval']
  const always = approval === 'always'
  const readOnlyHint = always ? false : a.readOnlyHint === true
  const destructiveHint = always ? true : readOnlyHint ? false : a.destructiveHint !== false
  const openWorldHint = a.openWorldHint !== false
  const out: ToolAnnotations & { readOnlyHint: boolean; destructiveHint: boolean; openWorldHint: boolean } = {
    ...a,
    readOnlyHint,
    destructiveHint,
    openWorldHint,
  }
  if (typeof a.idempotentHint === 'boolean') out.idempotentHint = a.idempotentHint
  return out
}

/** Fuer tools/list: _meta entfernen, title + annotations immer vollstaendig (Vertrag Abschnitt 6). */
export function publicTool(tool: ManifestTool): Omit<ManifestTool, '_meta'> {
  const title = typeof tool.title === 'string' && tool.title.trim() ? tool.title : titleFromName(tool.name)
  const annotations = normalizeAnnotations(tool)
  const out: Omit<ManifestTool, '_meta'> = { name: tool.name, title, inputSchema: tool.inputSchema }
  if (tool.description) out.description = tool.description
  if (tool.outputSchema) out.outputSchema = tool.outputSchema
  out.annotations = { ...annotations, title: annotations.title ?? title }
  return out
}
