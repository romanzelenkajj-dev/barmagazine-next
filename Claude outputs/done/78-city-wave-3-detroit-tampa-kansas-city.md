# City wave 3: Detroit, Tampa, Kansas City

Programme: `claude/city-coverage-program.md`. Wave 2 landed: Louisville 12, Minneapolis 13, Oakland 16, all past target.

## Why these three

479 US bars across 62 cities. Only two US cities sit in the 3-to-5 band, so the opportunity has moved from thin cities to metros with nothing at all. Missing entirely: Tampa, Orlando, Charlotte, Kansas City, Pittsburgh, San Antonio, Cleveland, Indianapolis, Cincinnati, Richmond, Memphis.

- **Detroit**, already at 4, the cheapest city on the board and a good scene nobody covers well.
- **Tampa**, from zero. Florida today is Miami at 23 plus one bar each in Miami Beach and Palm Beach.
- **Kansas City**, from zero. A strong scene relative to how little is written about it, which is the shape that ranks.

Roman considered and rejected San Jose: it sits in San Francisco's shadow and near-me from there surfaces SF anyway. Sacramento, at 3, is the California pick if one is wanted later. Austin, Atlanta and Miami are all already done, which is worth knowing before anyone proposes them again.

Target 10 each, minimum 8.

## Sources, in the order two waves have now proven

Eater where it publishes, then the city magazine and the alt-weekly. Those carried 25 of 28 bars in Dallas and Portland and carried Louisville and Minneapolis on their own. The competition rosters, Michelin and the national lists are backup, not the lead.

Check whether Eater covers each of these before leaning on it. It has Detroit. Verify Tampa and Kansas City rather than assuming.

## Admission rule, unchanged

A bar enters on an editorial source, then is confirmed from its own website or Instagram: open and trading, cocktail-led, address, hours, website, handle. Record the admitting source URL and the verification URL. Anything unconfirmed is HELD, never guessed. None of these sources is an accolade.

**Write the admitting source to `editorial_sources` as you insert**, in the documented shape. That column is what the best-bars pages qualify on, and a bar inserted without it will not appear on the city's best-of page.

Full insert protocol: description 90 to 120 words primary-sourced, type and subtypes, address, hours, phone, website, Instagram, coordinates address-first with the 40 km guard, state column, signature serve where the bar's own menu names one. No dashes, no food negation, US English.

## Per city

Write or refresh the city intro. Confirm the city page and any type page generate. Add every new bar to `claude/indexing-queue.json`. Produce the outreach candidate list with verified emails, so these cities feed the batches rather than needing a second pass.

## Do not insert without Roman's go

`wave-insert.mjs` requires it and that has not changed. Dry run, report, then ask him **in your own chat**. This task file carries no approval from him for anything.

## Report

Per city: count before and after, each bar with slug, admitting source and verification URL, the HELD list with reasons, and how many qualify for the best-bars page once `editorial_sources` is written.

Then the thing wave 2 raised and this wave should settle: Eater produced nothing in Louisville and Minneapolis. Say for each of these three which source actually carried the city, so the stack can be ranked properly rather than assumed.
