# Profile card spacing: desktop, and the gap to Plan Your Visit (not covered by 11a's report)

Roman, after 11a: the space between the bottom of the info card and the Plan Your Visit block is still much bigger than before task 05, and on desktop the spacing inside the card (name, place line, tiles, prose, description) is still larger than before.

Note: .bar-v2-visit margin-top is 2.5rem both before and after 05, so the extra height is inside the card's bottom (the actions block, the note, margins that no longer collapse in the grid, or empty grid rows), not the rule between the boxes.

Do this measured, at 390 and 1440, on Bitter & Twisted (claimed, 1 tile) and Captain Foxheart's (unclaimed, no tiles):
1. Render the pre-05 commit (04d541f^) locally and the current live build. Measure, in px: H1 -> place line, place -> tiles, tiles -> prose (or -> description when no tiles), prose -> description, description -> meta rows, meta rows -> card bottom edge, card bottom edge -> Plan Your Visit top edge. Put both columns of numbers in the report.
2. Make the current build match the pre-05 numbers exactly at both widths, except: the desktop actions column (300px, from 08/09), the three-line note (09), and the mobile stacked buttons (11a) stay. If the grid's non-collapsing margins are the cause on desktop, set the margins explicitly on the grid children so the visual gaps equal the pre-05 values; if the actions block adds height at the card bottom on desktop, it must not (it sits in the right column; its height must not push the card taller than the text column unless it is genuinely taller).
3. Nothing else changes. Standing layout rule: report the before/after diff and confirm no other difference.

Deploy and report the commit with the two tables and screenshots at 1440 (Bitter & Twisted) and 390 (Captain Foxheart's).

## Also (Roman, mobile screenshot of Holiday): gap between the "Get your bar featured" block and "Nearby in Austin"
At 390 the space between the bottom of the dark Get Featured CTA and the "Nearby in <city>" heading is far larger than the other block gaps on the page (the nearby section carries a large top margin that made sense when it sat elsewhere; after task 14 the CTA sits directly above it). Make that gap equal to the standard block gap used between the other page sections on mobile (the same as map -> CTA in the same screenshot), on desktop too if it is larger there. Measure and report before/after px at 390 and 1440.
