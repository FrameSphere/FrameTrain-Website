/* eslint-disable @next/next/no-img-element */

/**
 * Screenshot der Desktop-App (Version 1.5) aus public/images/app/<locale>/.
 *
 * Quelle: ~/Desktop/frametrain_peek/app_in_pngs/<locale>/ – auf das Fenster
 * zugeschnitten, Ecken freigestellt, als WebP in 1200 und 2400 px Breite.
 * Plain <img> statt next/image aus denselben Gründen wie in AppScreenshot.tsx
 * (sprechende URLs, keine Vercel-Transformationen, feste Maße gegen CLS).
 *
 * Stand App 1.6.0, deutsche und englische Oberfläche. Erzeugt mit
 * scripts/build-screenshots.py.
 */
export const APP_SHOT_WIDTH = 1200
export const APP_SHOT_HEIGHT = 772

const AVAILABLE_LOCALES = new Set(['de', 'en'])

export function appShotBase(locale: string, slug: string) {
  const dir = AVAILABLE_LOCALES.has(locale) ? locale : 'en'
  return `/images/app/${dir}/${slug}`
}

type Props = {
  locale: string
  slug: string
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}

export function AppShot({ locale, slug, alt, sizes = '(min-width: 1120px) 1056px, 100vw', priority = false, className = '' }: Props) {
  const base = appShotBase(locale, slug)
  return (
    <img
      src={`${base}.webp`}
      srcSet={`${base}.webp 1200w, ${base}@2x.webp 2400w`}
      sizes={sizes}
      width={APP_SHOT_WIDTH}
      height={APP_SHOT_HEIGHT}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={`block w-full h-auto ${className}`}
    />
  )
}
