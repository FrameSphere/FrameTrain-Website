/**
 * Wo die Desktop-Releases liegen.
 *
 * Ab Version 1.6.0 erscheinen Installer und latest.json im öffentlichen Repo
 * FrameSphere/FrameTrain-Releases. Alles bis v1.5.3 liegt weiter in
 * FrameSphere/FrameTrain-App (dort bleibt auch der Quellcode).
 *
 * Übergang: Solange FrameTrain-Releases noch kein veröffentlichtes Release hat
 * (leere Liste oder 404), fällt die Abfrage auf FrameTrain-App zurück. So
 * funktionieren Download, Versionsanzeige und Startseite vor und nach dem
 * Umzug ohne Code-Änderung.
 */
export const RELEASES_OWNER = process.env.GITHUB_OWNER || 'FrameSphere'
export const RELEASES_REPO = process.env.GITHUB_REPO || 'FrameTrain-Releases'
export const LEGACY_RELEASES_REPO = 'FrameTrain-App'

export const RELEASES_PAGE_URL = `https://github.com/${RELEASES_OWNER}/${RELEASES_REPO}/releases/latest`

export interface ReleaseAsset {
  name: string
  browser_download_url: string
  size: number
}

export interface GitHubRelease {
  tag_name: string
  name: string
  html_url: string
  published_at: string
  prerelease: boolean
  draft: boolean
  assets: ReleaseAsset[]
}

type FetchInit = { cache?: RequestCache; next?: { revalidate?: number | false } }

export type Platform = 'windows' | 'mac' | 'linux'

const INSTALLER_PATTERNS: Record<Platform, RegExp> = {
  windows: /\.(msi|exe)$/i,
  mac: /\.dmg$/i,
  linux: /\.AppImage$/i,
}

/** Installer für ein System – Quellcode-Archive zählen nicht. */
export function findInstaller(assets: ReleaseAsset[], platform: string): ReleaseAsset | null {
  const pattern = INSTALLER_PATTERNS[platform as Platform]
  if (!pattern) return null
  return assets.find((a) => !a.name.includes('Source code') && pattern.test(a.name)) ?? null
}

const hasAnyInstaller = (r: GitHubRelease) =>
  (Object.keys(INSTALLER_PATTERNS) as Platform[]).some((p) => findInstaller(r.assets, p))

async function latestFrom(
  repo: string,
  init: FetchInit,
  usable: (r: GitHubRelease) => boolean
): Promise<GitHubRelease | null> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const res = await fetch(`https://api.github.com/repos/${RELEASES_OWNER}/${repo}/releases?per_page=20`, {
    headers,
    ...init,
  })
  if (!res.ok) {
    console.warn(`[Releases] ${RELEASES_OWNER}/${repo}: HTTP ${res.status}`)
    return null
  }
  const releases: GitHubRelease[] = await res.json()
  // Nicht auf GitHubs "latest"-Flag verlassen: nach Datum sortieren.
  // Ein Release, dessen Installer noch gebaut und hochgeladen werden, ist
  // schon veröffentlicht, hat aber noch keine Dateien – solange zählt das
  // vorige Release, sonst gäbe es ein paar Minuten lang keinen Download.
  return (
    releases
      .filter((r) => !r.prerelease && !r.draft && usable(r))
      .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))[0] ?? null
  )
}

/**
 * Neuestes veröffentlichtes Release mit Installer – erst aus
 * FrameTrain-Releases, sonst aus dem bisherigen Repo. Mit `platform` zählt
 * nur ein Release, das für dieses System schon einen Installer hat.
 * Gibt zusätzlich zurück, aus welchem Repo es stammt.
 */
export async function fetchLatestRelease(
  init: FetchInit = {},
  platform?: Platform
): Promise<{ release: GitHubRelease; repo: string } | null> {
  const usable = platform ? (r: GitHubRelease) => !!findInstaller(r.assets, platform) : hasAnyInstaller
  const repos = Array.from(new Set([RELEASES_REPO, LEGACY_RELEASES_REPO]))
  for (const repo of repos) {
    try {
      const release = await latestFrom(repo, init, usable)
      if (release) return { release, repo }
    } catch (err) {
      console.error(`[Releases] ${RELEASES_OWNER}/${repo} nicht abrufbar:`, err)
    }
  }
  return null
}
