import type { MetadataRoute } from 'next';

// Paths that should never appear in search results: build assets, server APIs,
// internal Next.js artifacts, and legacy WordPress infra. Applied to every
// user-agent rule below so AI crawlers honor the same exclusions.
const BLOCKED_PATHS = [
  '/api/',
  '/_next/',
  '/cdn-cgi/',
  '/wp-admin/',
  '/wp-content/',
  '/wp-includes/',
  '/wp-json/',
  '/search',
  '/?s=',
  '/?p=',
  '/?page_id=',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      // Explicitly allow AI search crawlers, but with the same exclusions
      // applied to '*' so they don't index static assets / WP infra either.
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: BLOCKED_PATHS,
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
