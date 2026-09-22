# 105, Wave A (India): 8 bars added, two cities short of target, 2026-09-22

Data only, main branch, no visual change. Active bars 1,654 -> 1,662.

| City | Before | Target | After | Result |
|---|---|---|---|---|
| Pune | 7 | 10 | 7 | short: no unadmitted bar on any source edition |
| Bengaluru | 10 | 15 | 15 | reached |
| New Delhi | 17 rows (16 bars, one duplicate pair) | 20 | 19 rows (18 bars) | short by one: no third qualifying bar |
| Mumbai | 14 | 20 | 15 | short by five: the other listed venues are restaurants |

Page URLs: https://barmagazine.com/bars/city/bengaluru, https://barmagazine.com/bars/city/new-delhi,
https://barmagazine.com/bars/city/mumbai (all three show the new rows live; the create path revalidates).

## Bars added

Admitting source is India's 30 Best Bars, recorded per edition in `editorial_sources` (never as an
accolade). Asia's 50 Best placings are accolade records from the50.com list pages and the official
2023 51-100 announcement. Descriptions use the venue's own words only.

| Bar | Page | Source editions | 50 Best records | Email stored |
|---|---|---|---|---|
| Dali & Gala, Bengaluru | /bars/dali-and-gala-bengaluru | 30 Best 2025 (No.9) | none | none published |
| Muro, Bengaluru | /bars/muro-bengaluru | 30 Best 2025 (No.14), 2024 (No.16) | none | info@muroindia.com |
| The Reservoire, Bengaluru | /bars/the-reservoire-bengaluru | 30 Best 2019 (No.25) | none | thereservoire@gmail.com |
| Sly Granny, Bengaluru | /bars/sly-granny-bengaluru | 30 Best 2019 (No.20) | none | store.blr@slystorys.in |
| Toast & Tonic, Bengaluru | /bars/toast-and-tonic-bengaluru | 30 Best 2021 (No.16), 2019 (No.21) | none | none published |
| Hoots', New Delhi | /bars/hoots-new-delhi | 30 Best 2025, 2024, 2023, 2022, 2021 | a50b 2021 No.59, 2022 No.26, 2023 No.60 | none (no site) |
| Home, New Delhi | /bars/home-new-delhi | 30 Best 2025, 2024, 2023, 2022, 2021 | a50b 2022 No.30, 2023 No.58, 2024 No.96 | concierge@home-delhi.com |
| PCO Mumbai | /bars/pco-mumbai | 30 Best 2024 (No.28), 2023 (No.16) | none (see below) | none: the only address is the group's info@passcodeonly.com, already on the Delhi row |

Emails harvested: 4 (Muro, The Reservoire, Sly Granny Bengaluru, Home). They join the next outreach batch.

All eight geocoded at `address` precision and checked by eye against the venue's own location; the
live award-claims audit passes on all 1,662 active rows.

## Judgment calls, so you can reverse any of them

