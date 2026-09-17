# Report: 54-columns-are-live-unblock-50-and-53 (2026-09-17)

All three steps done, in the order given.

## 1. The backfill

Applied. **217 of 1,469 active bars now carry at least one editorial source,
240 entries across 82 cities.**

| | Dry run predicted | Actually landed |
|---|---|---|
| Bars | 217 | 217 |
| Entries | 240 | 240 |

**No bar differs in either direction.** Nothing predicted is missing, nothing
landed that was not predicted, and no entry is outside the
`{source, url, note, year}` shape the migration documents. 106 entries came
from this session's research JSON and 112 from the older wave reports.

## 2. Repeatability, which you asked me to confirm

It was **not** repeatable as written, and now is. The original script computed
a fresh set and wrote it, so a re-run would have clobbered anything added by
hand or by a later wave.

It now seeds from what each row already holds and skips the write entirely when
nothing is new. Proved by running it twice against the live column:

```
first run:   written 217, unchanged 0,   failed 0
second run:  written 0,   unchanged 217, failed 0
```

The second run makes no requests at all for those rows, so it does not touch
`updated_at` either.

## 3. Task 53

Done and reported separately in
`Claude outputs/reports/53-three-page-levels-per-city.md`. Bratislava lands on
five, New York on 33, and Baudelaire Bar carries `editorial_pick = -1`.

## 4. Task 51's remaining piece

Done. Tayēr + Elementary is `temporarily_closed` and the notice is live on its
profile, verified on the site. The reader-facing note is kept to what the
venue's own page says: it states the fire but not its month, so the note does
not either. The May 2026 date and the ended Casual by Tayēr pop-up are in
`admin_notes` with their sources.

The bar keeps `is_active = true`, its accolades, its badges and its place in
the London Top 10, and the page is still `index, follow`. Two independent
guards now stop it being emailed: `outreach/parked.txt` and the new status
check in `send-upsell.mjs`.

## One thing I checked that you did not ask for

I changed `send-upsell.mjs` this morning, and window 3 runs it at 13:30 with
43 bars. Dry ran the real slug file through the edited script: **43 of 43
resolve, no exclusions, no errors.** Tonight's window is unaffected.
