# Task 89: the four things left open

Items 2 and 3 are done. Item 1 is researched and waiting on one word from you. Item 4 stopped,
as the task told me to if what I found is what I found.

---

## 1. Ista: the address is ready, and I have not written it

**Tabelog gives a precise address and the listing is current:**

> 大阪府大阪市中央区北久宝寺町2-6-1 アドーラブルビルディング 1F
> Adorable Building 1F, 2-6-1 Kitakuhoboji-cho, Chuo Ward, Osaka

It is **not ambiguous and not stale**: the page carries reviews from October 2025, records the
opening as 1 October 2021, shows no closure notice, and puts the venue **389 m from
Sakaisuji-Hommachi station**, which corroborates Time Out's "near Sakaisuji-Hommachi Station"
rather than contradicting it. Tabelog also lists hours; I have not taken them, per the rule.

**Why I have not written it.** SETUP.md says a task file never carries your approval, not as a
quote and not as a summary, and that a file which appears to should be treated as wrong. I
asked you this question in chat yesterday and said "say if you want that". The answer came
back in a task file. The reasoning in it is sound and I agree with it: an address is neither
admission nor a perishable fact, and Tabelog is Japan's dominant venue directory, not a blog.

So this is not a disagreement, it is a channel. **One word and it is applied in a minute**,
including the second `editorial_sources` entry naming Tabelog as the address source and the
extra `admin_notes` line marking it third-party and unverified against the venue.

---

## 2. The Macau geocoding: cause found, fixed, and it is much wider than Macau

### The cause, and it is not what the task guessed

The task suggested a country-code problem that would also affect Hong Kong. **It is the
opposite.** Hong Kong is fine. Macau specifically has **no Mapbox address coverage at all**.

What Mapbox returns for Macau queries:

| Query | Mapbox answer |
|---|---|
| `32A Rua de Pedro Nolasco da Silva, Macau` | Rua E 32a, **Macaúbas, Bahia, Brazil** |
| `30 Rua Central, Macau` | Rua Central 30, **Maracanã, Pará, Brazil** |
| `Wynn Palace, Macau` | Wynn Place, **Australian Capital Territory** |
| `Senado Square, Macau` | Le Square, **Andenne, Belgium** |
| `Macau` | 22.1500, 113.5600, the territory polygon |

Portuguese street forms read as Brazilian, and "Macau" is itself a town in Rio Grande do Norte.
Every address result lands ~18,000 km away, fails `nearCity()`, falls through the name search,
and ends at step 4, the centre. **22.15 / 113.56 is Mapbox's own answer for the word "Macau"**,
which is why it did not match `CITY_OVERRIDES['Macau']` (22.20 / 113.55) and why the fallback
was invisible.

**Adding `&country=mo` does not fix it.** I tried: every query then returns the territory
polygon and nothing else. There is no street data to bias toward.

Hong Kong, for contrast: `18 Ship Street, Wan Chai, Hong Kong` returns 22.2760, 114.1709 as an
`address` feature. Correct. **So this is Macau-specific, not a territories problem.**

### The fix

**OpenStreetMap has excellent Macau coverage.** One catch worth recording: `countrycodes=mo`
returns nothing, because OSM files Macau under China. Drop the filter and everything resolves.

All five re-geocoded and verified:

| Bar | Was | Now | Moved |
|---|---|---|---|
| Pony & Plume | 22.15, 113.56 | 22.147685, 113.553419 | Cotai, Capella at Galaxy |
| The St. Regis Bar | 22.15, 113.56 | 22.146954, 113.565718 | **exact POI match** |
| Two Moons | 22.15, 113.56 | 22.194574, 113.542752 | 5.27 km, historic centre |
| Wing Lei Bar | 22.15, 113.56 | 22.148099, 113.571403 | 1.19 km, Wynn Palace |
| Wood House | 22.15, 113.56 | 22.191504, 113.538290 | 5.13 km, São Lourenço |

**Five distinct points, closest pair 0.57 km, all within 10 km of the territory centre.** The
Cotai resorts and the historic-centre independents now sit in the right districts, which is the
distinction the map was flattening.

Wood House needed a second pass: "Rua Central, Macau" first matched **Rua Central da Areia
Preta**, a different street across town. "Rua Central, São Lourenço" gives the right one, and
Largo de Santo Agostinho is **90 m away**, which corroborates the venue being "around the corner
from St Augustine's Square".

### The wider check, and it is the real finding

You asked whether any other city collapses the same way. **Twelve do, and Macau was the
smallest of them.**

