# Report: 07-pinnacle-guide-build (2026-09-15, 14:28 to 14:36 PT)

Done and deployed: commit f161099 (Ready 14:30 PT). 108 rows written. Article mentions regenerated: 11 pairs added, 0 removed, allowlists untouched.

## Build (as decided)

- src/lib/accolades.ts: org key `pinnacle` ("The Pinnacle Guide") in TILES. Small line is the grade from the entry's title ("1 PIN" / "2 PINS" / "3 PINS", via a new per-entry `regionFor` on TileDef), bold line the constant "PINNACLE", year line the announcement year. Tiers `green` (solid #1F4D3A, white text) for kind winner (2 and 3 Pins) and `green-outline` (white, green border and text) for kind nominee (1 Pin). Hover and aria carry "The Pinnacle Guide 2024 — 2 Pins — <source url>" through the existing tile title. isRenderable accepts the key by virtue of the TILES whitelist.
- src/app/globals.css: .acc-tile--green and .acc-tile--green-outline; main line at 9.5px / 0.03em on those tiers so "PINNACLE" sits inside the 72px box.
- src/lib/accolade-sentences.ts: a `pinnacle` branch: "The Pinnacle Guide awarded it 2 Pins in 2024." (singular "1 Pin"; two grades in different years join as "1 Pin in 2024 and 2 Pins in 2026"). Subject "The Pinnacle Guide".
- Scoring: 3 Pins 600, 2 Pins 570, 1 Pin 540, minus 12 per year before 2026 (Bitter & Twisted, 2024 2-Pin: 546; Little Rituals, 2024 1-Pin: 516).
- Entry shape: `{org: 'The Pinnacle Guide', org_key: 'pinnacle', kind: winner|nominee, year: <announcement year>, title: '2 Pins', score, source: <the bar's page on thepinnacleguide.com>, basis: 'announcement year: ...'}`. The `basis` note records why the year is the publish date.
- claude/accolades-badges-spec.md: The Pinnacle Guide added to the Pass table (with the two partial criteria and the announcement-year rule recorded) and a section for the tile, colours, scoring and prose.
- Tests: 4 new (tile lines, tiers, hover, sentence); 304 pass. Build clean.

## Rows written: 108, by id, through the admin API

99 automatic matches from claude/pinnacle-guide-match.json plus the 9 by-eye matches from reports/04 (champagne-bar-at-four-seasons-surf-club 3 Pins 2026, nightjar 2 Pins 2024, origin-bar 2 Pins 2024, sexy-fish London 2 Pins 2024, gus-sip-dip 1 Pin 2026, cinquanta-spirito-italiano 1 Pin 2025, dr-stravinsky 1 Pin 2024, death-and-co-dc 1 Pin 2026, soma 1 Pin 2025). By grade: 4 three-Pin, 38 two-Pin, 66 one-Pin. None of the ambiguous set was written. Every write appended to the row's existing accolades; no row had a pinnacle entry before; 108 rows carry one now.

## Checks

- Bitter & Twisted (224d12aa): live tile `2 PINS / PINNACLE / 2024` in solid green beside its N. America's 50 Best 2022 tile; prose "The Pinnacle Guide awarded it 2 Pins in 2024. North America's 50 Best Bars listed it in 2022."; hover "The Pinnacle Guide 2024 — 2 Pins — https://www.thepinnacleguide.com/bitter-twisted/".
- Lyaness: `3 PINS / PINNACLE / 2024` solid. Line: `3 PINS / PINNACLE / 2026` solid beside World's 50 Best 2025 and Europe's 50 Best 2026. Kumiko: the 3 Pins entry (600) is HELD BACK by the top-three rule behind North America's 50 Best 2026, the Spirited Awards 2025 win (761) and World's 50 Best 2025; the prose still says "The Pinnacle Guide awarded it 3 Pins in 2026." That is the rule as specified, not a defect.
- Little Rituals: `1 PIN / PINNACLE / 2024` outline beside its Spirited Awards 2025 win; prose "...The Pinnacle Guide awarded it 1 Pin in 2024."
- A bar with 50 Best + Spirited + Pinnacle: Line (above) shows three tiles in score order; Paradiso shows World's 50 Best 2025, Europe's 50 Best 2026, Pinnacle 2024. Handshake's 2026 2-Pin (570) sits behind three higher scores and is prose-only.
- Dedupe: every active row's face computed with the one-tile-per-org-year rule: 0 org-year repeats, 0 faces over three tiles; 98 rows show a Pinnacle tile, 10 carry one behind the top-three cut.
- Sitemap: 1,348 profiles = 1,348 active rows.

## Article mentions

Regenerated with the same rule and allowlists (confirmed-pairs and excluded files byte-identical before and after): 1,010 -> 1,021 pairs, the 11 from reports/03 added, 0 removed; 26 held (up from 24, both new generic-name holds in claude/article-mentions-held.md).

## Screenshots

Live after deploy at 1180px, card brought to the top for the capture. Bitter & Twisted: N. America's 50 Best 2022 tile and the green 2 PINS / PINNACLE / 2024 tile under the place line, the Pinnacle sentence leading the prose, actions stacked on the right. Little Rituals: the orange Spirited 2025 tile and the green-outline 1 PIN / PINNACLE / 2024 tile, both sentences in the prose. (The capture tool returns no file paths.)

## Not done

- The 69 pinned bars with no row remain an admission list for a later wave (reports/04).
- The two inactive Hong Kong rows and the 15 ambiguous name hits are untouched.
