# Task 87: near-me sees every bar

**Merged** (`941bd12`) after Roman's go in chat, 2026-09-20. Live and verified on production.

## The confirmed cause, with one correction

`bars/page.tsx` builds `initialBars` from three tier queries. Measured against the live
directory rather than taken from the task:

| Query | Cap | Actually exist | Shipped |
|---|---|---|---|
| `tier: top10` | 200 | 230 | 200 |
| `tier: featured` | 48 | **2** | 2 |
| `tier: free, hasPhoto` | 24 | **110** | 24 |
| | | **total** | **226** |

**226 rows out of 1,545**, chosen globally with no reference to the visitor. MODE D then
sorted that array by distance, so near-me returned the nearest bars *in a global sample*,
not the nearest bars we list.

The task said 272; the real figure is 226, because only two featured bars exist and top10 is
capped thirty short of its 230.

**Mirror Bar was not in the payload at all.** Free tier with one photo, so it competed for 24
worldwide slots against 110 candidates and lost, 500 m away with three accolades: World's 50
Best No. 25, Europe's 50 Best No. 8, and a Bartenders' Choice win.

## The approach, and why

**Reuse `/api/bars/map`.** It already returns every active bar with coordinates, paged past
the 1,000-row cap and cached ten minutes at the edge, and the map view already fetches it.
Rejected a second endpoint (a third copy of the same query) and a server-side proximity
query (more correct long-term, but this is a display ordering problem, not a data problem,
and the endpoint already exists).

**One gap had to close first.** The route **selected** `accolades` and then dropped them in
the `MapBar` projection. A card built from that payload would have rendered no badges beside
a card built from `getBars()` that did: two card qualities on one page. The accolades now
survive, trimmed to the seven fields `bestAccolade`, `hasFiftyBest` and the badge renderer
actually read.

## Before and after, Bratislava, driven live

| # | Before | After |
|---|---|---|
| 1 | Antique American Bar, Bratislava | Old Fashioned Bar, Bratislava |
| 2 | Alma Prague, **Prague 291 km** | Antique American Bar, Bratislava |
| 3 | Alto Rooftop, **Cervia 566 km** | **Mirror Bar, Bratislava** |
| 4 | 1930, **Milan 673 km** | Bukowski Bar, Bratislava |
| 5 | Backdoor 43, **Milan 674 km** | Mezcalli, Bratislava |
| 6 | Bar DECO, **Copenhagen 893 km** | Michalská Cocktail Room, Bratislava |

**Mirror Bar: absent, to #3.**

Second and third cities, to show it is not tuned to one place:

| City | Local in the top six, before | After |
|---|---|---|
| Belgrade | **0** (got Bratislava, Cervia, Prague, Athens) | **6 of 6** |
| Budapest | **0** (got Bratislava, Prague, Cervia, Milan) | **6 of 6** |

## Payload cost

365 KB to **490 KB**, about 30 KB gzipped. **Fetched only on the button press**, not on page
load, so a phone that only browses pays nothing, and shared with the map view so a visitor
who uses both pays once. Verified on production: 1,535 rows, accolades present.

## A bug I introduced and caught in the browser

The in-flight flag was `useState`, so it belonged in the effect's dependency array; setting
it re-ran the effect, whose cleanup cancelled the fetch that set it. **The request completed
and its result was discarded**, leaving near-me silently on the 226-row sample.

`next build` and all 401 tests passed while this was broken. Only driving the page found it.
It is a `useRef` now, with the reason written above it.

## MODE B: same defect, reported not changed

MODE B (geo active, no filter) sorts the same `allBars`. A visitor in Bratislava who never
presses the button still gets a proximity-flavoured order built from the 226-row sample. The
task said to report rather than silently change it, so I have. The same one-line source swap
would fix it.

## The near-me sentence

**Already gone.** Removed in `0b3964d`, one of the task 74 commits merged this morning. Its
`.dir-near-note` CSS rule was left orphaned with no element using it, and is removed here.
The strip that renders in near mode is `.dir-near-notice`, the task 76 banner, which stays.

## One thing that needs Roman's decision

He wrote: *"inside a single distance band, quality decides the order, not metres... Mirror Bar
should lead on its three accolades. That is the existing rule."*

**It is not the existing rule.** MODE D orders within a band by `tier` then `photo` then
distance, with no accolade term. Mirror Bar, Old Fashioned and Antique American are all free
tier with one photo, so distance breaks the tie and Mirror lands **#3** at 0.8 km behind two
bars at 0.6 km that hold **no accolades at all**.

Adding a `bestAccolade` term after tier:

| | Current | With accolades |
|---|---|---|
| 1 | Old Fashioned Bar, 0 accolades | **Mirror Bar, score 1038** |
| 2 | Antique American Bar, 0 accolades | Old Fashioned Bar |
| 3 | **Mirror Bar, score 1038** | Antique American Bar |

One line. He said he was confirming the rule rather than asking for a change, so it is not
made. **Still open.**

## Guards

Build clean, 401 tests pass, no horizontal overflow at 390px, verified at 390 and 1440.
