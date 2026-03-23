import { NextResponse } from 'next/server';

const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';
const SITE_URL = 'https://barmagazine.com';

interface WPNewsPost {
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  _embedded?: {
    'wp:term'?: Array<Array<{ name: string; taxonomy: string }>>;
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&quot;/g, '"');
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
    // Fetch recent posts (last 48 hours is the Google News sitemap standard, but we include up to 50 recent ones)
    const res = await fetch(
      `${WP_API}/posts?per_page=50&orderby=date&order=desc&_fields=slug,date,modified,title&_embed=wp:term`,
      { next: { revalidate: 900 } } // refresh every 15 minutes
    );

    if (!res.ok) {
      return new NextResponse('Error fetching posts', { status: 500 });
    }

    const posts: WPNewsPost[] = await res.json();

    // Filter to only posts from the last 48 hours (Google News requirement)
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    const recentPosts = posts.filter(post => new Date(post.date) >= cutoff);

    const urls = recentPosts.map(post => {
      const title = escapeXml(stripHtml(post.title.rendered));
      const pubDate = new Date(post.date).toISOString();

      // Get categories from embedded terms
      const categories = post._embedded?.['wp:term']?.[0]
        ?.filter(t => t.taxonomy === 'category')
        ?.map(t => t.name) || [];

      const keywordsTag = categories.length > 0
        ? `        <news:keywords>${escapeXml(categories.join(', '))}</news:keywords>\n`
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
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating news sitemap', { status: 500 });
  }
}
