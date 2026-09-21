# Report: 18-directory-hero-padding (2026-09-15, 16:40 to 16:58 PT)

Done and deployed: commit fa6cc2a (changelog in the following commit). Two padding values in one selector changed, nothing else. Build clean, tests 314/314.

## What was off

The hero is a rounded card in the page column on desktop and a full-bleed band on phones and tablets. Its side padding was 48px on desktop and 20px at 768 and below, and neither number had anything to do with the column beneath it, where the search pill sits at the column edge with 24px of its own padding (desktop), or at 26px from the viewport (phones: 10px page gutter plus the filter block's 16px).

## The change (src/app/globals.css, .directory-hero only)

- desktop: `padding: 48px` becomes `padding: 48px 24px`. The headline, subtitle and stat tiles start at x=48 from the viewport at 1000 and 1440, which is where the search pill's content (its icon, then the input) starts; they were at 72.
- 768 and below: `padding: 36px 20px` becomes `padding: 36px 26px`. The hero content starts on the search pill's outer edge, 26; it was 20.

Vertical padding is untouched, so the hero's height is the same (357 at 390 and 768, 381 at 1000 and 1440); the image, overlay, badge, type sizes and the tiles' flex layout are untouched. The h1 wraps exactly as before (63px tall at 390, 47 at 1440), so the shorter line box did not change the layout.

## Left edges, px from the viewport (before = live under 7b3668c, after = local build of fa6cc2a, then live)

| Width | headline before | headline after | search box edge | search box content | hero card edge |
|---|---|---|---|---|---|
| 390 | 20 | 26 | 26 | 50 (icon), 80 (input) | 0 (full bleed) |
| 768 | 20 | 26 | 26 | 50 (icon), 80 (input) | 0 (full bleed) |
| 1000 | 72 | 48 | 24 | 48 (icon), 78 (input) | 24 |
| 1440 | 72 | 48 | 24 | 48 (icon), 78 (input) | 24 |

Subtitle and stat tiles sit on the same x as the headline at every width (they are children of the same inner block). The filter row shares the search pill's edge (26 / 24).

Reading the two regimes: on phones the hero has no card edge of its own, so its text lines up with the search pill's edge; on desktop the hero card and the search pill already share the column edge (24), so the hero's text lines up with the pill's content edge (48). Putting the desktop headline on the pill's outer edge would mean text flush against the hero card's own rounded edge, which is why 48 and not 24.

Live after the deploy (a0a89cf Ready): 390 headline 26, tiles 26, search box 26, hero 357 tall; 1440 headline 48, tiles 48, search box 24 with its icon at 48, hero 381 tall.

## No-other-change check

Diff is two values in two rules on the same selector. Before/after boxes at 390 and 1440: hero height, h1 height, the search pill, the filter row and the promo box are identical; only the x of the hero's inner content moved.
