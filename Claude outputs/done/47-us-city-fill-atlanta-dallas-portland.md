# US city fill, round 1: Atlanta, Dallas, Portland OR (proving the US sourcing method)

Programme: claude/city-coverage-program.md. Goal for every thin city is 6 to 10 verified bars, not 2. The US has no Falstaff equivalent, so this task also tests whether the source stack below produces enough.

Current counts: Atlanta 4, Dallas 3, Portland OR 2. Target 10 each.

## Source stack, in this order
1. Eater city map for the metro, "best cocktail bars in <city>". Editorial, admission only.
2. City magazine and alt-weekly best-of lists: Atlanta Magazine and Atlanta Eater, D Magazine and Dallas Observer, Willamette Week and Portland Monthly and Eater Portland.
3. Competition rosters, which reach bars editors miss: Speed Rack regionals, Diageo World Class US regional heats, Bacardi Legacy US, the local USBG chapter.
4. Michelin Guide where the metro is covered (Atlanta, Texas), for restaurant bars.
5. Punch, Imbibe 75 and Esquire's best bars, for anything the above missed.
6. Tales of the Cocktail Spirited Awards regional Top 10 and James Beard Outstanding Bar semifinalists for that state, if not already in the directory.

## Admission rule
A bar enters only if it appears on at least one of those sources AND is then confirmed from its own website or Instagram: open and trading, cocktail-led, address, hours, website, handle. Record the admitting source URL and the verification URL for every bar. Anything you cannot confirm is HELD, never guessed. Do not admit a bar on a Google or Yelp listing alone.

None of these sources is an accolade. Do not write any accolade from them. A real Spirited or James Beard placement is a separate fact with its own verification.

## Insert with the full protocol
Description 90 to 120 words primary-sourced, type and subtypes (speakeasy, hotel bar, rooftop, wine bar, tiki), address, hours, phone, website, Instagram, coordinates address-first with the 40 km guard, state column, signature serve where the bar's own menu names one. No dashes, no food negation, US English.

## Per city, finish the job
Write or refresh the city intro in city-intros.ts. Check whether any type now reaches six bars and confirm the city + type page generates. Add every new bar to claude/indexing-queue.json. Produce an outreach candidate list of the new bars with verified emails.

## Report
Per city: count before and after, each bar with slug, name, address, admitting source and verification URL, the HELD list with reasons, new city + type pages, and whether the city now meets the credible-guide bar of at least eight bars, six with descriptions, three with photos, intro written.

Then the thing that decides the next 100 cities: which of the six sources actually produced, how many bars each contributed uniquely, and how long the city took. Say plainly whether this stack can fill a US city to ten, and what you would automate to make the next one faster.
