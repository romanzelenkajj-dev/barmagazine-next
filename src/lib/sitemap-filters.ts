/**
 * Sitemap exclusion filters (audit items A1.1 + A1.2).
 *
 * The WP query in src/app/api/sitemap-articles/route.ts is intentionally
 * broad — fetch every published post + page. These filters are the
 * narrowing layer on top: keep editorial content, drop everything else.
 *
 * Three categories of exclusion:
 *
 *   1. Slovak legacy content (heuristic)         — pre-migration leftovers
 *   2. WP system / placeholder slugs (denylist)  — sample-page, cart, etc.
 *   3. Stub pages pending rebuild (denylist)     — /about, /contact, etc.
 *      These will be re-added once each is properly built (B4 about/contact,
 *      A2 articles, product call on the rest).
 *
 * Plus a runtime cross-reference: any slug whose `/bars/{slug}` counterpart
 * exists in Supabase is excluded — Bar Directory entries are canonical at
 * `/bars/{slug}` (see A4), so the root-level WP shadow shouldn't appear in
 * the sitemap and split ranking signals.
 *
 * Heuristic rule: when a Slovak token matches as a substring (with word
 * boundaries — see below), exclude rather than emit. The user's guidance
 * was "flag rather than emit when in doubt." False positives are easier to
 * recover from (operator notices an English article was excluded and adds
 * a token allowlist) than false negatives leaking into the sitemap.
 */

// Tested against real WP slugs:
//   "athens-bar-show-2025-celebrates-15-years-of-innovation"  — must NOT match
//   "ryan-chetiyawardana-on-innovation-at-silver-lyan"        — must NOT match
//   "50-najlepsich-barov-sveta"                                — must match
//   "casino-royale-a-dalsi"                                    — must match
//   "drinky-juznej-ameriky"                                    — must match
//
// `\b` is a JS regex word boundary (between `\w` = [A-Za-z0-9_] and `\W`).
// Slug hyphens are `\W`, so `\bnov[au]\b` matches "-nova-" / "-novu-" but
// NOT "innovation". Patterns are anchored where Slovak content typically
// places the token, not greedy substrings.
const SLOVAK_PATTERNS: RegExp[] = [
  /\bvzdelanie/i,
  /\bnajlepsi/i, // covers najlepsi, najlepsia, najlepsie, najlepsich, najlepsich
  /\bdalsi\b/i,
  /\bletne-trendy\b/i,
  /\btohto-roka\b/i,
  /\bcocktailove/i,
  /\bnov[au]\b/i, // bare nova/novu only — innovation, national, novato don't match
  /\bvydal\b/i,
  /\bjuznej\b/i, // "south" in genitive
  /\bameriky\b/i, // "America" in genitive — paired with juznej/severnej in slugs
  /\bbarov-sveta\b/i, // "bars of the world" common pattern
  /\bstorocie\b/i, // "century"
];

const WP_SYSTEM_SLUGS: ReadonlySet<string> = new Set([
  'sample-page',
  'create-your-website-with-blocks',
  'frontend-submission',
  'cart',
  'shop',
  'checkout',
  'my-account',
  'event-directory',
]);

// A1.2: pages that exist as WP stubs but are pending rebuild. Re-add to the
// sitemap when each is properly implemented:
//   /about, /contact          → after B4 ships
//   /articles                  → after A2 ships
//   /categories, /trending,
//   /most-popular              → product call on whether they stay at all
//   /privacy-policy            → already 301s to /privacy via next.config
const STUB_PAGES_PENDING_REBUILD: ReadonlySet<string> = new Set([
  'about',
  'contact',
  'privacy-policy',
  'categories',
  'articles',
  'trending',
  'most-popular',
]);

export function isSlovakSlug(slug: string): boolean {
  if (!slug) return false;
  return SLOVAK_PATTERNS.some((re) => re.test(slug));
}

export function isWpSystemSlug(slug: string): boolean {
  if (!slug) return false;
  return WP_SYSTEM_SLUGS.has(slug.toLowerCase());
}

export function isStubPagePendingRebuild(slug: string): boolean {
  if (!slug) return false;
  return STUB_PAGES_PENDING_REBUILD.has(slug.toLowerCase());
}

export type ExclusionReason =
  | 'empty'
  | 'shadows-bar-directory'
  | 'slovak-legacy'
  | 'wp-system'
  | 'stub-pending-rebuild';

export type ExclusionDecision = {
  exclude: boolean;
  reason: ExclusionReason | null;
};

/**
 * Decide whether to exclude a slug from sitemap-articles.xml.
 * Pass the set of Supabase bar slugs to enable the duplicate-content check;
 * omit it (or pass an empty set) to skip that check.
 */
export function shouldExcludeFromSitemap(
  slug: string,
  opts: { barSlugs?: ReadonlySet<string> } = {},
): ExclusionDecision {
  if (!slug) return { exclude: true, reason: 'empty' };
  if (opts.barSlugs && opts.barSlugs.has(slug)) {
    return { exclude: true, reason: 'shadows-bar-directory' };
  }
  if (isSlovakSlug(slug)) return { exclude: true, reason: 'slovak-legacy' };
  if (isWpSystemSlug(slug)) return { exclude: true, reason: 'wp-system' };
  if (isStubPagePendingRebuild(slug)) {
    return { exclude: true, reason: 'stub-pending-rebuild' };
  }
  return { exclude: false, reason: null };
}
