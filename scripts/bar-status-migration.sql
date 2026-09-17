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
