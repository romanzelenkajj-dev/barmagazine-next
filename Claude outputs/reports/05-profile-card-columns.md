# Report: 05-profile-card-columns (2026-09-15, 14:14 to 14:27 PT)

Done and deployed: commit 04d541f (Ready 14:23 PT).

## The layout

The card is now ONE CSS grid whose children sit in reading order: name, place line, accolade tiles, accolade prose, actions block, description, meta rows. That order is the layout below 1100px; at 1100px and up the CSS lifts the actions block into a right column spanning the rows (grid-template-columns 3fr 2fr, so 60/40 of the content width), and the text column keeps the rest. The old two-column flex that gave the right column half the card for one button is gone, and so is the .bar-v2-info-main wrapper on the profile page (bars-preview still uses it; a small rule keeps it valid there).

1. Wide (>= 1100px): text 60%, actions 40%, the actions stacked full-width in the same pill style as Plan Your Visit: Read the BarMagazine Feature (when there is one), Reserve a Table (when a reservation URL or WhatsApp exists; the old isPaid gate is gone, per the task), Visit Website, View Menu (when a menu URL exists), Instagram, Call (phone), Get Directions (lat/lng, else the address). Ownership note or claim prompt under the buttons in the muted meta style.
2. Below 1100px: single column, the actions as a wrapping row directly under the tiles and prose, before the description; note under the row.
3. Phones (<= 640px): buttons two per row at most (border-box 50% basis; the site is content-box, so the first cut fell to one per row until that was set).
4. Description, tiles and meta rows untouched; the meta rows stay in the text column for crawlers and copy-paste.

One judgment call, flagged: the claim prompt used to be an outlined pill button; the task put it in the muted meta style under the buttons, which is how it renders now ("Is this your bar? Claim it", the link underlined). That is a demotion of the claim call to action; reverting to the pill is a one-line change if Roman prefers.

## Tests (dev server with the viewport emulated at each width, then live after deploy)

Daisy Margarita Bar (claimed, photo, 2 tiles): 390 single column, buttons two per row, note "This listing is managed by its owner"; 768 and 1024 single column, four buttons in one row above the description, name on one line; 1180 and 1440 two columns, text 51 to 53% of the card box (60% of the content width after padding and gap), actions 34 to 35%, buttons stacked, note beneath.
Inside Passage (no photo, no tiles, reservation and phone): 1024 single column, five buttons in one row (Reserve, Website, Instagram, Call, Directions), claim prompt.
Techo (no website, no phone): 390 two buttons only (Instagram, Get Directions), two per row, no empty button, claim prompt; the long name wraps to two lines in the H1 as it should.
The Snug (unclaimed): 1440 live, two columns, three buttons stacked, claim prompt instead of the ownership note.
Every measured page: zero buttons without an href.

## Screenshots

Live after deploy, card brought to the top of the page in the browser only for the capture. 1440: name and place left, two tiles, prose, description and meta rows in the left 60%; Visit Website, Instagram, Call, Get Directions stacked in the right 40% with the ownership note beneath. 1024: single column, tiles, prose, the four buttons in one row, the ownership note, then the description and meta rows. The capture tool returns no file paths; the live page shows the same.

## Not done

Nothing outstanding. The old .bar-v2-btn--claim style remains in the CSS unused, in case the pill comes back.
