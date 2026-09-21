# Report: 11d-card-spacing-desktop-and-gap (2026-09-15, 15:56 to 16:08 PT)

Done and deployed: commit 071e240. CSS only, two rules; nothing else on the page changed. Tests 309/309, build clean.

## Method

The pre-05 commit (582d7ea, the parent of 04d541f) was checked out in a git worktree and served locally next to the current build; both read the live database, so the content was identical. Every number below is the element box top or bottom from getBoundingClientRect in document pixels, gap = next top minus previous bottom, on the same two bars at 390 and 1440. "Current" is the build before this fix (live under 46eb37d); "after" is this commit.

## Table 1: the info card, in px

Bitter & Twisted (claimed, one tile, prose):

| Gap | 390 pre-05 | 390 current | 390 after | 1440 pre-05 | 1440 current | 1440 after |
|---|---|---|---|---|---|---|
| H1 to place line | 8 | 8 | 8 | 8 | 14 | 8 |
| place to tiles | 15 | 15 | 15 | 15 | 29 | 15 |
| tiles to prose | 18 | 18 | 18 | 18 | 28 | 18 |
| prose to description | 0 | 10 | 10 | 0 | 10 | 10 |
| description to meta rows | 20 | 20 | 20 | 20 | 20 | 20 |
| meta rows to card bottom edge | 145 | 280 | 280 | 33 | 33 | 33 |
| card bottom edge to Plan Your Visit | 40 | 40 | 40 | 40 | 40 | 40 |

Captain Foxheart's (unclaimed, no tiles, no prose):

| Gap | 390 pre-05 | 390 current | 390 after | 1440 pre-05 | 1440 current | 1440 after |
|---|---|---|---|---|---|---|
| H1 to place line | 8 | 8 | 8 | 8 | 14 | 8 |
| place to description | 15 | 15 | 15 | 15 | 15 | 15 |
| description to meta rows | 20 | 20 | 20 | 20 | 20 | 20 |
| meta rows to card bottom edge | 148 | 268 | 268 | 33 | 33 | 33 |
| card bottom edge to Plan Your Visit | 40 | 40 | 40 | 40 | 40 | 40 |

Reading it:
- Desktop: the grid kept both neighbours' margins (h1 8 + place 6 = 14; place 15 + tiles 14 = 29; tiles 18 + prose 10 = 28) where block flow kept the larger. The fix drops the upper margin of each pair inside the 1100px-and-up grid, so the gaps are the pre-05 8/15/18 again. Everything else on desktop already matched.
- The card bottom edge to Plan Your Visit was 40px in every column, before and after, both widths. The card is not further from the visit block than it was; on phones the card itself is taller at the bottom, and that is entirely the actions block, which the task keeps: pre-05 the buttons sat two per row (99px for Captain Foxheart's, 96 for Bitter & Twisted, note included); now they are the 11a full-width stack plus the 09 three-line note (219 and 231). Meta rows to buttons is 24 in both builds, buttons to card edge 25 in both.
- Desktop meta rows to card bottom is 33 in both builds: the actions column is shorter than the text column on both bars, so it adds nothing. On a bar whose right column is genuinely taller than its text, the card is as tall as the column, which the task allows.
- One deliberate departure from pre-05: prose to description is 10px, not 0. Task 12 asked for "a small gap so the two blocks read as two blocks"; the two rules would contradict each other, so the newer one stands. Say the word and it goes to 0.
- Not a spacing item: at 1440 the Bitter & Twisted name is one line now and was two pre-05 (the text column is wider than the old 60 percent), which is why the H1 box is 48 tall instead of 96.

## Table 2: the gap under the Get Featured CTA, in px

| Gap | 390 current | 390 after | 1440 current | 1440 after |
|---|---|---|---|---|
| map bottom to CTA top (the standard) | 32 | 32 | 32 | 32 |
| CTA bottom to "Nearby in ..." heading | 64 | 32 | 64 | 32 |

Cause: the nearby list carried its 2rem above as padding, and since task 14 it follows the CTA banner, whose 2rem bottom margin does not collapse into padding. The 2rem is now a margin on the list (padding below unchanged), so it collapses into the CTA's margin; after the map or the mentions card (the cases without a CTA, paid bars and bars with an article) the margin supplies the same 32 on its own. Both bars, both widths, measured at 32 after.

## Diff and no-other-change check

src/app/globals.css only: three selectors get margin-top: 0 inside the existing 1100px media block, and .bar-v2-nearby goes from padding 2rem 0 to margin-top 2rem plus padding 0 0 2rem. No markup changed. Every other measured box (visit, gallery, map, CTA heights, card padding, the actions column) is identical before and after at both widths on both bars.

## Live after deploy (barmagazine.com, Bitter & Twisted)

- 1440: H1 to place 8, place to tiles 15, tiles to prose 18, prose to description 10, description to meta rows 20, meta rows to card edge 33, card edge to Plan Your Visit 40, CTA to Nearby heading 32.
- 390: 8, 15, 18, 10, 20, 280 (the button stack and note), 40, 32.

## Screenshots

Bitter & Twisted at 1440 and Captain Foxheart's at 390 were captured from the local build after the fix (the card at 1440 with the tightened name/place/tiles/prose stack and the 300px actions column; at 390 the dark CTA with "Nearby in Houston" 32px under it). The capture tool returns no file path.

The pre-05 worktree, its launch entry and its server were removed after the measurements.
