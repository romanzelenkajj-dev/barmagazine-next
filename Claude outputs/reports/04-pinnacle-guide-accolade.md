# Report: 04-pinnacle-guide-accolade (2026-09-15, 14:01 to 14:12 PT)

STOPPED FOR ROMAN'S DECISION. Nothing was added to the accolade system and no row was written. Adding an org is a call Roman has kept for himself (accolades-badges-spec.md: passing the process test makes a body eligible; whether a tile is built is a separate decision on how many rows would carry it; Shaker got a count first). Everything up to that decision is done and saved:

- claude/pinnacle-guide-list.json: the complete list, 190 pinned bars (126 one-Pin, 60 two-Pin, 4 three-Pin), with name, city, pins, year, date, url.
- claude/pinnacle-guide-match.json: the match against active rows, by name plus city, nothing written.

## 1. Does The Pinnacle Guide pass the process test? Partly.

From thepinnacleguide.com/about-the-pinnacle-guide/ (their words): a 1, 2 and 3 Pin recognition system "based on a thorough self-application process, rigorous assessment modules, followed by a series of spot check interviews and anonymous in-bar reviews"; 1 Pin "excellent", 2 "outstanding", 3 "exceptional"; six self-nomination modules with published weightings (front of house 20%, and so on); self-nomination is the only route in; applications are always open, with a next submission deadline of November 2026; assessors are "anonymous, local reviewers" recruited openly, no professional prerequisite.

Against the four criteria:
1. Named jury or voting body: PARTLY. The body is The Pinnacle Guide itself, with a founders page; the reviewers are anonymous by design (Michelin-style), so there is no published jury list.
2. Published methodology: YES, in detail (modules, weightings, spot checks, multiple anonymous visits).
3. Annual cycle: PARTLY. It runs in application waves with deadlines, and Pins are announced as bars pass; it is a rolling guide rather than a yearly edition.
4. Results as a ranked or awarded list tied to a year: NO, as published. The site prints no award year on a bar's page or in the list; the only date is the announcement (post publish date). The year the cloud session gave for Bitter & Twisted (2024) is that announcement date (2024-04-29). Every year in the saved list is an announcement year, and the file says so.

It is clearly a jury-assessed programme and not an editorial pick, which is the spirit of Ruling Two. Whether "announcement year" is good enough for the tile's year line, and whether a rolling guide counts as an annual cycle, is the decision. For comparison, the 50 Best and TOTC entries carry the list's own year.

## 2. Two design points in the task that clash with the tile rules, also for Roman

- Org line "PINNACLE GUIDE" is 14 characters; the spec notes JAMES BEARD (11) is already the widest line that fits the 74px tile. It may need "PINNACLE" alone, with the full name on hover.
- Main line "2 PINS" varies per bar. The spec's rule is that the bold line stays constant within a family (the rank is never on the face; SHAKER not TOP 30 for the same reason). A constant main line ("PINNACLE" or "PINS") with the Pin count on hover and in the prose would follow the rule; the task's design breaks it. The Pin count could instead be the region line ("2 PINS" / "PINNACLE" / year) if the region-line convention is acceptable for it.
- The task's "stage/tier field" for the Pin count: there is no such field on Accolade; the natural home is `title` ("2 Pins"), as the category is for TOTC, which also gives the prose its "2 Pins" for free.

## 3. Scoring as proposed (not applied)

3 Pins 600, 2 Pins 570, 1 Pin 540, minus 12 per year before 2026, so Bitter & Twisted's 2024 2-Pin scores 546. Sits between a national listed entry (520) and a national top-10 placing, as the task says. One tile per org per year holds as built today.

## 4. The match (nothing written)

Active rows: 1,348. Method: folded name, exact or contained, AND the same city (Pinnacle's city taken from the post opening, resolved against the directory's own city list; Hong Kong, Dubai and Singapore posts carry no country line, which is why the first pass missed them).

MATCHED, 99 rows: 3 three-Pin (kumiko 2026, line 2026, lyaness 2024), 35 two-Pin, 61 one-Pin; by announcement year 2024: 28, 2025: 55, 2026: 16. Full list with id, slug, pins and year in claude/pinnacle-guide-match.json. Bitter & Twisted: row bitter-and-twisted, id 224d12aa-0eb9-4316-9a21-b731e78a5131, 2 Pins, 2024 (announced 2024-04-29).

