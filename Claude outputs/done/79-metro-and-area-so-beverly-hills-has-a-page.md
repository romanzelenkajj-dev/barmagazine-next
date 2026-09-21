# A bar belongs to a metro, and carries the area inside it

Roman's spec, in his words: "In the drop down menu, we don't want to have a million cities. So a bar in Beverly Hills will be under Los Angeles. But because we're competing on Google with top bars in Los Angeles, we also want to be found if somebody is looking for bars in Beverly Hills, to have a page with, let's say, if there is at least five, six bars in that area."

## Where this stands today

A bar has one `city` string and nothing else. Beverly Hills is either in the Beverly Hills dropdown or in the LA one, never both. `region` holds continents, so it is the wrong grain. `neighborhood` is the right grain but only 149 of 1,506 bars have one and nothing searches it.

The result is 62 US "cities", of which many are one-bar suburbs: Beverly Hills, Santa Monica, Long Beach, Somerville, Decatur, Avondale Estates, Miami Beach, Shawnee, Prospect KY, St. Clair Shores MI. Each clutters the dropdown and each is a thin page competing with the metro page next to it.

## The structure

`city` becomes the **metro**: Los Angeles, Kansas City, Boston, Atlanta.

`neighborhood` becomes the **area within it**: Beverly Hills, Shawnee, Somerville, Midtown East.

Use the existing `neighborhood` column rather than adding one. A suburb and a district differ municipally but are the same thing for this purpose, a named area inside a metro that people search, and reusing it means the 149 bars that already have a value start counting immediately. If you find a concrete reason that breaks, say so before building rather than adding a column quietly.

## What follows from it

**The dropdown lists metros only.** That is the point Roman led with.

**An area gets its own page at five bars**, matching `MIN_CITY_BARS`, and not before. Below five the bars still appear on the metro page with their area shown; there is simply no area page. The threshold makes it self-managing: an area earns a page by filling up, exactly as cities do.

**Search covers both.** Someone typing Beverly Hills finds those bars whether or not the area has a page. That is the half that is missing today and the half Roman is asking for.

**The area page links up to the metro page** and the metro page links down to its areas, so they support each other rather than compete. The area page targets "bars in Beverly Hills", which is a far softer term than "bars in Los Angeles", which is the whole reason for doing this.

## The rollup list is Roman's call, not a script's

Do **not** write a rule that folds small cities into big ones automatically. "Is Oakland part of San Francisco" is exactly the question a script must never answer: Oakland has 16 bars and is its own city, Beverly Hills has one and is not.

Produce a proposed list instead: every current city you believe is an area of a larger metro, with its bar count, the metro you would put it under, and why. Roman approves it line by line. Nothing moves until he does.

Start the list from the single-bar US cities above, and check the non-US ones too rather than assuming this is a US-only problem.

## Do not break the URLs

`/bars/city/beverly-hills` exists and may be indexed. When a city becomes an area, its old URL must redirect to the area page if one exists, or to the metro page if it does not. A 404 on a page Google already knows is worse than the thin page it replaces. Say in the report exactly which URLs change and where each one lands.

## Guards

Standing layout rule. **Do not merge to main, do not run any migration, do not move any bar.** This task is the structure, the proposal and a preview. Roman approves the rollup list and the migration separately.

This task carries no approval from him for anything: ask in your own chat.

## Report

The proposed rollup list with counts and reasoning. Which areas would clear five bars today and so get a page immediately. The URL redirect map. And what the dropdown looks like before and after, since shortening it is the thing Roman asked for first.
