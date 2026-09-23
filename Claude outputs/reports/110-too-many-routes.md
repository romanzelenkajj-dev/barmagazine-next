# Task 110 (urgent): Vercel `too_many_routes` fixed, production READY, previews rebased, 2026-09-23

Pushed to main as `513c084` (the fix) and `bb76a3e` (prebuild order). Production deployment on
`bb76a3e` reported **success** at 08:49 PT and the redirects were confirmed live (below).

## What was wrong

Vercel caps a deployment at 2,048 routes and counts every redirect, rewrite and header rule in
`next.config.mjs`. The config held 2,053: **one generated `/{slug} -> /bars/{slug}` rule per
active bar** (the A4 WordPress-era listing URLs, 1,779 of them after this week's inserts), the
35 merged-bar slugs, and the hand-written WordPress rules. The merged slugs alone were 35 routes;
moving only those would have left the config at 2,018 and the next wave would have broken every
deployment again within days, and your 1,800 gate would have failed on the spot. So both slug
classes moved.

## What changed

- **`src/lib/merged-slugs.ts`**: the 35 `[old, kept]` pairs as a static map, comments carried
  over. This is where a merge's 301 now goes (the merge standard is updated below).
- **`src/middleware.ts`** (the existing host-canonicalisation middleware): after the canonical
  host check, `slugRedirectTarget()` answers `/bars/<old>` from the map and `/<slug>` from the
  generator's JSON (`src/lib/bar-redirects.generated.json`, still produced by
  `scripts/generate-bar-redirects.mjs` in prebuild, now imported by the middleware instead of the
  config). Both **301** to the same targets as before. Runs before the staging early-return, so
  previews redirect exactly as production.
- **`src/lib/slug-redirects.ts`**: the pure decision, unit-tested.
- **`src/lib/slug-redirects.test.ts`**: every merged slug is driven through the real middleware
  and must answer 301 with the right Location; the root-slug set is tested with fixtures; the
  config must no longer contain either class; and the config's route total must be under 1,800.
- **`next.config.mjs`**: the generated spread and the merged block are gone (554 -> 464 lines);
  the header comment carries the route budget. **174 routes** now (162 redirects, 8 rewrites,
  4 headers).
- **Seven stale rules removed** from the config, each a `/bars/<merged-slug> -> city page` rule
  from before the merge standard that the merge block had been overriding by order
  (cane-and-table, cloakroom, 28-hongkong-street, viajante87, dangerous-water,
  to-infinity-and-beyond, customs-house-bar). Config rules run before middleware, so leaving them
  would have flipped those seven from the kept profile to a city page. The test caught it.
- **`scripts/verify.sh`**: step 0 seeds the generated JSON, step 1a fails when the config passes
  1,800 routes.
- **`package.json` prebuild**: generator first, then vitest, then seo-check. The first push
  failed on Vercel because vitest ran before the generator and the middleware's JSON import did
  not exist yet; locally a stale file masked it.
- **`vitest.config.ts`**: resolves the app's `@/` alias so a test can load the middleware.

One honest note: the config rules said `permanent: true`, which Next serves as **308**, so the old
merge redirects were 308s in practice; the middleware serves the **301** you asked for.

## Confirmed live on production

```
/bars/kwant-mayfair    301 -> /bars/kwant
/bars/dangerous-water  301 -> /bars/dangerous-water-palma-de-mallorca   (was a stale city-page rule)
/bars/cane-and-table   301 -> /bars/cane-table
/handshake-speakeasy   301 -> /bars/handshake-speakeasy                (generated root slug)
/tjoget                301 -> /bars/tjoget
/bars/kwant            200                                              (a live profile passes through)
```

## Previews

`preview/109-retire-maroon` and `preview/108-search-terms` rebased onto main and force-pushed;
both Vercel checks are SUCCESS. Task 109's URL is unchanged (branch alias):
https://barmagazine-next-git-previ-9c9db0-romanzelenkajj-7135s-projects.vercel.app

## Merge standard, updated

Step 2 now reads: append `'old-slug': 'kept-slug'` to `MERGED_SLUGS` in
`src/lib/merged-slugs.ts` in the same commit; never a next.config redirect. Written into the
memory note and the comments at the top of `next.config.mjs` and `merged-slugs.ts`.

## Not a route issue, found on the way

A local `next build` failed once with `getRegionBars failed: Bad control character in JSON`; it
was a corrupted entry in the local `.next/cache/fetch-cache`, gone after clearing it. Nothing in
the data.
