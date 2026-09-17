# Strip description tails that repeat the generated accolade sentence

Seen on Daisy Margarita Bar: the description's last sentence reads "The latest lists place it at No. 44 on North America's 50 Best Bars 2026." while the generated accolade prose directly above already says "North America's 50 Best Bars ranked it No. 44 in 2026." That trailing sentence pattern predates accolade-sentences.ts and now duplicates it.

1. Scan every active description (page all rows) for trailing accolade sentences: patterns like "The latest lists place it ...", "It currently sits at No. ...", "ranked No. X on ... Best Bars ...", "named ... 50 Best ...", "... Spirited Awards ...", "... James Beard ..." occurring in the LAST one or two sentences of the description, and any sentence that names an org on the accolade whitelist together with a rank or a year. Report count and a sample of 20 before changing anything.
2. For each hit where the same org+year already exists in the bar's accolades, remove that sentence from the description (by id). Keep the sentence when the fact is NOT in accolades (that is missing data, list those separately so the accolade can be added rather than the sentence lost). Keep bold markup balanced after removal; no dangling "and" or empty paragraph.
3. Add the pattern to scripts/description-lint.mjs so future descriptions are flagged.
4. Run npm run audit:descriptions, revalidate touched profiles, report the count changed, the "fact not in accolades" list, and the commit.

Do not touch any description sentence that is not about an accolade.
