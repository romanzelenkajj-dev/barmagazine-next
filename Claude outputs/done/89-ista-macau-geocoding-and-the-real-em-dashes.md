# The four things left open by the 88 report

Answers to everything you flagged, plus the em dash work your own audit found and the task
did not. Roman's standing instruction this week is that design and judgement calls are
yours; these four are his because they are policy, provenance or DDL.

---

## 1. Ista Coffee Elements: take the Tabelog address, and say so

Take it. Record it as its own source, not folded into the Time Out string, so
`editorial_sources` shows two distinct things: Time Out's counted six admitted the bar, and
Tabelog supplied the street address. Anyone reading the row in a year should not have to
guess which line vouches for what.

**Why this does not contradict yesterday's rule.** The rule was never "the admitting source
must supply every field". It was that admission needs a qualifying source and that hours need
a venue-controlled one. An address is neither: it is stable, it is checkable, and it is the
one field without which the listing is useless to a visitor. Tabelog is Japan's dominant
venue directory with claimed business pages, which puts it well above a travel blog.

Still no hours, for the same reason as the other two.

Add a line to its `admin_notes` recording that the address is third-party and unverified
against the venue, so the un-enrichable flag does not read as though everything about the row
is sourced from the admitting list.

**If Tabelog's address is ambiguous or the listing looks stale, leave the address null and
tell Roman.** A wrong address is worse than none, and Osaka clearing five is not a reason to
guess.

---

## 2. Macau: fix the geocoding, it is not just cosmetic

All five bars on 22.15 / 113.56 breaks three things at once: the map stacks them, near-me
cannot order them, and task 87 is about to make near-me the thing that decides what a visitor
in Macau sees first. Fixing it after 87 means testing 87 against broken data.

Work out why the geocoder never resolves a Macau street address. Macau addresses are usually
Portuguese-form ("Rua de Pedro Nolasco da Silva, 32A"), often without a postcode, which many
geocoders handle badly; the territory may also be being sent as a country the provider does
not recognise. Report the cause before fixing, because if it is a country-code problem it
will affect Hong Kong and other territories too, and that is worth knowing.

Then re-geocode the five and verify they land on five distinct points in the right districts.

**Check whether any other city has the same collapse.** A query for coordinates shared by
three or more bars in one city will find them in a minute, and a centroid fallback that fires
silently is exactly the kind of thing that has been wrong for months without anyone looking.
Report what you find; do not fix beyond Macau without asking.

---

## 3. The em dashes visitors actually see

Your audit found the real ones and the task did not. Fix every visitor-facing instance:

| File | Count | What |
|---|---|---|
| `src/lib/article-schema.ts` | 6 | category meta descriptions, the live path |
| `src/app/llms.txt/route.ts` | 8 | public llms.txt |
| `src/lib/emails/welcome.ts` | 4 | subscriber welcome email |
| `src/app/bars/country/[country]/page.tsx` | 2 | country page metadata and body |
| `src/lib/accolades.ts` | 2 | accolade labels on profiles |
| `src/app/owner-dashboard/page.tsx` | 2 | dashboard copy |
| `src/lib/menu-url.ts` | 2 | owner form validation messages |
| `src/app/links/page.tsx` | 1 | `/links` metadata |
| `src/middleware.ts` | 1 | the 410 Gone body |

Replace with punctuation the sentence wants: a colon, a comma, a period, or a rewrite. Do not
substitute an en dash where the right answer is different punctuation.

**Leave alone**, and this is not negotiable: `house-style.ts`, `bar-seo-meta.ts`,
`menu-highlight.ts`, `bar-name.ts`, `bar-fallback.ts`, `sitemap-filters.ts` and
`EditableSubmissionFields.tsx:24`. They detect em dashes; changing them breaks the checker.

**Admin-only screens: leave them too.** A bare em dash standing for an empty table cell is
correct typography and no visitor sees it. Roman's rule is about the writing, not about the
character existing in the repo.

One thing worth doing while you are there: the house-style checker did not catch any of this.
Say in the report whether it *could* have, and what it would take to point it at metadata,
JSON-LD and email templates as well as body copy. Do not build it; just say.

---

## 4. `bars-data.ts`

716 lines of stale static bar data whose only consumer you deleted. `BARS_DATA` is dead; the
`Bar` type it exports is still imported by `FeaturedBarsScroller.tsx`.

Move the type to wherever the live `Bar` type belongs, repoint that import, delete the file.
If the two `Bar` types have drifted and are not interchangeable, stop and say so rather than
making them fit.

---

## Not in this task

Task 69 waits on Roman running the SQL. Do not merge it before he confirms. AMORD3 stays for
the next subtype pass. 84, 85, 86 and 87 are queued and 87 still goes last of those, after
item 2 here.

## Report

The Ista decision and what Tabelog gave you, the cause of the Macau geocoding failure and
whether it is wider than Macau, the em dash count before and after with anything you chose
not to touch, and whether the house-style checker could have caught these.
