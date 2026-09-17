# Holiday (Phoenix): add specials to the description now; build an owner "Specials" field

Context: the owner of Holiday (hello@holidayon7th.com) proposed an opening-hours edit that appended happy hour text to the hours field. Roman rejects that edit in the admin himself (hours unchanged) and approves the photo himself. Do not touch the pending edits.

## Part 1, now
Find Holiday's row by slug/city (Phoenix, website holidayon7th.com), never by name alone. Append one sentence to the END of its description, by id:
"Happy hour runs Tuesday to Saturday from 5pm to 6pm with half-price frozens and fries, Wednesday brings an all-day $15 burger, fries and drink deal, and Sunday is all-day half-price martinis."
Run the description lint, revalidate, report the live description.

## Part 2, the field
Roman is adding the column: `alter table public.bars add column if not exists specials text;`. Check the column exists first; if it does not, do Part 1, write a report saying Part 2 is waiting on the column, and stop.

When it exists:
- Owner edit form: a "Specials" textarea (label "Happy hour and specials", helper text "One or two lines, for example: Happy hour Tue to Sat 5 to 6pm, half-price martinis on Sundays."), max 240 characters, goes through the same pending-edit approval as the other fields, shown in the admin diff as its own field.
- Profile: when non-empty, render it under the hours row in the info card as a meta row with a small tag icon, and as a "Specials" line in the Plan Your Visit block under Opening Hours. Not in openingHours structured data. Public reads include it; it is not private.
- Directory cards: not shown.
- Once live, move Holiday's specials into the new field (short form: "Happy hour Tue to Sat 5 to 6pm, half-price frozens and fries. Wed all day $15 burger, fries and drink. Sun all-day half-price martinis.") and remove the sentence added in Part 1 from the description, by id.
- Tests for the form validation and the two render spots; deploy; report the commit and a screenshot of Holiday's card.
