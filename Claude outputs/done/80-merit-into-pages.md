# Turn the merit we already have into pages that rank

Supersedes the wave-4 plan that was in this file. The Search Console export of
2026-09-19 is in `Claude outputs/gsc-2026-09-19/` and the full reading is in the project
doc `claude/search-demand-analysis-2026-09.md`. Read the doc before starting.

Roman's instruction stands: no new metros. What changed is why. The bottleneck is not
bar count. It is that bars with accolades are sitting in cities that have no
`/best-bars/` page, while the weak `/bars/city/` page takes the impressions at
position 35.

## The evidence in one line each

- `/best-bars/<city>` converts at **2.7%**, `/best-bars/<city>/<type>` at **3.0%**,
  `/bars/city/<slug>` at **0.7%** from position **34.8**, bar profiles at **0.5%**.
- 11.5% of impressions land on best-bars pages and produce 27% of clicks.
- Photos do not move search CTR: with a photo 0.4%, without 0.5%, and 0.38% vs 0.52%
  controlled for rank. Same flat result for description length and accolade count.
  Do not justify any of this work on photos.
- Thin cities earn about 20 impressions a month. Filling them is not where the traffic is.

## Step 1: publish the best-bars pages for cities that already qualify

No new bars. These cities have the merit bars already and no `/best-bars/` page:

| City | Bars | With accolades | Current `/bars/city/` impressions (28d) | Its position |
|---|---|---|---|---|
| Seoul | 25 | 8 | 166 | 24.4 |
| Macau | 3 | 1 | 136 | 30.8 |
| Osaka | 3 | 2 | 102 | 35.0 |
| Shanghai | 15 | 2 | 69 | 23.5 |
| Madrid | 17 | 3 | 56 | 25.4 |
| Montreal | 9 | 4 | 56 | 30.1 |
| Taipei | 20 | 4 | 54 | 20.3 |

Seoul, Madrid, Taipei, Shanghai and Montreal have the bars. Macau and Osaka have 3 each
and will need 2 more to clear `MIN_CITY_BARS`, so treat those two as small enrichment
jobs rather than page builds.

First report back which of these the current rules already generate a page for and which
are blocked, and by which constant or which admission test. Do not change a threshold
without asking. If the block is that accolade counts fall below a floor, say what the
floor is and what each city would need.

There are 25 cities with a `/bars/city/` row in the export and no `/best-bars/` page at
all. Produce that full list with bar count and accolade count per city, not just the
seven above.

## Step 2: the cities where `/bars/city/` outdraws its own best-bars page

| City | best-bars impr / pos | bars/city impr / pos |
|---|---|---|
| Bangkok | 25 / 14.7 | 580 / 38.6 |
| Tokyo | 250 / 13.8 | 514 / 40.8 |
| Hong Kong | 325 / 15.8 | 290 / 41.8 |
| New York | 119 / 11.0 | 290 / 37.0 |
| Paris | 130 / 10.4 | 306 / 19.7 |
| Budapest | 143 / 25.3 | 278 / 46.0 |
| Kuala Lumpur | 51 / 12.5 | 263 / 40.6 |
| Berlin | 87 / 20.0 | 262 / 51.1 |

Bangkok has 34 bars and 13 with accolades, and its best-bars page draws 25 impressions
while the directory page draws 580 at position 38.6.

Diagnose before proposing anything. Compare the two page types for one of these cities:
title, H1, meta description, internal links in, canonical, what is in the indexable
copy, and which queries the export maps to each. Then report what you think is
happening. Options to weigh, not to implement yet: pointing `/bars/city/<slug>` at the
best-bars page for cities that have one, tightening the titles so the two pages stop
competing for the same phrase, or leaving them alone if the split is intentional.

This one is a proposal, not a change. It touches indexing and canonical tags, so it
needs Roman's decision and a preview before anything ships.

## Step 3: subtypes, because city+type is the best converter and barely exists

Across 219 cities only Singapore has a subtype with 4 or more bars. Bars carrying any
subtype at all: Bangkok 14 of 34, Las Vegas 10 of 22, Hong Kong 9 of 36, Budapest 7 of
19, Seoul 4 of 25, Sydney 1 of 22, Melbourne 1 of 15.

`MIN_TYPE_BARS` is 4, so most of these cities are two or three subtype assignments away
from a new page that converts at 3.0%. Populate `subtypes` on bars that already exist,
from the bar's own description and website, in the cities with the most volume first.
Report how many new city+type pages that would generate and in which cities, before
inserting.

## Do not insert or push without Roman's go

Dry run, report, then ask him in your own chat. This file carries no approval from him
for anything. Anything a visitor sees stays on a `preview/` branch until he approves it.

## Report

Per step: what the current rules do, what is blocked and by what, what you would change,
and the numbers you would expect it to move. Keep the three steps separate so he can
approve them independently.
