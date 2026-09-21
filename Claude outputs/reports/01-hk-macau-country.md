# Report: 01-hk-macau-country (2026-09-15, 13:08 to 13:20 PT)

Done. 39 active rows moved from country "China" to "Hong Kong" (36) or "Macau" (3), written by id through the admin API, revalidated, verified live. One regression of mine surfaced by the check and fixed in the same pass.

## 1. The rows (query: city in any Hong Kong or Macau spelling)

41 rows matched, all with the canonical city string already ("Hong Kong" or "Macau"; no "Hongkong", "HK" or "Macao" variants exist) and all with country "China". No row has country Hong Kong or Macau with another city.

Active, updated (39):
- Hong Kong (36): apothecary, argo, artifact, avoca, bar-leone, bourkes, caprice-bar, coa, darkside, dead-poets, dragonfly, gokan, honky-tonks-tavern, jin-bo-law, kinsman, lobster-bar, lockdown, maggie-choos-hong-kong, mius, mizunara-the-library, montana, orchard, ozone, penicillin, quinary, socio, tell-camellia, terrible-baby, the-aubrey, the-diplomat, the-mixing-room, the-old-man, the-opposites, the-pontiac, the-savory-project, zuma-hong-kong.
- Macau (3): pony-and-plume, the-st-regis-bar, wing-lei-bar.

Inactive, NOT touched (2, outside the task's "active" scope): mostly-harmless, the-wise-king-soho-hong-kong. Both still carry country "China"; the same one-line update applies if wanted.

No other country value was touched.

## 2. City strings

Already canonical on every row; nothing to set.

## 3. City pages, slugs, redirects

The city page route is /bars/city/<slug>, not /bars/<slug>; the task's "/bars/hong-kong" is /bars/city/hong-kong. The city index (src/lib/city-keys.ts) folds by city name and only qualifies a slug on a collision, and Hong Kong and Macau collide with nothing, so the slugs were "hong-kong" and "macau" before and after: no old city slug exists, no redirect is needed, and the redirect generator and chain check were not touched (nothing to add).

What changed is the COUNTRY page: /bars/country/hong-kong and /bars/country/macau exist now (they 404ed before), and /bars/country/china no longer lists them.

## 4. Verified live (after revalidation)

- /bars/city/hong-kong: 200, "Best Cocktail Bars in Hong Kong", Bar Leone and Argo present.
- /bars/city/macau: 200, "Best Cocktail Bars in Macau".
- /bars/country/hong-kong: 200, "36 Best Bars in Hong Kong (2026 Guide)".
- /bars/country/macau: 200, "3 Best Bars in Macau (2026 Guide)".
- /bars/country/china: "23 Best Bars in China" (was 62); its city links are beijing, changsha, chengdu, guangzhou, hangzhou, shanghai; none of the 39 among its cards. (A "Bar Leone" string on that page is Bar Leone Shanghai, a different bar.)
- Sitemap: profiles 1,348 = 1,348 active rows; country URLs hong-kong, macau and china all listed; one /bars/city/hong-kong entry.
- City-index cache: purged by revalidateBarPages on each write (the tag purge is part of it); the pages above rendered from fresh data.

## Regression found and fixed (commit b863569)

With country = city, cityLabel printed "Hong Kong, Hong Kong" on cards and the profile place line, and Singapore rows had been reading "Singapore, Singapore" since the place lines were routed through cityLabel earlier today (the old card code had a city-equals-country guard that the helper lacked). cityLabel now prints a city-state once. Deployed and verified: Singapore, Hong Kong and Macau cards read "Singapore", "Hong Kong", "Macau"; Bar Leone's profile reads "Hong Kong" and its title "Bar Leone | Cocktail Bar in Hong Kong".

## Not done / for Roman

- The two inactive Hong Kong rows still say China (scope).
- geo.ts maps country codes for geo-sorting (CN, JP, GB...); "Hong Kong" and "Macau" as country names may not geo-sort the way China did. Not checked in this task.
