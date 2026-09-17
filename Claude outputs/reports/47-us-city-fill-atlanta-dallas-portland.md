# Report: 47-us-city-fill-atlanta-dallas-portland (2026-09-17)

Done and live. 28 bars inserted, commit `fbba5b3`.

**Atlanta needed nothing.** The task lists it at 4, but this morning's city
coverage wave took it to 13, past the target of 10. So this was a two-city run.

| City | Before | After | Descriptions | Photos | Credible guide |
|---|---|---|---|---|---|
| Atlanta | 13 | 13 | 12 | 0 | photos only |
| Dallas | 3 | 14 | 14 | 0 | photos only |
| Portland, Oregon | 2 | 19 | 19 | 0 | photos only |

All three clear the bar count and the description count and fail only on
photos. Portland, Maine is unaffected and still holds its single bar; every
Oregon row carries state OR.

**New city and type pages:** `/best-bars/dallas/hotel-bars` (5 hotel bars) and
the cocktail-bars page for each city. Intros written for Dallas and Portland.

## The question that decides the next hundred cities

Which of the six sources actually produced, across both cities:

| # | Source | Dallas | Portland | Total | Named it alone |
|---|---|---|---|---|---|
| 1 | Eater city map | 5 | 10 | 15 | 5 |
| 2 | City magazine and alt-weekly | 5 | 5 | 10 | 8 |
| 3 | Competition rosters | 0 | 1 | 1 | 1 |
| 4 | Michelin Guide | 1 | 0 | 1 | 1 |
| 5 | Punch, Imbibe 75, Esquire | 0 | 1 | 1 | 1 |
| 6 | Spirited Awards, James Beard | 0 | 0 | 0 | 0 |

**Yes, this stack can fill a US city to ten. Only the first two tiers matter.**
They produced 25 of the 28 bars and 13 of the 16 that no other source named.
Tiers 3 to 6 produced three bars between them.

The detail behind that:

- **Tier 2 has the best unique yield**, 8 of its 10. The Dallas Observer's
  2026 list deliberately cut club and restaurant venues, which pushed it
  toward rooms Eater skipped; D Magazine's hotel-bar section was the only
  place The Library Bar and The French Room Bar appeared.
- **Tier 1 has the best raw yield and the most overlap**, and it is the
  stalest. Eater's Dallas map was last updated in March 2025 and two of its
  entries, Hide and Rayo, have since closed.
- **Tier 6 produced nothing new in either city**, because by the time a bar
  reaches the Spirited Awards or a James Beard semifinal we already list it.
  Its Oregon names were Too Soon, Palomar and Pacific Standard, all admitted
  higher up, plus Scotch Lodge, already ours. Dallas was the same with
  Ayahuasca Cantina.
- **Tier 3 is dead in Dallas.** Speed Rack's Dallas coverage is 2014-era and
  World Class US has no Dallas finalist. It produced exactly one bar in
  Portland, Panther Club, off a 2025 Northwest regional.

### What I would automate next

1. **Run tiers 1 and 2 only, and spend the saved time on verification.** Tiers
   3 to 6 cost roughly a third of each run for three bars. Keep tier 4 for
   Michelin metros, where it produced Mister Charles, and drop 3, 5 and 6 to a
   single cross-check at the end rather than a search pass.
2. **Eater is blocked to both WebFetch and the Browser pane.** Portland's
   researcher only got the map through the Chrome extension. That is source 1,
   so the next run should start from the extension rather than discovering the
   block each time.
3. **Automate the closure check.** Four of the eleven holds across both cities
   are closed venues that a stale editorial list still names: Deadshot,
   Expatriate, Pink Rabbit, Hide and Rayo. Pink Rabbit is the dangerous shape:
   it closed in July 2026 and its website is still live with old hours. A
   scripted pass over each candidate's own site for a farewell notice, a
   parked domain or a dead TLS certificate would cut the manual work and is
   the single most repetitive thing in these runs.
4. **The duplicate check has to be city-scoped**, which cost me two false
   positives here before I fixed it.

## Two defects caught before insert

**Apothecary in Dallas is not Apothecary in Hong Kong, and The Library Bar in
Dallas is not The Library Bar in New Delhi.** My duplicate detection matched on
name across the whole directory and would have dropped both. It is now scoped
to the city, and separately, a slug already in use takes its city whatever its
shape, so Dallas got `the-library-bar-dallas` instead of colliding.

## Data flags worth carrying forward

- **Rum Club** is the weakest verification in the set: its own site footer
  reads 2011-2024, its menu page is empty and its events page 404s, though its
  hours and Instagram bio agree. Listed with the gap recorded.
- **Apothecary** publishes no ZIP on its own site; 75206 came from the street
  listing and is flagged.
- Five Portland venues publish no ZIP and three print the state as "Oregon",
  normalised to OR.
- **Michelin and James Beard facts are in notes only** for Mister Charles and
  Apothecary. Neither is an accolade until it gets its own verification.

## Indexing and outreach

All 28 are in `claude/indexing-queue.json`. 20 publish a venue inbox and are
added to `Claude outputs/outreach-candidates-2026-09-17.md`, one excluded as a
group inbox.


### Dallas: the 11 inserted

