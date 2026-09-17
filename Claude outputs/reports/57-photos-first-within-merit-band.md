# Report: 57-photos-first-within-merit-band (2026-09-17)

Shipped and live. Commit `8d6e47b`.

## The California page, before and after

I screenshotted it before touching anything, since the first measurement of
this was wrong for exactly the reason you gave.

**Before:** True Laurel, Mírate, **Trick Dog (placeholder)**, then more
placeholders below. Four of the first nine were placeholders.

**After**, read off the live page by walking the rendered card elements and
checking each for an image, rather than by parsing a text window:

| # | Bar | Photo | Tier | Band |
|---|---|---|---|---|
| 1 | True Laurel | photo | top10 | 0 |
| 2 | Mírate | photo | top10 | 0 |
| 3 | Daisy Margarita Bar | photo | top10 | 0 |
| 4 | Vandell | photo | top10 | 0 |
| 5 | Thunderbolt | photo | top10 | 0 |
| 6 | Trick Dog | placeholder | top10 | 0 |
| 7 | Pacific Cocktail Haven | placeholder | top10 | 0 |
| 8 | Buena Vista Cafe | placeholder | top10 | 0 |
| 9 | Realm of the 52 Remedies | placeholder | top10 | 0 |
| 10 | Smuggler's Cove | placeholder | top10 | 0 |

**The first five are now all photos**, against two before, and the first
placeholder is at six rather than three.

## The check that matters: nothing crossed a band

Every one of those ten bars is `tier = top10` and `band = 0`. The reordering
happened entirely inside a single tier and a single band, which is the whole
design. Trick Dog fell three places, to sixth, behind other Top 10 bars that
have photos. It did not fall behind a single bar without an accolade.

That is your rule stated back: "the 50 best photo-less bars will drop behind
the 50 best bars with photos."

## Where the key moved

`meritBand()` groups coarsely: renderable accolade, then qualified only by a
selective editorial source, then everything else. Of 1,469 active bars that is
478, 76 and 915. The photo key now sits directly under the band and above the
exact accolade score, everywhere that is not proximity-driven:

| Grid | What changed |
|---|---|
| `sortSeoBars` | region, state, city and by-type pages. Photo moved above exact score |
| `/bars/city/<slug>` | photo came out of the tier bucket; now tier, band, photo, name |
| country pages | same, and the photo was previously inside the tier bucket |
| `BarDirectory` | band above photo above the 50 Best test |
| directory MODE A | **had photo above 50 Best outright**, the exact thing this task forbids |

MODE A was the worst of them: with a city or country filter active, a photo
beat a 50 Best placement, so an accolade holder without a photo fell behind a
free bar with a snapshot. That is now impossible.

## Bratislava and London did not move, correctly

Bratislava's Level 2 is Mirror Bar (accolade, band 0) then four bars in band 1.
They are in different bands, so photo-first cannot reorder them and the page is
unchanged. London's first nine are the curated ten, all with photos, so nothing
moved there either.

**The exemption is kept.** A city's curated Top 10 block keeps its published
article order; several are numbered in a live article and reordering them by
photo would put the site and the article in conflict. Near-me mode is
untouched.

## How big the incentive is

**450 of the 602 bars holding an accolade or a Top 10 place have no photo.
That is 75%.** Only 198 of 1,469 bars in the whole directory carry one.

By country:

| Bars | Country |
|---|---|
| 232 | United States |
| 24 | Canada |
| 15 | Mexico |
| 15 | Japan |
| 14 | United Kingdom |
| 13 | Italy |
| 11 | India |
| 11 | Australia |
| 9 | Spain |
| 9 | Thailand |
| 9 | China |
| 8 | Taiwan |
| 7 | Malaysia |
| 7 | France |

The United States is 232 of the 450, more than half. If the photo ask is going
to be pushed anywhere, that is where the return is, and it lines up with the
outreach list already built from today's waves.

## Part two

The sentence in the claim email shipped this afternoon under task 56 and is
unchanged here. It is prepared and committed but **not sent**; sends wait for
your confirmation.

## Guards kept

Ordering only. No spacing, no card change, no breakpoint. Which bars appear on
a page did not change, only their order. 382 tests passing, four of them new
for the band.
