# Task 88, and your approvals of 20 September

Merge order followed exactly as you set it: 79, then 74, then the dead files and em dashes,
then 69. Task 87 has not been started, which is the point of the order.

---

## Before the merges: Macau and Osaka

**Three rows inserted**, address from the admitting list, **no hours on any of them**.

| Bar | Address source | Hours |
|---|---|---|
| Two Moons, Macau | Tatler Best 20 Bars in Macau 2026 | none |
| Wood House, Macau | Tatler Best 20 Bars in Macau 2026 | none |
| Ista Coffee Elements, Osaka | **none available**, see below | none |

The provenance is written into `editorial_sources` as you asked, in the source string itself,
so it reads as *"Tatler, The Tatler Best 20 Bars in Macau 2026 (source for the address as well
as the admission)"* rather than having to be inferred.

**Ista has no street address, and I could not give it one.** Time Out prints only "near
Sakaisuji-Hommachi Station in the bustling business district of central Osaka". There is no
address in the admitting list to take. I inserted it with `neighborhood: Sakaisuji-Hommachi`
and a null address; the geocoder still placed it at 34.6836, 135.5008, which is the right part
of the city. Tabelog has a precise address but Tabelog is a directory, not the admitting list,
so I did not take one from it. **Say if you want that.**

### The numbers you asked for, not the assumption

| City | Bars | `MIN_CITY_BARS` = 5 |
|---|---|---|
| **Macau** | **5** | **clears** |
| **Osaka** | **5** | **clears** |

`/best-bars/macau` and `/best-bars/osaka` are both live and `index, follow`.

### Flagged permanently un-enrichable

All three carry this in `admin_notes`, which is a private column and does not render:

> PERMANENTLY UN-ENRICHABLE (2026-09-20). No website and no findable Instagram, checked
> directly. That means no outreach email, no claim, no owner photo, ever, unless the venue
> puts something online. Address and admission both come from the editorial list in
> editorial_sources; hours deliberately absent because a listing cannot keep them current.
> DO NOT re-queue for enrichment: there is nothing to enrich from.

**Where that belongs, since you asked:** `admin_notes` is the right home because it travels
with the row, is visible in the admin screen, is stripped from every public response by
`stripPrivate`, and cannot drift out of sync with a separate list. The enrichment queue files
in `Claude outputs/` are snapshots rebuilt per run, so a flag there would be lost on the next
rebuild.

### One pre-existing problem this exposed, which I did not cause

**All five Macau bars sit on the identical coordinate, 22.15 / 113.56.** That includes Pony &
Plume, The St. Regis Bar and Wing Lei Bar, which predate today. The geocoder has never resolved
a Macau street address and falls back to the territory centroid every time. They stack on the
map and near-me cannot order them. Separate job, flagging not fixing.

---

## a. `preview/79-metro-and-area`: merged

`67da6df`. It was **8 commits behind** and touches the city page task 83 rewrote, so I rebased
rather than merging blind. The rebase was clean and I checked both survived by grep before
merging, not after.

Verified against the live 1,545 rows:

| | |
|---|---|
| Raw city strings | 219 |
| After the ten rollups | 209 |
| **Default dropdown** | **93** at `MIN_DROPDOWN_CITY_BARS` = 3 |
| Behind "All cities" | 116 |
| Long Beach | still its own city |
| Beverly Hills | folded |
| Shawnee | folds to `kansas-city` |
| Oakland | 16 bars, untouched |

---

## b. `preview/74-distance-units`: merged, and this was the live bug

`c420a88`. **15 commits behind.** Rebased, clean, then all four behaviours re-verified **in the
built bundle** rather than assumed, because both this branch and 79 rewrite the same file:

| Behaviour | Verified |
|---|---|
| Units from country, not language | `IMPERIAL_COUNTRIES` and `usesImperial` present |
| Card distance threshold | `CARD_DISTANCE_LIMIT` present |
| Banner derived from the cards | "nearest bars we list" present, `NEAR_LIMIT_KM` gone |
| Count pinned to en-US | renders "1,545+" |

And 79's work still present alongside it: `metroCityOf`, `searchTermsOf`,
`__show_all_cities__`.

**Nothing changed in meaning.** One thing worth knowing: `navigator.language` still appears in
the file at line 81, and that is correct. It is now only a *fallback* inside `usesImperial()`
for when `geoCountryCode` is absent, with kilometres as the default. The Bratislava case
resolves on the IP country, which is what you were seeing miles from.

---

## c. Dead files and em dashes: done

`31f0dd4`. Both files deleted after confirming **zero imports** anywhere in `src`. The three
named em dashes replaced with punctuation that suits the sentence: colon, colon, comma. The
`&#8212;` decode is untouched.

### What I found beyond the three, reported not fixed

**82 em dashes survive in non-comment code.** Most are legitimate. The ones that matter:

**The fix you approved does not change what most visitors actually see on a category page.**
Task 88 named `category/[slug]/page.tsx:17`, and that line is only the **fallback** for a
category absent from the map. The live meta description for every real category comes from
**`src/lib/article-schema.ts`**, lines 5 to 10, six em dashes, one per category:

