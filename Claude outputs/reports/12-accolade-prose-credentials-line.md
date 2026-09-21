# Report: 12-accolade-prose-credentials-line (2026-09-15, 15:07 to 15:20 PT)

Done and deployed: f3592cc (the line) and 3c0cfa2 (the alignment item added to the task while it ran). Tests 309/309.

## The line

src/lib/accolade-sentences.ts: `credentialsLine(accolades)`: the same deduped, score-ordered tile set as task 10 (tileEntries, at most three), each clause recast without a subject, two joined with " and ", three with ", " and ", and ", first letter capitalised, one period. `credentialsLineWithName(name, accolades)` exists for off-page reuse ("Name: Listed on ..."), but nothing off-page reuses the line (the meta description is the row's description or the fallback; JSON-LD uses the award strings), so on the page and everywhere else there is no name.

Clause forms as specified: "No. 44 on North America's 50 Best Bars 2026" (current or older edition alike; the credential is tenseless, so LATEST_EDITION is no longer consulted), "listed on <list> in 2022"; Spirited "winner of <category> at the <year> Spirited Awards" / "Top 4 finalist for" / "Top 10 nominee for" / "regional honoree for" (not in the task, kept for those entries); James Beard "James Beard Award winner|finalist|semifinalist for Outstanding Bar in <year>"; Bartenders' Choice and Shaker "winner of <category> at the <year> ..." / "nominated for ..." with Shaker placings as "No. 2 on the 2025 Shaker Awards Top 30 Bares de México"; 30 Best Bars India "No. 7 on 30 Best Bars India 2025" / "listed on 30 Best Bars India in 2024" / "winner of <category> at the <year> 30 Best Bars India"; Pinnacle "awarded 2 Pins by The Pinnacle Guide in 2024" in every position (one form, as the task asked), singular "1 Pin". "the" precedes a category that is itself an award ("winner of the Timeless U.S. Award ...").

## Rendered live

- Bitter & Twisted Cocktail Parlour: Listed on North America's 50 Best Bars in 2022 and awarded 2 Pins by The Pinnacle Guide in 2024. (exactly the task's line)
- Daisy Margarita Bar: No. 44 on North America's 50 Best Bars 2026 and Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards. (exactly the task's line; the row has no Pin)
- Little Rituals: Winner of Best U.S. Hotel Bar at the 2025 Spirited Awards and awarded 1 Pin by The Pinnacle Guide in 2024. (the task's example presumes a James Beard entry the row does not carry; this is what the row holds)
- Tlecān: No. 23 on World's 50 Best Bars 2025, No. 5 on North America's 50 Best Bars 2026, and winner of World's Best Spirits Selection at the 2026 Spirited Awards.
- Salmon Guru (Dubai): Awarded 1 Pin by The Pinnacle Guide in 2025.

## Alignment (the "Also")

.bar-v2-accolade-prose now carries max-width 600px like the description, the same left edge (both are direct children of the card's text column), and margin 10px below. Measured live at 1440 on Bitter & Twisted: prose left 65, description left 65; prose right 665, description right 665; 10px between the prose bottom and the description top. Screenshot at 1440 (card brought to the top for the capture) shows the two blocks sharing both edges. The capture tool returns no file path.

## Tests

Unit tests rewritten for the new forms: 1, 2 and 3 clause lines, capitalisation, the serial comma, the tile-set rule (Tlecān's fourth entry stays out), the empty case, the off-page name prefix, and every org's phrasing (winner/nominee, ranked/listed, 1 Pin vs 2 Pins).
