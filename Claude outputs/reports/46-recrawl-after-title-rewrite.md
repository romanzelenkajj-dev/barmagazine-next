# Report: 46-recrawl-after-title-rewrite (2026-09-17)

Done and live. Commit `0dc217a`.

## 1. The sitemap signal

```
const PROFILE_TEMPLATE_CHANGED_AT = '2026-09-17T09:22:00-07:00'; // 3b02e69 live
```

Was the 14 September deploy of `b1b306b`. The new value is when the last of
the four rewrite commits actually went live on production, which I watched go
green rather than taking the commit time, because the commit time is not when
Google could have seen it.

Verified in the served sitemap: `/bars/coa` now carries
`<lastmod>2026-09-17T16:22:00.000Z` (09:22 PT), and 1,648 URLs in
sitemap-bars now sit at that timestamp. A sample of profile lastmods:
`/bars/008-bar`, `/bars/100-gramm-bar`, `/bars/111-music-bar`,
`/bars/14-de-la-rosa`, `/bars/146-bar`.

No manual indexing requests were made. That quota is about ten a day and
spending it here would be the wrong use of it.

## 2. The profiles the rewrite cannot help

This is the important half of the task.

**728 of 1,360 active profiles are data-poor.** The new description is
assembled from the row, so where the row is empty the snippet is empty, and
no further template work changes that.

| Gap | Profiles |
|---|---|
| No opening hours | 400 |
| Description under 80 characters | 566 |
| No address at all | 35 |

**345 of the 728 drew search impressions last week, 6,512 between them.**
That is the queue worth working. The full ranked list is in
`Claude outputs/enrichment-queue-by-search-demand.md`.

The top of it:

| Impressions | Position | Bar | City | Snippet | Missing |
|---|---|---|---|---|---|
| 350 | 4.8 | Planta Baja Cocktail Bar | Madrid | 36 | hours |
| 245 | 10.6 | Hide | Budapest | 60 | thin row |
| 234 | 9.5 | Bar Benjamin | Los Angeles | 75 | thin row |
| 220 | 9.0 | String's Bar | Split | 24 | hours |
| 191 | 7.6 | Fix me a Drink | Bucharest | 38 | hours |
| 184 | 9.4 | Bar Sistema | Split | 103 | hours |
| 157 | 9.9 | Urania Bar | Zagreb | 32 | hours |
| 123 | 6.3 | Beogradski Koktel Klub | Belgrade | 76 | address and hours |

Beogradski Koktel Klub is the case the task named, and it is worse than
described: it has neither an address nor hours, so its title correctly
carries no promise at all now (task 43's sibling fix), and its description is
the city and one credential. 123 impressions at position 6.3 with no clicks.

Two patterns worth acting on rather than just reading:

- **Opening hours are the single biggest lever.** 400 rows have none, and
  hours are the one thing a branded searcher most often wants. They are also
  the cheapest field to fill, since the venue publishes them.
- **Split, Zagreb, Warsaw, Bratislava and Budapest recur in the top 30.**
  Those are the same cities the coverage programme is already targeting, so
  the enrichment and the coverage waves should be done together rather than
  as two queues.

## 3. The indexing queue

`claude/indexing-queue.json` is reordered, not appended to.

| Segment | Items |
|---|---|
| Already requested, indexed or quota-blocked, untouched | 13 |
| **The task 41 zero-click cohort, by impressions descending** | **66** |
| The previous backlog | 164 |
| Total | 243 |

The cohort goes first because those pages already rank at position 5 to 15
and need nothing except the new snippet being seen. Every one of the 66 is an
active row; none had to be dropped, and none was already sitting in the
backlog, so nothing was duplicated. The `order` field in the file now says
this in words, so the 16:30 run and anyone reading it later agree on why.

First five after the history: Bar Benjamin (234 impressions), String's Bar
(220), Fix me a Drink (191), Pop City x Pony (191), Bar Sistema (184).

Planta Baja, despite having the most impressions of any data-poor profile at
350, is **not** in the indexing cohort: it sits at position 4.8, just inside
the top four, so it falls outside the "position 5 to 15" definition. It is
top of the enrichment list instead, which is where it belongs, since what it
needs is opening hours and not a recrawl.

## Checks

362 tests passing, build compiled, sitemap and lastmods read back from the
live site.
