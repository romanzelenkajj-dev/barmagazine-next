# New SEO rung: country-by-type and US-state-by-type pages (Roman: go)

We have city-by-type pages at /best-bars/<city>/<type> (seo-cities.ts, typePageBySlug, city-by-type generation with the 3600 s revalidate and ItemList JSON-LD). Build the two rungs above them on the same template and data, no new data model.

## Routes
- Country: /best-bars/country/<country-slug>/<type>  e.g. /best-bars/country/united-states/hotel-bars, .../speakeasies, .../rooftop-bars, .../cocktail-bars. Title pattern "Best Hotel Bars in the United States (2026) | BarMagazine"; H1 the same without the brand; meta description with the LIVE count, never baked.
- US state: /best-bars/us/<state-slug>/<type>  e.g. /best-bars/us/california/hotel-bars. Title "Best Hotel Bars in California (2026) | BarMagazine". Uses the bars.state column (spelled-out state name via the existing cityLabel/placeLine helpers for the display name, slug from the state name).
- Page exists only when the combo has at least 6 active bars; otherwise 404 (not an empty page), and it is not in the sitemap. Same rule the city pages use, or 6 if they use less.

## Page content
- Same layout as the city-by-type page: intro, the bar grid (the directory card, pills on the photo), ordering = accolade score desc then name (the same ordering as city pages), sibling type links, links down to the city-by-type pages that exist inside the country/state (e.g. the US hotel-bars page links to New York, New Orleans, Chicago hotel-bars pages), breadcrumb Bar Directory > United States > Hotel Bars, and a link up from each city-by-type page to its state and country page.
- Intro copy: hand-written, primary-source rule, no dashes, 120 to 180 words, for these 12 first: United States x hotel-bars, speakeasies, rooftop-bars, cocktail-bars; California, New York, Texas, Florida x hotel-bars and cocktail-bars. Write them in src/lib/city-intros.ts style (a new country-state-intros.ts). Every other generated combo gets the composed generic intro the city pages use for thin data.
- JSON-LD ItemList as on the city pages; canonical; add both rungs to the relevant sitemap route with lastmod = newest member.
- Add the new pages to claude/indexing-queue.json (the 12 with written intros first).

## Checks
- Render United States x hotel-bars and confirm Hey Love, Tonga Room, Polo Lounge, Round Robin, Bemelmans, King Cole, Carousel Bar appear (post wave 5), count in the meta description equals the grid, no page for a combo under the threshold, sitemap validates, 390 and 1440 screenshots of the US hotel-bars page, standing layout rule for anything touched on existing pages (only the new up-links are allowed to change there).

Deploy and report the commit, the list of generated pages with counts, and the 12 intros for Roman to read.
