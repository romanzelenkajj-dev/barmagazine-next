# Report: 19-profile-nearby-and-mentions-cards (2026-09-15, 16:50 to 20:05 PT)

Done and deployed: commit 056706e (changelog 17dc453), live on barmagazine.com (the Lyaness page serves the new cards). Tests 315/315 (one new), build clean.

## What changed

One shared card grid for the two blocks, built from the directory card's numbers: white card, house radius (24px), hairline border, image on top at 16:10 with object-fit cover and lazy loading, body padding 12px 16px 14px, 14px bold title, 12px secondary meta. Columns: three at 1100px and up, two from 700 to 1099, one below 700; gap 16px (the directory's --gap). The tracks are fixed, so one or two items sit left at one column's width (Allegory's single mention: 306px wide in a 950px grid).

Nearby in <city>
- Six nearest instead of five (nearby.ts NEARBY_LIMIT), same same-city selection.
- Card: the bar's first photo, or the BarPlaceholder used by the directory and the profile hero (dark gradient, gold glass glyph, the name in caps) when there is none; the name; one meta line "<place>, <distance>" ("28 Bow Street, 1.2 km" for Side Hustle; miles on US rows: "920 Blagden Alley NW, 0.3 mi"); the accolade tiles, max three; no description text. The nearby entry now carries photo, accolades and type for this.
- The old row CSS (.bar-v2-near-*) is removed; the block's heading, margin and hairline are unchanged.

<Bar> in BarMagazine
- The wrapper card and its heading stay. Each row is now a card: the article's featured image from the mentions JSON (the dark thumb background remains behind a missing image), the title clamped to two lines, the date in the meta style.
- The anchor still wraps the image (alt "") and the title only, href /<article-slug>, anchor text = the title; the date sits outside it; the title's stretched ::after makes the whole card the click target, as before. Verified on Lyaness: href "/handshake-speakeasy-no-1-at-worlds-50-best-bars-2024", text "Handshake Speakeasy No. 1 at World's 50 Best Bars 2024", date "October 22, 2024".

## Lyaness, before and after (px, document coordinates)

1440:
- mentions card: top 2529 both; height 356 -> 390; three cards 306 wide, image 304 x 190, card 275 tall
- nearby block: top 2918 -> 2951 (the taller mentions card above it), height 602 -> 754; grid 333 / 333 / 333, gap 16, six cards in two rows, card 330 tall, image 331 x 207 (ratio 1.60)
- location map above: unchanged (top 2087, bottom 2513)

390:
- mentions card: top 2952 both; height 305 -> 961; one column, cards 328 wide (289 and 271 tall)
- nearby: one column, cards 370 wide, image 368 x 230 (1.60), six cards; block 863 -> 2177 tall
- the mobile Top 10 box follows at the same 16px gap

Nothing above the mentions card moved at either width; below them only the blocks' own heights changed.

## The six Lyaness cards

The American Bar (The Savoy, 1.0 km, placeholder, 1 Pinnacle tile), The Library Bar at The Lanesborough (The Lanesborough, 1.0 km, placeholder), Side Hustle (28 Bow Street, 1.2 km, photo, 2 tiles), Scarfes Bar (252 High Holborn, 1.3 km, photo, 2 tiles), Velvet by Salvatore Calabrese (Corinthia London, 1.3 km, placeholder), The Spy Bar (57 Whitehall, 1.3 km, placeholder, 1 tile).

## Other test pages (local build)

- Allegory, Washington DC: one mention, the card left-aligned at one column's width; six nearby in miles ("900 F St NW, nearby", "920 Blagden Alley NW, 0.3 mi", ...), four placeholders.
- Junebug, New Orleans: no mentions block at all; six nearby, all placeholders (the glyph renders, 207px tall image area), miles.
- Amor y Amargo, New York: six nearby, two placeholders among photos, 331 x 207 image boxes.

## Screenshots

Lyaness at 1440: the mentions card with three article cards in a row, then "Nearby in London" with two rows of three (placeholders for The American Bar, The Library Bar, Velvet and The Spy Bar; photos for Side Hustle and Scarfes; tiles under the names). Lyaness at 390: the article cards stacked with their 16:10 images, then the nearby cards stacked, The American Bar's placeholder and its Pinnacle tile first. The capture tool returns no file path.
