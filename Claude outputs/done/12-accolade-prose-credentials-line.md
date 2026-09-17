# Accolade prose: credentials line, no subject (Roman, supersedes the subject rule in task 10)

Task 10 made the accolade prose one sentence starting with the bar's name. Roman: the name sits directly under the H1 that already says it, so drop the subject entirely. The line becomes a credentials line: clauses in the same order and join rules as task 10, but each clause is written without a subject, capitalised at the start, period at the end.

Clause forms:
- 50 Best with rank, current edition: "No. 44 on North America's 50 Best Bars 2026"; older edition: "No. 12 on Asia's 50 Best Bars 2024". Without rank: "listed on North America's 50 Best Bars in 2022".
- totc: "winner of Best New International Cocktail Bar at the 2026 Spirited Awards" / "Top 4 finalist for <category> at the 2026 Spirited Awards" / "Top 10 nominee for <category> at the 2026 Spirited Awards".
- jbf: "James Beard Award winner for Outstanding Bar in 2026" / "James Beard Award finalist for Outstanding Bar in 2025" / "James Beard Award semifinalist for Outstanding Bar in 2025".
- bca: "winner of <category> at the 2026 Bartenders' Choice Awards" / "nominated for <category> at the 2026 Bartenders' Choice Awards".
- 30bbi: "No. 7 on 30 Best Bars India 2025" / "listed on 30 Best Bars India 2024".
- shaker: as bca with "Shaker Awards".
- pinnacle: "awarded 2 Pins by The Pinnacle Guide in 2024" (singular "1 Pin"); when it is not the first clause it may read "2 Pins from The Pinnacle Guide (2024)" for rhythm, but pick one form and use it consistently.

Joining: two clauses "A and B."; three "A, B, and C." First letter of the line capitalised (so "listed" becomes "Listed", "winner" becomes "Winner", "No." stays).

Must render exactly:
- Bitter & Twisted Cocktail Parlour: "Listed on North America's 50 Best Bars in 2022 and awarded 2 Pins by The Pinnacle Guide in 2024."
- Little Rituals: "James Beard Award semifinalist for Outstanding Bar in 2025."
- Daisy Margarita Bar: "No. 44 on North America's 50 Best Bars 2026 and Top 10 nominee for Best New U.S. Cocktail Bar at the 2026 Spirited Awards." (plus a Pinnacle clause only if the row has one)

Update the unit tests from task 10 to the new forms. If the meta description or JSON-LD reuses this line, prefix it there with the bar name and a colon so it still stands alone off-page ("Bitter & Twisted Cocktail Parlour: Listed on ..."); on the page itself no name. Deploy, revalidate, report the commit and the rendered line for the three bars above plus Tlecān and Salmon Guru Dubai.

## Also (Roman, same screenshot): alignment
The prose line currently spans the full text column while the description below it has a narrower max-width (Bitter & Twisted at 1440: the prose wraps about 130px further right than the description). Give the accolade prose the SAME max-width as the description paragraph and the same left edge, and add a small gap below it (about 10px) so it does not sit on the description. Confirm in the screenshot at 1440 that both blocks share the same right edge.
