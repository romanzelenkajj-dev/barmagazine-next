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
