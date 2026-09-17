# URGENT: phone layout of the profile card is wrong since task 05

Roman's iPhone screenshot (Junebug, New Orleans, 390px): the card now shows name, place, tile, accolade prose, then the three buttons (Visit Website, Instagram, Get Directions) and the three-line ownership note, and only THEN the description. Task 05 put the actions row "before the description" on narrow screens; that was my mistake, it breaks the reading order on phones and the note lands in the middle of the card.

Fix, on every viewport below the two-column breakpoint (1100px):
1. Order: name, place line, accolade tiles, accolade prose, description, meta rows (address, website, IG, phone, hours), then the buttons, then the ownership note or the Claim button. That is, the actions block goes to the END of the card, after the meta rows, where it was before 05.
2. Buttons on phones: full width, one per row, in the same pill style (not two per row; the two-per-row grid with a lone third button looks broken).
3. Ownership note stays the three lines under the buttons, or the Claim pill on unclaimed bars.
4. Desktop (>= 1100px) unchanged from tasks 08 and 09.

Test at 390 and 768 on Junebug (claimed, 3 buttons, no photo), Captain Foxheart's (unclaimed), Daisy Margarita Bar. Deploy and report the commit with a 390px screenshot of Junebug showing the whole card.

## Roman, verbatim
"Make it back to the way it was on mobile before. With the buttons at the bottom. wider and underneath each other." Restore the pre-05 mobile card exactly (git show the profile page and CSS from before commit 04d541f for the mobile rules and reuse them), with only the three-line note wording from 09 kept. Before deploying, compare a 390px screenshot of Junebug against the same page rendered from the pre-05 commit and list any pixel difference other than the note wording; if there is one, fix it first.

## Also: vertical spacing (Roman, second screenshot pair)
Compared on iPhone: Bitter & Twisted before task 05 vs Holiday now. The gaps between the H1, the place line, the accolade tile, the prose line and the description are all visibly larger now (the grid gap from 05). Restore the pre-05 spacing exactly on phones: same margins between name, place line, tiles, prose and description as in the pre-05 commit. Include those measurements (before/after, in px at 390) in the report.

## Also: desktop spacing (Roman)
The same vertical spacing growth is on desktop: the gaps between H1, place line, tiles, prose and description are larger than before 05. Restore the pre-05 spacing at 1440px as well (same margins as the pre-05 commit), keeping the 300px actions column from 08/09. Before/after px in the report at 1440 too.

## Also: gap between the info card and Plan Your Visit (Roman)
The space between the bottom of the white info card and the dark Plan Your Visit block below it is larger than before 05. Restore the pre-05 gap on both phone and desktop (measure it in the pre-05 commit and match it). Include the px in the report.
