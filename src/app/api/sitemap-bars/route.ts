import { NextResponse } from 'next/server';
import { getBars, getCountriesWithCounts, getCitiesWithCounts } from '@/lib/supabase';
import { getSeoCities } from '@/lib/seo-cities';
import { getLiveAwardPrograms } from '@/lib/award-hubs';
import { toUrlSlug } from '@/lib/utils';

const SITE_URL = 'https://barmagazine.com';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const [{ bars }, countries, cities, seoCities] = await Promise.all([
    getBars({ perPage: 2000 }),
    getCountriesWithCounts(),
    getCitiesWithCounts(),
    getSeoCities(),
  ]);
  const awardPrograms = await getLiveAwardPrograms();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/bars</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  // Country pages
  for (const c of countries) {
    xml += `  <url>
    <loc>${SITE_URL}/bars/country/${toUrlSlug(c.country)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // City pages
  for (const c of cities) {
    xml += `  <url>
    <loc>${SITE_URL}/bars/city/${toUrlSlug(c.city)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  // "Best bars in <city>" SEO landing pages — every city clearing the
  // thin-page threshold, plus its qualifying type-by-city sub-pages.
  for (const c of seoCities) {
    xml += `  <url>
    <loc>${SITE_URL}/best-bars/${c.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    for (const t of c.typeSlugs) {
      xml += `  <url>
    <loc>${SITE_URL}/best-bars/${c.slug}/${t.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
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
    const lastmod = bar.updated_at || bar.created_at;
    const priority = bar.tier === 'top10' ? 0.9 : bar.tier === 'premium' ? 0.8 : bar.tier === 'featured' ? 0.7 : 0.6;
    xml += `  <url>
    <loc>${SITE_URL}/bars/${bar.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
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
