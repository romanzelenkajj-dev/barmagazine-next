# Report: 53-three-page-levels-per-city (2026-09-17)

Shipped and live. Commit `1c848d0`, with the `editorial_sources` backfill in
`d324818`.

**Bratislava lands on five.** The task 50 report said twelve under the old
rule. The answer to that question is the whole result.

| City | Title before | Title after |
|---|---|---|
| Bratislava | The Best Bars in Bratislava (2026) | **The 5 Best Bars in Bratislava (2026)** |
| Warsaw | The Best Bars in Warsaw (2026) | **The 7 Best Bars in Warsaw (2026)** |
| Budapest | The Best Bars in Budapest (2026) | **The 11 Best Bars in Budapest (2026)** |
| London | The Best Bars in London (2026) | **The 23 Best Bars in London (2026)** |
| New York | The Best Bars in New York (2026) | **The 33 Best Bars in New York (2026)** |
| Prague | The Best Bars in Prague (2026) | unchanged, no number: it falls back |

All read off the live site. Your "32 best bars in New York" is 33.

## Why the number moved so far in Bratislava

Task 50's rule qualified twelve of sixteen because "has an editorial source"
is the admission floor in a city we filled from local press. The change is
that a source now only counts when **the source itself made a selection**.

- **Qualifies:** a bounded Top N, a guide with a standard (Falstaff, Michelin,
  Pinnacle), a real award.
- **Does not:** a tourism board page, a festival participant roster, a bare
  venue listing, or a broad city map.

The line between "The 19 Best Bars In Atlanta" and "57 Best Bars in Atlanta"
is drawn at 25, which is roughly where a city list stops being an opinion and
becomes a directory with a headline. Every source is classified by rule, with
tests, not by a hand-kept list, so a new source is classified the day it
arrives. `src/lib/editorial-sources.ts`.

One collision worth recording: "the 50 best bars in Dallas right now" matched
the World's 50 Best on a bare "50 best" substring. The named lists are matched
in full now.

## Level 2, before and after

**Bratislava, 16 bars.** Before, 12: Mirror Bar, Antique American Bar, Old
Fashioned Bar, Baudelaire Bar, Bukowski 2.0, Bukowski Bar, Casa del Havana,
Juicy, Mezcalli, Michalská Cocktail Room, NUDA Bar, Rio. After, **5**:

| Bar | Qualifying reason |
|---|---|
| Mirror Bar | accolade |
| NUDA Bar | Bartenders' Choice Awards bars to watch |
| Rio Restaurant & Bar | Bartenders' Choice Awards bars to watch |
| The Half Blind Pig | Falstaff Bar Guide 2026; SME Closer TOP 8 |
| UFO watch.taste.groove. | Club Oenologique, four of the best bars |

Casa del Havana, Juicy, Mezcalli and Bukowski drop to Level 3: they were
admitted by a festival participant roster and a tourism board POI listing,
which name a bar without picking it.

**Warsaw, 16 bars, after 7**: Donkey Shoe, Lane's Gin Bar, Monkey Love,
Negroni Centrale and The Roof Skybar on Warsaw Insider's Best of Warsaw awards,
Victoria Lounge and Zamieszanie on Weranda Weekend's Top 8. The four rooftops
admitted by the city tourism office drop to Level 3.

**Budapest, 19 bars, after 11**: Elysian and Leo Rooftop on accolades, then
nine on the Bartenders' Choice watchlist.

**London, 54 bars, after 23**: the curated ten first, then 13 accolade holders.

**New York, 54 bars, after 33**: the curated ten, then 23 accolade holders.
Those 23 are precisely the bars the task 50 report said would fall off a
curated-ten-only page. They now have a level to live on, which is the point of
the three-level structure.

**Prague, 21 bars, falls back.** Only three qualify: Alma, Forbína and Taigen,
all on accolades. Its other eighteen are real bars that predate the waves that
record a source, so the page keeps the old order, fills to five, and its title
carries no number.

## Where a paying bar sits

Written as you settled it, though nothing changes in practice today because
the only two paying bars are in Santiago and Palma, neither of which has a
curated ten.

- **Level 1 cannot be bought.** A paid tier is not a route in.
- **Level 2 includes a paying bar, ranked on merit**, alongside our own article
  and our curated ten, below the accolade holders. An editorial best-of that
  can be bought into the top spot is worth nothing to the bar that buys it.
- **Priority placement stays where it is sold**, on `/bars` and Level 3, which
  task 52 fixed this morning so that only the two paying bars actually get it.

## The override

`editorial_pick` on Baudelaire Bar is **-1**, with your reason in
`admin_notes`. Verified live: it is absent from `/best-bars/bratislava`,
present on `/bars/city/bratislava`, and its profile returns 200.

It exists because no rule built on sources could drop it. Refresher.sk ranked
it fifth in Bratislava and that is a genuine selection; the disagreement is
between you and that outlet, so it has to be storable rather than derivable.
Nothing else has an override.

## The cities that still fall back

**30 of 72 Level 2 pages** have fewer than five qualifying bars and keep the
old order. In descending size:

Prague 21, Taipei 20, New Delhi 18, Florence 18, Madrid 17, Berlin 16,
Stockholm 16, Melbourne 15, Mumbai 15, Shanghai 15, Buenos Aires 15,
Amsterdam 14, São Paulo 14, Lisbon 13, Ho Chi Minh City 12, Bengaluru 11,
Copenhagen 10, Houston 10, Nashville 10, Rio de Janeiro 10, Zurich 10,
Montreal 9, Lima 8, Oaxaca 8, Cape Town 7, Dublin 7, Venice 7, Edinburgh 6,
Vienna 6, Zagreb 5.

**These are not thin cities.** Prague has 21 bars, Taipei 20, New Delhi 18.
They fall back because we hold no record of what admitted them, not because
they lack good bars. So the coverage programme's next job in these cities is
not adding bars, it is running a source pass over the ones already listed.
That is a different and much cheaper job, and it would turn 30 fallback pages
into 30 real best-of lists.

## Guards kept

The Top 10 pill already existed on these cards, so the only genuinely new
element is the number in the title. No spacing, no breakpoint, no component
changed. `MIN_CITY_BARS` and the noindex rules are untouched, and
`editorial_pick` is never rendered and never scored as an accolade.

378 tests passing, seven of them new for the source classifier.
