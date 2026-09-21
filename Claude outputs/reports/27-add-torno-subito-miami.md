# Report: 27-add-torno-subito-miami (2026-09-16, 14:18 to 14:27 PT)

Done: torno-subito inserted and live (commit 5a5079e).

## The row

- slug torno-subito, id ea1e68d6-f1fa-44ee-b71b-eb6312153090, live at https://barmagazine.com/bars/torno-subito (200).
- Admission under the restaurant-bar precedent: 1986 Steak House is type Cocktail Bar with subtype Restaurant Bar, so Torno Subito is stored the same way (there is no Italian subtype in the taxonomy). Venue null per the task; the building, The Moore Miami, is noted in admin_notes.
- Every value from tornosubitomia.com, read in the browser on 2026-09-16 (the site is script-rendered and the fetcher sees only the title): address 191 NE 40th St, Miami, FL 33137 (confirmed in the footer and the maps link); phone (305) 209-3100; email info@tornosubitomia.com; Instagram tornosubitomia (linked from the site); reservations https://resy.com/cities/miami-fl/venues/torno-subito (the site's Book Now link); website https://tornosubitomia.com/. Hours as the footer prints them: bar Mon-Sat 12:30pm to closing time, lunch Mon-Sat 12:30pm-3:30pm, dinner Mon-Thu 6pm-10pm and Fri-Sat 6pm-11pm; Sunday is not listed and is stored closed by omission (flagged in admin_notes).
- Description, 118 words, primary-sourced from the homepage and the cocktail menu: Bottura, chef Bernardo Paladini and the Francescana Family, the Design District, the bar's aperitivo program, the menu's four flavor sections, the Negroni Balsamico and the Americano al Caffè, and the residency series in general terms. No dated sentence, no dashes, no food negation, no accolade (the Michelin listing is not a bar accolade).
- Menu highlights stored for the Order this block: Negroni Balsamico (gin, Campari, Italicus, white vermouth, Villa Manodori balsamic vinegar) and Americano al Caffè, as printed on the cocktail menu.
- admin_notes: the Florería Atlántico residency with Tato Giovannoni, Sept 22 to 26 2026, 5pm to 10pm, free entry, sourced to the venue's own Resy event listing ("Florería Atlántico at Torno Subito, World's 50 Best Bars takeover") and the Agencia 22 release Roman has. The specials column does not exist yet (checked 2026-09-16), so nothing went there; when it does, the line is "Florería Atlántico residency Sept 22 to 26, 5pm to 10pm".

## Checks

- Geocode: address method on insert, 25.81372, -80.191848, 4.5 km from the Miami centre; force dry re-run: address, 0 km moved. State FL derived; backfill-state 457 US/CA rows, nothing to set.
- Coordinates check: the wave adds nothing to the missing list (still the ten task-16 holds). Description lint: 1456 rows, 0 hits.
- Sitemap: 1360 active rows. The public Supabase reads share a 300-second Data Cache entry (boundedPublicFetch), so sitemap-bars.xml showed 1359 profile URLs for the first minutes after the insert; a fresh render about ten minutes later lists torno-subito (checked on both /sitemap-bars.xml and /api/sitemap-bars).
- Miami city page revalidated by the create path and lists torno-subito; the Florida cocktail-bars and United States cocktail-bars pages pick it up on their next hourly revalidation.
- Indexing queue: torno-subito appended as pending.

## The article pairs

The Torno Subito article is not on WordPress yet (public API search for "torno subito" returned nothing on 2026-09-16), so no pair can be written. claude/article-mentions-confirmed.txt now carries a dated placeholder naming the three pairs to add with the article's slug (torno-subito, floreria-atlantico, floreria-atlantico-dc). The automatic rule would match "Torno Subito" and "Florería Atlántico" on name plus city for the Miami and DC rows; the Buenos Aires original needs the confirmed pair since the article's city is Miami. Once the slug exists, add the three lines and run scripts/build-article-mentions.mjs; the report of that run should quote the sentence for each.

## Tooling

scripts/wave-insert.mjs now carries `subtypes:` (comma-separated) and `reservation_url:` from a block.
