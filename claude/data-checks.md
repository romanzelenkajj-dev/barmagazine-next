# Data checks: what runs, when, and the rules behind them

## The runtime-config rule

**Anything that inspects `next.config.mjs` must evaluate
`nextConfig.redirects()`. Never parse the file as text.**

The config is code: it composes hand-written rules with `barRedirects`, which
is imported from a generated JSON file and does not appear as literal text
anywhere. A regex sees only the literal part.

This is not hypothetical. On 2026-09-14 a regex-based audit of redirect rules
reported "no shadowed profiles" after examining **20 of 47** rules. The
conclusion happened to be right, but it was asserted confidently on 43% of
the data, and the 27 rules it never saw included every percent-encoded accent
variant. Re-run against `redirects()`, the same audit saw all 47.

Correct, in every consumer:

```js
const nextConfig = (await import(cfgUrl.href)).default;
const rules = await nextConfig.redirects();   // ← the actual rules
```

Audited 2026-09-14: every in-repo consumer already did this
(`scripts/seo-check.mjs`, `src/lib/redirect-chain.test.ts`,
`src/lib/headers-config.test.ts`). The only text-parser was a throwaway
script, now gone.

**The same rule applies to transcribing config knowledge.** A hand-maintained
copy drifts exactly like a regex does. `generate-bar-redirects.mjs` used to
carry a hardcoded list of root-level redirects that had to be kept in step
with the config by hand; forgetting it would emit a duplicate `source` and
break the build. It now derives that list from `redirects()`.

One trap when you derive it: `next.config.mjs` composes the generator's OWN
previous output, so the raw list contains the last run. Subtract it, or the
generator poisons itself and the whole 990-redirect set collapses to zero on
the next build. `assertNotCollapsed()` now refuses to write that state.

## The silent row cap

**Any Supabase read that expects more than a few hundred rows must page
explicitly, because the cap is silent.** A request for 2,000 rows, or
10,000, or "everything", returns exactly 1,000 rows and no error. Nothing
downstream can tell the difference between "there are 1,000" and "there
are more".

On 2026-09-14 this was found in THREE consumers at once, each with the
same shape: `sitemap-bars.xml` listed 1,000 profiles against 1,247 active;
the `/bars-map` page dropped every bar past the first thousand; and the
redirect generator saw 1,000 bars, so 247 had no root redirect. All three
are now paginated (`getAllActiveBars()` in supabase.ts; offset paging in
the generator), and the live deploy check `sitemap-bars-count` asserts
the sitemap's profile count equals the active row count.

Rule of thumb: a `.select()` on `bars` filtered to one city, one country,
one tier-and-city, one owner or a list of ids is bounded by the data and
fine. A `.select()` on `bars` filtered only by `is_active`, or by nothing,
is the whole directory and MUST page.

Audited 2026-09-14, every `.from('bars')` in `src/` and `scripts/`:

- **Paginated already:** `getAllActiveBars`, `getBarStats` (count via
  `head: true`; locations paged), `getSeoCities`, `award-hubs`, the admin
  list endpoints (`manage-bar`, `audit`), `geocode-backfill.mjs`,
  `generate-bar-redirects.mjs`, `build-article-mentions.mjs`.
- **Bounded by their filter, fine:** `getBarBySlug`, `getBarsByCity`,
  `getBarsByCountry`, `getTop10BarsByCity`, `getSeoCityBars`, the owner,
  claim, submission and photo routes, `audit-featured-tiers.mjs`.
- **Whole-directory reads that were still one request, found by this
  grep and fixed the same day (a fourth, fifth, sixth and seventh
  instance):**
  - `getBarFilterOptions()`: the directory's filter menus were built from
    the first 1,000 bars, so a city or style that only existed past the
    cap was never offered. Now paged.
  - `getCountriesWithCounts()` and `getCitiesWithCounts()`: both feed
    `sitemap-bars.xml`, so a city whose bars all sat past the cap had no
    city page in the sitemap. Now paged.
  - `/api/bars/map`: the map's own data endpoint, the same defect as the
    page. Now paged, with the coordinate filter and tier-name sort applied
    after the pages are joined.
- **Same shape, currently far below the cap, left as they are:**
  `getTop10Cities()` (tier filter, ~230 rows) and `getBarArticleSlugs()`
  (non-null article slug, 14 rows). They will cross the cap silently if
  the tiers or the article set ever grow that far.
- `scripts/migrate-bars.ts`: legacy, not run.

## Production is never load-tested from the Mac

**Rate-limit and firewall rules are verified with a handful of requests, or
on a preview deployment. Never a burst against production from the Mac.**

On 2026-09-14 a 330-request self-test of the meta-externalagent rate
limit, sent from the Mac against production, tripped Vercel's automatic
DDoS mitigation on the Mac's own IP: a system challenge on 68.72.208.8,
"Ongoing", which turned every non-browser fetch from this machine into a
403 (`x-vercel-mitigated: challenge`). The deploy suite
(`npm run seo:check:live`), the address check and every curl-based
verification run from that IP, so the test took out the tooling that
would have verified it. The rule itself was never proven by the test,
because the mitigation answered before the rate limit did.

