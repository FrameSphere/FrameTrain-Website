import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Unterstützte Sprachen
  locales: ['de', 'en'],

  // Default-Sprache (bestehende, indexierte Inhalte sind Deutsch)
  defaultLocale: 'de',

  // Beide Sprachen bekommen ein Präfix: /de/... und /en/...
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
