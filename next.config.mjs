import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// A4: load the build-time-generated /{slug} → /bars/{slug} redirects from
// scripts/generate-bar-redirects.mjs (auto-runs in `prebuild`). The file is
// gitignored — Supabase is the source of truth, regenerated on every deploy.
function loadBarRedirects() {
  try {
    const txt = readFileSync(
      join(__dirname, 'src/lib/bar-redirects.generated.json'),
      'utf8',
    );
    const data = JSON.parse(txt);
    return Array.isArray(data?.redirects) ? data.redirects : [];
  } catch {
    console.warn(
      '[next.config] src/lib/bar-redirects.generated.json missing — ' +
        '/{slug} → /bars/{slug} redirects disabled. Run ' +
        '`node scripts/generate-bar-redirects.mjs` (auto-runs in prebuild / Vercel CI).',
    );
    return [];
  }
}

const barRedirects = loadBarRedirects().map((r) => ({
  source: r.from,
  destination: r.to,
  permanent: true,
}));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'barmagazine.com',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      // NOTE: romanzelenka-wjgek.wpcomstaging.com removed — all image URLs
      // are now rewritten to barmagazine.com via sanitizeResponse() in wordpress.ts
    ],
  },
  // 301 redirects: old WordPress URLs → new Next.js equivalents
  async redirects() {
    return [
      // Sub-category consolidations
      { source: '/category/spirits', destination: '/category/brands', permanent: true },
      { source: '/category/wines', destination: '/category/brands', permanent: true },
      { source: '/category/mocktails', destination: '/category/cocktails', permanent: true },
      { source: '/category/interviews', destination: '/category/people', permanent: true },
      { source: '/category/books', destination: '/category/people', permanent: true },

      // Categories that don't exist in WordPress
      { source: '/category/news', destination: '/category/events', permanent: true },
      { source: '/category/features', destination: '/', permanent: true },
      // /category/latest — users click "Latest" nav link expecting this path
      { source: '/category/latest', destination: '/', permanent: true },

      // ---------------------------------------------------------------
      // Broken city slugs — toUrlSlug used to drop accented chars (ã → '')
      // instead of transliterating them (ã → 'a'), producing slugs like
      // 's-o-paulo' for "São Paulo". Fixed in src/lib/utils.ts; these
      // 301s redirect any inbound links / cached search results from the
      // broken slugs to the new correct ASCII slugs.
      // ---------------------------------------------------------------
      { source: '/bars/city/s-o-paulo', destination: '/bars/city/sao-paulo', permanent: true },
      { source: '/bars/city/m-xico', destination: '/bars/city/mexico', permanent: true },
      { source: '/bars/city/c-rdoba', destination: '/bars/city/cordoba', permanent: true },
      { source: '/bars/city/m-laga', destination: '/bars/city/malaga', permanent: true },
      { source: '/bars/city/canc-n', destination: '/bars/city/cancun', permanent: true },
      { source: '/bars/city/bogot', destination: '/bars/city/bogota', permanent: true },
      { source: '/bars/city/medell-n', destination: '/bars/city/medellin', permanent: true },
      { source: '/bars/city/bras-lia', destination: '/bars/city/brasilia', permanent: true },
      { source: '/bars/city/d-sseldorf', destination: '/bars/city/dusseldorf', permanent: true },
      { source: '/bars/city/z-rich', destination: '/bars/city/zurich', permanent: true },
      { source: '/bars/city/reykjav-k', destination: '/bars/city/reykjavik', permanent: true },
      { source: '/bars/city/asunci-n', destination: '/bars/city/asuncion', permanent: true },
      { source: '/bars/city/cura-ao', destination: '/bars/city/curacao', permanent: true },
      { source: '/bars/city/quer-taro', destination: '/bars/city/queretaro', permanent: true },
      { source: '/bars/city/val-ncia', destination: '/bars/city/valencia', permanent: true },
      { source: '/bars/city/m-rida', destination: '/bars/city/merida', permanent: true },

      // Broken bar slugs — old URLs with accented/garbled characters redirected to clean ASCII slugs
      { source: '/bars/m%C3%A9lange-by-cali-sober', destination: '/bars/melange-by-cali-sober', permanent: true },
      { source: '/bars/mlange-by-cali-sober', destination: '/bars/melange-by-cali-sober', permanent: true },
      { source: '/bars/caf%C3%A9-de-nadie', destination: '/bars/cafe-de-nadie', permanent: true },
      { source: '/bars/caf%C3%A9-la-trova', destination: '/bars/cafe-la-trova', permanent: true },
      { source: '/bars/comp%C3%A8re-lapin', destination: '/bars/compere-lapin', permanent: true },
      { source: '/bars/deux-fr%C3%A8res', destination: '/bars/deux-freres', permanent: true },
      { source: '/bars/m%C3%ADrate', destination: '/bars/mirate', permanent: true },
      { source: '/bars/virt%C3%B9', destination: '/bars/virtu', permanent: true },
      { source: '/bars/alqu-mico', destination: '/bars/alquimico', permanent: true },
      { source: '/bars/bar-des-prs', destination: '/bars/bar-des-pres', permanent: true },
      { source: '/bars/bar-le-mal-ncessaire', destination: '/bars/bar-le-mal-necessaire', permanent: true },
      { source: '/bars/bootlegger-cocktail-bar-cuisine-montral', destination: '/bars/bootlegger-cocktail-bar-cuisine-montreal', permanent: true },
      { source: '/bars/caf-de-la-paix', destination: '/bars/cafe-de-la-paix', permanent: true },
      { source: '/bars/caf-pacifico', destination: '/bars/cafe-pacifico', permanent: true },
      { source: '/bars/barmnster', destination: '/bars/barmunster', permanent: true },
      { source: '/bars/florera-atlntico', destination: '/bars/floreria-atlantico', permanent: true },
      // TODO: redundant since PR #18 renamed the Supabase slug to 'kwant' —
      // the source URL no longer maps to anything. Harmless to keep; sweep
      // up next time we materially edit this redirect list.
      { source: '/bars/kw%C3%A3nt', destination: '/bars/kwant', permanent: true },

      // Old WordPress pages
      { source: '/trending', destination: '/', permanent: true },
      { source: '/about', destination: '/work-with-us', permanent: true },
      { source: '/contact', destination: '/work-with-us', permanent: true },
      { source: '/homepage', destination: '/', permanent: true },

      // FIX: intuitive URLs that were returning 404 — users type these, external sites link to them
      { source: '/bar-directory', destination: '/bars', permanent: true },
      { source: '/list-your-bar', destination: '/claim-your-bar', permanent: true },
      { source: '/cocktails', destination: '/category/cocktails', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/advertise', destination: '/work-with-us', permanent: true },

      // Specific bar pages that 404 — redirect to bar directory
      { source: '/bars/the-dead-rabbit', destination: '/bars', permanent: true },

      // /home and /home/ → homepage
      { source: '/home', destination: '/', permanent: true },
      { source: '/home/', destination: '/', permanent: true },

      // Category pages that 404 — redirect to closest equivalent
      { source: '/category/wine', destination: '/category/brands', permanent: true },
      { source: '/category/wine/', destination: '/category/brands', permanent: true },
      { source: '/category/interview', destination: '/category/people', permanent: true },
      { source: '/category/interview/', destination: '/category/people', permanent: true },

      // Paginated article pages → canonical article URL
      { source: '/:slug/2', destination: '/:slug', permanent: true },
      { source: '/:slug/3', destination: '/:slug', permanent: true },
      { source: '/:slug/4', destination: '/:slug', permanent: true },
      { source: '/:slug/5', destination: '/:slug', permanent: true },

      // Author pages (no equivalent in new site)
      { source: '/author/:slug', destination: '/', permanent: true },

      // Tag pages (no equivalent in new site)
      { source: '/tag/:slug', destination: '/', permanent: true },

      // Specific /events/* redirects — MUST come before the /events/:slug catch-all below
      { source: '/events/the-worlds-50-best-bars-2025-live-from-hong-kong', destination: '/worlds-50-best-bars-2025-bar-leone-tops-the-list', permanent: true },
      { source: '/events/the-worlds-50-best-bars-2025-live-from-hong-kong/', destination: '/worlds-50-best-bars-2025-bar-leone-tops-the-list', permanent: true },

      // Old event sub-pages → article slugs
      { source: '/events/:slug', destination: '/:slug', permanent: true },

      // Article URL fixes — truncated slugs shared in the wild
      // BCA 2026: people shared /bartenders-choice-awards-2026 (truncated from the full slug)
      { source: '/bartenders-choice-awards-2026', destination: '/bartenders-choice-awards-2026-all-the-winners', permanent: true },

      // WordPress infrastructure paths
      { source: '/feed', destination: '/', permanent: true },
      { source: '/wp-login.php', destination: '/', permanent: false },
      { source: '/wp-admin', destination: '/', permanent: false },

      // ---------------------------------------------------------------
      // Legacy WordPress (Yoast) sitemap URLs — still hit ~25x/day by
      // Googlebot/Bingbot per logs. Each was 404ing and eating crawl
      // budget. Point them all at the current sitemap index so crawlers
      // discover the new structure without a dead-end.
      // ---------------------------------------------------------------
      { source: '/sitemap.rss', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/post-sitemap.xml', destination: '/sitemap-articles.xml', permanent: true },
      { source: '/post-sitemap1.xml', destination: '/sitemap-articles.xml', permanent: true },
      { source: '/post-sitemap2.xml', destination: '/sitemap-articles.xml', permanent: true },
      { source: '/post-archive-sitemap.xml', destination: '/sitemap-articles.xml', permanent: true },
      { source: '/page-sitemap.xml', destination: '/sitemap-articles.xml', permanent: true },
      { source: '/category-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/event_organizer-sitemap.xml', destination: '/sitemap-bars.xml', permanent: true },
      { source: '/news-sitemap.xml', destination: '/sitemap-news.xml', permanent: true },
      { source: '/author-sitemap.xml', destination: '/sitemap.xml', permanent: true },

      // Orphan category pages still linked externally
      { source: '/category/all-about', destination: '/', permanent: true },
      { source: '/category/all-about/:slug*', destination: '/', permanent: true },
      { source: '/most-popular', destination: '/', permanent: true },
      { source: '/most-popular/', destination: '/', permanent: true },

      // ---------------------------------------------------------------
      // Bar slugs that 404'd in Search Console. Each one is either a
      // rename, an accent-strip, or a bar we haven't migrated yet —
      // send to /bars so the user lands on something useful.
      // ---------------------------------------------------------------
      { source: '/bars/seed-library', destination: '/bars', permanent: true },
      { source: '/bars/satan-s-whiskers', destination: '/bars/satans-whiskers', permanent: true },
      { source: '/bars/virt', destination: '/bars/virtu', permanent: true },
      { source: '/bars/eau-de-vie-bar-melbourne', destination: '/bars/eau-de-vie-melbourne', permanent: true },
      { source: '/bars/attaboy-nashville', destination: '/bars', permanent: true },
      { source: '/bars/employees-only-singapore', destination: '/bars', permanent: true },
      { source: '/bars/the-savory-project-shanghai', destination: '/bars/the-savory-project', permanent: true },

      // ---------------------------------------------------------------
      // Articles that exist on old WP but weren't migrated — redirect
      // to the best-fit landing so Google stops showing 404s. Review
      // quarterly: when content is re-added, drop the redirect.
      // ---------------------------------------------------------------
      { source: '/2025-shake-it-up-national-finals', destination: '/category/events', permanent: true },
      { source: '/tales-of-the-cocktail-2025', destination: '/category/events', permanent: true },
      { source: '/athens-bar-show-2025', destination: '/category/events', permanent: true },
      { source: '/india-bar-show-2025', destination: '/category/events', permanent: true },
      { source: '/the-bars-of-barcelona', destination: '/category/places', permanent: true },
      { source: '/the-art-of-wine-production', destination: '/category/brands', permanent: true },
      { source: '/drinky-juznej-ameriky', destination: '/category/cocktails', permanent: true },

      // ---------------------------------------------------------------
      // A4: /{bar-slug} → /bars/{bar-slug} (301, permanent).
      // Generated at build time from Supabase (active bars) cross-checked
      // against WP post/page slugs to avoid clobbering real editorial URLs.
      // See scripts/generate-bar-redirects.mjs.
      // ---------------------------------------------------------------
      ...barRedirects,
    ];
  },
  // Prevent browsers from caching stale favicons
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
      {
        source: '/favicon-:size.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
    ];
  },
  // Proxy /wp-content/uploads/* to WordPress.com CDN so old image URLs still work
  async rewrites() {
    return [
      // Sitemap index — replaces the Next.js auto-generated /sitemap.xml
      // with a proper <sitemapindex> referencing all three sub-sitemaps.
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap-index',
      },
      // Articles sub-sitemap (WordPress posts + static pages + category pages)
      {
        source: '/sitemap-articles.xml',
        destination: '/api/sitemap-articles',
      },
      {
        source: '/sitemap-news.xml',
        destination: '/api/sitemap-news',
      },
      {
        source: '/sitemap-bars.xml',
        destination: '/api/sitemap-bars',
      },
      {
        source: '/partner',
        destination: '/partner.html',
      },
      {
        source: '/wp-content/uploads/:path*',
        destination: 'https://i0.wp.com/barmagazine.com/wp-content/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
