# Task 128: Heidelberg to eight bars, 2026-09-24 (live)

Heidelberg 2 -> 8. https://barmagazine.com/best-bars/heidelberg answers 200 and carries "index, follow" (it was a 404 with two bars; the page needs five, indexing needs four). Same procedure as 107: every address from the venue's own site or its Falstaff entry, descriptions in the venue's own words, admitting sources in editorial_sources, interiors only for photos, with credit. All six rows were created through the production admin API, so ascii names, geocoding (all six at address precision) and revalidation ran as for any bar.

| Slug | Bar | Type | Address | Admitting source | Photo |
|---|---|---|---|---|---|
| schilling-roofbar-heidelberg | Schilling Roofbar | Rooftop Bar (Cocktail Bar) | Alte Glockengießerei 9, 69115 | Falstaff Bar Guide 2026, 92 points | back bar, courtesy of Schilling Roofbar |
| bent-bar-heidelberg | Bent Bar | Cocktail Bar | Leyergasse 2, 69117 | Falstaff Bar Guide 2026, 90 points | bar room, Nico Schmidt (EXIF credit on the bar's own site image), courtesy of Bent Bar |
| frollein-bent-heidelberg | Frollein Bent | Cocktail Bar | Neckarmünzgasse 6, 69117 | Falstaff (named in the Bent Bar entry as its second location) | none (no interior on the shared site) |
| linos-bar-heidelberg | Lino's Bar | Cocktail Bar | Bergheimer Straße 21, 69115 | Falstaff cocktail-bar listing | none (the bar has Facebook and Instagram, no site of its own) |
| 15-high-heidelberg | 15 High | Hotel Bar (Rooftop Bar) | Europaplatz 1, 69115, ATLANTIC Hotel, 15th floor | venue site and the hotel's own dining page | 15th-floor room with the view, courtesy of 15 High |
| cocktail-cafe-regie-heidelberg | Cocktail-Café Regie | Cocktail Bar | Theaterstraße 2, 69117 | venue site, heidelbars.com listing | dining room, courtesy of Cocktail-Café Regie |

Already in the directory: pino-s-bar-heidelberg (Pino's Bar) and bar-martinelli-heidelberg (Bar Martinelli).

## Details worth knowing

- Hours: Schilling, Bent and Lino's from their Falstaff entries, which match the venue sites where both exist; 15 High and Regie from their own sites. Frollein Bent is a summer garden (Friday to Sunday from 5pm per listings); the row says so and points to the bar's Instagram for the season's dates.
- Lino's has no website; the row carries Instagram (linos.bar.hd) and the mailbox from Falstaff.
- Regie's phone is from Yelp (the venue site renders by script and shows no contact block); everything else is from the site or the heidelbars.com listing.
- Rejected: Cavaly (permanently closed per its listings), Villa Lounge (a café with evening cocktails, not a cocktail bar), Mel's Bar (a dance bar in a hotel cellar, no own site found), Trinidad (no own channel found).
- Photos rejected: Schilling's hero (a cocktail close-up), Bent's second image (a wood backdrop), Regie's food shots, Lino's Facebook portrait. Nothing was taken from Google or from third-party listings.

## Why the page lists six, not eight

Not a cache. /best-bars/<city> is Level 2 (src/lib/city-levels.ts, Roman 2026-09-17): a bar qualifies with an accolade, a Top 10 pick, a BarMagazine article, a paid tier, or a selective editorial source. Falstaff counts as selective, so Schilling Roofbar, Bent Bar, Frollein Bent and Lino's qualify beside Pino's Bar and Bar Martinelli: six. 15 High and Cocktail-Café Regie carry only their own site and a listing as sources, which the rule treats as broad, so they sit on Level 3 (/bars/city/heidelberg, which shows all eight). The page needs five to exist and four to be indexable; it has six and is indexable. If Roman wants 15 High and Regie on the best-of page, they need a selective source or a Top 10 pick.

## Not done

/best-bars/heidelberg/cocktail-bars (the type page) still says noindex; it lists the cocktail bars but the type-page rule is separate and was not part of this task.
