-- Add a review flag for bars whose coordinates are approximate or missing.
-- Run this in the Supabase SQL Editor (project: barmagazine) BEFORE merging
-- the PR that introduces it. The column is additive with a default, so it is
-- safe for the currently-deployed code (which never references it); the new
-- code references it, so the column must exist by the time that deploys.
--
-- Safe to re-run.

-- 1. Add the column (idempotent).
alter table bars
  add column if not exists needs_geo_review boolean not null default false;

-- 2. Backfill: any active bar with no coordinates is, by definition, missing
--    from the directory map and needs a precise location. Surface those in
--    the admin review queue immediately.
update bars
set needs_geo_review = true
where (lat is null or lng is null)
  and needs_geo_review = false;

-- 3. Index the queue so "show only bars needing review" stays fast.
create index if not exists bars_needs_geo_review_idx
  on bars(needs_geo_review)
  where needs_geo_review = true;
