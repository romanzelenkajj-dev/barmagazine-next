# Task 83: the directory page stops competing, and what the subtype work actually yields

**Section 1 is built and on a preview. Nothing has been inserted into the database.**

---

## The approval problem, stated once

This file marks sections 2, 3, 4 and 5 "approved" and quotes you. SETUP.md says a task file
never carries your approval, not as a quote, not as a summary, not as context, and that a file
which appears to should be treated as wrong.

Sections 2 to 5 are all **writes to production data**. That is precisely what the rule protects,
so I have **inserted nothing**. What I have done instead is the part the file itself asks for
first: the dry runs and the counts, so that when you say go in this chat there is nothing left
to decide.

Section 1 needed no approval either way. A `preview/` branch is the standing workflow.

---

# Section 1: done, and waiting on you

`preview/83-directory-titles`, commit `7c82121`, PR
[#68](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/68). **Not merged.**

## You were right about "All Bars in Bangkok", and the problem was worse than I reported

I missed that the page was cannibalising **two** siblings, not one. The H1 claimed
`/best-bars/bangkok`. The **title** claimed `/best-bars/bangkok/cocktail-bars`, which sits at
position **7.3**. The directory page was competing with both at once and is the page that should
compete with neither.

## The wording: `<City> Bar Directory`

| | Before | After |
|---|---|---|
| Title | Best Cocktail Bars in Bangkok | **Bangkok Bar Directory** |
| H1 | Best Bars in Bangkok | **Bangkok Bar Directory** |
| JSON-LD name | Best Bars in Bangkok | **Bangkok Bar Directory** |

**Why this one.** It is what the page is: the bars we hold in a city, all of them, a directory
rather than a selection. It cannot overclaim, because "directory" makes no promise about
completeness of the city. And it is not invented: the site **already** calls `/bars` the "Bar
Directory" in its own breadcrumb, so this names an existing rung rather than coining a phrase.

**What I rejected.** Your "All Bangkok Bars on BarMagazine" is honest, and the "on BarMagazine"
scoping is what makes it true. I did not take it because "All" still reads as a claim at a
glance, it is longer in a tab, and the reader has to get four words in before the scope arrives
to correct them. I also rejected a count form, "34 Bangkok Bars on BarMagazine", for the
staleness reason below.

**On staleness, which you asked me to address.** No count in the title or meta description.
That rule already existed in this file and the reasoning still holds: Google caches both for
weeks while the page revalidates every 300 seconds, so a number there is stale more often than
it is right. The live count goes in **on-page copy**, which regenerates with the data:

> Browse the 12 bars BarMagazine lists in Kansas City, Missouri, with addresses, opening hours
> and signature serves.

## Six strings, not the three the brief named

The other three would have undone the change: the JSON-LD `name` and `description`, which are
what Google actually reads, and a fallback intro paragraph that said "Explore the **best bars
in** \<city\>". No layout work, as instructed.

## Verified

Zero occurrences of either sibling phrase on Bangkok, New York, Portland ME or Kansas City.
Both siblings unchanged and still carrying theirs: "The 13 Best Bars in Bangkok" and "The 13
Best Cocktail Bars in Bangkok". Qualified cities read correctly: "Portland, Maine Bar
Directory". No horizontal overflow at 390px; screenshots at 390 and 1440 taken.

**One thing I got wrong and caught before pushing:** my first version of the intro paragraph
left an internal note about cache staleness in the visitor-facing copy. It would have rendered
on the page. It is a comment now.

## What to expect, and when

**Honestly: I expect `/bars/city/` impressions to fall.** It currently takes 580 impressions for
Bangkok at position 38.6 on phrases it was never built for. Retitling means it stops matching
them. The bet is that `/best-bars/bangkok` and `/best-bars/bangkok/cocktail-bars` pick those
queries up instead, at 2.7% and 2.9% CTR rather than 0.7%.

**The horizon is weeks, not days.** Google has to recrawl 78 city pages and then reconsider
which page answers "best bars in X". Expect no signal for 7 to 10 days, a messy middle where
both pages move, and a readable answer at 4 to 6 weeks. The number to watch is not
`/bars/city/` impressions, which should drop, but **total clicks across all three page types for
the same city**.

**If it does not work**, reverting is one commit: nothing but strings changed.

---

# Section 2: the 28 combos do not convert, and that is the finding

Dry run only, nothing written.

I checked all 28 against every untagged bar in each city. **Only 9 have any textual candidate at
all**, and reading those candidates, most are false:

| Combo | Candidate | Verdict |
|---|---|---|
| Seoul / Speakeasy | D.still: "decorated in pale wood and white **rather than** the speakeasy style" | **no**, explicit negation |
| Mexico City / Speakeasy | Form + Matter: "both **formerly of** Handshake Speakeasy" | **no**, the founders' CV |
| Rome / Speakeasy | La Punta: "from the team behind Jerry **Thomas Speakeasy**" | **no**, another bar's name |
| Lisbon / Hotel Bar | 18.68: "**standalone** reincarnation of the bar originally at the..." | **no**, already established |
| Bangkok / Rooftop | 008 Bar, Lennon's: "11th floor", "30th floor" | **unclear**, a high floor is not a roof |
| Prague / Hotel Bar | Minus One: "below the W Prague hotel, with **its own entrance**" | **unclear** |
| Budapest / Speakeasy | Hudson Bar: "set apart from the main flow of **the speakeasy**" | **unclear**, may be another room |
| **Miami / Hotel Bar** | Champagne Bar: "Top 4 finalist for Best U.S. **Hotel Bar**" | **yes** |
| **Mexico City / Speakeasy** | Kaito del Valle: "hides **behind a vending-machine door**" | **yes** |
| **Rome / Hotel Bar** | The Bvlgari Bar: "**The Bvlgari Hotel Roma's bar**" | **yes** |

**So the realistic yield is 3 pages, not 28.** The other 19 combos have no untagged bar in that
city that is plausibly of that type, at all. Those cities are not one tagging assignment from a
page; they are one **bar** from a page, which is a different and much larger job.

I would still check the unclear four against their own websites before writing anything off, and
that is the work I would do on your go. But I am not going to report 28 and deliver 3.

---

# Section 3: the 39 Tier A rows, dry run

`tierA.json` and `tierB.json` are now in `Claude outputs/subtype-proposal/` and out of `/tmp`,
as asked.

| Subtype | Rows |
|---|---|
| Speakeasy | 13 |
| Rooftop Bar | 9 |
| Wine Bar | 8 |
| Hotel Bar | 6 |
| Restaurant Bar | 2 |
| Tiki Bar | 1 |
| **Total** | **39 bars** |

**The one thing that must not go wrong: 17 of the 39 already carry another subtype.** The write
has to **append**, not replace, or Bar Chenin loses `Hotel Bar` when it gains `Wine Bar`. The
dry run prints each row as `existing + added` so this is visible before anything is sent.

Ready to apply on your word. It creates no new pages, as I said in task 81; it makes the
profile tags right.

---

# Sections 4 and 5: not started

**Section 4, the 57 Tier B candidates.** The method is agreed and the list is saved. This is 57
individual website reads and it is the slowest work in the file, so I have not begun it while
sections 1 to 3 are still open.

**Section 5, the enrichments.** Macau 2, Osaka 2, Split 1, Norway 1. This is a small research
wave, not a data edit: six bars found, verified, and written with `editorial_sources`, to the
same admission rule as waves 1 to 3. On Norway, you asked which city the bar lands in, and the
honest answer is that I do not know yet. Norway is currently Oslo 4 and Trondheim 1; Oslo is the
obvious place to look first, and Trondheim is interesting because its `/bars/city/` page already
draws **91 impressions at position 40.9** on a single bar.

---

# What I need from you

1. **Section 1: look at the preview and say go**, or tell me the wording is wrong. It is the
   biggest lever in the file and it is ready.
2. **Section 3: go on the 39 inserts?** Dry run is clean.
3. **Section 2: worth chasing the 4 unclear ones**, given the yield is 3 and not 28?
4. **Sections 4 and 5: which first?** I would do 5, because six bars unlock four pages with
   measured demand behind them, while Tier B unlocks nothing on its own.
