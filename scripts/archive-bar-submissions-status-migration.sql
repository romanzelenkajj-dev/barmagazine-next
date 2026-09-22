-- Add 'archived' as a valid bar_submissions status + archive the Andra Hem
-- add-your-bar submission (Roman, 2026-09-22).
-- Run this in Supabase SQL Editor (DDL is not possible through PostgREST).
--
-- Same shelf as owner_submissions got on 2026-09-10 (scripts/archive-status-
-- migration.sql): set aside by an admin, no publish, no reject, no owner
-- notification, the owner's submitted fields kept intact on the row.
--
-- Why now: the Andra Hem submission was merged BY HAND into the existing row
-- andra-hem-philadelphia (photo, email, phone, owner's hours; our description
-- kept), so approving it would have been wrong (the approve path overwrites
-- the description) and rejecting it would be false. A PATCH to 'archived'
-- failed with 23514: bar_submissions still has the three-value check.

-- 1. Widen the status check constraint, looking the name up rather than
--    assuming it.
DO $$
DECLARE con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.bar_submissions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%';
  IF con_name IS NULL THEN
    RAISE EXCEPTION 'no status check constraint found on bar_submissions';
  END IF;
  EXECUTE format('ALTER TABLE public.bar_submissions DROP CONSTRAINT %I', con_name);
  EXECUTE 'ALTER TABLE public.bar_submissions ADD CONSTRAINT bar_submissions_status_check
           CHECK (status IN (''pending'', ''approved'', ''rejected'', ''archived''))';
END $$;

-- 2. Archive the Andra Hem submission. The notes column already records the
--    hand merge; only the status changes.
UPDATE public.bar_submissions
SET status = 'archived'
WHERE id = 'c0834f31-6820-44f0-a1a7-3b76940df8e1'
  AND status = 'pending';

-- 3. Verify: expect the row archived and zero pending submissions.
SELECT id, name, status, notes FROM public.bar_submissions
WHERE id = 'c0834f31-6820-44f0-a1a7-3b76940df8e1';
SELECT count(*) AS pending_remaining FROM public.bar_submissions WHERE status = 'pending';
