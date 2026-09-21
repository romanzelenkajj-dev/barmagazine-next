# Task 93: the five mismatches, Svanen, Coa Shanghai, and token-wise search

Four answers. **Item 3 stops where you told it to stop.**

---

# 1. The five slug/name mismatches: all five are renames. None is the wrong bar.

You were right that most would be renames. It turned out to be all of them. Each checked against
the venue's own site, not against my reading of the row.

| Slug | Stored name | The venue's own site | Verdict |
|---|---|---|---|
| `nomad-bar-las-vegas` | The Reserve Bar | its own description records the rebrand: MGM renamed the hotel-within-a-hotel The Reserve at Park MGM | **renamed, slug kept** |
| `teeling-whiskey-bar` | Bang Bang Bar at Teeling Distillery | page title: *"Teeling Whiskey Cocktails at the Bang Bang Bar"* | **renamed, slug kept** |
| `mag-cafe` | Mag i Navigli | Farmily group lists its venues as *1930, Mag i Navigli, Mag La Pusterla, Backdoor43, Iter* | **renamed, slug kept** |
| `nouveau-vague` | Bar Nouveau | `barnouveau.fr` title: **Bar Nouveau** | **name correct**, the slug is a play on Nouvelle Vague |
| `blind-duck` | The Blind Duck | `raffles.com/boston`: *"THE BLIND DUCK, a speakeasy in the sky"* | **correct, and not a mis-merge** |

## Blind Duck specifically, since you asked for the closest look

**It is right, and the hotel-group domain is the correct domain.** Raffles Boston's own dining
page carries the bar under that exact name at 40 Trinity Place, on the 17th and 18th floors. The
Haute Living wave admitted it as a hotel bar and stored the hotel's page for it, which is what a
hotel bar's website is. Every other hotel bar we list does the same: `bulgarihotels.com`,
`editionhotels.com`, `fourseasons.com`, `shangri-la.com`, `roccofortehotels.com`.

A mis-merge would show a hotel-group domain on a venue that is **not** in that hotel. This one is.

**Nothing changed on any of the five.** Under the convention you named, a renamed bar keeping its
old slug is correct, and four of these are exactly that.

---

# 2. Svanen: done, and it was wrong in a second place

Slug `svanen-stockholm` -> **`svanen-oslo`**, with the 301 appended to the merged-bar-slugs map in
`next.config.mjs` **in the same commit** (`3642933`). No `bar_claims` or `owner_submissions` rows
reference the bar. Its own site is `svanenoslo.no`, titled *"Award-Winning Cocktail Bar in Oslo
Sentrum"*, which agrees with your Falstaff reading.

**The coordinates were Stockholm's too.** Stored at 59.324337, 18.06902, which is central
Stockholm and **417 km from its own address** at Karl Johans gate 13. Re-geocoded to 59.912419,
10.744666 (Mapbox, `address` granularity, the exact street number).

I fixed that in the same pass rather than leaving it, because it is the same Stockholm/Oslo
confusion on the same row and I would only have had to come back for it. **Say so if you would
rather I had left it.** The row stays inactive; nothing else changed.

## While there: 96 rows are inactive with `status: open`

Not what you asked and **not touched**, but it surfaced from this row and is worth a decision.

`is_active=false` is not the closure marker, because closures use `status`. All 96 inactive rows
say `status: open`. Four of them carry 50 Best accolades:

| Slug | Accolade | Site |
|---|---|---|
| `nouveau-vague` | **World's 50 Best #17, 2025** | live |
| `svanen-oslo` | **World's 50 Best #32, 2025** | live |
| `cloakroom` | North America's 50 Best #56, 2026 | |
| `selva` | North America's 50 Best #43, 2026 | |

They are not in `parked.txt`, which is outreach-only. Two top-40 bars in the world are hidden from
the directory with live websites. Either that is a holding pen I do not know about, or it is a
bug. **Your call, and I have changed nothing.**

---

# 3. Coa Shanghai: STOPPING. There IS a real Coa in Shanghai.

You said to stop and tell you in this case, so I am.

**`coa-shanghai-1773995982` is not a duplicate of Coa Hong Kong.** It is the mainland outpost, and
the two rows describe two different venues:

| | `coa` | `coa-shanghai-1773995982` |
|---|---|---|
| City | Hong Kong | Shanghai |
| Address | Shop A, LG/F Wah Shin House, 6-10 Shin Hing Street, Central | **580 Fuxing Zhong Lu, Huangpu** |
| Accolade | World's 50 Best **#38**, 2025 | Asia's 50 Best **#95**, 2026 |
| Tier | top10 | free |

