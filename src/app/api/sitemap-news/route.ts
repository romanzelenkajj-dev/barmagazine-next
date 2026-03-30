import { NextResponse } from 'next/server';

const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';
const SITE_URL = 'https://barmagazine.com';

interface WPNewsPost {
  slug: string;
  date: string;
  title: { rendered: string };
  categories: number[];
}

// Map of category IDs to names (from CATEGORY_MAP in wordpress.ts)
const CATEGORY_NAMES: Record<number, string> = {
  6: 'Bar Tour',
  63: 'Bars',
  1: 'Blog',
  8: 'Cocktails',
  40: 'Features',
  44: 'Flavours',
  52: 'News',
  199: 'People',
  200: 'Awards & Events',
  201: 'Brands',
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    // Fetch the 50 most recent posts
    const res = await fetch(
      `${WP_API}/posts?per_page=50&orderby=date&order=desc&_fields=slug,date,title,categories`,
      { next: { revalidate: 900 } }
    );

    if (!res.ok) {
      return new NextResponse('Error fetching posts', { status: 500 });
    }

    const posts: WPNewsPost[] = await res.json();

    // FIX: was 48 hours — too short when publishing cadence is a few articles per week.
    // Google News sitemap supports up to 2 days, but Google Discover crawls up to 7 days.
    // Using 7 days ensures the sitemap always has a healthy number of entries for Discover.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentPosts = posts.filter(post => new Date(post.date) >= cutoff);

    const urls = recentPosts.map(post => {
      const title = escapeXml(stripHtml(post.title.rendered));
      const pubDate = new Date(post.date).toISOString();

      const keywords = post.categories
        .map(id => CATEGORY_NAMES[id])
        .filter(Boolean);

      const keywordsTag = keywords.length > 0
        ? `        <news:keywords>${escapeXml(keywords.join(', '))}</news:keywords>\n`
        : '';

      return `  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>BarMagazine</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
${keywordsTag}    </news:news>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    });
  } catch {
    return new NextResponse('Error generating news sitemap', { status: 500 });
  }
}
