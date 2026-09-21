// RULE: anything that inspects this file must evaluate nextConfig.redirects(),
// never parse it as text. The rules below are composed with `barRedirects`,
// imported from a generated JSON file, so they do not exist as literal text
// here. A regex audit on 2026-09-14 saw 20 of 47 /bars/ rules and reported a
// confident answer on 43% of the data. See claude/data-checks.md.
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
      // ---- Merged bar slugs (STANDARD STEP for every duplicate merge) ----
      // When two bar rows are merged, the losing slug 301s to the kept one
      // so a previously-live profile URL never 404s. Procedure: merge data
      // into the richer row, append the pair here in the same commit, then
      // hard-delete the duplicate row (after confirming no bar_claims /
      // owner_submissions rows reference it) and note it in
      // claude/implementation-status.md. Duplicates are deleted; closures
      // stay in the table as inactive history.
      ...[
        ['kwant-mayfair', 'kwant'],
        ['la-petite-maison', 'lpm-dubai'],
        ['black-swan-lab', 'black-swan-budapest'],
        ['the-carousel-bar', 'carousel-bar-lounge'],
        ['zig-zag-cafe-seattle', 'zig-zag-cafe'],
        // Not a duplicate listing but a sub-venue: Hudson Bar was the Hudson
        // private room INSIDE Hotsy Totsy, same address and same website,
        // listed as a bar of its own. Same treatment as a duplicate.
        ['hudson-bar-budapest', 'hotsy-totsy'],
        // Svanen, Oslo. BOTH of these were duplicate rows from the 20 March
        // wave, deactivated back when duplicates were hidden rather than
        // deleted. The live bar has always been `svanen`, created 18 March.
        // I renamed the dead row svanen-stockholm -> svanen-oslo before
        // checking is_active, so both slugs have to land on the live one.
        ['svanen-stockholm', 'svanen'],
        ['svanen-oslo', 'svanen'],
        // ---- The 20 March wave duplicates (merged 2026-09-21) ----
        // `status` was added to bars long after these rows were hidden and
        // defaulted every existing row to 'open', which is why they read as
        // "inactive and open" and looked like a hidden-bar bug. They are
        // pre-merge-standard-v2 duplicates, from the era when a duplicate was
        // deactivated rather than deleted. Each verified as one bar by a
        // matching ADDRESS, not by name alone, before deleting.
        ['28-hongkong-street', '28-hong-kong-street'],
        ['bar-878', '878-bar'],
        ['bar-le-mal-necessaire', 'le-mal-necessaire'],
        ['bar-les-ambassadeurs', 'les-ambassadeurs'],
        ['cane-and-table', 'cane-table'],
        ['cloakroom', 'the-cloakroom'],
        ['customs-house-bar', 'customs-house-bar-sydney'],
        ['dangerous-water', 'dangerous-water-palma-de-mallorca'],
        ['dry-martini', 'dry-martini-by-javier-de-las-muelas'],
        ['duck-and-cover-cocktailbar', 'duck-and-cover'],
        ['gucci-bar', 'gucci-giardino'],
        ['hanky-panky-cocktail-bar', 'hanky-panky'],
        ['high-five', 'bar-high-five'],
        ['mother-cocktail-bar', 'mother'],
        ['nouveau-vague', 'bar-nouveau'],
        ['rekabar', 'reka-bar'],
        ['rita-cocktails', 'rita'],
        ['the-7-jokers-cocktail-bar', 'the-7-jokers'],
        ['to-infinity-and-beyond', 'to-infinity-beyond'],
        ['viajante87', 'viajante-87'],
        // Not a spelling duplicate but a CITY CONTAMINATION: the row named a
        // city the bar has no branch in. Confirmed against each venue's own
        // site, which lists one location only.
        ['d-bespoke', 'd-bespoke-singapore'],
        ['sastreria-martinez', 'sastrer-a-martinez'],
        // Coa Shanghai is NOT a duplicate of Coa Hong Kong: different city,
        // different address, its own Asia's 50 Best ranking. The timestamp
        // suffix is what the insert appends on a slug collision, so this is
        // a corrected slug on a real bar, not a merge.
        ['coa-shanghai-1773995982', 'coa-shanghai'],
      ].map(([from, to]) => ({
        source: `/bars/${from}`,
        destination: `/bars/${to}`,
        permanent: true,
      })),
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
      // A6: /category/awards-events was the OLD WP slug before WP renamed
      // the category to 'awards'. Both URLs were serving the same content
      // (canonical drift). Consolidate to /category/awards.
      { source: '/category/awards-events', destination: '/category/awards', permanent: true },
      { source: '/category/awards-events/', destination: '/category/awards', permanent: true },

      // ---------------------------------------------------------------
      // Broken city slugs — toUrlSlug used to drop accented chars (ã → '')
      // instead of transliterating them (ã → 'a'), producing slugs like
      // 's-o-paulo' for "São Paulo". Fixed in src/lib/utils.ts; these
      // 301s redirect any inbound links / cached search results from the
      // broken slugs to the new correct ASCII slugs.
      // ---------------------------------------------------------------
      // Accent-stripped city URLs. A rule here may only point at
      // /bars/city/<x> while we actually LIST bars in that city, because the
      // city route 404s when it has none. The ones marked "was ..." below
      // were repointed to /bars on 2026-09-14 when the chain check found
      // them resolving cleanly and then dying on a 404; restore the original
      // target if we ever list bars there again.
      { source: '/bars/city/s-o-paulo', destination: '/bars/city/sao-paulo', permanent: true },
      { source: '/bars/city/m-xico', destination: '/bars', permanent: true }, // was /bars/city/mexico
      { source: '/bars/city/c-rdoba', destination: '/bars', permanent: true }, // was /bars/city/cordoba
      { source: '/bars/city/m-laga', destination: '/bars', permanent: true }, // was /bars/city/malaga
      { source: '/bars/city/canc-n', destination: '/bars', permanent: true }, // was /bars/city/cancun
      // Same-name cities (2026-09-15, src/lib/city-keys.ts): the bare slug
      // 301s to the row that held the page first. portland-maine was the
      // interim qualified string, live for a few hours and in the sitemap.
      { source: '/bars/city/portland', destination: '/bars/city/portland-or', permanent: true },
      { source: '/bars/city/portland-maine', destination: '/bars/city/portland-me', permanent: true },
      { source: '/bars/city/birmingham', destination: '/bars/city/birmingham-gb', permanent: true },
      { source: '/bars/city/bogot', destination: '/bars/city/bogota', permanent: true },
      { source: '/bars/city/medell-n', destination: '/bars/city/medellin', permanent: true },
      { source: '/bars/city/bras-lia', destination: '/bars', permanent: true }, // was /bars/city/brasilia
      { source: '/bars/city/d-sseldorf', destination: '/bars', permanent: true }, // was /bars/city/dusseldorf
      { source: '/bars/city/z-rich', destination: '/bars/city/zurich', permanent: true },
      { source: '/bars/city/reykjav-k', destination: '/bars/city/reykjavik', permanent: true },
      { source: '/bars/city/asunci-n', destination: '/bars', permanent: true }, // was /bars/city/asuncion
      { source: '/bars/city/cura-ao', destination: '/bars', permanent: true }, // was /bars/city/curacao
      { source: '/bars/city/quer-taro', destination: '/bars', permanent: true }, // was /bars/city/queretaro
      { source: '/bars/city/val-ncia', destination: '/bars', permanent: true }, // was /bars/city/valencia
      { source: '/bars/city/m-rida', destination: '/bars', permanent: true }, // was /bars/city/merida

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
      { source: '/bars/bar-le-mal-ncessaire', destination: '/bars/le-mal-necessaire', permanent: true },
      { source: '/bars/bootlegger-cocktail-bar-cuisine-montral', destination: '/bars/bootlegger-cocktail-bar-cuisine-montreal', permanent: true },
      { source: '/bars/caf-de-la-paix', destination: '/bars/cafe-de-la-paix', permanent: true },
      { source: '/bars/caf-pacifico', destination: '/bars', permanent: true },
      { source: '/bars/barmnster', destination: '/bars/barmunster', permanent: true },
      { source: '/bars/florera-atlntico', destination: '/bars/floreria-atlantico', permanent: true },
      // TODO: redundant since PR #18 renamed the Supabase slug to 'kwant' —
      // the source URL no longer maps to anything. Harmless to keep; sweep
      // up next time we materially edit this redirect list.
      { source: '/bars/kw%C3%A3nt', destination: '/bars/kwant', permanent: true },

      // Old WordPress pages
      { source: '/trending', destination: '/', permanent: true },
      // NOTE: a '/about/' one-hop rule is impossible here - Next's
      // trailing-slash normalization 308s '/about/' to '/about' BEFORE
      // redirects() rules run, so slash forms always chain through the bare
      // path. Both hops are permanent 308s; GSC processes the chain fine.
      { source: '/about', destination: '/work-with-us', permanent: true },
      { source: '/contact', destination: '/work-with-us', permanent: true },
      { source: '/homepage', destination: '/', permanent: true },

      // FIX: intuitive URLs that were returning 404 — users type these, external sites link to them
      { source: '/bar-directory', destination: '/bars', permanent: true },
      // /list-your-bar → /feature-your-bar (direct, no chain). The old
      // /claim-your-bar destination was renamed to /feature-your-bar in the
      // landing-page rebuild — we point /list-your-bar at the new canonical
      // directly so this isn't a redirect chain through /claim-your-bar.
      { source: '/list-your-bar', destination: '/feature-your-bar', permanent: true },
      // /claim-your-bar is a real page again — the free search-and-claim flow.
      // It redirected to /feature-your-bar only while the slug held nothing but
      // stale pricing content; claiming is free, so a pricing page is now the
      // wrong destination. Both redirects removed with the rebuilt page, in the
      // same commit, so the slug is never briefly serving the old pricing copy.
      // NOTE: these were permanent redirects and cache hard — verify in a fresh
      // browser profile, not one that already followed them.
      { source: '/cocktails', destination: '/category/cocktails', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/advertise', destination: '/work-with-us', permanent: true },

      // Specific bar pages that 404 — redirect to bar directory
      { source: '/bars/the-dead-rabbit', destination: '/bars/dead-rabbit', permanent: true },

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
      // NOTE: still 301 to homepage. B2 will switch this to a 410 via
      // middleware (same handler /tag/* now uses).
      { source: '/author/:slug', destination: '/', permanent: true },

      // /tag/* legacy WordPress taxonomy URLs are now handled by
      // src/middleware.ts (returns 410 Gone). 393 such URLs were flagged in
      // GSC "Page with redirect"; switching from a soft 301-to-home to 410
      // tells Google to drop them from the index entirely.

      // Specific /events/* redirects — MUST come before the /events/:slug catch-all below.
      { source: '/events/the-worlds-50-best-bars-2025-live-from-hong-kong', destination: '/worlds-50-best-bars-2025-bar-leone-tops-the-list', permanent: true },
      { source: '/events/the-worlds-50-best-bars-2025-live-from-hong-kong/', destination: '/worlds-50-best-bars-2025-bar-leone-tops-the-list', permanent: true },

      // De-chain: these slugs already redirect at root /{slug} → /category/events
      // (see lines below). The /events/{slug} catch-all would 308 to /{slug}
      // which then 308s again to /category/events — 2 hops, wasted crawl
      // budget. Single-hop direct to the final destination instead. Both
      // trailing-slash and bare forms because Next runs redirects() before
      // its trailing-slash normalization.
      { source: '/events/2025-shake-it-up-national-finals', destination: '/category/events', permanent: true },
      { source: '/events/2025-shake-it-up-national-finals/', destination: '/category/events', permanent: true },
      { source: '/events/tales-of-the-cocktail-2025', destination: '/category/events', permanent: true },
      { source: '/events/tales-of-the-cocktail-2025/', destination: '/category/events', permanent: true },
      { source: '/events/india-bar-show-2025', destination: '/category/events', permanent: true },
      { source: '/events/india-bar-show-2025/', destination: '/category/events', permanent: true },
      { source: '/events/athens-bar-show-2025', destination: '/athens-bar-show-2025-celebrates-15-years-of-innovation', permanent: true },
      { source: '/events/athens-bar-show-2025/', destination: '/athens-bar-show-2025-celebrates-15-years-of-innovation', permanent: true },

      // NOTE: the previous `/events/:slug` catch-all has been REMOVED.
      // Next.js's routing manifest didn't honor array order for that rule's
      // precedence — the catch-all silently ate every explicit /events/X
      // redirect (including /events/the-worlds-50-best-bars-... above, which
      // was effectively a no-op since it was added). Removing the catch-all
      // means an unlisted /events/X URL now 404s, which is the correct
      // signal for crawlers to drop the URL — preferable to a chained 308.
      // Add explicit rules for any /events/X URL that needs redirecting.

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
      // WHEN A BAR HERE IS ACTUALLY LISTED, DROP ITS LINE: a redirect on
      // a live slug shadows the real profile. attaboy-nashville and
      // employees-only-singapore were removed on 2026-09-14 for exactly
      // that reason, when both outposts were inserted as their own rows.
      // ---------------------------------------------------------------
      { source: '/bars/satan-s-whiskers', destination: '/bars/satans-whiskers', permanent: true },
      { source: '/bars/virt', destination: '/bars/virtu', permanent: true },
      { source: '/bars/eau-de-vie-bar-melbourne', destination: '/bars', permanent: true },
      { source: '/bars/the-savory-project-shanghai', destination: '/bars/the-savory-project', permanent: true },

      // ---------------------------------------------------------------
      // Articles that exist on old WP but weren't migrated — redirect
      // to the best-fit landing so Google stops showing 404s. Review
      // quarterly: when content is re-added, drop the redirect.
      // ---------------------------------------------------------------
      { source: '/2025-shake-it-up-national-finals', destination: '/category/events', permanent: true },
      { source: '/tales-of-the-cocktail-2025', destination: '/category/events', permanent: true },
      { source: '/athens-bar-show-2025', destination: '/athens-bar-show-2025-celebrates-15-years-of-innovation', permanent: true },
      { source: '/india-bar-show-2025', destination: '/category/events', permanent: true },
      // Was '/category/places' (404 — no such category). The real article
      // is 'Bars in Barcelona' at /bars-in-barcelona (WP post id 741);
      // /the-bars-of-barcelona is a slug-variant inbound link that should
      // resolve to the actual article, not a category page.
      { source: '/the-bars-of-barcelona', destination: '/bars-in-barcelona', permanent: true },
      { source: '/the-art-of-wine-production', destination: '/category/brands', permanent: true },
      { source: '/drinky-juznej-ameriky', destination: '/category/cocktails', permanent: true },

      // ---------------------------------------------------------------
      // 2026-05 404-cleanup batch — 175 URLs from a Search Console export
      // surfaced as legacy-WordPress 404 patterns. Adding the redirects
      // in-place; the WP image-attachment class is handled in middleware.ts
      // (can't be done with static rules without shadowing /bars/[slug] etc.).
      // ---------------------------------------------------------------

      // WP custom taxonomies (catch-all)
      { source: '/event-location/:slug*', destination: '/category/events', permanent: true },
      { source: '/event-organizer/:slug*', destination: '/category/events', permanent: true },

      // Orphan category redirects
      { source: '/category/whats-up', destination: '/', permanent: true },
      { source: '/category/whats-up/', destination: '/', permanent: true },
      { source: '/category/opening', destination: '/', permanent: true },
      { source: '/category/opening/', destination: '/', permanent: true },
      { source: '/category/bar-books', destination: '/category/people', permanent: true },
      { source: '/category/bar-books/', destination: '/category/people', permanent: true },
      { source: '/category/flavours', destination: '/category/cocktails', permanent: true },
      { source: '/category/flavours/', destination: '/category/cocktails', permanent: true },

      // Bar accent slugs (URL-encoded — Vercel normalizes these to ASCII at the
      // edge, so these literal rules catch the encoded form before it gets
      // normalized and 404s against the active Supabase slug)
      { source: '/bars/licorer%C3%ADa-limantour', destination: '/bars/licoreria-limantour', permanent: true },
      { source: '/bars/tlec%C4%81n', destination: '/bars/tlecan', permanent: true },
      { source: '/bars/tay%C4%93r-elementary', destination: '/bars/tayer-elementary', permanent: true },
      { source: '/bars/colette-boston', destination: '/bars', permanent: true },

      // 2026-09-14, from the Search Console 404 report. Deactivated rows go
      // to their city page (Roman's rule: a closure is history, not a 404);
      // dangerous-water's city has no page, so it goes to its country.
      { source: '/bars/bullard-worth', destination: '/bars/city/edinburgh', permanent: true },
      { source: '/bars/bar-marilou', destination: '/bars/city/new-orleans', permanent: true },
      { source: '/bars/cane-and-table', destination: '/bars/city/new-orleans', permanent: true },
      { source: '/bars/cloakroom', destination: '/bars/city/montreal', permanent: true },
      { source: '/bars/harry-s-bar', destination: '/bars/city/paris', permanent: true },
      { source: '/bars/28-hongkong-street', destination: '/bars/city/singapore', permanent: true },
      { source: '/bars/nineteen80', destination: '/bars/city/singapore', permanent: true },
      { source: '/bars/viajante87', destination: '/bars/city/london', permanent: true },
      { source: '/bars/the-odd-couple', destination: '/bars/city/shanghai', permanent: true },
      { source: '/bars/ars-delecto', destination: '/bars/city/shanghai', permanent: true },
      { source: '/bars/dangerous-water', destination: '/bars/country/spain', permanent: true },
      { source: '/bars/library-bar-at-leela-palace', destination: '/bars/city/new-delhi', permanent: true },
      { source: '/bars/to-infinity-and-beyond', destination: '/bars/city/taipei', permanent: true },
      { source: '/bars/re', destination: '/bars/city/sydney', permanent: true },
      { source: '/bars/customs-house-bar', destination: '/bars/city/sydney', permanent: true },
      // Slug variants of live bars ("the-", city suffixes, old spellings)
      // go to the live profile.
      { source: '/bars/cloakroom-bar', destination: '/bars/the-cloakroom', permanent: true },
      { source: '/bars/roosevelt-room', destination: '/bars/the-roosevelt-room', permanent: true },
      { source: '/bars/green-door-bar', destination: '/bars/green-door', permanent: true },
      { source: '/bars/pco-new-delhi', destination: '/bars/pco', permanent: true },
      { source: '/bars/pco-bar', destination: '/bars/pco', permanent: true },
      { source: '/bars/cochinchina-singapore', destination: '/bars/cochinchina', permanent: true },
      { source: '/bars/slink-bardot-mumbai', destination: '/bars/slink-bardot', permanent: true },
      { source: '/bars/junglebird', destination: '/bars/jungle-bird', permanent: true },
      { source: '/bars/manhattan-bar', destination: '/bars/manhattan', permanent: true },
      { source: '/bars/zest-seoul', destination: '/bars/zest', permanent: true },
      // REMOVED 2026-09-21: /bars/coa-shanghai -> /bars/coa. Coa Shanghai is
      // NOT the Hong Kong bar. It is a separate venue at 580 Fuxing Zhong Lu
      // with its own Asia's 50 Best ranking, and it now holds that slug, so
      // this rule would have 301'd its live profile to another city. The
      // redirect-chain test caught it.
      { source: '/bars/the-connaught-bar', destination: '/bars/connaught-bar', permanent: true },

      // WP infrastructure catch-all — these paths never existed on the Next.js
      // frontend but legacy crawlers / link tables still probe them. Sending
      // them home is the soft-404 trap the audit warned against, but it
      // preserves any crawl equity from cached references. Switch to 410 via
      // middleware later if the soft-404 signal proves problematic.
      { source: '/wp-content/themes/:path*', destination: '/', permanent: true },
      { source: '/wp-content/plugins/:path*', destination: '/', permanent: true },
      { source: '/wp-json/:path*', destination: '/', permanent: true },
      { source: '/cdn-cgi/:path*', destination: '/', permanent: true },
      // /wp-:slug.php (302) — pre-existing /wp-login.php and /wp-admin rules
      // upstream of this block are more specific and win for those URLs;
      // this generalizes the rest (wp-config.php, wp-cron.php, etc.).
      { source: '/wp-:slug.php', destination: '/', permanent: false },

      // /NEWS uppercase — old WP permalink quirk
      { source: '/NEWS/:slug*', destination: '/', permanent: true },

      // Misc one-offs
      { source: '/contact/', destination: '/work-with-us', permanent: true },
      // /spirits/baijiu/ must come BEFORE the /spirits/:slug* catch-all below
      { source: '/spirits/baijiu/', destination: '/category/brands', permanent: true },
      { source: '/spirits/:slug*', destination: '/category/brands', permanent: true },
      { source: '/hospitality-bar-events-calendar-2025', destination: '/category/events', permanent: true },
      { source: '/hospitality-bar-events-calendar-2025/', destination: '/category/events', permanent: true },

      // Article pagination trailing-slash variants (the no-slash forms already
      // exist near the top of this redirects() array — pre-existing)
      { source: '/:slug/2/', destination: '/:slug', permanent: true },
      { source: '/:slug/3/', destination: '/:slug', permanent: true },
      { source: '/:slug/4/', destination: '/:slug', permanent: true },
      { source: '/:slug/5/', destination: '/:slug', permanent: true },

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
      // Tell crawlers not to index Next.js build assets. /_next/static/* is
      // already in robots.txt's Disallow list, but Google fetches CSS bundles
      // anyway as a render dependency, then classifies them as "Indexed,
      // though blocked by robots.txt" in Search Console (9 URLs flagged in
      // the May 2026 GSC report — all /_next/static/css/*.css?dpl=...
      // bundles). X-Robots-Tag: noindex is the actually-followed signal here;
      // robots.txt is advisory while X-Robots-Tag is normative.
      // Cache-Control stays as Next.js's default (immutable, max-age=31536000).
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex' },
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
      // A6: WP category hub pages.
      {
        source: '/sitemap-categories.xml',
        destination: '/api/sitemap-categories',
      },
      // A7: IndexNow ownership-verification key file. The path includes the
      // key from process.env.INDEXNOW_KEY at build time. Search engines GET
      // /<key>.txt and expect the body to equal <key>. If the env is not
      // set, the source becomes a placeholder that won't conflict with
      // anything real and the handler returns an empty body.
      {
        source: `/${process.env.INDEXNOW_KEY ?? 'indexnow-not-configured'}.txt`,
        destination: '/api/indexnow-key',
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
