import { NextResponse, type NextRequest } from 'next/server';
import {
  CANONICAL_HOST,
  isCanonicalHost,
  isLocalHost,
} from '@/lib/host-check';
import { attachmentRedirectTarget } from '@/lib/attachment-redirect';
import { CURRENCY_COOKIE, currencyFromCountry } from '@/lib/geo-currency';

/**
 * Host canonicalization.
 *
 * Any request that arrives on a non-canonical host (every .vercel.app alias,
 * including `barmagazine-next.vercel.app`, PR branch URLs, the
 * `*-romanzelenkajj-7135s-projects.vercel.app` surface, AND the www
 * subdomain if it ever resolves) gets a permanent 308 to the same path
 * on https://barmagazine.com, with an X-Robots-Tag: noindex on the redirect.
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

// EU detection + currency resolution moved to src/lib/geo-currency.ts so
// SSR server components (e.g. /feature-your-bar) can share the same logic.

// Pages that need the geo→currency cookie set on first visit.
// Read by the corresponding page's server component so it can render the
// right currency in initial HTML (matches the SSR requirement for the
// /feature-your-bar landing page).
const GEO_CURRENCY_PATHS: ReadonlySet<string> = new Set([
  '/claim-your-bar',
  '/feature-your-bar',
]);

export function middleware(request: NextRequest) {
  // TEMPORARY bot forensics (2026-09-01): GA shows ~70% of traffic is a
  // Singapore datacenter bot. The CLI's request logs carry no client
  // IP/UA, so we log a compact fingerprint here to identify its signature
  // for a firewall rule. Remove once the rule is verified.
  try {
    const h = request.headers;
    console.log('BOTFP ' + JSON.stringify({
      ip: h.get('x-real-ip') || h.get('x-forwarded-for'),
      co: h.get('x-vercel-ip-country'),
      ci: h.get('x-vercel-ip-city'),
      ua: (h.get('user-agent') || '').slice(0, 140),
      asn: h.get('x-vercel-ip-as-number'),
      ja4: h.get('x-vercel-ja4-digest'),
      xv: (() => { const ks: string[] = []; h.forEach((_, k) => { if (k.startsWith('x-vercel-')) ks.push(k); }); return ks.join(','); })(),
      p: request.nextUrl.pathname.slice(0, 60),
    }));
  } catch { /* forensics must never break routing */ }

  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();

  const isCanonical = isCanonicalHost(hostname);
  const isLocal = isLocalHost(hostname);

  // Off-canonical host (vercel.app aliases, branch deploys, unknown domains,
  // www subdomain) — 308 to production on the same path + query. 308 (not 301)
  // preserves the request method and matches the next.config redirects(), which
  // emit 308 for `permanent: true`, so the whole site speaks one dialect.
  // Staging = any Vercel PREVIEW deployment (branch deploys), or an explicit
  // STAGING=1 env (separate staging project). Disables the canonical-host
  // redirect so the clone is browsable on its *.vercel.app URL. Staging
  // responses are always tagged noindex below so the clone can never leak
  // into search engines. Production deployments are unaffected: VERCEL_ENV
  // is 'production' there and STAGING is never set.
  const isStaging = process.env.VERCEL_ENV === 'preview' || process.env.STAGING === '1';

  if (!isCanonical && !isLocal && !isStaging) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    const response = NextResponse.redirect(url, 308);
    // Belt-and-suspenders: the redirect alone stops indexing of the alias, but
    // tag the response noindex too so any crawler that logs the non-canonical
    // URL (preview / *.vercel.app / branch deploy) is told not to index it.
    response.headers.set('X-Robots-Tag', 'noindex');
    return response;
  }

  if (isStaging) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // /tag/* — legacy WordPress taxonomy. Never to be revived. 410 Gone so
  // Google drops the URLs from the index instead of keeping them as redirects.
  // 393 such URLs were flagged in Search Console.
  if (TAG_PATH_RE.test(request.nextUrl.pathname)) {
    return serveGone();
  }

  // /events/{unlisted-slug} — 301 to /category/events. Reaches here only if
  // no explicit redirect in next.config.mjs matched (redirects() runs before
  // middleware). The 2026-05 404-cleanup batch flipped this from 410 to 301
  // because the long-tail GSC report showed enough legitimate inbound links
  // to events that crawl-equity preservation outweighs the "drop from index"
  // signal of 410.
  //
  // We deliberately do NOT re-add a `/events/:slug → /category/events` rule
  // in next.config.mjs. Next.js's routing manifest does not honor array
  // order for the catch-all-vs-literal case (the bug fixed in PR #22 —
  // catch-all silently ate every explicit /events/X rule, including the
  // worlds-50-best one that points at a real article). Doing the redirect
  // in middleware lets the explicit literal rules in next.config keep
  // winning unambiguously while we still catch the long tail here.
  if (STALE_EVENTS_RE.test(request.nextUrl.pathname)) {
    return NextResponse.redirect(
      new URL('/category/events', request.url),
      301,
    );
  }

  // WP image-attachment URLs (/article-slug/IMG_001/, .../attachment/8/,
  // .../01-photo-jpg/, etc.) — biggest 404 class in the GSC report. Detect
  // via pattern match on the second segment; redirect to the parent article.
  // Reserved top-level prefixes (bars, category, events, …) are passed
  // through unchanged so real 2-segment routes aren't shadowed.
  const attachmentTarget = attachmentRedirectTarget(request.nextUrl.pathname);
  if (attachmentTarget) {
    return NextResponse.redirect(new URL(attachmentTarget, request.url), 301);
  }

  // Set the geo→currency cookie on pages that price in EUR/USD.
  // /claim-your-bar reads it client-side; /feature-your-bar reads it
  // server-side (SSR) for first-paint correctness.
  if (GEO_CURRENCY_PATHS.has(request.nextUrl.pathname)) {
    const country = request.geo?.country || request.headers.get('x-vercel-ip-country') || '';
    const currency = currencyFromCountry(country);
    const response = NextResponse.next();
    response.cookies.set(CURRENCY_COOKIE, currency, {
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
