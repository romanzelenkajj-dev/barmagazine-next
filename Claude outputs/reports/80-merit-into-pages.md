# Task 80: turn the merit we already have into pages that rank

**Nothing changed, nothing inserted, nothing pushed.** This is the report the task asked for,
in three separable parts.

## Before the three steps: two corrections to the task file

**The doc it tells me to read does not exist.** There is no
`claude/search-demand-analysis-2026-09.md`, anywhere in the repo. The nearest thing is
`Claude outputs/enrichment-queue-by-search-demand.md`, which is a different document from a
different week. I worked from the raw exports in `Claude outputs/gsc-2026-09-19/` instead,
which is the underlying evidence anyway, so nothing here rests on a summary I could not read.

**The exports are capped at 1,000 rows.** `gsc-28d-pages.csv` has exactly 1,000 data rows,
which is Search Console's export limit, not the true page count. Every "there are N pages with
impressions" statement below is a floor, not a total. It does not change any conclusion, but it
does mean a page absent from the export is not proven to have zero impressions, only proven not
to be in the top 1,000.

The conversion figures in the task check out against the raw export:

| Page type | Pages | Impressions | Clicks | CTR | Avg position |
|---|---|---|---|---|---|
| `/best-bars/<city>/<type>` | 34 | 2,094 | 61 | **2.91%** | 15.1 |
| `/best-bars/<city>` | 60 | 5,986 | 160 | **2.67%** | 17.5 |
| `/bars/city/<slug>` | 71 | 7,053 | 50 | **0.71%** | **34.8** |
| bar profiles | 584 | 27,981 | 137 | 0.49% | 11.5 |

---

# Step 1: there is nothing to publish

**The premise is wrong. Five of the seven cities already have a `/best-bars/` page**, live,
`index, follow`, and in the sitemap. I checked each one rather than inferring it from the rules:

| City | Bars | `/best-bars/<city>` | Blocked by |
|---|---|---|---|
| Seoul | 25 | **200, exists** | nothing |
| Shanghai | 15 | **200, exists** | nothing |
| Madrid | 17 | **200, exists** | nothing |
| Taipei | 20 | **200, exists** | nothing |
| Montreal | 9 | **200, exists** | nothing |
| Macau | 3 | 404 | `MIN_CITY_BARS` = 5 |
| Osaka | 3 | 404 | `MIN_CITY_BARS` = 5 |

**There is no accolade floor, and no admission test.** `getSeoCities()` in
`src/lib/seo-cities.ts:173` filters on exactly one condition, `a.count >= MIN_CITY_BARS`.
Accolades are gathered for the copy (`awardedCount`, `topBar`, `topBarAward`) and never gate
the page. So the answer to "which constant or which admission test" is: the bar count, and
nothing else. Macau and Osaka each need **2 more bars**, as the task already guessed.

## The full 25-city list, as asked

Every city with a `/bars/city/` row in the export and no `/best-bars/` row, with its real bar
and accolade counts:

| Slug | Impr | Pos | Bars | Awarded | Status |
|---|---|---|---|---|---|
| seoul | 166 | 24.4 | 25 | 8 | **page exists, zero impressions** |
| macau | 136 | 30.8 | 3 | 1 | blocked, needs 2 bars |
| osaka | 102 | 35.0 | 3 | 2 | blocked, needs 2 bars |
| trondheim | 91 | 40.9 | 1 | 1 | blocked, needs 4 |
| shanghai | 69 | 23.5 | 15 | 2 | **page exists, zero impressions** |
| makati | 67 | 25.8 | 2 | 0 | blocked, needs 3 |
| madrid | 56 | 25.4 | 17 | 3 | **page exists, zero impressions** |
| montreal | 56 | 30.1 | 9 | 4 | **page exists, zero impressions** |
| grand-cayman | 56 | 33.1 | 2 | 2 | blocked, needs 3 |
| taipei | 54 | 20.3 | 20 | 4 | **page exists, zero impressions** |
| nara | 39 | 37.3 | 1 | 1 | blocked, needs 4 |
| helsinki | 32 | 18.2 | 3 | 2 | blocked, needs 2 |
| turin | 31 | 26.1 | 2 | 0 | blocked, needs 3 |
| changsha | 25 | 23.7 | 1 | 1 | blocked, needs 4 |
| split | 25 | 40.6 | 4 | 1 | **blocked, needs 1** |
| bologna | 25 | 26.2 | 2 | 1 | blocked, needs 3 |
| shenzhen | 19 | 21.1 | 2 | 2 | blocked, needs 3 |
| istanbul | 19 | 26.9 | 2 | 0 | blocked, needs 3 |
| kathmandu | 14 | 51.7 | 2 | 1 | blocked, needs 3 |
| bishkek | 13 | 10.2 | 1 | 0 | blocked, needs 4 |
| kragujevac | 11 | 8.6 | 1 | 0 | blocked, needs 4 |
| tijuana | 10 | 10.6 | 1 | 1 | blocked, needs 4 |
| santa-monica | 8 | 8.6 | 1 | 0 | blocked, needs 4 |
| bergamo | 7 | 9.0 | 1 | 0 | blocked, needs 4 |
| karlovy-vary | 5 | 9.8 | 1 | 0 | blocked, needs 4 |

