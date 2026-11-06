import type { ManifestTool } from './types'

// Statisches Manifest, solange noch nie ein Geraet des Nutzers gesehen wurde.
export const FALLBACK_TOOLS: ManifestTool[] = [
  {
    name: 'system_status',
    title: 'FrameTrain status',
    description:
      'Explains how to connect the FrameTrain desktop app. Relevant when no other FrameTrain tools are ' +
      'available: it returns setup steps (install the app, sign in, enable remote access). FrameTrain runs ' +
      'training and data locally on the user\'s computer, so the app must be running.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
]

export const FALLBACK_STATUS_TEXT = [
  'FrameTrain is not connected yet. FrameTrain runs model training and datasets locally on your computer;',
  'this connector forwards requests to the desktop app.',
  '',
  'Setup:',
  '1. Download and install FrameTrain: https://frame-train.com/download',
  '2. Open the app and sign in with the same account you used for this connection.',
  '3. In the app go to Settings > AI Connections and turn on "Remote access via frame-train.com".',
  '4. Keep the app open. Reconnect or refresh the tool list here; the full FrameTrain tools appear automatically.',
  '',
  'Deutsch: FrameTrain installieren (https://frame-train.com/download), anmelden und unter',
  'Einstellungen > KI-Verbindungen den Fernzugriff einschalten. Die App muss geoeffnet bleiben.',
].join('\n')
