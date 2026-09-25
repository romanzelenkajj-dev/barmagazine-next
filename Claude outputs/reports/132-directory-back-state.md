# 132: /bars keeps its filters on back

Status: **merged and live 2026-09-24 (#91), after Roman's own iPhone test.** Draft PR: https://github.com/romanzelenkajj-dev/barmagazine-next/pull/91
Preview: https://barmagazine-next-git-previ-cc067c-romanzelenkajj-7135s-projects.vercel.app/bars (Vercel login required)

## What changed

- Every filter (country, city, type), the search text and the Grid/Map mode now write to the query string as they change, with readable slugs, for example `/bars?country=italy&city=milan&type=cocktail-bar&q=bar+basso&view=map`. This uses `replaceState`, so it never adds extra stops to the back button. The search text is written about 0.4 s after typing stops. Other keys (`near=me`, `utm_*`) are kept.
- The page reads the URL on load. The server reads it too, so a shared filtered link opens already filtered. The browser reads it as well, so back restores it.
- Back from a profile returns to the same list at the same scroll position, with every "Show more" page still loaded. That includes the extra server pages on the unfiltered list. This state is kept on the history entry itself, so a fresh visit to /bars (nav link, typed URL) still starts at the top.
- Map view keeps its mode: `view=map` is in the URL. A back from a map popup, which is a full page load, reopens the map with the filters.
- Country pages: "Show more" count and scroll position restore the same way. They have no filters.
- City pages have no filters and no paging, so there was nothing to change.
- The canonical tag is still `https://barmagazine.com/bars` on every filtered URL, so filtered lists don't compete with the directory in Google.
- One fix found while testing: the site sets `scroll-behavior: smooth` on `<html>`, so the restore now jumps instantly. Without that, the page would scroll down from the top on every back.

Files: `src/lib/directory-query.ts` (8 new tests), `src/lib/list-restore.ts`, `src/lib/use-list-restore.ts`, `src/components/BarDirectoryMap.tsx`, `src/app/bars/page.tsx`, `src/app/bars/country/[country]/CountryBarGridClient.tsx`. Full suite: 547 tests pass; tsc clean.

## Tests run

| Where | Flow | Result |
|---|---|---|
| Real Chrome 153, Vercel preview (production build) | `/bars?country=italy&type=cocktail-bar`, Show more x2 (60 cards), scroll to card 46, open it, back | Filters Italy + Cocktail Bar, 60 cards, scroll 5,543 vs 5,495 saved; the clicked card is on screen. Canonical `https://barmagazine.com/bars`. |
| Local dev, Chromium | Italy + Cocktail Bar, 60 cards, open card, back | Same 60 cards, clicked card at exactly the same offset. |
| Local dev | Change city to Milan, type "bar basso", switch to Map, full-page navigate to Bar Basso, back | URL `?country=italy&city=milan&type=cocktail-bar&q=bar+basso&view=map`; map open, all three dropdowns and the search restored. No console errors. |
| Local dev | Unfiltered /bars, Show more x11 (276 cards, one server page), open card, back | 276 cards, same position. |
| Local dev | From a profile, click the "Bar Directory" nav link | Fresh visit: 12 cards, top of page. |
| Local dev | /bars/country/united-states, Show more x3 (48), open card, back | 48 cards, same position. |
| Local dev, 375x812 mobile emulation (touch, Android UA) | `?type=speakeasy&q=bar`, open card, back | 29 cards, search text kept, same position. |

## Not tested: iPhone Safari

This Mac has only the Xcode command-line tools, not Xcode, so the iOS Simulator can't run. The back swipe on iPhone Safari is untested. Two ways to close this:

1. Open the preview link on your iPhone, filter, open a bar and swipe back. The flow is the same history traversal I tested in Chrome.
2. Or install Xcode from the Mac App Store and run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`. That needs your password. Then I can test in the simulator.

Two Safari-specific points are already handled. Safari limits how often a page can call `replaceState`, so the position is saved about 150 ms after scrolling stops and on click, not on every scroll event. A save that is skipped because of the limit is caught and ignored. The restore uses a timer rather than animation frames, so it also works when Safari brings the page back in the background.

Merged on Roman's go. Live check: `/bars?country=italy&type=cocktail-bar` server-renders with Italy and Cocktail Bar selected, and the canonical stays `https://barmagazine.com/bars`.