| Bar | Address | Admitted by | Verified from |
|---|---|---|---|
| Apothecary | 1922 Greenville Ave, Dallas, TX 75206 | Eater Dallas | https://apothecary.bar/ |
| Las Almas Rotas | 3615 Parry Avenue, Dallas, TX 75226 | Eater Dallas | https://lasalmasrotas.com/ |
| Saint Valentine | 4800 Bryan St, Dallas, TX 75204 | Eater Dallas | https://saintvalentinedtx.com/ |
| Bar Colette | 3699 McKinney Avenue #306, Dallas, TX 75204 | Eater Dallas | https://www.barcolette.com/ |
| The Mansion Bar | 2821 Turtle Creek Blvd., Dallas, TX 75219 | Eater Dallas | https://www.rosewoodhotels.com/en/mansion-on-turtle- |
| Parliament | 2418 Allen St, Dallas, TX 75204 | Dallas Observer | https://www.parliamentdallas.com/ |
| Armoury D.E. | 2714 Elm Street, Dallas, TX 75226 | Dallas Observer | https://armouryde.com/ |
| Clifton Club | 3333 N. Fitzhugh Ave, Dallas, TX 75204 | Dallas Observer | https://cliftonclubdallas.com/ |
| Mister Charles | 3219 Knox Street, Suite 170, Dallas, TX 75205 | Michelin Guide Texas | https://themistercharles.com/ |
| The Library Bar | 3015 Oak Lawn Avenue, Dallas, TX 75219 | D Magazine | https://www.librarybardallas.com/contact-and-locatio |
| The French Room Bar | 1321 Commerce Street, Dallas, TX 75202 | D Magazine | https://www.adolphus.com/restaurants-bars/the-french |

**Held in Dallas (6)**

| Bar | Why |
|---|---|
| Bowen House | HELD. The venue's own website at bowenhousedallas.com would not load on repeated attempts, so the street address, ZIP and printed hours could not be taken from the venue itself. Th |
| Jettison | HELD. The venue's own site prints the full address and an email but publishes no opening hours, and the Instagram bio (your cozy, classy neighborhood bar) prints none either, so ho |
| Black Swan Saloon | HELD. No venue-controlled website could be found. The Instagram account @blackswansaloon belongs to founder Gabe Sanchez and carries no bio text, no address and no hours, so addres |
| Kilmac's | HELD. The venue's own site prints the address without a ZIP and publishes no opening hours, so neither could be confirmed. The site describes it as an Irish cocktail pub next door  |
| Hide | HELD, likely closed. The venue's own site at hide.bar could not be loaded (TLS failure via fetch, navigation refused in the browser), so current trading could not be confirmed from |
| Rayo | HELD, appears closed. The venue's own website refuses connections on repeated attempts, and the operator's own Facebook page is reported to state that the bar has come to an end. C |

### Portland, Oregon: the 17 inserted

| Bar | Address | Admitted by | Verified from |
|---|---|---|---|
| Multnomah Whiskey Library | 1124 SW Alder St, Portland, OR 97205 | Eater Portland | https://mwlpdx.com/ |
| Teardrop Lounge | 1015 NW Everett St, Portland, OR 97209 | Eater Portland | https://www.teardroplounge.com/ |
| Comala | 422 NW 8th Ave, Portland, OR 97209 | Eater Portland | https://www.barcomala.com/ |
| Rum Club | 720 SE Sandy Boulevard, Portland, OR 97214 | Eater Portland | https://rumclubpdx.com/ |
| Bible Club | 6716 SE 16th Ave, Portland, OR 97202 | Eater Portland | https://www.bibleclubpdx.com/contact |
| Hale Pele | 2733 NE Broadway, Portland, OR 97232 | Eater Portland | https://halepele.com/ |
| Angel Face | 14 NE 28th Avenue, Portland, OR 97232 | Eater Portland | https://www.angelfaceportland.com/pages/hours-locati |
| Bellwether Bar | 6031 SE Stark St, Portland, OR 97215 | Eater Portland | https://www.bellwetherportland.com/ |
| Arbor Hall | 7907 SE Stark St, Portland, OR 97215 | Eater Portland | https://arborhallpdx.com/ |
| Pacific Standard | 100 NE MLK Blvd, Portland, OR 97232 | Eater Portland | https://kexhotels.com/eat-drink/pacificstandard |
| Palomar | 1422 NW 23rd Ave, Portland, OR 97210 | Portland Monthly | https://www.barpalomar.com/ |
| Too Soon | 18 NE 28th Avenue, Portland, OR 97232 | Portland Monthly | https://toosoonpdx.com/ |
| Creepy's | 627 SE Morrison St, Portland, OR 97214 | Willamette Week | https://creepyspdx.com/ |
| Dear Sandy | 2800 NE Sandy Blvd, Portland, OR 97232 | Willamette Week | https://www.dearsandypdx.com/contact-us/ |
| Malpractice | 77 SE Yamhill St, Portland, OR 97214 | Portland Monthly | https://malpracticepdx.com/ |
| Panther Club | 726 SE 6th Ave, Portland, OR 97214 | Speed Rack | https://www.instagram.com/pantherclubpdx/ |
| Driftwood Room | 729 SW 15th Ave, Portland, OR 97205 | Punch | https://www.hoteldeluxe.com/dining/driftwood-room/ |

**Held in Portland, Oregon (5)**

| Bar | Why |
|---|---|
| Grandma's Secret | HELD on address only. The bar is clearly trading: its own Instagram posted fall hours on September 8, 2026 and a cocktail post on August 22, 2026, and the bio prints hours and a pr |
| Sousol | HELD. The venue's own Instagram bio now describes the room as home to a barbecue residency, with daytime hours of Friday 12pm to 8pm and Saturday and Sunday 1pm to 8pm, or until so |
| Deadshot | HELD, closed. The bar's own website now carries only a farewell message thanking Portland for the last eight years. Do not list. |
| Expatriate | HELD, closed. The last dated post on the bar's own Instagram is January 30, 2026, and expatriatepdx.com now redirects to a parked domain lander. Regional press reports the bar clos |
| Pink Rabbit | HELD, closed. The bar's own Instagram bio reads closed July 2026 after five years. The website is still live with old hours, which is misleading. Do not list. |
