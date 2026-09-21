# Finish the coordinates, and stop the geocoder lying about them

Three parts. Part 2 is the one that matters: the 32 rows are a symptom and this is the
cause. Roman asked for the design answer rather than a menu, so it is below with the
reasoning, and you should tell me if the code says I have it wrong.

---

## 1. The remaining stacked bars and the ten with nothing

Verified against production, 2026-09-20: **32 bars on 7 points**, plus **10 active bars with
no coordinates at all**.

| City | Bars on one point |
|---|---|
| New Delhi | 8 |
| Bangkok | 6 |
| Mumbai | 6 |
| Jakarta | 3 |
| Bengaluru | 3 |
| Las Vegas | 3 |
| Tokyo | 3 |

Same method as Macau: diagnose per city before fixing, because Macau turned out to be the
opposite of what was guessed. New Delhi, Bangkok and Mumbai first.

**Las Vegas and Tokyo are the interesting ones.** Mapbox has excellent coverage of both, so a
centroid fallback there is not a coverage problem and probably means the address we hold is
unusable: a resort name with no street, a Japanese address in an order the geocoder cannot
parse, a building name only. Report what you find, because it says something about the
address data rather than the geocoder.

Leave the 41 cities with exactly two on a point. Bar Chenin and Candy Bar really are both
inside The Siren Hotel.

Verify afterwards the same way: distinct points, each in the right district, closest pair
reported.

---

## 2. The geocoder: persist what it already knows

**`geocodeBarWithValidation` already returns `method`**, one of `'address' | 'name' |
'city-centre'` (`src/lib/geocode.ts:168-207`). The function knows perfectly well when it has
fallen back to the centre. **The caller throws that away and writes lat/lng as though every
point were equal.** That is the whole bug. The geocoder is not lying; we are discarding the
part where it tells the truth.

So the answer is not to refuse, and not to add a sanity check. It is to **store `method`**.

**Why not refuse and leave null.** A city-level point is genuinely useful: it pins the bar on
the map in the right city and it is better than absent. What it must never do is take part in
a distance calculation. Refusing would cost the map to fix near-me, and we already have ten
bars proving what absent coordinates look like.

**What to build:**

- A `geo_method` column on `bars`, text, nullable. **DDL goes to Roman, do not run it.** Give
  him the SQL and the one-sentence explanation as you did for the hours migration.
- Every write path that geocodes stores it: the wave insert, the backfill, the owner form if
  it geocodes, and `regeocode-stacked.mjs`.
- Backfill it for the rows you fix in part 1, and for the 32 and any others you can identify
  with confidence. Where you cannot tell, leave it null rather than guessing; null means
  unknown, not exact.
- **Near-me and the distance bands must exclude `city-centre` rows from distance ordering.**
  A bar sitting on the city's centroid is not 400 m from the visitor, and task 87 is about to
  make that number decide what people see. Decide how they should appear instead, listed
  after the ranked ones with no distance shown is my instinct, and say what you chose.
- The map keeps pinning them. Consider whether the pin should look different; your call.

That makes the backlog a query instead of an audit script, which is why this beats fixing 32
rows and moving on.

**Then make the failure loud.** `console.warn` at the point of fallback is invisible inside a
wave. The wave and backfill scripts should count centroid fallbacks and print the names in
the run summary, so a wave that geocodes badly says so at the end instead of looking clean.

### A hole worth checking while you are in there

`nearCity()` at line 164 short-circuits to `true` when `cityLat` is null:

```js
const nearCity = (lat, lng) => cityLat === null || cityLng === null || distanceKm(...) <= MAX;
```

So when Mapbox cannot resolve the city itself, **the validation is switched off entirely** and
step 2 returns whatever the address query gave, unchecked. That is the path that would write a
Macau bar to Brazil rather than to the centroid. I have not found a row that took it, but the
code allows it. Check whether any current coordinate is implausible for its country, and
propose what should happen when the city cannot be resolved. Refusing looks right there,
because without a centre there is nothing to validate against and no centroid to fall back to
either, but it is your call.

---

## 3. Falstaff

`Claude outputs/falstaff/paste-87-88.json` is Roman's paste and it is the **87 to 88 band**,
Falstaff's two-glass tier. Task 86 says not to insert it and the reasoning stands: Baudelaire
is in that band, and so are a burger bar, two street-food venues and several ski-hotel
lounges.

What task 86 needs is the **3 and 4 glass tier, 90 points and up**, and it tells you to drive
Chrome for it because falstaff.com is Cloudflare-blocked to fetch and curl. Roman has been
asked twice for a paste he reasonably thinks he already gave, so **do not ask him again**:
drive the list in Chrome, and if Chrome fails too, say exactly what it does and stop. Do not
fall back to the two-glass band.

---

## Constraints

Nothing visual without a preview. DDL to Roman. Dry run before any write to bar rows, with
counts, as always.

## Report

Per city in part 1: the cause, before and after, distinct points confirmed. For part 2: the
SQL for Roman, what you backfilled and what you left null, how near-me now treats a
`city-centre` row, and what you found about the null-city hole. For part 3: the tier pull, or
exactly how Chrome failed.
