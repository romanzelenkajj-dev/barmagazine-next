# Task 136c, merges and listing check (from 134 batch 6)

Roman, typed go, 2026-09-26. Applied through the admin API and read back; own sites and Google Business profiles read in Chrome.

## Duplicates merged (merge standard)

| Kept row | Removed row | What moved | Checks |
|---|---|---|---|
| hemingway-bar-prague (Opatovická 1737/3, the only address on the bar's own site) | hemingway-bar (Karolíny Světlé 26) | batch 4 photo and credit ("Photo: Hemingway Bar Prague"), phone, Falstaff source | 301 live (/bars/hemingway-bar to /bars/hemingway-bar-prague), no claims or owner submissions, old row deleted, profile shows the photo |
| juniper-bar-andaz-delhi (menu, highlights, phone, correct Aerocity pin) | juniper-bar (pin about 5 km off) | temporarily closed status and note | 301 live, no claims or owner submissions, old row deleted |

Both logged in claude/implementation-status.md; 301s in src/lib/merged-slugs.ts (commit 08ce85a).

## Wrong websites fixed

| Bar | Was | Now | Source |
|---|---|---|---|
| Ek Bar (New Delhi) | ekbar.in (does not resolve) | https://olivebarandkitchen.com/ekbar.php | the owner group's page: D-17 Defence Colony, 5 PM to 1 AM, +91 81307 59966 (phone and hours added, both were empty) |
| PCO (New Delhi) | passcodehospitality.com/brands/passcode-only-pco/ (404) | https://passcodehospitality.com/brands/pco/ | the operator's live page |
| Monkey Bar (New Delhi) | the Bengaluru page | https://olivebarandkitchen.com/monkey-bar-new-delhi.php | the New Delhi page (Vasant Kunj); hours corrected to Daily 1pm-12:30am. Its held photo (01) was then published. |

## The five dead websites

| Bar | Finding | Change |
|---|---|---|
| Wave Cocktail Bar (Milan) | Google Business: temporarily closed; wavecocktailbar.it is an empty placeholder | status temporarily closed with a note, website cleared |
| The Doping (Milan) | Open: Google Business "The Doping Bar", Aethos Milan, updated by the business; dopingbar.it does not resolve | website set to the hotel's bar page, aethos.com/dining/milan-the-doping |
| Lost My Voice (Berlin) | Replaced: The Circus Hotel's eat-and-drink page now lists 100 GRAMM Vino as its evening bar from summer 2026 and no longer names Lost My Voice; Google Business at Rosenthaler Str. 1 is 100 GRAMM Vino; its domain is a parking page | set inactive |
| Ounce Taipei | Open, moved: its own Facebook page gives 2F, No. 190, Section 2, Xinyi Road, +886 2 2703 7761, Instagram ouncetaipei; Google Business agrees; ouncetaipei.com only forwards to Facebook | address, phone, Instagram, pin (OSM, matches Google); website cleared |
| Pinky Ring by Bruno Mars (Las Vegas) | Open per Google Business (Bellagio, opens 8 PM, categorised as a night club); listed domain does not resolve | website set to the Bellagio page |

Not changed, for your call: 100 GRAMM Vino (the new bar at The Circus Hotel) is not listed; it is a sister of 100 Gramm Bar (Weinbergsweg 25), which is. Pinky Ring is categorised on Google as a night club.
