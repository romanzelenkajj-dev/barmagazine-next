# Directory ordering: near-me mode must stop governing once the visitor picks a place

Roman saw the /bars directory filtered to Bratislava lead with photo-less bars (The Cuba Libre, Bukowski 2.0, Rio), with Mirror Bar — the city's only World's 50 Best bar, and one of only three Bratislava bars with a photo — buried below them. On his phone the same filter ordered correctly: Mirror Bar, then the two other photo bars, then the rest.

## Cause, confirmed against the data

All 16 Bratislava bars are tier `free` with no article, so tier never separates them. The order he saw cannot come from MODE A.

`src/components/BarDirectoryMap.tsx` line 569: `nearMode` is read once from `?near` in the URL and is never cleared. Line 771, MODE D runs before the MODE A location-filter branch, so a visitor who arrives from "Find bars near me" and then filters to a city keeps proximity ordering. Beyond the 80 km radius MODE D sorts on raw distance alone — "nothing beats being closer" — so from Carlsbad the Bratislava bars come back in arbitrary distance order and photo, accolade and tier are all ignored. That is exactly the screenshot. His phone had no `?near` in the URL, so it took MODE A and looked right.

## The fix

When the visitor applies a city filter, a country filter or a search term, they have named a place and near-me mode should stop deciding the order. Clear `nearMode` (and drop `near` from the URL, so a refresh does not resurrect it) as soon as any of those is set, and keep MODE D for the unfiltered near-me view it was written for. The near-me banner at line 1021 should disappear at the same moment — it must never sit above a list that is no longer proximity-ordered.

Do not change MODE D's own logic. Do not change MODE A, B or C ordering in this task.

## Second, smaller thing in the same file

`FIFTY_BEST_2025` (line 35) is a hardcoded list of 50 names, while the card badge next to it renders from `hasFiftyBest(bar.accolades)` (line 1094). Sort and badge can therefore disagree: a bar that shows a 50 BEST badge does not rank as one if its name is spelled differently or it entered from a regional 50 Best list. Replace every `FIFTY_BEST_2025.has(x.name)` test in this file with `hasFiftyBest(x.accolades)` and delete the constant. Same change in `src/components/BarDirectory.tsx`, which carries its own copy of the list and its own `sortBars`. `hasFiftyBest` already covers w50b, a50b, e50b and na50b through `renderableAccolades`, so badge and order come from one source after this.

## Standing layout rule applies

Change only the ordering logic and the near-me banner's visibility condition. No layout, spacing or breakpoint changes anywhere.

## Report

Before and after ordering, as a plain list of bar names, for each of these, at 390px and 1440px:

- `/bars?near` then filter to Bratislava (the broken case)
- `/bars` filtered to Bratislava, no `near` (must be unchanged: Mirror Bar, Antique American Bar, Old Fashioned Bar, then the photo-less bars alphabetically)
- `/bars?near` with no filter (must be unchanged)
- `/bars/city/bratislava` and `/best-bars/bratislava` (must be unchanged)

Then name any bar anywhere in the directory whose 50 Best sort rank changes because of the `hasFiftyBest` swap — bars in the old name list that carry no 50 Best accolade, and bars with the accolade that were not in the list. That difference is the thing worth knowing.
