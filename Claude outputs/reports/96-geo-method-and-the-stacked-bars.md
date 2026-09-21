# Task 90: geo_method, the validation hole, and the 33 stacked bars

`bars.geo_method` confirmed present before any writing: text, nullable, CHECK rejects a bogus
value with a 23514 and accepts all five plus NULL. All 1,590 rows started NULL.

**PR #71** (`preview/90-geo-method`) for the code. The data work is applied.

---

# 1. What each write path now stores

| Path | Stores |
|---|---|
| `api/admin/geocode-bars` | `r.method`, with the point |
| `api/admin/manage-bar` | `coords.method`. **The wave insert goes through this**, so it is covered |
| `api/admin/submissions` | `coords.method`, on **both** the update and the insert branch |
| `api/bar-submission` | the method appended to the `geo:` note, which had no way to say "this is the Bangkok centroid" |
| `scripts/regeocode-stacked.mjs` | `osm` or `address`, whichever source won. Never `city-centre`: a coarse result is refused there, not stored |
| a point set and checked by hand | `manual` |

**`geocodeBar()` is deleted, not deprecated.** It returned `{lat, lng}` and dropped the method on
the floor, and all four of its callers then wrote a point with no record of what it was. An
exported convenience that quietly discards the one field that matters is how this comes back. The
reason is written where the function used to be.

---

# 2. The nearCity() hole, and the audit

## The hole

```ts
// before
cityLat === null || cityLng === null || distanceKm(...) <= MAX_CITY_DISTANCE_KM
```

`nearCity()` returned **true** when the city could not be resolved. So the 40 km check switched
itself off exactly when it had nothing to compare against, which is precisely when a wrong answer
is most likely, and step 2 returned the raw Mapbox answer unchecked. **That is how a shortened
Jakarta query matched a real address in New Delhi and wrote three bars 5,000 km out.**

It now refuses. No centre means every step falls through to `centre()`, which is also null without
a centre, so the function returns null and the caller leaves the row alone. **Unknown beats
confidently wrong.**

## A test that passed for the wrong reason

My first version of these tests passed before I had written the fix. `MAPBOX_TOKEN` is unset under
vitest, so `geocodeBarDetailed` returned null on line one and the assertion `toBeNull()` was
satisfied without ever reaching the logic. There is now a case whose only job is to prove the stub
is reached, and the others set the token and re-import the module.

## The audit you asked for: no row is currently implausible for its country

I compared every one of the 1,566 rows with coordinates against its own country's median point.
**Three flagged, all three correct**: Bar Leather Apron, Shipwreck Bar and Tikehau Lounge are in
Hawaii, 6,600 km from the continental US median. Reverse-geocoding confirms all three are in the
United States.

So the hole was real in code but has left no live damage, because the four rows it did produce
were caught and reverted on 20 September.

---

# 3. The backfill: proved, not assumed

**I did not use the regeocode log.** That log is from the run that proposed the four wrong points,
and they were reverted, so a log of proposals is not a record of what is stored.

Instead: ask OSM for each candidate's own address today and compare with what is stored.

