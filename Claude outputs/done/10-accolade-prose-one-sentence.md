# Accolade prose: one sentence, bar name first, ordered by strength (Roman approved)

Today the accolade prose on profiles is one sentence per org, each starting with "it": "The Pinnacle Guide awarded it 2 Pins in 2024. North America's 50 Best Bars listed it in 2022." Change accolade-sentences.ts so the tiles' accolades (the same deduped, score-ordered set the tiles use, max 3) render as ONE sentence that starts with the bar's name.

Grammar:
- Subject is the bar name once (full `name` from the row, no article added).
- Clauses in tile order (score order). Join two clauses with " and ", three with ", ", ", and ". Each clause is a verb phrase:
  - 50 Best (w50b, a50b, e50b, na50b) with rank: "ranks No. 44 on North America's 50 Best Bars 2026" when the year is the current list edition (the newest edition in the data for that org); "ranked No. 44 on North America's 50 Best Bars 2024" for an older year. Without rank: "was listed on North America's 50 Best Bars in 2022".
  - totc winner: "won Best New International Cocktail Bar at the 2026 Spirited Awards"; Top 4 finalist: "was a Top 4 finalist for <category> at the 2026 Spirited Awards"; Top 10 nominee: "was a Top 10 nominee for <category> at the 2026 Spirited Awards". Use the category stored in `title`.
  - jbf winner: "won the James Beard Award for Outstanding Bar in 2026"; nominee (finalist): "was a James Beard Award finalist for Outstanding Bar in 2025"; semifinalist: "was a James Beard Award semifinalist for Outstanding Bar in 2025". Use the stage the row carries.
  - bca: "won <category> at the 2026 Bartenders' Choice Awards" / "was nominated for <category> at the 2026 Bartenders' Choice Awards".
  - 30bbi: "ranks No. 7 on 30 Best Bars India 2025" / "ranked ..." for older / "was listed on 30 Best Bars India 2024" without rank.
  - shaker: same shape as bca with "Shaker Awards" and "México".
  - pinnacle: "holds 2 Pins from The Pinnacle Guide (2024)"; "holds 1 Pin ..." singular.
- Finish with a period. Keep the existing rule of one clause per org per year (the deduped set). No rank appears anywhere except where the clause pattern above includes it (the tiles' no-rank-on-face rule is about tiles, prose already carried ranks).

Examples that must come out exactly:
- Bitter & Twisted Cocktail Parlour holds 2 Pins from The Pinnacle Guide (2024) and was listed on North America's 50 Best Bars in 2022.
- Daisy Margarita Bar ranks No. 44 on North America's 50 Best Bars 2026, was a Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards, and holds 1 Pin from The Pinnacle Guide (2025). (adjust the Pinnacle clause to Daisy's real data or drop it if none)
- Little Rituals was a James Beard Award semifinalist for Outstanding Bar in 2025.

Also:
- The prose is still the first paragraph before the description, same styling.
- Meta description / JSON-LD: if they reuse the accolade sentence, they get the new one.
- Add unit tests for the 1, 2 and 3 clause cases and each org's phrasing (winner/nominee, ranked/listed, current vs older edition, 1 Pin vs 2 Pins).
- Run the description lint after: with the bar name now leading the prose, check nothing reads "Name ... Name ..." twice in a row where a description also opens with the name (report count only, do not edit descriptions).

Deploy after tests, revalidate, report the commit with the rendered sentence for Bitter & Twisted, Daisy Margarita Bar, Little Rituals, Tlecān and Salmon Guru Dubai.
