-- Adds a free-text internal notes column to bars, for flags that belong ON
-- THE ROW rather than in a changelog: an address taken from third parties
-- pending first-party confirmation, a handle the venue does not publish, an
-- outreach decision that a future editor should see beside the data.
--
-- Roman runs this in the Supabase SQL editor (DDL is not possible over
-- PostgREST). The column is never rendered; owner-fields.ts must list it as
-- forbidden to owners, the same as accolades.
--
-- 2026-09-14: needed for the us-metro wave 1 address flags on
-- friends-of-friends, moneygun and sportsmans-club, which are recorded in
-- claude/implementation-status.md until this lands.

ALTER TABLE bars ADD COLUMN IF NOT EXISTS admin_notes text;
COMMENT ON COLUMN bars.admin_notes IS 'Internal editorial flags. Never rendered. Not owner-editable.';
