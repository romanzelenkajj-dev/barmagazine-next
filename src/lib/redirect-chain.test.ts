/**
 * Static analysis test for next.config.mjs redirects() —
 * catches redirect chains at build time so we never re-create the
 * /events/X → /X → /category/events 2-hop pattern fixed in the
 * "redirect cleanup" PR.
 *
 * What this catches:
 *   - A redirect whose destination is itself another rule's source
 *     (would produce a 308 → 308 chain).
 *
 * What this does NOT catch (live-mode A11 covers these):
 *   - Destinations that 404 (e.g., the historical
 *     /the-bars-of-barcelona → /category/places, where /category/places
 *     never existed).
 *   - Destinations that work today but stop working later when the route
 *     is removed.
 *
 * Together with the live-mode probe in scripts/seo-check.mjs, the two
 * checks form the A11 redirect-quality regression guard.
 */

import { describe, it, expect } from 'vitest';
// @ts-expect-error — next.config.mjs has no types but is a valid ESM module
import nextConfig from '../../next.config.mjs';

type Redirect = { source: string; destination: string; permanent?: boolean };

describe('next.config.mjs redirects()', () => {
  it('no static redirect destination is itself another redirect source (no chains)', async () => {
    const redirects: Redirect[] = await nextConfig.redirects();
    expect(redirects.length).toBeGreaterThan(0);

    // Treat the rule list as the source-of-truth set.
    const sources = new Set(redirects.map((r) => r.source));

    const chains: string[] = [];
    for (const r of redirects) {
      // Skip dynamic patterns like '/:slug' — can't statically resolve.
      if (r.destination.includes(':')) continue;
      // Skip absolute URLs (off-site redirects, n/a here but defensive).
      if (/^https?:\/\//.test(r.destination)) continue;
      if (sources.has(r.destination)) {
        chains.push(`${r.source} → ${r.destination} (which is itself a redirect source)`);
      }
    }

    if (chains.length > 0) {
      throw new Error(
        `Redirect chains detected:\n  ${chains.join('\n  ')}\n` +
          `Each costs Googlebot an extra hop. De-chain by pointing the source rule at the final destination directly.`,
      );
    }
  });

  it('the four /events/X de-chained rules go directly to /category/events', async () => {
    const redirects: Redirect[] = await nextConfig.redirects();
    const targets = [
      '/events/2025-shake-it-up-national-finals',
      '/events/tales-of-the-cocktail-2025',
      '/events/india-bar-show-2025',
      '/events/athens-bar-show-2025',
    ];

    for (const t of targets) {
      const idx = redirects.findIndex((r) => r.source === t);
      expect(idx, `${t} explicit rule missing`).toBeGreaterThan(-1);
      expect(redirects[idx].destination).toBe('/category/events');
    }
  });

  it('the /events/:slug catch-all has been removed', async () => {
    // Next.js's routing manifest does NOT honor array order for the
    // /events/:slug param-pattern vs literal /events/X siblings — the
    // catch-all was silently winning every match, even for explicit rules
    // listed before it. Including the /events/the-worlds-50-best-bars-...
    // rule that pre-dated this PR, which was a no-op for weeks.
    // Fix: remove the catch-all entirely. Explicit rules now match
    // unambiguously; unlisted /events/X URLs return 404 (correct signal
    // for crawlers to drop them, preferable to a chained 308).
    const redirects: Redirect[] = await nextConfig.redirects();
    const catchAll = redirects.find((r) => r.source === '/events/:slug');
    expect(catchAll, 'catch-all /events/:slug must not exist').toBeUndefined();
  });

  it('/the-bars-of-barcelona points at the real article, not /category/places', async () => {
    // The real WP article is at /bars-in-barcelona (id 741, "Bars in
    // Barcelona"). The previous /category/places destination 404'd because
    // 'places' isn't one of the seven live categories. /the-bars-of-barcelona
    // is a slug-variant inbound link; it should resolve to the real article.
    const redirects: Redirect[] = await nextConfig.redirects();
    const rule = redirects.find((r) => r.source === '/the-bars-of-barcelona');
    expect(rule, '/the-bars-of-barcelona rule missing').toBeDefined();
    expect(rule!.destination, 'broken: /category/places does not exist').not.toBe(
      '/category/places',
    );
    expect(rule!.destination).toBe('/bars-in-barcelona');
  });
});
