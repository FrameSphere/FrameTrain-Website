/**
 * Kanal-Landingpages (/reddit, /youtube, /tiktok, /instagram).
 *
 * Diese Links gehören in Bio und Videobeschreibungen, idealerweise mit UTM:
 *   frame-train.com/reddit?utm_source=reddit&utm_medium=social
 *
 * PFLEGEN: `code` ist der Gutscheincode, der beim Besuch gemerkt und bei der
 * Registrierung vorausgefüllt wird. Er muss als Promo-Code in der Datenbank
 * existieren (Tabelle promo_codes), sonst lehnt /redeem ihn ab. Solange hier
 * null steht, zeigt die Seite keinen Code an – nichts wird erfunden.
 */
export type ChannelKey = 'reddit' | 'youtube' | 'tiktok' | 'instagram'

export const CHANNELS: Record<ChannelKey, { code: string | null; backUrl: string | null }> = {
  reddit: { code: null, backUrl: 'https://www.reddit.com/r/FrameTrain/' },
  youtube: { code: null, backUrl: '/#demo' },
  tiktok: { code: null, backUrl: null },
  instagram: { code: null, backUrl: null },
}

/**
 * Offizielle Profile – eine Quelle für Footer, Schema.org-sameAs und llms.txt.
 * Reihenfolge = Reihenfolge im Footer.
 */
export const SOCIAL_PROFILES = [
  { key: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@frametrainofficial' },
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/frametrainofficial/' },
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@FrameTrain' },
  { key: 'reddit', label: 'r/FrameTrain', url: 'https://www.reddit.com/r/FrameTrain/' },
] as const

export const GITHUB_URL = 'https://github.com/FrameSphere/FrameTrain-App'

/** Für schema.org Organization.sameAs. */
export const SAME_AS = [GITHUB_URL, ...SOCIAL_PROFILES.map((p) => p.url)]
