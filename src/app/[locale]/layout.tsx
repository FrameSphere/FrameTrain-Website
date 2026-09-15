import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import '../globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Analytics } from '@/components/Analytics'
import { VercelAnalytics } from '@/components/VercelAnalytics'
import { CookieBanner } from '@/components/CookieBanner'
import { siteUrl, pageAlternates, pageOpenGraph } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = siteUrl

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const copy =
    locale === 'en'
      ? {
          title: 'FrameTrain – Local LLM Training with LoRA & PyTorch',
          description:
            'Desktop app for local ML training: fine-tune HuggingFace models with LoRA & PyTorch, GDPR-compliant, no cloud required. From €4.99/month – get started.',
          ogTitle: 'FrameTrain – Train AI models locally | ML Training Desktop App',
          ogDescription:
            'Fine-tune HuggingFace & LLM models locally on your GPU. No cloud lock-in, maximum data security, GDPR-compliant. From €4.99/month in Early Access. Download now!',
        }
      : {
          title: 'FrameTrain – LLM-Modelle lokal trainieren mit LoRA',
          description:
            'Desktop-App für lokales ML-Training: HuggingFace-Modelle mit LoRA & PyTorch fine-tunen, DSGVO-konform ohne Cloud. Ab 4,99€/Monat – jetzt starten.',
          ogTitle: 'FrameTrain – KI-Modelle lokal trainieren | ML Training Desktop App',
          ogDescription:
            'Fine-Tune HuggingFace & LLM Modelle lokal auf deiner GPU. Kein Cloud-Zwang, maximale Datensicherheit, DSGVO-konform. Ab 4,99€/Monat im Early Access. Jetzt downloaden!',
        }

  return {
    metadataBase: new URL(baseUrl),
    title: copy.title,
    description: copy.description,
    authors: [{ name: 'FrameTrain' }],
    creator: 'FrameTrain',
    generator: 'Next.js',
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: {
      email: false,
      telephone: false,
      address: false,
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: '/apple-touch-icon.svg',
      shortcut: '/favicon.svg',
    },
    openGraph: pageOpenGraph({
      locale,
      title: copy.ogTitle,
      description: copy.ogDescription,
    }),
    // Bewusst ohne title/description/images: X/Twitter fällt auf die og:*-Tags
    // zurück – so bleiben die Twitter-Cards auf Unterseiten seitenspezifisch,
    // statt die hier gesetzten Startseiten-Werte zu erben.
    twitter: {
      card: 'summary_large_image',
      creator: '@FrameTrainApp',
      site: '@FrameTrainApp',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    verification: {
      google: 'google7ef57c38ed213579',
    },
    // Gilt nur für die Startseite – jede Unterseite MUSS eigene alternates
    // via pageAlternates() setzen, sonst erbt sie das Startseiten-Canonical.
    alternates: pageAlternates(locale),
  }
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Aktiviert statisches Rendering für diese Locale (next-intl)
  setRequestLocale(locale)

  const messages = await getMessages()

  // Hinweis: Die FAQPage-Structured-Data liegt bewusst NICHT hier im Root-Layout.
  // Ein Layout rendert auf allen Unterrouten mit – die Startseiten-FAQ als
  // FAQPage an /apple-silicon, /docs usw. zu hängen widerspricht Googles Regel
  // "FAQ-Markup = auf DIESER Seite sichtbarer Inhalt" und erzeugt doppelte
  // FAQPage-Entitäten. Jede Seite mit sichtbarer FAQ liefert ihre eigene
  // FAQPage (Startseite in page.tsx, /faq in faq/page.tsx, /apple-silicon und
  // /compare in ihren page.tsx). Organization + SoftwareApplication bleiben
  // site-weit, weil sie die Entität auf jeder Seite bestätigen sollen.
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'FrameTrain',
        url: baseUrl,
        logo: `${baseUrl}/favicon.svg`,
        sameAs: ['https://github.com/FrameSphere/FrameTrain-App'],
      },
      {
        '@type': 'SoftwareApplication',
        // Stabile @id, damit Unterseiten (z.B. /screenshots) dieselbe App
        // ergänzen können, statt eine zweite Entität aufzumachen.
        '@id': `${baseUrl}/#software`,
        name: 'FrameTrain',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        description:
          locale === 'en'
            ? 'Desktop app for local machine learning training. Fine-tune HuggingFace models with LoRA, PyTorch, and GPU acceleration – no cloud required.'
            : 'Desktop-App für lokales Machine Learning Training. Fine-Tune HuggingFace Modelle mit LoRA, PyTorch und GPU-Beschleunigung – ohne Cloud.',
        offers: {
          '@type': 'Offer',
          price: '4.99',
          priceCurrency: 'EUR',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '4.99',
            priceCurrency: 'EUR',
            unitText: 'MONTH',
            name:
              locale === 'en'
                ? 'Early Access price, cancel monthly (€39.99/year)'
                : 'Early-Access-Preis, monatlich kündbar (jährlich 39,99€)',
          },
        },
        featureList:
          locale === 'en'
            ? [
                'Local GPU training without the cloud',
                'HuggingFace integration',
                'LoRA and QLoRA fine-tuning',
                'PyTorch based',
                'GDPR compliant',
                'NVIDIA CUDA & Apple Metal support',
                'Live training monitoring',
                'Automatic model versioning',
              ]
            : [
                'Lokales GPU-Training ohne Cloud',
                'HuggingFace Integration',
                'LoRA und QLoRA Fine-Tuning',
                'PyTorch basiert',
                'DSGVO-konform',
                'NVIDIA CUDA & Apple Metal Unterstützung',
                'Live Training Monitoring',
                'Automatisches Model Versioning',
              ],
        url: `${baseUrl}/${locale}`,
      },
    ],
  }

  return (
    <html lang={locale}>
      <head>
        {/* Google Consent Mode v2 – MUSS vor jedem Tag laufen.
            Default: alles verweigert. Erst die Zustimmung im Cookie-Banner
            (src/components/CookieBanner.tsx) schickt ein consent-update und
            lässt <Analytics /> die Tags überhaupt erst nachladen. Ohne
            gesetzte NEXT_PUBLIC-IDs passiert hier ohnehin nichts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  personalization_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
try {
  var c = window.localStorage.getItem('ft_consent_v1');
  if (c && JSON.parse(c).status === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      personalization_storage: 'granted'
    });
  }
} catch (e) {}
`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>{children}</AuthProvider>
          <CookieBanner />
        </NextIntlClientProvider>
        <Analytics />
        <VercelAnalytics />
      </body>
    </html>
  )
}
