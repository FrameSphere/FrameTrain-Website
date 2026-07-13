import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { siteUrl } from '@/lib/seo'

const baseUrl = siteUrl

type PageDef = {
  path: string // ohne führenden Slash der Locale, z.B. '' oder '/about'
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

const pages: PageDef[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/download', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/install', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.8 },
  // /library bewusst nicht gelistet, solange die Seite noindex ist (siehe
  // library/page.tsx) – Test-Einträge müssen erst aus der DB entfernt werden.
  { path: '/imprint', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/docs', changeFrequency: 'weekly', priority: 0.92 },
  { path: '/docs/ai-training-guide', changeFrequency: 'monthly', priority: 0.92 },
  { path: '/docs/ai-training-guide/ml-grundlagen', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/training-verstehen', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/trainingsverlauf', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/diagnose', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/hyperparameter', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/fine-tuning', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/dataset-mastery', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/docs/ai-training-guide/fortgeschrittene', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/guides', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/guides/lora-finetuning', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/guides/local-vs-cloud', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/guides/gpu-guide', changeFrequency: 'monthly', priority: 0.8 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            de: `${baseUrl}/de${page.path}`,
            en: `${baseUrl}/en${page.path}`,
            'x-default': `${baseUrl}${page.path || '/'}`,
          },
        },
      })
    }
  }

  return entries
}
