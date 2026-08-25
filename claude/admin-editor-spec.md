# Admin bar editor — rebuild spec
*2026-08-24. `/admin/bars` (AdminBarsClient.tsx, 914 lines) predates the premium-profile and accolades work. Roman must be able to edit everything without asking for SQL.*

## What the editor covers today
address, description, short_excerpt, email, instagram, website, phone, opening_hours, lat, lng, type, tier, is_active, is_verified, wp_article_slug, photos (partial).

## What is MISSING and must be added
| Field | Type | Why it matters |
|---|---|---|
| `accolades` | jsonb array | The badge system — currently SQL-only |
| `menu_sections` | jsonb array | The full menu on premium profiles |
| `menu_highlights` | jsonb | Signature serves |
| `menu_url` | text | Link to the bar's own menu |
| `whatsapp` | text | Plan Your Visit card |
| `reservation_url` | text | Reserve button |
| `photo_credit` | text | Attribution (e.g. "Dangerous Water / Salvatore Camagna") |
| `owner_id`, `claimed_at` | read-only + revoke | Ties into the claiming flow |

## Panel layout
1. **Identity** — name, slug, city, country, type, tier, is_active, is_verified
2. **Location** — address, lat, lng (+ "open in Google Maps" link to eyeball the pin)
3. **Contact & visit** — phone, email, website, instagram, whatsapp, reservation_url, opening_hours
4. **Editorial** — description, short_excerpt, wp_article_slug
5. **Accolades** — see below
6. **Menu** — see below
7. **Photos** — see below
8. **Ownership** — read-only owner email + claimed_at, plus a Revoke button

## Accolades editor
Repeating rows. Per entry: `org` (select), `year` (number), `rank` (number, optional), `kind` (ranked | winner | nominee | listed), `title` (text, optional — e.g. "Best Cocktail Menu"), `source` (URL, **required**).

- **`score` is COMPUTED, never typed.** Show it read-only next to each row so the ordering effect is visible. Formula:
  - rank 1–50: base 1000 if org_key = `w50b` else 700; bonus (51−rank)×4
  - rank 51–100: base 800 if `w50b` else 550; bonus (101−rank)×2
  - BCA winner 600 / nominee 250; national winner 350 / nominee 200; unranked listing 150
  - `decay = max(0.5, 1 − 0.06 × (current_year − year))`; `score = round((base + bonus) × decay)`
- org select maps to org_key: World's 50 Best Bars=`w50b`, Asia's=`a50b`, Europe's=`e50b`, North America's=`na50b`, Bartender's Choice=`bca`, 50 Best Discovery=`discovery`, other=`national`.
- **Save must reject an entry with no `source` or no `year`** — that rule is the accuracy guarantee for the whole badge system.
- Warn (don't block) on a second entry with the same org_key; the render rule keeps only the highest-scoring one.
- Array is stored sorted by score descending.
- Show a live badge preview so Roman sees gold vs black before saving (gold = score ≥ 900).

## Menu editor
`menu_sections` is `[{title, note?, items:[{name, ingredients?, ingredients_alt?, price?}]}]`.
- Add / remove / reorder sections; add / remove / reorder items within a section.
- `ingredients_alt` is the second-language line (used for Dangerous Water's bilingual card) — label it clearly, it is optional.
- Include a **raw JSON textarea fallback** with validation, for pasting a whole menu at once. Bulk menus are still built outside the UI.

## Photos editor
- **Order is meaningful: `photos[0]` is the hero.** Reordering must be possible (up/down arrows are fine, drag is nicer) and the hero should be visibly labelled as such.
- Add by URL and by upload (an upload route already exists), remove, and edit `photo_credit`.
- Warn if a `/images/...` path is entered that does not exist in `public/` — those 404 silently and it has bitten us before.

## Work-queue filters (high value, small effort)
The bar list should filter on: missing description, missing address, missing coordinates, missing photos, has accolades, tier, country/city, is_active. With 1,221 bars this turns the admin into the tool for working the remaining enrichment tail instead of a lookup table.

## API
`/api/admin/manage-bar` must accept the new fields. Keep an explicit server-side allowlist of writable columns rather than spreading the request body — admin is trusted, but a typo should not create junk. Validate `accolades` and `menu_sections` shape server-side too; a malformed jsonb array breaks the public profile render.

## Notes
- Changes here write directly to `bars` (admin path), unlike owner submissions which queue for review.
- `accolades` and `description` stay admin-only — they are never editable by bar owners. See `claude/bar-claiming-spec.md`.
