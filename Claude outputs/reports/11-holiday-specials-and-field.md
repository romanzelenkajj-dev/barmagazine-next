# Report: 11-holiday-specials-and-field (2026-09-15, 15:01 to 15:06 PT)

Part 1 done. Part 2 waiting on the column, as the task instructs: `specials` does not exist on public.bars yet (probe returned "column bars.specials does not exist"). Re-queue Part 2 once the migration has run.

## The row

Found by website and slug, not by name: slug `holiday`, id bd651d67-25fc-4b51-a0b0-7425fbdec63f, website https://www.holidayon7th.com/, email hello@holidayon7th.com (the owner's address in the task), claimed (owner_id set), active. ITS CITY IS AUSTIN, not Phoenix as the task says. The website, the slug, the East 7th Street address and the owner's email all agree on Austin, so the identity is settled; the "Phoenix" in the task is an error on the task side, not a second row (no Holiday in Phoenix exists). Nothing was touched on any pending edit; the hours field is unchanged.

## Part 1

Appended by id to the END of the description, after "...a covered trellis and patios.":

"Happy hour runs Tuesday to Saturday from 5pm to 6pm with half-price frozens and fries, Wednesday brings an all-day $15 burger, fries and drink deal, and Sunday is all-day half-price martinis."

Description lint after the write: 1,444 rows, 0 hits. Revalidated through the admin API; the live description on /bars/holiday ends with the sentence above (checked). An admin_notes line records the source (owner request relayed by the cloud session, hours edit declined by Roman), that the sentence moves to bars.specials once the column exists, and the Phoenix/Austin discrepancy.

## Part 2 (not started)

Waiting on `alter table public.bars add column if not exists specials text;`. When it exists, the work is: a "Specials" textarea in the owner edit form (label "Happy hour and specials", helper text as given, 240-character limit, through the same pending-edit approval, shown as its own field in the admin diff); a meta row with a tag icon under the hours row in the info card and a "Specials" line under Opening Hours in Plan Your Visit, not in the openingHours structured data; public reads include it (add to PUBLIC_EDITORIAL_COLUMNS with the neighborhood and state); not on cards; then move Holiday's specials into the field in the short form and remove the Part 1 sentence by id; tests, deploy, screenshot.

## Not done

- Part 2 in full.
- No pending edit touched.