Its description is specific and about a different building: *"Jay Khan's agave mission came to the
mainland in March 2022: Coa Shanghai spreads over three floors of a renovated house, La Cantina at
street level..."*

**Two bars, one operator, two cities, two separate accolades. Merging them would delete a real
listing and its Asia's 50 Best ranking.**

Your read of the mechanism was right, though, and it explains the ugly slug: the 20 March bulk
wave tried to insert this row as `coa`, collided with the Hong Kong row inserted on 18 March, and
the insert appended a timestamp. So the slug is wave damage on a legitimate bar.

**What I would do instead, on your word:** rename the slug to `coa-shanghai` with a 301 from
`coa-shanghai-1773995982`, exactly as Svanen. No merge, no delete. It has no website or email, so
it is also a candidate for the enrichment list.

---

# 4. Token-wise search: built, on a preview

**PR #70**, branch `preview/93-token-wise-search`.

`searchOrFilters()` returns one `.or()` per word. PostgREST ANDs top-level filters, so **every
word must match, in any order**, and each word may land in the name or the city.

## What it is worth, measured across the whole directory

Of **1,154** active bars with a multi-word name, typing that bar's own words **in reverse order**
finds it:

| | Found |
|---|---|
| Before | **5** of 1,154 |
| After | **1,154** of 1,154 |

## Nothing can regress, and that is structural rather than hopeful

A contiguous match implies every word is present, so the new filter returns a **superset**. A
994-query sweep against all 1,545 active bars found **0 rows that matched before and not after**.

Single-word queries are byte-for-byte the old filter, which a test pins directly.

## The ranking tiers, intact

`searchTierMulti` takes the **better** of two readings: the whole query as typed, the only one
that can earn tier 0 on a phrase, and the worst tier among the individual words. For one word the
two readings are the same number, so every query that worked before ranks exactly as before. That
is why it takes the minimum rather than replacing the rule.

## Speed: no cost

| Query | Median |
|---|---|
| 1 word | 235ms |
| 2 words | 199-207ms |
| 3 words | 217ms |
| 6 words (the cap) | 199ms |

The round-trip dominates the predicate, and a multi-word query returns fewer rows to serialise.
Word count is capped at 6 so a pasted paragraph cannot fan out.

## I verified the premise rather than assuming it

Repeated `or=` params really do AND rather than union. The control pair `haktet` + `tokyo` returns
**0 rows**, which it could not if they were being OR'd.

## A bug I introduced and caught by driving the page

The first commit passed 413 unit tests and a direct check against the live API, and the directory
grid still read **0 bars found** for "tokyo edition" while the typeahead directly above it offered
the right bar.

`BarDirectoryMap` **re-filters** the rows the server returns, in two places, and that second
filter still tested the whole query as one contiguous string. It was discarding exactly the rows
the new server query had gone and found.

`matchesAllWords()` is now the single implementation and both copies read it, so they cannot drift
apart again. Same lesson as the near-me in-flight flag in task 87: the tests were not the thing
that found it.

## Driven in the browser, against the real database

| Typed | Result |
|---|---|
| `haktet vanster` | Vänster at Häktet, Stockholm |
| `teeling bang` | Bang Bang Bar at Teeling Distillery, Dublin |
| `warsaw gin` | Lane's Gin Bar, Warsaw (one word in the name, one in the city) |
| `tokyo edition` | **1 bar found**, Gold Bar at EDITION |
| `Ori` | Origin Bar first, inline completion intact |
| `bratislava` | **16 bars**, which is exactly what the database returns for that filter |

Build clean, 413 tests pass.

**The Vercel preview is behind the login wall** (branch aliases are still not enabled), so the
browser verification above was driven against a local build of the branch, hitting the same
production Supabase. The preview URL is on the PR if you can reach it while signed in:
`barmagazine-next-git-previ-914649-romanzelenkajj-7135s-projects.vercel.app`

---

# Batch 15, window 1

Fired at 21:00. **10 sent, 1 skipped.** The task-84 guard worked on its first live run: it counted
1 of 11 without an address, **named The Savory Project on stdout**, stated 9% against the 20%
limit, and continued. Window 2 at 23:00 carries the remaining 11 including Coa, whose address you
added.
