import type { Metadata } from 'next'
import { LibraryPageClient } from './LibraryPageClient'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'

const baseUrl = 'https://frame-train.vercel.app'

export const metadata: Metadata = {
  title: 'Open Library – Community ML-Skripte | FrameTrain',
  description:
    'Entdecke hunderte kostenlose ML-Trainings- und Testskripte der FrameTrain-Community. Fine-Tuning, Evaluation, Benchmark-Skripte für HuggingFace, PyTorch, LoRA & mehr – direkt in der App laden.',
  keywords: [
    'ML Skripte Community',
    'HuggingFace Training Script',
    'LoRA Fine-Tuning Script',
    'PyTorch Training Code',
    'Machine Learning Scripts Download',
    'BERT Training Script',
    'LLM Fine-Tuning Code',
    'Open Library ML',
    'FrameTrain Scripts',
    'GPU Training Skript',
    'ML Evaluation Script',
    'Transformers Training Python',
    'QLoRA Script',
    'Text Classification Script',
    'ML Benchmark Script',
  ],
  alternates: {
    canonical: `${baseUrl}/library`,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: `${baseUrl}/library`,
    title: 'Open Library – Community ML-Skripte für FrameTrain',
    description:
      'Entdecke & teile ML-Trainings- und Testskripte. LoRA, QLoRA, BERT, LLM Fine-Tuning, Benchmarks – kuratiert von der FrameTrain-Community.',
    siteName: 'FrameTrain',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Library – Community ML-Skripte | FrameTrain',
    description:
      'Kostenlose ML-Skripte für Training & Evaluation – direkt in FrameTrain laden.',
    creator: '@FrameTrainApp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

async function getInitialScripts() {
  try {
    const scripts = await prisma.libraryScript.findMany({
      orderBy: [{ verified: 'desc' }, { downloads: 'desc' }],
      take: 50,
      select: {
        id: true,
        name: true,
        description: true,
        author: true,
        model_type: true,
        task_type: true,
        framework: true,
        script_type: true,
        verified: true,
        downloads: true,
        stars: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return scripts.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      author: s.author,
      model_type: s.model_type,
      task_type: s.task_type,
      framework: s.framework,
      script_type: s.script_type ?? 'train',
      verified: s.verified,
      downloads: s.downloads,
      stars: s.stars,
      tags: s.tags,
      script: '',
      created_at: s.createdAt.toISOString(),
      updated_at: s.updatedAt.toISOString(),
    }))
  } catch {
    return []
  }
}

export default async function LibraryPage() {
  const initialScripts = await getInitialScripts()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/library`,
        url: `${baseUrl}/library`,
        name: 'Open Library – Community ML-Skripte | FrameTrain',
        description:
          'Entdecke hunderte kostenlose ML-Trainings- und Testskripte der FrameTrain-Community für HuggingFace, PyTorch, LoRA & mehr.',
        isPartOf: { '@id': baseUrl },
        inLanguage: 'de-DE',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Open Library', item: `${baseUrl}/library` },
          ],
        },
      },
      ...(initialScripts.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: 'FrameTrain Open Library – ML-Skripte',
              description: 'Community-kuratierte ML-Skripte für Training und Evaluation',
              numberOfItems: initialScripts.length,
              itemListElement: initialScripts.slice(0, 20).map((s, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'SoftwareSourceCode',
                  name: s.name,
                  description: s.description,
                  programmingLanguage: 'Python',
                  runtimePlatform: s.framework,
                  author: { '@type': 'Person', name: s.author },
                  keywords: Array.isArray(s.tags) ? s.tags.join(', ') : '',
                },
              })),
            },
          ]
        : []),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none" />
        <Header />
        <main className="flex-1 relative">
          <LibraryPageClient initialScripts={initialScripts} />
        </main>
        <Footer />
      </div>
    </>
  )
}
