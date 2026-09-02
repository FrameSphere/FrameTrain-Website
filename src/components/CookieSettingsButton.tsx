'use client'

import { useTranslations } from 'next-intl'
import { hasAnyTag, openConsentSettings } from '@/lib/analytics'

// ─── Footer-Einstieg „Cookie-Einstellungen" ────────────────────────────────────
//
// Art. 7 Abs. 3 DSGVO: Der Widerruf muss so einfach sein wie die Einwilligung.
// Der Link öffnet den bestehenden Banner erneut (src/components/CookieBanner.tsx),
// dort kann der Nutzer die Zustimmung erteilen ODER widerrufen.
// Ohne konfigurierte Analytics-IDs gibt es nichts zu widerrufen — dann bleibt
// der Link aus, statt eine leere Auswahl anzubieten.

export function CookieSettingsButton({ className }: { className?: string }) {
  const t = useTranslations('Consent')

  if (!hasAnyTag()) return null

  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {t('manageCta')}
    </button>
  )
}
