# Report: 21-nearby-cards-match-directory (2026-09-15, 20:10 to 20:40 PT)

Done and deployed: commit f87f2bd. Tests 315/315, build clean.

## What changed

- The card that /bars/city/<slug> renders (the local CityBarCard in the city page) is now a shared component, src/components/DirectoryBarCard.tsx, with exactly one optional prop, `locationLine`. The city page imports it and passes nothing extra, so its output is byte-for-byte what it was (placeLine as the location line). The profile's "Nearby in <city>" renders the same component with `locationLine="<street or venue>, <distance>"`.
- What the card shows: 16:10 visual with the photo or the existing BarPlaceholder; the status pills on the photo through CardStatusPills, the directory's own rules (TOP 10 by tier, 50 Best from the accolades, Featured by tier or article; a paying bar keeps its chip plus its top award, others up to two awards); the name (21px, the directory's size); one location line with the pin icon. No accolade tiles, no description.
- The nearby entry carries tier and the article slug for the pills. The 19-only card body CSS for nearby (title, meta, tile spacing) is deleted; the shared grid (three columns at 1100 and up, two to 700, one below) and the article cards from 19 are untouched.

## Lyaness, before (task 19 live) and after (local build of this commit), px

1440:
- nearby block: top 2951 both; height 754 -> 727; six cards, all 317 tall (were 330 and uneven by the tile rows); image 331 x 207
- mentions card above: 2529 to 2919 both; nothing above the block moved
- cards, in order: The American Bar (placeholder, "The Savoy, 1.0 km"), The Library Bar at The Lanesborough (placeholder), Side Hustle (photo, TOP 10), Scarfes Bar (photo, TOP 10 + Featured), Velvet by Salvatore Calabrese (placeholder), The Spy Bar (placeholder). Same six as 19, same hrefs.

390:
- nearby block: top 3946 both; height 2177 -> 2067; cards 314 tall (339 for the Library Bar, whose name wraps to two lines), image 368 x 230
- mentions card: 2952 to 3914 both; the mobile Top 10 box follows at the same gap

## US bar (Allegory, Washington DC, local build)

Six cards in miles: Silver Lyan "900 F St NW, nearby" (TOP 10 + 50 Best), Amazonia "920 Blagden Alley NW, 0.3 mi" (TOP 10, placeholder), Press Club "1506 19th St NW, 0.4 mi" (TOP 10 + 50 Best), Off the Record "800 16th St NW, 0.5 mi" (TOP 10), Your Only Friend "1114 9th St NW, 0.7 mi", Jack Rose Dining Saloon "2007 18th St NW, 1.1 mi" (TOP 10).

Live after the deploy (92f1504 Ready): Lyaness at 1440, six directory cards all 317px tall, no tiles, pills TOP 10 on Side Hustle and TOP 10 + Featured on Scarfes, nearby block 727px tall, mentions card 2529 to 2919 unchanged; at 390 six cards (314, one 339 for the two-line name).

## Screenshot

Lyaness at 1440, "Nearby in London": two rows of three directory cards, placeholders and photos side by side in the same grid, TOP 10 and Featured pills on the Side Hustle and Scarfes photos, the name and the "<place>, <distance>" line under each. The capture tool returns no file path.
