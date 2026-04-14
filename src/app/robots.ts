import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/search',
          '/cdn-cgi/',
          '/wp-json/eventon/',
          '/wp-json/',
          '/?s=',
          '/?p=',
          '/?page_id=',
        ],
      },
      // Explicitly allow AI search crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    // Single sitemap index — Google discovers all sub-sitemaps from here.
    // Submit https://barmagazine.com/sitemap.xml to Search Console.
    // Sub-sitemaps:
    //   /sitemap-articles.xml  — WordPress articles + static + category pages
    //   /sitemap-bars.xml      — Bar directory (bars, cities, countries)
    //   /sitemap-news.xml      — Google News (last 7 days)
    sitemap: [
      'https://barmagazine.com/sitemap.xml',
    ],
  };
}
