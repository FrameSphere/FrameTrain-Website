/**
 * Betriebssystem-Erkennung im Browser (nur clientseitig aufrufen).
 *
 * Bewusst zurückhaltend: Wir raten nur dort, wo der Browser es verlässlich
 * verrät. Ob ein Mac Apple Silicon oder Intel hat, sagt der User-Agent nicht –
 * dafür schauen wir in den WebGL-Renderer und melden "intel" NUR, wenn dort
 * eindeutig eine Intel- oder AMD-GPU steht. Safari verbirgt den Renderer
 * ("Apple GPU"), dann bleibt es bei "unknown".
 */
export type DesktopOS = 'windows' | 'mac' | 'linux'

export type PlatformInfo = {
  /** Erkanntes Desktop-System, oder null (Handy, unbekannt) */
  os: DesktopOS | null
  /** Handy oder Tablet – dort läuft FrameTrain nicht */
  mobile: boolean
  /** Nur bei os === 'mac' aussagekräftig */
  macChip: 'apple' | 'intel' | 'unknown'
}

type UAData = { platform?: string; mobile?: boolean }

function webglRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return ''
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    return String(renderer || '')
  } catch {
    return ''
  }
}

export function detectPlatform(): PlatformInfo {
  const nav = window.navigator as Navigator & { userAgentData?: UAData }
  const ua = nav.userAgent.toLowerCase()
  const hint = (nav.userAgentData?.platform || '').toLowerCase()

  // iPadOS gibt sich als Mac aus, verrät sich aber durch Touch-Punkte
  const iPadAsMac = /macintosh/.test(ua) && nav.maxTouchPoints > 1
  const mobile =
    nav.userAgentData?.mobile === true ||
    iPadAsMac ||
    /android|iphone|ipad|ipod|mobile|silk|kindle/.test(ua) ||
    hint === 'android' ||
    hint === 'ios'

  if (mobile) return { os: null, mobile: true, macChip: 'unknown' }

  let os: DesktopOS | null = null
  if (hint.includes('mac') || /macintosh|mac os x/.test(ua)) os = 'mac'
  else if (hint.includes('win') || /windows nt|win64|win32/.test(ua)) os = 'windows'
  else if (hint.includes('linux') || hint.includes('chrome os') || /linux|x11|cros/.test(ua)) os = 'linux'

  let macChip: PlatformInfo['macChip'] = 'unknown'
  if (os === 'mac') {
    const r = webglRenderer().toLowerCase()
    // "Apple GPU" allein beweist nichts: Safari maskiert so auch Intel-Macs
    if (/apple m\d/.test(r)) macChip = 'apple'
    else if (/intel|amd|radeon/.test(r)) macChip = 'intel'
  }

  return { os, mobile: false, macChip }
}
