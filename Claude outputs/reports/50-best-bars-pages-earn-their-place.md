# Report: 50-best-bars-pages-earn-their-place (2026-09-17)

**Part 1 is prepared but cannot be applied, and Part 2 should not ship as
specified.** Nothing on the site changed. Two separate blockers, and the
second is the important one.

## Blocker 1: I cannot create the column

Schema changes in this repo are run by hand in the Supabase SQL editor. Every
past one says so in its own header, and `bars.editorial_sources` does not
exist yet. Both halves are written and waiting:

- `scripts/editorial-sources-migration.sql`, the column, its comment and a GIN
  index. Run once in the SQL editor.
- `scripts/backfill-editorial-sources.mjs`, repeatable, dry run by default,
  writes through the admin API.

**The dry run works without the column and I ran it.** It would give **217 of
1,469 active bars at least one entry, 240 entries across 82 cities**: 106 from
this session's research JSON, which records the admitting source as a field,
and 112 from the older wave reports, where one source covers the whole file.

## Blocker 2: the reason test does not do what the task expects

This is the one worth your time. The task predicts the test would leave
Bratislava "with one bar, not five", and expects it to "land near five" after
the backfill.

**It lands on twelve of sixteen, and Baudelaire Bar is still on the page.**

That is the exact bar you objected to. Here is why, and it is structural
rather than a bug. In a city we filled from local press, **being on a local
press list is the entry criterion for the whole city**. Every bar I inserted
in Bratislava today got in because an editorial source named it, so "has an
editorial source" cannot rank inside that city. It is the floor, not a filter.

The same shape, per city:

| City | Bars | Qualify under the rule | Comment |
|---|---|---|---|
| Bratislava | 16 | **12** | wanted ~5 |
| Warsaw | 16 | **12** | every bar came from local press |
| Budapest | 19 | 11 | |
| Belgrade | 16 | 6 | reasonable |
| Prague | 21 | **3** | its BCA bars were already listed, so they carry no entry |
| London | 54 | Type A | 12 accolade bars fall off the curated ten |

Prague is the mirror image and just as telling: it lands on three not because
its bars are weak, but because the bars we hold there predate the waves that
record a source. Across all 49 Type B cities the backfill takes cities with
three or more qualified bars from 24 to 29, so **20 would still fall back** to
the current sort.

An outcome that swings from 3 to 12 on an accident of when a bar was added is
not a ranking.

### Why tightening the rule does not rescue it

The obvious fix is to rank editorial sources by selectivity, so a Falstaff Bar
Guide entry or a Michelin mention outranks a city map or a festival
participant roster. That helps: Bratislava's UFO and Casa del Havana came from
a tourism board page and a festival roster, which are not selections at all.

**It still does not remove Baudelaire.** Baudelaire is on Refresher.sk's Top 5
cocktail bars in Bratislava. A Slovak outlet made it a top five pick. No rule
built on "who listed it" will drop a bar that a local outlet ranked fifth,
because the sources genuinely disagree with you.

### What I recommend instead

Two changes, and the second is the one that actually answers your complaint.

1. **Cap the Type B pick and rank it by reason strength.** Accolade first,
   then a selective editorial list (Falstaff, Michelin, a named "Top N"), then
   a broad list (city map, tourism page, festival roster), then photo, then
   name. Cap at five or six. That alone gets Bratislava to Mirror Bar, The
   Half Blind Pig, Baudelaire and two others, and it fixes Prague, because a
   cap with a floor of three still fills from the current sort.

2. **Add an editorial override you control.** A boolean or a small integer on
   the row, set by you, that promotes or demotes a bar on its city page. The
   Bratislava case is not a data problem. Every automated signal we have says
   Baudelaire belongs, and you say it does not. That judgement has to be
   storable or it will keep being overruled by the sources.

I have not built either, because both change what the page means and that is
your call, not mine.

## The two numbers the task asked for

**Type A and Type B.** Of the **70 cities** that currently have a best-bars
page at `MIN_CITY_BARS = 5`: **23 are Type A** and **47 are Type B**.

The 23 Type A cities: London, New York, Singapore, Hong Kong, Paris, Tokyo,
Barcelona, Chicago, Los Angeles, New Orleans, Miami, Las Vegas, Sydney,
Seattle, Mexico City, San Francisco, Denver, Dubai, Philadelphia, Washington
DC, Boston, Austin, San Diego. Every one has exactly ten curated picks.

**Accolade-holding bars that would fall off Type A pages: 101 in total.**

| City | Bars | Accolade bars not in the curated ten |
|---|---|---|
| New York | 54 | 23 |
| London | 54 | 12 |
| Singapore | 41 | 7 |
| Hong Kong | 36 | 6 |
| Chicago | 25 | 6 |
| New Orleans | 24 | 6 |
| Paris | 31 | 5 |
| Los Angeles | 24 | 5 |
| Denver | 19 | 5 |
| Mexico City | 21 | 4 |
| Miami, San Francisco, Washington DC | | 3 each |
| Barcelona, Las Vegas, Sydney, Philadelphia | | 2 each |
| Tokyo, Seattle | | 1 each |
| Dubai, Boston, San Diego | | 0 |

On your question of whether those pages should carry an accolade section: for
New York, dropping 23 accolade-holding bars from a page called "The Best Bars
in New York" is a lot to leave out, and the "Also in" section Type B gets
would serve Type A just as well. For Dubai, Boston and San Diego it would be
empty. I would give Type A the same "Also in" section rather than a separate
accolade block, so both page shapes have one pattern.

## What is ready the moment you decide

The migration and the backfill are committed and tested as far as they can be
without the column. Run the SQL, tell me which of the two recommendations you
want, and Part 2 is a short piece of work.

## One thing I verified while here

The diagnosis in the task is exactly right about the cause. Bratislava has no
top10-tier bar, one bar with an accolade and three with photos, so from the
fourth slot the page is ordered by first letter. Baudelaire is on it because
of the B. `CITY_PAGE_MAX_BARS` is 12 and is not the problem.
