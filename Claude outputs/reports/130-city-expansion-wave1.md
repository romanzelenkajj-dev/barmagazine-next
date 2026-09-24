# Task 130: city expansion, wave 1

Date: 2026-09-24. Data inserted live; the metro rollup waits on PR #89.

## Outcome

94 bars added across 23 cities. Every city on the list now has at least six admitted bars and a live, indexable best-bars page, with two exceptions. Durham has four; with PR #89 it folds into Raleigh, whose page then carries ten. Calgary already had six, so nothing was added there. The plan doc named in the task, claude/city-expansion-plan-2026-09-24.md, was not in the repo, on the remote, in the Claude project folders or on Spotlight, so the work followed the task message and live database counts. Several of the scraped counts were floors, as expected.

A city's best-bars page carries a number in its title only when five or more bars hold a selective source (an accolade, a Top 10 pick, an article, a paid tier, or a selective list). Below five the page still exists and is indexable, but it shows the top five and drops the number. Ten cities now carry a numbered title; thirteen are unnumbered.

| City | Before | Added | Now | Best-bars page | Slugs added |
|---|---|---|---|---|---|
| Abu Dhabi | 2 | 5 | 7 | [/best-bars/abu-dhabi](https://barmagazine.com/best-bars/abu-dhabi) "The Best Bars in Abu Dhabi" (top five shown, 4 qualify) | 18-degrees-bar-terrace-abu-dhabi, dragons-tooth-abu-dhabi, hidden-bar-abu-dhabi, perlage-abu-dhabi, the-st-regis-bar-abu-dhabi |
| Beijing | 2 | 4 | 6 | [/best-bars/beijing](https://barmagazine.com/best-bars/beijing) "The Best Bars in Beijing" (top five shown, 2 qualify) | atmosphere-beijing, centro-beijing, mei-beijing, mo-bar-beijing |
| Bologna | 2 | 4 | 6 | [/best-bars/bologna](https://barmagazine.com/best-bars/bologna) "The Best Bars in Bologna" (top five shown, 4 qualify) | bamboo-lounge-bologna, donkey-bologna, guero-bologna, i-conoscenti-bologna |
| Bordeaux | 2 | 4 | 6 | [/best-bars/bordeaux](https://barmagazine.com/best-bars/bordeaux) "The 5 Best Bars in Bordeaux" | aux-quatre-coins-du-vin-bordeaux, bar-casa-bordeaux, la-drolerie-bordeaux, point-rouge-bordeaux |
| Brussels | 2 | 7 | 9 | [/best-bars/brussels](https://barmagazine.com/best-bars/brussels) "The Best Bars in Brussels" (top five shown, 3 qualify) | chemistry-and-botanics-brussels, confessions-brussels, la-pharmacie-anglaise-brussels, larchiduc-brussels, life-is-beautiful-brussels, the-modern-alchemist-brussels, under-the-stairs-brussels |
| Cartagena | 4 | 3 | 7 | [/best-bars/cartagena](https://barmagazine.com/best-bars/cartagena) "The Best Bars in Cartagena" (top five shown, 2 qualify) | bar-lelarge-cartagena, botika-santa-clara-bar-cartagena, el-coro-lounge-bar-cartagena |
| Gdańsk | 2 | 4 | 6 | [/best-bars/gdansk](https://barmagazine.com/best-bars/gdansk) "The Best Bars in Gdańsk" (top five shown, 4 qualify) | dom-whisky-cocktail-bar-gdansk, eliksir-gdansk, high-5-terrace-bar-gdansk, monk-gdansk |
| Geneva | 5 | 2 | 7 | [/best-bars/geneva](https://barmagazine.com/best-bars/geneva) "The 7 Best Bars in Geneva" | mo-bar-geneva, rivage-cafe-geneva |
| Glasgow | 2 | 6 | 8 | [/best-bars/glasgow](https://barmagazine.com/best-bars/glasgow) "The 6 Best Bars in Glasgow" | kelvingrove-cafe-glasgow, sebbs-glasgow, tabac-glasgow, the-gate-glasgow, the-locale-glasgow, the-spiritualist-glasgow |
| Guadalajara | 2 | 4 | 6 | [/best-bars/guadalajara](https://barmagazine.com/best-bars/guadalajara) "The Best Bars in Guadalajara" (top five shown, 4 qualify) | de-la-o-cantina-guadalajara, farmacia-rita-perez-guadalajara, galgo-guadalajara, guilty-guadalajara |
| Guangzhou | 2 | 4 | 6 | [/best-bars/guangzhou](https://barmagazine.com/best-bars/guangzhou) "The Best Bars in Guangzhou" (top five shown, 1 qualify) | dsk-cocktail-club-guangzhou, liang-guangzhou, the-loft-guangzhou, too-high-guangzhou |
| Hanoi | 4 | 4 | 8 | [/best-bars/hanoi](https://barmagazine.com/best-bars/hanoi) "The 7 Best Bars in Hanoi" | angelina-hanoi, kumquat-tree-hanoi, ne-cocktail-bar-hanoi, use-bar-hanoi |
| Istanbul | 3 | 3 | 6 | [/best-bars/istanbul](https://barmagazine.com/best-bars/istanbul) "The Best Bars in Istanbul" (top five shown, 1 qualify) | ciragan-bar-istanbul, mikla-bar-istanbul, writers-bar-istanbul |
| Lyon | 4 | 4 | 8 | [/best-bars/lyon](https://barmagazine.com/best-bars/lyon) "The 6 Best Bars in Lyon" | lartchimiste-lyon, le-comptoir-de-la-bourse-lyon, sauvage-lyon, soda-bar-lyon |
| Manchester | 2 | 5 | 7 | [/best-bars/manchester](https://barmagazine.com/best-bars/manchester) "The 5 Best Bars in Manchester" | 10-tib-lane-manchester, arcane-manchester, cloud-23-manchester, henry-c-manchester, the-daisy-manchester |
| Naples | 2 | 4 | 6 | [/best-bars/naples](https://barmagazine.com/best-bars/naples) "The Best Bars in Naples" (top five shown, 4 qualify) | anthill-naples, astronomia-naples, bidder-bar-naples, grand-tour-cocktail-boutique-naples |
| Porto | 2 | 6 | 8 | [/best-bars/porto](https://barmagazine.com/best-bars/porto) "The 5 Best Bars in Porto" | 17-bar-porto, big-bad-bank-bar-porto, curioso-porto, onterrace-porto, prova-porto, terraplana-porto |
| Shenzhen | 2 | 4 | 6 | [/best-bars/shenzhen](https://barmagazine.com/best-bars/shenzhen) "The 5 Best Bars in Shenzhen" | alcove-shenzhen, bar-sanyou-shenzhen, hope-sesame-shenzhen, long-bar-shenzhen |
| Split | 4 | 3 | 7 | [/best-bars/split](https://barmagazine.com/best-bars/split) "The Best Bars in Split" (top five shown, 4 qualify) | bar-split-split, roof-68-split, split-rooftop-bar-split |
| Stuttgart | 5 | 3 | 8 | [/best-bars/stuttgart](https://barmagazine.com/best-bars/stuttgart) "The 8 Best Bars in Stuttgart" | bar-stuttgart, paul-george-stuttgart, schwarz-weiss-bar-stuttgart |
| Turin | 2 | 5 | 7 | [/best-bars/turin](https://barmagazine.com/best-bars/turin) "The 5 Best Bars in Turin" | affini-turin, azotea-turin, bar-cavour-turin, d-one-turin, smile-tree-turin |
| Wrocław | 2 | 4 | 6 | [/best-bars/wroclaw](https://barmagazine.com/best-bars/wroclaw) "The Best Bars in Wrocław" (top five shown, 2 qualify) | dom-whisky-cocktail-bar-wroclaw, papa-bar-wroclaw, schody-donikad-wroclaw, szkocka-cocktail-bar-wroclaw |
| Zagreb | 5 | 2 | 7 | [/best-bars/zagreb](https://barmagazine.com/best-bars/zagreb) "The Best Bars in Zagreb" (top five shown, 2 qualify) | blend-bar-zagreb, esplanade-1925-lounge-cocktail-bar-zagreb |

Also, outside the 23: Calgary 6 bars, page live, 3 qualify. Raleigh 6 bars, page live, 3 qualify; 10 with Durham after PR #89.

Where one of the six is a wine or whisky bar, it is admitted under the standing rule (wine bars in, typed Wine Bar): Bordeaux (Aux Quatre Coins du Vin), Porto (Prova), Beijing (Centro), Wrocław (Szkocka, a whisky bar with cocktails). Glasgow's The Gate is typed Pub with Cocktail Bar and Whiskey Bar subtypes, because it calls itself a pub.

## Fixes in the same run

- **Metro rollup, draft PR #89, not merged.** Long Beach folds into Los Angeles, reversing the 19 September call, as instructed. Durham folds into Raleigh as the Triangle: a metro can only carry a real city name, and Raleigh is the larger city with the existing page. Palm Beach does not fold: it is about 70 miles north in Palm Beach County, which fails the night-out test the other lines pass; one line to add if wanted. Miami Beach, Beverly Hills, Santa Monica, Somerville, Decatur, Avondale Estates and Makati were already folded and live. No best-bars URL is lost.
- **Hong Kong, China.** The Wise King (active, temporarily closed) and Mostly Harmless (inactive) now read country Hong Kong. Live.
- **Washington DC.** Already consistent: all 16 rows and both pages use "Washington DC". Nothing changed.
- **Wrocław slug bug, fixed on main and live.** The slug builder turned ł into a hyphen, so the city lived at /wroc-aw. It now transliterates the Latin letters that do not decompose (ł, đ, ø, æ, œ, ß, þ, ı, ħ), and /bars/city/wroc-aw and /best-bars/wroc-aw 301 to /wroclaw. Wrocław was the only active city affected.

## How the rows were built

Research ran in seven parallel groups, research only. I checked every row, then inserted through the existing wave pipeline (scripts/wave-insert.mjs), dry run first, with its Falstaff and venue-type guards. The three verified wave files are the audit record: Claude outputs/130-city-expansion-wave1-batch1/2/3-verified.md.

- Every address comes from the venue's own site, its hotel's site or its Instagram. Hours are stored exactly as published. Where a venue printed no days, the hours carry none, and closed days are written only where the venue states them.
- Descriptions say only what the venue says about itself and name no award. Every row: award-claims audit 0 problems across 1,886 active bars, description lint 0 no-food phrases, no em or en dashes, no Falstaff in any visitor field.
- Falstaff appears only in editorial_sources, never in visitor copy. One Geneva candidate was dropped because its name, Bambou, existed only in Falstaff.
- Sources the research agents flagged as auto-generated (Ted Valentin's hotel-bar guide, barsforKings) and a rival bar's own "Top 7" blog post were removed, so no bar qualifies on them.
- Geocoding: mainland China and a few hotel addresses landed on district or city centres. Fifteen rows were re-placed from OpenStreetMap on the hotel or building itself: Too High, LIÁNG, The Loft, DSK, Long Bar Shenzhen, Hope & Sesame Shenzhen, Bar SanYou Shenzhen, Alcove, Centro, MEI, Atmosphere, Hidden Bar, Dragon's Tooth, Eliksir and I Conoscenti. The only remaining shared points are genuine same-hotel pairs.

Held back rather than inserted: Dusk Til Pawn (Manchester, only a sitemap date for 2026), Santo (Naples, group template with the wrong address), Ruggine (Bologna, trading at a temporary park address during building works), Eredi Borgnino (Turin, thin 2026 evidence), Pare de Sufrir (Guadalajara, mezcal-led rather than cocktail-led), Mirador (Cartagena, one of its three spaces is a nightclub), Proof (Wrocław, no address on its own channels), Szklarnia (Wrocław, pub and café, nothing dated 2026), SASSY Roof Top and Jungla (Gdańsk, weak evidence, club nights), Long Bar and Orient Bar (Istanbul, live-music nights only and closed for summer), Papillon and Le Bar à Vin (Bordeaux, no 2026 evidence and 10pm close), Cora Caffe and Swanky (café-led), Janes & Hooch (Beijing, closed 2019).

## Photos: contact sheet for approval

outreach/photos-staged/130-contact-sheet.html, images embedded. 64 candidates for 45 bars, each from the bar's own website, interiors only, cropped 3:2, with the exact source URL in NN.source.txt beside each file. Nothing is published. Reply with the slugs to approve (and the number where a bar has two); each goes live credited "Photo: <Bar name>".

I viewed all 80 candidates the research returned and rejected 16 under the rule: back-bar or equipment close-ups (18 Degrees, L'Archiduc twice, DSK, Henry C, BAR Stuttgart), a logo front and centre (Centro), table details rather than the room (10 Tib Lane twice, Szkocka), crowds or staff as the subject (Bar Split, Schody Donikąd, Hope & Sesame Shenzhen), too dark to read (Paul & George), a banquet setup (Papa Bar), and the open-air terraces (Botika, Split Rooftop Bar), which are not interiors. 49 of the 94 new bars have no passing own-site photo and stay without one until an owner supplies it.

## Things to decide

1. **PR #89** (metro rollup). Merging it completes Durham.
2. **The photo sheet.**
3. **Optional, a preview if you want it:** the selective-source check reads only English list titles and does not know Gault&Millau. A Bologna "I 10 migliori" or Brussels's Gault&Millau cocktail guide therefore does not qualify a bar, which is why Brussels, Naples, Bologna and Gdańsk show unnumbered pages despite good sources. Teaching it the local words for "best" and adding Gault&Millau would lift those pages; it changes which bars appear on live best-bars pages, so it would go to preview first.
