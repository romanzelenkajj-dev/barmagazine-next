/**
 * WP image-attachment URL detector + redirect target builder.
 *
 * Legacy WordPress published one URL per image asset on every post —
 * /article-slug/IMG_xxxx/, /article-slug/01-photo-name-jpg/,
 * /article-slug/attachment/8/, etc. The Next.js frontend doesn't have
 * routes for these; they're a long-tail 404 source in Search Console
 * (~150 URLs at the time of writing).
 *
 * Static redirect rules can't catch this class because the source pattern
 * `/:slug/:image*` would shadow real two-segment routes (/bars/:slug,
 * /category/:slug, /events/:slug-or-deeper). We use a runtime regex check
 * in middleware instead, with an explicit reserved-prefix denylist as the
 * safety belt.
 *
 * This module is the pure-logic core, exported so vitest can test it
 * without spinning up a NextRequest mock.
 */

/**
 * First-segment values that must NOT be redirected. The full app's
 * top-level Next.js routes plus a few static file paths. If a URL's first
 * segment is in here, leave the request alone — the route below knows what
 * to do with it.
 */
const RESERVED_TOP_LEVEL_PATHS: ReadonlySet<string> = new Set([
  // App routes
  'bars', 'bars-map', 'bars-preview',
  'category', 'tag', 'events',
  'admin', 'owner-dashboard', 'add-your-bar', 'claim-your-bar',
  'search', 'privacy', 'terms', 'work-with-us',
  // Infra
  'api', '_next', 'cdn-cgi',
  // Static-asset directories under public/ that produce /:dir/:file URLs
  // and must NEVER be classified as WP attachment URLs. Sponsor banners,
  // og images, hero photos, etc. live here. Add every public/ subdir that
  // emits two-segment paths; missing one will cause a sponsor 404 (as
  // happened in PR #52 — /banners/flavour-blaster.jpg got matched and
  // 301'd to /banners → 404, breaking the Flavour Blaster + Pampero Rum
  // banners on every article page).
  'banners', 'images',
  // Static files (matcher in middleware.ts already excludes most, but
  // belt-and-suspenders against future matcher changes)
  'sitemap.xml', 'sitemap-articles.xml', 'sitemap-bars.xml',
  'sitemap-news.xml', 'sitemap-categories.xml',
  'robots.txt', 'favicon.ico', 'manifest.json',
]);

/**
 * Image-attachment second-segment shapes. Each matches a known WP
 * attachment-URL pattern. Applied case-insensitively where appropriate.
 *
 * `attachment(/N)?` is special — it's the only multi-segment match in the
 * set. We compare against `segs.slice(1).join('/')` so the pattern handles
 * both /foo/attachment and /foo/attachment/8 from a single regex.
 */
const ATTACHMENT_TAIL_PATTERNS: ReadonlyArray<RegExp> = [
  /^\d+-/,                       // 01-photo, 1234-foo
  /^img_/i,                      // IMG_xxxx, img_xxxx
  /^dsc/i,                       // dsc09381, DSC...
  /^0i7a/i,                      // 0i7a3499 (Canon EOS filename prefix)
  /-(?:jpg|jpeg|png|gif)$/i,     // ...-jpg, ...-png (dash-prefix only; WP
                                 // attachment slugs use this shape, no dot).
                                 // Hot-removed in the post-#52 banner-asset
                                 // hotfix: the dotted form `/\.(jpg|png|…)$/`
                                 // was over-broad — it caught real image
                                 // files in public/banners/, public/images/,
                                 // public/og-*.jpg etc., 301'ing them to a
                                 // dead parent path. Real WP attachment URLs
                                 // empirically use the dash form; if a dotted
                                 // case appears in GSC, add an explicit
                                 // narrower regex (e.g. `/\d+\.jpg$/`).
  /^attachment(?:\/\d+)?$/,      // attachment, attachment/8
  /^untitled/i,
  /^screen-?shot/i,              // screen-shot, screenshot
  /^copy-of/i,
  /^copia-de/i,                  // Spanish variant on a few legacy posts
  /^evoto$/i,                    // photo-edit tool default filename
  /^bca-/i,                      // Bartenders' Choice Awards photo dump prefix
  /^p\d+$/i,                     // WP default page number (p1, p42)
];

/**
 * If `pathname` matches a WP image-attachment URL shape that should
 * redirect back to its parent article, returns the redirect target path.
 * Otherwise returns null.
 *
 *   /article-slug/IMG_001         → '/article-slug'
 *   /article-slug/attachment/8    → '/article-slug'
 *   /bars/atwater-cocktail-club   → null (reserved first segment)
 *   /article-slug/foo             → null (foo doesn't match any pattern)
 *   /article-slug                 → null (only one segment)
 */
export function attachmentRedirectTarget(pathname: string): string | null {
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length < 2) return null;
  if (RESERVED_TOP_LEVEL_PATHS.has(segs[0])) return null;
  const tail = segs.slice(1).join('/');
  if (!ATTACHMENT_TAIL_PATTERNS.some((re) => re.test(tail))) return null;
  return `/${segs[0]}`;
}