RESOLVED BY EYE, 9 more rows I would also write (name spelling or a missing city line kept them out of the automatic set):
- champagne-bar-at-four-seasons-surf-club <- "Champagne Bar at the Surf Club", 3 Pins 2026 (same address, 9011 Collins Avenue)
- nightjar <- "NIGHTJAR SHOREDITCH", 2 Pins 2024 (129 City Road)
- origin-bar <- "ORIGIN BAR", Shangri-La Singapore, 2 Pins 2024
- sexy-fish (London) <- "SEXY FISH LONDON", 2 Pins 2024
- gus-sip-dip <- "Gus' Sip & Dip", Chicago, 1 Pin 2026
- cinquanta-spirito-italiano <- "Cinquanta", Pagani, 1 Pin 2025
- dr-stravinsky <- "Dr Stravinksy" (their typo), Barcelona, 1 Pin 2024
- death-and-co-dc <- "Death & Co. D.C.", 1 Pin 2026
- soma (14 Denman Street, Soho) <- "SOMA SOHO", 1 Pin 2025 (SOMA CANARY WHARF is a second venue with no row)
Total that would carry a Pin: 108.

AMBIGUOUS, NOT TO WRITE (name matches a row in another city, i.e. a different venue): Himitsu (Pinnacle: Dubai; row: Atlanta), SEXY FISH Dubai and Sexy Fish Miami and Sexy Fish Manchester (row is London), SUGAR MONK New York (row monk, Barcelona), RUMORE BAR AMERICANO Milan (bar-americano, Melbourne), Bar Dali Dubai (rd-philadelphia), The Sidecar Dublin (sidecar, New Delhi), THE HIDEOUT Bath (hideout, Taipei), LA PETITE MAISON Dubai (la-petite, Florence), THE LOBBY BAR Montalcino (two other lobby bars), The Dark Horse Bath (Cape Town), Vesper Bar at The Dorchester (vesper, Bangkok), THE AMERICAN BAR AT GLENEAGLES (the-american-bar, London), VELVET BY SALVATORE CALABRESE (velvet, Berlin), SOMA CANARY WHARF (see above). Salmon Guru resolved cleanly to salmon-guru-dubai (the Pin is the Dubai outpost).

NOT IN THE DIRECTORY, 69 (admission candidates for a later wave, not added): 1 three-Pin (none once the Surf Club is matched, so 0), 19 two-Pin: Bateman's (New York), CAAA by Pietro Catalano (Lucerne), COUCH (Birmingham UK), CuCu (Bassano del Grappa), Dover Yard (London), FO+MA (Mexico City), Funky Claude's Bar (Montreux), Gentlemen 1919 (Paris), Kioku Sake Bar (London), Magnus on Water (Maine), N/5 The Bar (St Moritz), Pilina (Maui), Rattlebag (Belfast), Selva (Oaxaca), Strong Water Anaheim, The Cocktail Bar at The Merchant Hotel (Belfast), The Emory (London), The Upper Room at Duddell's (Hong Kong), tbc* (Chester); and 49 one-Pin (full list in the match file: London 10, Toronto 3, Zurich 2, New York 3, Dubai 2, Milan, Detroit, Denver, Phoenix, Providence, Miami, Orlando, Fort Wayne, Sydney, Vancouver, Cardiff, Liverpool, Leeds, Newquay, Isle of Man, Kerry, Thessaloniki, Volos, Cervia, Sorrento, Marzamemi, Vittorio Veneto, Marina di Ravenna, Barcelona, Banff, Little Ned at The Ned NoMad, and others).

## 5. What happens on a go from Roman

Add `pinnacle` ("The Pinnacle Guide") to TILES in src/lib/accolades.ts with the tile wording Roman settles (see section 2), a `pinnacle` branch in accolade-sentences.ts ("The Pinnacle Guide awarded it 2 Pins in 2024.", singular for 1 Pin), scores per section 3, entries `{org:'The Pinnacle Guide', org_key:'pinnacle', kind:'winner', year:<announcement year>, title:'2 Pins', source:<bar's page url>}` on the 108 rows by id through the admin API, tests, deploy, then the checks the task lists (Bitter & Twisted tile and sentence live, dedupe, sitemap count). About an hour of work once the four points above are decided: the year semantics, the tile lines, the field for the Pin count, and whether to write the 9 by-eye matches.

## 6. Not done

- No org key, no code, no row writes, no deploy.
- The 69 unlisted bars are not added (the task said not to).
