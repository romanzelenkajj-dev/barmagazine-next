# Task 102: award claims audit

**Applied on `main`, data and guard. 1,646 active bars, 0 disagreements left. `npm run verify` now fails on the first one.**

---

# What was checked

Every active bar whose description names an award program: **460 bars, 622 claims.** Each claim was
checked against the official source, not against what the description said.

| Source | What was read |
|---|---|
| The World's 50 Best Bars | every list 2011 to 2025, 51 to 100 included where it exists |
| Asia's 50 Best | 2016 to 2026, plus the 2021 51 to 100 |
| North America's 50 Best | 2022 to 2026, plus the 2025 inaugural 51 to 100 |
| Europe's 50 Best | 2026, the only year that exists |
| Spirited Awards | the full archive, 2007 to 2026, 5,498 rows parsed |
| James Beard | per bar, because the Foundation's search is JavaScript with no API |
| Bartenders' Choice | the Danish winners list for the one disputed claim |
| Pinnacle Guide | attempted; the site returns empty pages to a fetch |

# Outcomes

| Outcome | Bars |
|---|---|
| (a) record exists and text matches, left alone | **315** |
| (b) real award, wrong or missing year or missing record: record added, text fixed | **145** (17 text edits, 128 record-only) |
| (c) could not be verified: award sentence removed or cut back | **7**, inside the 17 above |

**304 accolade records added.** Every one carries its official source URL. The `score` on new
records is provisional; the monthly task rewrites it.

# The 17 text edits

| Bar | What was wrong | Now |
|---|---|---|
| Polite Provisions | won its Spirited Award "at the 2025 Spirited Awards" | 2014, the year the category existed |
| Young Blood | North America's 50 Best "in 2025" | 2023, No.49 |
| Raised by Wolves | no year on a real 2023 win | 2023 added to the sentence |
| Noble Experiment | hours string malformed | normalised; Sunday unstated because neither site publishes hours |
| Tiki-Ti | Timeless U.S. Award "2025" | 2023 |
| Spare Room | Best American Hotel Bar "2025" | 2020 |
| Herbs & Rye | both wins "at the 2024 Spirited Awards" | 2019; the Next Wave award split into its own sentence |
| Zuma | World's 50 Best "run from 2019 to 2022" | 2020 to 2022; it was not on the 2019 list |
| Bar Mood | "on Asia's 50 Best every year since 2019" | 2019 to 2021 and 2024 to 2026; absent in 2022 and 2023 |
| Vesper | "peaking at No.12 in 2023" | No.11 in 2020, the actual peak; "every year since 2016" was true and stays |
| Jewel of the South | "Outstanding Bar Program" for 2024 | "Outstanding Bar", the category's name since 2023 |
| Boutiq'Bar | "shortlist placings from 2021 to 2025"; a claimed Bar Team win | shortlist claim removed, on no extended list; 2020 was a Top 10 honour |
| Papa Gede's | "a Spirited Awards nomination in 2017" | removed; no entry in the archive |
| White Whale | Attaboy "No. 66 on the World's 50 Best Bars" | No. 66 on North America's 50 Best 2025, the list it was actually on |
| PCO | "No.54 on Asia's 50 Best 2021" | removed; No.54 that year was The Old Man |
| Origin Bar | two PINs "retained in 2026" | retention claim removed, unverifiable |
| Teens of Thailand | "#42 Asia's 50 Best" | No.27 in 2016, its real best |
| Isa Cocteleria | other awards' years sat beside the Spirited clause | reordered so each year sits with its own award |
| Soma | GQ's 2022 beside the Pinnacle PIN | split into two sentences |
| The Baxter Inn | "World'90s 50 Best" typo, "every year since opening", a misnamed category | four listings 2012 to 2017; "World's Best Spirits Selection" |

# Records added with no text change: 128 bars

The description was right and the record was simply missing. The biggest gaps: **Atlas** had never
had a World's 50 Best record despite seven years on the list; **The SG Club** 13 placings; **Quinary**
14; **The Old Man** 8; **Hanky Panky** 8; **Sago House** 7. Five James Beard winners had no record at
all: Cure (2018), Maison Premiere (2016), Julep (2022), Jewel of the South (2024), Kumiko (2025).

The full list is in `/tmp/changed-102.json` on this machine and in the commit's audit output; the
names are also readable from the guard's clean run.

# Things I chose, and one I did not

**Wrong-venue matches caught by reading, not by code.** The auto-resolver would have given the
Milan Salmon Guru all of Madrid's placings, Florería Atlántico DC the Buenos Aires bar's 2025
rank, and The Old Man in Hong Kong the Singapore Old Man's 2021 No.42. All three excluded.

**Spirited "winner" is written only where the copy claims a win and the archive agrees.** The
archive page repeats categories in regional variants, so a naive parse yields three "winners" for
2014 High Volume. Where the copy says "recognition" or "honoree", the record is a nominee.

**Descriptions about somebody else's award are exempt, by name, with a reason.** Eighteen bars name
a program for a chef, a sister bar, a consultant, or the city's festival. The guard carries the list
(`AWARD_CLAIM_EXEMPT`) so a reviewer can argue with each entry.

**Top 500 Bars is not touched.** Four bars name it. It is not one of your five sources and it is its
own official source, so I have neither verified nor removed it. Your call whether it counts.

# The guard

`src/lib/award-claims.mjs`: a description may name a program only if the bar holds a record for
it, and a year within 40 characters of an award phrase must be a record year. It knows the things
that look like awards and are not (50 Best Discovery, the Restaurants list, person categories, the
design award) and treats "opened in 2014" as a date, not a claim. 11 fixture tests, including the
real Polite Provisions, Young Blood and Bar Mood failures so they cannot return.
`scripts/audit-award-claims.mjs` runs it over the live rows inside `verify.sh`.

# WordPress

All 383 posts were searched for every bar whose award text changed, with the wrong award or year as
the pattern. **No article repeats a corrected claim.** The only hits were two Bartenders' Choice
winners articles listing "Best New Cocktail Bar: Afterglow", which is Sweden's category and does not
contradict Victory's Danish win.
