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
  /** Optionales lokales Poster (Pfad unter /public). Ohne Poster: ruhige Fläche (surface-raised). */
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
    <div className={`relative overflow-hidden rounded-lg border border-line bg-surface ${className}`}>
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
            className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center"
          >
            {/* Poster: lokales Bild ODER Marken-Gradient – beides ohne Google-Request. */}
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-60 transition-opacity duration-150 group-hover:opacity-75"
              />
            ) : (
              <div
                className="absolute inset-0 bg-surface-raised"
                aria-hidden="true"
              />
            )}
            <div
              className="absolute inset-0 bg-[rgba(10,10,18,0.45)] transition-colors duration-150 group-hover:bg-[rgba(10,10,18,0.3)]"
              aria-hidden="true"
            />

            {/* Play-Button */}
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-pill bg-indigo-button shadow-button-edge transition-colors duration-150 ease-out group-hover:bg-indigo-hover">
              <Play className="w-6 h-6 text-on-indigo translate-x-0.5" strokeWidth={1.5} fill="currentColor" />
            </div>
            <span className="relative z-10 mt-4 px-4 text-center text-ink font-semibold text-[16px]">
              {title}
            </span>
          </button>
        )}
      </div>

      {/* Datenschutz-Hinweis + YouTube-Fallback. Nur vor dem Klick sichtbar. */}
      {!active && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-line bg-surface">
          <span className="inline-flex items-center gap-1.5 ft-data text-ink-faint">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            {t('privacyNote')}
          </span>
          <a
            href={youtubeWatchUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 ft-data text-ink-faint hover:text-ink transition-colors duration-150 flex-shrink-0"
          >
            <Youtube className="w-3.5 h-3.5" aria-hidden="true" />
            {t('watchOnYoutube')}
          </a>
        </div>
      )}
    </div>
  )
}
