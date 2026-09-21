# Falstaff is a research source, not an accolade. Nothing about it reaches a visitor.

Replaces both earlier versions of this task. **The accolade work is cancelled.** Roman's
instruction, 2026-09-20, in his own words: Falstaff stays entirely invisible to visitors, we
use it as a research source to find and admit bars, it goes in `editorial_sources` like Haute
Living, and nothing on the site ever displays the glasses or points.

## What that means concretely

- **No `org_key: falstaff`.** Do not create one. If you have already sketched a tile or a
  score, discard it.
- **No glasses, no points, anywhere.** Not on a profile, not in a card badge, not in a meta
  description, not in JSON-LD, not in an article, not in an owner email. Nowhere a visitor or
  a bar owner can read it.
- **`editorial_sources` only**, exactly as Haute Living is handled: the admission record that
  says where we found the bar. That column is already established as an admission record and
  never an accolade, and this follows the same rule.
- **The word "Falstaff" does not appear in any user-facing string.** Check that before you
  finish, not after.

The source stays in the row so that a year from now someone can see why the bar was admitted.
That is an internal audit trail, which is what `editorial_sources` is for.

## The data

`Claude outputs/falstaff/falstaff-93-and-above.json`, **189 rows**: all 100 four-glass bars
and the three-glass band down to 93 points, each with name, Falstaff URL, city, country,
glasses and points. Keep the glasses and points **in the file** as your working notes for
ordering the work; they do not travel into the database as anything displayable.

Roman stopped at 93 on purpose, so this is 189 of 3,861 entries. It is the top of the guide,
not the guide.

`paste-87-88.json` beside it is the two-glass band and stays out entirely.

## My match, as a cross-check on yours

**67 already listed, 112 not**, after dropping ten non-bar URLs. If your split differs
materially, one of us is wrong and it is worth finding out which before you insert anything.

Five cities would cross `MIN_CITY_BARS`: **Munich 0 to 9, Cologne 1 to 8, Hamburg 1 to 8,**
Helsinki 3 to 6, Basel 1 to 5. Vienna goes 6 to 13, which matters because Vienna had zero
merit bars in the search analysis while its cocktail-bars page draws 113 impressions.

Germany is 55 of the 112, Switzerland 22, Austria 11.

## Work

**1. Filter.** Drop every row whose `kind` is not `bars`: nine `/restaurants/` and one
`/spiritproducer/` (Clockers, Hamburg). A restaurant with a good bar is not a bar listing.

**2. The 67 matches: verify, then add the source only.** For a bar we already hold, the only
change is appending the Falstaff URL to `editorial_sources`. No other field moves.

Hand-check each one first. The matcher is deliberately loose and it called Bloom (Winterthur)
a hit on Late Bloomers (Zurich) last week. Watch the genuine near-duplicates: two Eden Bars
(Zurich, Ascona), two Jahreszeiten Bars (Hamburg, Munich), and a Woods in Cologne distinct
from the Woods in Seefeld.

**3. Dry run the 112 new ones.** Same admission protocol as waves 1 to 3: verify against the
venue's own site, `editorial_sources` written as you insert, hold anything you cannot verify.
Falstaff admits the bar; it is not a source for hours.

Work the five threshold cities first, since those unlock pages, and report **verified** counts
per city rather than candidate counts. Nine Munich candidates is nine candidates.

**4. One data error not to copy.** Falstaff files Paradiso as "Barcelona, Puerto Rico". It is
Barcelona, Spain, and we already list it.

## Do not insert without Roman's go

Dry run, counts, then ask him in your own chat. This file carries no approval from him for
anything except the scope above, which is his instruction rather than an approval to write.

## Report

Your matched split against mine, the hand-check failures, verified-versus-held per threshold
city, and an explicit confirmation that the string "Falstaff" appears in no user-facing
output. Name where you checked for that.
