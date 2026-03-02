import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api/', '/payment/'],
    },
    sitemap: 'https://frame-train.vercel.app/sitemap.xml',
  }
}
