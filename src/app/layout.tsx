import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FrameTrain – HuggingFace & LLM Modelle lokal trainieren (LoRA, PyTorch, GPU)',
  description: 'FrameTrain ist die Desktop-App für lokales Machine Learning Training. Fine-Tune HuggingFace Modelle mit LoRA, PyTorch und GPU-Beschleunigung – ohne Cloud, ohne Abo. Einmalig 1,99€.',
  keywords: [
    'Machine Learning lokal trainieren',
    'KI Modell lokal trainieren',
    'LLM fine tuning lokal',
    'HuggingFace Modell trainieren',
    'ML Training Desktop App',
    'LoRA fine tuning',
    'PyTorch Desktop',
    'AI Training Software offline',
    'lokales KI Training',
    'GPU Training lokal',
    'DSGVO konformes ML Training',
    'Machine Learning ohne Cloud',
    'FrameTrain',
  ],
  authors: [{ name: 'FrameTrain' }],
  creator: 'FrameTrain',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://frame-train.vercel.app',
    title: 'FrameTrain – KI-Modelle lokal trainieren | ML Training Desktop App',
    description: 'Fine-Tune HuggingFace Modelle lokal auf deiner GPU. Kein Cloud-Abo, maximale Datensicherheit. Einmalig 1,99€.',
    siteName: 'FrameTrain',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameTrain – KI-Modelle lokal trainieren',
    description: 'Fine-Tune HuggingFace Modelle lokal auf deiner GPU. Kein Cloud-Abo, DSGVO-konform. Einmalig 1,99€.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
    },
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
