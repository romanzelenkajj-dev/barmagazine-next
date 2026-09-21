# The directory has no way into near-me mode

Roman: "if somebody clicks on the directory and they want to see bars near them, or if they get to the directory from Google, it would be just one button."

He is right, and `src/components/NearMeBar.tsx` says why it is missing. `showsNearMeBar` renders on the homepage and on `/bars/city/` and `/bars/country/`, and excludes `/bars` on the reasoning that it "links there, so it would be a button to the current page".

That reasoning treats it as navigation. It is not. `/bars` and `/bars?near=me` are two different states of the same page, and MODE D in `BarDirectoryMap` only exists for the second one. A visitor who arrives on `/bars` from a search result has no way to reach it. The places the button does appear, the homepage and the city and country pages, are the ones where the visitor has already told us roughly where they are.

## What to build

Not the wide `NearMeBar` strip on `/bars`. A control in the directory's own filter row, beside Grid and Map, that toggles near-me on and off.

- Off, and the page is in its normal state. On, and it sets `?near=me` and MODE D takes over.
- It shows its state, and turning it off is one click. Today the only way out of near-me is editing the URL.
- It clears itself when a city or country filter is applied, which task 49 already does for the mode. The control must follow the mode, not hold its own separate state.
- The near-me banner at `BarDirectoryMap.tsx:1021` stays as it is. Do not duplicate the message.

Leave `NearMeBar` and `showsNearMeBar` alone. The homepage and city and country pages keep the strip they have.

## The empty-ish case, which matters more than it looks

We list 218 cities worldwide, so a lot of visitors have nothing genuinely near them. MODE D already falls through to plain distance beyond 80 km, so the grid is never empty, but the page should say what it is showing rather than silently presenting bars 3,000 km away as though they were local. One honest line above the results when the nearest bar is outside the radius, in the existing banner's voice.

## Guards

Standing layout rule: one new control in the filter row and one conditional line in the existing banner. The filter row's height, spacing and behaviour at 390px and 1440px stay identical, and the control must not wrap the row onto a second line on a phone. Geolocation is requested on click, never on page load.

## Report

Screenshots at 390px and 1440px of the filter row before and after, the page in near-me on and off, and the case where the nearest bar is beyond 80 km. Confirm that applying a city filter clears both the mode and the control.
