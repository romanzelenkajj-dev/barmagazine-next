# Task 137, best-bars card order

Status: draft PR #96, revised per Roman (2026-09-26), preview rebuilt, not merged.

## The rule

1. The city's Top 10 picks first, then every other qualifying bar.
2. Inside each group, bars holding an accolade first, ranked by their single best accolade score, highest first.
3. Ties: the total of all accolade scores, then the most recent accolade year, then a bar with a photo first, then the name.
4. Bars with no accolade last in their group: a photo first, then by name.
5. A temporarily closed bar stays last inside its group (Roman: keep). London's Tayēr + Elementary is the one case.

- Featured or Premium status plays no part (it buys position on /bars/city only). No rank numbers on the cards.
- The ItemList JSON-LD renders from the same list, so it follows this order (checked equal to the cards on the local build).
- City/type pages filter the city list, so they follow the same order; thin cities that fall back keep their five bars and show them in this order.
- Confirmed on the preview (Vercel login) on 2026-09-26: https://barmagazine-next-git-previ-749a8e-romanzelenkajj-7135s-projects.vercel.app/best-bars/london and /best-bars/barcelona, both matching the tables below.

Tests: 570 pass (5 for bestBarsOrder), tsc and lint clean.

## New order

### london (29)
| # | Bar | Group | Best score | Total score | Latest year | Photo | Note |
|---|---|---|---|---|---|---|---|
| 1 | Connaught Bar | Top 10 | 1109 | 1973 | 2026 | yes |  |
| 2 | Satan's Whiskers | Top 10 | 1053 | 3323 | 2026 | yes |  |
| 3 | Scarfes Bar | Top 10 | 1015 | 2559 | 2026 | yes |  |
| 4 | Swift | Top 10 | 865 | 2126 | 2024 | yes |  |
| 5 | Three Sheets Soho | Top 10 | 838 | 2924 | 2026 | yes |  |
| 6 | A Bar with Shapes For a Name | Top 10 | 805 | 1324 | 2025 | yes |  |
| 7 | Kwãnt | Top 10 | 793 | 2053 | 2026 | yes |  |
| 8 | Lyaness | Top 10 | 783 | 1359 | 2024 | yes |  |
| 9 | Side Hustle | Top 10 | 761 | 1277 | 2025 | yes |  |
| 10 | Tayēr + Elementary | Top 10 | 1113 | 1969 | 2026 | yes | temporarily closed, last in group |
| 11 | Bar Termini | Qualifying | 845 | 2408 | 2018 | no |  |
| 12 | Three Sheets Dalston | Qualifying | 840 | 840 | 2019 | no |  |
| 13 | Coupette | Qualifying | 823 | 2448 | 2019 | no |  |
| 14 | Waltz | Qualifying | 812 | 812 | 2026 | yes |  |
| 15 | Happiness Forgets | Qualifying | 795 | 3801 | 2019 | yes |  |
| 16 | Nightjar | Qualifying | 755 | 1301 | 2024 | no |  |
| 17 | Callooh Callay | Qualifying | 733 | 2804 | 2016 | no |  |
| 18 | Murder Inc | Qualifying | 558 | 558 | 2025 | yes |  |
| 19 | Artesian | Qualifying | 546 | 546 | 2024 | yes |  |
| 20 | Sexy Fish | Qualifying | 546 | 546 | 2024 | no |  |
| 21 | The Spy Bar | Qualifying | 546 | 546 | 2024 | no |  |
| 22 | The American Bar | Qualifying | 540 | 540 | 2026 | no |  |
| 23 | Equal Parts | Qualifying | 528 | 528 | 2025 | yes |  |
| 24 | Soma | Qualifying | 528 | 528 | 2025 | yes |  |
| 25 | Florattica Rooftop London | Qualifying | 528 | 528 | 2025 | no |  |
| 26 | The Cocktail Trading Company | Qualifying | 528 | 528 | 2025 | no |  |
| 27 | Viajante87 | Qualifying | 516 | 516 | 2024 | no |  |
| 28 | FlipDog | Qualifying | none |  |  | yes |  |
| 29 | The Fumoir | Qualifying | none |  |  | yes |  |
### barcelona (13)
| # | Bar | Group | Best score | Total score | Latest year | Photo | Note |
|---|---|---|---|---|---|---|---|
| 1 | Sips | Top 10 | 1120 | 2012 | 2026 | yes |  |
| 2 | Paradiso | Top 10 | 1117 | 2531 | 2026 | yes |  |
| 3 | Two Schmucks | Top 10 | 893 | 893 | 2021 | yes |  |
| 4 | Boadas | Top 10 | 890 | 2432 | 2026 | yes |  |
| 5 | FOCO | Top 10 | 795 | 2282 | 2026 | yes |  |
| 6 | Dr. Stravinsky | Top 10 | 786 | 1302 | 2025 | yes |  |
| 7 | Dry Martini by Javier de las Muelas | Top 10 | 725 | 2103 | 2013 | no |  |
| 8 | Kyara | Top 10 | none |  |  | yes |  |
| 9 | Monk | Top 10 | none |  |  | no |  |
| 10 | Morro Fi | Top 10 | none |  |  | no |  |
| 11 | Aldea | Qualifying | 800 | 800 | 2026 | no |  |
| 12 | 14 de la Rosa | Qualifying | 764 | 764 | 2026 | no |  |
| 13 | Terraza Verbena | Qualifying | none |  |  | no |  |
