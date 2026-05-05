/**
 * Sitemap Index — served at /sitemap.xml via next.config.mjs rewrite
 *
 * Returns a <sitemapindex> referencing four sub-sitemaps:
 *   /sitemap-articles.xml    — WordPress articles + static pages
 *   /sitemap-bars.xml        — Bar directory (individual bars, cities, countries)
 *   /sitemap-news.xml        — Google News sitemap (last 7 days)
 *   /sitemap-categories.xml  — WordPress category hub pages (A6)
 *
 * This is the Google-recommended structure for sites with multiple content
 * types. Submit https://barmagazine.com/sitemap.xml to Search Console and
 * Google will automatically discover and crawl all sub-sitemaps.
 */

import { NextResponse } from 'next/server';

const SITE_URL = 'https://barmagazine.com';

export const revalidate = 3600;

export async function GET() {
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-articles.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-bars.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-news.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