The safe check is twenty requests inside one second with the target user
agent, expecting 429 above the ceiling and 200 on a normal-user-agent
control, and stopping there. Anything heavier runs against a preview URL.

### The firewall rules, for the record

Both live on the barmagazine-next project (Vercel Firewall, custom rules),
managed through `PATCH /v1/security/firewall/config` with the CLI token.

- **Tencent SG crawler (AS132203) challenge**, since 2026-09-01:
  `geo_as_number eq 132203`, action challenge (not deny). A headless
  Chrome crawler on Tencent Cloud Singapore with a frozen Chrome UA that
  was polluting GA. Challenge, because legitimate Singapore visitors
  arrive on ISP ASNs and pass a browser challenge anyway.
- **meta-externalagent rate limit (429 above 5/s)**, since 2026-09-14:
  `user_agent inc meta-externalagent`, action rate_limit, fixed window
  60 s, limit 300, keyed on user agent, deny above the ceiling.
- **Alibaba Cloud SG scraper (AS45102) challenge**, since 2026-09-15:
  `geo_as_number eq 45102`, action challenge (not deny). The 2026-09-15
  Singapore crawl: 28,800 requests in one hour under one frozen Mac
  Chrome/145 UA with spoofed internal referrers, reading as ~87 GA users.
  Roman asked for it as an AS132203 rule; the Firewall's Traffic view
  attributed those exact 3.9k requests to Alibaba (US) Technology,
  AS45102, so the rule was written against 45102 and the existing
  Tencent rule left as it was.

**ASN is a rule condition even though the request log does not expose
it.** The log endpoint behind `vercel logs` carries user agent, referrer
and the serving edge region, but no client ASN or country; the Firewall's
own Traffic view and the rule conditions (`geo_as_number`, `geo_country`,
`ja4_digest`) do. So a scraper identified in the log by a frozen UA and
spoofed referrers is attributed to its network in the Firewall, not the
log: open Traffic, "Use in Query" on the AS row, and the query URL carries
`asnId`. Read it off there before writing a rule.

Two API details, learned the hard way: a rule `description` over 256
characters makes the schema fall through to the wrong variant and the
error reads "`action` should be equal to constant"; and a rule is checked
after insert with a plain fetch from the Mac, which must still be 200.

## scripts/address-city-check.mjs

Finds rows whose address text names a different city than the row's city
field. Name matching against a GeoNames gazetteer; the earlier
distance-based version is retired (it had zero precision, see the script
header).

**Run it:**
- **after every insert wave**, which is when addresses actually enter the
  table and therefore when it earns its keep;
- **weekly**, which catches admin edits made between waves.

```bash
npm run audit:addresses          # report
npm run audit:addresses:validate # self-test, must pass before trusting a run
```

A clean run is **zero flags**. Two reviewed rows are suppressed by a named
allowlist inside the script, each bound to the exact address it was approved
against: change that address and the row is reported loudly as a stale
allowlist entry instead of staying quiet. A suppression must not outlive its
reason.

Run `--validate` after touching the matching rules. It re-injects the three
known mismatches in memory and fails if any is missed; it caught two real
regressions during tuning.

**Award data needs this check too, not just our rows.** On 2026-09-14
Shaker Awards' own nominee list placed Kanché in "Mérida" while Shaker's
own venue page for it reads "Kanché Izamal", 70 km away. When importing
accolades, run the city the awards body gives against the venue's address
before trusting it; an awards body is a source for the award, not for the
city.

**Handle identity from an awards page gets the same scepticism as its city
field.** Second defect class inside the same body's data, found the same
day: Shaker's 2025 Top 30 page links Bronson's entry to `@bekeb_sma` and
BEKEB's entry to `@vinithebar`, a one-row shift in their template. And on
all three years' pages the ARCA entry links `@arca_bar`, which is a beach
bar in Vama Veche, Romania, not Arca Tulum. So a handle on an awards page
is evidence of which venue the body MEANT only once the handle's own
profile agrees with the entry (bio names the venue, or the address or a
50 Best placing on the profile matches the row). The Shaker backfill of
2026-09-14 accepted a handle only on that test, and corrected our own
stored handles to the ones the venues actually use where ours were dead.

## Expansion candidates: parked

Ten accent-stripped city URLs were measured for supply on 2026-09-14
(bars carrying a 50 Best Discovery listing or a national award-body
ranking). The bar for a verification wave is **four or more verified**.
None reached it, so **no wave for any of the ten**; the counts are in the
changelog entry of that date.

- **Querétaro: revisit after 2026-11-24.** It stands at three (Vertical,
  Dodo Café, Bestia Agave Room) with Shaker Awards' Top 100 Bares de
  México 2026 only about half published ahead of the 24 November gala.
  Re-count once the list is complete; one more entry clears the bar.
