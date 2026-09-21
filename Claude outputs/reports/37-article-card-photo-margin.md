# Report: 37-article-card-photo-margin (2026-09-16, 20:00 to 20:50 PT)

Done and deployed: commit f146237. The diagnosis in the task was exactly right and the fix is the one it proposed.

## Confirmed live before the change (Negroni Week article, 1440)

The Connaught Bar card, the only one of the three with a photo: visual box 248 x 155, image margin-top 16px, image top 16px below the box top, border-radius 24px. The two placeholder cards are divs and were unaffected, which is why only the photo card looked wrong. Reference on /bars/city/london, the same component: margin-top 0, top gap 0, radius 0. The 16px came from `.article-body img` (margin 16px 0 8px) plus the later `.article-body img { border-radius: var(--radius) }`; `.bar-dir-featured-visual img` sets width, height and object-fit but no margin, so the margin survived, pushed the photo down inside the aspect-ratio box and `overflow: hidden` clipped the bottom.

## Fix

One rule added in src/app/globals.css directly after `.bar-dir-featured-visual img`, with the card rules and a comment explaining why it exists:

```css
.article-body .bar-dir-featured-visual img {
  margin: 0;
  border-radius: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

The generic `.article-body img` rules are untouched; no article-image rule was weakened or moved.

## After (local build, then live)

Connaught card, all three widths, image fills its frame with no gap and no clipping:

| Width | Visual box | Image height | Top gap | Image radius | Pills (left, bottom) |
|---|---|---|---|---|---|
| 1440 | 248 x 155 | 155 | 0 | 0 | 10, 10 |
| 768 | 328 x 205 | 205 | 0 | 0 | 10, 10 |
| 390 | 251 x 157 | 157 | 0 | 0 | 10, 10 |

Identical to the cards on /bars/city/london (331 x 207, top gap 0, radius 0, pills 10 and 10). The card's own corners still round the photo, since the visual box clips it.

## The articles' own photos, unchanged

Negroni Week and Torno Subito, before and after: 1440 left 80, width 805, radius 24px, margin-top 16px; 390 left 18, width 354, radius 24px. Document width 390 at the phone size, no overflow. Placeholder cards, card bodies, names, location lines, the carousel arrows and the track scroll are all unchanged.

Live after the deploy (f146237, Ready): Connaught card at 1440, image margin-top 0, top gap 0, radius 0, filling 248 x 155, pills 10px from the left and bottom.

## Screenshot

Negroni Week at 1440: the three cards in a row, the Connaught photo now filling its frame edge to edge with the TOP 10 and 50 Best pills sitting in the bottom left of the photo, the two placeholder cards beside it identical in size. The capture tool returns no file path.
