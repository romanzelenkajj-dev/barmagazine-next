# Task 114: best-bars band intro names no bar. PR #79 MERGED 2026-09-23 after the rework below

Preview (Vercel SSO): https://barmagazine-next-git-previ-7a165c-romanzelenkajj-7135s-projects.vercel.app

- /best-bars/athens: "Six bars, chosen on the record: six on World's 50 Best, five on Europe's 50 Best,
  one Spirited Awards winner, five with Pinnacle Guide pins." (first card is Baba au Rum; the old
  line named Line)
- /best-bars/los-angeles: "18 bars, chosen on the record: one on World's 50 Best, five on North
  America's 50 Best, two Spirited Awards winners, ten Spirited Awards nominees, two with Pinnacle
  Guide pins." (first card is Apothéke; the old line named Tiki-Ti)
- /best-bars/warsaw, no awards at all: "Seven bars, every listing verified by BarMagazine."

## The line

`src/lib/record-line.ts`, `recordLine(bars, noun)`, with 4 tests. One sentence from facts that hold
whatever the order: the count of bars listed, then how many of them carry a record in each family,
zeros omitted: World's 50 Best, Asia's, Europe's, North America's 50 Best (each counted where a bar
holds any entry on that list), Spirited Awards winners and nominees (a bar with both counts once,
as a winner), James Beard winners and nominees, and bars with Pinnacle Guide pins. Numbers one to
ten in words, digits above. A list with nothing on the record gets "every listing verified by
BarMagazine" rather than an empty colon; say so if you want other wording there.

Same line on every band: city (`/best-bars/<city>`), type (`/best-bars/<city>/<type>`), and the
country, US-state and continent type pages (all three render through `RegionTypePage`). The
hand-written region intros in `src/lib/region-intros.ts` and the composers in `seo-cities.ts` and
`seo-regions.ts` are no longer called by the band; the files stay, unused, in case you want the
prose somewhere else. The `firstSentence` wrapper is gone from these bands because the line is one
sentence by construction.

## Title one size larger

`.best-bars-hero h1`: clamp(26px, 2.8vw, 32px) to clamp(28px, 3.1vw, 36px); phones 24 to 26px.
Band still 220px on desktop; Los Angeles at 390 is 342px because its three pills wrap, first card
at 458, no horizontal overflow.

## Not touched, flagged

The meta descriptions still say "led by <bar>" from the same top-accolade logic (composeCityDescription,
composeTypeDescription, composeRegionDescription). They are search snippets, not the band, so they
are outside this task; the same fix applies if you want it.

## Rework (Roman, same day), merged

- No-award pages get no summary line at all, title only (Warsaw: band is kicker plus title, 220px).
- The summary stops at the two highest-ranked programs, in this order: World's 50 Best, Asia's,
  Europe's, North America's 50 Best, Spirited Awards (winners if any, else nominees), James Beard
  (same), Pinnacle Guide pins. Athens now reads "Six bars, chosen on the record: six on World's 50
  Best, five on Europe's 50 Best." Los Angeles: "18 bars, chosen on the record: one on World's 50
  Best, five on North America's 50 Best."
- Meta descriptions name no bar either: "The best bars in Athens, Greece, chosen on the record:
  six on World's 50 Best, five on Europe's 50 Best. Verified listings with addresses, hours and
  signature drinks." A no-award page keeps the plain description. Region pages: "78 hotel bars in
  the United States, chosen on the record: ..." (that one carries the live count, as before).
- `composeCityDescription`, `composeTypeDescription` and `composeRegionDescription` now take the bar
  list; the `topName` arguments are gone. Tests updated (4).

Merged into main as `afcc0dc`; production build green.
