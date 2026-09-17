# Report: 61-prune-the-type-filter (2026-09-17)

Done and live. Commit `e388077`, plus two data merges.

## 1. The synonyms, merged in the data

| Was | Now | Rows |
|---|---|---|
| Hidden Bar | **Speakeasy** | 1 (Toy Store, Katowice) |
| Beer Bar | **Pub** | 1 (Blind Tiger, New York) |
| Omakase Cocktail Bar + Japanese-Influenced Bar | **Japanese Cocktail Bar** | 2 rows, 3 tags |

**On the Japanese pair.** The two names split one idea across three tags and
neither is what a reader types. "Omakase" describes a service format and means
nothing to most people looking for a bar; "Japanese-Influenced" is a phrase
nobody searches. **Japanese Cocktail Bar** is the searched term, it is true of
both rows, and it reads as a category rather than a description. Hanashi
carried both names and now carries one.

**One thing the first pass missed.** Blind Tiger in New York had `Beer Bar` as
its **primary type**, not as a subtype, so a subtype-only merge left the
category alive with one row. Caught by re-counting after the merge rather than
assuming it had worked. Its type is now Pub, with the reason in `admin_notes`;
the venue and its description are untouched.

## 2. The threshold

`MIN_FILTERABLE_TYPE_BARS = 6`, matching `MIN_REGION_BARS`, which is the same
judgement about when a slice of the directory is worth offering as its own
thing.

| Style | Bars | Chip |
|---|---|---|
| Cocktail Bar | 1,443 | shown |
| Hotel Bar | 174 | shown |
| Speakeasy | 129 | shown |
| Restaurant Bar | 49 | shown |
| Rooftop Bar | 48 | shown |
| Tiki Bar | 21 | shown |
| Wine Bar | 12 | shown |
| Pub | 9 | shown |
| Whiskey Bar | 3 | hidden |
| Distillery Bar | 2 | hidden |
| Japanese Cocktail Bar | 2 | hidden |
| Music Bar | 1 | hidden |
| Gin Bar | 1 | hidden |

**Sixteen styles became fourteen through the merges, and the filter now offers
eight instead of sixteen.** Speakeasy went to 129 and Pub to 9, so two
categories got stronger rather than disappearing.

The five hidden styles stay on their rows and stay visible on each profile,
because Hanashi genuinely is a Japanese cocktail bar and that is worth saying
on its page. The rule is count-driven, so a style reappears on its own as it
reaches six and nothing needs maintaining.

## 3. The two Distillery Bar rows, checked not merged

**Both stay, and neither is close to the line.** The standing rule excludes
"distillery taprooms that are not cocktail bars". These are cocktail bars that
happen to sit inside distilleries, which is a different thing.

**Barr Hill Cocktail Bar**, Montpelier, Vermont. Its own page describes a
cocktail bar inside the working Caledonia Spirits distillery, with a seasonal
food and drink menu and cocktail classes. **The James Beard Foundation named it
one of five finalists for Outstanding Bar in 2024.**

**The Bar at Willett**, Bardstown, Kentucky. Vintage whiskey, classic cocktails
and small plates from a revolving menu with a named chef, open by day
Wednesday to Saturday with reservations. **A James Beard Outstanding Bar
semifinalist in 2025.**

A venue that reaches a James Beard Outstanding Bar shortlist is not a tasting
room. Nothing was removed and nothing needs your decision here.

## Guards kept

Ordering and filter vocabulary only. No bar deactivated, no style deleted from
any row, no layout change. Build clean, 382 tests passing.
