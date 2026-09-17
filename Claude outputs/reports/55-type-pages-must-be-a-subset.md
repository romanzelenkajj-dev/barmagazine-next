# Report: 55-type-pages-must-be-a-subset (2026-09-17)

All three fixed and live. Commits `0d45788` and `c6f00f0`.

## The number that says how big this is

| | |
|---|---|
| City and type page pairs in the directory | 96 |
| Type pages listing MORE bars than their city page | **0** |
| Type pages listing the SAME set as their city page | **67** |

**Zero inversions, proved across the whole directory, and by construction
rather than by agreement.** The type list is now derived from the city's list
and then filtered, never computed separately, so a type page cannot list a bar
the city page does not.

**67 of 96 is the finding.** More than two thirds of the type pages are their
city page under a second URL. Almost all are `cocktail-bars`, in cities where
effectively every bar is a cocktail bar: Chicago, Tokyo, Mexico City, Boston,
New Orleans, Toronto, Rome, Vienna, Amsterdam, Budapest, Warsaw, Atlanta and
55 more. That was 67 URLs competing with their own parents.

## Amsterdam, before and after

| Page | Title before | H1 before | Bars | Title after | H1 after | Bars |
|---|---|---|---|---|---|---|
| `/best-bars/amsterdam` | The Best Bars in Amsterdam (2026) | The **5** Best Bars in Amsterdam | 5 | unchanged | The Best Bars in Amsterdam | 5 |
| `/best-bars/amsterdam/cocktail-bars` | The Best Cocktail Bars in Amsterdam (2026) | The **12** Best Cocktail Bars in Amsterdam | **12** | unchanged | The Best Cocktail Bars in Amsterdam | **5** |

The type page went from twelve to five and now carries
`robots: noindex, follow` with its canonical pointing at
`/best-bars/amsterdam`. The URL still returns 200, so nothing that links to it
breaks.

## The three others, which had to stay correct

| Page | Title | H1 | Bars | Robots |
|---|---|---|---|---|
| `/best-bars/bratislava` | The 5 Best Bars in Bratislava (2026) | The 5 Best Bars in Bratislava | 5 | index, follow |
| `/best-bars/london` | The 23 Best Bars in London (2026) | The 23 Best Bars in London | 23 | index, follow |
| `/best-bars/new-york` | The 33 Best Bars in New York (2026) | The 33 Best Bars in New York | 33 | index, follow |

All unchanged, all read off the live site. London and New York have no type
page that clears `MIN_TYPE_BARS` on a non-cocktail type today.

## A regression I caused and caught

My first version returned only the qualified subset, so a type page 404'd
whenever fewer than five of its type qualified. **That took out
`/best-bars/warsaw/rooftop-bars` and `/best-bars/warsaw/hotel-bars`**, both of
which had been live since this morning and hold five and seven bars.

Existence and selection are separate questions. The page exists on
`MIN_TYPE_BARS` over every bar of that type, which the guards said was
unchanged. Only its selection is the qualified subset, and when too few qualify
it falls back over the bars of that type exactly as the city page does, and
drops the number. Both Warsaw pages return 200 again.

## The H1 rule

Applied to both the city page and the type page: whenever the title drops the
number, so does the H1. Amsterdam is the proof, since its title was already
correct and only its H1 was wrong.

## Which I would ship, on your alternative

You raised retitling the duplicate as a plain "Cocktail Bars in Amsterdam"
listing rather than a selection, and asked me to cost it rather than build it.

**I would ship what is now live, the canonical.** The retitle reads more
honestly, and I take the point, but it does not solve the problem it is aimed
at. The two URLs would still hold the same bars, so they would still compete,
and "Cocktail Bars in Amsterdam" and "Best Bars in Amsterdam" are neighbouring
queries rather than distinct ones. You would be choosing better wording over
fewer competing URLs, and at 67 pages the second is worth more.

There is also a cheaper version of your idea already available: Level 3,
`/bars/city/amsterdam`, IS the plain listing of every bar in the city, it
already exists, and both pages above link down to it. A third URL saying the
same thing in different words is the thing to avoid.

The case for the retitle gets stronger the moment a city has a real type mix.
Warsaw is the example: its rooftop and hotel pages are genuinely different
subsets and are indexed normally. The canonical only fires where the sets are
identical, so it withdraws automatically as a city fills out, which is the
behaviour to want.

## Guards kept

Ordering, counts, headings and canonical tags only. No spacing, no card
change, no new component. `MIN_TYPE_BARS` and the noindex rules are unchanged.
378 tests passing, build clean.

One note on the sitemap: it drops a type page when its type count equals the
city's bar count, which is the certain case and covers every one of the 67. A
subtler duplicate, where the non-matching bars simply fail to qualify, is
caught by the page's own canonical and noindex rather than by the sitemap.
