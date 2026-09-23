-- bars.search_terms (2026-09-23, task 108): the venue's other names, entered by
-- hand and separated by "|", so a bar is found under the name on its own door.
-- KAA° Mixology trades as "26" / "Twenty Six Budapest" (@twentysixbudapest);
-- none of that is in bars.name, so the directory search could not find it.
--
-- Why a column and not the name: the row's name is the editorial name and it
-- feeds the slug, the title and every page; the aliases are only for search.
-- There is no generated ascii twin: the search filter matches both the folded
-- and the raw query against this column, which is enough for a hand-kept list.
--
-- Run once in the Supabase SQL editor, BEFORE merging preview/108-search-terms:
-- the merged code selects and filters on this column, and PostgREST rejects a
-- query on a column that does not exist, which would empty the directory search
-- and the typeahead until the column appears.
alter table public.bars add column if not exists search_terms text;

update public.bars
   set search_terms = '26 | Twenty Six Budapest | twentysixbudapest',
       updated_at = now()
 where slug = 'kaa-mixology';

-- Verify: one row, the three terms.
select slug, name, search_terms from public.bars where slug = 'kaa-mixology';
