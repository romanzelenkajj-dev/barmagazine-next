# The three columns are live. Unblocked: task 50 Part 1, then task 53

Roman ran all three migrations in the Supabase SQL editor at 19:0x UTC on 17 September 2026. Verified from the repo: `status` (text, default `'open'`, 1,565 rows), `status_note`, `status_updated_at`, `editorial_sources` (jsonb, null), `editorial_pick` (smallint, null). The check constraints and indexes are in place.

Nothing else about the data changed. Every bar is `status = 'open'` and no bar has a source or a pick yet.

## Do these in order

1. **Run the `editorial_sources` backfill.** `scripts/backfill-editorial-sources.mjs`, the one whose dry run gave 217 of 1,469 active bars at least one entry, 240 entries across 82 cities. Dry run once more against the real column, then write. Report what actually landed against what the dry run predicted, and name any bar where the two disagree.

2. **Then task 53**, which replaces Part 2 of task 50. The three page levels, the qualification order that excludes broad lists, the paid-tier rule, and `editorial_pick` set to `-1` on Baudelaire Bar with Roman's reason in `admin_notes`.

3. **Task 51** can run whenever it reaches the front of the queue: the `status` work and Tayēr + Elementary set to `temporarily_closed`. It no longer needs anything from Roman.

## One thing to check before writing

The backfill script was written and dry-run before the column existed. Confirm it writes to `editorial_sources` in the shape the migration documents, `{source, url, note, year}` per entry, and that it is genuinely repeatable: running it twice must not duplicate entries on a bar that already has them.
