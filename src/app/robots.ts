import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://frame-train.vercel.app'

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/payment/', '/admin/', '/_next/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/payment/', '/admin/', '/_next/'],
        crawlDelay: 1,
      },
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/docs',
          '/guides',
          '/faq',
          '/download',
          '/changelog',
          '/extensions',
          '/install',
          '/register',
          '/login',
        ],
        disallow: [
          '/dashboard',
          '/api/',
          '/payment/',
          '/admin/',
          '/_next/',
          '/public/',
          '/.git',
          '/node_modules/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: 'frame-train.vercel.app',
  }
}
