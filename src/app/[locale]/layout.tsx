import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import '../globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
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
          title: 'FrameTrain – Train HuggingFace & LLM models locally (LoRA, PyTorch, GPU)',
          description:
            'FrameTrain is the desktop app for local machine learning training. Fine-tune HuggingFace models with LoRA, PyTorch, and GPU acceleration – no cloud, no recurring extra costs. From €4.99/month in Early Access for unlimited training.',
          ogTitle: 'FrameTrain – Train AI models locally | ML Training Desktop App',
          ogDescription:
            'Fine-tune HuggingFace & LLM models locally on your GPU. No cloud lock-in, maximum data security, GDPR-compliant. From €4.99/month in Early Access. Download now!',
        }
      : {
          title: 'FrameTrain – HuggingFace & LLM Modelle lokal trainieren (LoRA, PyTorch, GPU)',
          description:
            'FrameTrain ist die Desktop-App für lokales Machine Learning Training. Fine-Tune HuggingFace Modelle mit LoRA, PyTorch und GPU-Beschleunigung – ohne Cloud, ohne laufende Zusatzkosten. Ab 4,99€/Monat im Early Access für unbegrenztes Training.',
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

  const faqItems = (messages as any).Home?.faq?.items as
    | { question: string; answer: string }[]
    | undefined

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
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
      ...(faqItems
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqItems.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            },
          ]
        : []),
    ],
  }

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
