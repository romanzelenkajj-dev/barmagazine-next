# Report: 45-bca-slovakia-after-blind-test (2026-09-17)

Done and live. 5 bars inserted.

The ordering you asked for was kept. Task 42's Bratislava candidate list was
built and reported from local sources before this file was opened, so the
comparison below is a real test rather than a rationalisation.

## The blind test

My Bratislava research produced 16 candidates, 9 of them verified, from local
sources only: World Class Cocktail Festival Slovakia 2025, SME, Startitup,
Refresher, the Falstaff Bar Guide 2026, Club Oenologique and Svoboda &
Williams. Your list has 15 handles.

| | Count |
|---|---|
| On both lists | 6 |
| Only on your BCA list | 9 |
| Only on my blind list | 10 |

### On both (6)

| Handle | Bar | My verdict |
|---|---|---|
| barbaudelaire | Baudelaire Bar | verified |
| bukowskisbar | Bukowski Bar | verified |
| thecubalibre | The Cuba Libre Rum & Cigar House | verified |
| thehalfblindpig | The Half Blind Pig | verified |
| _brixtonhouse_ | Brixton House | held: rebranded to Brixton Osteria, an Italian restaurant |
| mullet_bar | Mullet Bar | held: publishes no street address anywhere it controls |

### Only on your list (9)

`cocktail_bar_1`, `freym.kosice`, `jm_cocktail_bar`, `livalittle.bratislava`,
`nudabar.bratislava`, `phoenixbyheaven`, `riobratislava`,
`varaderorumacigarhouse`, `zahirnitra`.

**Four of those nine were never findable by my method, by construction.**
FREYM is in Košice and Záhir in Nitra, and I searched Bratislava. Two more
turned out not to be in Bratislava either, which your brief did not know:
**Phoenix by Heaven is in Piešťany** and **Varadero is in Bojnice**. Only Rio
is actually a Bratislava bar my local sources missed.

### Only on my list (10)

Bukowski 2.0, Juicy, Mezcalli, UFO watch.taste.groove., Casa del Havana, all
verified and now live, plus five held: Spin Cocktail Bar, Mini Bar by SPIN,
Nu Spirit Bar, Outlook Bar & Lounge, Papagayo.

## What the test actually says

The two sources are complementary, not redundant, and neither would have been
enough alone.

- **Your list reaches beyond the capital.** Five of its nine unique entries
  are in Košice, Nitra, Piešťany and Bojnice, cities a Bratislava search
  cannot reach. That is the strongest argument for the BCA lists: they are the
  only source in the checklist that systematically names mid-tier-city bars.
- **My method found five live Bratislava bars your list does not have**,
  including UFO on the SNP bridge pylon, which is the most conspicuous bar in
  the city.
- **Where they overlap, the overlap is the strong core.** All four bars on
  both lists that I could verify are now listed.
- One thing local sourcing did that a handle list cannot: it caught that
  **Brixton House has rebranded to an Italian restaurant** since the 2025
  festival roster, so inserting it from the handle alone would have listed a
  restaurant as a cocktail bar.

The practical conclusion for the programme: run both, and run the BCA list
second, so the blind pass is never contaminated and the list is used to fill
the gaps it is genuinely good at.

## Slovakia results

5 verified, 4 held, no accolade recorded for any of them.

| Bar | City | Note |
|---|---|---|
| Rio Restaurant & Bar | Bratislava | Restaurant Bar subtype |
| FREYM City bistro & Cocktail bar | Košice | Restaurant Bar subtype |
| Záhir | Nitra | |
| Phoenix by Heaven | Piešťany | not Bratislava |
| Varadero Rum & Cigar House | Bojnice | not Bratislava |

**Held (4)**

- **NUDA** is excluded as a wine bar on what it is, not on quality. Its own
  site headlines "Natural wine, food & fun" and its menu page carries a wine
  list and a snacks list, with its own copy claiming only "zopár legendárnych
  cocktailov". Address, hours and email are in the working file if you want to
  overturn that ruling.
- **Liva Little** is trading but leads on specialty coffee, closes at 18:00,
  and publishes no address.
- **JM Cocktail Bar** is plainly cocktail-led and posting, with named house
  serves, but states no city or address anywhere it controls. Aggregators put
  it in Poprad and disagree on the street, so nothing was taken from them.
  Recoverable with one confirmation from the operator.
- **cocktail_bar_1** is a restricted profile with an empty bio and no
  discoverable site. Not even the country is confirmable.

## Bars per city

| City | Before | After |
|---|---|---|
| Bratislava | 5 | 15 |
| Košice | 0 | 1 |
| Nitra | 0 | 1 |
| Piešťany | 0 | 1 |
| Bojnice | 0 | 1 |

Bratislava's 15 includes the 9 from task 42 and Rio from this one. It meets
the credible-guide bar in full: 15 active bars, 15 with descriptions, 3 with
photos, and an intro written today.

The four new single-bar cities are live, linked and followable but noindexed
under task 43's rule until each reaches four. That is the intended behaviour.

## Method note worth keeping

This researcher found the technique that unlocks Instagram-only venues, and it
should go into the programme doc: `instagram.com/p/<id>/embed/captioned/`
returns full post captions while logged out. Záhir is listed only because of
it, since zahir.sk is a "coming soon" placeholder with no address and the
address came from the bar's own caption. Reading `meta[name="description"]`
for the complete bio, and the grid images' alt text for post dates, both
survive Instagram's age gates where everything else returns nothing.

All five are in `claude/indexing-queue.json` and all five publish a venue
inbox, so they are in the outreach candidate list.
