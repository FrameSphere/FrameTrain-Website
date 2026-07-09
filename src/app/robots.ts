import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://frame-train.vercel.app'

  // WICHTIG: '/_next/' darf hier NICHT in disallow stehen.
  // Next.js liefert darüber CSS und JS-Chunks aus (z.B. /_next/static/css/...).
  // Blockiert man diesen Pfad, kann Google die Seiten nicht gestylt/gerendert
  // sehen (Live-Test zeigt dann unstyled Content + hängenden Loading-State).
  //
  // Eine einzige '*'-Regel statt mehreren parallelen Allow-Listen, damit
  // neue Content-Seiten nicht erst manuell ergänzt werden müssen (das war
  // zuvor der Fall: /library, /imprint, /privacy, /terms fehlten in der
  // alten Allow-Liste und waren dadurch für alle Bots außer Googlebot/Bingbot
  // gesperrt).
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/de/dashboard',   // privater Nutzer-Bereich, kein öffentlicher Content
          '/en/dashboard',
          '/api/',           // reine Backend-Endpunkte (liegen außerhalb des Locale-Präfixes)
          '/de/payment/',    // Checkout/Success/Cancel, kein Content, teils session-spezifisch
          '/en/payment/',
          '/de/admin/',      // Admin-Funktionen
          '/en/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
