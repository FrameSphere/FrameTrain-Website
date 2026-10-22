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
