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

async function latestFrom(repo: string, init: FetchInit): Promise<GitHubRelease | null> {
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
  // Nicht auf GitHubs "latest"-Flag verlassen: nach Datum sortieren
  return (
    releases
      .filter((r) => !r.prerelease && !r.draft)
      .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))[0] ?? null
  )
}

/**
 * Neuestes veröffentlichtes Release – erst aus FrameTrain-Releases, sonst aus
 * dem bisherigen Repo. Gibt zusätzlich zurück, aus welchem Repo es stammt.
 */
export async function fetchLatestRelease(init: FetchInit = {}): Promise<{ release: GitHubRelease; repo: string } | null> {
  const repos = Array.from(new Set([RELEASES_REPO, LEGACY_RELEASES_REPO]))
  for (const repo of repos) {
    try {
      const release = await latestFrom(repo, init)
      if (release) return { release, repo }
    } catch (err) {
      console.error(`[Releases] ${RELEASES_OWNER}/${repo} nicht abrufbar:`, err)
    }
  }
  return null
}