**Venue type.** The rule was the venue's own first noun. Admitted as Restaurant Bar + Cocktail Bar:
Home ("fine dining restaurant & cocktail bar"), Toast & Tonic ("more than a restaurant and bar",
makes its own tonics, G&T list), Muro ("modern Asian social club": bar, restaurant and coffee
destination; 30 Best's Best Restaurant Bar 2025). Excluded because their own sites call them
restaurants and nothing else: Americano (Mumbai; "neighbourhood restaurant serving California
cuisine", though it has four 30 Best placings and Asia's 50 Best No.57 in 2023), Bandra Born,
Papa's, Ekaa, O Pedro, Bastian, Masque (inactive already), Raahi ("Neo Kitchen & Bar", Instagram
gone). Excluded by category: Gylt (events and parties venue), Byg Brewski, TOIT, Arbor Brewing
(breweries), Perch Vasant Vihar and Perch Mumbai (wine and coffee bars), The Hong Kong Club (club),
Hauz Khas Social (cafe and coworking chain). Gurgaon bars (Comorin, Whisky Samba, Japonico, Lair
Gurgaon) are not New Delhi. If you want Americano in, say so: it is the one exclusion with a real
case, and its own description is the only thing against it.

**Addresses.** Six of eight are the venue's own street line verbatim. Two carry a third-party
line on top of the venue's own material:
- Hoots' has no website; its Instagram gives "Basant Lok, Vasant Vihar" and the market. The unit
  line "18-A, 1st Floor" is from the 50 Best Discovery page and mappls. Geocoded to the market.
- PCO Mumbai's site publishes only a map pin (19.00185, 72.82906) and a Mumbai phone. "NRK House,
  Kamala Mills Compound, Senapati Bapat Marg" is from third parties; the row was geocoded on the
  compound line, which lands 60 m from the bar's own pin, then the building line was restored on
  the address text. The Delhi PCO Instagram no longer mentions Mumbai, and 30 Best 2025 dropped
  it; a June 2026 Harper's Bazaar piece still describes it as open. Worth a look before outreach.
- Home and The Reservoire use the street form the geocoder resolves (the mall's own "2 Nelson
  Mandela Marg, Vasant Kunj II"; "15 JNC Road, 5th Block"). The venues' own wording placed Home on
  Connaught Place and The Reservoire in Indiranagar.

**Hours.** Own-site hours on six rows. Sly Granny Bengaluru and PCO Mumbai publish none, so the
field is empty rather than filled from Zomato. Toast & Tonic's site gives times without days
("12pm-3:30pm, 7pm-11:30pm"), stored as written.

**Instagram.** PCO Mumbai carries the brand account (@passcodeonly); no Mumbai-only account exists.
Sly Granny Bengaluru carries the brand account (@sly.granny). Toast & Tonic has none (the handle
@toastandtonic is an empty account).

## Why the shortfalls are real, not lazy

- **Pune.** Every Pune bar on any edition of India's 30 Best (Cobbler & Crew, Elephant & Co.,
  Paasha, Soy Como Soy) is already listed; no Pune bar appears on any Asia's 50 Best list. Nothing
  to add without padding.
- **New Delhi.** After Hoots' and Home, the only unlisted New Delhi entries on any edition are
  Perch (wine and coffee bar), The Hong Kong Club (nightclub) and Hauz Khas Social (cafe chain).
  Note the page counts 19 rows but 18 bars: `juniper-bar` and `juniper-bar-andaz-delhi` are still
  the same bar (flagged in task 101, not merged without your go).
- **Mumbai.** The city has more 30 Best entries than any other, but after PCO Mumbai every
  unlisted one is a restaurant by its own description (list above). Asia's 50 Best adds nothing
  further: its Mumbai entries are The Bombay Canteen, AER (both in) and Americano.

## Two corrections to earlier notes

- Asia's 50 Best 2023 No.94 is **PCO New Delhi**, not PCO Mumbai (the official 51-100 announcement
  lists it under New Delhi). My pre-wave notes had it on Mumbai; nothing was written on that basis.
- The existing `pco` (Delhi) row has **no accolade records** although it holds that 2023 No.94
  placing (its Instagram claims No.54; the official list says 94). The 2023 51-100 extension was
  not in the cached lists used for task 102, so other rows may be missing 2023 51-100 records too
  (Hideaway, Goa, No.66, for one). Say the word and I backfill from the official announcement.

## Sources reached

India's 30 Best Bars: every edition (2019, 2021, 2022, 2023, 2024, 2025; there was no 2020 list).
Asia's 50 Best: 2021-2026 including 51-100 (2023's extension from the official announcement).
Conde Nast Traveller India Top Restaurant Awards: no bar category found, and the site blocks the
crawler. Top 500 Bars: list pages are rendered as images and could not be read.

## Files

`Claude outputs/105a-india.md` (wave file, as inserted), this report. One push at the end of the
wave. Continuing to Wave B (United States) without waiting.
