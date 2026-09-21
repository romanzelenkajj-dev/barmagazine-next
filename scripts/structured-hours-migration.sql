-- Structured opening hours (task 69, 2026-09-18).
-- Run this in the Supabase SQL editor. DDL is not possible through PostgREST.
--
-- WHY A SECOND COLUMN RATHER THAN REPLACING opening_hours.
-- bars.opening_hours is free text and 1,097 active bars have one. Of those,
-- 793 (72.3%) parse cleanly into this shape and 304 do not, because they are
-- prose rather than data: "Daily 6pm till late", "Tue-Sun evenings (booking by
-- introduction)", "Daily 5pm-1:30am; Sunday brunch 12:30-5pm (21+)". Forcing
-- those into a grid would either lose information or invent it.
--
-- So the free-text column stays as the fallback and the display source for
-- every bar that has one. Nothing breaks, and no migration is forced. A bar
-- that submits structured hours gets its display string generated from this
-- column instead, identically every time.
--
-- SHAPE. jsonb, one key per day, lowercase three-letter:
--   {
--     "mon": {"closed": false, "open": "16:00", "close": "01:00"},
--     "tue": {"closed": true}
--   }
-- Times are "HH:MM" 24h. A close earlier than or equal to the open means the
-- bar runs past midnight, which is most of them, and is not an error.

ALTER TABLE public.bars
  ADD COLUMN IF NOT EXISTS opening_hours_structured jsonb;

COMMENT ON COLUMN public.bars.opening_hours_structured IS
  'Opening hours as data, one key per day (mon..sun): {closed} or {closed:false, open:"HH:MM", close:"HH:MM"}. '
  'A close <= open runs past midnight. When present, the display string is generated from this; '
  'bars.opening_hours remains the fallback for rows without it. See src/lib/structured-hours.ts.';

-- Same on the submission table, so an owner's structured hours survive review
-- instead of being flattened to a string at submit time. bar_submissions has
-- no opening_hours column at all today, so both are added.
ALTER TABLE public.bar_submissions
  ADD COLUMN IF NOT EXISTS opening_hours text;

ALTER TABLE public.bar_submissions
  ADD COLUMN IF NOT EXISTS opening_hours_structured jsonb;

-- A partial index, because the only queries that will want this are the ones
-- asking which bars are open, and those only care about rows that have it.
CREATE INDEX IF NOT EXISTS bars_opening_hours_structured_idx
  ON public.bars USING gin (opening_hours_structured)
  WHERE opening_hours_structured IS NOT NULL;

-- Check afterwards:
--   SELECT count(*) FROM public.bars WHERE opening_hours_structured IS NOT NULL;
--   SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'bar_submissions' AND column_name LIKE 'opening_hours%';
