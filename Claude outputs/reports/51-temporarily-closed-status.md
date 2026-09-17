# Report: 51-temporarily-closed-status (2026-09-17)

Built and deployed, commit `dee1e23`. **Shipped inert**, and Tayēr +
Elementary is not yet marked, for one reason:

**I cannot create the column.** Schema changes here are run by hand in the
Supabase SQL editor. `scripts/bar-status-migration.sql` is written and waiting.
Run it and the feature turns on; the Tayēr update is then one command.

Everything else is done, tested and live.

## The migration

`bars.status` text not null default `'open'`, constrained to `open`,
`temporarily_closed`, `permanently_closed`, plus `status_note` and
`status_updated_at`, and a partial index on the rows that are not open.

**`is_active` keeps its meaning and is not repurposed.** A temporarily closed
bar stays active. That is the whole point: Tayēr keeps its row, its profile,
its accolades, its place in the London directory and its No. 1 spot in our
London Top 10 article.

## Why it was safe to ship before the column exists

Every read goes through `barStatus()`, which defaults to `open` and never
throws on a value it does not recognise, and bar profiles are selected with
`select('*')`, so no query names a column that is not there. Verified on the
live site after deploy: `/bars/tayer-elementary` returns 200 with no notice
and no pill, and `/best-bars/london` is unchanged. Nothing on the site moved.

## What turns on with the column

- **Profile notice** at the top of `/bars/<slug>`, under the H1, carrying the
  heading and the stored reason. It prefers `status_note`, because the reason
  is what the reader came for, and falls back to a plain sentence.
- **Card pill**, "Temporarily closed", **first** among the card pills, in
  `CardStatusPills`, which every card shares. A closed bar **keeps its 50 Best
  and Top 10 pills**, because it did not stop being a 50 Best bar.
- **Sort**, in `sortSeoBars`: closed bars go last, so a "best bars" list leads
  with places a reader can go tonight. This is a separate key ahead of tier
  and **does not touch the accolade score**.
- **Outreach**, in `send-upsell.mjs`: any bar whose status is not `open` is
  refused, checked before the opt-out and corporate tests so the log gives the
  most specific reason.

Only two new elements exist, the notice and the pill, and the CSS adds only
their rules. Nothing existing changed size, spacing or position, at either
width.

### One piece deliberately left for the migration

`permanently_closed` rows should drop out of the sitemap. That query
(`getAllActiveBars`) passes an explicit column list, so naming `status` there
would 400 today. It is a one-line change once the column exists, and it is
moot until then because no row can carry that status yet.

## Verified against tonight's send

I changed `send-upsell.mjs`, which window 3 runs at 13:30 with 43 bars. Dry
ran the real slug file through the edited script: **43 of 43 resolve, no
exclusions, no errors.** Tonight's window is unaffected.

## The number you asked for

**96 inactive rows.** By what their own notes and descriptions say:

| Reason recorded | Rows |
|---|---|
| Explicitly closed | 17 |
| A duplicate or a merge | 12 |
| **No recorded reason at all** | **67** |

So 17 are the clear candidates to carry as `permanently_closed` with a live
page, among them Beaufort Bar at the Savoy, BlackTail, The Everleigh, Bar
Margaux, Nomad Bar and Hacha. The Grey Room in Tokyo is the strongest case
because it also has a BarMagazine article pointing at a dead URL.

**The real finding is the 67.** Two thirds of the inactive rows record no
reason for being inactive. Those are URLs we have taken down without saying
why, and until someone reads them we cannot tell a closure from a merge from a
mistake. The 12 duplicates should stay inactive and keep their 301s; the 17
closures want live pages; the 67 need a pass before anyone can say. That is
worth its own task and I have not guessed at any of them.

## Not done, and why

**Tayēr + Elementary is not marked.** The moment the column exists:

```
status: temporarily_closed
status_note: Closed since a fire in the building in May 2026, with no reopening date announced. Alex Kratena and Monica Berg have been running pop-ups in the meantime.
```

with the bar's own site cited in `admin_notes`. It is already in
`outreach/parked.txt`, so no email can reach it in the meantime either way.

The before and after of `/bars/tayer-elementary` and `/best-bars/london` at
both widths will be in the follow-up, once there is an after to show. Today
both are provably identical, which is the correct result for an inert deploy.
