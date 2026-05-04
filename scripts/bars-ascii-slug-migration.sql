-- Migration: bars.slug must be ASCII (lowercase, digits, hyphens only).
--
-- Context: one bar slug in production was 'kwãnt' (non-ASCII). Vercel
-- normalizes /bars/kwãnt to /bars/kwant before our routing matches, but
-- /bars/kwant 404s because Supabase has the non-ASCII form. The bar was
-- effectively unreachable. There's also a redirect rule in next.config.mjs
-- (line 86) for the URL-encoded variant /bars/kw%C3%A3nt that papered
-- over the symptom in some clients but not all.
--
-- Fix in two steps:
--   1. Rename the existing row from 'kwãnt' to 'kwant'.
--   2. Add a CHECK constraint preventing future non-ASCII slugs at write
--      time. Pattern: ^[a-z0-9-]+$ (the standard URL slug shape; matches
--      every other slug in the table — verified via REST against prod
--      with `is_active = true`, only 'kwãnt' was non-conforming).
--
-- Run this in the Supabase SQL Editor (project owner / service role).
-- Idempotent: safe to re-run.
-- After this lands, supabase-schema.sql carries the constraint inline so
-- a fresh-clone setup gets it from the start.

begin;

-- 1. Data fix (idempotent — only updates if the bad slug still exists).
update bars
   set slug = 'kwant'
 where slug = 'kwãnt';

-- 2. Drop the constraint if a previous attempt left it around, then add.
alter table bars
  drop constraint if exists bars_slug_ascii_only;

alter table bars
  add constraint bars_slug_ascii_only check (slug ~ '^[a-z0-9-]+$');

-- Verify: the count below should match the row count of bars (no
-- rejections). If this query errors with a constraint violation, an
-- additional non-ASCII slug snuck in between the data fix and the
-- constraint add — investigate before retrying.
-- Use:  select count(*) from bars where slug ~ '^[a-z0-9-]+$';

commit;
