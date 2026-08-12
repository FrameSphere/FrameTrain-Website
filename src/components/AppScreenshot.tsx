/**
 * Produkt-Screenshot aus der Desktop-App.
 *
 * Die Bilder liegen fertig optimiert (WebP, 1200px + @2x) unter
 * /images/screenshots/<locale>/ – deshalb bewusst ein normales <img> statt
 * next/image:
 *  - keine Bild-Transformationen auf Vercel (die Dateien sind schon klein),
 *  - saubere, sprechende URLs statt /_next/image?url=… (Google Bildersuche
 *    indexiert die direkt und liest den Dateinamen als schwaches Signal),
 *  - /images/* hat in next.config.js bereits einen 30-Tage-Cache-Header.
 *
 * width/height stehen fest am Element, damit der Browser den Platz vor dem
 * Laden reserviert (kein Layout Shift → CLS bleibt bei 0).
 */

/* eslint-disable @next/next/no-img-element */

export const SCREENSHOT_WIDTH = 1200
export const SCREENSHOT_HEIGHT = 771

type Props = {
  /** 'de' | 'en' – bestimmt, welche Sprachfassung des UI gezeigt wird */
  locale: string
  /** Dateiname ohne Präfix/Endung, z.B. 'training' */
  slug: string
  /** Pflicht: beschreibt, was im Screenshot zu sehen ist (Alt-Text, SEO + a11y) */
  alt: string
  /** Sichtbare Bildunterschrift unter dem Screenshot */
  caption?: string
  /**
   * Wie breit der Screenshot dargestellt wird – der Browser wählt daraus die
   * passende Datei. Der Default deckt die breiteste Einbaustelle ab (die
   * Startseite mit max-w-5xl = 1024px); schmalere Seiten schätzt er dadurch
   * höchstens zu großzügig ein, nie zu knapp.
   */
  sizes?: string
  className?: string
}

export function AppScreenshot({
  locale,
  slug,
  alt,
  caption,
  sizes = '(min-width: 1024px) 1024px, 100vw',
  className = '',
}: Props) {
  const base = `/images/screenshots/${locale === 'en' ? 'en' : 'de'}/frametrain-${slug}`

  return (
    <figure className={`my-0 ${className}`}>
      {/* Der Rahmen ist bewusst zurückhaltend: der Screenshot bringt seine
          eigene Fensterdekoration schon mit. */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-[0_16px_48px_-24px_rgba(0,0,0,0.9)]">
        <img
          src={`${base}.webp`}
          // w-Deskriptoren statt 1x/2x: `2x` schaut nur auf die Pixeldichte und
          // ignoriert, wie breit das Bild tatsächlich dargestellt wird. Ein
          // Handy mit 375px Breite hat damit die 2400px-Datei (135 KB) geladen,
          // obwohl der Slot nur ~291 CSS-px breit ist. Mit w + sizes rechnet der
          // Browser Slotbreite × Pixeldichte und nimmt dort die 1200er (46 KB).
          srcSet={`${base}.webp ${SCREENSHOT_WIDTH}w, ${base}@2x.webp ${SCREENSHOT_WIDTH * 2}w`}
          sizes={sizes}
          width={SCREENSHOT_WIDTH}
          height={SCREENSHOT_HEIGHT}
          alt={alt}
          // Alle bisherigen Einbaustellen liegen unter der Falz – ein eager
          // geladener Screenshot würde hier nur mit dem echten LCP-Element
          // (der Überschrift) um Bandbreite konkurrieren.
          loading="lazy"
          decoding="async"
          className="block w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-[13px] leading-relaxed text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Absolute URL eines Screenshots – für JSON-LD (ImageObject, screenshot). */
export function screenshotUrl(siteUrl: string, locale: string, slug: string, retina = false) {
  const l = locale === 'en' ? 'en' : 'de'
  return `${siteUrl}/images/screenshots/${l}/frametrain-${slug}${retina ? '@2x' : ''}.webp`
}
