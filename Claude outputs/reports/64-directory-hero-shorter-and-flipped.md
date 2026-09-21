# Task 64: the directory hero, shorter, flipped and scrimmed

All three parts are built and verified. One file changed, `src/app/globals.css`, 82 lines
added and 22 removed. No component file was touched, so the filter row, chips, card grid,
sidebar and city-guide block are untouched by construction.

**One requirement is not met and cannot be met under the guard as written. That is part 1
at 1440, and the arithmetic is below.** Everything else is done.

The task file was revised while I was building it, from "bring the hero down at both widths"
to "desktop only, do not change the height on mobile". I caught the change, reverted the
mobile height work I had already done, and the phone hero is now pixel-identical to the live
commit. Details in the mobile section.

## 1. Height

### Desktop: hero and promo down by 85px

| 1440 x 900 | Before | After |
|---|---|---|
| Hero height | 381 | **296** |
| Promo height | 381 | **296** |
| Equal to each other | yes | **yes** |
| First card row top | 815 | **730** |
| Card row visible | **85px of 317** | **170px of 317** |
| Full row visible | no | no |

Twice as much of the first card row, and the two boxes still match exactly. Same result at
1024: both boxes 296, still equal.

### The part that does not work, and why

The goal was a **full** card row visible at 1440 without scrolling. At a 900px viewport that
needs the first card's bottom edge at or above 900, so the card must start at 583. It now
starts at 730.

The gap cannot be closed by tightening the hero. Here is the stack above the cards at
1440 x 900, all of it measured:

| Block | Height |
|---|---|
| Nav | 88 |
| gap | 32 |
| **Hero** | **296** |
| gap | 32 |
| Filters (search box, filter row, chips) | 201 |
| gap + results count | 61 |
| First card starts | **730** |

To reach 583 the hero would have to be **149px**. Its content alone, with the padding set to
zero, measures about 224px: headline, the line under it, and three stat tiles. The task says
not to remove anything from the box, and I agree that is the right call, so 149 is not
reachable. **Part 1 as specified is arithmetically impossible at a 900px-tall viewport while
only the hero and promo may change.**

What is true instead, precisely:

- A full card row is now visible at 1440 whenever the viewport is **1047px tall or more**.
  Before this change it needed **1132px**. The change bought 85px of that.
- At 900px tall, 170px of the 317px card is visible, up from 85px.

**If you want the full row at 900, the lever is the 201px filters block**, not the hero. It
is the search box, three dropdowns and the Grid/Map switch, and it is now the tallest thing
between the nav and the cards. Your revised task file makes the same observation about the
phone view. That is a separate task and the guard here forbids it, so I left it alone.

### Mobile: unchanged, as the revised task asked

The task file changed mid-build to "Do not change the height on mobile." I had already
tightened it, so I reverted that and then verified property by property against the live
commit at 390 x 844:

| | Live commit | After |
|---|---|---|
| Hero height | 357 | **357** |
| Headline block | 63, margin-bottom 12 | **63, 12** |
| Subtitle | 45, 14px/1.6 | **45, 14px/1.6** |
| Stat row | 55, margin-top 18 | **55, 18** |
| First card top | 930 | **930** |

Identical at 768 as well: hero 357, matching the live commit exactly.

Keeping it identical took two fixes that are worth recording, because both are cascade traps
in this stylesheet:

1. **The phone hero is `min-height` driven, not content driven.** 285px floor plus 72px of
   padding is exactly the 357px it has. Lowering the desktop floor to 228 silently took 57px
   off the phone even though no phone rule changed. The old floor is now pinned inside the
   existing 768 block.
2. **`.directory-hero-stats` is defined at line 8317, *after* the responsive blocks at 4352.**
   A restore placed in the 768 block loses the cascade to it. The restore had to go after the
   base rule to win.

No new breakpoints: the set of distinct `max-width` values is byte-identical to the live
commit. The one block I added reuses the existing 768 value.

## 2. The flip

```css
.directory-hero-bg img { transform: scaleX(-1); }
```

In CSS, on the image, as asked. `/images/directory-hero.jpg` is untouched and reverting is
that one line. Verified applied at every width: computed transform reads
`matrix(-1, 0, 0, 1, 0, 0)`.

The lit bottle shelves and arches now sit right, the calmer dark area falls left under the
headline.

## 3. The scrim

Two layers on the existing `::before`, so no element was added:

```css
background:
  linear-gradient(to right,  rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 28%,
                             rgba(0,0,0,0.22) 58%, rgba(0,0,0,0) 82%),
  linear-gradient(to top,    rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 40%,
                             rgba(0,0,0,0.35) 100%);
```

The horizontal layer is the scrim proper: strongest at the text edge, gone by the middle of
the frame, so the mirrored bottle shelves on the right stay visible rather than being washed
out. I eased the original vertical layer from 0.95/0.75/0.55 to 0.82/0.55/0.35 so the two do
not compound to black at the bottom left. The combined opacity at the bottom-left corner
still works out to about 0.95, matching what the hero had before, so the text edge is no
lighter than it was.

Checked at 1024 and 768, which is where the crop is most awkward and the bottles ride closest
to the headline. The headline holds at both. That was the point of the scrim: legibility no
longer depends on how the photo happens to crop.

## Guards

| Guard | Result |
|---|---|
| Hero and promo only | Every changed rule is a `.directory-hero*` or `.bars-sidebar-promo*` selector |
| Filter row, chips, card grid, sidebar, city-guide unchanged | No component file touched; no such selector in the diff |
| No new breakpoints | Distinct `max-width` set identical to the live commit |
| Two boxes equal height at every width | Verified equal at 1440 and 1024; promo is `display:none` at 768 and below, as it already was |
| Hero text must not overlap the nav | Hero starts at y=120, nav ends at y=88, at every width tested |
| Nothing removed from either box | Headline, subtitle, all three stat counters and the full promo content all present |

`npx next build` exits 0 with no type errors and no CSS syntax errors. Braces balanced.

## Note

The diff is also saved as `scratchpad/64-hero-shorter-and-flipped.patch`.

Task 63's cancelled near-me work is **not** mixed into this. I stashed it before starting,
because it adds 50px to the filter row at 390 and would have contaminated exactly the
card-visibility measurements this task asks for. It is in `git stash@{0}` and in
`scratchpad/63-near-me-control.patch`, and this tree is otherwise clean at the live commit
plus task 64.
