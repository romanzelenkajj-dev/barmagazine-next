# 98: Map view opens on the filtered city

## Bug (reported by Roman, reproduced in code)
On /bars, pick Macau in the city dropdown (5 bars), then click Map: the map opens
zoomed out over Europe/Africa, not on Macau. Map first, then Macau, works.

## Cause (src/components/BarDirectoryMap.tsx, DirectoryMap)
1. Initial center only knows a city filter through the hardcoded CITY_COORDS_MAP
   (32 cities). Macau is not in it, so the map starts on the visitor's IP/GPS/country.
   66 of the 98 cities with 3+ bars are missing from that list (Bratislava, Munich,
   Copenhagen, Melbourne, Milan...), so this hits most of the dropdown, not only Macau.
2. The fit-to-filtered-bars effect skips its first run (isInitialBarsRender) to
   respect the IP/GPS start. With a filter already active, that skipped run is the
   one that should have zoomed to the city. If /api/bars/map resolves before the
   map's 'load' event, no later run happens, so the map never moves.
   Switching to Map first works because the filter change triggers a fresh run.

## Fix
- In the bars/filter effect: skip the first run only when no city/country filter
  is active. With a filter, fit to the filtered bars on that first run
  (duration 0 on the first run so it does not fly across the globe).
- Keep CITY_COORDS_MAP as a fallback only; do not extend it by hand.
- Do not change the no-filter behaviour (IP/GPS start, near-me fit).

## Check before preview
- Filter first, then Map, for: Macau, Bratislava, Munich, Hong Kong, a country
  filter (e.g. Germany), and a type filter with no location (must not auto-fit).
- Map first, then filter: still fits as today.
- No filter: still opens on IP/GPS as today.
- Run the tests (with pipefail) and type-check.

## Delivery
Branch preview/98-map-filter-fit, give Roman the preview URL. Visual change:
nothing merges to main until Roman has looked at the preview and says so in chat.
