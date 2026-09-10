# Implementation status

Running log of shipped work items and their merge commits. Newest first.

## 2026-09-08 - Claim flow visual redesign

- **Merge commit:** `e154cf1` (branch `claim-redesign`, deleted after merge)
- **Scope:** visual only, per the claim-flow redesign spec (Roman, chat,
  2026-09). Files: `src/app/claim-your-bar/page.tsx`,
  `src/app/claim-your-bar/verify/page.tsx`,
  `src/app/owner-dashboard/login/page.tsx`,
  `src/components/BarSearchTypeahead.tsx` (footer-row prop),
  `src/app/globals.css` (.claim-* card system). Claim logic
  (`src/app/api`, `src/lib`) byte-identical - verified at merge.
- **Delivered:** centered white card on every claim-flow screen; directory
  typeahead reused for Find-your-bar with add-your-bar footer row;
  selection flows into the claim step (claimed bars route to the
  reviewed-transfer wording); verify page leads with the bar name in the
  H1; solid black pill buttons; em-dash-free copy; 24h link-validity line
  on check-inbox (OTP expiry already 86400s); steps collapse to numbers
  under 480px.
- **Verified:** Vercel preview approved by Roman; post-deploy live smoke
  check (landing card, "black" typeahead + footer row, selection into
  claim step, 375px) passed 2026-09-08. Tests 209/209.

## 2026-09-10 - Carousel Bar duplicate merge
- Kwant method under standing approval: `carousel-bar-lounge` kept (richer:
  phone, hours, top10 tier) and reactivated; 2026 Spirited Best U.S. Hotel
  Bar nomination copied from `the-carousel-bar`, which is now inactive.
  Old live URL /bars/the-carousel-bar now 404s (no redirect infrastructure
  for bar slugs); flagged in case it shows up in GSC.

## 2026-09-10 - Merged-slug 301 redirects (STANDARD STEP)
- next.config.mjs redirects() now carries a merged-bar-slug map:
  kwant-mayfair -> kwant, la-petite-maison -> lpm-dubai,
  black-swan-lab -> black-swan-budapest, the-carousel-bar ->
  carousel-bar-lounge. STANDARD: every future duplicate merge appends
  its pair in the same commit that deactivates the losing row.

## 2026-09-10 - Duplicate rows hard-deleted (STANDARD updated)
- The four merged duplicate rows are DELETED from bars, not just
  inactive (Roman: duplicates are noise, not history; closures stay
  inactive). Deleted, with pre-delete checks passed (zero bar_claims /
  owner_submissions references; 301 redirect live in next.config.mjs):
  - the-carousel-bar (35924999-18c3-4a37-bcbb-a0630f83f7d0) -> carousel-bar-lounge
  - kwant-mayfair (0e876c23-86fd-44e9-8140-b84d1e10372b) -> kwant
  - la-petite-maison (b6c80600-ae24-4962-9d50-45c7ffffefdd) -> lpm-dubai
  - black-swan-lab (6011ebfa-a37b-42d4-87d2-5d4c1cd0be4b) -> black-swan-budapest
- STANDARD merge procedure is now: (1) merge data into the richer row,
  (2) append the 301 pair to next.config.mjs in the same commit,
  (3) verify no bar_claims/owner_submissions rows point at the losing
  row, then hard-delete it, (4) note the merge + deletion here.
- Same pass: carousel-bar-lounge instagram corrected carouselbar ->
  hotelmonteleone (venue posts live on the hotel account).

## 2026-09-10 - Admin listing defaults to active bars
- /admin/bars now filters to is_active by default; a "Show inactive (n)"
  toolbar toggle reveals the historical rows (closures, editorial holds).
  Client-side only; the API still returns everything.
