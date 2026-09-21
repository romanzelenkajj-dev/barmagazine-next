# Report: 10-accolade-prose-one-sentence (2026-09-15, 14:50 to 15:00 PT)

Done and deployed: commit a129d26. Tests 308/308 (14 new for the clause grammar and the 1, 2 and 3 clause cases).

## What changed

- src/lib/accolades.ts: `tileEntries(accolades, limit)` now exposes the exact set the tiles render (renderable, one per org and year, score order, at most three); `tilesFor` maps over it.
- src/lib/accolade-sentences.ts rewritten: `accoladeSentence(name, accolades)` returns ONE sentence, the stored bar name once as the subject, one clause per tile entry in tile order, two joined with " and ", three with ", " and ", and ", period at the end; empty string when the tiles render nothing. `accoladeClause(entry)` carries the per-org phrasing from the task: 50 Best "ranks No. N on <list> <year>" on the current edition and "ranked" on an older one, "was listed on <list> in <year>" without a rank; Spirited "won <category> at the <year> Spirited Awards" / "was a Top 4 finalist for" / "was a Top 10 nominee for" / (not in the task, kept consistent) "was a regional honoree for"; James Beard "won the James Beard Award for Outstanding Bar in <year>" / "was a James Beard Award finalist" / "semifinalist"; Bartenders' Choice and Shaker "won <category> at the <year> ..." / "was nominated for ..."; Shaker placings (the data has ranks, not categories) "ranks No. 2 on the 2025 Shaker Awards Top 30 Bares de México"; 30 Best Bars India ranks/ranked/listed plus "won <category> at the <year> 30 Best Bars India" for its category wins; Pinnacle "holds 2 Pins from The Pinnacle Guide (2024)", singular "1 Pin". "the" is added before a category that is itself an award ("won the Timeless U.S. Award at the 2026 Spirited Awards").
- Current edition per list is a constant map `LATEST_EDITION` (w50b 2025, na50b, e50b, a50b 2026, 30bbi 2025, shaker 2025), read from the newest year each list carries in the data today, with a note to bump it when a list publishes (World's 50 Best 2026 in October).
- src/app/bars/[slug]/page.tsx: the prose paragraph renders the one sentence in the same place and style; nothing else on the page reused the old per-org sentences (the meta description is the row description or the fallback; JSON-LD uses the award strings), so nothing else changed.

## Rendered live

- Bitter & Twisted Cocktail Parlour was listed on North America's 50 Best Bars in 2022 and holds 2 Pins from The Pinnacle Guide (2024).
- Daisy Margarita Bar ranks No. 44 on North America's 50 Best Bars 2026 and was a Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards.
- Little Rituals won Best U.S. Hotel Bar at the 2025 Spirited Awards and holds 1 Pin from The Pinnacle Guide (2024).
- Tlecān ranks No. 23 on World's 50 Best Bars 2025, ranks No. 5 on North America's 50 Best Bars 2026, and won World's Best Spirits Selection at the 2026 Spirited Awards.
- Salmon Guru holds 1 Pin from The Pinnacle Guide (2025).

## Two departures from the task's examples, both data-driven

1. Bitter & Twisted comes out with the clauses reversed relative to the example. The rule in the task is tile order (score order), and on that row the 2022 North America listing is stored at score 600 while the 2 Pins score 546, so the listing leads, exactly as its tile leads on the face. The example presumed the Pin outranks the listing. Under the calibration a 2022 unranked listing would score 472 (520 minus 12 a year) and the Pin would lead; that row's 600 is an old, undecayed value. The monthly score refresh, or a one-off recalibration of the older 50 Best entries, would produce the example's order without any prose change. Not touched here; Roman's call.
2. Little Rituals has no James Beard entry (its accolades are the 2025 Spirited win and a 2024 Pin), so the example's sentence cannot come out of its data; the rendered sentence above is what the row holds. Daisy has no Pin, so its sentence has two clauses, as the task allowed.

## Name-repeat check (report only)

156 rows that render tiles have a description that also opens with the bar name (or its first two words), so on those profiles the prose sentence and the description both begin "Name ...". Examples: 1920, Adios, Aft Cocktail Deck, Aldo Sohm Wine Bar, All Night Skate, Alquímico, Amma Don, Aruba Day Drink, Ayahuasca Cantina, Baby Gee, Backdoor Bodega. No description edited. The description lint after deploy: 1,444 rows, 0 hits, 3 suppressed.

## Revalidation

The page renders the sentence at request time from the row; the deploy refreshed every profile.
