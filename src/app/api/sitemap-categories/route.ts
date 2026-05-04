import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/wordpress';

const SITE_URL = 'https://barmagazine.com';

export const revalidate = 3600;

/**
 * Sitemap-categories — emits one <url> per live WP category whose page
 * actually serves at /category/<slug> with content. Implements audit
 * item A6.
 *
 * Note on what the audit prompt called the "seven live categories":
 * the prompt listed { bars, people, cocktails, awards, brands, events,
 * bar-directory }. WP actually has 6 — bar-directory is not a WP category;
 * the bar directory lives at the top-level /bars route (covered by
 * sitemap-bars.xml), not under /category/. Verified via the WP categories
 * endpoint (count=0 BLOG category excluded).
 */

// Excluded by slug: zero-post placeholders or WP defaults that would
// land on an empty page. Verify against the WP REST output before
// adding more.
const EXCLUDED_CATEGORY_SLUGS = new Set(['blog', 'uncategorized']);

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let cats;
  try {
    cats = await getCategories();
  } catch (err) {
    // Same loud-fail pattern as sitemap-articles: 5xx makes Googlebot
    // retry instead of caching an empty <urlset/> as the new truth.
    console.error('[sitemap-categories] WP fetch failed, returning 500:', err);
    throw err;
  }

  const live = cats.filter(
    (c) => c.count > 0 && !EXCLUDED_CATEGORY_SLUGS.has(c.slug.toLowerCase()),
  );

  const now = new Date().toISOString();
  const urls = live
    .map((c) => {
      const loc = `${SITE_URL}/category/${escapeXml(c.slug)}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
