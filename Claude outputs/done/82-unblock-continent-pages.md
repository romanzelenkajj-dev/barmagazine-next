# Unblocking task 81 step 3: the design calls are yours

Roman's words, this evening: "I would leave the decision/suggestion to Code." That covers
every open design question in your 81 report. Answers below, then what is still his.

## 1. The URL shape: yours, and your answer stands

`/best-bars/continent/<continent>/<type>` is the shape. Your reasoning is the reasoning:
it is the same family as the two rungs already shipped, type stays last so one component
renders all three, and `continent` cannot collide with a city slug. Build on it. The two
forms the task file suggested were written without knowing
`/best-bars/country/<country>/<type>` already existed, so ignore them.

The same delegation applies to the rest of that list:

- **"Latin America" as a page.** Your call. It is not a continent in `geo.ts` and it sits
  at 7 bars, so if you would not ship it, do not ship it. Say which you chose.
- **Indexable from day one, or `noindex` until the subtype data is better.** Your call,
  and given what you found about the H1 collision, think about whether a new rung can
  duplicate an existing page's phrase before you let Google see it.
- **Titles and H1s for the new pages.** Yours, with the collision problem in mind.

Where you pick between real alternatives, name the one you rejected in a line so he can
overrule you cheaply. Do not come back with a menu.

## 2. `geo.ts` continent gap: fix it, no approval needed

Twelve countries with no continent mapping (Iceland, Serbia, Nepal, Bahamas, Cayman
Islands, Ghana, Kyrgyz Republic, Albania, Macau, Sri Lanka, Cambodia, Bosnia and
Herzegovina) would fall silently out of every continent page. You called it a data
addition to one map rather than a design question and you are right. Fix it as part of
this, before the pages exist. Note it in the report.

## 3. Still Roman's, and he has them in front of him now

Not for you to start: the `/bars/city/` H1 rewrite (option 1 of task 80 step 2), the 39
Tier A subtype inserts, the 28 one-assignment-away combos, and the small enrichments
(Macau 2, Osaka 2, Split 1, Norway 1). He will answer each separately.

## Corrections to 80 and 81 that you were right about

For the record, so the next task file does not repeat them. Three of my claims were wrong
and you caught all three:

- **"Seoul, Shanghai, Madrid, Taipei, Montreal have no best-bars page."** They all do. I
  inferred absence from a `/best-bars/` row missing in a 1,000-row-capped export. Absence
  from a truncated export is not absence of a page, and you were right to check the URLs.
- **"Only Singapore has a subtype with 4 or more bars."** I counted the `subtypes` array
  only and ignored the `type` column, which carries Speakeasy on 33 bars and Hotel Bar on
  29. 25 non-cocktail city+type pages exist.
- **"Region-and-type pages need building."** `/best-bars/country/<country>/<type>` and
  `/best-bars/us/<state>/<type>` shipped on 16 September. Only the continent rung is new.

Your H1-collision finding is the answer to the question both task files were circling, and
neither of them saw it. It goes in the project doc.

## Standing rules unchanged

Dry run before any insert. Anything a visitor sees stays on a `preview/` branch until
Roman approves it; a push to `main` is a publication. This file carries no approval from
him for anything beyond sections 1 and 2.
