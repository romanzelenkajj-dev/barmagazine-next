import { NextResponse } from 'next/server';

const SITE_URL = 'https://barmagazine.com';
const WP_API = process.env.WP_API ?? 'https://barmagazine.com/wp-json/wp/v2';
const PER_PAGE = 100;
const MAX_PAGES = 20;

export const revalidate = 3600;

type WPEntry = {
  slug: string;
  modified: string;
  _type: 'post' | 'page';
};

async function fetchAll(endpoint: 'posts' | 'pages'): Promise<WPEntry[]> {
  const out: WPEntry[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${WP_API}/${endpoint}?per_page=${PER_PAGE}&page=${page}&_fields=slug,modified&status=publish`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status === 400) break;
      throw new Error(`WP ${endpoint} page ${page} returned ${res.status}`);
    }
    const items = (await res.json()) as Array<{ slug: string; modified: string }>;
    if (!items.length) break;
    for (const i of items) {
      if (i.slug) out.push({ slug: i.slug, modified: i.modified, _type: endpoint.slice(0, -1) as 'post' | 'page' });
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
    console.error('[sitemap-articles] WP fetch failed:', err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { 'Content-Type': 'application/xml' } },
    );
  }

  const seen = new Set<string>();
  const merged = [...posts, ...pages].filter((e) => {
    if (seen.has(e.slug)) return false;
    seen.add(e.slug);
    return true;
  });

  merged.sort((a, b) => (b.modified ?? '').localeCompare(a.modified ?? ''));

  const urls = merged
    .map((e) => {
      const loc = `${SITE_URL}/${escapeXml(e.slug)}`;
      const lastmod = e.modified ? new Date(e.modified).toISOString() : new Date().toISOString();
      const priority = e._type === 'post' ? '0.8' : '0.6';
      const changefreq = e._type === 'post' ? 'daily' : 'weekly';
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
