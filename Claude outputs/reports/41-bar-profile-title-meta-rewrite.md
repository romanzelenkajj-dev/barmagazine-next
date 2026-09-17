# Report: 41-bar-profile-title-meta-rewrite (2026-09-17)

Shipped and live. Four commits, because three real defects only showed up in
the served HTML and not in the dry run.

| Commit | What |
|---|---|
| `25aefaa` | the rewrite: `src/lib/bar-seo-meta.ts`, its tests, and the profile metadata |
| `43f13b8` | stop the root title template appending a second BarMagazine |
| `386d14f` | stop a bar saying its own ranking twice in one snippet |
| `3b02e69` | only promise in the title what the row actually has |

## What it does

Titles and descriptions for all 1,360 active bar profiles are now assembled in
code from stored structured fields. The page body, the H1, the stored
description, the canonical and the structured data are untouched.

A title is a ladder, not a template, because no single template fits 1,360
names. A credential outranks the brand and drops it to fit; the generic
promise does not, and shortens instead.

```
Coa, Hong Kong | No. 38 on World's 50 Best 2025
6-10 Shin Hing Street, Hong Kong. Open Tue to Sun, 18:00 to 01:00.
No. 38 on World's 50 Best Bars 2025.
```

A description is street, then hours, then the facts that fit, in order: the
strongest credential, the editorial excerpt, the signature serves, the
neighborhood. A missing field is dropped and the sentence is shorter. Prose is
only ever added in whole sentences.

## Measured over all 1,360

| | Before | After |
|---|---|---|
| Average title length | 62.4 | 54.1 |
| Titles over 60 characters | most of them | 0 |
| Average description length | 374 | 91 |
| Descriptions over 160 characters | most of them | 0 |
| Dangling comma, separator or double space | | 0 |
| Empty descriptions | | 0 |

Coverage of the good stuff: 750 of 1,360 rows have opening hours this can read
without guessing, and 286 carry a credential strong enough for the title.

## Three things the dry run did not catch

**The root layout was appending a second brand.** `src/app/layout.tsx` sets
`template: '%s | BarMagazine'`, so the served title for Coa came out at 61
characters with the brand twice. The profile now passes `title: { absolute }`.
This also corrects the baseline: the OLD titles carried that same appended
brand, so they averaged 62.4 characters, not the 48.4 I first measured. They
were already being truncated by Google before any of this began.

**Coa said its own ranking twice.** Its editorial excerpt is literally
`#38 on World's 50 Best Bars 2025`, which the credential sentence had already
said. Facts are now skipped when everything they say has already been said,
matched on a key that ignores "no.", "#" and "ranked". Only that direction: a
fact that merely contains an earlier word is not a repeat, or "Belgrade's first
craft cocktail bar" would be dropped just because the lead named Belgrade.

**A title promised an address the bar does not have.** Beogradski Koktel Klub
has neither an address nor hours on its row, and its title still read
"Address, Hours & Drinks". That is the old empty snippet in a new costume. The
generic promise is now built from what the row holds, and a row with neither
gets no promise at all.

## The ten verified on the live site

| Bar | Shape | Title before | Len | Title after | Len |
|---|---|---|---|---|---|
| connaught-bar | has accolade, hotel bar | Connaught Bar / Hotel Bar in London, United Kingdom / BarMagazine | 65 | Connaught Bar, London / No. 6 on World's 50 Best 2025 | 53 |
| coa | has accolade, 24 hour country | Coa / Cocktail Bar in Hong Kong / BarMagazine | 45 | Coa, Hong Kong / No. 38 on World's 50 Best 2025 | 47 |
| jewel-box | US, city needs its state | Jewel Box / Cocktail Bar in Portland, Maine / BarMagazine | 57 | Jewel Box, Portland, Maine / Hours & Drinks / BarMagazine | 57 |
| lpm-miami | name already carries the city | LPM Miami / Cocktail Bar in Miami, Florida / BarMagazine | 56 | LPM Miami / Address, Hours & Drinks / BarMagazine | 49 |
| captain-foxhearts-bad-news-bar-spirit-lodge | longest name in the directory | Captain Foxheart's Bad News Bar & Spirit Lodge / Cocktail Bar in Houston, Texas / BarMagazine | 93 | Captain Foxheart's Bad News Bar & Spirit Lodge / BarMagazine | 60 |
| bar-benjamin | no accolade, has hours | Bar Benjamin / Cocktail Bar in Los Angeles, California / BarMagazine | 68 | Bar Benjamin, Los Angeles, California / Hours & Drinks | 54 |
| planta-baja-cocktail-bar | no hours | Planta Baja Cocktail Bar / Cocktail Bar in Madrid, Spain / BarMagazine | 70 | Planta Baja Cocktail Bar, Madrid / Address & Drinks | 51 |
| beogradski-koktel-klub | no address and no hours | Beogradski Koktel Klub / Cocktail Bar in Belgrade, Serbia / BarMagazine | 71 | Beogradski Koktel Klub, Belgrade / BarMagazine | 46 |
| string-s-bar | non-US, no hours | String's Bar / Cocktail Bar in Split, Croatia / BarMagazine | 59 | String's Bar, Split / Address & Drinks / BarMagazine | 52 |
| fix-me-a-drink | no hours, no accolade | Fix me a Drink / Cocktail Bar in Bucharest, Romania / BarMagazine | 65 | Fix me a Drink, Bucharest / Address & Drinks / BarMagazine | 58 |

