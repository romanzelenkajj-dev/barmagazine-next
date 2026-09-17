# Report: 58-recrawl-after-todays-changes (2026-09-17)

Done. Commit `3b04228`. No indexing was requested for anything.

## 1. The best-bars pages, which was the real fix

**They did carry a lastmod, and it was the wrong one.** It tracked the newest
bar in the city, so a city whose bars had not changed reported an old date even
though task 53 had rewritten its title tag that morning. London's read
`2026-09-17T18:58Z`, which was a bar edit, not the retitle.

`CITY_PAGE_TEMPLATE_CHANGED_AT` now works exactly as
`PROFILE_TEMPLATE_CHANGED_AT` does: the lastmod is the later of the city's own
newest member and the constant. London now reads `2026-09-17T20:25Z`, and every
best-bars city and type page moved with it. Verified on the served sitemap.

## 2. The 67 noindex type pages

Nothing requested, as instructed. Confirmed on the live site that they are both
`noindex, follow` **and** absent from the sitemap:

| Page | robots | in sitemap |
|---|---|---|
| `/best-bars/amsterdam/cocktail-bars` | noindex, follow | no |
| `/best-bars/budapest/cocktail-bars` | noindex, follow | no |
| `/best-bars/warsaw/cocktail-bars` | noindex, follow | no |

The `/best-bars/` URL count fell from 224 this morning to 190.

## 3. The profiles

`PROFILE_TEMPLATE_CHANGED_AT` holds **`2026-09-17T09:22:00-07:00`**, which is
when the last of the four title-rewrite commits went live. It was bumped this
morning under task 46 and is untouched. Nothing re-requested.

## 4. The bars added this week

**All 242 are in `sitemap-bars`, and so are all 1,469 active bars. Zero
missing, and none caught by a thin-page rule it should not be.**

## Sitemap counts

| | This morning | Now |
|---|---|---|
| Total URLs | 1,725 | **1,805** |
| Bar profiles | 1,360 | **1,469** |
| `/bars/city/` | 71 | **76** |
| `/best-bars/` | 224 | **190** |

Profiles up 109, city pages up 5 as cities crossed four bars, best-bars down 34
as the duplicate type pages left.

## A measurement error I made and caught

Checking point 4, I found a city with four bars whose page was noindexed and
out of the sitemap, which looked like a bug. It was not. **My own throwaway
dump was paging on `created_at`, which is not unique, so a row appeared twice
and another was skipped.** Hanoi has three bars, not four, and its page is
correctly noindexed.

Re-dumped ordering by slug: 1,469 rows, 1,469 distinct slugs, zero duplicates,
and the week's counts are unchanged at 242 with 166 emails. Worth recording
because the same mistake in a script that writes would be much worse than one
in a script that counts.

## The ten URLs for tomorrow's manual quota

Ranked on the Search Console week, not on guesswork. Every one has a title tag
that changed today and real impressions behind it.

| # | URL | Why |
|---|---|---|
| 1 | `/best-bars/singapore` | 184 impressions, 5 clicks, position 15.3. The most demand of any best-bars page, and the title changed today |
| 2 | `/best-bars/las-vegas` | 179 impressions, 1 click, position 28.6. Second-highest demand and the worst CTR on the list |
| 3 | `/best-bars/washington-dc` | 120 impressions at 19.4, 2 clicks |
| 4 | `/best-bars/hong-kong` | 120 impressions at 14.8, 1 click. Page one, almost no clicks |
| 5 | `/best-bars/mumbai` | 119 impressions at 12.1, best position of the high-demand set |
| 6 | `/best-bars/london` | 84 impressions at 37.7, 4 clicks. Now titled "The 23 Best Bars in London", a page-four page with a fixed title |
| 7 | `/best-bars/stockholm` | 108 impressions at 15.0 |
| 8 | `/best-bars/budapest` | 89 impressions at 27.6, and its list changed most of all: 11 qualified bars from a name-ordered twelve |
| 9 | `/best-bars/prague` | 86 impressions at 14.2 |
| 10 | `/best-bars/mexico-city` | 104 impressions at position 7.2, the best-placed page on the list |

Across the week the best-bars pages drew 3,644 impressions and 96 clicks, so
this is where a retitle pays.

**Do not spend the quota on profiles.** Task 46 pushed that recrawl this
morning and re-requesting the same URLs hours later does not make Google move
faster. Do not spend it on the noindex type pages either: a noindexed page
needs a crawl to be dropped, and asking for indexing on one is contradictory.
