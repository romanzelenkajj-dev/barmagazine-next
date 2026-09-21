# Report: 06-description-accolade-tail-dedupe (2026-09-15, 14:14 to 14:24 PT)

STOPPED AT THE TASK'S OWN CHECKPOINT ("report count and a sample of 20 before changing anything"), because the change is a mass edit: it would remove a sentence from about 300 active descriptions, a quarter of the directory, including copy written in the last two days. Nothing was changed. Everything is staged so a "go" from Roman is one command.

## 1. The scan (all 1,348 active rows, last two sentences of each description)

Sentence splitting protects "No.", "Mr.", "U.S." and "D.C." (a first pass split on them and produced fragments). A hit is a sentence in the last two that names a whitelisted body (the 50 Best lists, Spirited Awards / Tales of the Cocktail, Bartenders' Choice, James Beard, 30 Best Bars India, Shaker Awards) together with a rank or a year.

404 hits on 352 rows (308 in the last sentence, 96 in the second-last).

By shape and by whether the row's accolades already carry the same org and year:
- ACCOLADE-ONLY sentence, fact already on the row: 297 (180 with a stock opening such as "It won", "It was a Top 4 finalist", "It currently stands at No.", "The James Beard Foundation named it"; 117 with a looser opening such as "It sits at No. 46 on Europe's 50 Best Bars 2026." or "The bar holds No. 66 on North America's 50 Best Bars 2026."). These are the removals the task describes: the generated prose above the description already says the same thing.
- ACCOLADE-ONLY sentence, fact NOT on the row: 72. Kept; listed below for accolade backfill (mostly older 50 Best placings, 2011 to 2025, and TOTC honors before 2026, which the accolade data does not carry).
- COMPOUND sentence (accolade clause joined to non-accolade content): 35, of which 20 duplicate an accolade and 15 do not. Held either way: removing the sentence would remove content that is not about the accolade, which the task forbids, and trimming a clause is a hand edit. Example: Watch Hill Proper, "It serves no beer, only bourbon, American whiskey, cocktails and wine, and the James Beard Foundation named it an Outstanding Bar semifinalist in 2026."

Sample of 20 (random):
- salmon-guru: It sits at No. 46 on Europe's 50 Best Bars 2026. (covered)
- bar-contra: No.98 in North America's 50 Best Bars 2025. (NOT on the row)
- no-sleep-club: No.8 in Asia's 50 Best Bars 2021 and No.26 in the World's 50 Best that year. (NOT on the row)
- victor-audio-bar-buenos-aires: It currently stands at No. 87 on the World's 50 Best Bars 2025. (covered)
- double-chicken-please: It sits at No. 41 on the World's 50 Best Bars 2025 and No. 35 on North America's 50 Best Bars 2026. (covered)
- arca: It was a Top 4 finalist for Best International Restaurant Bar at the 2026 Tales of the Cocktail Spirited Awards. (covered)
- 14-de-la-rosa: It sits at No. 35 on Europe's 50 Best Bars 2026. (covered)
- beogradski-koktel-klub: It won Best Cocktail Bar for Serbia at the 2026 Bartenders' Choice Awards. (covered)
- the-bar-at-willett: The James Beard Foundation named it an Outstanding Bar semifinalist in 2025. (covered; written this afternoon in wave 4)
- seed-library-nyc: The bar holds No. 66 on North America's 50 Best Bars 2026. (covered)
- montana: It was a Top 4 finalist for Best New International Cocktail Bar at the 2026 Tales of the Cocktail Spirited Awards. (covered)
- vesper: It currently stands at No. 56 on Asia's 50 Best Bars 2026. (covered)
- tlecan: At No. 3 on North America's 50 Best Bars and No. 20 on the World's 50 Best Bars, Tlecān burns with conviction. (covered; opening clause, would need a hand edit)
- king-cole-bar: It picked up recognition from Condé Nast Traveler and Tales of the Cocktail in 2024. (NOT on the row; also an editorial mention)
- gong-gan: No.63 on Asia's 50 Best Bars 2025, No.74 in 2026. (covered)
- watch-hill-proper: compound, see above (held)
- alma-prague: It sits at No. 25 on Europe's 50 Best Bars 2026. (covered)
- dunlin: The bar holds No. 50 on Europe's 50 Best Bars 2026. (covered)
- nouvelle-vague: compound (held)
- champagne-bar-at-four-seasons-surf-club: A Top 4 finalist for Best U.S. Hotel Bar at the Tales of the Cocktail Spirited Awards in consecutive years, most recently 2026, this Surfside... (covered; opening clause of a longer sentence, hand edit)

## 2. Why this stopped

- Scale: 297 descriptions lose their last or second-last sentence in one pass. The generated prose makes them redundant, but the wave files of the last two days were written with that sentence on purpose ("The Spirited Awards named it a U.S. West honoree..."), and they are Roman's copy.
- Judgment inside the mechanical rule: the "covered" test matches org and year; it does not check that the rank in the sentence equals the rank in the accolade (a stale rank in the sentence is exactly what should go, but a sentence carrying a second fact, "and No. 26 in the World's 50 Best that year", would be lost with it). About 40 of the 297 carry two facts.
- Sentences whose accolade clause is an opener or is joined to other content cannot be removed whole without losing non-accolade copy (35 compound, plus the tlecan and Surf Club kind), which the task forbids; they need a hand edit or an explicit rule for trimming a clause.

## 3. Staged, ready on a go

- /tmp/acc-tails.json holds every hit with slug, id, position, kind, covered flag, orgs, years and the sentence. On "go" the removal runs by id over the 297 covered accolade-only sentences (with the 117 looser-opening ones included or not, Roman's call), rebalances bold markup, checks for a dangling "and" or an empty description, revalidates the touched profiles, and reports the count.
- The "fact not on the row" list (72 accolade-only plus 15 compound) is in the same file, for accolade backfill rather than sentence loss. First 25 in the console output are typical: 28-hong-kong-street (No. 21, World's 50 Best 2021), above-board (No. 44 in 2021, No. 100 in 2024), atwater-cocktail-club (No. 36, North America's 50 Best 2025), bar-contra (No. 98, 2025), civil-liberties (No. 21 in 2024 and 2025), coley (No. 27, Asia's 50 Best 2019), dante (No. 46, 2025), floreria-atlantico (No. 30, 2023)...
- Lint: not added yet. The pattern is ready to drop into scripts/description-lint.mjs as a second check ("a description's last two sentences must not restate an accolade the row carries"), gated on the same org and year test, so it only fires on true duplicates.

## 4. Not done

No description changed, no lint added, no commit.
