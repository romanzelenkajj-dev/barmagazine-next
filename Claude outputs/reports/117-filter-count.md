# Task 117: /bars filter count was the 1,000-row cap. Fixed on main, 2026-09-23

Commit `98d71f1`, production build green.

## Cause

The filter fetch in `BarDirectoryMap` asked `/api/bars` for `perPage=1000` once, and the label counted
the rows it got back. `getBars()` issues one `.range()`, so the Cocktail Bar filter came back with
exactly 1,000 rows and no error; the count, the grid and the map all showed that truncated set. The
API already returned the true `total` from its count:exact query; the client never read it.

## Fix

`src/lib/filter-fetch.ts`, `fetchAllMatching(fetchPage)`: asks page 1 at 1,000, reads the API's
`total`, and keeps paging until it is reached or a short page arrives, counting each bar once. The
directory's filter effect now runs through it and drops a response that arrives after the filters
changed again. Grid, map and count all cover the whole set.

Measured on the local build: the Cocktail Bar filter fetches pages 1 and 2 and reads **1,723 bars
found**, matching the API's total (1,723 today; the type filter is the union of `type` and the
curated subtypes, which is why it is above the 1,651 you quoted).

## Test

`src/lib/filter-fetch.test.ts`, 5 cases: a filter with 1,651 matches reports 1,651 across two
requests; a 30-row set makes one request; three pages; a bar that shifts between pages is counted
once; an API with no `total` falls back to the rows.

## Every count on /bars

- Band: `totalBars` from `getBarStats()`, a head count, already true.
- Status line: now the true filtered count (and moved into the toolbar on the task 116 branch).
- Map view: `/api/bars/map` already pages the whole directory (`getAllActiveBars`), and the
  client filters that full set; unchanged.
- "Show all N cities" counts cities, not bars; unchanged.
