# Task 79: a bar belongs to a metro and carries the area inside it

On `preview/79-metro-and-area`, commits `980dcfd` and `fb5f544`, PR
[#66](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/66). **Not merged. No
migration run. No bar moved. The rollup list is a proposal and needs your approval line by
line.**

https://barmagazine-next-git-previ-5e2897-romanzelenkajj-7135s-projects.vercel.app/bars

---

## Read this part first

You asked for two things. **One of them works and is on the preview. The other one delivers
almost nothing at current size, and I think you should not build it yet.**

**The dropdown barely shrinks.** Rolling up every suburb I can defend takes it from **217 to
207**. That is 5%. Your lead complaint was "we don't want to have a million cities", and
suburbs are not why you have a million cities. **95 of your 217 cities have exactly one bar**,
and almost none of them are suburbs of anything: Tirana, Sarajevo, Nairobi, Bishkek,
Reykjavík, Montevideo, Accra. They are capitals with one bar each. Cutting the dropdown needs
a different lever, and I have set out three at the end.

**Beverly Hills would not get a page.** The task sets the bar for an area page at five, matching
`MIN_CITY_BARS`. Beverly Hills has **one** bar. So does Santa Monica, Somerville, Miami Beach,
Shawnee, Prospect and St. Clair Shores. Decatur and Makati have two. **Not one proposed rollup
reaches five, now or soon.** Across the whole directory only **four** areas clear five:

| Area | Metro | Bars |
|---|---|---|
| Staré Mesto | Bratislava | 8 |
| Uptown | Oakland | 6 |
| North Loop | Minneapolis | 5 |
| Śródmieście | Warsaw | 5 |

Those are the four area pages the feature would ship with, and 98 of the 119 areas have a
single bar. So taken literally, the change **removes** `/bars/city/beverly-hills` and gives
Beverly Hills nothing back.

**But the thing you actually asked for is the search, and that I have built.** Your words were
"we also want to be found if somebody is looking for bars in Beverly Hills". That does not need
a page. It needs the word to match, and now it does. The area page is the weaker half and the
half that can wait; the search half is the whole point and it works today.

---

## What is on the preview

### 1. The dropdown lists metros

217 options down to 207. Beverly Hills, Santa Monica, Long Beach, Somerville, Decatur,
Avondale Estates, Miami Beach, Shawnee, Prospect, St. Clair Shores and Makati no longer take a
line of their own. Oakland, Los Angeles and Kansas City are all still there.

### 2. Selecting a metro returns its areas

`Los Angeles` now reads **27 bars**, not 24. The three rolled bars render with their own
labels, which is the behaviour worth checking by eye:

| Card | Label |
|---|---|
| Polo Lounge | Beverly Hills, California |
| Not No Bar | Santa Monica, California |
| Baby Gee | Long Beach, California |

Grouped under Los Angeles, labelled by where they actually are.

### 3. Search covers the area

| Typed | Before | Now |
|---|---|---|
| Beverly Hills | Polo Lounge | Polo Lounge |
| Somerville | Spoke Wine Bar | Spoke Wine Bar |
| **North Loop** | **nothing** | **its 5 Minneapolis bars** |
| **Deep Ellum, Butchertown, Midtown East** | **nothing** | their bars |

The suburb half already worked, because `city_ascii` holds the raw city string. **The
neighbourhood half did not work at all**: search ran over `name_ascii`, `city_ascii` and
`country` only, so all 149 bars carrying a neighbourhood were unreachable by it. That is the
real gap this closes.

### 4. Old URLs redirect instead of 404ing

All eleven, verified: `308` permanent, to the metro page.

| Old URL | Lands on |
|---|---|
| `/bars/city/beverly-hills`, `/santa-monica`, `/long-beach` | `/bars/city/los-angeles` |
| `/bars/city/decatur`, `/avondale-estates` | `/bars/city/atlanta` |
| `/bars/city/somerville` | `/bars/city/boston` |
| `/bars/city/miami-beach` | `/bars/city/miami` |
| `/bars/city/prospect` | `/bars/city/louisville` |
| `/bars/city/st-clair-shores` | `/bars/city/detroit` |
| `/bars/city/shawnee` | `/bars/city/kansas-city` |
| `/bars/city/makati` | `/bars/city/manila` |

Controls that must **not** move, checked: `oakland`, `los-angeles`, `portland-or`,
`portland-me`, `lawrence`, `bardstown` all still `200`.

**The SEO risk here is smaller than the task assumes.** I checked rather than inferring: every
one of these pages is **already `noindex, follow`** and **already absent from the sitemap**,
because they sit under `MIN_INDEXABLE_CITY_BARS` (4). Only the bar profile
`/bars/dante-beverly-hills` is in the sitemap, and it does not move. So this is not rescuing
indexed pages, it is keeping internal links and any stray Google memory off a 404. Worth
doing, not urgent.

`/best-bars/<suburb>` needs nothing: those already 404, since one bar is under `MIN_CITY_BARS`.

---

## The structure, and where I departed from the task

The task said to make `city` the metro and `neighborhood` the area, and invited me to say so if
I found a concrete reason that breaks. I found one, so **there is no migration and no bar
moved.**

**The fold happens in `buildCityEntries`, not in the database.** `getBarsForCity` already
queries `.in('city', entry.cityStrings)`, and `CityEntry.cityStrings` is already "every raw
city string the rows use". So listing Beverly Hills on the Los Angeles entry makes the LA page
pick that row up with **nothing written**. The seam was already there; the task's structure was
right and the migration was the only part that was unnecessary.

Three things follow, and they are why I would keep it this way:

1. **`bars.city` keeps saying "Beverly Hills", which is true.** That is what keeps the card
   label correct for free, and it is why I had to change no card code at all.
2. **A wrong line is recoverable.** Delete it and the city comes back exactly as it was. A
   migration that overwrote the column would destroy the original value, and would have to be
   re-run for every bar added afterwards.
3. **`neighborhood` stays the neighbourhood.** The task proposed reusing it for suburbs. On
   real data that loses information: Spoke Wine Bar is in Davis Square, **in** Somerville.
   Putting "Somerville" in `neighborhood` would have overwritten "Davis Square".

**New files:** `src/lib/metro-rollup.ts` (the list and the helpers), `src/lib/city-base.ts`
(the city-name fold, moved to a leaf to avoid an import cycle), `src/lib/metro-rollup.test.ts`
(17 tests).

---

## The proposed rollup list

**Nothing here is approved. Strike any line and I will remove it.** Every one is keyed on
country **and state**, so Decatur, Georgia folds and Decatur, Illinois never will.

| Area | Bars | Metro | Why |
|---|---|---|---|
| Beverly Hills, CA | 1 | Los Angeles | LA County, enclosed by the city |
| Santa Monica, CA | 1 | Los Angeles | LA County, directly adjacent |
| **Long Beach, CA** | 1 | Los Angeles | **The weakest line.** A real city of 460,000 in the LA-Long Beach-Anaheim metro. Strike it if you disagree |
| Decatur, GA | 2 | Atlanta | DeKalb County |
| Avondale Estates, GA | 1 | Atlanta | DeKalb County, borders Decatur |
| Somerville, MA | 1 | Boston | Middlesex County, across the Charles |
| Miami Beach, FL | 1 | Miami | Miami-Dade |
| Prospect, KY | 1 | Louisville | Jefferson County |
| St. Clair Shores, MI | 1 | Detroit | Macomb County, Detroit MSA |
| Shawnee, KS | 1 | Kansas City | Johnson County. **Crosses the state line**, see below |
| Makati, Philippines | 2 | Manila | A city **of** Metro Manila, not a neighbour of it |

### What I deliberately did not roll

- **Oakland (16).** You drew this line in the task and it is the right one.
- **Montecito, CA (1).** Not Los Angeles. It is Santa Barbara, ninety miles up the coast, and
  we have no Santa Barbara.
- **Lawrence, KS (1).** Forty miles from Kansas City, its own metro, a university town.
- **Bardstown, KY (1).** Forty miles from Louisville and the most self-identifying town in
  bourbon country.
- **Palm Beach, FL (1).** West Palm Beach metro, seventy miles from Miami.
- **Durham and Raleigh, NC (1 each).** The Research Triangle, but neither is a suburb of the
  other, so there is no metro name that is not an invention. Flagging rather than guessing.
- **Kailua-Kona and Kihei, HI.** Different islands from Honolulu.
- **St. Louis, Baltimore, Providence, Albuquerque, Honolulu, Columbus (1 each).** Independent
  metros that happen to have one bar. They are thin, not misfiled.

### Outside the US this is almost a non-problem

I checked all 156 non-US cities rather than assuming. **Makati is the only real rollup.** Your
international cities are capitals and major cities, not suburbs: Hvar, Rovinj, Karlovy Vary,
Sorrento, Nara, Tulum, Cannes are destinations in their own right. Two are the *opposite*
problem, too coarse rather than too fine: **Goa** and **Bali** are stored as cities but are a
state and an island. That is a separate question and I have not touched it.

---

## Two bugs the real data found, and one the browser found

Worth knowing because each would have shipped silently.

**Kansas City straddles a state line.** Shawnee is KS, Kansas City is MO. Grouping a rolled row
on its own state split the metro into `kansas-city-ks` and `kansas-city-mo`, the exact opposite
of the point. A rolled row now groups under its **metro's** state.

**A neighbourhood swallowed the suburb.** My first version returned one area name and let the
neighbourhood win, so Spoke Wine Bar's area was "Davis Square" and **"Somerville" disappeared**
, the precise word this feature exists to keep findable. Watch Hill Proper (Norton Commons, in
Prospect) and The S.O.S. Tiki Bar (Downtown Decatur, in Decatur) lost theirs the same way. Both
names are now kept: the finest is displayed, all of them are searched.

**Two server gates made the client work useless on its own.** The directory re-fetches from the
server whenever a filter or search is set, so a row the server never returns cannot be matched
back in. The city filter ran `.eq('city', 'Los Angeles')` and dropped the rolled rows; the
search never queried `neighborhood`. Unit tests and the build both passed with these in place.
Only driving the page caught them.

One caveat I want on the record: **there is no `neighborhood_ascii` column**, so the
neighbourhood clause matches raw text and does **not** accent-fold. "Stare Mesto" will not find
"Staré Mesto"; typing the accents will. Adding that column is a migration, which this task does
not do.

---

## What the dropdown problem actually needs

Rolling up suburbs gets you 217 to 207. If you want it materially shorter, the levers are:

1. **List only cities with N bars, with an "All cities" escape.** Measured, after the rollup:

   | Threshold | Dropdown |
   |---|---|
   | all (today, after rollup) | 207 |
   | 2 or more bars | **121** |
   | 3 or more bars | **91** |
   | 4 or more bars | **80** |
   | 5 or more bars | **76** |

   This is the lever that does what you described. At 3 the list is less than half.
2. **Group the options by country.** `<optgroup>` makes 217 navigable without removing
   anything. Cheapest, changes no data.
3. **Make it a typeahead** rather than a `<select>`. You already have `BarSearchTypeahead`.

Say which and I will build it. **I have not done any of them: you asked for the rollup and the
area pages, and swapping in a different change on my own would be me deciding what you meant.**

---

## Guards

Not merged. No migration. No bar moved, and nothing written to the database at any point. The
rollup list is a proposal awaiting your approval line by line.

`next build` exits 0 and 399 tests pass, including 17 new ones covering the state-line split,
the swallowed suburb, and Oakland staying Oakland.

**One thing I did beyond the task:** I killed a `next dev` server that had been running on port
3000 for **nine days** and restarted it. It predated all of this work and was serving a stale
module graph, which is why my first three verification attempts showed nothing working. No data
involved; it just needed restarting.

**Also worth flagging, not fixed:** `src/app/bars/BarsDirectory.tsx` and
`src/components/BarDirectory.tsx` are **dead code**. Nothing imports either; only
`BarDirectoryMap` is live. They both carry their own city dropdown and search, so they are two
more copies of this logic that will drift. Deleting them is a separate task.

---

## Your call, in one place

1. **The rollup list**, line by line. Long Beach is the one I would most expect you to strike.
2. **Whether to build area pages at all**, given that today it means four pages and Beverly
   Hills is not one of them.
3. **Which dropdown lever** you want, since the rollup does not deliver that on its own.
