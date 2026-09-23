# Task 118: the city-guide directory as one card with regions. Branch `preview/118-city-guides`, draft PR #82, NOT merged, 2026-09-23

Preview (Vercel SSO), build green:
- https://barmagazine-next-git-previ-bb2df7-romanzelenkajj-7135s-projects.vercel.app/bars (desktop and 390)
- same host, /best-bars/athens for the "Best bars in other cities" block

## What it is

`src/components/CityGuideDirectory.tsx` renders one white card (house radius, `#e8e2d6` border,
28/32px padding): the heading inside the card, then the cities grouped by region in columns, plain
text links, alphabetical inside each region, in the article link style (inherit colour, gold
underline, gold-ink on hover). No pills. Regions in this order: Europe, North America, Latin
America, Asia, Middle East and Africa, Oceania. On /bars today: Europe 35, North America 44, Latin
America 9, Asia 17, Middle East and Africa 2, Oceania 2; 109 links, every one in the HTML.

The region mapping is `src/lib/city-regions.ts` (2 tests): built on the geo.ts continent lists,
with Latin America taking South America plus Mexico, Central America and the Caribbean (so San Juan
sits there), the Middle East taken out of Asia to share a column with Africa, and Turkey and Georgia
left in Europe where the 50 Best lists put them. A country the map does not know lands in North
America rather than vanishing.

## Phones

Below 768px the card stacks the regions as collapsible rows with a chevron; Europe and North America
open by default, the other four start collapsed. The collapse is a class the phone stylesheet reads,
so the desktop columns never hide a link and server and client render the same markup. Verified at
390: card 26 to 364px, no horizontal overflow, Latin America opens on tap and lists its nine cities.

## Where the block appears

Two places, both switched: the "Best bars by city" section under the directory app on /bars, and
the "Best bars in other cities" block at the foot of every /best-bars/<city> page (the current city
excluded, 108 links on Athens). The region pages' "by city", "by state" and "by bar style" blocks
are different blocks (short lists with counts inside one region) and were left as they are; say so
if they should take the card too.

Files: `src/components/CityGuideDirectory.tsx`, `src/lib/city-regions.ts` + test,
`src/app/bars/page.tsx`, `src/app/best-bars/[city]/page.tsx`, `src/app/globals.css`
(`.city-guides*`, `.city-region*`, `.city-guide-link`; the old `.dir-city-guides h2` rule is gone).
