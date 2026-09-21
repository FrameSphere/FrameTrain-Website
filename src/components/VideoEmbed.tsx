'use client'

import { useState } from 'react'
import { Play, Youtube, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { youtubeWatchUrl } from '@/lib/videos'

type Props = {
  /** YouTube-Video-ID (nicht die volle URL). */
  id: string
  /** Titel – als Beschriftung auf der Fassade und als iframe-title (a11y). */
  title: string
  /** Optionales lokales Poster (Pfad unter /public). Ohne Poster: Marken-Gradient. */
  poster?: string
  className?: string
}

// ─── Datenschutz-freundliches YouTube-Embed ─────────────────────────────────
//
// Vor dem Klick wird NICHTS von Google/YouTube geladen: kein iframe, keine
// Cookies, kein Request. Sichtbar ist nur eine lokale Fassade (Gradient oder
// lokales Poster + Play-Button). Erst der bewusste Klick lädt den Player über
// youtube-nocookie.com. Das passt zur "lokal & kein Tracking"-Haltung von
// FrameTrain und ist DSGVO-konform unabhängig vom Cookie-Consent – deshalb
// hängt die Fassade auch nicht am Consent-Banner.
export function VideoEmbed({ id, title, poster, className = '' }: Props) {
  const t = useTranslations('VideoEmbed')
  const [active, setActive] = useState(false)

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 ${className}`}>
      <div className="relative aspect-video">
        {active ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={t('play', { title })}
            className="press group absolute inset-0 w-full h-full flex flex-col items-center justify-center"
          >
            {/* Poster: lokales Bild ODER Marken-Gradient – beides ohne Google-Request. */}
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-80"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-600/25 via-fuchsia-600/15 to-blue-600/25"
                aria-hidden="true"
              />
            )}
            <div
              className="absolute inset-0 bg-black/30 transition-colors duration-200 group-hover:bg-black/20"
              aria-hidden="true"
            />

            {/* Play-Button */}
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 transition-transform duration-200 ease-out group-hover:scale-105">
              <Play className="w-7 h-7 text-white translate-x-0.5" fill="currentColor" />
            </div>
            <span className="relative z-10 mt-4 px-4 text-center text-white font-semibold text-[15px] drop-shadow">
              {title}
            </span>
          </button>
        )}
      </div>

      {/* Datenschutz-Hinweis + YouTube-Fallback. Nur vor dem Klick sichtbar. */}
      {!active && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            {t('privacyNote')}
          </span>
          <a
            href={youtubeWatchUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <Youtube className="w-3.5 h-3.5" aria-hidden="true" />
            {t('watchOnYoutube')}
          </a>
        </div>
      )}
    </div>
  )
}
