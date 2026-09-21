# City wave 2: the US cities sitting on one or two bars

Programme: `claude/city-coverage-program.md`. Today's run proved the method. Dallas went 3 to 14 and Portland Oregon 2 to 19, and Atlanta was already there. Task 47's report settled the source question too: Eater city maps and city magazines produced 25 of the 28 bars, and the other four sources produced two between them. Lead with those two and treat the rest as backup.

## Where the directory stands tonight

218 cities. 132 carry one or two bars, 15 carry three to five, 71 carry six or more. **39 of the one-and-two cities are in the US**, which is our stated priority.

Among them: Louisville, Minneapolis, Oakland, Columbus, Albuquerque, Lafayette, Beverly Hills. Louisville and Minneapolis are the obvious first two, both real cocktail cities with a single listing.

## This wave

Three cities, in this order: **Louisville, Minneapolis, Oakland.** Target 10 each, minimum 8.

Same admission rule as task 47. A bar enters only on an editorial source, then confirmed from its own website or Instagram: open and trading, cocktail-led, address, hours, website, handle. Record the admitting source URL and the verification URL. Anything unconfirmed is HELD, never guessed. None of these sources is an accolade.

Now that `editorial_sources` exists, **write the admitting source to that column as you insert**, in the documented `{source, url, note, year}` shape. Do not leave it in the report only. That column is what the best-bars pages qualify on.

Full insert protocol: description 90 to 120 words primary-sourced, type and subtypes, address, hours, phone, website, Instagram, coordinates address-first with the 40 km guard, state column, signature serve where the bar's own menu names one. No dashes, no food negation, US English.

## Per city, finish the job

Write or refresh the city intro. Check whether any type reaches the threshold and confirm the city and type page generates. Add every new bar to `claude/indexing-queue.json`.

## Report

Per city: count before and after, each bar with slug, admitting source and verification URL, the HELD list with reasons, new pages created, and how long the city took. Then say whether three cities a week is the right pace or whether this stack supports five.
