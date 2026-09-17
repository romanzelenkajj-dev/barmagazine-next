# Geocode every active bar without coordinates

Roman: Bitter & Twisted Cocktail Parlour (id 224d12aa-0eb9-4316-9a21-b731e78a5131) shows no map because lat/lng are null. The profile hides the map without them.

1. Count active rows with lat or lng null (page the read). Report the count and the city breakdown.
2. Geocode them with the existing address-first geocoder (src/lib/geocode.ts): address, then name + city, then city centre only as a last resort and flagged. Keep the 40 km guard against the city's centre. Write lat/lng by id. Rows that fall to city-centre or fail the guard: do not write, list them for a manual look.
3. Revalidate the touched profiles and confirm Bitter & Twisted renders the map live.
4. Add a check to claude/data-checks.md (and the post-wave script if there is one) so every add wave ends with "active rows without coordinates: 0" or a list.

Report: count before, count written, the flagged list, the commit.
