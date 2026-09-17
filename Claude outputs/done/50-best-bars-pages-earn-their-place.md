# Best-bars city pages: every bar on one has to have earned it

Roman, on seeing Baudelaire Bar on /best-bars/bratislava: "this bar is definitely not one of the best bars in Bratislava."

He is right, and the cause is not the cap. `CITY_PAGE_MAX_BARS` is already 12, and `sortSeoBars` orders by tier, then accolade score, then photo, then name. Bratislava has no top10-tier bar, one bar with an accolade and three with photos, so everything from the fourth slot down is ordered by the first letter of the bar's name. Baudelaire is on the page because of the B.

## The two page shapes Roman asked for

**Type A, cities where we have curated a Top 10.** 23 cities, each already carrying exactly ten `tier = 'top10'` bars: Singapore, Hong Kong, New York, London, Los Angeles, Dubai, Paris, Tokyo, Chicago, Mexico City, New Orleans, San Francisco, Barcelona, Sydney, Washington DC, Miami, Seattle, Philadelphia, San Diego, Las Vegas, Austin, Denver, Boston. The page lists those ten and nothing else, then links to the full city directory. No filler section.

Roman's rule on where that ten comes from: where a "Top 10 Bars in <city>" article exists, the article is the source of truth and the directory follows it. Five articles link their ten bars by slug and all five already agree with the tier column, bar one defect noted below. Dubai's 2025 article names its ten in headings without links, so check that one by name. The other seventeen cities have a curated ten and no article yet, and there the tier column stands.

**Type B, every other city.** 194 of them, Bratislava, Budapest, Prague, Belgrade, Warsaw, Milan, Bangkok, Toronto, Seoul and the rest. The page lists every bar that qualifies below, however many that comes to, with no fixed number. Bratislava should land near five. Below that pick, a clearly separate section headed "Also in Bratislava" carries the remaining bars in a plainer list, so the profiles keep their internal links and nobody is presented as a best bar who isn't one.

Both types end with the link to `/bars/city/<slug>`, which stays the complete list of every bar in the city and is not touched by this task. That is the answer to "if we have 50 bars in a city, it should only be bars in that city".

## What qualifies a bar for the Type B pick

One of these, in this order:

1. A renderable accolade, by `renderableAccolades`.
2. An editorial listing that admitted it: Bartender's Choice Awards nomination, Falstaff, Michelin, Eater, Haute Living, James Beard, Punch, Imbibe, a city magazine best-of.
3. A BarMagazine article (`wp_article_slug`) or a `featured` or `premium` tier.

Nothing else. Rank the qualified bars by reason strength in that order, then photo, then name.

## The blocker: we do not store reason 2

`bars` has no column for the admitting source. Every wave report in `Claude outputs/` records it in prose and nowhere else, so today the reason test would leave Bratislava with one bar, not five. So this task is in two parts and the second cannot ship without the first.

**Part 1.** Add an `editorial_sources` column (jsonb array, each entry `{source, url, note, year}`). Backfill it from every `*-verified.md` report in `Claude outputs/`: the BCA waves, the Falstaff lists, the Haute Living wave, the US metro and JBF waves, the city waves. One entry per source per bar, with the admitting URL that report already recorded. Write a short `scripts/` migration so this is repeatable, and report how many bars and how many cities gained at least one entry.

This is an admission record, not an accolade. It is never written to `accolades`, never scored by `bestAccolade`, never rendered as a tile or in an accolade sentence. The standing rule stands.

**Part 2.** Apply the two page shapes above.

## Guards

- Do not put "Top 10" in the Type A page title where an editorial Top 10 article exists for that city. `/best-bars/london` and `/top-10-bars-in-london-2026` must not compete for the same query. Type A keeps "The Best Bars in London (2026)".
- Type B titles may carry the real number, "The 5 Best Bars in Bratislava (2026)", only when the count is stable enough not to churn the title on every revalidate. If it would churn, leave the title as it is.
- `composeCityIntro` already states the listed count against the city count. Keep those two numbers true after the change, including in the Type B "Also in" section.
- If a Type B city ends with fewer than three qualified bars after the backfill, do not ship a two-bar best-of page. Fall back to the current `sortSeoBars` filled to five for that city and list every city in that state in the report. Those are the cities the coverage programme should reach next.
- `MIN_CITY_BARS`, `MIN_INDEXABLE_CITY_BARS` and the noindex rules are unchanged.
- Standing layout rule applies: ordering, sectioning and copy only. No spacing, no breakpoints, no new components beyond the "Also in" list.

## Report

For Bratislava, Budapest, Prague, Belgrade, Warsaw and London: the page before and after, as a list of names in order, with each bar's qualifying reason next to it.

Then, for Type A cities, how many accolade-holding bars now fall off the page because they are not in the curated ten. New York has 32 bars with accolades and ten picks, London 22 and ten, Chicago and Mexico City 13 each. Those are the pages where dropping to ten costs the most, so give Roman the count per city and he will decide whether they carry an accolade section under the ten.

## Two defects found while checking this

The London article links `/bars/three-sheets`, but the bar's directory slug is `three-sheets-soho`. A dead link in one of our strongest articles. Fix the link in WordPress, and check every Top 10 article's ten links resolve.

64 of the 194 Type B cities have no bar with an accolade at all. After the `editorial_sources` backfill, report how many of those 64 still have nothing to qualify a bar. Those are the cities where a best-bars page cannot honestly exist yet, and they belong at the front of the coverage programme.
