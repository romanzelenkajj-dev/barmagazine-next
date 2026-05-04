import { NextResponse } from 'next/server';
import { WP_API as WP_API_DEFAULT } from '@/lib/wordpress';
import {
  shouldExcludeFromSitemap,
  type ExclusionReason,
} from '@/lib/sitemap-filters';

const SITE_URL = 'https://barmagazine.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

/**
 * Fetch active bar slugs from Supabase (anon key + public-read RLS).
 * Used for the A1.1 cross-reference: any WP slug whose /bars/{slug}
 * counterpart exists is excluded from sitemap-articles to avoid splitting
 * ranking signals between root-level and /bars/* URLs.
 *
 * Tolerant of missing env vars or upstream failure — returns an empty set
 * and logs a warning. The other filters (Slovak, WP system, stub pages)
 * still apply.
 */
async function fetchActiveBarSlugs(): Promise<Set<string>> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      '[sitemap-articles] Supabase env missing; bar-shadow filter disabled.',
    );
    return new Set();
  }
  try {
    const url = `${SUPABASE_URL}/rest/v1/bars?select=slug&is_active=eq.true&limit=10000`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn(
        `[sitemap-articles] Supabase /bars returned ${res.status}; bar-shadow filter disabled this cycle.`,
      );
      return new Set();
    }
    const rows = (await res.json()) as Array<{ slug: string }>;
    return new Set(rows.map((r) => r.slug).filter(Boolean));
  } catch (err) {
    console.warn(
      `[sitemap-articles] Supabase fetch error; bar-shadow filter disabled this cycle:`,
      err,
    );
    return new Set();
  }
}

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
  let barSlugs: Set<string> = new Set();

  try {
    [posts, pages, barSlugs] = await Promise.all([
      fetchAll('posts'),
      fetchAll('pages'),
      fetchActiveBarSlugs(),
    ]);
  } catch (err) {
    // Re-throw so Next returns 5xx. An empty <urlset/> would be cached by
    // Google as "correct" for up to an hour, masking the failure. A 5xx
    // makes Googlebot retry, which is what we want when WP is misconfigured.
    // (Note: fetchActiveBarSlugs never throws — only WP failures escape.)
    console.error('[sitemap-articles] WP fetch failed, returning 500:', err);
    throw err;
  }

  const seen = new Set<string>();
  const excludedCounts: Record<ExclusionReason, number> = {
    empty: 0,
    'shadows-bar-directory': 0,
    'slovak-legacy': 0,
    'wp-system': 0,
    'stub-pending-rebuild': 0,
  };
  const excludedSamples: Array<{ slug: string; reason: ExclusionReason }> = [];

  const merged = [...posts, ...pages].filter((e) => {
    if (seen.has(e.slug)) return false;
    seen.add(e.slug);
    const decision = shouldExcludeFromSitemap(e.slug, { barSlugs });
    if (decision.exclude && decision.reason) {
      excludedCounts[decision.reason]++;
      if (excludedSamples.length < 20) {
        excludedSamples.push({ slug: e.slug, reason: decision.reason });
      }
      return false;
    }
    return true;
  });

  // Observability: log a summary so excluded slugs are auditable in Vercel
  // function logs without flooding the output. Sample first 20 inline.
  const totalExcluded = Object.values(excludedCounts).reduce((a, b) => a + b, 0);
  if (totalExcluded > 0) {
    console.log(
      `[sitemap-articles] kept=${merged.length} excluded=${totalExcluded}`,
      JSON.stringify(excludedCounts),
    );
    for (const s of excludedSamples) {
      console.log(`  - /${s.slug}: ${s.reason}`);
    }
  }

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
