# Pinnacle Guide: build the tile and write the 108 rows (Roman's go, 2026-09-15)

Roman decided on the four points from reports/04-pinnacle-guide-accolade.md:

1. Year: use the announcement year (the date the Pin was announced). The saved list already carries it.
2. Tile (Option A, mocked and approved): region line = Pin count ("1 PIN" / "2 PINS" / "3 PINS"), main line constant "PINNACLE", year line as usual. New tier colour forest green: solid `#1F4D3A` background with white text for 2 and 3 Pins, outline (white background, `#1F4D3A` border and text) for 1 Pin. Main line at 9.5px / 0.03em like the jbf tiles so "PINNACLE" fits the 72px content box. Hover/title keeps the full name "The Pinnacle Guide 2024 — 2 Pins — <source url>".
3. Scoring: 3 Pins 600, 2 Pins 570, 1 Pin 540, minus 12 per year before 2026.
4. Write the 9 by-eye matches as well as the 99 automatic ones (108 rows total). Do not write any of the ambiguous set.

Build:
- `pinnacle` ("The Pinnacle Guide") in TILES in src/lib/accolades.ts, whitelist, isRenderable, tier keys `green` / `green-outline` in globals.css, prose branch in accolade-sentences.ts: "The Pinnacle Guide awarded it 2 Pins in 2024." (singular "1 Pin").
- Pin count in `title` ("2 Pins"), kind `winner` for 2 and 3 Pins, `nominee` for 1 Pin (that is what drives outline vs solid), year = announcement year, source = the bar's Pinnacle page URL.
- Write the 108 entries by id through the admin API from claude/pinnacle-guide-match.json plus the 9 listed in the report. One tile per org per year as now.
- Update claude/accolades-system.md (or the spec file the repo uses) with the org, tier colour, scoring and the announcement-year rule.

Checks: Bitter & Twisted (id 224d12aa-0eb9-4316-9a21-b731e78a5131) shows the tile and sentence live; Kumiko, Line and Lyaness show 3 Pins solid; a 1 Pin bar shows the outline; a bar with 50 Best + Spirited + Pinnacle still shows at most three tiles in score order; dedupe check, sitemap count check, tests, deploy. Report commit, row count written, and screenshots of Bitter & Twisted and one 1 Pin profile.

Also in this task: regenerate the article mentions so the 11 new pairs from reports/03 are added (Roman approved). Confirm 0 removed, 11 added, and that the allowlists are untouched.
