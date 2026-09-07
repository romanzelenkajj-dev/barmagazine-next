# BarMagazine disaster recovery

The off-platform backup lives in `~/Documents/BarMagazineBackups/<date>/` on Roman's
Mac, written weekly by `scripts/backup-offsite.mjs` (cron, Mondays 08:00).
The folder lives in `~/Documents` so **iCloud syncs it automatically** — that copy is what survives a Supabase/Vercel/GitHub account
compromise. Nothing in it depends on any hosted account to read.

Each snapshot contains:

| Path | Contents |
| --- | --- |
| `db/<table>.json` | Every row of bars, bar_claims, bar_owners, bar_submissions, owner_submissions |
| `db/pg_dump.sql` | Full-fidelity dump, only when `SUPABASE_DB_URL` is configured (see below) |
| `storage/bar-photos/...` | Every uploaded photo, plus `file-list.json` |
| `wordpress/*.json` | All published posts, pages, categories, tags, media metadata |
| `manifest.json` | Row/file counts for an integrity glance |

The schema itself is in `~/Documents/BarMagazineBackups/schema-baseline.sql`
(regenerate after DDL changes: the backup script prints a reminder, or ask
Claude). The application code needs no backup here — it is the git repo,
clone it from any machine that has pushed recently.

## Restore: database

1. Create a fresh Supabase project. Run `schema-baseline.sql` in the SQL
   editor to recreate the five tables (then re-add RLS policies and the
   partial unique index on bar_claims — see `claude/bar-claiming-spec.md`).
2. If the snapshot has `db/pg_dump.sql`: `psql <new-db-url> < db/pg_dump.sql`
   and skip step 3.
3. Otherwise load the JSON: for each table,
   `curl -X POST '<new-url>/rest/v1/<table>' -H "apikey: <service-key>" -H "Authorization: Bearer <service-key>" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d @db/<table>.json`
   (PostgREST accepts a JSON array as a bulk insert). Order: bars →
   bar_owners → bar_claims → bar_submissions → owner_submissions
   (respects the FKs). Auth users are NOT in this backup — owners re-create
   accounts on their next sign-in link; bar_owners rows keep their history.

## Restore: storage

Create a public bucket `bar-photos` in the new project, then re-upload:
`cd storage/bar-photos && find . -type f | while read f; do curl -X POST "<new-url>/storage/v1/object/bar-photos/${f#./}" -H "Authorization: Bearer <service-key>" --data-binary @"$f"; done`
Photo URLs in `bars.photos` that point at the old project ref need a
search-replace to the new ref (one SQL UPDATE; ask Claude).

## Restore: WordPress

The JSON under `wordpress/` is the content of record. For a full WP
re-import, use the WXR file `wordpress/barmagazine-wxr.xml` if present —
**Roman: do the one-time export at wp-admin → Tools → Export → All content
and drop the XML into the latest snapshot's `wordpress/` folder** (the REST
API cannot produce WXR). Import via Tools → Import on a fresh WP site.

## Restore: the site

1. Clone the repo, `npm install` (pnpm lockfile is authoritative on Vercel).
2. New Vercel project → set env vars (names are listed at the top of
   `.env.vercel`; values from the new Supabase project + existing Resend /
   Stripe / Mapbox accounts).
3. Point the barmagazine.com DNS at Vercel, push to deploy. Re-create the
   firewall challenge rule (AS132203) and the CRON_SECRET env var.

## Upgrading to full pg_dump

Add `.env.backup` (gitignored) next to `.env.vercel` containing
`SUPABASE_DB_URL=postgres://postgres:<db-password>@db.<ref>.supabase.co:5432/postgres`
and `brew install libpq && brew link --force libpq`. The weekly script picks
both up automatically.
