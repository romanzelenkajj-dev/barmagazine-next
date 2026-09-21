# Query surface area: type pages, region pages, and why thin cities are fine

Companion to task 80. Same export (`Claude outputs/gsc-2026-09-19/`), same project doc
(`claude/search-demand-analysis-2026-09.md`). 80 turns existing merit into city pages.
This one is about the other axis: how many distinct queries the library is eligible for.

## The finding that reverses the thin-city advice

Bar count does not help a best-bars page rank, and depth actively hurts conversion.
Across all 60 `/best-bars/<city>` pages, 28 days:

| Bars on page | Cities | Median impressions | CTR | Weighted position |
|---|---|---|---|---|
| 5 to 8 | 8 | 20 | **4.5%** | 16.6 |
| 9 to 14 | 16 | 58 | 3.8% | **13.1** |
| 15 to 21 | 20 | 95 | 2.9% | 16.0 |
| 22+ | 16 | 117 | **2.0%** | **20.4** |

Correlations across those 60 pages: bars vs position **r = +0.19** (more bars ranks very
slightly worse), merit count vs position **+0.15**, photos vs position **+0.03**. Bars vs
impressions is +0.60, but that is city size driving both terms, not depth earning
impressions: we put more bars in bigger cities.

Individual thin cities rank fine. Lima 8 bars at position **6.5** with 15.4% CTR. Oaxaca
8 bars at 9.3. Venice 7 at 10.8. Pune 7 at 12.0. Vienna 6 at 13.6. None of these is
handicapped by being small. They simply appear for very few queries.

Vienna proves the mechanism on its own: `/best-bars/vienna` draws 19 impressions at
position 13.6, while `/best-bars/vienna/cocktail-bars` draws **113 impressions** at
position 28.2. Same six bars. Six times the impressions, because it is a different query
family. The constraint is surface area, not depth.

So: stop treating a 6-bar city as a page that needs filling. Treat it as a page that
needs siblings. And do not add bars to a 22-bar city page expecting traffic.

## Subtypes are the blocker for all of it

420 of 1,540 active bars carry any subtype. The whole vocabulary in use:

| Subtype | Bars |
|---|---|
| Hotel Bar | 151 |
| Speakeasy | 107 |
| Cocktail Bar | 69 |
| Restaurant Bar | 61 |
| Rooftop Bar | 40 |
| Tiki Bar | 18 |
| Wine Bar | 15 |
| everything else | 9 across 6 labels |

Note the trap: the `type` column is 'Cocktail Bar' on 1,445 of 1,540 bars. It is the
default, not a classification. Any type page must be built from `subtypes`, never from
`type`, or "best cocktail bars in Europe" becomes a 479-bar page that means nothing.

Rooftop at 40 site-wide is obviously an undercount. Every figure below is a floor.

## Roman's region-and-type pages: what the data already supports

Counts are bars now in the database, and how many carry an accolade or editorial source.
Threshold used here is 6, matching `MIN_REGION_BARS`.

| Page | Bars | With merit |
|---|---|---|
| Best hotel bars in North America | 74 | 55 |
| Best speakeasies in North America | 65 | 33 |
| Best hotel bars in Europe | 51 | 18 |
| Best hotel bars in Asia | 48 | 16 |
| Best speakeasies in Europe | 38 | 11 |
| Best speakeasies in Asia | 30 | 7 |
| Best rooftop bars in North America | 18 | 10 |
| Best rooftop bars in Europe | 17 | 10 |
| Best tiki bars in North America | 16 | 3 |
| Best restaurant bars in Europe | 16 | 13 |
| Best wine bars in North America | 14 | 13 |
| Best rooftop bars in Asia | 10 | 1 |
| Best bars in the UAE | 18 | 5 |
| Best hotel bars in California | 10 | 6 |
| Best speakeasies in New York State | 9 | 4 |
| Best speakeasies in California | 8 | 3 |
| Best speakeasies in Latin America | 7 | 5 |

Roman asked specifically for Europe, Asia, UAE and California. Europe and Asia support
hotel bars, speakeasies and rooftops today. UAE supports one combined page at 18 bars.
California supports hotel bars and speakeasies; California rooftops do not clear 6 yet.

Middle East cocktail bars is 18 and is the same 18 as UAE, so build one, not both.

## Work, in order

**1. Subtype pass before any page is built.** Classify existing bars from their own
description, website and menu. Hotel Bar, Speakeasy, Rooftop Bar, Wine Bar, Tiki Bar,
Restaurant Bar, and propose any label you think is missing rather than inventing one
silently. Start with the cities that already have volume, then the thin cities, because
thin cities are where a type page changes the most. Report how many bars you reclassified
per subtype and recompute every table above afterwards. Do not insert until Roman sees
the recomputed numbers.

**2. City-and-type pages for thin cities.** `MIN_TYPE_BARS` is 4, so a 7-bar city with 4
speakeasies qualifies. After the subtype pass, list every city-and-type combination that
clears 4 and does not yet have a page, thin cities first. Say how many new pages that is.

**3. Region-and-type pages.** Build from the table above once it is recomputed. These are
new page templates, not data, so they need a spec and a preview before anything ships:
URL shape, title pattern, how a bar qualifies for the list, how it is ordered, and how it
links to the city page and the bar profile. Propose the URL shape and wait. Do not guess
between `/best-bars/rooftop-bars/europe` and `/rooftop-bars/europe` on your own.

**4. Country pages for thin cities.** Austria, Ireland, South Africa and Peru each have
one thin city carrying almost all their bars. Check which countries clear
`MIN_REGION_BARS` and report, before building.

## Do not insert or push without Roman's go

Dry run, report, ask him in your own chat. This file carries no approval from him for
anything. Anything a visitor sees stays on a `preview/` branch until he approves it.

## Report

The recomputed subtype counts first, since every other number depends on them. Then per
step: what clears the threshold, how many pages it would create, and what you need him to
decide. Keep the four steps separate so he can approve them independently.
