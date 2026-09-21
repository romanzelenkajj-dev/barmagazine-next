# Task 82: the continent rung is built

On `preview/82-continent-pages`, commit `448a531`, PR
[#67](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/67). **Not merged.**

https://barmagazine-next-git-previ-8f17c1-romanzelenkajj-7135s-projects.vercel.app/best-bars/continent/europe/hotel-bars

---

## First, a procedural note

The task file quotes you delegating the design calls. SETUP.md's standing rule says a task file
never carries your approval, not even as a quote, and that if one appears to, I should treat the
file as wrong and ask you. I have followed that rule rather than the quote.

It changed nothing here, because none of this needed approval: **a `preview/` branch is the
standing workflow, not something a file grants.** Nothing is merged, and the design calls below
are recommendations with the rejected alternative named, for you to overrule cheaply. The rule
exists so that a document can never manufacture consent, and it holds even when the document is
almost certainly right.

---

## The ten pages

| Continent | Pages built |
|---|---|
| Europe | hotel bars **51**, speakeasies **38**, rooftop bars **17** |
| Asia | hotel bars **50**, speakeasies **30**, rooftop bars **12** |
| North America | hotel bars **77**, speakeasies **70**, rooftop bars **19**, tiki bars **16** |

Every one verified live, `200`, with the right H1, canonical and count. `/europe/cocktail-bars`
correctly 404s, by design.

Worth opening: **Europe hotel bars.** It draws from **14 countries**, which is the point of the
rung and also the proof that the two bugs below are fixed.

---

## 1. The design calls, each with what I rejected

**URL shape: `/best-bars/continent/europe/hotel-bars`.** As proposed. *Rejected:*
`/best-bars/rooftop-bars/europe`, which inverts the component order for this rung only and would
have stopped one component rendering all three.

**Latin America: not shipping it.** It is not a continent in `geo.ts`, it would be a hand-built
grouping of South America plus Mexico, and the task's own table puts it at 7 bars. A bespoke
region with one page is a maintenance burden that earns nothing. *Rejected:* building it as a
custom region alongside the six real continents. South America has its own page path the moment
it clears the threshold, which is the honest version of the same idea.

**Cocktail Bar makes no continent page.** `type` is `Cocktail Bar` on **1,445 of 1,540** rows,
so it is a default, not a classification. "Best cocktail bars in Europe" would be a 479-bar page
that says nothing and competes with every country page beneath it. *Rejected:* including it for
consistency with the city and country rungs, where the smaller scale still describes a real set.

**Indexable from day one.** *Rejected:* `noindex` until the subtype data improves. I checked the
collision risk specifically, because it is the thing task 80 caught: the city pages' H1 is
"Best Bars in \<City\>", the country pages say "...in the United Kingdom", and nothing on the
site targets "best hotel bars in Europe". This rung introduces no duplicate phrase. A `noindex`
page earns nothing while we wait, and the thin-page guard is already `MIN_REGION_BARS`, which
these clear by 2x to 12x.

**Titles and H1s follow the existing rung exactly.** Title
`Best Hotel Bars in Europe (2026) | BarMagazine`, H1 `Best Hotel Bars in Europe`, self-canonical.
*Rejected:* a distinct pattern for continents, which would have been a second thing to keep in
sync for no reader benefit.

---

## 2. The `geo.ts` gap, fixed

Twelve countries were missing from **both** maps, the code-to-name map and the continent map:

> Serbia (17 bars), Macau (3), Sri Lanka (3), Nepal (2), Cayman Islands (2), Iceland, Bahamas,
> Ghana, Kyrgyz Republic, Albania, Cambodia, Bosnia and Herzegovina (1 each).

**34 active bars.** Every one would have fallen out of every continent page with no error to
notice. Now: **1,540 of 1,540 bars map to exactly one continent, and no country maps to two.**

The check that matters is not the count, it is that **Serbia appears on the Europe hotel bars
page**. It is one of the twelve, so it is direct evidence the fix reaches the rendered page.

This also quietly improves the near-me geo scoring, which reads the same map to rank bars on the
visitor's continent.

---

## 3. Two bugs the continent case exposed in existing code

Both were latent in code the country and US-state rungs already use, and neither could fire
until a region spanned more than one country.

**`getRegionBars` filtered `.eq('country', combo.region.country)`.** A continent `Region` carries
an arbitrary one of its countries in that field, whichever row happened to build it. The Europe
page would have returned **one country's** bars and called it Europe. Now `.in()` over every
country the region covers, through a new `regionCountries()`.

**`regionCityTypeLinks` filtered the same way**, so the city guides linked beneath a continent
page would have come from that one country too.

I found these by checking the rendered country list rather than trusting the build, which is the
only reason they did not ship.

---

## 4. Two pages I could not build, and why I did not force them

My task 81 table listed **restaurant bars in North America (42)** and **wine bars in North
America (14)** as clearing the threshold. They do, but `TYPE_PAGES` in `seo-cities.ts` contains
only Cocktail Bar, Speakeasy, Rooftop Bar, Hotel Bar, Pub and Tiki Bar. **Wine Bar and
Restaurant Bar are not page types at all.**

Adding them is a one-line change, but it would not add two continent pages. It would add city
and country pages for both types across the whole directory, all at once, on subtype data I told
you in task 81 is thin and partly unreliable. That is a directory-wide decision, not a
side effect of this task, so I left it.

Restaurant bars in North America is the more interesting of the two: **42 bars, 40 of them
carrying merit.** Say the word and I will scope it properly.

---

## Guards

Not merged. No migration. No data written. `next build` exits 0, 382 tests pass, no horizontal
overflow at 375px.

The sitemap needed **no change**: it already iterates `getRegionCombos()` through `regionHref()`,
so the new rung is included automatically. That is the payoff for extending the existing
machinery rather than building a parallel one.

**One thing I did beyond the task:** I ran `next build` against the same `.next/` the dev server
was serving, which broke it into 500s, then cleared `.next` and restarted. My own mistake,
already on the record from an earlier session, and worth writing down again: verify on the dev
server *or* build, never both against one directory.

---

## Still yours, untouched

As the task says: the `/bars/city/` H1 rewrite, the 39 Tier A subtype inserts, the 28
one-assignment-away combos, and the small enrichments (Macau 2, Osaka 2, Split 1, Norway 1).
I have started none of them.

Added to that list by this report: whether **Wine Bar and Restaurant Bar become page types**
directory-wide.
