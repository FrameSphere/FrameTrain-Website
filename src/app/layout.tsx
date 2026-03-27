import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = 'https://frame-train.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'FrameTrain – HuggingFace & LLM Modelle lokal trainieren (LoRA, PyTorch, GPU)',
  description: 'FrameTrain ist die Desktop-App für lokales Machine Learning Training. Fine-Tune HuggingFace Modelle mit LoRA, PyTorch und GPU-Beschleunigung – ohne Cloud, ohne Abo, ohne laufende Kosten. Einmalig 1,99€ für unbegrenztes Training.',
  keywords: [
    'Machine Learning lokal trainieren',
    'KI Modell lokal trainieren',
    'LLM fine tuning lokal',
    'HuggingFace Modell trainieren',
    'ML Training Desktop App',
    'LoRA fine tuning',
    'QLoRA Training',
    'PyTorch Desktop',
    'AI Training Software offline',
    'lokales KI Training',
    'GPU Training lokal',
    'NVIDIA CUDA Training',
    'Apple Metal M1 M2 M3',
    'DSGVO konformes ML Training',
    'Machine Learning ohne Cloud',
    'FrameTrain Preis',
    'ML Tool kostengünstig',
  ],
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: baseUrl,
    title: 'FrameTrain – KI-Modelle lokal trainieren | ML Training Desktop App',
    description: 'Fine-Tune HuggingFace & LLM Modelle lokal auf deiner GPU. Kein Cloud-Abo, maximale Datensicherheit, DSGVO-konform. Einmalig 1,99€. Jetzt downloaden!',
    siteName: 'FrameTrain',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'FrameTrain – KI-Modelle lokal trainieren',
        type: 'image/svg+xml',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameTrain – KI-Modelle lokal trainieren',
    description: 'Fine-Tune HuggingFace Modelle lokal auf deiner GPU. Kein Cloud-Abo, DSGVO-konform, unbegrenzte Trainings. Einmalig 1,99€.',
    images: ['/og-image.svg'],
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
  alternates: {
    canonical: baseUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'FrameTrain',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        description: 'Desktop-App für lokales Machine Learning Training. Fine-Tune HuggingFace Modelle mit LoRA, PyTorch und GPU-Beschleunigung – ohne Cloud.',
        offers: {
          '@type': 'Offer',
          price: '1.99',
          priceCurrency: 'EUR',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '1.99',
            priceCurrency: 'EUR',
            name: 'Einmalige Zahlung, lebenslanger Zugang',
          },
        },
        featureList: [
          'Lokales GPU-Training ohne Cloud',
          'HuggingFace Integration',
          'LoRA und QLoRA Fine-Tuning',
          'PyTorch basiert',
          'DSGVO-konform',
          'NVIDIA CUDA & Apple Metal Unterstützung',
          'Live Training Monitoring',
          'Automatisches Model Versioning',
        ],
        url: 'https://frame-train.vercel.app',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Kann ich LLMs mit FrameTrain fine-tunen?',
            acceptedAnswer: { '@type': 'Answer', text: 'Ja. FrameTrain unterstützt das Fine-Tuning von Large Language Models (LLMs) via LoRA und QLoRA. Du kannst Modelle wie Llama, Mistral oder Phi direkt aus HuggingFace importieren und auf eigene Datensätze anpassen.' },
          },
          {
            '@type': 'Question',
            name: 'Welche GPUs werden unterstützt?',
            acceptedAnswer: { '@type': 'Answer', text: 'FrameTrain läuft auf allen NVIDIA-GPUs mit CUDA-Unterstützung (ab GTX 10-Serie) sowie auf Apple Silicon (M1/M2/M3/M4) über Metal Performance Shaders.' },
          },
          {
            '@type': 'Question',
            name: 'Was ist der Unterschied zu Google Colab oder AWS SageMaker?',
            acceptedAnswer: { '@type': 'Answer', text: 'FrameTrain läuft vollständig lokal auf deinem Rechner. Es entstehen keine Cloud-Kosten, Daten werden nicht hochgeladen und du bist nicht auf Internetverbindung angewiesen.' },
          },
          {
            '@type': 'Question',
            name: 'Brauche ich Programmierkenntnisse?',
            acceptedAnswer: { '@type': 'Answer', text: 'Nein. FrameTrain ist als grafische Anwendung konzipiert. Parameter werden über eine intuitive Oberfläche konfiguriert, ohne Code schreiben zu müssen.' },
          },
          {
            '@type': 'Question',
            name: 'Unterstützt FrameTrain LoRA-Training?',
            acceptedAnswer: { '@type': 'Answer', text: 'Ja, LoRA (Low-Rank Adaptation) ist vollständig integriert. LoRA-Rank, Alpha und Target-Module sind direkt in der App konfigurierbar.' },
          },
          {
            '@type': 'Question',
            name: 'Warum kostet FrameTrain nur 1,99€?',
            acceptedAnswer: { '@type': 'Answer', text: 'FrameTrain befindet sich in der Early-Access-Phase. Der Preis ist bewusst niedrig gehalten, damit möglichst viele Entwickler und Forscher Zugang bekommen. Der Preis steigt mit zukünftigen Feature-Updates.' },
          },
        ],
      },
    ],
  }

  return (
    <html lang="de">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
