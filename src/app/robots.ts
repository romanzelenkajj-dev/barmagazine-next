import type { MetadataRoute } from 'next';

// Paths that should never appear in search results: build assets, server APIs,
// internal Next.js artifacts, and a few legacy WordPress query-string shapes
// that crawlers might still try. Applied to every user-agent rule below so AI
// crawlers honor the same exclusions.
//
// B6: removed `/wp-admin/`, `/wp-content/`, `/wp-includes/`, `/wp-json/`.
// None of those paths exist on this Next.js frontend; advising crawlers to
// stay away from them is dead weight and slightly misleading (a crawler
// reading robots.txt might infer the site is half-WP). The query-string
// disallows (`/?s=`, `/?p=`, `/?page_id=`) are kept because they're
// harmless and could still be hit by stale external links.
//
// Exported so the regression-guard test in robots.test.ts can assert no
// WP-era patterns ever sneak back in.
export const BLOCKED_PATHS = [
  '/api/',
  '/_next/',
  '/cdn-cgi/',
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
      // applied to '*' so they don't index build assets or server APIs either.
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
    // Sub-sitemaps (4):
    //   /sitemap-articles.xml    — WordPress articles + static pages
    //   /sitemap-bars.xml        — Bar directory (bars, cities, countries)
    //   /sitemap-news.xml        — Google News (last 7 days)
    //   /sitemap-categories.xml  — WP category hub pages (A6)
    sitemap: [
      'https://barmagazine.com/sitemap.xml',
    ],
  };
}
