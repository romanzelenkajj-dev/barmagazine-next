# Falstaff: make it an accolade, and take the top of the list, not the middle

Roman found Falstaff's bar guide (falstaff.com/en/bars, 3,861 entries, sorted by rating)
and pasted 100 rows asking which we hold and to add the rest. The paste is saved at
`Claude outputs/falstaff/paste-87-88.json`; the matcher is `match.js` beside it.

## What the match found

We hold **3 of 100**: Häktet Vänster (Stockholm), Loreta Bar (Warsaw), Baudelaire
(Bratislava). The DB holds Austria 7, Germany 18, Switzerland 11 in total. Falstaff lists
41 Austrian bars in this one band. DACH and the Nordics are the biggest coverage gap in the
directory, and Falstaff is the authoritative guide for exactly that region, which the
World's 50 Best family barely touches. No bar in the directory carries a Falstaff accolade
today.

## Why this paste is the wrong slice

Every row is **2 cocktail glasses, 87 or 88 points**. That is Falstaff's "good" tier. The
3-glass (90+) and 4-glass bars sit above it in the same sorted list. The calibration is in
the paste itself: Baudelaire is here at 87, and Roman's own words on it yesterday were
"definitely not one of the best bars in Bratislava." Also in the band: a burger bar, two
street-food venues, a café, a casino bar, and ski-resort hotel lounges in Fiss, Leogang,
Bad Hofgastein and Achenkirch. Falstaff's own URL path flags 14 of the 100 as
`/restaurants/`, `/cafes/` or `/streetfood/`.

The search analysis of 2026-09-19 (project doc `search-demand-analysis-2026-09.md`) showed
depth hurts a city page and small curated lists convert best. Inserting 97 two-glass bars
is the opposite of that. Falstaff's top tier is the right thing to take.

## What to build

**1. Falstaff as an accolade org.** New `org_key: falstaff`, same pattern as `pinnacle`
(Pins). The tile carries the glasses and the points and the guide year. Propose the tile
and the scoring so it sits correctly against W50B, Spirited and Pinnacle in `bestAccolade`
ordering; four glasses should rank near a 50 Best extended-list placing, not above a
top-ten. Say what you chose. Falstaff also names a Bar of the Year and a Bartender of the
Year in its annual Bar Guide; if those are on the site, capture them as separate, higher
entries.

**2. Pull the 3-glass and 4-glass bars.** The list is paginated in the browser. Use the
Chrome you have or fetch the pages directly, whichever works, and pull every entry at 90
points or above with its name, Falstaff URL, glasses, points, postcode, city and country.
Save the raw pull to `Claude outputs/falstaff/top-tier.json` before you do anything else
with it. Report how many there are and the split by country. If the site fights you,
report what it does and stop; do not hammer it.

**3. Filter and match.** Drop anything whose Falstaff URL is not `/bars/`. Match the rest
against the DB with the same matcher, then hand-check every match, because the matcher
called Bloom (Winterthur) a hit on Late Bloomers (Zurich). Report: held, held-but-missing
the accolade, and new.

**4. Dry run the new bars.** Same admission protocol as waves 1 to 3: verify each against
its own website, write `editorial_sources` (Falstaff URL) and the `falstaff` accolade as
you would insert, and hold anything you cannot verify. Cities that would clear
`MIN_CITY_BARS` for the first time, list them; Vienna at 6 bars and 0 merit is the one to
watch, and Munich, Zurich, Hamburg and Berlin are the others.

**Do not insert. Report the dry run and ask Roman in your chat.** Nothing in this file is
his approval for a write.

## The question for Roman, put plainly in your report

After the 90+ pass, is the 88 band worth taking selectively? The case for: in a city like
Vienna, an 88 from Falstaff may be the only merit signal that exists, and a real cocktail
bar at 88 is better than an empty city. The case against: 88 is Baudelaire. If he says
yes, the filter is `/bars/` URL only, cocktail-led by its own site, and only in cities
that would otherwise stay under five; never 87, and never as an accolade, only as an
`editorial_sources` admission record. Present both and let him choose.

## Report

Counts at every step (pulled, after URL filter, matched, new, verified, held), the
accolade tile and scoring you propose, the country split, the cities that would newly
clear the threshold, and the 88-band question.
