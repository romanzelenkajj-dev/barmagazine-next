import { NextResponse } from 'next/server';
import { WP_API as WP_API_DEFAULT } from '@/lib/wordpress';

const SITE_URL = 'https://barmagazine.com';
// barmagazine.com/wp-json/* is blocked by Vercel's WAF (returns 403). The
// real WP origin is the WordPress.com public API — see src/lib/wordpress.ts.
// The previous default of `https://barmagazine.com/wp-json/wp/v2` is what
// caused the empty-sitemap regression that left ~330 articles uncrawlable.
const WP_API = process.env.WP_API ?? WP_API_DEFAULT;
const PER_PAGE = 100;
const MAX_PAGES = 20;

if (!process.env.WP_API && process.env.NODE_ENV === 'production') {
  console.warn(
    `[sitemap-articles] WP_API env var not set; falling back to ${WP_API_DEFAULT}`,
  );
}

export const revalidate = 3600;

type WPEntry = {
  slug: string;
  modified: string;
  _type: 'post' | 'page';
};

async function fetchAll(endpoint: 'posts' | 'pages'): Promise<WPEntry[]> {
  const out: WPEntry[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    // Do NOT pass &status=publish. On the public WP REST API that param
    // requires auth and returns 401/400 unauthenticated, which silently
    // breaks pagination. Public requests already return only published.
    const url = `${WP_API}/${endpoint}?per_page=${PER_PAGE}&page=${page}&_fields=slug,modified`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      // 400 from WP REST means "page beyond last" — pagination is done.
      if (res.status === 400) break;
      throw new Error(`WP ${endpoint} page ${page} returned ${res.status}`);
    }
    const items = (await res.json()) as Array<{ slug: string; modified: string }>;
    if (!items.length) break;
    for (const i of items) {
      if (i.slug) {
        out.push({
          slug: i.slug,
          modified: i.modified,
          _type: endpoint.slice(0, -1) as 'post' | 'page',
        });
      }
    }
    if (items.length < PER_PAGE) break;
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let posts: WPEntry[] = [];
  let pages: WPEntry[] = [];

  try {
    [posts, pages] = await Promise.all([fetchAll('posts'), fetchAll('pages')]);
  } catch (err) {
    // Re-throw so Next returns 5xx. An empty <urlset/> would be cached by
    // Google as "correct" for up to an hour, masking the failure. A 5xx
    // makes Googlebot retry, which is what we want when WP is misconfigured.
    console.error('[sitemap-articles] WP fetch failed, returning 500:', err);
    throw err;
  }

  const seen = new Set<string>();
  const merged = [...posts, ...pages].filter((e) => {
    if (seen.has(e.slug)) return false;
    seen.add(e.slug);
    return true;
  });

  merged.sort((a, b) => (b.modified ?? '').localeCompare(a.modified ?? ''));

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const urls = merged
    .map((e) => {
      const loc = `${SITE_URL}/${escapeXml(e.slug)}`;
      const modified = e.modified ? new Date(e.modified) : new Date();
      const lastmod = modified.toISOString();
      const isFresh = modified.getTime() >= sevenDaysAgo;
      const changefreq = isFresh ? 'daily' : 'weekly';
      const priority = e._type === 'post' ? '0.8' : '0.6';
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
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
