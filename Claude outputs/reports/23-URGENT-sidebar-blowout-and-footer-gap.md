# Report: 23-URGENT-sidebar-blowout-and-footer-gap (2026-09-15, 21:05 to 21:35 PT)

Done and deployed: commit 720117d. CSS only, four rules.

## 1. Sidebar blowout (task 22 regression)

Confirmed live before the fix, Handshake Speakeasy at 1440: document width 1882, the main column 1685px wide (grid columns "1685px 157px"), the sidebar at x=1725, off screen, the action buttons at x=1368 to 1668, past the right edge. The cause is the one the task names: the mentions track is a non-wrapping flex row (14 cards on Handshake), the .bar-v2 grid item had min-width auto, so the 3fr column grew to the row's min-content width.

Fix (src/app/globals.css):
- `.bar-v2 { min-width: 0 }` and `.bar-v2-mentions { min-width: 0 }`
- `.bar-v2-mentions-track` is now `overflow-x: auto` and `max-width: 100%` unconditionally, with the hidden scrollbar and the 4px/12px lift room moved out of the `.is-scrollable` rule; `.is-scrollable` keeps only the snap and overscroll settings. The row can no longer widen its column even if the class were missing.

Verified on the local build (numbers are document width vs viewport, then the two column widths):
- Handshake Speakeasy (14 mentions): 1440 -> 1440, columns 1032 / 344, sidebar at x=1072, action buttons at 715 to 1015, track 950 wide with scrollWidth 4492, arrows present (previous disabled, next enabled). 1000 -> 1000, single column, the track 870 wide inside the 952 column, arrows hidden, nearby grid two columns of 468. 390 -> 390, track 328 wide, first card 279 (85%), nearby cards 370 wide.
- Night Hawk (5): 1440, columns 1032 / 344, two arrows.
- Lyaness (3): 1440, columns 1032 / 344, static row of three 306px cards, no arrows, no overflow.
- Mírate (0 mentions): 1440, columns 1032 / 344, sidebar 16px right of the main column.

## 2. Gap above the footer

Measured live before the fix on Mírate at 1440: the last nearby card's bottom edge at 3283, the footer's top edge at 3332, a 49px gap. What made it: the nearby block, which has been the last block of the column since task 14, still carried `padding-bottom: 2rem` and a 1px hairline `border-bottom` from when it sat mid-page (32 + 1), and then the column-to-footer gap itself (the outer wrapper's 16px margin-bottom collapsing with the footer's 16px margin-top, which is already exactly var(--gap)). The hairline is the block's own rule, not a site-wide footer separator, so it goes rather than being folded in.

Fix: `.bar-v2-nearby { padding: 0 }` and no border-bottom (its margin-top 2rem from 11d stays). Result on the local build: last card bottom 3283, outer bottom 3283, footer top 3299: 16px, the same as the 16px between the main column and the sidebar. On phones the mobile Top 10 box follows the nearby list with its own 16px margin-top, so that gap is 16 too (was 49).

Directory page check: /bars footer top 2624, previous section bottom 2608, 16px before and after (the city-guides section's 8px margin collapses into the footer's 16). Consistent site-wide.

## Standing layout rule

Only the two things above changed. On Lyaness the mentions card (2529 to 2919), the nearby block's top (2951) and every block above are at the same coordinates as after task 22; the nearby block's bottom moved up by 33px (the removed padding and hairline) and the footer with it.

Live after the deploy (0a0cadf Ready): Handshake Speakeasy at 1440, document width 1440, columns 1032 / 344, sidebar at x=1072, .bar-v2 min-width 0, two arrows. Mírate: last card to footer 16px, nearby padding-bottom 0, no border.

## Screenshots

Handshake Speakeasy at 1440: the mentions row (three cards, arrows top right) and the nearby grid inside the 1032px column with the sidebar column in place on the right. Mírate bottom at 1440: the last row of nearby cards, then the footer 16px below. The capture tool returns no file path.
