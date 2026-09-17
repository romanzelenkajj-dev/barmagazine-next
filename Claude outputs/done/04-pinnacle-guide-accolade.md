# Add The Pinnacle Guide as an accolade org and match the directory

Owner request (Ross Simon, Bitter & Twisted Cocktail Parlour, Phoenix) asked for their Pinnacle Guide Pins on the profile. Verified by the cloud session at https://www.thepinnacleguide.com/bitter-twisted/ : 2 Pins, awarded 2024. The Pinnacle Guide is application plus anonymous in-bar assessment against fixed criteria, graded 1, 2 or 3 Pins. Under claude/admission-rule.md and the accolade ruling (jury-assessed programmes qualify, editorial lists do not) it qualifies.

## 1. Org
- Add org key `pinnacle` ("The Pinnacle Guide") to the whitelist in src/lib/accolades.ts, isRenderable, AccoladeBadges.tsx and accolade-sentences.ts.
- Grade is the Pin count (1, 2, 3), stored in the existing stage/tier field, never in rank. Tile face: org line "PINNACLE GUIDE", main line "2 PINS", year line. No rank on the face (there is none); nothing on hover beyond what other orgs show.
- Prose sentence: "The Pinnacle Guide awarded it 2 Pins in 2024." (1 Pin singular.)
- Scoring: 3 Pins 600, 2 Pins 570, 1 Pin 540, each minus 12 per year before 2026, so a 2024 2-Pin scores 546. Sits between a national listed entry (520 base) and a national top-10 rank. One tile per org per year as now; if a bar is re-assessed in a later year keep the latest year's tile and let dedupe handle the rest.

## 2. Data
- Fetch the complete Pinnacle Guide bar list from thepinnacleguide.com (all Pin levels, all years, all cities). Save the raw list as claude/pinnacle-guide-list.json with name, city, country, pins, year, url.
- Match against active bars by name + city (never name alone; Zuma, Attaboy, Employees Only, Salmon Guru, Paradiso are multi-row). Write each match by id. Produce three lists in the report: matched (with id, slug, pins, year), pinned bars not in the directory (these are admission candidates under the "all great bars" rule, so list them for a later add wave, do not add them in this task), and ambiguous matches you did not write.
- If the site is hard to scrape, stop and report what you found, do not guess any Pin counts.

## 3. Checks
- Bitter & Twisted (slug bitter-twisted-cocktail-parlour or whatever the row is; find by id) shows the tile and the sentence after revalidation.
- Run the accolade dedupe check and the sitemap count check; deploy; report commit and the counts.
