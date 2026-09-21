# Report: 17-top10-card-photo-and-order-this (2026-09-15, 16:12 to 16:40 PT)

Done and deployed: commit b4119ab (changelog 7b3668c), production Ready and verified live. Tests 314/314 (five new), build clean.

## 1. Photo

Below 720px (the card's single-column layout) the visual is `aspect-ratio: 16 / 10` with the old `min-height: 190px` removed; the image keeps `object-fit: cover`, the card's corner radius (the card clips it) and the same `loading` attribute (eager for the first two, lazy after). Live at 390: 368 x 230, ratio 1.60, was 368 x 190 (1.94). The strip Roman saw is the tablet range, where a 190px band ran the full card width (about 3.8:1 at 720).

Above 720px the photo is the 280px left column and fills the card's height (280 x 376 at 1440, unchanged). Forcing 16:10 there would give a 280 x 175 photo with a blank strip beneath it inside the card, so that column is untouched. If Roman wants the two-column card reshaped too, that is a layout decision, not a ratio rule; say the word.

Directory cards and the profile hero are untouched (different classes, no shared rule).

## 2. Order this

The tinted panel (`.best-bars-serve`, background #faf7f2, gold left border) is gone. New block `.best-bars-order`:

- hairline above: `border-top: 1px solid rgba(0,0,0,0.06)`, the hairline the info card, the nearby list and the meta rows use; 10px padding under it
- label "ORDER THIS": `0.72rem / 700 / 0.12em / uppercase / #C9A96A`, the exact `.bar-v2-visit-label` values (live computed: 11.52px, 1.38px tracking, rgb(201,169,106))
- drink name: 0.92rem, 700, #1a1a1a
- ingredients: 0.86rem, line-height 1.5, `var(--text-secondary)` (#6B6B6B)
- no background, no border, no radius; the 10px below to the address line is the same as the old panel's, so nothing under it moved

Data: `menu_highlights[0]` already stores name and ingredients separately; the em dash was typed into the JSX. New `src/lib/menu-highlight.ts` `splitHighlight()` renders the two fields, and when a row has no ingredients but a name of the form "Irish Coffee — Jameson ...", splits on the first spaced dash (em, en or hyphen with spaces; "Mai-Tai" is not split). Any dash left inside either part becomes a comma. Five unit tests, including one that asserts no em or en dash in the output. Live check on Swift: the block's text contains no dash.

The same card is rendered by the type sub-pages (/best-bars/london/cocktail-bars and so on, `[city]/[type]/page.tsx`, which used parentheses instead of the dash); both pages now use the same block, so the card is one design everywhere it appears.

## Before and after, Swift on Best Bars in London (live, px)

| | 390 before | 390 after | 1440 before | 1440 after |
|---|---|---|---|---|
| photo | 368 x 190 | 368 x 230 | 280 x 356 | 280 x 376 |
| description to Order this | 10 | 10 | 10 | 10 |
| Order this block height | 78 (panel) | 98 | 57 (panel) | 77 |
| Order this to address | 10 | 10 | 10 | 10 |
| card height | 563 | 623 | 358 | 378 |

The card grows by the photo (+40 at 390) and the block (+20: three lines with the label instead of one wrapped paragraph); at 1440 the photo column follows the card height (+20). Badges, name, description, meta rows and "Full profile" are unchanged in size and spacing.

## No "Order this" case

Best Bars in Philadelphia (no highlights on any of the ten): zero `.best-bars-order` elements, no hairline, the address follows the description at the same 10px as before. Photo 368 x 230 at 390.

## Screenshot

Swift at 390, live: the 16:10 photo, the pills, the name, the four-line excerpt, the hairline, ORDER THIS in gold, "Irish Coffee" bold, the ingredients in grey, then the address and hours. The capture tool returns no file path.

Aside: running the production build while the dev server was up corrupted the dev server's chunk cache once (module not found errors on every page); cleared with a fresh `.next` and a restart. Nothing shipped was affected.