| Bar | Description before | Len | Description after | Len |
|---|---|---|---|---|
| connaught-bar | The martini trolley that Director of Mixology Agostino Perrone rolls to your table remains the single most elegant ritua... | 723 | 16 Carlos Place, London. Open Mon to Sat, 4pm to 1am. No. 6 on World's 50 Best Bars 2025. | 89 |
| coa | Jay Khan built Asia's definitive agave bar on a narrow Central side street, assembling a mezcal and tequila collection t... | 638 | 6-10 Shin Hing Street, Hong Kong. Open Tue to Sun, 18:00 to 01:00. No. 38 on World's 50 Best Bars 2025. | 103 |
| jewel-box | Jewel Box is a cocktail bar on Congress Street in Portland, Maine, open from six in the evening until one, with alcohol-... | 233 | 644 Congress St, Portland, Maine. Open Tue to Sun, 6pm to 1am. James Beard Award semifinalist for Outstanding Bar in 2023. | 122 |
| lpm-miami | LPM Restaurant & Bar brings the French Riviera to Brickell Bay Drive, with signature cocktails served at a zinc bar in a... | 409 | 1300 Brickell Bay Dr, Miami, Florida. Open Mon to Fri, 12pm to 3pm. Regional honoree for Best U.S. Restaurant Bar at the 2026 Spirited Awards. | 142 |
| captain-foxhearts-bad-news-bar-spirit-lodge | A no-nonsense second-floor saloon in a historic 1800s building on Main Street, a stalwart of Houston's downtown cocktail... | 330 | 308 Main St, Houston, Texas. | 28 |
| bar-benjamin | Ben Shenassafar, co-founder of streetwear brand The Hundreds, partnered with Jared Meisler of Roger Room and Bar Lubitsc... | 591 | 7174 Melrose Avenue, Los Angeles, California. Open Tue to Thu, 6pm to 12am. | 75 |
| planta-baja-cocktail-bar | Planta Baja Cocktail Bar is a cocktail bar in Madrid, Spain. Discover it on BarMagazine, the global bar directory.... | 114 | C/ del Marqués del Duero, 8, Madrid. | 36 |
| beogradski-koktel-klub | A cocktail club in Belgrade, a 2026 Bartender's Choice Awards nominee for Best Cocktail Bar. In 2026 the bar announced t... | 250 | Belgrade. Winner of Best Cocktail Bar at the 2026 Bartenders' Choice Awards. | 76 |
| string-s-bar | String's is a cocktail and guitar bar in Split that pairs a Prohibition-era speakeasy look with a rock and roll soundtra... | 406 | Zagrebačka ul. 1, Split. | 24 |
| fix-me-a-drink | Fix me a Drink is a cocktail bar in Bucharest, Romania. Discover it on BarMagazine, the global bar directory.... | 109 | Strada Ion Brezoianu 23-25, Bucharest. | 38 |

Every one is 60 characters or under. Before the change, eight of the ten were
over. All were read back from the served HTML, not from the local build.

Also checked on the live pages: the canonical is unchanged, `robots` is still
`index, follow`, and all four JSON-LD blocks still parse, including
`BarOrNightclub` and `BreadcrumbList`.

## One deliberate change the task did not ask for

The task allowed the OpenGraph title to stay as it was. It now does more than
stay: **OpenGraph and Twitter carry their own strings**, the old headline and
the bar's own prose. A search snippet and a social card do different jobs, and
"| Address, Hours & Drinks | BarMagazine" reads as spam on a card that is
already showing the photo.

## Two deviations, both deliberate

**The credential keeps its year.** The task's example was
`No. 1 on World's 50 Best`. Ours is `No. 1 on World's 50 Best 2025`. Without a
year that reads as a standing claim, and a 2019 placing is not a standing
claim. Five characters is worth it, and the ladder drops the brand to pay for
them.

**The claim fallback says `barmagazine.com/claim-your-bar`.** Not relevant
here; noted in the task 40 report.

## The baseline, for comparing in two weeks

`Claude outputs/bar-meta-zero-click-baseline.md` holds the tracked cohort:
**66 bar profiles** at position 5 to 15 with at least 30 impressions each and
zero clicks, 4,540 impressions and 0.00% CTR between them, with every title
and description before and after. That reproduces the 65 pages and roughly
5,000 impressions in the task from today's export; the floor of 30 impressions
is what selects them, because a page with three impressions cannot show a CTR
change. The whole zero-click tail is wider: 433 profiles at position 5 to 15
with 6,780 impressions and not one click.

## What this cannot fix, and is worth a task of its own

- **251 rows have no hours, no editorial excerpt and no accolade.** Their
  description is the street and the city and nothing else, and 339 descriptions
  come in under 60 characters for that reason. The snippet is only ever as good
  as the row.
- **41 stored descriptions are boilerplate**, of the form "X is a cocktail bar
  located in Y", sometimes with a fragment stuck on the end: 1Q1's reads
  "1Q1 is a speakeasy located in Bengaluru. Speakeasy concept." Those rows need
  writing, not code.
- **A bar with two service windows shows only the first.** LPM Miami stores
  "Mon-Fri 12pm-3pm, 5pm-11pm; Sat-Sun ..." and the snippet says
  "Open Mon to Fri, 12pm to 3pm". That is true of the days it names but reads
  as though the bar shuts at three. A snippet has no room for a full week; the
  honest fix is a structured hours column rather than free text.

## Checks run

Full suite 359 tests passing, 33 of them new and covering every shape above.
`next lint` clean, no new warnings. `next build` compiled and generated all
718 static pages. `scripts/description-lint.mjs` checked 1,456 rows with zero
food-negation hits.