- Everything else (Córdoba ×2, Málaga, Cancún, Brasília, Düsseldorf,
  Asunción, Curaçao, València, Mérida) stays parked with no date.

## seo-check bar-redirect-chains

Part of `npm run seo:check:live`. Follows every `/bars/*` redirect hop by hop
and asserts the final response is 200, rather than accepting a 3xx as a pass.

This exists because `checkRedirectDestinations` deliberately skips `/bars/*`
destinations, so three rules that returned healthy 308s onto 404s went
unflagged for months. On its first run the new check found 11 more of the
same class.

## Generators that feed their own input

**Any generator whose output is composed back into its own input must be
proven stable across CONSECUTIVE runs, not merely correct on a first run,
and must refuse to write a collapsed result rather than emitting it.**

A generator like that is not a pure function of the world; it is a function
of the world *and of what it produced last time*. A first run can look
perfect while the second destroys the data, and neither the build nor the
type checker will say a word, because emitting nothing is not an error.

This is not hypothetical either. On 2026-09-14,
`generate-bar-redirects.mjs` began deriving its denylist from
`nextConfig.redirects()` — correct in itself, and the fix for a
hand-transcribed list. But `next.config.mjs` composes that generator's own
previous output, so the second run read all 990 of its own redirects as
pre-existing config, skipped every one of them, and emitted zero. The build
would have stayed green while 990 live redirects disappeared.

So, for any generator of this shape:

1. **Subtract your own prior output** from anything you derive from a
   source that includes it.
2. **Run it at least twice** and compare. A single run proves nothing about
   this class of bug; run 1 was correct and run 2 was catastrophic.
3. **Refuse to write a collapsed result.** `assertNotCollapsed()` exits
   non-zero when the directory holds bars but zero redirects were emitted,
   because a silent empty write is far worse than a failed build.

Audited 2026-09-14: `generate-bar-redirects.mjs` is the only generator in
the repo with this shape. The others write to destinations nothing reads
back in (`geocode-report.json`, `geocode-updates.sql`, the outreach logs),
and `bar-redirects.generated.json` is the sole generated file imported by
`next.config.mjs`.

## Deriving a field from free-text addresses

**Anchor the match, and take a majority across the rows.**

A bare pattern match on a free-text address finds the wrong thing
confidently. Deriving the US state from an address by searching for any
two-letter code read `99 Krog Street NE, Atlanta` as **Nebraska**, and did
the same to an Albuquerque address: the compass direction in the street line
matched before the real state ever came up. Anchoring the match to the
postcode that always follows the state (`GA 30307`, `ON M5H 1Y1`) fixed both
at once, because the anchor is the thing that makes the position meaningful.

Then take a **majority vote across all of a city's rows** rather than
trusting the first hit. Listings legitimately spill into neighbouring towns
(Brookline against Boston, Surfside against Miami), so a single address is
not evidence about the city, and one stray row should not be able to rename
it.

See `src/lib/city-location.ts`.

## Geocoding on insert (2026-09-15)
- The insert geocoder (src/lib/geocode.ts) is ADDRESS FIRST: the full street
  address, unboxed, with city, state where derivable and country appended;
  name + city + country only when the address returns nothing usable; city
  centre last; 40 km check on every step. The state comes from the address
  postcode line or a qualifier in the city string. Namesake cities
  ("Shawnee": Kansas vs Oklahoma) were the failure this fixes.
- After every insert wave, re-run the wave dry through
  POST /api/admin/geocode-bars {barIds, force:true, dryRun:true} in chunks
  of 15 and read movedKm and method before applying anything. A move over a
  few km by the NAME method can be the geocoder getting worse (Zuma Hong
  Kong), not better; only the address method is trusted blind.
- Same-name US cities collide on the city page (keyed on the bare city
  string, across countries too). Until city slugs carry the state, a second
  Portland/Birmingham/Charleston/Columbus/... needs a qualifier in the city
  string and an address-check allowlist entry. See the structural item in
  implementation-status.md.

## Same-name cities (2026-09-15)
- City pages key on the city ENTRY (src/lib/city-keys.ts), not the city
  string: a collision across countries or US states gives qualified slugs
  (portland-or, portland-me, birmingham-gb); everything else keeps the bare
  slug. Never build a city link from toUrlSlug(city); use
  getCityIndex().slugFor(row).
- bars.state must be filled on every US and Canadian row. A null state
  joins the city's majority, which is safe for a lone row and wrong for a
  namesake: run `node scripts/backfill-state.mjs` after any wave and expect
  "0 with no derivable state"; add a HAND entry for a bare street line.
- The stored city string stays bare ("Portland", never "Portland, Maine");
  the state and the slug carry the split.

## Descriptions: no food negations (2026-09-15)
- `npm run audit:descriptions` after every wave and every description edit.
  A description never says a bar has no kitchen or serves no food (Friends
  of Friends, Illinois Liquor Commission); if the venue says so, food is
  simply not mentioned. The linter fails on any hit; reviewed exceptions
  are allowlisted against their exact phrase in scripts/description-lint.mjs.
