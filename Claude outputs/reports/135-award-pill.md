# Task 135, award pill on best-bars cards

Status: merged (PR #94, Roman, 2026-09-25) and live; confirmed on /best-bars/london. Typo fix live.

## Award pill

- Best-bars cards (/best-bars/<city> and /best-bars/<city>/<type>) now read TOP 10 · <award> · <type>.
- One pill: the bar's highest-scored renderable accolade (the stored `score` the profile tiles sort by; stage breaks ties). No award, no pill.
- Nominations are skipped (a nomination is not an award). The Pinnacle Guide is the exception: it stores its 1 Pin grade as `nominee` only to draw the tile outlined, and 1 Pin is a grade the bar holds, so it counts.
- Labels: 50 BEST (world list), ASIA'S 50 BEST, EUROPE'S 50 BEST, NORTH AMERICA'S 50 BEST, SPIRITED, BARTENDERS' CHOICE, JAMES BEARD, 30 BEST BARS INDIA, SHAKER AWARDS, PINNACLE.
- Style: the award-hub gold 50 BEST pill; a new `--award` modifier shares the same CSS rule. Same height as TOP 10 (22px measured).
- /bars/city cards use a different component (DirectoryBarCard, pills on the photo), so they are unchanged, as instructed.

Worth a look on the preview: scores decide, so Artesian shows PINNACLE (2024, 3 Pins) rather than its older 50 Best placings, which have decayed below it.

London, as rendered: TOP 10 bars all 50 BEST except Side Hustle (SPIRITED); Waltz EUROPE'S 50 BEST; Artesian, Equal Parts, Florattica, Murder Inc, Sexy Fish, Soma, The American Bar, The Cocktail Trading Company, The Spy Bar, Viajante87 PINNACLE; FlipDog and The Fumoir no pill.
Barcelona: Kyara, Monk, Morro Fi and Terraza Verbena no pill (no accolades); 14 de la Rosa and Aldea EUROPE'S 50 BEST; the other TOP 10 bars 50 BEST.

Preview: https://barmagazine-next-git-previ-8e0e3b-romanzelenkajj-7135s-projects.vercel.app/best-bars/london and /best-bars/barcelona (Vercel login).

Tests 562 pass (5 new), tsc and lint clean.

## "centerd" sweep (live)

Six descriptions carried "centerd"; all corrected to "centered" (the spelling the site already uses; no "centred" anywhere) via the admin API and confirmed on the live pages: dr-stravinsky, bird, bisou-canal, especiarium-bar-barcelona, land-bar-artisan, tess-bar-kitchen-singapore. No other field had it.