**Read the shape, not the rows.** Of 25, five already have the page. Twenty are blocked purely
on bar count, and eighteen of those have one to three bars. Only **Split** is a single bar away.
The task's own evidence says a thin city earns about 20 impressions a month, and most of this
table is thin cities: filling them is exactly the work the task correctly says is not where the
traffic is.

**So step 1 has no page to publish.** The five cities that qualify have their page and it earns
nothing, which is not a publishing problem. It is step 2's problem, and the two steps are really
one question.

*(One artifact to flag: `makati` and `santa-monica` show as folded in my tooling because I ran
it on the task 79 branch, where they roll into Manila and Los Angeles. On production today they
are still their own cities. It changes neither count.)*

---

# Step 2: diagnosis, and it is systemic

## Bangkok, the two pages side by side

| | `/best-bars/bangkok` | `/bars/city/bangkok` |
|---|---|---|
| Title | The 13 Best Bars in Bangkok (2026) | Best Cocktail Bars in Bangkok |
| **H1** | **The 13 Best Bars in Bangkok** | **Best Bars in Bangkok** |
| Canonical | self | self |
| Robots | index, follow | index, follow |
| Bar links | 13 | 34 |
| Page size | 116 KB | 137 KB |
| Impressions / position | 25 / 14.7 | **580 / 38.6** |

## What is happening

**The directory page's H1 is the best-bars page's target phrase.** Not similar to it. The same
words. And this is not a Bangkok quirk, it is every city:

| City | `/bars/city/` H1 | `/best-bars/` H1 |
|---|---|---|
| Bangkok | Best Bars in Bangkok | The 13 Best Bars in Bangkok |
| Tokyo | Best Bars in Tokyo | The 11 Best Bars in Tokyo |
| Hong Kong | Best Bars in Hong Kong | The 17 Best Bars in Hong Kong |
| New York | Best Bars in New York | The 33 Best Bars in New York |
| Paris | Best Bars in Paris | The 16 Best Bars in Paris |
| Budapest | Best Bars in Budapest | The 11 Best Bars in Budapest |
| **Berlin** | **Best Bars in Berlin** | **The Best Bars in Berlin** |
| **Madrid** | **Best Bars in Madrid** | **The Best Bars in Madrid** |
| **Taipei** | **Best Bars in Taipei** | **The Best Bars in Taipei** |

Berlin, Madrid and Taipei differ by the word "The".

Both pages are self-canonical and both say `index, follow`, so we are telling Google they are
two distinct pages that deserve separate ranking for the same phrase. Google picks one. It
picks the bigger one: the directory page is larger and links more bars, so it reads as the more
complete answer to "best bars in X". It then ranks it at 35 to 40, because as a page it is a
list of cards with little prose, and converts it at 0.7%.

**The purpose-built page loses, and in five cities it loses totally.** Seoul, Shanghai, Madrid,
Montreal and Taipei have a live, indexable, sitemapped best-bars page with **no row in the
export at all**, while their directory page takes 166, 69, 56, 56 and 54 impressions. That is
the signature of Google consolidating two pages onto one URL, and choosing the weaker one.

**This also explains why the type pages are the best converter.** `/best-bars/seoul/cocktail-bars`
sits at position **7.9** with 109 impressions, while `/best-bars/seoul` gets nothing. The type
page is the only one of the three whose H1 nothing else duplicates, so it is the only one not
fighting a sibling.

## The options, weighed, not implemented

**1. Change the `/bars/city/` H1 and title so it stops claiming the other page's phrase.**
The directory page's job is "every bar we list in X", not "the best bars in X". An H1 of
"All Bars in Bangkok" or "Bar Directory: Bangkok" describes what it actually is. This is the
cheapest option, it is reversible, it touches no canonical tag, and it is the one I would try
first. Expected: the best-bars page stops being outranked by a page that should never have been
competing; the directory page keeps its navigational and crawl role.

