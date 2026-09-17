# The city coverage programme

**Provenance.** Tasks 42 and 44 both cite this file as already existing in the
project. It did not, so this is reconstructed from those two task files on
2026-09-17 and from what the first wave actually did. Roman should correct
anything here that does not match what he intended; nothing below is a
decision I made on his behalf except where it says so.

## Why

Our value is being the answer to "best bars in <city>", not winning branded
searches for bars people already know. A branded search is a search we can
only ever get a click from; a city search is one we can own.

The blocker is coverage. Of 203 city entries, 132 carry three bars or fewer
and 87 carry exactly one. A "Best Cocktail Bars in X" page over a single row
cannot rank and should not try, which is why those pages are noindexed until
they fill (task 43, `MIN_INDEXABLE_CITY_BARS` in `src/lib/city-thresholds.ts`).

## The rhythm

Three cities a week, about ten bars each. Cities are chosen to test the method
against different source landscapes rather than to chase traffic: somewhere
with local knowledge available, a US mid-metro with strong local press, and a
European city with an active scene but little global award coverage.

## The credible-guide bar

A city counts as covered when it has:

- at least 8 active bars
- at least 6 of them with descriptions
- at least 3 of them with photos
- a city intro written in `src/lib/city-intros.ts`

Related thresholds, all in `src/lib/city-thresholds.ts`: a city page is
indexable at 4 bars, `/best-bars/<city>` exists at 5, and a city-by-type page
exists at 4 of that type.

## Admission sources

These admit a bar to the candidate list. **They are not accolades.** Nothing
here is ever written into the `accolades` field, and no description may
describe a bar as recognised on the strength of one. A real award is a
separate fact that needs its own verification.

- City magazines and alt-weeklies
- Eater and Time Out city maps
- Regional competition rosters: World Class heats, Bacardi Legacy national
  semifinals, Speed Rack
- Cocktail week participant lists
- The Pinnacle Guide, including its unlisted entries
- Michelin guide bar mentions
- **Bartenders' Choice Awards "bars to watch", by country.** BCA publishes
  these yearly per country and they skew to exactly the mid-tier cities this
  programme targets: Košice, Nitra, Lyon, Marseille, Bordeaux, Nice,
  Montpellier, Gdańsk, Wrocław, Kraków, Győr, Split, Belgrade. Added
  2026-09-17 from task 44. BCA is a whitelisted accolade org, which makes the
  distinction sharper rather than softer: a watchlist is still not an award.

Every source URL is recorded, along with which source admitted each bar.

## The method, per city

1. Build 12 to 15 candidates from at least **two independent** sources.
2. Verify each against the venue's **own** site or Instagram: open and
   trading, cocktail-led, address, hours, website, handle. Never an
   aggregator. Anything unconfirmed is held and listed, never guessed.
3. Insert with the full wave protocol: description 90 to 120 words
   primary-sourced, type and subtypes, address, hours, phone, website,
   Instagram, coordinates address-first with the 40 km guard, state column
   where relevant. No dashes, no food negation, US English.
4. Signature serve wherever the venue's own site or menu names one, because
   it gives the search snippet something to say
   (`src/lib/bar-seo-meta.ts`).
5. Write or update the city intro, 120 to 180 words, primary-source rule.
6. Check whether any type now reaches its threshold and the city-by-type page
   generates.
7. Add every new bar to `claude/indexing-queue.json`.
8. Produce an outreach candidate list of the new bars with verified emails.
   These owners are exactly who we want photos and claims from.

## Matching before inserting

When a source arrives as a list of Instagram handles, **match by handle
against the `instagram` column first, never by name**, and report what is
already held. The first BCA run matched 11 of 91 that way, including a bar
whose name had changed since we listed it, which a name match would have
duplicated.

## The admission rule still governs

See `claude/admission-rule.md`. We admit cocktail-led rooms. The test is about
venue type, not quality: a bar with no accolades at all is a perfectly normal
listing, and absence of recognition is never a reason to refuse one.
