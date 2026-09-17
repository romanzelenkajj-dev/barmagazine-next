# City Coverage Program: winning the "best bars in <city>" search

*Written 2026-09-17. Strategy agreed with Roman after the GSC week of Sept 8 to 14.*

## The finding that drives this

Google Search Console, last 7 days, all 1,000 queries grouped:

| Query family | Queries | Impressions | Clicks | CTR | Avg position |
|---|---|---|---|---|---|
| "best / top ... bars in <city>" | 170 | 835 | 30 | 3.59% | 20.4 |
| Venue or person by name | 654 | 5,574 | 60 | 1.08% | 16.4 |
| "bars in <city>" | 176 | 1,452 | 1 | 0.07% | 25.4 |

Within the recommendation family, when we rank in the top ten: **162 impressions, 16 clicks, 9.88% CTR**, about ten times the site average.

By page type over the same week:

| Page type | Pages | Clicks | Impressions | CTR |
|---|---|---|---|---|
| Bar profiles | 594 | 35 | 9,712 | 0.36% |
| Articles | 230 | 88 | 5,861 | 1.50% |
| Best-bars city guides | 57 | 71 | 2,688 | 2.64% |
| Best-bars city + type | 29 | 25 | 956 | 2.62% |
| /bars/city pages | 69 | 13 | 1,688 | 0.77% |

**Roman's reading, which the data supports:** we are not going to win the search for a named bar, and we do not need to. Google's own panel and the bar's website own that query, and the bar does not need us for it. Our value, to readers and to the bars themselves, is being the answer to "where should I drink in this city". A bar wants to be *in* our best-bars list. That is what we must be good at.

**The corollary:** the big cities are the most contested. The opportunity is in mid-sized and smaller cities, where a good guide can rank quickly. Someone looking for a cocktail bar in Carlsbad should find us.

**Profiles still matter**, not as landing pages but as inventory: a city guide cannot exist without enough profiles behind it, and the profile is where a reader lands after the guide does its job.

## Where we actually stand

200 city pages, 1,340 bars.

| Bars per city | Cities |
|---|---|
| 1 | 85 |
| 2 | 32 |
| 3 to 5 | 19 |
| 6 to 9 | 9 |
| 10 to 19 | 35 |
| 20 or more | 20 |

117 city pages carry one or two bars. Those cannot rank for a recommendation query and, if anything, they dilute the site.

## Two separate jobs

**Track A, inventory.** Cities with too few bars to be a guide. The work is adding verified bars.

**Track B, the big-city long tail.** Cities that already have the bars but sit on page two or three: Las Vegas has 22 bars and ranks 24 to 28 for its recommendation queries; Sydney, Tokyo, Berlin and Stockholm are the same shape.

**Decision, 2026-09-17 (Roman):** do not fight for the big-city head term at all. "Best bars in Las Vegas" is contested by Yelp, TripAdvisor, Thrillist and a wall of affiliate pages, and more bars will not change that. Vegas as a head term is dropped.

Big cities are attacked sideways instead, where the competition thins:
- **City + type**, which already converts at 2.62% on 29 pages and where we rank 6 to 12 with no work: best speakeasy boston, best hotel bars singapore, best cocktail bars vancouver, speakeasy bars montreal.
- **Neighbourhood pages**, the next rung down and barely contested: best cocktail bars in Shoreditch, Roppongi, Condesa, Kreuzberg. The neighborhood column already exists on the rows.
Never more bars in a city that already has twenty.

## Track A: how we source bars in smaller cities

Awards do not reach these cities, which is exactly why the directory is award-shaped today. The sources that do reach them, in order of reliability:

1. Local press and city magazines, alt-weeklies, Eater and Time Out city maps. Admission sources only, never accolades.
2. Regional competition rosters: World Class regional heats, Bacardi Legacy national semifinals, Speed Rack regionals, USBG chapter events. These name bars in cities no global list covers.
3. Cocktail weeks and festivals in the city, participating venue lists.
4. State and regional hospitality association programmes.
5. The Pinnacle Guide: 69 pinned bars are not yet in the directory.
6. Michelin Guide bar and restaurant-bar mentions.
7. Local bartender community accounts on Instagram.

Verification standard does not move: the bar's own site or Instagram confirms it is open, cocktail-led, and gives address, hours, website and handle. Anything unconfirmed is held, never guessed.

