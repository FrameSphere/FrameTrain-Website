import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Unterstützte Sprachen
  locales: ['de', 'en'],

  // Default-Sprache (bestehende, indexierte Inhalte sind Deutsch)
  defaultLocale: 'de',

  // Beide Sprachen bekommen ein Präfix: /de/... und /en/...
  localePrefix: 'always',

  // Keine hreflang-Link-Header: die würden x-default auf die präfixlose
  // 307-Redirect-URL setzen und den HTML-Tags aus pageAlternates widersprechen.
  alternateLinks: false,
})

export type Locale = (typeof routing.locales)[number]
