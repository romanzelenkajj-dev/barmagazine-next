import { NextResponse } from 'next/server';
import { WP_API } from '@/lib/wordpress';

const SITE_URL = 'https://barmagazine.com';

// Category slugs that exist in WordPress and have dedicated pages
const CATEGORY_SLUGS = [
  'cocktails', 'people', 'awards', 'brands', 'events', 'bars',
];

// Static non-article pages (homepage, utility pages)
const STATIC_PAGES = [
  { url: `${SITE_URL}`, changefreq: 'daily', priority: 1.0 },
  { url: `${SITE_URL}/work-with-us`, changefreq: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/add-your-bar`, changefreq: 'monthly', priority: 0.4 },
  { url: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/terms`, changefreq: 'yearly', priority: 0.2 },
];

interface WPPostSitemap {
  slug: string;
  modified: string;
}

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    // Fetch all WordPress posts across all pages
    const allPosts: WPPostSitemap[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const res = await fetch(
        `${WP_API}/posts?per_page=${perPage}&page=${page}&_fields=slug,modified`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) break;

      const posts: WPPostSitemap[] = await res.json();
      if (posts.length === 0) break;

      allPosts.push(...posts);
      const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
      if (page >= totalPages) break;
      page++;
    }

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const p of STATIC_PAGES) {
      xml += `  <url>
    <loc>${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>
`;
    }

    // Category pages
    for (const slug of CATEGORY_SLUGS) {
      xml += `  <url>
    <loc>${SITE_URL}/category/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // All WordPress article pages
    for (const post of allPosts) {
      const lastmod = new Date(post.modified).toISOString();
      xml += `  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch {
    return new NextResponse('Error generating articles sitemap', { status: 500 });
  }
}