> "Cocktail recipes, mixology trends, and signature drinks from BarMagazine **—** featuring
> techniques and inspiration from leading bartenders worldwide."

I verified this by fetching `/category/cocktails`: the JSON-LD name is now correct
("Cocktails, BarMagazine") but the meta description still carries the em dash, from that file.

**Other visitor-facing ones:**

| File | Count | What |
|---|---|---|
| `src/lib/article-schema.ts` | 6 | category meta descriptions, the live ones |
| `src/app/llms.txt/route.ts` | 8 | the public llms.txt |
| `src/lib/emails/welcome.ts` | 4 | the subscriber welcome email |
| `src/app/bars/country/[country]/page.tsx` | 2 | country page metadata and body copy |
| `src/lib/accolades.ts` | 2 | accolade labels rendered on profiles |
| `src/app/owner-dashboard/page.tsx` | 2 | owner dashboard copy |
| `src/lib/menu-url.ts` | 2 | validation messages in the owner form |
| `src/app/links/page.tsx` | 1 | `/links` metadata |
| `src/middleware.ts` | 1 | the 410 Gone body |

**Admin-only, and mostly correct usage:** `AdminBarsClient`, `admin/claims`, `notify.ts`,
`mail.ts` and the submission notification email. Several are a bare `—` standing for an empty
cell in a table, which is exactly what an em dash is for.

**Must not be touched:** `house-style.ts`, `bar-seo-meta.ts`, `menu-highlight.ts`,
`bar-name.ts`, `bar-fallback.ts`, `sitemap-filters.ts`, and
`EditableSubmissionFields.tsx:24`. These are the regexes that **detect** em dashes. Changing
them would break the house-style checker.

**One more thing the deletion exposed.** `src/lib/bars-data.ts` is 716 lines of stale static
bar data. Its `BARS_DATA` export had exactly one consumer, `BarsDirectory.tsx`, which is now
gone, so the constant is dead. Its `Bar` **type** is still imported by
`FeaturedBarsScroller.tsx`, so the file cannot simply be deleted. Not in the task, so not
touched.

---

## d. `preview/69-structured-hours`: rebased, builds, and here is the SQL

**Not merged**, because merging it without the columns ships a form that silently saves
nothing.

Rebased onto main from **18 commits behind**. Clean, `next build` exits 0, 399 tests pass.
Four files: `add-your-bar/page.tsx`, `globals.css`, `HoursInput.tsx`, `structured-hours.ts`.

**All three columns confirmed missing on production**, so this is a real change and not a
no-op. I checked each one rather than assuming.

### What it does, in one sentence

It adds a second, structured hours column beside the free-text one, so a bar can store hours
as data without disturbing the 1,097 bars whose hours are prose.

### The SQL, to paste into the Supabase SQL editor

```sql
ALTER TABLE public.bars
  ADD COLUMN IF NOT EXISTS opening_hours_structured jsonb;

COMMENT ON COLUMN public.bars.opening_hours_structured IS
  'Opening hours as data, one key per day (mon..sun): {closed} or {closed:false, open:"HH:MM", close:"HH:MM"}. '
  'A close <= open runs past midnight. When present, the display string is generated from this; '
  'bars.opening_hours remains the fallback for rows without it. See src/lib/structured-hours.ts.';

ALTER TABLE public.bar_submissions
  ADD COLUMN IF NOT EXISTS opening_hours text;

ALTER TABLE public.bar_submissions
  ADD COLUMN IF NOT EXISTS opening_hours_structured jsonb;

CREATE INDEX IF NOT EXISTS bars_opening_hours_structured_idx
  ON public.bars USING gin (opening_hours_structured)
  WHERE opening_hours_structured IS NOT NULL;
```

### What to expect after it runs

- **Nothing visible changes.** Every column is added empty and nullable, and every existing
  bar keeps displaying from `bars.opening_hours` exactly as now.
- `bar_submissions` gains an hours column **for the first time**, which is why the "Opening
  hours" row does not render in the admin review screen today. It will start appearing.
- Once 69 merges, the owner form's seven day rows will save, and a bar with structured hours
  will have its display string generated rather than typed.
- It is safe to re-run: every statement is `IF NOT EXISTS`.

Check afterwards:

```sql
SELECT column_name, data_type FROM information_schema.columns
 WHERE table_name IN ('bars','bar_submissions') AND column_name LIKE 'opening_hours%';
```

**Then tell me and I will merge 69.**

---

## e. Task 87: not started

As instructed, so the near-me rewrite is built on the finished file. Your correction is noted
and I will hold to it: **inside a single distance band, quality decides the order, not
metres.** All sixteen Bratislava bars are one band, so Mirror Bar leads on its three accolades
rather than whichever bar is eighty metres nearer. That is the existing rule and the rewrite
will preserve it, not re-derive it.

---

## Item 5 of task 88

AMORD3 still has `subtypes: null`. Left for the next subtype pass, as the task says, not done
as its own job.

## Still open

- The Ista address question.
- The Macau centroid geocoding, five bars on one point.
- `article-schema.ts`, the six em dashes visitors actually see on category pages.
- The SQL above, then the 69 merge.
- Tasks 84, 85, 86 and 87.
