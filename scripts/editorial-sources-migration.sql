-- bars.editorial_sources (2026-09-17): the editorial listing that ADMITTED a
-- bar to the directory, one entry per source.
--
-- Why a column. The best-bars city pages rank by tier, then accolade score,
-- then photo, then name. In a city with no top-tier bar, one accolade and
-- three photos, everything from the fourth slot down is ordered by the first
-- letter of the bar's name. That is how Baudelaire Bar came to sit on
-- /best-bars/bratislava as one of the best bars in the city: because of the B.
--
-- The fix is to let a page require a REASON, and the second-strongest reason
-- we have, after an accolade, is "a real editorial outlet listed it". We know
-- that for hundreds of bars and we store it nowhere: every wave report in
-- "Claude outputs/" records it in prose and that is the end of it.
--
-- THIS IS AN ADMISSION RECORD, NOT AN ACCOLADE. It is never written to
-- bars.accolades, never scored by bestAccolade, never rendered as a tile or in
-- an accolade sentence. A Bartenders' Choice "bars to watch" entry, an Eater
-- map and a Falstaff listing all say "an editor put this bar on a list". None
-- of them says the bar won anything. The standing rule is unchanged.
--
-- Shape, one object per entry:
--   {"source": "Eater Atlanta", "url": "https://...", "note": "...", "year": 2026}
-- source and url are required; note and year may be null.
--
-- Run once in the Supabase SQL editor. The backfill is a repo script
-- (scripts/backfill-editorial-sources.mjs), run through the admin API, and
-- never from here.

alter table public.bars
  add column if not exists editorial_sources jsonb;

comment on column public.bars.editorial_sources is
  'Editorial listings that admitted this bar. An admission record, never an accolade: not scored, not rendered as a tile. Array of {source, url, note, year}.';

-- Read path only: the city pages ask "does this bar have at least one entry".
create index if not exists bars_editorial_sources_gin
  on public.bars using gin (editorial_sources);
