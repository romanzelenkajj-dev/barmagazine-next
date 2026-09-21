# Task 65: the near-me control shipped, and "near" now means near

Committed and pushed to `main` as `83417ad`. Task 64's hero went with it as `8b00c84`,
because it was still uncommitted and this task assumed it had landed.

The task grew while I was working it. The original scope was restore, re-verify, ship. Then
the bands, the distance on the card and the banner rewording were added after you saw what
MODE D actually did. All of it is in.

## The part that matters: bands, not one radius

The old rule was a single 80 km boundary with tier, then photo, then distance inside it. So
everything within 50 miles was one pool, and quality decided the order across the whole pool.

**From Carlsbad, the old first result was Gilly's House of Cocktails at 49.9 km, ahead of
Raised by Wolves at 34.3 km.** That is exactly the complaint: a bar 31 miles away leading one
21 miles away.

Distance now sets a band and quality only orders bars inside it. A closer band always wins.

| Band | Why this boundary |
|---|---|
| under 5 km | walking, or a short hop |
| 5 to 15 km | a normal ride across a city |
| 15 to 40 km | a deliberate trip out |
| beyond 40 km | not near by any definition, so pure distance |

I kept your suggested boundaries. They are chosen by how you would actually get there rather
than by round numbers, and the data did not argue for different ones: the interesting
transitions in the Carlsbad set fall either side of 40 km, and moving the inner boundaries
would not have changed a single position there.

### First twenty from Carlsbad, before and after

Computed over every active bar with coordinates, same distance function, only the comparator
differs.

**BEFORE, one 80 km radius**

|  # | bar | distance | band | tier |
|---:|---|---:|---|---|
|  1 | Gilly's House of Cocktails | 49.9 km / 31.0 mi | beyond 40 km | top10 |
|  2 | Raised by Wolves | 34.3 km / 21.3 mi | 15 to 40 km | top10 |
|  3 | The Whaling Bar | 35.7 km / 22.2 mi | 15 to 40 km | top10 |
|  4 | Realm of the 52 Remedies | 40.9 km / 25.4 mi | beyond 40 km | top10 |
|  5 | Polite Provisions | 48.5 km / 30.2 mi | beyond 40 km | top10 |
|  6 | Happy Medium | 49.8 km / 30.9 mi | beyond 40 km | top10 |
|  7 | Good Enough Cocktail Club | 51.3 km / 31.9 mi | beyond 40 km | top10 |
|  8 | False Idol | 51.5 km / 32.0 mi | beyond 40 km | top10 |
|  9 | Noble Experiment | 52.4 km / 32.5 mi | beyond 40 km | top10 |
| 10 | Young Blood | 52.7 km / 32.8 mi | beyond 40 km | top10 |
| 11 | George's at the Cove | 35.1 km / 21.8 mi | 15 to 40 km | free |
| 12 | Shibuya Nights at Cloak & Petal | 51.0 km / 31.7 mi | beyond 40 km | free |
| 13 | The Smoking Gun | 52.8 km / 32.8 mi | beyond 40 km | free |
| 14 | Fonda del Barrio | 54.9 km / 34.1 mi | beyond 40 km | free |
| 15 | Convoy Music Bar | 41.3 km / 25.7 mi | beyond 40 km | free |
| 16 | Baby Gee | 102.5 km / 63.7 mi | beyond 40 km | free |
| 17 | Kato | 127.6 km / 79.3 mi | beyond 40 km | free |
| 18 | Death & Co Los Angeles | 128.3 km / 79.7 mi | beyond 40 km | top10 |
| 19 | The Wolves | 129.3 km / 80.3 mi | beyond 40 km | top10 |
| 20 | Seven Grand | 129.6 km / 80.5 mi | beyond 40 km | top10 |

**AFTER, distance bands**

|  # | bar | distance | band | tier |
|---:|---|---:|---|---|
|  1 | Raised by Wolves | 34.3 km / 21.3 mi | 15 to 40 km | top10 |
|  2 | The Whaling Bar | 35.7 km / 22.2 mi | 15 to 40 km | top10 |
|  3 | George's at the Cove | 35.1 km / 21.8 mi | 15 to 40 km | **free** |
|  4 | Realm of the 52 Remedies | 40.9 km / 25.4 mi | beyond 40 km | top10 |
|  5 | Convoy Music Bar | 41.3 km / 25.7 mi | beyond 40 km | free |
|  6 | Polite Provisions | 48.5 km / 30.2 mi | beyond 40 km | top10 |
|  7 | Happy Medium | 49.8 km / 30.9 mi | beyond 40 km | top10 |
|  8 | Gilly's House of Cocktails | 49.9 km / 31.0 mi | beyond 40 km | top10 |
|  9 | Shibuya Nights at Cloak & Petal | 51.0 km / 31.7 mi | beyond 40 km | free |
| 10 | Good Enough Cocktail Club | 51.3 km / 31.9 mi | beyond 40 km | top10 |
| 11 | False Idol | 51.5 km / 32.0 mi | beyond 40 km | top10 |
| 12 | Noble Experiment | 52.4 km / 32.5 mi | beyond 40 km | top10 |
| 13 | Young Blood | 52.7 km / 32.8 mi | beyond 40 km | top10 |
| 14 | The Smoking Gun | 52.8 km / 32.8 mi | beyond 40 km | free |
| 15 | Fonda del Barrio | 54.9 km / 34.1 mi | beyond 40 km | free |
| 16 | Baby Gee | 102.5 km / 63.7 mi | beyond 40 km | free |
| 17 | Kato | 127.6 km / 79.3 mi | beyond 40 km | free |
| 18 | Death & Co Los Angeles | 128.3 km / 79.7 mi | beyond 40 km | top10 |
| 19 | The Wolves | 129.3 km / 80.3 mi | beyond 40 km | top10 |
| 20 | Seven Grand | 129.6 km / 80.5 mi | beyond 40 km | top10 |

