# City coverage wave 1: Bratislava, Atlanta, Warsaw (first run of the new programme)

Strategy doc: claude/city-coverage-program.md in the project. Short version: our value is being the answer to "best bars in <city>", not winning branded searches. 117 of our 200 city pages carry one or two bars and cannot rank. This is the first of a weekly rhythm: three cities, about ten bars each.

These three are chosen to test the method across different source landscapes: Bratislava 5 bars (Roman's own city, local knowledge available), Atlanta 4 (US mid-metro, strong local press), Warsaw 3 (European, active scene, little global award coverage).

## For each city
1. Build a candidate list of 12 to 15 cocktail-led bars from at least two INDEPENDENT local sources: city magazines and alt-weeklies, Eater or Time Out city maps, regional competition rosters (World Class heats, Bacardi Legacy national semifinals, Speed Rack), cocktail week participant lists, the Pinnacle Guide's unlisted 69, Michelin bar mentions. Record every source URL. These are admission sources, NOT accolades; do not write them into the accolades field.
2. Verify each candidate against its own site or Instagram: open and trading, cocktail-led, address, opening hours, website, handle. Anything you cannot confirm is HELD and listed, never guessed.
3. Insert the verified ones with the full wave protocol: description 90 to 120 words primary-sourced, type and subtypes (speakeasy, hotel bar, rooftop, wine bar, tiki, where they apply, because these power the city + type pages), address, hours, phone, website, Instagram, coordinates via the address-first geocoder with the 40 km guard, state column where relevant. No dashes, no food negation, US English.
4. Signature serve where the bar's own site or menu names one, since it gives the snippet something to say.
5. Write or update the city intro in city-intros.ts, 120 to 180 words, primary-source rule, naming real bars and real credentials only.
6. Check whether any type now reaches six bars in that city and confirm the city + type page generates.

## Report
Per city: bars before and after, each new bar with slug, name, address, source URL and the source that admitted it, the HELD list with reasons, the new city + type pages, and whether the city now meets the credible-guide bar: at least eight active bars, at least six with descriptions, at least three with photos, intro written.

Also: add every new bar to claude/indexing-queue.json, and produce an outreach candidate list of the new bars with verified emails for the next batch, since these owners are exactly who we want photos and claims from.

Do not send any email in this task.

## Update (Roman, 2026-09-17)
1. BRATISLAVA IS A BLIND TEST. Roman is supplying five Bratislava bars from his own local knowledge. Build your Bratislava candidate list from local sources WITHOUT asking for his list and without reference to it, then report your list first. We will compare the two afterwards to measure how much of a real local scene the press-and-competition sourcing method actually finds. That comparison decides how far we trust the method across the other 116 thin cities, so do not contaminate it.
2. Las Vegas and the other big-city head terms are dropped as targets. Do not spend any time on them. Big cities are attacked through city + type pages and, later, neighbourhood pages.
3. Speed matters. If wave 1 goes cleanly, the cadence rises to five cities a week, so build the per-city routine as something repeatable: a documented source checklist, a candidate template, and whatever script work makes the next wave faster. Say in the report what you would automate.
