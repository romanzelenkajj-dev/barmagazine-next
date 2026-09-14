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
