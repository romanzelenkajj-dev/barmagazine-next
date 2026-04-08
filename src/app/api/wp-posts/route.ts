import { NextRequest, NextResponse } from 'next/server';
import { WP_API } from '@/lib/wordpress';

/**
 * Proxy route for client-side "Load More" requests.
 *
 * Instead of embedding the raw WP API URL (which contains the staging domain)
 * in the page HTML, category pages pass `/api/wp-posts?categories=8&per_page=12`
 * to LoadMoreGrid. This route forwards the request to the WP API and sanitises
 * the response so the staging domain never appears in any client-visible context.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Build the WP API URL from the query params
  const wpUrl = new URL(`${WP_API}/posts`);
  searchParams.forEach((value, key) => {
    wpUrl.searchParams.set(key, value);
  });

  // Always request _embed for featured images
  if (!wpUrl.searchParams.has('_embed')) {
    wpUrl.searchParams.set('_embed', 'true');
  }

  try {
    const res = await fetch(wpUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }

    const raw = await res.text();

    // Sanitise staging domain references. CDN image URLs MUST keep the
    // staging domain because barmagazine.com points to Vercel, not WordPress.
    // WP API JSON uses escaped slashes (\/) so we handle both forms.
    const STAGING = 'romanzelenka-wjgek.wpcomstaging.com';
    const sanitized = raw.replace(
      /(i[0-9]\.wp\.com\\?\/)?(romanzelenka-wjgek\.wpcomstaging\.com)(\\?\/wp-content\\?\/uploads\\?\/)?/g,
      (match: string, cdnPrefix: string | undefined, _domain: string, uploadsPath: string | undefined) => {
        if (cdnPrefix && uploadsPath) return match; // CDN upload URL → keep
        if (!cdnPrefix && uploadsPath) return `i0.wp.com/${STAGING}${uploadsPath}`; // Raw upload → wrap with CDN
        if (cdnPrefix) return match; // CDN non-upload → keep
        return 'barmagazine.com'; // Everything else → production
      }
    );

    // Forward pagination headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    const total = res.headers.get('X-WP-Total');
    const totalPages = res.headers.get('X-WP-TotalPages');
    if (total) headers.set('X-WP-Total', total);
    if (totalPages) headers.set('X-WP-TotalPages', totalPages);

    return new NextResponse(sanitized, { headers });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
