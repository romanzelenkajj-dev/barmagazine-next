/**
 * Merged bar slugs: the losing slug of every duplicate merge, and where it
 * now lives. STANDARD STEP for every merge (see the bar merge standard):
 * merge the data into the richer row, append `[old, kept]` HERE in the same
 * commit, then hard-delete the duplicate row. A previously live
 * /bars/<old-slug> URL 301s to the kept profile instead of 404ing.
 *
 * WHY HERE AND NOT next.config.mjs redirects(). Vercel caps a deployment at
 * 2,048 routes and counts every redirect, rewrite and header rule. On
 * 2026-09-23 the config held 2,053 (one generated /{slug} → /bars/{slug}
 * rule per active bar, plus these, plus the WordPress-era rules) and every
 * deployment, main included, failed with `too_many_routes`. The per-bar and
 * per-merge redirects are now served by src/middleware.ts from static maps,
 * which Vercel does not count. next.config.mjs keeps only the hand-written
 * WordPress-era rules; scripts/verify.sh fails if it ever passes 1,800.
 *
 * Same 301 status, same targets as before. src/lib/slug-redirects.test.ts
 * asserts every entry below still resolves.
 */
export const MERGED_SLUGS: Readonly<Record<string, string>> = {
  'kwant-mayfair': 'kwant',
  'la-petite-maison': 'lpm-dubai',
  'black-swan-lab': 'black-swan-budapest',
  'the-carousel-bar': 'carousel-bar-lounge',
  'zig-zag-cafe-seattle': 'zig-zag-cafe',
  // Not a duplicate listing but a sub-venue: Hudson Bar was the Hudson
  // private room INSIDE Hotsy Totsy, same address and same website, listed
  // as a bar of its own. Same treatment as a duplicate.
  'hudson-bar-budapest': 'hotsy-totsy',
  // Svanen, Oslo. BOTH of these were duplicate rows from the 20 March wave,
  // deactivated back when duplicates were hidden rather than deleted. The
  // live bar has always been `svanen`, created 18 March. The dead row was
  // renamed svanen-stockholm -> svanen-oslo before is_active was checked, so
  // both slugs have to land on the live one.
  'svanen-stockholm': 'svanen',
  'svanen-oslo': 'svanen',
  // ---- The 20 March wave duplicates (merged 2026-09-21) ----
  // `status` was added to bars long after these rows were hidden and
  // defaulted every existing row to 'open', which is why they read as
  // "inactive and open" and looked like a hidden-bar bug. They are
  // pre-merge-standard-v2 duplicates, from the era when a duplicate was
  // deactivated rather than deleted. Each verified as one bar by a matching
  // ADDRESS, not by name alone, before deleting.
  '28-hongkong-street': '28-hong-kong-street',
  'bar-878': '878-bar',
  'bar-le-mal-necessaire': 'le-mal-necessaire',
  'bar-les-ambassadeurs': 'les-ambassadeurs',
  'cane-and-table': 'cane-table',
  'cloakroom': 'the-cloakroom',
  'customs-house-bar': 'customs-house-bar-sydney',
  'dangerous-water': 'dangerous-water-palma-de-mallorca',
  'dry-martini': 'dry-martini-by-javier-de-las-muelas',
  'duck-and-cover-cocktailbar': 'duck-and-cover',
  'gucci-bar': 'gucci-giardino',
  'hanky-panky-cocktail-bar': 'hanky-panky',
  'high-five': 'bar-high-five',
  'mother-cocktail-bar': 'mother',
  'nouveau-vague': 'bar-nouveau',
  'rekabar': 'reka-bar',
  'rita-cocktails': 'rita',
  'the-7-jokers-cocktail-bar': 'the-7-jokers',
  'to-infinity-and-beyond': 'to-infinity-beyond',
  'viajante87': 'viajante-87',
  // Not a spelling duplicate but a CITY CONTAMINATION: the row named a city
  // the bar has no branch in. Confirmed against each venue's own site, which
  // lists one location only.
  'd-bespoke': 'd-bespoke-singapore',
  'sastreria-martinez': 'sastrer-a-martinez',
  // Coa Shanghai is NOT a duplicate of Coa Hong Kong: different city,
  // different address, its own Asia's 50 Best ranking. The timestamp suffix
  // is what the insert appends on a slug collision, so this is a corrected
  // slug on a real bar, not a merge.
  'coa-shanghai-1773995982': 'coa-shanghai',
  // Not a merge either: the approval route dropped the Chinese half of
  // "庙前三酉 SanYou" and kept the hyphen that stood in for it (task 127,
  // 2026-09-24). Renamed to the Latin part plus city; the builder now
  // handles this case (src/lib/bar-slug.ts).
  '-sanyou': 'sanyou-guangzhou',
  // Task 134 batch 6 (Roman, 2026-09-26): one bar listed twice. The bar's
  // own site gives one Hemingway Bar Prague, at Opatovická 1737/3; the old
  // row carried the former Karolíny Světlé address. Photo, phone and the
  // Falstaff source moved to the kept row.
  'hemingway-bar': 'hemingway-bar-prague',
  // Same Andaz Delhi bar twice; the kept row holds the menu, phone and the
  // right Aerocity point, and now the temporarily closed status.
  'juniper-bar': 'juniper-bar-andaz-delhi',
};