**2. Canonical `/bars/city/<slug>` to `/best-bars/<slug>` where one exists.** More decisive and
more dangerous. It concedes the directory page's own ranking entirely, and `/bars/city/` is the
crawl path to 1,540 profiles. I would not do this before trying option 1, and if we ever do it
should be a canonical and not a redirect, so the page stays reachable.

**3. Leave it.** Defensible only if the split is deliberate. Nothing in the code suggests it is;
the H1s look like they were each written for their own page without anyone seeing them together.

**Not for me to choose.** It touches indexing, you said so in the task, and I agree. Option 1
is a one-line change per page type and I can have it on a preview within the hour if you want
to look at it.

---

# Step 3: the real opportunity, and a correction

**The task's claim is wrong.** It says "across 219 cities only Singapore has a subtype with 4 or
more bars". There are in fact **25 non-cocktail city+type pages live today**, across 22 cities:
Bangkok speakeasies and hotel bars, London speakeasies and hotel bars, New York speakeasies and
hotel bars, Warsaw rooftop and hotel bars, Las Vegas hotel bars, Hong Kong hotel bars, and so on.

The true picture:

| | Count |
|---|---|
| Cities with a best-bars page | 78 |
| City+type pages today | **103** |
| of which `cocktail-bars` | 78 (one per city, automatic) |
| of which anything else | **25** |
| Bars carrying any subtype | 420 of 1,540 |

## The opportunity is real and it is cheap

`MIN_TYPE_BARS` is 4. Counting every (city, type) pair that sits at one, two or three:

| Assignments needed | New pages it would create |
|---|---|
| **1 more bar** | **27 pages** |
| 2 more | 36 pages |
| 3 more | 85 pages |
| **total combos at 1 to 3** | **148** |

**Twenty-seven new pages, each one subtype assignment away**, in the highest-volume cities we
have:

| City | Type | Has | Needs |
|---|---|---|---|
| Singapore (41 bars) | Speakeasy | 3 | 1 |
| Bangkok (34) | Rooftop Bar | 3 | 1 |
| Seoul (25) | Speakeasy | 3 | 1 |
| Chicago (25) | Speakeasy | 3 | 1 |
| Chicago (25) | Hotel Bar | 3 | 1 |
| Miami (24) | Hotel Bar | 3 | 1 |
| Las Vegas (22) | Speakeasy | 3 | 1 |
| Prague (21) | Hotel Bar | 3 | 1 |
| Mexico City (21) | Speakeasy | 3 | 1 |
| Taipei (20) | Speakeasy | 3 | 1 |
| Portland (19) | Hotel Bar | 3 | 1 |
| New Delhi (18) | Speakeasy + Hotel Bar | 3 each | 1 each |
| Rome (17) | Speakeasy + Hotel Bar | 3 each | 1 each |
| Philadelphia (16) | Speakeasy | 3 | 1 |
| Washington DC (16) | Rooftop Bar | 3 | 1 |
| Belgrade (16) | Speakeasy | 3 | 1 |
| Atlanta (16) | Speakeasy | 3 | 1 |
| Detroit (16) | Hotel Bar | 3 | 1 |

At the measured 2.91% against 0.71%, this is the step with the best ratio of effort to outcome
in the whole task, and it needs no new bars, no threshold change and no indexing decision.

**The honest caveat.** A subtype must be true. "One assignment away" is only an opportunity
where a bar in that city genuinely is a speakeasy or a hotel bar and we have simply not tagged
it. I have not checked the candidates yet, so I cannot promise 27; I can promise 27 places
worth looking. The check is the bar's own description and website, which is the rule the
existing subtypes follow.

**What I would do, on your go:** work the 27 in volume order, read each city's untagged bars
against their own sites, tag only what is unambiguous, and report how many of the 27 actually
converted before writing anything. That keeps it a data change with a dry run, not a judgement
call made at scale.

---

# What I need from you

Three independent decisions:

1. **Step 1: nothing to do.** Unless you want Macau and Osaka enriched by two bars each, which
   is a small wave, not a page build. Say if so.
2. **Step 2: which option.** I recommend option 1, rewriting the `/bars/city/` H1 and title so
   it stops claiming "Best Bars in X". Cheap, reversible, no canonical changes. Preview first.
3. **Step 3: go or no go** on auditing the 27 one-assignment-away combos. Dry run and a count
   before anything is written.
