# Specials field, Part 2 (Roman ran `alter table public.bars add column if not exists specials text;`)

Run Part 2 of task 11 exactly as written there (reports/11-holiday-specials-and-field.md has the summary): confirm the column exists, then
- owner edit form: "Specials" textarea, label "Happy hour and specials", helper "One or two lines, for example: Happy hour Tue to Sat 5 to 6pm, half-price martinis on Sundays.", max 240 chars, through the pending-edit approval, its own field in the admin diff;
- profile: meta row with a small tag icon under the hours row, and a "Specials" line under Opening Hours in Plan Your Visit; not in openingHours JSON-LD; add to PUBLIC_EDITORIAL_COLUMNS; not on cards;
- Holiday (id bd651d67-25fc-4b51-a0b0-7425fbdec63f): set specials to "Happy hour Tue to Sat 5 to 6pm, half-price frozens and fries. Wed all day $15 burger, fries and drink. Sun all-day half-price martinis." and remove the Part 1 sentence from the description, by id; description lint; revalidate;
- Torno Subito (from task 27, if inserted): specials "Florería Atlántico residency Sept 22 to 26, 5pm to 10pm";
- tests for validation and the two render spots; standing layout rule at 390 and 1440 (only the new row/line appear); deploy; report the commit with a 390 screenshot of Holiday's card.
