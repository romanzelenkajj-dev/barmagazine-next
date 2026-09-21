# Three approved fixes never merged, and they block task 87

Roman asked what else was missed after the near-me sentence. This is the audit. **Do this
before task 87**, because both touch `BarDirectoryMap.tsx` and 87 will be built on whatever
this leaves behind.

## 1. `preview/74-distance-units`: four commits, approved, never merged

Roman approved these on 2026-09-18 in his own words, "distance good". Task 77 from the same
message was merged. This branch was not. It is **10 commits behind main**.

```
09603de fix: near-me distances follow the visitor's country, not their browser language
a8e14a6 fix: show a distance on the card only when it means something
9575a32 fix: the banner fires when no card shows a distance, not on its own threshold
8bc5feb fix: pin the directory bar count to en-US like every other count
```

**This is live on production right now**, `BarDirectoryMap.tsx:68` on main:

```js
const loc = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
const region = (loc.split('-')[1] || '').toUpperCase();
const imperial = region === 'US' || region === 'GB' || ...
```

So a visitor in Bratislava with an en-US browser is shown **miles**. That is the exact
defect 09603de fixes with `usesImperial(countryCode)`. Roman was testing from Slovakia over
a VPN yesterday and found the near-me bug; he would have been shown miles too.

Rebase onto main and merge. The file has changed underneath this branch (task 83 rewrote the
city page, and `formatDistance` has moved from line 132 to line 68), so **rebase and
re-verify, do not blind-merge**. Re-check each of the four behaviours after the rebase:
country-based units, the card distance threshold, the banner condition, and the count
locale. Report anything the rebase changed in meaning.

## 2. `preview/69-structured-hours`: one commit, and the migration never ran

```
d5d9494 feat: structured opening hours on the owner form
```

`bars.opening_hours` on production is still a plain string: `"Mon-Thu 5pm-12am, Fri-Sat
5pm-1am"`. `scripts/structured-hours-migration.sql` exists and has not been run.

This came from Roman asking how he fixes an owner's hours, and wanting to edit them in the
dashboard rather than by hand. The admin half of task 69 shipped in `801b711`; the storage
half did not, so the form on the preview works and cannot save.

Do not run the migration. **DDL goes to Roman for the SQL Editor**, as always. What this
task needs from you: rebase the branch, confirm it still builds against current main, and
give Roman the exact SQL to paste plus what to expect after it runs. Then ask.

## 3. Dead code Code flagged in the 79 report and nobody removed

`src/app/bars/BarsDirectory.tsx` and `src/components/BarDirectory.tsx`. Nothing imports
either; only `BarDirectoryMap` is live. They each carry their own city dropdown and search,
so they are two copies of the logic task 87 is about to change, sitting there to drift.

Delete both. Confirm zero imports first and that the build and tests still pass.

## 4. Em dashes in live visitor-facing copy

Roman's rule: en dashes are fine, em dashes are not used. Three real ones, all serving now:

| File | What it is |
|---|---|
| `src/components/BarDirectoryMap.tsx:1213` | "From a free listing to a full feature article — get your bar in front of the world's bar professionals." On `/bars`, the best-engaged page on the site. |
| `src/app/category/[slug]/page.tsx:17` | The meta description for every category page. |
| `src/app/category/[slug]/page.tsx:63` | The JSON-LD `ItemList` name, `"${category.name} — BarMagazine"`. |

Replace with a colon, a comma or a period as the sentence wants; do not swap in an en dash
where the punctuation should simply change. Leave code comments alone, and leave the
`&#8212;` decode on line 39 alone: that one converts WordPress entities in imported article
bodies and is not our copy.

Then sweep the rest of `src/app` and `src/components` for U+2014 in rendered strings, JSON-LD
and metadata, and report anything you find beyond these three rather than fixing silently.

## 5. AMORD3 has no subtypes

One bar, `subtypes: null`. Left over from the wave that added it. Classify it from its own
site in the next subtype pass rather than as its own job.

## Sequencing

1 and 3 land before task 87 starts, because 87 rewrites how near-me gets its bars and will
otherwise be rebased onto a stale file or resurrect the dead copies. 2 ends in a question for
Roman. 4 is independent and can ride along.

## Constraints

Standing layout rule: nothing here changes layout except the copy in 4, so 390px and 1440px
before-and-after on `/bars` and one category page is enough. Preview branch for anything a
visitor sees. Nothing to `main` without Roman's word, except that 1 and 2 are merges of work
he has already approved, so those need no new approval, only a clean rebase and verification.

## Report

Per item: what you merged, what the rebase changed, what you deleted, the em dashes you found
beyond the three listed, and the SQL for Roman with a plain sentence about what it does.
