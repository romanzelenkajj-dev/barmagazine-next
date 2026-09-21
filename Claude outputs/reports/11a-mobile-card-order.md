# Report: 11a-mobile-card-order (2026-09-15, 15:22 to 15:33 PT)

Done and deployed: commit 5f9b537. Tests 309/309.

## What was wrong, and the cause of both complaints

Task 05 made the card a CSS grid with the actions block placed in DOM order right after the tiles and prose, so on phones the buttons and the note sat between the prose and the description. The same grid also widened every vertical gap: grid items keep BOTH neighbours' margins, while block flow (the pre-05 card) collapses them to the larger one. Measured on Junebug at 390 before the fix: name to place 14px, place to tiles 29, tiles to prose 28, description to meta rows 20.

## The fix

- Markup (src/app/bars/[slug]/page.tsx): the actions block moved to the END of the card, after the meta rows. Desktop placement does not depend on DOM order (the block is lifted into the right column by grid placement), so nothing changes there.
- CSS (src/app/globals.css): below 1100px the card is `display: block` again, the pre-05 flow (name, place, tiles, prose, description, meta rows, then the actions with the pre-05 1.5rem gap above them). At 1100px and up it is the grid from 08/09 (text column plus a 300px actions column). On phones (640px and below) the actions stack, every button full width; on tablets (641 to 1099) they wrap in a row after the meta rows.
- The three-line note from 09 and the claim pill from 08 are unchanged.

## Measurements at 390, Junebug (before = live under 05/08, after = live now)

- name to place line: 14 -> 8
- place line to tiles: 29 -> 15
- tiles to prose: 28 -> 18
- prose to description: 14 (to the actions) -> 10 (the gap task 12 asked for)
- description to meta rows: 20 -> 20
- meta rows to buttons: (buttons were above) -> 24
- order after: h1, place, tiles, prose, description, details, actions (before: h1, place, tiles, prose, actions, description, details)
- buttons: 328px wide each, the card's full inner width, one per row (Visit Website, Instagram, Get Directions); note the three lines beneath.
The "after" numbers are the pre-05 values by construction: the same elements with the same margins in the same block flow the pre-05 card used; the grid was the only thing between them. I did not render the pre-05 commit for a pixel diff; the flow model is identical and the margins are unchanged in git, so the only intended difference from pre-05 on phones is the button stacking Roman asked for (pre-05 wrapped the buttons in a row) and the 09 note wording.

## Other checks (live)

- Captain Foxheart's, 390: order h1, place, description, meta rows, actions; four buttons one per row, the claim pill last.
- Daisy Margarita Bar, 390: full order with tiles and prose, four buttons one per row, the three-line note.
- Junebug, 768: block flow, actions after the meta rows, three buttons in one row.
- Junebug, 1440: grid, two columns, actions in a 300px column aligned with the H1, buttons 300px: unchanged from 08/09.

## Screenshot

Junebug at 390, live, card brought to the top for the capture: place line, the Spirited 2026 tile, the credentials line, the description, the four meta rows, then Visit Website and Instagram as full-width pills with Get Directions and the note below the fold of the capture. The capture tool returns no file path.
