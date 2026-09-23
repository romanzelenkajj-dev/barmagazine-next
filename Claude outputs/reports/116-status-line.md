# Task 116: /bars status line into the toolbar. Branch `preview/116-status-line`, PR #81 MERGED 2026-09-23

Preview (Vercel SSO): https://barmagazine-next-git-previ-6cc1a0-romanzelenkajj-7135s-projects.vercel.app/bars

Branched from main after the task 117 fix, so the count it shows is the real one.

## The three fixes

1. **Bar count dropped.** "1,782 bars worldwide" is gone; the band says it. What stays is the
   result count while a filter is on ("172 bars found"), because the band does not say that. If
   you want the filtered count gone too, it is one line.
2. **Into the white toolbar row.** The `.directory-results-bar` block under the filters is removed
   (markup and CSS). The line now renders inside `.directory-filter-row`, the white rounded row
   with the three dropdowns, Near me and the Grid/Map toggle, sitting just left of Near me on the
   same line: the filtered count, or "Sorted by distance from your location" (GPS) or "Sorted by
   proximity to <city>" (IP geo), or nothing at all when there is nothing to say. 13px, secondary
   grey.
3. **Phones.** Below 768px the line takes a full line of its own inside the white row, which
   carries 24px side padding, so the text starts 51px from the screen edge on a 390 viewport and
   cannot run to it. No horizontal overflow.

## What moved

Only the line. With the bare line gone, the type chips and the grid sit 28px higher on desktop
(the removed block was 20px margin plus one line); the band, search box, dropdowns, chips and
cards are otherwise where they were.

Files: `src/components/BarDirectoryMap.tsx` (results bar removed, status line in the filter row,
`GeoLabel` renders the toolbar span), `src/app/globals.css` (`.directory-sort-line` desktop and
phone rules; `.directory-results-bar` and `.directory-count` deleted).
