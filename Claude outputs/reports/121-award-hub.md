# Task 121: award hub navigation, collapsed lists, The 50 Best Bars. PR #84 MERGED 2026-09-23 on Roman's go

Preview (Vercel SSO), build state in chat:
- https://barmagazine-next-git-previ-2fff2c-romanzelenkajj-7135s-projects.vercel.app/awards/worlds-50-best
- https://barmagazine-next-git-previ-2fff2c-romanzelenkajj-7135s-projects.vercel.app/awards/worlds-50-best?edition=asia&year=2026
- https://barmagazine-next-git-previ-2fff2c-romanzelenkajj-7135s-projects.vercel.app/bars/front-back (No. 80, a 2026 world record)

## 1. One list at a time

A white switcher card directly under the band (`AwardHubSwitcher`, a client component): the
edition row as four pills (The 50 Best Bars, Asia, Europe, North America; only editions with
records appear, so Europe shows because its 2026 list is in), a year dropdown listing the years
that edition has (16 for the world list, 11 for Asia), and a count line ("The 50 Best Bars 2026:
50 bars in our directory"). One edition and year shows; the other 32 panels are in the HTML as
`hidden`, so every card and link stays crawlable and the page weighs what it did.

Switching is client-side, no reload: the selection is written with `history.replaceState` as
`?edition=world&year=2026`, and a link with those parameters opens that list (the server renders
the default, the deep link switches after hydration). Default with no parameters: the world list,
most recent year with records, which today is 2026 and holds only the 51-100 block, since the 1-50
list lands on 7 October. Same component on every hub: Spirited Awards and James Beard get the
year dropdown alone (one edition), and their category sections keep the task 112 header rows,
with runs of one-bar categories flowing into one block labelled Winners, Nominees or Honored bars
with the category on each card, as before.

## 2. Long lists collapse

Each block shows ten cards, then a white card with a black "Show all 50" pill (Show fewer once
open). A ranked list that runs past No. 50 splits into "No. 1 to 50" and "No. 51 to 100" blocks,
each with its own button; Asia 2026 shows both today, the world 2026 list only the second. The
expanded blocks go into the hash (`#open=1-50,51-100`) so a shared link opens them expanded.
Verified locally: expanding 51-100 shows 50 cards and writes `#open=51-100`; the Asia pill and the
year select switch the list and the URL; a deep link to Asia 2026 opens on Asia.

Without JavaScript: the default list shows in full (the collapsed remainder is hidden only under
the `js` class), the switcher and the buttons stay hidden, so the page still reads.

## 3. The name

Hub title "The 50 Best Bars"; slug `/awards/worlds-50-best` untouched, no redirect. Band intro:
"The 50 Best Bars, formerly The World's 50 Best Bars, and its Asia, Europe and North America
editions, voted by the academy of bartenders, writers and drinks experts."

`displayOrg()` in `src/lib/accolades.ts` is now the one place an organisation name is chosen for
display: the world list from 2026 is "The 50 Best Bars", everything else prints its stored name.
It feeds the tiles (the 2026 tile reads THE / 50 BEST / 2026), the profile prose ("No. 80 on The
50 Best Bars 2026."), the schema.org award strings ("The 50 Best Bars 2026, No. 80"), the SEO
title ("Front/Back, Accra | No. 80 on The 50 Best Bars 2026"), the fallback description and the
hub section labels. A 2025 record still reads "World's 50 Best Bars 2025" everywhere. 2 new tests.

Data: the 50 stored 2026 world records (org_key w50b) now carry `org: "The 50 Best Bars"` as
well, written through the admin API (50 bars updated, 0 failed, re-run finds nothing left). 2025
and earlier untouched. The claims guard matches programs by org key, so it is unaffected.

## 4. Meta and cards

Title "The 50 Best Bars: Honored Bars in Our Directory". Description: "361 bars in the BarMagazine
directory hold a place on The 50 Best Bars, formerly The World's 50 Best Bars, or its Asia, Europe
and North America editions, 2011 to 2026. Verified from official results, one list at a time, with
a profile for every bar." Switcher, expander buttons and the count line all live in white cards;
the block header rows keep the task 112 style. Checked at 390: pills wrap, no horizontal overflow.

## verify.sh

Passed on the branch: 45 test files, 508 tests; route budget 167; award claims 1,782 bars, 0
problems; `next build` clean, 891 static pages.

## Files

`src/components/AwardHubSwitcher.tsx` (new), `src/lib/award-hub-model.ts` + test (new, pure:
panels, blocks, default selection), `src/lib/honored-bars.ts` (new leaf: hub types and merit
order, so the model and its tests import no Supabase), `src/lib/display-org.test.ts` (new),
`src/app/awards/[program]/page.tsx` (rewritten around the switcher), `src/lib/award-hubs.ts`
(name, tagline, sections keyed by org), `src/lib/accolades.ts`, `src/lib/accolade-sentences.ts`,
`src/lib/bar-fallback.ts`, `src/lib/bar-seo-meta.ts`, `src/app/globals.css`.

For 7 October: the 1-50 world list insert should write `org: "The 50 Best Bars"` on its 2026
records; the scratch script `w50b-2026.mjs` still writes the old name and needs that one change.

## Found on the preview in Chrome, fixed before handing over

The 2025 world list carries a special-award record of kind "winner" next to its hundred placings,
and the first cut judged a panel by all its records at once, so 2025 rendered under a category
heading instead of the No. 1 to 50 / No. 51 to 100 split. The model now splits ranked placings
first and lists whatever else the edition holds that year (special awards, nominations) as
category blocks after them. Test added; preview rebuilt green. Clicked through in Chrome: the four
pills, the year dropdown, Show all and the hash, and the deep link to Asia 2026.

## Follow-up (Roman, same day): the second No. 20

PR #84 was never merged: it is open and still a draft, and stays so until Roman's go. The
standing rule holds: every visual PR stops at "preview ready".

`the-public-house` is not a duplicate. It is The Public House, Taipei (William Wu's British-pub
room on Xinyi Road, Instagram thepublichouse_taipei, free tier, no photo, full description,
No. 40 on Asia's 50 Best Bars 2025 and No. 92 in 2026, both correct). Its World's 50 Best 2025
No. 20 record was wrong, source `the50.com/bars/best-in-the-world/list/1-50`, almost certainly a
name match on "Public House" when that list was loaded. Removed through the admin API; the row
now holds its two Asia records only, the description never claimed the world placing, and the
award-claims guard reports 0 problems across 1,782 bars. Rank 20 on the 2025 world list is The
Cambridge Public House, Paris, alone. Nothing to merge or delete.

## Merged

Merged on Roman's go; production build green. Live checks: the hub's H1 and title read "The 50
Best Bars", four edition pills, 33 panels with 32 hidden in the served HTML; Front/Back's title
reads "No. 80 on The 50 Best Bars 2026"; The Public House shows its two Asia records only.

## Roman's decisions, 2026-09-23 evening, on `preview/121b-list-names` (PR #85, no merge)

**Names.** Pills read World, Asia, Europe, North America. The count line and the block header rows
use the list's official name for its year: "The 50 Best Bars 2026", "The 50 Best Bars: Best in
Asia 2026" (and Europe, North America); 2025 and earlier keep "World's 50 Best Bars 2025", "Asia's
50 Best Bars 2025" and so on. `displayOrg()` applies the same mapping to profile prose, award
strings and the SEO title: The Cambridge Public House reads "No. 20 on World's 50 Best Bars 2025,
No. 7 on The 50 Best Bars: Best in Europe 2026". Tiles keep the short possessives for space.

**Year threshold.** `HUB_YEAR_THRESHOLD = 0.9` in `src/lib/award-hub-model.ts`, with the comment:
a year shows when the directory holds 45 of its 50 ranked bars, 90 of 100 where a 51-100 list
exists, each published half on its own. Years below it are hidden from the hub, not deleted;
profiles keep every accolade. The year dropdown renders only once a second year qualifies for
the edition and comes back by itself when one does. Category programs are not filtered.

Today that gives: World 2026 and 2025 (2025 is whole, 100 of 100, so the world edition keeps its
dropdown with two years), Asia 2026, Europe 2026, North America 2026, each without a dropdown.
The distance of every other year is tabulated in 121-hub-audit.md. Checked locally: five panels
in the HTML instead of 33, a deep link to Asia 2024 falls back to Asia 2026, Spirited keeps its
eleven years. 7 tests.
