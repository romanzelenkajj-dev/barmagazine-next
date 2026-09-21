# Report: 09-ownership-note-wording (2026-09-15, 14:45 to 14:49 PT)

Done and deployed: commit 1763b67.

The ownership note on claimed profiles now reads exactly, with explicit line breaks:

This listing is managed by its owner.
For ownership changes contact:
office@barmagazine.com

The email is on its own line as a mailto link; no trailing period. Nothing else from 08 changed (300px column cap, claim pill last on unclaimed bars, single-column stacking below 1100px).

Live markup on Bitter & Twisted: `This listing is managed by its owner.<br/>For ownership changes contact:<br/><a href="mailto:office@barmagazine.com">office@barmagazine.com</a>`; innerText is the three lines above, measured at three line boxes at 1440.

Screenshot: Bitter & Twisted at 1440, live, card brought to the top for the capture: three 300px buttons on the right with the three-line note beneath, the email underlined on its own line. (The capture tool returns no file path.)

Build clean; no test touches this markup.