Three things to read out of that:

1. **The nearest bar now leads.** Gilly's drops from 1st to 8th and lands in true distance
   order among its neighbours.
2. **A free-tier bar now beats five top-10 bars**, because George's at the Cove is 35.1 km
   away and they are 48 km and beyond. That is the principle doing exactly what you asked
   for, and it is the part worth being sure about: near-me no longer sells position.
3. **From the 4th result down it is pure distance**, monotonic, because Carlsbad genuinely
   has only three bars within 40 km. The bands can only reorder what exists.

**One honest limit.** 17 of the first 20 sit beyond 40 km in both lists, because San Diego is
30-plus miles from Carlsbad and that is simply where the bars are. The bands fix the ordering,
not the geography. A visitor there still has to travel; they are no longer told the further
bar is the better answer.

## Distance on the card

In near-me mode only, each card carries its distance, miles or kilometres by
`navigator.language`. It renders as a pill over the photo, top right, opposite the status
pills at bottom left, so there is no collision.

**Card layout is provably untouched.** I measured one card with the pill, removed only the
pill from the DOM, and measured again:

| | With pill | Without pill |
|---|---|---|
| Card height | 290.95 | **290.95** |
| Card width | 333.33 | **333.33** |
| Visual height | 207.08 | **207.08** |
| Body height | 81.87 | **81.87** |
| Name top / height | 987.58 / 25.62 | **987.58 / 25.62** |

Identical to two decimal places, and the grid's own height is unchanged. Cards outside
near-me mode render no pill at all.

The pill is suppressed when there are no real coordinates, for the same reason the notice
is: without GPS the IP-geo score converts to a bucket that reads as "20000 km", and putting
that on a card as a distance would be worse than putting nothing.

## Banner and notice

The banner now reads, with no em dash:

> Closest first. Bars a similar distance away are ranked by quality, so nothing far off leads.

The notice for "nothing is actually near you" now keys on the last band rather than 80 km,
and it is locale aware. Verified from rural South Dakota:

> No bars within 25 mi of you. Showing the closest, starting about 428 mi away.

and the results behind it were 428, 428, 429 mi, pure distance with no tier jumping ahead.

## Verification

Done in the browser **before** the production build, and the build ran with the dev server
stopped, per the guards.

| Check | Result |
|---|---|
| Control off, on, off at 1440 | Row height 66 in all three states; toggle at x=877, y, w=155 unchanged |
| Filter row at 390 | 269px, each control on its own line, no wrap, no horizontal overflow |
| City filter clears the mode | URL, `active`, `aria-pressed`, distance pills, banner and notice all cleared together |
| Arriving at `/bars?near=me` | Control renders already on |
| Geolocation | Requested in the click handler only |
| Task 64's hero | 296 desktop, 357 at 390 and 768, promo still equal at 296. Unaffected |
| Build | `next build` exits 0, no type errors; only the pre-existing `<img>` warning in this file |

**One thing that cannot be literally true**, and I said the same in the task 63 report: at
390 the filter row is a vertical stack, so adding a control adds 50px and everything below
the row moves down by that. "Nothing else moves" holds at 1440, where the control dropped
into space that was already empty and not one pixel shifted.

## Saying it a second time so it does not get lost

**The page still requests geolocation on load.** `BarDirectoryMap` has a mount effect calling
`getCurrentPosition` to drive MODE A distance sorting, and it predates all of this. The
near-me control asks on click, as specified, but the page itself still asks on load. You told
me to leave it, and I have. If you want that guard true of the whole page it needs its own
task, because removing the effect changes distance sorting for every visitor, not just
near-me ones.

## Not committed, deliberately

Three files were dirty in the tree and are none of this task's business, so I staged only the
two files this task touches:

- `scripts/send-upsell.mjs` and `scripts/wave-insert.mjs`, the task 60 and 62 work. Verified
  and complete, but no task has asked me to ship them.
- `outreach/parked.txt`, which carries an addition I did not make: `tayer-elementary`, parked
  as temporarily closed since a May 2026 fire. It looks right and it is the safe direction,
  but it is someone else's line and not mine to commit.

Also worth knowing: I found and removed a **stale `.git/index.lock`** from 19:13 with no git
process behind it. It was silently failing every stash and commit before that.
