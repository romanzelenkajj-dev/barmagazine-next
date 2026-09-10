-- Add 'archived' as a valid owner_submissions status + archive the
-- Apothéke LA photo submission (Roman, 2026-09-10).
-- Run this in Supabase SQL Editor (DDL is not possible through PostgREST).
--
-- 'archived' = quietly shelved by an admin: no publish, no reject flow, no
-- owner notification. submitted_data is kept intact. The owner API hides
-- archived rows; the admin review inbox shows them under the "archived" tab.

-- 1. Widen the status check constraint. The constraint was created inline
--    as CHECK (status IN ('pending','approved','rejected')), so its
--    auto-generated name should be owner_submissions_status_check; the DO
--    block looks it up rather than assuming.
DO $$
DECLARE con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.owner_submissions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%';
  IF con_name IS NULL THEN
    RAISE EXCEPTION 'no status check constraint found on owner_submissions';
  END IF;
  EXECUTE format('ALTER TABLE public.owner_submissions DROP CONSTRAINT %I', con_name);
  EXECUTE 'ALTER TABLE public.owner_submissions ADD CONSTRAINT owner_submissions_status_check
           CHECK (status IN (''pending'', ''approved'', ''rejected'', ''archived''))';
END $$;

-- 2. Archive the Apothéke submission (6 photos stay in submitted_data).
UPDATE public.owner_submissions
SET status = 'archived',
    reviewed_at = now(),
    admin_notes = 'Archived without publishing: current profile photo kept. All six submitted photos remain stored on this row.'
WHERE id = '1f887af6-8954-4aa3-afd7-9581367b1f53'
  AND status = 'pending';

-- 3. Verify: expect the row archived and zero pending submissions.
SELECT id, status, admin_notes FROM public.owner_submissions
WHERE id = '1f887af6-8954-4aa3-afd7-9581367b1f53';
SELECT count(*) AS pending_remaining FROM public.owner_submissions WHERE status = 'pending';
