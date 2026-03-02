import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FrameTrain – KI-Modelle lokal trainieren | ML Training Desktop App',
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
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
