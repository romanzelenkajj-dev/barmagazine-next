import { NextResponse, type NextRequest } from 'next/server';
import {
  CANONICAL_HOST,
  isCanonicalHost,
  isLocalHost,
} from '@/lib/host-check';

/**
 * Host canonicalization.
 *
 * Any request that arrives on a non-canonical host (every .vercel.app alias,
 * including `barmagazine-next.vercel.app`, PR branch URLs, the
 * `*-romanzelenkajj-7135s-projects.vercel.app` surface, AND the www
 * subdomain if it ever resolves) gets a permanent 301 to the same path
 * on https://barmagazine.com.
 *
 * Why this exists:
 *  - Stops Google from ever indexing a preview/alias hostname (canonical tags
 *    alone are a hint, a 301 is a hard stop).
 *  - Prevents preview URLs from sending GA4 hits that pretend to be production
 *    traffic (combined with the host check in GoogleAnalytics.tsx).
 *  - Kills the "I shared a preview link by accident" class of bug.
 *
 * We intentionally skip:
 *  - /api/*           — server-to-server traffic (Supabase, cron, vendor)
 *  - /_next/*         — build assets
 *  - Vercel preview auth callbacks
 *
 * After the canonical-host check, the existing /claim-your-bar geo-currency
 * cookie logic runs so EU visitors still get EUR pricing.
 */

/**
 * Return HTTP 410 Gone for legacy URL classes that should never be revived.
 *
 * Currently used by /tag/* (this PR — 393 inactive WordPress tag URLs flagged
 * in Search Console "Page with redirect"). Designed so B1 (Slovak legacy
 * slugs) and B2 (/author/*) plug into the same helper when they ship.
 *
 * Plain-text body is intentional for now. A branded 410 page is part of B1
 * scope and can wrap this when designed.
 */
function serveGone(): NextResponse {
  return new NextResponse('Gone — this page is no longer available.', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// Match every variant of /tag, /tag/, /tag/foo, /tag/foo/, /tag/foo/feed/.
// Both trailing-slash and non-trailing-slash forms; works regardless of
// next.config.mjs `trailingSlash` setting.
const TAG_PATH_RE = /^\/tag(\/.*)?$/;

// Match /events/{slug} or deeper — but NOT bare /events (the events index
// page at src/app/events/page.tsx). The 5 known /events/X URLs that should
// redirect have explicit rules in next.config.mjs's redirects(), which run
// BEFORE middleware in the Next.js routing pipeline. So this regex only
// fires for unlisted /events/X URLs — legacy WordPress event taxonomy
// remnants. 410 Gone is a stronger crawler signal than 404 (permanent,
// drop from index now) and matches the /tag/* / /author/* convention.
const STALE_EVENTS_RE = /^\/events\/.+$/;

// EU member state ISO codes — used by the /claim-your-bar currency cookie.
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();

  const isCanonical = isCanonicalHost(hostname);
  const isLocal = isLocalHost(hostname);

  // Off-canonical host (vercel.app aliases, branch deploys, unknown domains,
  // www subdomain) — 301 to production on the same path + query.
  if (!isCanonical && !isLocal) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(url, 301);
  }

  // /tag/* — legacy WordPress taxonomy. Never to be revived. 410 Gone so
  // Google drops the URLs from the index instead of keeping them as redirects.
  // 393 such URLs were flagged in Search Console.
  if (TAG_PATH_RE.test(request.nextUrl.pathname)) {
    return serveGone();
  }

  // /events/{unlisted-slug} — 410. Reaches here only if no explicit redirect
  // in next.config.mjs matched (redirects() runs before middleware), so this
  // is by definition an unlisted legacy /events/X URL. Cleaner signal than
  // letting Next.js fall through to a 404 page.
  if (STALE_EVENTS_RE.test(request.nextUrl.pathname)) {
    return serveGone();
  }

  // Preserve existing geo-currency cookie on /claim-your-bar.
  if (request.nextUrl.pathname === '/claim-your-bar') {
    const country = request.geo?.country || request.headers.get('x-vercel-ip-country') || '';
    const isEU = EU_COUNTRIES.has(country.toUpperCase());
    const response = NextResponse.next();
    response.cookies.set('geo_currency', isEU ? 'EUR' : 'USD', {
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - /_next/static (bundled assets, unaffected by host)
     *   - /_next/image  (Next image optimizer)
     *   - /api          (server endpoints)
     *   - favicon.ico / manifest.json / robots.txt / sitemap*.xml (static files)
     */
    '/((?!_next/static|_next/image|api|favicon.ico|manifest.json|robots.txt|sitemap.*\\.xml).*)',
  ],
};
