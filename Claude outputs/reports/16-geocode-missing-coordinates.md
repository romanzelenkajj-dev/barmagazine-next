# Report: 16-geocode-missing-coordinates (2026-09-15, 15:45 to 15:56 PT)

Done: commit 7dad688 (changelog in the next commit). Count before 70, written 60, held 10. Bitter & Twisted renders its map live.

## Count before (paged read, active rows with lat or lng null): 70

Phoenix 11, Hong Kong 10, Tokyo 10, Shanghai 5, Jakarta 3, Lima 3, Bangkok 2, Beijing 2, New York 2, and one each in Belgrade, Buenos Aires, Changsha, Chengdu, Galle, Grand Cayman, Hangzhou, Helsinki, Kuala Lumpur, Kumamoto, Medellín, Miami, Nara, New Delhi, Oslo, Quito, Rio de Janeiro, San José, San Juan, Seoul, Tijuana, Washington DC. Nine of the 70 have no address on the row.

## What was done

1. All 70 dry-run through POST /api/admin/geocode-bars {barIds, dryRun:true} in five chunks of 15 (the existing address-first geocoder with the 40 km guard): 60 resolved by the street address, 10 by the name search, none reported as city-centre and none failed the guard.
2. The 60 address results were written by id through manage-bar update (lat, lng; updated_at stamped, profile and city pages revalidated). 60 written, 0 errors. Bitter & Twisted Cocktail Parlour: 33.446985, -112.074025 (2 E Jefferson St, downtown Phoenix), and the live profile now carries the Location block.
3. The 10 name results were NOT written. Measured against each city's centre, seven of them sit at 0.0 km: Mapbox answers a name search that finds nothing with the city's own place feature, so these were city-centre results wearing the "name" label. The geocoder now reports a name result within 50 m of the centre as city-centre (src/lib/geocode.ts), so this cannot pass as a location again.
4. New check: `npm run audit:coords` (scripts/coords-check.mjs, paged) prints "active rows without coordinates: N" and the list, exit 1 when N > 0. Rule added to claude/data-checks.md under geocoding: every add wave ends with it at zero or a list. There is no single post-wave script in the repo (each wave runs its own insert file, then audit:descriptions and audit:addresses by hand), so the check is a sibling of those two.

## Held for a manual look (10, none written)

| Bar | City | Name result | Why held |
|---|---|---|---|
| Beogradski Koktel Klub | Belgrade | 44.6249, 20.7431 | 31 km from the centre, another town; no address on the row |
| CMYK | Changsha | 28.2489, 113.0761 | the city centre; the address "388 Zhongshan West Road" did not resolve |
| Door No. 4 | Grand Cayman | 19.3087, -81.2385 | 14 km east of George Town, but the address says Seven Mile Beach (north); the address did not resolve |
| Chimney | Hangzhou | 30.2488, 120.2047 | the city centre; no address |
| Trillby & Chadwick | Helsinki | 60.1675, 24.9418 | the city centre; no address |
| Cabinet 8 | Kuala Lumpur | 3.1517, 101.6942 | the city centre; no address |
| aabbcc | New Delhi | 28.5487, 77.2527 | 8 km south of the centre, unverifiable; no address |
| Andre til Høyre | Oslo | 59.9133, 10.7390 | the city centre; no address |
| Identidad | San Juan | 18.4653, -66.1167 | the city centre; no address |
| Aruba Day Drink | Tijuana | 32.5332, -117.0191 | the city centre; no address |

The fix for eight of these is an address on the row (primary source: the bar's own site or Instagram), then a normal geocode. CMYK and Door No. 4 have addresses that Mapbox cannot place; a manual pin would do.

## After

`npm run audit:coords`: active rows without coordinates: 10 (the list above). Tests 309/309, tsc clean. Deploy of 7dad688 plus the changelog commit follows; the data writes are already live (the map is server-rendered from the row, not from the build).
