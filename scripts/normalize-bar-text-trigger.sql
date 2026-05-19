-- Normalize bar text fields to prevent duplicate directory facets.
-- Run this in the Supabase SQL Editor (project: barmagazine).
--
-- Background: the /bars directory groups countries and cities by exact string.
-- A bar added with a stray trailing space ("Chile " vs "Chile", "Santiago "
-- vs "Santiago") produces a phantom duplicate facet and a broken slug. This
-- happened with the bar "The Loft". App-side normalization (src/lib/normalize.ts)
-- is the first line of defense; this trigger is the catch-all that also covers
-- writes made directly in the Supabase SQL editor or any future code path.
--
-- Safe to re-run: the function uses CREATE OR REPLACE and the trigger is
-- dropped-if-exists before being recreated.

-- 1. One-time cleanup of any existing polluted rows (no-op if already clean).
update bars set
  name    = regexp_replace(btrim(name),    '\s+', ' ', 'g'),
  city    = regexp_replace(btrim(city),    '\s+', ' ', 'g'),
  country = regexp_replace(btrim(country), '\s+', ' ', 'g'),
  type    = regexp_replace(btrim(type),    '\s+', ' ', 'g'),
  slug    = btrim(slug)
where
  name    <> regexp_replace(btrim(name),    '\s+', ' ', 'g')
  or city    <> regexp_replace(btrim(city),    '\s+', ' ', 'g')
  or country <> regexp_replace(btrim(country), '\s+', ' ', 'g')
  or type    <> regexp_replace(btrim(type),    '\s+', ' ', 'g')
  or slug    <> btrim(slug);

-- 2. Normalization trigger function. Collapses internal whitespace runs to a
--    single space and trims the ends of identity/facet fields. Leaves free-text
--    fields (description, address) untouched so intentional formatting is kept.
create or replace function normalize_bar_text()
returns trigger as $$
begin
  new.name    := regexp_replace(btrim(new.name),    '\s+', ' ', 'g');
  new.city    := regexp_replace(btrim(new.city),    '\s+', ' ', 'g');
  new.country := regexp_replace(btrim(new.country), '\s+', ' ', 'g');
  if new.type is not null then
    new.type  := regexp_replace(btrim(new.type),    '\s+', ' ', 'g');
  end if;
  if new.slug is not null then
    new.slug  := btrim(new.slug);
  end if;
  return new;
end;
$$ language plpgsql;

-- 3. Fire on every insert and update, before the row is written.
drop trigger if exists bars_normalize_text on bars;
create trigger bars_normalize_text
  before insert or update on bars
  for each row
  execute function normalize_bar_text();
