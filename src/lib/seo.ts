import type { Metadata } from 'next'

// Zentrale Site-URL. Beim Umzug auf die eigene Domain nur noch
// NEXT_PUBLIC_SITE_URL in Vercel setzen (ohne trailing Slash) –
// Canonicals, hreflang, og:url, Sitemap und robots.txt ziehen dann mit.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frame-train.com'
).replace(/\/$/, '')

/**
 * Canonical + hreflang für eine Seite.
 * `path` ist der Pfad ohne Locale-Präfix, z.B. '' (Startseite) oder '/faq'.
 *
 * x-default zeigt auf die präfixlose URL, die per Middleware auf die passende
 * Sprache weiterleitet – identisch zu den Link-Headern, die next-intl setzt
 * (HTML-Tags und HTTP-Header dürfen sich nicht widersprechen).
 */
export function pageAlternates(locale: string, path = ''): Metadata['alternates'] {
  return {
    canonical: `${siteUrl}/${locale}${path}`,
    languages: {
      de: `${siteUrl}/de${path}`,
      en: `${siteUrl}/en${path}`,
      'x-default': `${siteUrl}${path || '/'}`,
    },
  }
}

type OpenGraphOptions = {
  locale: string
  path?: string
  title: string
  description: string
  type?: 'website' | 'article'
}

/**
 * Vollständiges OpenGraph-Objekt für eine Seite. Nötig, weil Next.js
 * Metadata-Objekte pro Top-Level-Key ersetzt (nicht tief merged): Sobald eine
 * Seite `openGraph` definiert, gehen url/siteName/images aus dem Root-Layout
 * verloren und müssen hier wieder mitgeliefert werden.
 */
export function pageOpenGraph({
  locale,
  path = '',
  title,
  description,
  type = 'website',
}: OpenGraphOptions): Metadata['openGraph'] {
  return {
    type,
    locale: locale === 'en' ? 'en_US' : 'de_DE',
    url: `${siteUrl}/${locale}${path}`,
    siteName: 'FrameTrain',
    title,
    description,
    images: [
      {
        url: locale === 'en' ? '/og-image-en.png' : '/og-image.png',
        width: 1200,
        height: 630,
        alt: title,
        type: 'image/png',
      },
    ],
  }
}

/**
 * Metadata für noindex-Hilfsseiten (Login, Checkout, Bestätigungen …).
 * Liefert eigenen Titel, Beschreibung, Canonical und OpenGraph, damit beim
 * Teilen eines solchen Links nicht die Startseiten-Vorschau erscheint.
 * Texte liegen im Namespace `Meta.<key>` (title, description).
 */
export async function utilityMetadata(
  locale: string,
  key: string,
  path: string,
  follow = true,
): Promise<Metadata> {
  const { getTranslations } = await import('next-intl/server')
  const t = await getTranslations({ locale, namespace: 'Meta' })
  const title = t(`${key}.title`)
  const description = t(`${key}.description`)
  return {
    title,
    description,
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph({ locale, path, title, description }),
    robots: { index: false, follow },
  }
}
