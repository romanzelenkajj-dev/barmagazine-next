# A bar can be temporarily closed, and the directory has no way to say so

Roman found that Tayēr + Elementary is temporarily closed and will not reopen this year. Verified from the bar's own site, which reads "TEMPORARILY CLOSED DUE FIRE IN OUR BUILDING", and from the trade press on 17 September 2026: the fire was in May 2026, the Old Street bar stays shut for the rest of the year, no reopening date is set, and Alex Kratena and Monica Berg ran a six-week pop-up, Casual by Tayēr, in the basement of Cato on Mercer Street in the meantime.

`bars` has only `is_active`, a boolean. Setting it false would pull a bar that is number 5 on the World's 50 Best and number 12 on Europe's 50 Best out of the London directory, the city pages, the map and our own London Top 10, and orphan a profile that has real search demand. Leaving it true tells every visitor a burnt-out bar is open. Neither is right, and with 1,300 bars this will keep happening.

## Add a real status

A `status` column on `bars`, text, one of `open`, `temporarily_closed`, `permanently_closed`, defaulting to `open`, plus `status_note` (one sentence, shown to readers) and `status_updated_at`. `is_active` keeps its current meaning and is not repurposed.

Behaviour per status:

**temporarily_closed.** The profile stays live and carries a clear notice at the top: what happened, that there is no reopening date, and where to follow for updates. Cards carry a "Temporarily closed" pill next to the existing badges. The bar keeps its place in a curated Top 10, because that ten is our published editorial pick and Tayēr + Elementary is number 1 in the London article. Roman: "We can even keep Tayēr + Elementary, just mark that it is temporarily closed." On a Type B accolade page it sorts to the end of the pick, so those lists lead with places a reader can go tonight. It is excluded from outreach and from "near me" suggestions. Accolades, badges and the profile's own content are untouched, because the bar did not stop being a 50 Best bar.

**permanently_closed.** Profile stays live with a permanent notice, dropped from every list, kept out of the sitemap, excluded from outreach. This replaces deleting the row, which loses the URL and any links pointing at it.

**open.** Exactly today's behaviour.

## Then set the one we know about

Tayēr + Elementary to `temporarily_closed`, with a note along the lines of: closed since a fire in the building in May 2026, no reopening date announced, the team has been running pop-ups in the meantime. Cite the bar's own site as the source in `admin_notes`. It is already parked in `outreach/parked.txt`.

## Why this is worth building rather than a one-off edit

"Is Tayēr + Elementary open" is a question their own site answers with five words and no date. We can answer it properly, with the reason, the year, and what the team is doing instead. That is the kind of query where a directory beats the venue's own site, and it applies to every closed or reopening bar we list.

## Guards

Standing layout rule: the notice and the pill are new elements, everything else on the profile and the cards stays identical at 390px and 1440px. The status is never written into `accolades` and never changes a bar's accolade score. Do not deactivate the row.

## Report

The migration, the fields, where the notice and pill render, the before and after of `/bars/tayer-elementary` and `/best-bars/london` at both widths, and a check that no send script can pick up a bar whose status is not `open`.

Then one number: how many of the 96 currently inactive bars were deactivated because they closed rather than for some other reason, and would be better carried as `permanently_closed` with a live page.