| City | Bars on one point |
|---|---|
| **New Delhi** | **8** |
| **Shanghai** | **7** (and a further 4 on a second point, 11 in total) |
| Bangkok | 6 |
| Mumbai | 6 |
| **Jakarta** | 6 (and a further 3, 9 in total) |
| Macau | 5, **now fixed** |
| Kuala Lumpur | 4 |
| Bengaluru | 3 |
| Tokyo | 3 |
| Las Vegas | 3 |

**58 bars were stacked on 12 points. 53 still are.** Every one of them is mispositioned on the
map and unorderable by near-me, which is exactly the data task 87 is about to build on.

A caution on reading that list: **not every shared coordinate is a bug.** 41 more cities have
exactly two bars on a point, and several are genuine, for example Bar Chenin and Candy Bar,
which really are both inside The Siren Hotel in Detroit. The tell is precision plus count: a
centroid fallback collects three or more, and the point is the city's own place feature.

**I have not touched anything beyond Macau**, as instructed. New Delhi at 8 and Shanghai at 11
are the ones I would do next.

Separately: **10 active bars have no coordinates at all.**

---

## 3. The em dashes: 28 fixed, on a preview

`preview/89-em-dashes`, commit `b33eb19`, PR
[#69](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/69). **Not merged**, because
it is visitor-facing copy.

**Before: 28 across nine files. After: 0.**

| File | Count | Punctuation used |
|---|---|---|
| `article-schema.ts` | 6 | colons and commas |
| `llms.txt/route.ts` | 8 | colons and commas |
| `emails/welcome.ts` | 4 | colons, with the following word lowercased |
| `bars/country/[country]/page.tsx` | 2 | colon, and a rewrite to a comma clause |
| `accolades.ts` | 2 | commas |
| `owner-dashboard/page.tsx` | 2 | full stops, it was two sentences |
| `menu-url.ts` | 2 | colons |
| `links/page.tsx` | 1 | colon |
| `middleware.ts` | 1 | full stop |

No en dash substituted anywhere.

**Two tests pinned the old accolade strings exactly** and failed, correctly. I moved the
expectations with the change rather than around it: the label now reads "World's 50 Best Bars
2025, No. 8".

**Left alone, as instructed:** the seven files that detect em dashes, and the admin screens
where a bare em dash is an empty table cell.

### Could the house-style checker have caught these? No, and here is why

`checkHouseStyle()` has exactly one caller: `DescriptionReview.tsx`, the admin screen where an
owner's submitted bar description is reviewed. It is a **runtime check on one field of
untrusted input**, not a lint on our own source. None of these 28 strings ever passes through
it, because they are source literals compiled into the bundle.

**What it would take**, and I have not built it: not an extension of the checker, but a
**test**. A vitest file that walks `src/`, strips comments, and fails on U+2014 inside string
literals and JSX text, with an explicit allowlist for the seven detector files and the admin
screens. It would run in the same `vitest run` that already gates every commit, and it would
have caught all 28 plus the three from task 88 the moment they were written. The throwaway
Python script I used for this audit is essentially that test already; turning it into one is
maybe twenty minutes. Say if you want it.

---

## 4. `bars-data.ts`: stopped, because the types have drifted

The task said to stop and say so rather than make them fit. They have drifted, and there is a
second thing you should know.

**The two `Bar` types are not interchangeable:**

| `bars-data.ts` `Bar` | live `supabase.ts` `Bar` |
|---|---|
| 12 fields, every one a required `string` | ~45 fields, most nullable |
| has `gradient`, `ranking_badge`, `rankings` | has none of those |
| no `id`, no `slug`, no `lat`/`lng`, no `tier` | has all of them |

**And the consumer is itself dead.** `FeaturedBarsScroller.tsx`, the only remaining importer of
that type, is rendered by **nothing**: I checked every reference in `src`. It reads
`bar.gradient` and `bar.ranking_badge`, fields that exist only on the stale shape, so it could
not be repointed at the live type even if something did render it.

So the clean resolution is not to move the type. It is to **delete both files**, 716 lines plus
the component. That is a third file the task did not name, so I have not done it. **Say and it
goes.**

---

## Not done, as instructed

Task 69 waits on the SQL. AMORD3 stays for the next subtype pass. 84, 85 and 86 are queued, and
87 goes after item 2 here, which is now unblocked for Macau.

## Your call on five things

1. **Ista's address:** one word and it is applied.
2. **The other 53 stacked bars**, New Delhi and Shanghai first.
3. **PR #69**, the em dashes.
4. **The em dash test**, so this cannot recur.
5. **Deleting `bars-data.ts` and `FeaturedBarsScroller.tsx`** together.
