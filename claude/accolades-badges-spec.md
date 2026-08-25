# Accolade badges — front-end spec
*Data is LIVE in the database; nothing renders it yet. 273 active bars carry accolades, 352 entries, 52 gold-tier.*

## Current state
- `bars.accolades` jsonb is populated and correct.
- `src/lib/supabase.ts` does **not** select the column — fix this first or nothing downstream has data.
- No component renders it. The only reference in the codebase is `owner-fields.ts`, where it is (correctly) forbidden to owners.

## Data shape
```json
[{"org":"World's 50 Best Bars","org_key":"w50b","year":2025,"rank":32,
  "kind":"ranked","title":null,"score":1011,
  "source":"https://www.theworlds50best.com/bars/list/1-50"}]
```
`kind` ∈ ranked | winner | nominee | listed. Array is already sorted by `score` descending, one entry per `org_key`. Treat it as read-only display data — never recompute score client-side.

## Where badges go
1. **Bar profile** — a row directly under the bar name / above the location line. Show up to 3; if more, a `+N more` chip.
2. **Directory cards** — 1 badge, 2 maximum, highest score first. The card sells the bar, not the trophy cabinet.
3. **A bar with no accolades renders no badge row at all** — no empty state, no placeholder.

## Badge anatomy
Two-part chip: organisation label + value. Uppercase, letterspaced ~0.09em, ~10.5px, font-weight 600/700, `white-space: nowrap`, border-radius 3px.

Label / value text by kind:
- `ranked` → org name + `No. {rank} · {year}`
- `winner` → org name + `{title or "Winner"} · {year}`
- `nominee` → org name + `Nominee · {year}`
- `listed` → org name + `{title or "Listed"}` (Discovery has no year to show)

Shorten long org names on cards only: "World's 50 Best Bars" → "World's 50 Best", "North America's 50 Best Bars" → "NA 50 Best".

## Four visual tiers — driven by data, never hand-tagged
| Tier | Rule | Treatment |
|---|---|---|
| Gold | `score >= 900` | border + value-chip `--gold`; light gold label background |
| Ranked | `kind = ranked`, score < 900 | 1px black border, black value chip, white label |
| Winner | `kind = winner`, score < 900 | solid black background, gold value chip |
| Soft | `kind` = nominee or listed | 1px light border, muted label, quiet value |

Suggested colours (match the site's warm palette; use existing CSS variables where they exist): gold `#B08D3F`, gold background `#F3EAD6`, ink `#111`, muted `#6b6660`, line `#d8d2c8`.

## Reference implementation
The approved mockup is a standalone HTML file Roman has (badge library, profile header, directory cards, worked examples). Ask him for it if the CSS above is ambiguous — the class names there are `acc`, `acc--top`, `acc--rank`, `acc--win`, `acc--soft`, `acc--more`, with inner `.org` and `.val` spans.

## Rules that must hold
- **Never render an entry missing `year` or `source`.** That is the accuracy guarantee for the whole system.
- Accolades show on **free listings exactly as on paid ones** — they are editorial, not a paid feature. The moment a badge can be bought it stops being a credential.
- Do not add `aggregateRating`/`Review` schema markup from this data. Google's review-snippet guidelines forbid marking up ratings aggregated from other sites; awards are not ratings. `schema.org/award` on the bar entity is fine if you want structured output.
- `source` need not be visible, but keep it in the data and consider it as a `title` attribute for auditability.

## Related
- Admin editing of accolades: see `claude/admin-editor-spec.md` (computed score, required source URL, live badge preview).
- Monthly refresh: a scheduled task re-checks the awarding bodies and rewrites scores with the recency decay. Front end must not assume scores are static.
