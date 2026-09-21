# Report: 22-mentions-carousel (2026-09-15, 20:30 to 21:05 PT)

Done and deployed: commit 849a931. Only the "<Bar> in BarMagazine" block changed; the nearby block, the CTA and everything above are untouched.

## What the block is now

- Track: the same `<ol>` of task-19 article cards (image, two-line title, date; the anchor keeps its href and its title-only text), now one flex row with `scroll-snap-type: x mandatory`, each card `scroll-snap-align: start`, horizontal overflow, scrollbar hidden (both engines), native touch swipe, `overscroll-behavior-x: contain`. It is `tabIndex=0` when it scrolls, so it takes focus and the arrow keys scroll it; it renders and scrolls with no JavaScript. Every card is in the server HTML.
- Widths: cards are one third of the row at 1100px and up (three visible with the 16px gap), one half from 700 to 1099 (two visible), 85% below 700 (one card, the next peeks in from the right).
- Three or fewer cards: no `is-scrollable` class, so no overflow, no snap, no focus stop, no arrows; a static row of one-third cards on desktop and tablets (Lyaness: three at 306 across the 950 row; Allegory: one card, 306 wide, left), stacked full width on phones as in 19.
- Arrows: `MentionsArrows`, a small client component rendered only when there are more than three cards, hidden by CSS below 1100px. Two 36px round buttons (white, hairline border, dark ink; dark on hover) at the top right beside the heading. A click scrolls the track by one card width plus the gap with smooth behaviour. Previous is disabled at the start; next is disabled when the last card is fully in view (that, rather than "scrollLeft at its maximum", because a mandatory snap track can rest short of the maximum). No autoplay, no dots.
- Card boxes are `box-sizing: border-box`; without it the 1px borders pushed three thirds plus two gaps 6px past the row.

## Night Hawk (5 mentions), before (task 19 live) and after (local build), px

1440:
- block: 681 tall -> 395 (one row of 277px cards instead of a 3 + 2 grid); top 1965 both; the CTA below moves up from 2678 to 2392 accordingly
- heading row: h2 at 2000, the two arrows 36 x 36 at the same baseline on the right; previous disabled, next enabled on load
- cards: 306 wide, three fully visible in the 950px track; scrollWidth 1594, so two more off to the right
- arrow logic checked by scrolling the track and firing its scroll event: start [prev disabled, next enabled], middle [both enabled], end at scrollLeft 644 = max [prev enabled, next disabled]
- link check: first card href "/asias-50-best-bars-2025-names-bar-leone-no-1-again", anchor text the article title, as before

Phone layout (measured on the local build at a 527px track, the pane would not emulate 390 this time; the rule is percentage-based): first card 85% of the track (448 of 527), the second card starts at the right edge with 63px showing (the peek), arrows `display: none`, snap active. At a real 390 viewport the track is 328 wide, the card 279, the peek about 33px. Verified again live below.

## Other pages (local build)

- Lyaness (3): static row, three cards 306 wide, no arrows, overflow visible, not focusable; block 391 tall (was 390), nearby block starts at 2953 (was 2951, the 4px lift room rounds in). At 390 the three cards stack as in 19 (block 961 tall, unchanged).
- Allegory (1): one 306px card at the left of the 950 row, no arrows.
- Bar Leone (24): 24 cards in one row, arrows present, scrollWidth about 22,000px; the end state disables next.

Live after the deploy (403241f, about 60 s after the push): Night Hawk at 1440, block 393 tall, two arrows (previous disabled, next enabled), cards 306 wide, three fully visible, scrollWidth 1594 in a 950 track, track focusable; CTA at 2391 and nearby at 2542 follow at the normal gaps. Phone layout live: card 85% of the track, 63px of the next card showing at the right edge, arrows display none. Note: the browser pane would only emulate a 589px viewport for the phone checks in this session (it gave 390 earlier today); the rules are percentages, so the proportions hold at 390.

## Screenshots

Night Hawk at 1440: the heading with the two round arrows at the right, three article cards in one row, the CTA and the nearby grid below at their normal spacing. Night Hawk on the phone layout: one card filling most of the width with the second card's yellow BARSTARS image peeking in from the right edge. The capture tool returns no file path.
