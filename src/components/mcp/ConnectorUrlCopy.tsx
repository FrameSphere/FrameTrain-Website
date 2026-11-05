'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Copy } from 'lucide-react'

export const CONNECTOR_URL = `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://frame-train.com').replace(/\/+$/, '')}/api/mcp`

/** Connector-URL mit Kopieren-Button (Dashboard "KI-Verbindungen" und Doku /docs/mcp). */
export function ConnectorUrlCopy({ value = CONNECTOR_URL }: { value?: string }) {
  const t = useTranslations('AiConnections.guide')
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-stretch gap-2">
      <code className="flex-1 min-w-0 px-4 py-3 bg-ghost-fill border border-line rounded-md text-ink text-sm font-mono break-all">
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {}
        }}
        className="press flex items-center gap-2 px-4 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge rounded-md font-semibold text-sm"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? t('copied') : t('copy')}</span>
      </button>
    </div>
  )
}
