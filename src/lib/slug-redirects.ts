import { MERGED_SLUGS } from './merged-slugs';

/**
 * The two slug redirects the middleware serves, as a pure decision so the
 * tests can pin every case without spinning up the edge runtime:
 *
 *   /bars/<old>   -> /bars/<kept>   when <old> is a merged slug (MERGED_SLUGS)
 *   /<slug>       -> /bars/<slug>   when <slug> is a bar slug the A4 generator
 *                                   emitted (scripts/generate-bar-redirects.mjs,
 *                                   the old WordPress-era root URL of a listing)
 *
 * Both used to be next.config.mjs redirects and counted against Vercel's
 * 2,048-route cap. Anything else returns null and the request proceeds.
 * A trailing slash is tolerated on the way in and never emitted on the way
 * out, matching what the config rules did (trailingSlash is off).
 */
export function slugRedirectTarget(
  pathname: string,
  rootBarSlugs: ReadonlySet<string>,
  merged: Readonly<Record<string, string>> = MERGED_SLUGS,
): string | null {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  const bars = /^\/bars\/([A-Za-z0-9-]+)$/.exec(path);
  if (bars) {
    const kept = merged[bars[1]];
    return kept ? `/bars/${kept}` : null;
  }

  const root = /^\/([A-Za-z0-9-]+)$/.exec(path);
  if (root && rootBarSlugs.has(root[1])) return `/bars/${root[1]}`;

  return null;
}

/**
 * The root slugs from the generator's output file. Entries are stored as
 * { from: '/slug', to: '/bars/slug' }; only the `from` slug is needed, the
 * target is always /bars/<slug>.
 */
export function rootBarSlugsFrom(generated: { redirects?: { from?: string }[] } | null | undefined): Set<string> {
  const out = new Set<string>();
  for (const r of generated?.redirects ?? []) {
    if (typeof r.from === 'string') {
      const m = /^\/([A-Za-z0-9-]+)$/.exec(r.from);
      if (m) out.add(m[1]);
    }
  }
  return out;
}