| | |
|---|---|
| Candidates checked | 20 (15 from the Shanghai/Jakarta/KL run, 5 Macau) |
| **Proved `osm`** | **10**, every one matching at **0 m** |
| Left NULL | 10 (OSM returns nothing for the address, or the stored point is not OSM's) |

The 10 proved: Two Moons and Wing Lei Bar (Macau), Speak Low, Epic, Sober Company, Union Trading
Company, Paal, Pony Up (Shanghai), Bar Trigona, Coley (Kuala Lumpur).

Notably **`coa-shanghai` came back 482 m off and stays NULL**, and `suzu-bar` 256 m off. Guessing
would have mislabelled both.

---

# 4. The stacked bars: the per-city diagnosis is the whole answer

33 bars sat on 7 points. **The split is not about geocoding quality at all.**

| City | Bars | Diagnosis |
|---|---|---|
| New Delhi | 8 | **no address on any row** |
| Bangkok | 6 | **no address on any row** |
| Mumbai | 6 | **no address on any row** |
| Bengaluru | 3 | **no address on any row** |
| Tokyo | 4 | real addresses, four different Ginza blocks |
| Jakarta | 3 | real addresses, three different streets |
| Las Vegas | 3 | real addresses, **all the same building** |

**23 of the 33 have no address at all.** No geocoder can place them; there is nothing to place.
They are now labelled `city-centre`, which is the honest description of where they actually sit.
The script that did it **refuses to label any row that has an address**, so a fixable row cannot
be written off by accident.

## Las Vegas is not a bug

All three are at 3708 Las Vegas Boulevard, The Cosmopolitan. The shared point is **2 m** from that
address's geocode and **7.4 km from the Las Vegas city centre**, so it is a building, not a
centroid. Labelled `address` so nobody "fixes" a correct stack later.

## The 7 that were genuinely wrong: before and after

Mapbox cannot do Ginza. It answered `neighborhood` for every Tokyo address and `locality` for
Jakarta, and the script correctly refused all of them. OSM has these bars as mapped venues:

| Bar | Before | After | Moved | What the point is |
|---|---|---|---|---|
| Bar High Five | 35.6694, 139.7631 | 35.671596, 139.762937 | 0.24 km | OSM `amenity/bar` バー ハイ・ファイブ, Ginza 5-chome |
| Bar Orchard Ginza | 35.6694, 139.7631 | 35.671108, 139.762381 | 0.20 km | OSM `amenity/bar` "Bar Orchard Ginza", Ginza 6-chome |
| Bvlgari Ginza Bar | 35.6694, 139.7631 | 35.672952, 139.767219 | 0.54 km | OSM `amenity/bar` "Bvlgari Ginza Bar", Ginza 2-chome |
| Mori Bar | 35.6694, 139.7631 | 35.670346, 139.761615 | 0.17 km | OSM amenity at 7-5-4 Ginza |
| Knock on Wood | -6.1754, 106.8272 | -6.206741, 106.827280 | 3.48 km | **street**: Jalan Setiabudi Tengah |
| Modernhaus | -6.1754, 106.8272 | -6.232248, 106.810895 | 6.57 km | **street**: Jalan Senopati |
| Pantja | -6.1754, 106.8272 | -6.229366, 106.803493 | 6.55 km | **street**: Jalan Senopati |

**Being straight about the last three: they are street centroids, not doors.** The street is the
one named in the bar's own address and the point is 2 to 5 km from the city centre in the right
neighbourhood, so it is a real improvement over the centroid, but it is not the building. All
seven are `osm`.

**The four Tokyo bars and the three Jakarta bars no longer share a point. Stacking on 3+ points is
now 26 bars: the 23 addressless ones, honestly labelled, and the legitimate Las Vegas building.**

## The 10 with no coordinates

Unchanged and still NULL: Aabbcc, Andre Til Høyre, Aruba Day Drink, Beogradski Koktel Klub,
Cabinet 8, Chimney, CMYK, Door No. 4, Identidad, Trillby & Chadwick. **Eight of the ten have no
address either**, so they are the same problem as the 23, one step earlier. The two that do have
one (CMYK, Door No. 4) are worth a pass and I have not touched them.

---

# 5. How near-me treats a city-centre row, and a trade-off for you

**What I chose:** `getDistKm` returns `Infinity` for a `city-centre` row. It therefore sorts past
every distance band, and its card shows **no distance at all** (`showsDistanceOnCard` already
refuses a non-finite value, so that came free). Only `city-centre` is excluded. **NULL behaves
exactly as it did**, so nothing regresses before the backfill finishes.

Driven in the browser from a stubbed Bangkok location:

| Position | Bar |
|---|---|
| 2 | BKK Social Club, Bangkok, **1.5 mi** |
| 30 | Ho Chi Minh City |
| 150 | Manila |
| 340 | **Melbourne, Australia** |
| anywhere in the first 348 | **none of Bangkok's six city-centre bars** |

The rule works. No card past position 28 shows a distance.

## The trade-off, which I think you should see before this merges

**Teens of Thailand now ranks behind a Melbourne bar for a visitor standing in Bangkok.** That
follows your instruction literally, since Melbourne is a *ranked* bar and the rule is "after the
ranked bars". But it is a real cost: those are good Bangkok bars and the visitor is in Bangkok.

**A better idea, if you want it:** rank a city-centre row by its **city match** rather than by a
distance, so it lands immediately after the measurable bars *in that same city* and still shows no
distance. The reader then sees "here are six more Bangkok bars, no distance given" instead of
finding them behind Australia. It is a small change to the same function.

**I have shipped what you asked for and not this.** Say the word either way.

---

# 6. Failure is loud now

`regeocode-stacked.mjs` and `wave-insert.mjs` both print, on stdout, at the end of the run:

```
6 row(s) NOT geocoded and left exactly as they were:
  bar-high-five (mapbox gave [neighborhood], too coarse)
  modernhaus (... result is 4997km from the city, wrong place)
None of these got a city centre written to them. They keep whatever they had.
```

and the wave script adds a count and the names of every row that got only a city centre, plus
every row that got no coordinates at all. **A run that resolved nothing used to print the same
shape as a run that resolved everything.**

That output above is real: it is the dry run on the seven stacked bars, and it shows the distance
check catching the New Delhi trap a second time.

---

# 7. Coa Shanghai: the address is correct, and the premise is inverted

I checked this against three sources, because you have raised it twice.

| Source | Says |
|---|---|
| 50 Best Discovery | "580 Fuxing Rd(M), **Huangpu**, Shanghai" |
| NOMFLUENCE listing | "now located on Middle Fuxing Road, **previously located in Jing'an on Jiaozhou Road**" |
| SmartShanghai | files it under **Huangpu** |
| The Spirits Business, July 2024 | the relaunch is "a four-storey building on Middle Fuxing Road" |

**Jing'an is the OLD site.** The bar was cleared out of Jiaozhou Road in February 2024 for a
municipal renewal project and reopened on 5 July 2024 at 580 Middle Fuxing Road, which is what our
row says. The Jing'an coverage you have seen is about the 2022 venue.

`580 Fuxing Zhong Lu` is in Huangpu. Our stored point reverse-geocodes to **Huangpu Qu, 200025**,
the correct district on the correct road, so **nothing needed changing**. Its `geo_method` stays
NULL because I cannot prove where the point came from.

**The description was the stale part and was already fixed yesterday**: it no longer describes the
three-floor Jing'an house and now describes the four floors (Taqueria, Cantina, Salón, Mezcaleria)
on Middle Fuxing Road.

---

# Also

**Batch 15 finished: 21 of 22 sent.** Window 2 sent all 11 including Coa on the address you added.
Only The Savory Project was skipped, named on stdout by the guard.
