import { NextResponse, type NextRequest } from 'next/server';

/**
 * Host canonicalization.
 *
 * Any request that arrives on a non-canonical host (every .vercel.app alias,
 * including `barmagazine-next.vercel.app`, PR branch URLs, and the
 * `*-romanzelenkajj-7135s-projects.vercel.app` surface) gets a permanent 301
 * to the same path on https://barmagazine.com.
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

const CANONICAL_HOST = 'barmagazine.com';

// EU member state ISO codes — used by the /claim-your-bar currency cookie.
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();

  const isCanonical = hostname === CANONICAL_HOST || hostname === `www.${CANONICAL_HOST}`;
  const isLocal = hostname === 'localhost' || hostname.endsWith('.local');

  // Off-canonical host (vercel.app aliases, branch deploys, unknown domains) —
  // 301 to production on the same path + query.
  if (!isCanonical && !isLocal) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(url, 301);
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
