# Profile info card: move the ownership note to the bottom of the card

Roman's screenshots. Captain Foxheart's (unclaimed, desktop): the card's right column holds "Visit Website" and "Is this your bar? Claim it", stays narrow, layout is fine. Daisy Margarita Bar (claimed): the right column also holds the one-line note "This listing is managed by its owner. Ownership changes: contact office@barmagazine.com." The column is content-sized, so that sentence widens it to about half the card; at ~1000px the text column becomes a 30-character strip and the name wraps to three lines.

Roman's decision: move the note, do not redesign the columns.
1. Remove the ownership note from the actions column. The column then holds only the buttons (Visit Website, and Claim it when unclaimed), as on Captain Foxheart's today.
2. Render the note as the last line of the card, below the address/website/IG/phone/hours rows, full width, in the same small muted meta style, with a hairline above it. Only for claimed bars; unclaimed bars show nothing extra there (their Claim button is already in the column).
3. Cap the actions column at the width the Claim button needs so it can never be stretched by content again.
4. Below about 900px viewport, if the card still collapses to one column as it does now, keep that behaviour; do not add new breakpoints.

Test at 390, 1000 and 1440px on Daisy Margarita Bar (claimed) and Captain Foxheart's (unclaimed). Confirm Captain Foxheart's desktop layout is visually unchanged and Daisy's text column at 1000px is as wide as Captain Foxheart's. Deploy and report the commit with screenshots of Daisy at 1000 and 1440.
