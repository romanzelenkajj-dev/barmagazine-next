# Task 97: the 33 bars without an exact location, down to 6

Applied. **25 bars got a real point, 3 turned out not to be bars, 6 remain.**

---

# The headline

| | |
|---|---|
| Bars without an exact location, before | **33** |
| After | **6** |
| Moved out of `city-centre` or no-coordinates | **25** |
| Removed as the wrong venue type | **3** |

**Every centroid stack from task 90 is now gone.** The only point in the directory still carrying
three bars is **3708 Las Vegas Boulevard**, which is one building.

---

# The bug that nearly wrote two bars into the wrong hemisphere

Task 90 closed the hole where the geocoder skipped validation with no city centre. **This is the
same hole somewhere else**, and it caught me out:

A row with **no stored coordinates** has nothing for the distance check to measure against. So on
the first run:

| Bar | Its city | Where the geocoder put it |
|---|---|---|
| **CMYK** | Changsha, China | **Kaohsiung, Taiwan**, 960 km away |
| **Door No. 4** | Grand Cayman | **New South Wales, Australia**, 15,784 km away |

"388 Zhongshan West Road" is a street name that exists all over China and Taiwan. "The Grove" is
everywhere. Both results were `address` granularity, so the granularity check passed them happily.

**The fix is the same shape as the geocoder's own**: when there is no stored point, resolve the
CITY and measure against that instead. Both were then refused with the distance printed, and
**neither was written**. The dry run is what caught this, which is the whole reason the task asked
for one.

---

# Per city

## Bangkok: 6 of 6 enriched

Teens of Thailand, Tep Bar, Asia Today (all Soi Nana in Chinatown), Rabbit Hole and Find The
Locker Room (both Thonglor), Smalls (Suan Phlu). Five of the six from the bar's own Instagram.
Every one moved between 2.5 km and 9.8 km off its city centroid, which is the measure of how
wrong the old points were.

## New Delhi: 6 enriched, 1 closed, 2 not admitted

**Enriched:** Sly Granny (Khan Market), The Piano Man Jazz Club (Safdarjung Enclave), Ek Bar
(Defence Colony), Tamasha (Connaught Place), AABBCC (Vasant Vihar), The Living Room (Hauz Khas).

**Juniper Bar is TEMPORARILY CLOSED.** Hyatt's own page reads "JUNIPER BAR - TEMPORARILY CLOSED"
and the bar is absent from the Andaz Delhi dining list. It stays active with a notice, per the
rule that a temporarily closed bar keeps its profile.

**Prankster is not a bar and not in Delhi.** Its own Instagram calls it "India's First Food and
Brewery Campus" with a microbrewery, and it is in **Gurgaon, Sector 29**. Both grounds for
exclusion at once. Deactivated with the reason recorded.

**Cocktails & Dreams is in GURUGRAM**, Sector 15, not New Delhi. It is a real and well-known
cocktail bar, so this is a city correction rather than an exclusion. **Left alone and flagged**:
moving a row between cities changes a city page's count, and that is your call.

## Mumbai: 3 enriched, 1 not a bar, 1 unresolved, 1 flagged

**Enriched:** Woodside Inn (Colaba), Toast & Tonic (BKC), Miss T (Mandalik Marg).

**Masque is a restaurant.** Prateek Sadhu's ten-course tasting menu in Mahalaxmi, listed on Asia's
50 Best **Restaurants**. Restaurant-first by its own description, the same test that held Fabios.
Deactivated.

**Harbour Bar keeps its city centre.** Mapbox returns only `neighborhood` for the Taj Mahal Palace
address, OSM has nothing for the hotel, and an `address` result I did find resolved to "Sunder,
Mumbai" **3 km from Apollo Bunder**, which is not the Taj. Refused rather than accepted.

**Tesouro cannot be placed in Mumbai at all.** No Mumbai venue of that name turns up anywhere, and
the only Tesouro with a presence is **@tesouro.goa** in Goa. This looks like the same
city-contamination pattern as the rows deleted in task 95, but I have not touched it.

**Miss T carries a warning.** Its address is now stored, but a directory lists it as "Closed Down"
and it has no channel of its own to confirm either way. Enriched, not closed, flagged.

## Bengaluru: 2 enriched, 1 excluded

**1Q1** (Queens Road) and **Bob's Bar** (Indiranagar) enriched.

**Byg Brewski Brewing Company is a brewery**, as the task said. Not enriched. Deactivated with the
reason written into the row, so nobody re-admits it by accident. This is the same handling as Onyx
Coffee Lab and Bow & Arrow, and the importer guard built in task 86 would now catch it at the door.

## The nine singles: 6 enriched, 3 still without coordinates

**Enriched:** Andre Til Høyre (Youngs gate 19, Oslo), Aruba Day Drink (Tijuana), Beogradski Koktel
Klub (Uzun Mirkova 7, Belgrade), Door No. 4 (Seven Mile Beach), Identidad (960 Calle Cerra, San
Juan), Trillby & Chadwick (Katariinankatu, Helsinki).

**Still without coordinates:** Cabinet 8 (Kuala Lumpur), Chimney (Hangzhou), CMYK (Changsha). All
three have a street address now; none of them will resolve. Mapbox answers `postcode`, `place` or
`locality` for each, and OSM has nothing. Chinese and Malaysian street addressing is simply not in
these providers at building level. **They keep no coordinates rather than a guessed point.**

One thing worth recording: **Beogradski Koktel Klub's stored Instagram handle is dead.** The
profile returns "Profile isn't available". The address came from elsewhere and the handle should
probably be cleared.

---

# What is left, and why

| Bar | Why |
|---|---|
| Cabinet 8 (KL) | address known, no provider resolves it |
| Chimney (Hangzhou) | address known, no provider resolves it |
| CMYK (Changsha) | address known, no provider resolves it |
| Harbour Bar (Mumbai) | the Taj will not resolve, and the near-miss was 3 km out |
| Cocktails & Dreams | real bar, wrong city. Your call |
| Tesouro | cannot be placed in Mumbai at all. Probably contamination |

**Not one of them got a guessed point.** That was the instruction and it is the part I would
defend hardest: three of the six would have taken a confident-looking wrong answer if the city
check had not been added.

---

# Sources

Every address came from the bar's own site or Instagram where one exists. Where the venue
publishes neither, a reputable directory supplied the address alone. **No hours were taken from
any third party**, and none were written at all.

`geo_method` across the directory is now `address` 123, `osm` 18, `city-centre` 3, NULL 1,499.
