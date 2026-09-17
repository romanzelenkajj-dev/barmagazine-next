# Bar profile titles and meta descriptions: rewrite for the branded search (Roman approved)

## Why
GSC, last 7 days: bar profiles are 594 pages, 9,712 impressions, 35 clicks, 0.36% CTR. Articles run 1.50%, best-bars city guides 2.64%. 65 pages sit at position 5 to 15 with about 5,000 impressions between them and ZERO clicks, for example /bars/bar-benjamin 234 impressions at 9.5, /bars/string-s-bar 220 at 9.0, /bars/fix-me-a-drink 191 at 7.6, /bars/beogradski-koktel-klub 123 at 6.3, /bars/knock-on-wood 87 at 5.6.

These are branded searches: the person typed the bar's name. We rank on page one and they click something else, because the current title is `${bar.name} | ${type} in ${cityLabel}` (src/app/bars/[slug]/page.tsx, generateMetadata, line ~54) and the description is the profile description, which usually opens with history or prose. Google's own panel already gives them hours and a map, so our snippet offers nothing they want.

## What to build
Rewrite the title and meta description for bar profiles so the snippet answers the query. Keep the H1 and the page itself unchanged; this is metadata only.

Title, about 55 to 60 characters, brand last so it truncates gracefully:
`<Bar name>, <City> | Address, Hours & Drinks | BarMagazine`
Drop the city when it is already in the name. For bars with a top accolade, prefer the credential over the generic phrase when it fits, for example `Connaught Bar, London | No. 1 on World's 50 Best | BarMagazine`. Decide the rule in code, do not hand-write 1,360 titles: accolade variant when a whitelisted accolade exists, otherwise the address-hours-drinks variant.

Meta description, 150 to 160 characters, assembled from structured fields in this order, skipping what is missing:
street address, then opening hours in short form (for example "Open Tue to Sun, 6pm to 2am"), then one distinguishing fact: the strongest accolade phrased as the credentials line already does, or the signature serve, or the neighborhood. End with nothing promotional. No dashes. Never invent a fact; if a field is absent, leave it out and let the sentence be shorter.

Rules that stay: US English, no em or en dashes, no claim that a bar has no food, nothing unverified, and the description on the page itself is not touched.

## Checks
- Write the 65 zero-click pages listed in GSC into a file before deploying, with their current title and description, then after, so the change is measurable. Record today's clicks, impressions and CTR for that set from the CSV Roman exported so we can compare in two weeks.
- Verify the served HTML for 10 profiles of different shapes: with and without accolades, with and without hours, a long name, a name that already contains the city, a bar with no address, one US and one non-US.
- Confirm title length stays under 60 characters and description under 160 in all 10, and that no page ends up with a dangling comma or a double space.
- Structured data, canonical, OpenGraph and Twitter tags keep working; OG title may stay as it is if changing it risks the social card.
- Run the description lint and the full test suite; deploy; report the commit and the before and after table for the 10 samples.

Do not touch article or city page metadata in this task.
