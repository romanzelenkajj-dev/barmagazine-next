# The admission rule

Standing rule from Roman, 2026-09-14.

## The test is about venue TYPE, not quality

We admit **cocktail-led rooms**. The test excludes nightclubs and pure
restaurants because of what they *are*, not because of how good they are.

### Wine bars ARE admitted (Roman, 2026-09-17)

An earlier version of this line listed wine bars among the exclusions. That
was wrong and it cost us a listing before it was caught: NUDA in Bratislava
was held on 2026-09-17 as "a wine bar rather than a cocktail-led room", and
has since been inserted.

- **In:** wine bars, listed with the **Wine Bar** subtype.
- **Out:** breweries; distillery taprooms that are not cocktail bars; coffee
  bars.

A venue that leads on coffee and closes in the early evening is a cafe, and
stays out, even when it pours cocktails. A venue that leads on wine and keeps
bar hours is a wine bar, and goes in.

**It is not a quality bar.** We do not remove or refuse a bar for being
insufficiently prestigious. Great bars belong in the directory whether or
not they hold awards, and an absence of 50 Best or Spirited recognition is
not a mark against a venue. A bar with no accolades at all is a perfectly
normal listing.

## Removing a listed venue is a last resort

Delisting is not the default remedy for an imperfect record. A famous room
that readers search for **stays listed with an honest description** rather
than being delisted. If a venue is really a restaurant that also has a
good bar, the answer is usually a truthful description and the right type
and subtypes, not removal.

Genuine reasons to deactivate remain: a venue has closed, a row is a
duplicate of another (see the merge standard), or the venue's own sources
cannot confirm it currently trades.

## What this corrected

Applying the rule as a quality filter in September 2026 produced two
mistakes, both since reversed:

- **zuma-london** was deactivated on the admission test and has been
  reactivated. It is open and trading, and readers search for it.
- **Zuma Hong Kong** was refused on the same reading and has since been
  inserted.

The reasoning that produced both errors was that the venue's own page
leads with dining and names no bar lead. Under this rule that is an
argument about how to DESCRIBE the venue honestly, not grounds to withhold
or remove it.

## Descriptions

A venue admitted this way needs a real description rather than the composed
fallback, and the description carries the honesty: say what the room
actually is. Do not invent a bartender name, do not claim a list of any
particular size, and keep award rankings in the past tense unless a current
listing is confirmed.

**Never say a bar has no kitchen or serves no food** (Roman, 2026-09-15).
If the venue says so itself, we simply do not mention food. Bars are
licensed on food sales in many US states, and the sentence can create a
problem for the owner: Friends of Friends flagged "the bar keeps no kitchen
on site" against the Illinois Liquor Commission the day this rule was
written. Where the venue publishes what it does serve, say that instead
(Bastion's Big Bar "serves nachos of its own", from its FAQ); where it
publishes nothing, leave food out. The phrases from the sweep that found
the three rows (no kitchen, no food, serves no food, without a kitchen,
nothing to eat, drinks-only, not a dining room, and variants) live in
`scripts/description-lint.mjs`, which runs as `npm run audit:descriptions`
after every wave and fails on any hit. Two rows were left by decision and
are allowlisted there against their exact phrase: momus (Madrid) and
bar-us (Bangkok).
