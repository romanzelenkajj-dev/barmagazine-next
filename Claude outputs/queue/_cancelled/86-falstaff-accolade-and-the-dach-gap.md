# Falstaff: a new accolade, and the DACH gap it exposes

Replaces the earlier version of this task, which told you to pull the list yourself. **Roman
has pasted it.** Do not drive Chrome and do not ask him for more.

## What you have

`Claude outputs/falstaff/falstaff-93-and-above.json`, **189 rows**: all 100 of Falstaff's
four-glass bars and the three-glass band down to 93 points. Each row carries name, Falstaff
URL, city, country, glasses and points.

**It is not the whole guide and must not be described as one.** The three-glass band runs
down to 90 and Roman stopped at 93 deliberately, having decided the tail was not worth the
copying. So: 189 bars at 93 points and above, out of 3,861 entries. Anything you write about
coverage should say that.

`paste-87-88.json` beside it is the two-glass band and **stays out**. Baudelaire sits in it,
along with a burger bar, two street-food venues and several ski-hotel lounges.

## What the match says, so you can check your own

I matched all 189 against the live directory before writing this: **67 listed, 112 not**,
after dropping the ten non-bar URLs. Treat that as a cross-check on your result, not as
input; if you get a materially different split, one of us is wrong and it is worth finding
out which.

**Five cities cross `MIN_CITY_BARS`:**

| City | Now | After |
|---|---|---|
| Munich | 0 | 9 |
| Cologne | 1 | 8 |
| Hamburg | 1 | 8 |
| Helsinki | 3 | 6 |
| Basel | 1 | 5 |

And Vienna goes 6 to 13, which matters because Vienna had **zero** merit bars in the search
analysis and its cocktail-bars page already draws 113 impressions at position 28.

**Germany 55, Switzerland 22, Austria 11** of the 112 missing. DACH is the directory's
thinnest region and Falstaff is the authority there, which is the whole reason this is worth
doing.

## Work

**1. Falstaff as an accolade org.** New `org_key: falstaff`, same shape as `pinnacle`. The
tile carries glasses, points and the guide year. Propose the tile and where it scores against
W50B, Spirited and Pinnacle in `bestAccolade` ordering: four glasses should sit near a 50 Best
extended-list placing, not above a top ten. Say what you chose and what you rejected.

Check whether Falstaff names a Bar of the Year or Bartender of the Year in its annual guide.
If so those are separate, higher entries, not a points score.

**2. Filter.** Drop every row whose `kind` is not `bars`. Ten rows: nine `/restaurants/` and
one `/spiritproducer/` (Clockers, Hamburg). A restaurant with a good bar is not a bar listing,
and that rule does not bend for a high score.

**3. Hand-check every match.** The matcher is deliberately loose and it called Bloom
(Winterthur) a hit on Late Bloomers (Zurich) last week. Verify each of the ~67 against the
bar's own site before writing an accolade onto it. Report any that are wrong; that tells us
something about the matcher as well as about the row.

Watch for genuine near-duplicates: there are two Eden Bars (Zurich and Ascona), two
Jahreszeiten Bars (Hamburg and Munich), and a Woods in Cologne distinct from the Woods in
Seefeld that sits in the two-glass band.

**4. Dry run the 112 new ones.** Same admission protocol as waves 1 to 3: verify against the
venue's own site, write `editorial_sources` with the Falstaff URL, and hold anything you
cannot verify. Falstaff's own listing is the admitting source; it is not a source for hours.

Report the five threshold cities and confirm each actually clears once the held ones are
subtracted, because 9 in Munich is 9 candidates, not 9 verified bars.

**5. One data error to correct on the way in.** Falstaff files **Paradiso as "Barcelona,
Puerto Rico"**. It is Barcelona, Spain, and we already list it. Their error, not a row to
copy.

## Do not insert without Roman's go

Dry run, counts, then ask him in your own chat. This file carries no approval from him for
anything.

## Report

The accolade tile and scoring with the rejected alternative named, your own matched split
against mine, the hand-check failures, the verified-versus-held counts per threshold city, and
what you would insert first.