**What counts as admissible (Roman, 2026-09-17).** Wine bars are in, listed
with the **Wine Bar** subtype. Breweries, distillery taprooms that are not
cocktail bars, and coffee bars are out. This is written here as well as in
`claude/admission-rule.md` because the rule drifted once: the first Slovakia
pass held NUDA in Bratislava as "a wine bar rather than a cocktail-led room",
which is not the rule, and the bar has since been inserted.

**Bartenders' Choice Awards "bars to watch", by country**, belongs on the
source list above. BCA publishes these yearly per country and they reach the
mid-tier cities this programme targets: Kosice, Nitra, Lyon, Marseille,
Bordeaux, Nice, Montpellier, Gdansk, Wroclaw, Krakow, Gyor, Split, Belgrade.
BCA is a whitelisted accolade org, which makes the distinction sharper rather
than softer: a watchlist is still not an award and never reaches the
accolades field.

**Reading an Instagram-only venue.** Half the bars in these cities have no
website, and a researcher who cannot read Instagram holds all of them: the
first Polish run returned 5 of 18 for that reason alone, and a second pass
returned 11 of 18. A plain fetch returns the logged-out shell and the profile
API returns 401. What works, logged out, through the Browser pane:
`meta[name="description"]` carries the complete bio and survives age gates;
the alt text of the grid images carries each post's date, after scrolling;
and `instagram.com/p/<id>/embed/captioned/` returns a full caption. Zahir in
Nitra is listed only because of the last one.

## What "enriched" means, per bar

Required before a bar counts toward a guide: name, address, city, state or country, coordinates, website, Instagram, opening hours, type and subtypes, and a primary-sourced description of 90 to 120 words.

Valuable and worth the extra minutes: subtypes, because they power the city + type pages that convert at 2.62%; the signature serve, which gives the snippet something to say; the neighbourhood, which is the next SEO rung; and a photo, which is what makes a guide look like a guide.

Photos come from owners, which links this programme to outreach: add the bars, email the owners, ask for a photo and a claim. Each wave of bars becomes the next outreach batch.

## Cadence

Three cities a week to start, ten bars each, roughly thirty bars a week and 120 a month. At that rate the directory passes 2,000 bars by the end of the year, and every one of those cities gains a guide that can rank.

Raise to five cities a week as soon as wave 1 shows the sourcing method works. Two accelerators: Roman's own local knowledge for cities he knows, starting with five Bratislava bars he is supplying, and running candidate-building for several cities in one pass rather than one at a time.

**Wave 1 doubles as a test of the method.** Code builds its Bratislava list from local sources without seeing Roman's five. Comparing the two tells us how much of a real local scene the press-and-competition sourcing actually finds, which is what decides whether we can trust it across the other 116 thin cities.

## Definition of done, per city

A city guide is credible and gets promoted when it has at least eight active bars, at least six with full descriptions, at least three with photos, a hand-written intro in city-intros.ts, and its city + type pages live wherever six bars of a type exist.

## Target order

**Wave 1, finish what is nearly done.** The 19 cities at 3 to 5 bars: Bratislava 5, Oslo 4, Zagreb 4, Atlanta 4, Detroit 4, Medellín 4, Calgary 3, Cartagena 3, Dallas 3, Hanoi 3, Helsinki 3, Kraków 3, Kyoto 3, Osaka 3, Split 3, Warsaw 3, Macau 3, Sacramento 3, San Juan 3. Adding five to seven bars each turns 19 thin pages into 19 guides.

**Wave 2, US mid-metros at one or two bars**, where search demand is real and competition is soft: Portland, Minneapolis, Salt Lake City, Columbus, Durham, Milwaukee, Oakland, Albuquerque, Savannah, Charleston, Birmingham, San Diego.

**Wave 3, cities we do not cover at all**: Kansas City, Indianapolis, Pittsburgh, Cleveland, Richmond, Tucson, Memphis, Louisville, Cincinnati, Raleigh, Providence, Boise.

**Continuous, Track B**: city + type pages for every big city with query demand, then neighbourhood pages. Not head terms.

## Hygiene decision to take

City pages with fewer than four bars should be noindex until they reach the threshold, kept live for navigation. Thin pages compete with our own good ones and give a poor first impression to anyone who does land.
