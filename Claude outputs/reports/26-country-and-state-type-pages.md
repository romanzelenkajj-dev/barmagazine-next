# Report: 26-country-and-state-type-pages (2026-09-16, 13:58 to 14:18 PT)

Done and deployed: commit c162448, live 45 s after the push. 72 new pages at launch: 52 country-by-type and 20 US-state-by-type. Tests 315/315, build clean.

## What was built

- Routes: /best-bars/country/<country-slug>/<type> and /best-bars/us/<state-slug>/<type> (src/app/best-bars/country/[country]/[type] and src/app/best-bars/us/[state]/[type]), both rendering one shared server component (src/components/RegionTypePage.tsx) on the city-by-type template: kicker, H1 "Best Hotel Bars in the United States", intro, the directory card grid (DirectoryBarCard, pills on the photo, the city pages' best-first order via sortSeoBars, now exported from seo-cities and shared by all three rungs, no cap so the meta count equals the grid), a "by city" block linking to every city-by-type page inside the region, on country pages a "by state" block linking to the state pages inside it, a "by bar style" block of sibling types, ItemList and BreadcrumbList JSON-LD (Home > Bar Directory > United States > Hotel Bars; the state pages add the state), canonical, robots index.
- Data layer src/lib/seo-regions.ts: one paged read of active rows, union type test (primary column or subtypes, the city pages' barHasType), MIN_REGION_BARS = 6; combinations under it are not generated, 404 and are not in the sitemap. State pages key on bars.state, slugged from the spelled-out state name (subdivisionName). Country display names take "the" where English does (the United States, the United Kingdom, the Netherlands, the UAE, the Czech Republic and a few more).
- Titles: "Best Hotel Bars in the United States (2026)" plus the layout's " | BarMagazine"; H1 without the brand; meta description with the live count ("59 hotel bars in the United States, led by Allegory. Verified addresses, opening hours and signature drinks from BarMagazine.").
- Intros: src/lib/region-intros.ts holds the twelve hand-written intros (120 to 180 words, primary-source, no dashes; every named bar, rank and award checked against bars.accolades on 2026-09-16). Every other combination gets composeRegionIntro (count, leading bar, the cities with their own guide).
- Sitemap: both rungs in sitemap-bars.xml, priority 0.8, weekly, lastmod = the newest member's updated_at.
- Up-links: every city-by-type page now links to its state page and its country page for the same type when they exist (New York speakeasies links up to /best-bars/us/new-york/speakeasies and /best-bars/country/united-states/speakeasies). That is the only change on existing pages; the two links sit in the hero-links row after the two that were there.
- Indexing queue: the nine intro pages that exist appended to claude/indexing-queue.json as pending (region page items carry the full URL in the note).

## Data decisions

- Bemelmans Bar (New York), Carousel Bar & Lounge (New Orleans) and Viceversa (Miami) were typed Cocktail Bar with no Hotel Bar subtype, so the US hotel-bars page would have missed two bars the task expects. Subtype Hotel Bar added by id (they are hotel bars: The Carlyle, Hotel Monteleone, and Viceversa is the 2026 Spirited Awards winner for Best U.S. Hotel Bar). Counts moved: US hotel bars 56 to 59, New York 4 to 5, Florida 3 to 4, Louisiana 6 to 7.
- King Cole Bar in the directory is the St. Regis Mexico City room, not New York's, so it is correctly absent from the US page. New York's King Cole is not listed; the New York hotel-bars intro names Bemelmans only.
- Under the threshold, so no page yet: New York hotel bars (5), Texas hotel bars (4), Florida hotel bars (4). Their intros are in the file and light up when a sixth bar arrives.

## Checks (local build before deploy, then live)

- United States x hotel-bars: 59 cards; Hey Love, Tonga Room & Hurricane Bar, Polo Lounge, Round Robin Bar, Bemelmans Bar and Carousel Bar & Lounge all present; King Cole absent by design (above). Meta description count 59 = grid 59 = ItemList numberOfItems 59. Sections: by city (5 links), by state (California, Nevada, Louisiana), by bar style. Hero link to /bars/country/united-states.
- Below threshold: /best-bars/us/florida/hotel-bars and /best-bars/country/france/hotel-bars return 404.
- Others rendered: California hotel bars 10, United Kingdom hotel bars 9, United States speakeasies 40, New York cocktail bars 53, each with the matching count in the meta description.
- Sitemap: 72 region URLs present with lastmod; the XML validates (same generator as before, one more loop).
- 390: one column, cards 370 wide, document width 390 (no overflow). 1440: three columns.
- Screenshots: the US hotel-bars page at 1440 (kicker, H1, the intro, the "Browse every bar in the United States" link, the first row of cards) and at 390 (the hero stacked, single column). The capture tool returns no file path.

Live after deploy: /best-bars/country/united-states/hotel-bars 200 with the title, 59 cards and the 59 in the meta description; /best-bars/us/california/hotel-bars 200; /best-bars/us/florida/hotel-bars 404; /best-bars/new-york/speakeasies carries both up-links; sitemap-bars.xml lists 72 region URLs.

## The twelve intros (for Roman to read)

They are in src/lib/region-intros.ts, keyed country:united-states:hotel-bars, country:united-states:speakeasies, country:united-states:rooftop-bars, country:united-states:cocktail-bars, us:california:hotel-bars, us:california:cocktail-bars, us:new-york:hotel-bars, us:new-york:cocktail-bars, us:texas:hotel-bars, us:texas:cocktail-bars, us:florida:hotel-bars, us:florida:cocktail-bars. Nine are live; the New York, Texas and Florida hotel-bars intros wait for their sixth bar.

## Generated pages at launch (72), with counts

COUNTRY PAGES (52):
- /best-bars/country/united-states/cocktail-bars (389)
- /best-bars/country/italy/cocktail-bars (82)
- /best-bars/country/united-kingdom/cocktail-bars (67)
- /best-bars/country/united-states/hotel-bars (59)
- /best-bars/country/india/cocktail-bars (49)
- /best-bars/country/spain/cocktail-bars (45)
- /best-bars/country/singapore/cocktail-bars (41)
- /best-bars/country/canada/cocktail-bars (40)
- /best-bars/country/united-states/speakeasies (40)
- /best-bars/country/japan/cocktail-bars (39)
- /best-bars/country/australia/cocktail-bars (37)
- /best-bars/country/hong-kong/cocktail-bars (36)
- /best-bars/country/mexico/cocktail-bars (35)
- /best-bars/country/thailand/cocktail-bars (34)
- /best-bars/country/france/cocktail-bars (32)
- /best-bars/country/south-korea/cocktail-bars (25)
- /best-bars/country/taiwan/cocktail-bars (24)
- /best-bars/country/brazil/cocktail-bars (23)
- /best-bars/country/china/cocktail-bars (23)
- /best-bars/country/united-arab-emirates/cocktail-bars (18)
- /best-bars/country/germany/cocktail-bars (17)
- /best-bars/country/sweden/cocktail-bars (16)
- /best-bars/country/argentina/cocktail-bars (15)
- /best-bars/country/indonesia/cocktail-bars (15)
- /best-bars/country/netherlands/cocktail-bars (15)
- /best-bars/country/portugal/cocktail-bars (15)
- /best-bars/country/czech-republic/cocktail-bars (14)
- /best-bars/country/vietnam/cocktail-bars (14)
- /best-bars/country/malaysia/cocktail-bars (13)
- /best-bars/country/serbia/cocktail-bars (13)
- /best-bars/country/united-states/tiki-bars (13)
- /best-bars/country/greece/cocktail-bars (12)
- /best-bars/country/hungary/cocktail-bars (12)
- /best-bars/country/switzerland/cocktail-bars (11)
- /best-bars/country/canada/speakeasies (10)
- /best-bars/country/denmark/cocktail-bars (10)
- /best-bars/country/united-states/rooftop-bars (10)
- /best-bars/country/south-africa/cocktail-bars (9)
- /best-bars/country/united-kingdom/hotel-bars (9)
- /best-bars/country/colombia/cocktail-bars (8)
- /best-bars/country/india/hotel-bars (8)
- /best-bars/country/peru/cocktail-bars (8)
- /best-bars/country/poland/cocktail-bars (8)
- /best-bars/country/thailand/hotel-bars (8)
- /best-bars/country/thailand/speakeasies (8)
- /best-bars/country/austria/cocktail-bars (7)
- /best-bars/country/croatia/cocktail-bars (7)
- /best-bars/country/hong-kong/hotel-bars (7)
- /best-bars/country/ireland/cocktail-bars (7)
- /best-bars/country/japan/hotel-bars (7)
- /best-bars/country/singapore/hotel-bars (7)
- /best-bars/country/italy/hotel-bars (6)
STATE PAGES (20):
- /best-bars/us/california/cocktail-bars (66)
- /best-bars/us/new-york/cocktail-bars (53)
- /best-bars/us/texas/cocktail-bars (29)
- /best-bars/us/illinois/cocktail-bars (24)
- /best-bars/us/louisiana/cocktail-bars (24)
- /best-bars/us/florida/cocktail-bars (23)
- /best-bars/us/washington/cocktail-bars (21)
- /best-bars/us/nevada/cocktail-bars (20)
- /best-bars/us/colorado/cocktail-bars (19)
- /best-bars/us/massachusetts/cocktail-bars (16)
- /best-bars/us/pennsylvania/cocktail-bars (16)
- /best-bars/us/district-of-columbia/cocktail-bars (14)
- /best-bars/us/arizona/cocktail-bars (11)
- /best-bars/us/california/hotel-bars (10)
- /best-bars/us/tennessee/cocktail-bars (10)
- /best-bars/us/new-york/speakeasies (9)
- /best-bars/us/georgia/cocktail-bars (7)
- /best-bars/us/louisiana/hotel-bars (7)
- /best-bars/us/nevada/hotel-bars (7)
- /best-bars/us/california/speakeasies (6)
