import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://frame-train.vercel.app'
  const lastModified = new Date()

  const mainPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/download`, lastModified, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/install`, lastModified, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/changelog`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/extensions`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/register`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const docsPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/docs`, lastModified, changeFrequency: 'weekly', priority: 0.92 },
    // AI Training Guide Hub
    { url: `${baseUrl}/docs/ai-training-guide`, lastModified, changeFrequency: 'monthly', priority: 0.92 },
    // 8 Chapters
    { url: `${baseUrl}/docs/ai-training-guide/ml-grundlagen`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/training-verstehen`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/trainingsverlauf`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/diagnose`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/hyperparameter`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/fine-tuning`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/dataset-mastery`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/docs/ai-training-guide/fortgeschrittene`, lastModified, changeFrequency: 'monthly', priority: 0.88 },
  ]

  const guidesPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/guides`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/guides/lora-finetuning`, lastModified, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/guides/local-vs-cloud`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/guides/gpu-guide`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/guides/huggingface-integration`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/guides/qLora-vs-lora`, lastModified, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/guides/model-versioning`, lastModified, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/guides/batch-training`, lastModified, changeFrequency: 'monthly', priority: 0.75 },
  ]

  return [...mainPages, ...docsPages, ...guidesPages]
}
