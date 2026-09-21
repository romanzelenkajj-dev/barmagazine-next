-- bars.status (2026-09-17): a bar can be temporarily closed, and until now the
-- directory had no way to say so.
--
-- Tayēr + Elementary is the case that forced it. Its own site reads
-- "TEMPORARILY CLOSED DUE FIRE IN OUR BUILDING": a May 2026 fire, shut for the
-- rest of the year, no reopening date. It is No. 5 on the World's 50 Best Bars
-- and No. 1 in our own London Top 10 article.
--
-- `is_active` is a boolean and neither value is right. False pulls the bar out
-- of the London directory, the city pages, the map and our own curated ten,
-- and orphans a profile with real search demand. True tells every visitor a
-- burnt-out bar is open.
--
-- So: a real status, and `is_active` KEEPS ITS CURRENT MEANING. It is not
-- repurposed. A temporarily closed bar stays active.
--
--   open                  today's behaviour exactly.
--   temporarily_closed    profile live with a notice, pill on the cards, keeps
--                         its accolades and its place in a curated Top 10,
--                         sorts last on an accolade pick, out of outreach and
--                         out of "near me".
--   permanently_closed    profile live with a permanent notice, out of every
--                         list and the sitemap. Replaces deleting the row,
--                         which loses the URL and every link pointing at it.
--
-- The status is NEVER written into accolades and never changes an accolade
-- score. A bar that burns down does not stop having been a 50 Best bar.
--
-- Run once in the Supabase SQL editor. The Tayēr update follows from the repo
-- through the admin API, not from here.

alter table public.bars
  add column if not exists status text not null default 'open',
  add column if not exists status_note text,
  add column if not exists status_updated_at timestamptz;

alter table public.bars
  drop constraint if exists bars_status_check;
alter table public.bars
  add constraint bars_status_check
  check (status in ('open', 'temporarily_closed', 'permanently_closed'));

comment on column public.bars.status is
  'open | temporarily_closed | permanently_closed. Independent of is_active: a temporarily closed bar stays active. Never an accolade, never scored.';
comment on column public.bars.status_note is
  'One sentence shown to readers on the profile notice. Primary-sourced.';

-- The lists ask "which bars are not open", which is a small minority.
create index if not exists bars_status_idx on public.bars (status) where status <> 'open';


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


-- bars.editorial_pick (2026-09-17): Roman's override on a city's best-bars list.
--
-- Task 50's report proved that no rule built on sources can settle Bratislava.
-- Baudelaire Bar sits on Refresher.sk's top five cocktail bars in the city, so
-- "a real outlet listed it" will always qualify it. Roman disagrees with that
-- outlet. A judgement the sources contradict has to be storable or it gets
-- overruled on every rebuild.
--
--   null        the ranking rules decide. The normal case.
--   1, 2, 3 …   pin to the top of that city's best-bars list, in this order.
--   -1          off the best-bars list entirely. The bar keeps its profile,
--               its accolades and its place in /bars/city/<slug>.
--
-- Read by the best-bars pages and nothing else. Never an accolade, never
-- scored, never rendered. It does not touch tier, so it cannot grant or
-- remove a paid benefit or a Top 10 place.
--
-- Run once in the Supabase SQL editor. Every pick and drop is set from the
-- repo through the admin API, with the reason in admin_notes, never from here.

alter table public.bars
  add column if not exists editorial_pick smallint;

alter table public.bars
  drop constraint if exists bars_editorial_pick_check;
alter table public.bars
  add constraint bars_editorial_pick_check
  check (editorial_pick is null or editorial_pick = -1 or editorial_pick between 1 and 50);

comment on column public.bars.editorial_pick is
  'Editorial override for the best-bars city list. null = rules decide, 1..50 = pinned in that order, -1 = off the list. Never an accolade, never scored, does not touch tier.';

create index if not exists bars_editorial_pick_idx
  on public.bars (editorial_pick) where editorial_pick is not null;

-- Verify: expect status, status_note, status_updated_at, editorial_sources, editorial_pick
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'bars'
  and column_name in ('status','status_note','status_updated_at','editorial_sources','editorial_pick')
order by column_name;
