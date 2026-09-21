# Report: 14-map-before-nearby (2026-09-15, 15:34 to 15:42 PT)

Done and deployed: commit 3316bdb. One change: the location map block and the nearby-bars block exchanged places in the profile page's JSX. Neither block's markup, headings, styling or spacing was touched, and nothing else on the page moved.

## Order, before and after (live HTML, class markers in document order)

Junebug (New Orleans, free tier, no article mentions):
- before: Plan Your Visit, Nearby, CTA, Location
- after: Plan Your Visit, Location, CTA, Nearby

Daisy Margarita Bar (top10 tier, has mentions):
- before: Plan Your Visit, Nearby, Mentions, Location
- after: Plan Your Visit, Location, Mentions, Nearby

A literal swap: the map took the list's slot (directly after the gallery / Plan Your Visit, before the mentions card and the CTA) and the list took the map's slot (before the mobile Top 10 box). The mentions card and the CTA kept their positions relative to each other.

## Positions (live after deploy, Junebug, document y in px)

- 390px: Plan Your Visit top 1286 (h 296), Location top 1693 (map 280 tall inside it), CTA 2082, Nearby 2361 (h 958). The map is reached about 960px sooner than before on a phone.
- 1440px: Plan Your Visit 1262, Location 1584 (map 350), CTA 2043, Nearby 2195 (h 655).
The heights of both blocks are unchanged (the map keeps its 280/350px, the list its rows); only the tops moved, which is the swap.

## No-coordinates check

apotheke-nomad (active, lat null): page 200, no Location block, no empty div; it also has no Nearby block because the nearby list needs the bar's own coordinates, which was already the case. Nothing left empty.

## Screenshot

Junebug at 390, live: the map (with the marker and zoom controls) directly above "Nearby in New Orleans" and its first cards. The map component initialised normally after the move (a Mapbox canvas is present). The capture tool returns no file path.
