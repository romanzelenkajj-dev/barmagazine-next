# Report: 49-near-mode-overrides-city-filter (2026-09-17)

Both fixed and live. Commit `0e6fb94`.

The diagnosis in the task was exactly right and I confirmed it in the code
before changing anything: `nearMode` is read once at line 569 and never
cleared, and MODE D is tested before the MODE A location branch, so a city
filter never got to decide the order.

## The fix

`nearMode` now clears the moment a city filter, a country filter or a search
term is set, and `near` is dropped from the URL at the same time so a refresh
cannot resurrect it. The banner goes with it, because its condition is
`nearMode`.

I wrote it as an effect on the filter values rather than a line inside each
setter. City, country and search are set from the dropdowns, the type chips
and the typeahead, and adding a call to each one leaves the next entry point
to be missed. MODE D's own logic is untouched, and so are MODE A, B and C.

## Before and after, read off the live site

Every list below is the real DOM order, not a prediction. The viewport was set
to 1440 and then to 390, and the two agreed on every case, so they are shown
once.

**`/bars?near=me` then filter to Bratislava. The broken case.**

| Before | After |
|---|---|
| Antique American Bar | **Mirror Bar** |
| Baudelaire Bar | **Antique American Bar** |
| Bukowski 2.0 | **Old Fashioned Bar** |
| Bukowski Bar | Baudelaire Bar |
| Casa del Havana | Bukowski 2.0 |
| Juicy | Bukowski Bar |
| Mezcalli | Casa del Havana |
| Michalská Cocktail Room | Juicy |
| **Mirror Bar** | Mezcalli |
| NUDA Bar | Michalská Cocktail Room |
| Old Fashioned Bar | NUDA Bar |
| Rio Restaurant & Bar | Rio Restaurant & Bar |

Near banner: **shown before, gone after.** URL: `/bars?near=me` before,
`/bars` after.

The three bars that move to the top are the three Bratislava bars with photos.
Mirror Bar went from ninth to first.

One note on reproducing it. From this machine the broken order came out
alphabetical rather than the order on Roman's screenshot, because every
Bratislava bar is outside the 80 km radius and with no GPS the distances tie,
so MODE D falls through to its name comparison. From Carlsbad the distances
differ and it produced his order. Same defect, different arbitrary result,
which is rather the point: beyond the radius the order is whatever distance
says, and photo, accolade and tier are all ignored.

**`/bars` filtered to Bratislava, no `near`. Must be unchanged.**

Mirror Bar, Antique American Bar, Old Fashioned Bar, Baudelaire Bar,
Bukowski 2.0, Bukowski Bar, Casa del Havana, Juicy, Mezcalli, Michalská
Cocktail Room, NUDA Bar, Rio Restaurant & Bar.

Identical before and after, and identical to the fixed near case above, which
is the test that matters.

**`/bars?near=me` with no filter. Must be unchanged.**

Banner still shown, order still proximity: Gilly's House of Cocktails, Happy
Medium, Polite Provisions, Raised by Wolves, Realm of the 52 Remedies, False
Idol, Good Enough Cocktail Club, Noble Experiment. MODE D intact.

**`/bars/city/bratislava`** Antique American Bar, Mirror Bar, Old Fashioned
Bar, then the rest alphabetically. **`/best-bars/bratislava`** Mirror Bar,
Antique American Bar, Old Fashioned Bar, then the rest. Both are
server-rendered by other components and neither changed.

No layout, spacing or breakpoint was touched.

## The 50 Best swap, and what it actually changed

This is the part worth reading, because the hardcoded list was wrong in both
directions, not just out of step with the badge.

**Five rows lose a rank they never earned.** The list matched on `bar.name`,
and we list multiple venues under one name, so every outpost inherited its
parent's ranking:

| Row | City | 50 Best accolades |
|---|---|---|
| bar-leone-shanghai | Shanghai | none |
| paradiso-dubai | Dubai | none |
| paradiso-stockholm | Stockholm | none |
| salmon-guru-dubai | Dubai | none |
| salmon-guru-milan | Milan | none |

Bar Leone Shanghai was sorting with the number one bar in the world. The
originals keep their rank correctly, because they carry the accolade:
bar-leone in Hong Kong, paradiso in Barcelona, salmon-guru in Madrid.

**Two of the list's own entries matched no row at all.** It held "The
Connaught Bar" and "Benfiddich"; we store "Connaught Bar" and "Bar
Benfiddich". Both showed the 50 BEST badge and sorted as ordinary bars, which
is the exact failure the task describes.

**227 rows gain the rank**, because the name list was the World's 50 Best 2025
top fifty only, while `hasFiftyBest` counts all four lists: 94 from North
America's, 90 from Asia's, 59 from World's and 28 from Europe's.

That last number deserves a decision from you rather than a shrug from me.
**275 of 1,441 bars now carry the 50 Best sort rank, about one in five.** A
tiebreak that applies to a fifth of the directory does less separating than
one that applies to fifty bars. It is now at least *correct* and it agrees
with the badge, which is what the task asked for. If you want it to
discriminate again, the options are to rank on the world list alone, or to
weight by which list and what placing. Say which and I will do it.
