# Report: 33-specials-field-part2 (2026-09-16, 15:42 to 15:55 PT)

Done and deployed: commit 89d88ce (changelog a0518e5), live 75 s after the push. Column confirmed: `select specials from bars where id = bd651d67...` returned null (no error) before the work started.

## What was built

- Data model: `specials?: string | null` on the Bar type; `specials` in OWNER_EDITABLE_FIELDS (so filterOwnerFields, buildOwnerBarUpdate and the admin approval path carry it), in normalize's trimmed fields, and in PUBLIC_EDITORIAL_COLUMNS so public reads include it. Two helpers in owner-fields.ts: `formatSpecials` (collapses whitespace to one line, null when empty) and `specialsProblem` (text only, 240 characters at most, SPECIALS_MAX).
- Owner edit form (src/app/owner-dashboard/edit/[slug]): a "Specials" section after Opening hours with a two-row textarea labelled "Happy hour and specials", maxLength 240, the helper "One or two lines, for example: Happy hour Tue to Sat 5 to 6pm, half-price martinis on Sundays." plus a live character count. It goes through the same PUT and the same pending-edit approval; /api/owner/bars rejects a value over 240 with a 400 and stores the one-line form.
- Admin review: the diff already lists every approved key; "Specials" added to the field labels so it shows as its own row.
- Profile: a meta row with a small tag icon directly under the hours row in the info card, and a "Specials" block under Opening hours in Plan Your Visit, both only when the value is non-empty. Not in the openingHours JSON-LD (checked: the structured data on Holiday does not contain the text). Not on any card (the directory card, the nearby card, the Top 10 card and the article card do not read the column).
- Tests: three new cases in owner-fields.test.ts (owner-editable, formatting, the 240 cap and type check). Suite 326/326.

## Data (by id, through the admin API)

- Holiday (bd651d67-25fc-4b51-a0b0-7425fbdec63f): specials = "Happy hour Tue to Sat 5 to 6pm, half-price frozens and fries. Wed all day $15 burger, fries and drink. Sun all-day half-price martinis." The Part 1 sentence ("Happy hour runs Tuesday to Saturday from 5pm to 6pm ... all-day half-price martinis.") removed from the description, which now ends "a covered trellis and patios." Description lint after the write: 1456 rows, 0 hits. Revalidated by the update path; the live description already showed the trimmed text before the deploy.
- Torno Subito (ea1e68d6-f1fa-44ee-b71b-eb6312153090): specials = "Florería Atlántico residency Sept 22 to 26, 5pm to 10pm".

## Standing layout rule, Holiday (before = live, after = local build), px

390: meta rows block 108 tall to 204 (the new row is 84 tall, four lines of the long Holiday text); info card 810 to 906 (+96 = the row plus its 12px gap); Plan Your Visit 296 to 429 (+133: the Specials block in the visit grid, which stacks on phones). Every other element (name, place, tile, prose, description, the four existing meta rows, the buttons) at the same coordinates until the new row.
1440: meta rows 54 to 108 (the new row 42 tall, two lines); card 423 to 477; Plan Your Visit 255 to 301 (the Specials block joins the grid row). Nothing else moved.

## Live

Holiday: the tag meta row and the Specials block in Plan Your Visit render; the structured data does not contain the text. Torno Subito: the residency line renders in its meta row.

## Screenshot

Holiday's info card at 390 after the change: name, place, the Spirited tile, the credentials line, the trimmed description, then the meta rows: address, website and Instagram, the clock row with the hours, and the new tag row with the specials text, followed by the buttons. The capture tool returns no file path.
