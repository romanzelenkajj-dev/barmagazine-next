# Report: 08-actions-column-cap (2026-09-15, 14:36 to 14:44 PT)

Done and deployed: commit e699e8f.

1. Column cap: at 1100px and up the card grid is `minmax(0, 1fr) 300px`; the text column takes everything else, the buttons fill the 300px column and never more. Measured live at 1440: actions column 300px, every button 300px wide (was ~480px under 3fr 2fr).
2. Ownership note: exactly three lines with explicit breaks, "This listing is managed by its owner. / For ownership changes: / contact office@barmagazine.com." (mailto link kept), muted meta style, line-height 1.5. Live innerText on Bitter & Twisted and Daisy Margarita Bar is those three lines; measured at 3 line boxes at 1440.
3. Claim: back to the outlined pill (.bar-v2-btn bar-v2-btn--claim, star icon, "Is this your bar? Claim it"), the last button in the column on unclaimed bars, at the same 14px / 12px 20px as the other pills so it fills the column like them. Live on Captain Foxheart's: four buttons (Visit Website, Instagram, Get Directions, Is this your bar? Claim it), the claim pill 300px wide.
4. Below 1100px unchanged from 05: at 1000 Daisy shows the single column with four buttons in one row above the description and the three-line note under them; Bitter & Twisted three buttons in one row.

Screenshots (live, 1440, card brought to the top for the capture): Bitter & Twisted with the two tiles, prose, description and meta on the left and three 300px buttons plus the three-line note on the right; Captain Foxheart's with three buttons and the claim pill last. The capture tool returns no file paths.

Tests 304/304, build clean.
