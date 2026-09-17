# Report: 43-noindex-thin-city-pages (2026-09-17)

Shipped and verified live. Commit `bf564a7`.

## The numbers

| | |
|---|---|
| City entries in the directory | 203 |
| Indexable, four bars or more | 71 |
| **Noindexed by this rule** | **132** |
| of which carry one bar | 87 |
| of which carry two bars | 32 |
| of which carry three bars | 13 |

The audit's figure was 117 city pages with one or two bars. Today it is 119,
and 132 once the three-bar cities are included, which the under-four rule
catches by definition.

| sitemap-bars | Before | After |
|---|---|---|
| Total URLs | 1,857 | 1,725 |
| `/bars/city/` URLs | 203 | 71 |
| `/best-bars/` URLs | 224 | 224 |

The full list of the 132 is in `Claude outputs/thin-city-pages-noindexed.md`.

## Verified on the live site

```
/bars/city/calgary    noindex, follow     (3 bars)
/bars/city/dallas     noindex, follow     (3 bars)
/bars/city/london     index, follow
/bars/city/new-york   index, follow
```

Every one of those pages is still live, still linked and still `follow`, so a
reader and a crawler reach the profiles through them exactly as before. The
only thing that changed is that we stopped asking Google to index them and
stopped advertising them in the sitemap. Submitting a URL we have told Google
not to index is asking for a crawl we do not want.

## The threshold the task asked about

**`/best-bars/<city>` needed no change.** It already gates on
`MIN_CITY_BARS = 5` and 404s below that, which is stricter than this rule. So
a city of four now has a followable, noindexed directory page and no
best-bars page at all, and a city of five has both. The two thresholds are
deliberately different and a test pins that relationship, so nobody later
"fixes" them into agreement by accident.

For reference, the other gates: `MIN_TYPE_BARS = 4` for
`/best-bars/<city>/<type>`, and `MIN_REGION_BARS = 6` for the country and
state region pages.

## It flips back on its own

There is no hand-kept list anywhere. The rule reads `CityEntry.count`, which
is built from the active rows on every revalidate, so a city that reaches
four is indexable again and back in the sitemap with nothing to edit and no
deploy. A test builds a city at three and the same city at four and asserts
the predicate flips.

One design note worth keeping: the threshold and the predicate now live in
`src/lib/city-thresholds.ts`, a leaf module that imports nothing. The page's
robots tag and the sitemap filter both call the same `isIndexableCity`, so
they cannot drift into telling Google two different things about one URL. The
leaf module also means the tests can read the numbers without pulling the
Supabase client in behind them, which is what stopped an earlier version of
the test from running at all. `seo-cities` re-exports all three constants, so
no existing caller changed.

## Checks run

Full suite 362 tests passing, three of them new. `next lint` clean with no new
warnings. `next build` compiled successfully. Sitemap and robots tags both
read back from the live site, not from the local build.

## Worth knowing

This is a holding action, not a fix. 132 noindexed city pages is 132 cities we
do not currently rank for, and the rule only stops them hurting the pages we
do rank for. Filling them is task 42's programme, and each city that reaches
four leaves this list by itself.
