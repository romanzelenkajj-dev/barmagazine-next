# Accolade badges — front-end spec (FINAL, approved by Roman 2026-08-25)
*Supersedes the earlier draft. Design settled after five rounds of mockups; the approved visual is `claude/accolade-badges-mockup.html` (option "tile", placement "A").*

## Current state
- `bars.accolades` jsonb is populated: **273 active bars, 352 entries**.
- `src/lib/supabase.ts` does **NOT** select the column — fix this first or nothing downstream has data.
- Nothing renders it. The only reference in the codebase is `owner-fields.ts`, where it is correctly forbidden to owners.

## What is in the data today
| org_key | org | entries | gold (score ≥ 900) |
|---|---|---|---|
| `w50b` | World's 50 Best Bars | 102 | 52 |
| `a50b` | Asia's 50 Best Bars | 100 | 1 |
| `na50b` | North America's 50 Best Bars | 98 | 1 |
| `e50b` | Europe's 50 Best Bars | 52 | 1 |

`bca` (Bartender's Choice Awards) is **not yet imported** — build its tile style now; entries land later.

## The tile
Fixed **74 × 44px**, `border: 1px solid`, `border-radius: 4px`, three centred lines, `line-height: 1`:

| Line | Size | Tracking | Weight | Notes |
|---|---|---|---|---|
| region | 6px | .12em | 700 | uppercase, `opacity: .72` |
| **main** | 10.5px | .04em | 800 | margin `3px 0 2.5px` |
| year | 6.5px | .08em | 700 | `opacity: .72` |

The **main line is identical on every 50 Best tile** — that is what makes them read as one family. Never vary it.

## Wording — possessive, exactly as the awarding bodies name themselves
| org_key | line 1 | line 2 | line 3 |
|---|---|---|---|
| `w50b` | `WORLD'S` | `50 BEST` | year |
| `a50b` | `ASIA'S` | `50 BEST` | year |
| `e50b` | `EUROPE'S` | `50 BEST` | year |
| `na50b` | `N. AMERICA'S` | `50 BEST` | year |
| `bca` | `BARTENDER'S` | `CHOICE` | year |

The possessive rides on the small line so the bold line stays constant. Getting another organisation's name exactly right is part of the credibility — same principle as showing the year.

## Colour
| Tier | Rule | Border | Background | Text |
|---|---|---|---|---|
| Gold | `org_key = w50b` | `#B08D3F` | `#F7F0E0` | `#6d5420` |
| Dark | any regional 50 Best (`a50b`, `e50b`, `na50b`) | `#111` | `#111` | `#fff` |
| Outline | `bca` | `#111` | `#fff` | `#111` |

Gold is reserved for the world list only. If everything is gold, nothing is.

## Placement — "A", under the city
Bar name → location → tiles. Left-aligned, `margin-top: 14px`, flex row, `gap: 7px`, `flex-wrap: wrap`.
Identical on **bar profiles and directory cards**. Never beside the name: names vary in length, which staggers the tiles card to card — the exact problem this design exists to solve.

Spacing matters. The live page before this change was cramped; use 14px between the location and the tile row, and keep the card's internal padding at ~20px.

## What counts as an accolade org (Roman, 2026-09-14, refined the same day)
The test is about **process, not publisher**. "Published by a media company" cannot be the exclusion: The World's 50 Best Bars is published by William Reed, a trade media company, and would fail it. An org qualifies only with **all four** of:

1. a named jury or voting body;
2. a published methodology;
3. an annual cycle;
4. results issued as a ranked or awarded list tied to a year.

| Verdict | Bodies | Why |
|---|---|---|
| **Pass** | The 50 Best lists, Tales of the Cocktail Spirited Awards, Bartenders' Choice, James Beard, 30 Best Bars India, **Mixology Bar Awards** (Mixology magazine), **Top Cocktail Bars Spain** (Neodrinks), **EXAME Casual 100 Melhores Bares do Brasil**, **Shaker Awards** (Mexico) | All four present, whoever prints the result |
| **Fail** | Food & Wine, Eater, Esquire, Time Out, Thrillist, Architectural Digest, Bon Appétit and editorial lists of that kind | None of the four; an editor's pick, not a jury's |

Passing makes a body eligible for an org key and a tile. Whether a tile is actually built is a separate decision, made on how many existing rows would carry it. Editorial mentions that are genuinely notable go in the description prose with publication and year. Keep both example columns here so nobody re-argues this from scratch.

## Rules
- **Maximum 3 tiles.** Beyond that show the top 3 by `score` and nothing else — no "+N" chip; the description carries the rest.
- **Do not render 50 Best Discovery.** It is a curated listing, not a jury ranking, so it does not belong beside badges that all mean "a panel voted for this bar". Discovery stays in the description text only.
- **Never render an entry missing `year` or `source`.** That is the accuracy guarantee for the whole system.
- **Ranks are not drawn on the tile face, but they ARE in the hover text** (Roman, 2026-09-14). The face stays constant so the tiles read as one family; the title attribute carries org, year, "No. N", category and source for every org. The original "not displayed" rule was a design decision taken with the tile shape, not a constraint from any awarding body, and is superseded.
- Badges appear on **free listings exactly as on paid ones** — they are editorial, never a paid feature.
- Do not recompute `score` client-side; a monthly scheduled task rewrites it with a recency decay. Treat the array as read-only, already sorted, one entry per `org_key`.
- No `aggregateRating` / `Review` schema from this data — Google forbids marking up ratings aggregated from other sites, and awards are not ratings. `schema.org/award` on the bar entity is fine.

## Check on a phone
The 6px region line is at the edge of comfortable, and the real reading environment is a dark bar. Verify `N. AMERICA'S` fits 74px without clipping, and that three tiles hold one line at 330px.

## Related
- Admin editing: `claude/admin-editor-spec.md` (computed score, required source URL, live badge preview).
- Monthly refresh: scheduled task re-checks the awarding bodies and rewrites scores.
