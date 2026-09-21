# Report: 32-article-image-consistency (2026-09-16, 15:25 to 15:42 PT)

Part 1 done and deployed: commit 68c9d49 (changelog b3c81d3), production Ready. Part 2, the WordPress content edit, is NOT done: no WordPress application password exists on this Mac (see below). Part 3 verified.

## 1. Diagnosis

Measured live before the change (text column 34 to 356 at 390, 80 to 885 at 1440):

- Publisher figure (bare `<figure><img>`, the Margarita Mile / El Tequileño article): `.article-body figure` gave a 16px bleed on both sides (margin 24px -16px 12px) and the house radius from `.article-body img { border-radius: var(--radius) }` (24px). At 1440: 64 to 901. At 390: 18 to 372 for the bottle photo (Roman's reference), BUT the two images in that article that carry WordPress's `alignnone` class also got the phone rule `.article-body img.alignnone { margin: -24px; width: calc(100% + 48px) }`, so they ran from -6 to 396, past the viewport.
- WordPress figure.wp-caption (image 2 on Torno Subito, Ruben Cabrera): `.article-body .wp-caption { margin: 16px 0 8px; border-radius: 12px }`, so no bleed on desktop (80 to 885, narrower than the standard) and the phone rule's 24px bleed (10 to 380, the card's edges, "edge to edge"), radius 12 instead of 24.
- Publisher nested structure (images 1 and 3 on Torno Subito, `figure > p > figure.wp-caption`): the outer bare figure's 16px bleed plus the inner wp-caption's 24px phone bleed stacked to 40px, so the box ran from -6 to 396 at 390 and its rounded corners sat outside the viewport, which is why they "lost" their radius on phones. On desktop the outer figure's 16px bleed gave 64 to 901 but the inner figure's 12px radius showed.

## 1. Fix (src/app/globals.css only)

One treatment for every structure: any `.article-body figure` has margin 24px -16px 12px, border-radius var(--radius), overflow hidden; `figure:empty` displays nothing; a figure inside a figure is flush (margin 0, no radius) and the `p` wrapper inside a figure loses its paragraph margins; the image inside a figure has no margin and no radius of its own (the box clips it); `.wp-caption` gets the same margin and the house radius (its !important width is kept to defeat WordPress's inline `style="width: 1200px"`), and a wp-caption inside a figure is flush; a bare image in a paragraph gets the same box (width calc(100% + 32px), margin 24px -16px 12px, house radius). On phones the old 24px bleed now applies only to galleries and the ad banner; images inside figures keep their box, and standalone paragraph images bleed 16px like a figure. Captions are untouched (12px, tertiary grey, centered, 6px above).

## 3. Verification (local build, then live)

Torno Subito article (3 images: nested, plain wp-caption, nested):
- 390: every image and its box 18 to 372 (354 wide), box radius 24px, caption 12px directly below inside the box; the empty figure `display: none`; document width 390 (no horizontal overflow). Before: -6 to 396 / 10 to 380 / -6 to 396.
- 1440: every image 64 to 901 (837 wide), radius 24px. Before: 64 to 901 / 80 to 885 / 64 to 901 with 12px radius.

Margarita Mile (El Tequileño) article (3 bare figures, two with alignnone):
- 390: all three 18 to 372, radius 24. Before: -6 to 396 / 18 to 372 / -6 to 396.
- 1440: all three 64 to 901, radius 24, unchanged.

Standing layout rule: paragraphs, headings, the share bar, the bars carousel and the author box did not move; only the image boxes changed size and radius.

## 2. The WordPress edit (not done)

The task asks to clean the post through the WP API: remove the empty `<figure></figure>` and replace the en dashes in two captions with commas. That needs the WordPress application password for romanzelenka on romanzelenka-wjgek.wpcomstaging.com. It is not in .env.local or .env.vercel, and the publisher app stores it server-side on Railway (memory note from 2026-08-17), so this Mac has no way to authenticate a write. Nothing was changed in WordPress. Two mitigations are live instead: the empty figure renders nothing (CSS `figure:empty`), and the layout no longer depends on the wrapper. The two captions still read "Tato Giovannoni – Photo Courtesy of Florería Atlántico" and "Torno Subito, Miami – Photo: Ruben Cabrera"; the exact edit, once a credential is available (or done by hand in the WP editor): delete the empty figure between images 2 and 3, and set the captions to "Tato Giovannoni, photo courtesy of Florería Atlántico" and "Torno Subito, Miami, photo: Ruben Cabrera". Roman can also paste an application password into .env.local as WP_APP_PASSWORD (with WP_USER) and the edit is a two-minute follow-up.

Live after the deploy, Torno Subito at 390: all three images 18 to 372 with a 24px box radius, the empty figure display none, document width 390.

## Screenshots

Torno Subito at 390 after the fix: image 2 (the bar interior) inset 8px inside the card with rounded corners and its caption centered below; image 1's box in the same position with its caption. Also captured live after the deploy: image 1 (Tato Giovannoni on the steps) inset with rounded corners and its caption below. The capture tool returns no file path.
