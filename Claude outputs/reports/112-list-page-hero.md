# Task 112: list-page hero as a compact black band. Branch `preview/112-list-hero`, draft PR #77, NOT merged, 2026-09-23

Preview (Vercel SSO, you are signed in):
https://barmagazine-next-git-previ-d7cd62-romanzelenkajj-7135s-projects.vercel.app

Look at `/bars`, `/best-bars/mumbai`, `/awards/worlds-50-best`, desktop and phone. Also covered by
the same two rules: `/bars/city/*`, `/bars/country/*`, `/best-bars/<city>/<type>`, the
country/state/continent type pages, `/awards`. Bar profiles keep their photo hero (their classes
are `bar-profile-hero*`, untouched).

## What the band is

Background `#000`, the same value as `.nav`, so header and band read as one. Gold caps eyebrow
(`--gold`, 11px, 0.14em tracking), white title (26 to 32px), one grey line at 65% white: the
existing intro sentence, or on `/bars` the counts as "1,782+ bars · 257 cities · 64 countries"
(the three stat tiles and the "Handpicked cocktail bars..." subtitle are gone; the numbers are
the same live counts, still pinned to en-US). Rounded corners on desktop, edge-to-edge and flush
under the flat header on phones, like the old hero. No photo, no scrim: the `directory-hero.jpg`
asset and the first-bar-photo backgrounds on city and country pages are no longer rendered.

Heights measured on the branch: **220px on desktop** on all three pages (border-box; the first
pass rendered 276 because Tailwind preflight is off and the min-height was a content-box value,
fixed). **Phone (390 wide): /bars 163, /awards/worlds-50-best 160, /best-bars/mumbai 169** (first pass; see the rework below for the phone numbers after the pills started wrapping).

## What stays where it was

Breadcrumb (desktop), search box, filters, type chips, the grid/map toggle, the results count,
the sidebar and the promo box: none of them changed, and the band sits in the same grid cell the
hero did. The promo box next to the band on `/bars`, city and country pages shares the band's
grid row, so it is now 220px tall like the band (it stretched to the hero's 228 before).

Two judgment calls, both easy to reverse:
- The `/best-bars/*` and `/awards/*` bands are left-aligned like `/bars` (they were centred white
  cards) so every band reads the same.
- On phones the `/best-bars/*` and `/awards/*` pages lose the 32px beige strip between header and
  band (`.best-bars-page` top padding), so their band is flush under the header exactly like
  `/bars`. That moves those pages' content up by 32px on phones only.

## The fold on a 390px phone

`/best-bars/mumbai`: first card top at 285px, well inside 844. `/awards/worlds-50-best`: the 2026
heading at 316. `/bars`: the band ends at 251, then the untouched search box, the three
dropdowns, Near me and the Grid/Map toggle (about 410px of controls, unchanged per your rule),
then the type chips and the count, so the first card's top edge lands at roughly 800px: on screen,
but only its top strip. If you want the whole first card above the fold on `/bars`, the filter
block has to change, which is outside this task.

## Files

`src/app/globals.css` (both hero rules and their mobile blocks), `src/components/BarDirectoryMap.tsx`
(/bars band markup), `src/app/bars/city/[city]/page.tsx` and `src/app/bars/country/[country]/page.tsx`
(photo layer removed, eyebrow added). `tsc` clean. Branch only; this report on main.

## Rework (same day, same branch and preview URL): header rows, rank pills, whole sentences

Band approved; three changes on top, all on `preview/112-list-hero`, PR #77 rebuilt green.

- **Award hubs, no bare headings.** Year and list name sit in one slim white rounded header row
  (`.list-section-head`: the card background, 1px `#e8e2d6` border, 16px radius, 12/18px
  padding; year bold 18px left, list name grey 14px). Flow blocks, which have no list name, get
  the year alone in the same row. The "Other award programs" and "by city" headings on every list
  page take the same row so nothing sits bare on the page background.
- **Rank inside the card.** The "No. 1" kicker above the card is gone on ranked sections; the rank
  rides as a small black pill in the top-left corner of the photo (`DirectoryBarCard` gained a
  `rankPill` prop; `.bar-dir-rank-pill`, black, white text, 10px inset). Unranked flow cells keep
  their category kicker.
- **Intro never truncates mid-sentence.** The band shows the intro's first sentence whole
  (`src/lib/first-sentence.ts`, with a guard for "No. 69", "St.", "Dr." and similar; 5 tests). The
  line clamps are gone on desktop and phone.
- **Phone (390): pills wrap** to a second line instead of scrolling off the edge. Measured: Mumbai
  band 249px (intro is the whole first sentence, pills 338px wide, first card top at 365), /bars
  band 163px, no horizontal overflow on either. Awards hub desktop: band 220px, rows read
  "2026 Asia's 50 Best Bars", rank pill at top 10 / left 10, zero bare headings.

Files added to the branch: `src/lib/first-sentence.ts` + test, `src/components/DirectoryBarCard.tsx`,
`src/app/awards/[program]/page.tsx`, `src/app/awards/page.tsx`, `src/app/best-bars/[city]/page.tsx`,
`src/app/best-bars/[city]/[type]/page.tsx`, `src/components/RegionTypePage.tsx`,
`src/app/bars/city/[city]/page.tsx`, `src/app/globals.css`. tsc and lint clean.
