# Approved: stop the directory page cannibalising its siblings, plus the subtype work

Roman's answers to your 80 and 81 reports, this evening. Four approvals and one brief.
Standing rules unchanged: dry run before any insert, `preview/` branch for anything a
visitor sees, nothing to `main` without his explicit go on the preview.

---

## 1. The `/bars/city/` H1 and title: approved in principle, wording is the work

Roman on your proposed "All Bars in Bangkok": *"doesnt make much sense since its not all
the bars really. maybe something different like all Bangkok bars on Barmagazine?"*

He is right and the objection is the whole point. The directory page lists the 34 Bangkok
bars **we** hold, not the bars in Bangkok. A page that overclaims is the same failure as a
page that duplicates, just a different reader noticing.

**One thing you did not flag, and it makes this worse.** The title is cannibalising the
type page as well as the city page:

| Page | Current title | Current H1 |
|---|---|---|
| `/bars/city/bangkok` | **Best Cocktail Bars in Bangkok** | **Best Bars in Bangkok** |
| `/best-bars/bangkok` | The 13 Best Bars in Bangkok (2026) | The 13 Best Bars in Bangkok |
| `/best-bars/bangkok/cocktail-bars` | — | — |

`/best-bars/bangkok/cocktail-bars` exists and sits at position **7.3**. So the directory
page's title claims that page's phrase and its H1 claims the other one's. It is competing
with both siblings simultaneously, and it is the page that should be competing with
neither. Fix the title in the same change as the H1; the title probably matters more here.

### The brief, not the wording

The wording is yours. Roman has said twice today he wants your call on this kind of thing,
and his phrasing above is an instinct about honesty, not a spec. Constraints:

1. **Must not contain "best bars in `<city>`"** in the title or the H1.
2. **Must not contain "best cocktail bars in `<city>`"**, or any type phrase, for the same
   reason. Check against every `<type>` slug that can exist for that city, not just
   cocktail bars.
3. **Must be true of a selective list.** No "all", "every" or "complete" unless it is
   qualified by scope or by a count.
4. **Should read naturally to a human**, because this is the H1 a visitor sees.
5. Same pattern for `/bars/city/` everywhere, generated from the city name, no per-city
   hand-writing.

Directions worth weighing, all of which satisfy the above: a count-scoped form ("34
Bangkok Bars on BarMagazine"), a function form ("Bangkok Bar Directory", "Bar Directory:
Bangkok"), or Roman's scoped form ("All Bangkok Bars on BarMagazine"). A count in the H1
is honest and specific but goes stale in the title if it is cached; say how you handled
that. "Bar directory" is also a phrase Roman wants the site to own, which is worth a
thought but not worth a worse H1.

Pick one, apply it to title, H1 and meta description, and say in a line what you rejected.

**Preview, not a push.** He looks at it before it goes anywhere. Screenshot at 390px and
1440px as usual, and change only these three strings: no layout work on this page.

Afterwards, tell him what to expect and over what horizon, since this is an indexing change
and will not show in Search Console for days.

---

## 2. The 28 one-assignment-away city+type combos: approved

Go. Your method, as you proposed it: volume order, read each city's untagged bars against
their own descriptions and websites, tag only what is unambiguous, and report how many of
the 28 actually converted **before** writing anything. A subtype that is not true is worse
than a missing page, so the honest number may be well under 28 and that is fine.

---

## 3. The 39 Tier A subtype inserts: approved

Go. You read all 39 and they are self-descriptions. Dry run, then insert. Move
`tierA.json` and `tierB.json` out of `/tmp` into `Claude outputs/` first so they survive.

---

## 4. Tier B, the 57 candidates: approved, one at a time

Go, by the method you proposed: work each one against the bar's own site and description,
insert only what is unambiguous, report the count. Artesian, Catbird and Almanac are the
cases that prove the regex cannot do it and you should not try to make it.

If a bar is genuinely ambiguous after you have read its own site, leave it untagged and
list it. An honest gap beats a guess.

---

## 5. The small enrichments: approved

Macau 2 bars, Osaka 2, Split 1, Norway 1. Each one unlocks a page that already has
measured demand: Macau 136 impressions at position 30.8, Osaka 102 at 35.0, Split 25 at
40.6. Same admission rule and insert protocol as waves 1 to 3, `editorial_sources` written
as you insert, dry run and report before applying.

Norway is a country page rather than a city page, so say which city the bar lands in.

---

## Sequencing

1 is independent of everything else and is the biggest single lever, so start there. 3 and
5 are small and can run alongside. 2 depends on nothing but is the most careful work, so it
goes after 1 is on a preview. 4 last.

Task 82 already unblocked the continent pages and the `geo.ts` fix; that is separate from
this file and does not wait on any of it.

## Report

Per section, separately, so he can approve the preview for 1 without being blocked on the
subtype counts. For 2, 3, 4 and 5: dry-run counts first, what you rejected and why, then
ask before inserting.
