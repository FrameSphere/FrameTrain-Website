// Zentrale Quelle für die Tutorial-Videos (YouTube).
//
// Alle Oberflächen (Homepage, Download-Seite, FAQ, Verifikations-Mail)
// verweisen auf diese IDs – so wird eine URL nur an EINER Stelle gepflegt und
// die Surfaces laufen nicht auseinander. Beim Tausch eines Videos genügt hier
// die neue ID.

export const VIDEOS = {
  // "How to install FrameTrain"
  install: 'kIgUvcrQbJA',
  // "How to train your first model"
  train: 'WkU9r3TiF74',
} as const

export type VideoKey = keyof typeof VIDEOS

// Öffentlicher Watch-Link – Fallback in der Fassade und einzige Variante in
// E-Mails (dort lässt sich kein Player einbetten).
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`

// Thumbnail für E-Mails (im Web nutzen wir die klick-vor-Laden-Fassade, die
// vor dem Klick NICHTS von Google lädt – siehe VideoEmbed).
export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
