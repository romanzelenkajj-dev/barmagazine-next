import { NextResponse } from 'next/server';
import { getAllActiveBars, getCountriesWithCounts } from '@/lib/supabase';
import { getCityIndex } from '@/lib/city-index';
import { getSeoCities } from '@/lib/seo-cities';
import { getLiveAwardPrograms } from '@/lib/award-hubs';
import { toUrlSlug } from '@/lib/utils';

const SITE_URL = 'https://barmagazine.com';

// Request-time rendering, deliberately: with `revalidate` these routes were
// prerendered at BUILD time, where one upstream hiccup (WP 500 on posts page
// 4, build f9c3fdd) is fatal to the whole deploy. At request time the CDN
// Cache-Control (s-maxage + stale-while-revalidate) keeps them cheap and
// serves stale through upstream errors; a build never waits on WordPress or
// Supabase again.
export const dynamic = 'force-dynamic';

/**
 * When the PROFILE TEMPLATE last changed in a way a reader would notice.
 *
 * lastmod must mean "this page changed", and a page changes for two
 * reasons: its row was written, or the template that renders it was. The
 * row's updated_at covers the first. This constant covers the second, so a
 * template change that touched all 1,267 profiles (the 2026-09-14
 * structural pass: nearby block, accolade prose, article mentions) is not
 * reported as 1,267 pages last modified in March. Bump it ONLY for a change
 * a reader would see on every profile; a bumped date on an unchanged page
 * is the same lie in the other direction.
 */
const PROFILE_TEMPLATE_CHANGED_AT = '2026-09-14T19:36:00-07:00'; // deploy of b1b306b

/** A row's own lastmod: the later of its last write and the template change. */
function rowLastmod(bar: { updated_at: string | null; created_at: string }): string {
  const own = new Date(bar.updated_at || bar.created_at).getTime();
  const tpl = new Date(PROFILE_TEMPLATE_CHANGED_AT).getTime();
  return new Date(Math.max(own, tpl)).toISOString();
}

export async function GET() {
  // Paginated: a single getBars({ perPage: 2000 }) silently returned 1,000
  // rows and left 247 active profiles out of the sitemap. The live deploy
  // check (seo-check sitemap-bars-count) asserts the count matches.
  const [bars, countries, cityIndex, seoCities] = await Promise.all([
    getAllActiveBars<{ slug: string; tier: string | null; city: string; country: string; state: string | null; updated_at: string | null; created_at: string }>(
      'slug, tier, city, country, state, updated_at, created_at'
    ),
    getCountriesWithCounts(),
    getCityIndex(),
    getSeoCities(),
  ]);
  const awardPrograms = await getLiveAwardPrograms();

  // A list page changed when its newest member did. Request time, which
  // these used to report, says nothing: every crawl saw "modified just now".
  // City pages key on the city SLUG (qualified for same-name cities).
  const newest = (keyOf: (b: (typeof bars)[number]) => string) => {
    const m = new Map<string, string>();
    for (const b of bars) {
      const lm = rowLastmod(b);
      const k = keyOf(b);
      const cur = m.get(k);
      if (!cur || lm > cur) m.set(k, lm);
    }
    return m;
  };
  const newestByCity = newest(b => cityIndex.slugFor(b));
  const newestByCountry = newest(b => b.country);
  const directoryLastmod = bars.reduce((acc, b) => {
    const lm = rowLastmod(b);
    return lm > acc ? lm : acc;
  }, PROFILE_TEMPLATE_CHANGED_AT);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/bars</loc>
    <lastmod>${new Date(directoryLastmod).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  // Country pages
  for (const c of countries) {
    xml += `  <url>
    <loc>${SITE_URL}/bars/country/${toUrlSlug(c.country)}</loc>
    <lastmod>${newestByCountry.get(c.country) ?? new Date(directoryLastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // City pages, one per city entry (same-name cities are separate entries)
  for (const c of cityIndex.entries) {
    xml += `  <url>
    <loc>${SITE_URL}/bars/city/${c.slug}</loc>
    <lastmod>${newestByCity.get(c.slug) ?? new Date(directoryLastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  // "Best bars in <city>" SEO landing pages — every city clearing the
  // thin-page threshold, plus its qualifying type-by-city sub-pages. Same
  // newest-member date as the city page: they render the same rows.
  for (const c of seoCities) {
    const cityLastmod = newestByCity.get(c.slug) ?? new Date(directoryLastmod).toISOString();
    xml += `  <url>
    <loc>${SITE_URL}/best-bars/${c.slug}</loc>
    <lastmod>${cityLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    for (const t of c.typeSlugs) {
      xml += `  <url>
    <loc>${SITE_URL}/best-bars/${c.slug}/${t.slug}</loc>
    <lastmod>${cityLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  }

  // Award hub pages
  xml += `  <url>
    <loc>${SITE_URL}/awards</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  for (const { program } of awardPrograms) {
    xml += `  <url>
    <loc>${SITE_URL}/awards/${program.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // Individual bar profile pages
  for (const bar of bars) {
    const priority = bar.tier === 'top10' ? 0.9 : bar.tier === 'premium' ? 0.8 : bar.tier === 'featured' ? 0.7 : 0.6;
    xml += `  <url>
    <loc>${SITE_URL}/bars/${bar.slug}</loc>
    <lastmod>${rowLastmod(bar)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
