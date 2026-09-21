# Task 63: a near-me control in the directory filter row

> **This task was cancelled while I was building it, and the work is finished but NOT
> committed.** The task file moved itself to `Claude outputs/queue/_cancelled/` at 15:42,
> unchanged and with no reason given, after I had started. I had the build done and verified
> by then, so rather than throw it away I stopped at the working tree.
>
> **Nothing is committed and nothing is deployed.** `src/app/globals.css` and
> `src/components/BarDirectoryMap.tsx` carry uncommitted changes. The full diff is also
> saved as a patch at `scratchpad/63-near-me-control.patch`, so it survives either choice.
>
> Your call: keep it, or `git checkout -- src/app/globals.css src/components/BarDirectoryMap.tsx`
> and it is gone. The rest of this report is what was built and what was measured, so you
> can decide with the evidence in front of you.

Built and verified. `/bars` now has a way into and out of MODE D without touching the URL.

Two files changed: `src/components/BarDirectoryMap.tsx` and `src/app/globals.css`.
`NearMeBar.tsx` and `showsNearMeBar` are untouched, and the existing near-me banner is
untouched.

## What it does

A **Near me** pill sits in the filter row beside Grid and Map. Off, the page is in its
normal state. On, it sets `?near=me`, MODE D takes over, the pill goes dark and grows an ×
so turning it off is visibly one click. Arriving on `/bars?near=me` from outside renders
the pill already on, which is the case that had no control at all.

The control holds no state of its own. It renders from `nearMode`, so the existing effect
that drops the mode when a city, country or search filter is applied clears the control at
the same moment, by construction rather than by a second code path.

Geolocation is requested **on click**, inside the toggle handler, and only when we do not
already have coordinates.

## Layout, measured rather than eyeballed

Measured from the live commit first, then from the change, at both widths.

### 1440px: nothing moved at all

| | Before | After (off) | After (on) |
|---|---|---|---|
| Filter row height | 66 | **66** | **66** |
| Grid/Map toggle x | 877 | **877** | **877** |
| Grid/Map toggle y | 621 | **621** | **621** |
| Grid/Map toggle width | 155 | **155** | **155** |
| Selects x | 48 / 259 / 458 | **48 / 259 / 458** | **48 / 259 / 458** |
| Horizontal overflow | none | none | none |

The toggle was already right-aligned with 275px of empty space to its left, so the new
control dropped into space that was already there. **The row did not grow and nothing else
moved by a single pixel.** The button is 105px wide off, 123px on when the × appears, and
because it is right-anchored against the toggle it grows leftwards; the toggle stays put.

Off → on → off returns to byte-identical geometry.

### 390px: the row grows by exactly one control, and only that

| | Before | After |
|---|---|---|
| Filter row height | 219 | **269** (+50) |
| Selects | x51, y565 / y614 / y664 | **unchanged** |
| Near me | not present | x51, y721, w290, h34 |
| Grid/Map toggle | y721 | y771 (+50) |
| Row width | 338 | **338** |
| Horizontal overflow | none | **none** |

**This is the one number that did not stay identical, and I want to be straight about it.**
At ≤768px the filter row is `flex-direction: column`, so every control already occupies its
own line. Adding a control to a vertical stack adds its height; there is no arrangement
that adds a control and adds zero height. The +50px is the button (34) plus the 8px
`margin-top` and 8px row gap that the toggle above it already uses.

What I avoided is the alternative: putting the pill beside the toggle on mobile would have
cut the full-width Grid/Map control in half, which is a far larger change to existing UI
than one extra row. The control instead takes the same full-width treatment the toggle
already has at that breakpoint, so it reads as part of the existing stack.

The row does not wrap and does not overflow at either width, in either state.

## The empty-ish case, and a number I refused to print

The notice above the results, when the nearest bar is outside the 80 km radius:

> No bars within 80 km of you. Showing the closest, starting about 689 km away.

Verified with coordinates in rural South Dakota, where 689 km is a real haversine distance
to the nearest listed bar.

**The first version of this was quietly dishonest and I caught it in testing.** Without GPS,
`getDistKm` converts the IP-geo score with `(1000 - score) * 20`, so a visitor we cannot
place at all comes out at exactly "20000 km", and the notice printed that as though it were
a measurement. It is a scoring bucket wearing a kilometre label. Printing it would have been
the same sin the notice exists to fix, in smaller print.

So the line has two forms, and only one of them quotes a number:

- **With coordinates:** the sentence above, with the real distance.
- **Without coordinates:** "We could not pin down where you are. These are ordered by our
  best guess at what is closest to you."

Both verified live.

## Confirmed: a city filter clears the mode and the control together

Applied Bratislava through the real select, the way a visitor would:

| | Before | After |
|---|---|---|
| URL | `?near=me` | `` (cleared) |
| Pill active | true | **false** |
| `aria-pressed` | true | **false** |
| Notice | shown | **gone** |

## Implementation note

`getDistKm` was lifted out of the sort memo into a `useCallback` so the notice measures
distance with the same function MODE D orders by. Two copies would drift, and the notice
would eventually contradict the list underneath it. The sort itself is unchanged.

That refactor made `geoContinent`, `userLat` and `userLng` redundant in the `allFiltered`
dependency list, which lint flagged. They are removed: `getDistKm` is now a dependency and
carries all three, so any change to them still gives the memo a new identity and recomputes.
`next build` is clean, exit 0, no type errors, and the only remaining warning in the file is
the pre-existing `<img>` one.

## Three things worth your attention

**1. The guard about page-load geolocation was already broken before this task.**
`BarDirectoryMap.tsx` has had a `useEffect` on mount calling
`navigator.geolocation.getCurrentPosition` since well before today, to drive MODE A distance
sorting. My control requests on click as instructed, but the page still asks on load because
of that older effect. Removing it would change distance sorting for every visitor, which is
not what this task asked for, so I left it. If you want the guard to be true of the page and
not just of the new control, that is its own task.

**2. The existing near-me banner contains an em dash.** It reads "Sorted by distance — bars
within ~50 miles first." That breaks the site-wide no-em-dash rule, but this task explicitly
said the banner stays as it is, so I did not touch it. It is a one-character fix whenever you
want it.

**3. I broke the dev server mid-task and had to restart it.** Running `npx next build` while
the dev server was serving from the same `.next/` directory replaced the dev chunks and the
page started throwing `Cannot find module './8948.js'`. The source was never affected and the
production build itself passed. I cleared `.next` and restarted. Worth remembering: verify in
the browser first, then build, or build to a separate dist dir.
