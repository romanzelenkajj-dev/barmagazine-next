# Task 118: the city-guide directory as one card with regions. PR #82 MERGED 2026-09-23 (region tabs)

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

## Rework (Roman, same day): region tabs

The six columns became six tabs inside the same card: Europe, North America, Latin America, Asia,
Middle East and Africa, Oceania. One region shows at a time, its cities alphabetical in a
four-column grid of the same gold-underlined links; the other five panels are `hidden`, not
absent, so all 109 links stay in the HTML (checked: 109 anchors in the card, 5 hidden panels).

Default tab: the visitor's region from the IP geo the site already reads. /bars reads
x-vercel-ip-continent and x-vercel-ip-country from the request and passes the region in
(`regionOfGeo`: US and Canada are North America, the rest of that continent Latin America, the
Gulf and the Levant the Middle East tab, unknown Europe; 13 test cases). The /best-bars city pages
are ISR and cannot see headers, so they start on Europe and ask /api/geo once after mount,
switching only if the visitor has not already picked a tab. Localhost has no geo, which is why the
local check opened on Europe.

Phones: the tab row scrolls sideways (643px of tabs in a 336px row on 390, no page overflow), the
grid drops to two columns. PR #82 rebuilt, same preview URL.

## Bug on the preview (Roman, same day): tabs highlighted, panels stacked. Fixed, `6492ec7`

The panel carried `display: grid`, an author rule, which beats the browser's `[hidden] { display:
none }`, so every region rendered under the tabs while only the highlight moved. My local check had
read the `hidden` property, not the computed style, which is how it passed.

Now: the grid sits on the inner list, `.js .city-region-panel[hidden]` is `display: none`, and a
parse-time script in the component sets a `js` class on the document root. Without JavaScript the
tab row is hidden and all six panels show under their own region titles, so the page still reads.

Checked: (1) local dev, computed styles: clicking each of the six tabs leaves exactly one panel
visible with the right link count (35, 44, 9, 17, 2, 2). (2) A script-free copy of the server HTML
served locally, in the in-app browser: `js` class absent, tab row `display: none`, all six panels
`display: block` with their titles. (3) The rebuilt Vercel preview in Roman's real Chrome, JS on:
result recorded in chat.
