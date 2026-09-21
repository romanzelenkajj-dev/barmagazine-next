# Task 68: the post-claim Featured panel

Built and verified. Two files, `src/app/owner-dashboard/page.tsx` and
`src/app/globals.css`.

**Not committed, not pushed, as instructed.** It is in the working tree waiting on your look.

Task 67 had already run, so the golds match: both pages now use `#C9A96A` on dark.

## What changed

| | Before | After |
|---|---|---|
| Panel ground | `#F6EFEF` pale pink | `#1A1A1A` |
| Eyebrow | maroon, 11.5px | **gold `#C9A96A`, 12px** |
| Heading | 19px / 600 | **26px / 700** (21px at 390) |
| Body | 14.5px | **16px** (15px at 390) |
| The pitch | three bullets | **two real Featured pages, with photos** |
| Button | small, maroon | **gold, dark ink, 54px tall** |
| Price in panel | none | **none** |

## One correction to the brief

The brief treats the colour as a readability problem. It is not. **The maroon on the pink
panel measured 9.04:1, which passes comfortably.** What was wrong was prominence and
hierarchy: a pale tint, a small eyebrow, small bullets and a small button, at the highest
intent moment on the site.

So this change is not a contrast fix, and I do not want to claim it as one. It is a weight
fix. The contrast figures you asked for, for the new panel:

| Element | Pair | Ratio |
|---|---|---|
| Gold eyebrow | `#C9A96A` on `#1A1A1A` | **7.76:1** |
| Heading | `#FFFFFF` on `#1A1A1A` | **17.40:1** |
| Body copy | 78% white over `#1A1A1A` (`#CDCDCD`) | **10.95:1** |
| Example city line | 60% white (`#A3A3A3`) | **6.90:1** |
| Fine print | 55% white (`#989898`) | **6.03:1** |
| CTA label | `#1A1A1A` on `#C9A96A` | **7.76:1** |

Everything clears AA for body text, and the new panel is not less readable than the old one
anywhere.

**Why dark rather than another tint.** On a page of white cards, a tint is what made it read
as a footnote in the first place. Dark is the one treatment that cannot be mistaken for one,
and it is the same ground as the `/feature-your-bar` hero, so a bar that clicks through
arrives somewhere that looks like where it came from.

## Show, do not list

The three bullets are gone. In their place, one line of context and the two bars that
actually pay:

> This is what a Featured page looks like.
>
> **The Loft**, Santiago  ·  **Dangerous Water**, Palma de Mallorca

Each is a card with the bar's photo, its name and city, linking to its live profile.

A real screenshot of a Featured page is not practical to generate and I was not going to
invent one, so these are each bar's **own first profile photo**, read from the directory
today, which is the fallback the task allows. Both are genuinely `tier: featured`. The URLs
are in a `FEATURED_EXAMPLES` constant at the top of the file with a comment saying where they
came from, so if either bar changes its lead photo it is one line to update.

## No price anywhere

Asserted by test, not by reading: the panel's rendered text is exactly

> WHILE YOU'RE HERE | Make this page your bar's website | This is what a Featured page looks
> like. | The Loft | Santiago | Dangerous Water | Palma de Mallorca | See Featured plans |
> Your free profile stays free either way.

and a regex for any currency symbol, digit-plus-slash-mo, "19.50", "39", "month" or "annual"
returns **false**. The button says what it does and the pricing page carries the numbers, so
next week's change is one page.

## The fold guard, measured rather than assumed

The guard says the panel must not push the bar list below the fold on a phone. I measured the
committed version and mine at 390x844 by swapping in `HEAD`'s files:

| | Panel top | Panel height | Panel bottom |
|---|---:|---:|---:|
| Before (committed) | 621 | **438** | 1060 |
| After | 621 | **447** | 1069 |

**The new panel is 9px taller than the old one.** The dark panel with two thumbnails occupies
almost exactly the space three bullets did, so it is far more prominent at essentially no
cost in height.

The honest part: **the bar list was already below the fold before this change and still is.**
The success card alone runs 309 to 605 in an 844px viewport, and the old panel already ended
at 1060. The guard as written could not be satisfied by this panel at any size, because what
pushes the list down is the success card plus the panel existing at all. I have added 9px to
that. If you want the list above the fold on a phone, the lever is the 296px success card,
not this panel, and that is a different task.

No horizontal overflow at either width. The two example cards stay side by side at 390 (158px
each) rather than stacking, deliberately, because stacking them would have added roughly
another 180px.

## Button size

`.claim-offer-cta` shares the same `.feature-btn` base as "Go to your dashboard", same 15px
font and same 14px/28px padding. Measured heights are **54px against 49px**: the CTA is 5px
taller because it is an anchor inheriting the body line height while the dashboard control is
a `button` with the UA's own. Same size class, primary slightly larger, which reads correctly.
Say if you want them identical to the pixel.

## Build

`next build` exits 0.

Worth recording: **the first build attempt failed** with
`getAllActiveBars failed: AbortError: This operation was aborted` while generating
`/bars/city/[city]`. That is not my code, I did not touch `supabase.ts`, and the retry passed
clean. It is a transient aborted Supabase fetch at build time, and it is the same fragility
class as the 502 in task 67: several places in this codebase pull the entire bars table, and
when Supabase is slow they abort rather than degrade. Worth its own look if it recurs.

## Noted, not acted on

Your pricing context is recorded here so it is not lost: Yelp's Upgrade Package is $180/month
billed monthly with no annual prepay, OpenTable runs $149 to $499/month billed monthly inside
a twelve month term, and at $19.50 we are an order of magnitude under the market. That matches
what task 67 turned up from the other side: **`featured_until` is never read anywhere in the
codebase**, so monthly billing needs expiry to actually be enforced before it is safe. The
payment shape and the enforcement gap are the same decision.
