# Task 120: city directory pages. Branch `preview/120-city-directory`, draft PR #83, NOT merged, 2026-09-23

Preview URL in chat: /bars/city/palma-de-mallorca desktop and 390.

## 1. The intro and the meta description

Band: "Browse the 6 bars BarMagazine lists in Palma de Mallorca, Spain, with addresses, opening
hours and map." The place label follows the site's rule (`cityLabel`: "Nashville, Tennessee" for
US cities, never the country), which is the one place the wording differs from the brief. The 20
hand-written city intros (`src/lib/city-intros.ts`) no longer feed the band, so no city directory
names a bar there; the file stays.

Meta description: "The bars BarMagazine lists in Palma de Mallorca, Spain, with addresses, opening
hours and map. Browse the full city directory." No count, per the caching rule in the file.

The country directory band ("53 curated bars across 12 cities in Spain, covering ...") never
mentioned signature serves, so it is unchanged; its description neither.

## 2. The toolbar row

"6 bars in Palma de Mallorca · All bars in Spain →" now sits in `.directory-toolbar`, the white
24px-radius row /bars uses for its filters (14px bold count, 13px grey link). It was not just bare:
task 116 deleted the old `.directory-results-bar` rules, so the line had lost its styling entirely.
The country pages' "53 bars in Spain" line had the same problem and takes the same row. Desktop:
row 49px tall at 408, grid starts at 473; 390: row from 10 to 380px, no horizontal overflow.
Nothing else on the page moved except the grid, which follows the row.
