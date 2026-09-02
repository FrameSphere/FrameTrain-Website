'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import {
  CONSENT_EVENT,
  GA_ID,
  GOOGLE_ADS_ID,
  META_PIXEL_ID,
  readConsent,
  trackPageView,
} from '@/lib/analytics'

// ─── Tag-Loader ────────────────────────────────────────────────────────────────
//
// Lädt GA4 / Google Ads / Meta Pixel AUSSCHLIESSLICH dann, wenn
//   1. die jeweilige NEXT_PUBLIC-Env-Var gesetzt ist  UND
//   2. der Nutzer im Cookie-Banner zugestimmt hat.
// Ohne Zustimmung wird kein einziges Drittanbieter-Script angefordert.
// Der Consent-Mode-v2-Default ("denied") steht im <head> des Layouts.

function useConsentGranted(): boolean {
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    setGranted(readConsent() === 'granted')
    const onChange = () => setGranted(readConsent() === 'granted')
    window.addEventListener(CONSENT_EVENT, onChange)
    // Zustimmung in einem anderen Tab
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  return granted
}

/** SPA-Navigationen an GA4/Meta melden (gtag zählt sonst nur den ersten Load). */
function PageViewTracker({ enabled }: { enabled: boolean }) {
  // Bewusst ohne useSearchParams: das würde jede statische Seite, die dieses
  // Layout nutzt, in Client-Side-Rendering zwingen (Next.js verlangt dafür eine
  // Suspense-Boundary). Der initiale Page-View inkl. UTM-Parametern kommt
  // ohnehin aus gtag('config') bzw. dem Pixel-Init.
  const pathname = usePathname()
  const firstRun = useRef(true)

  useEffect(() => {
    if (!enabled) return
    // Der initiale Page-View kommt bereits aus gtag('config') bzw. dem Pixel-Init
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    trackPageView(pathname)
  }, [enabled, pathname])

  return null
}

export function Analytics() {
  const granted = useConsentGranted()

  // Primäre Google-Tag-ID: GA4 bevorzugt, sonst Google Ads allein.
  const googleTagId = GA_ID || GOOGLE_ADS_ID
  const loadGoogle = granted && Boolean(googleTagId)
  const loadMeta = granted && Boolean(META_PIXEL_ID)

  if (!loadGoogle && !loadMeta) return null

  return (
    <>
      {loadGoogle && (
        <>
          <Script
            id="ft-gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
          />
          <Script id="ft-gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${GA_ID ? `gtag('config', '${GA_ID}');` : ''}
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
            `}
          </Script>
        </>
      )}

      {loadMeta && (
        <Script id="ft-meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      <PageViewTracker enabled={granted} />
    </>
  )
}
