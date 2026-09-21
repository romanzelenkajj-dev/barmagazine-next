# The 33 bars without an exact location: find their addresses

Run after task 86. Roman asked why these bars have no exact location and whether he needs
to find them. He does not; this task is that work.

## The facts, checked live 2026-09-21

33 of 1,549 active bars lack an exact location: 23 labelled `geo_method = city-centre`, 10
with no coordinates at all. **31 of the 33 have no street address in the database**, and 24
have neither website nor Instagram. They came in by name and city from award lists, mostly
Asia's 50 Best, and were never enriched. The geocoder had nothing to work with.

| City | Bars |
|---|---|
| New Delhi | 9: Sly Granny, The Piano Man Jazz Club, Prankster, Tamasha, Ek Bar, Juniper Bar, Cocktails & Dreams, The Living Room, Aabbcc |
| Bangkok | 6: Asia Today, Find The Locker Room, Teens of Thailand, Smalls, Tep Bar, Rabbit Hole |
| Mumbai | 6: Masque, Tesouro, Toast & Tonic, Woodside Inn, Miss T, Harbour Bar |
| Bengaluru | 3: Byg Brewski Brewing Company, Bob's Bar, 1Q1 |
| One each | CMYK (Changsha), Door No. 4 (Grand Cayman), Beogradski Koktel Klub (Belgrade), Andre Til Høyre (Oslo), Aruba Day Drink (Tijuana), Chimney (Hangzhou), Cabinet 8 (Kuala Lumpur), Identidad (San Juan), Trillby & Chadwick (Helsinki) |

These are mostly well-known bars. "No website" means none in our data, not none that exists.

## Work

**1. Check each is still open first.** Several were imported a while ago. A closed bar gets
`status: closed` under the usual rule and is not enriched.

**2. Byg Brewski Brewing Company is a brewery.** Roman's admission rule excludes breweries.
Do not enrich it; take it through the excluded-venue-type handling and report it.

**3. For the rest: address, website, Instagram.** Find the bar's own website or Instagram
first and take the address from there. Where the venue publishes none, a reputable directory
is acceptable for the address alone, recorded as its own `editorial_sources` entry, as with
Ista in Osaka. Never take hours from a third party.

**4. Geocode with the new pipeline** and record `geo_method` honestly. The point of this task
is to move rows out of `city-centre`, so report how many actually made it to `address` or
`osm` and how many are still approximate.

**5. A bar you cannot place stays `city-centre`.** Do not guess a point to clear the list.

## Do not insert or change without a dry run

Dry run first: per bar, what you found and from where, open or closed. Then write.

## Report

Per city: enriched, closed, excluded, unresolved. How many left `city-centre`. Anything that
turned out not to be a bar at all.
