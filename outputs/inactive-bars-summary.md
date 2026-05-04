# Inactive bars audit

_Generated: 2026-05-04T18:26:11.181Z_

**Source:** Supabase `bars` table via service role key (bypasses RLS), READ-ONLY query. WP article bodies pulled from the public WordPress.com API used by sitemap-articles.

**Total bars:** 998. **Inactive:** 12 (1.2% of directory).

## Schema note — image_url

The schema has `photos text[]` rather than a single `image_url`. The CSV's `image_url` column is the **first element** of `photos` (or empty if no photos). `photos_count` is included as a bonus column so editors can spot 0-photo rows quickly.

## Headline

**2 bars look like clear reactivation candidates** (`real_bar_likely_reactivate` + `real_bar_review_for_reactivation` combined).

## Bucket counts

| Bucket | Count |
|---|---|
| `real_bar_likely_reactivate` (name + city co-mentioned in WP) | 2 |
| `real_bar_review_for_reactivation` (looks complete, no WP corroboration) | 0 |
| `probable_duplicate` (matches an active row by name+city) | 5 |
| `incomplete_data` (missing one of name/slug/city/country) | 0 |
| `test_data` (heuristic match — test/lorem/example/bulk-empty) | 2 |
| `needs_editor_review` (the long tail) | 3 |

## Top 10 highest-confidence reactivation candidates

1. `/kwnt` — **Kwānt** (London, United Kingdom) — bucket: `real_bar_likely_reactivate`; name+city mentions: 2; raw mentions: 3 _(common-word name — discount the raw count)_
2. `/mostly-harmless` — **Mostly Harmless** (Hong Kong, China) — bucket: `real_bar_likely_reactivate`; name+city mentions: 1; raw mentions: 1

## Patterns flagged

Bulk-import minutes (1 cluster of ≥ 5 inactive rows created in the same minute):

- 8 inactive rows created at 2026-03-18T09:12

## Heuristic notes

- `name_mentions_raw` and `name_plus_city_mentions` are emitted side-by-side. Bucket assignment uses the proximity-checked `name_plus_city_mentions` only — the raw count is for editor context.
- `name_likely_common_word` flags single-word ≤ 5-char names plus a stoplist (`cure`, `argo`, `anvil`, `taos`, `atlas`, `arca`, `signature`, `eco`, plus a handful of plausible additions). Editor uses this to discount surprising raw-mention spikes.
- Word-boundary regex `\b{name}\b` (case-insensitive) is used for both signals, so "cure" doesn't match "obscure".
- HTML stripped from WP bodies before scanning; HTML attributes can't false-trigger.

## Recommended next steps

1. Editorial team opens `outputs/inactive-bars-audit.csv` (sortable in Excel / Google Sheets) and works the `real_bar_likely_reactivate` rows first — these are the highest-impact reactivations for SEO inventory recovery.
2. `probable_duplicate` rows: spot-check each against its active twin. Delete whichever has worse data; keep the one already linked from sitemaps and links.
3. `test_data` rows: bulk-delete after a quick scan to confirm the heuristic didn't catch anything real.
4. `incomplete_data` and `needs_editor_review`: defer until the higher-priority work above is done.
5. To act on these in the admin UI rather than Supabase, the optional `is_active` toggle + "Inactive bars" view from the audit prompt is still pending design approval.
