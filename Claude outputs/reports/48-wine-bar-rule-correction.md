# Report: 48-wine-bar-rule-correction (2026-09-17)

Correction accepted and applied. NUDA is live.

## The mistake was mine, and it was upstream of the hold

`claude/admission-rule.md` opened with "The test excludes nightclubs, wine bars
and pure restaurants". I read that as current, and I wrote it into the
verification prompt for **every one of the eleven research agents** run today:
"Exclude nightclubs, pure restaurants and pure wine bars on what they ARE, not
on quality."

So this was not one researcher misjudging one bar. It was a wrong rule
propagated into every city and country run in this session. Worth saying
plainly, because it changes how much re-checking the correction needed.

## NUDA is listed

`nuda-bar-bratislava`, Židovská 3, Bratislava, subtype **Wine Bar**,
geocoded 0.2 km from the city's other bars, live and returning 200.

Its own site settles it under the corrected rule. It headlines "Natural wine,
food & fun", the list runs across whites, reds, rosé, bubbles and skin contact
from small and biodynamic producers, and champagne, sake, "zopár legendárnych
cocktailov" and seasonal snacks sit alongside. Sommelier Rasťo Masrna leads
the room. Oysters every Thursday, and regular evenings handed to visiting
chefs, winemakers and bartenders. It keeps bar hours, 17:00 to 22:30 Tuesday
to Thursday and to midnight on Friday and Saturday.

That is a wine bar keeping bar hours, which is now explicitly in.

Bratislava is now **16 bars**.

## Everything else held today, re-checked

I scanned every hold across all eleven research runs for any reason touching
wine. Four came back, and **only NUDA was held on that ground.**

| Bar | City | Held for | Still held? |
|---|---|---|---|
| NUDA Bar | Bratislava | wine bar | **no, now listed** |
| Mullet Bar | Bratislava | no street address on any channel it controls | yes, unrelated |
| Square Nine | Belgrade | a hotel account, not a bar account | yes, unrelated |
| The Upper Room | Atlanta | cocktail-led test and no address | yes, and correctly |

**The Upper Room is worth a second look and it stays out.** Its own site
headlines "Coffee, Wine, Cocktails & Curated Experiences" and it trades from
noon inside a retail space at Ponce City Market. Under the corrected rule that
is a **coffee bar**, which is explicitly excluded, and it also publishes no ZIP.
If you read it as a wine bar rather than a cafe, say so and it goes in.

Two other holds are near misses on different grounds, and both are recoverable
with one check: **Mullet Bar** is confirmed cocktail-led and trading and needs
only a street address, and **JM Cocktail Bar** in Slovakia publishes named
house serves but no city at all.

## The rule is now written in both places

**`claude/admission-rule.md`** has the exclusion line corrected, with a short
section recording that the earlier version cost a listing so it is not quietly
reverted later.

**`claude/city-coverage-program.md`** carries it in the sourcing section:
wine bars in, with the Wine Bar subtype; breweries, distillery taprooms that
are not cocktail bars, and coffee bars out. The distinction I wrote down for
the edge case: a venue that leads on coffee and closes in the early evening is
a cafe and stays out even when it pours cocktails; a venue that leads on wine
and keeps bar hours is a wine bar and goes in.

## On the programme file

Understood, and I treated the repo copy as canonical: the overwrite arrived
uncommitted on disk and I edited on top of it rather than restoring my own
version. Two things I had added to the file I wrote this morning were lost in
the overwrite and are now re-added to the authoritative copy, because both
came out of today's runs and neither is in it:

- **The BCA "bars to watch" source**, which task 44 asked to be added to the
  checklist.
- **How to read an Instagram-only venue.** This is the one I would not want to
  lose. Half the bars in these cities have no website, and the first Polish run
  returned 5 of 18 purely because that researcher could not read Instagram; a
  second pass returned 11 of 18. The three techniques that work logged out are
  written down, including the post embed endpoint, which is the only reason
  Záhir in Nitra is listed.

**One discrepancy to resolve on your side.** The programme file says a city and
type page goes live "wherever six bars of a type exist", and task 47 repeats
six. The code uses `MIN_TYPE_BARS = 4`, in `src/lib/city-thresholds.ts`. Four
is what actually ships today, which is why Warsaw's rooftop page exists on
five. Tell me which number you want and I will make the code and the documents
agree.
