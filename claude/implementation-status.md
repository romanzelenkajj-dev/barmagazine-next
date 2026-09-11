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

## 2026-09-10 - Tier photo limits enforced at upload + tier-aware approval
- Unpaid tiers (free, top10) carry ONE profile photo; Featured/premium keep
  the multi-photo gallery. Limit lives in src/lib/owner-fields.ts
  (photoLimitForTier, fail-closed for unknown tiers) and is enforced twice:
  /api/owner/photos now REJECTS over-limit uploads with a clear message
  (no more silent truncation), and the owner dashboard upload card says
  "Your plan includes 1 profile photo. Featured bars can display a full
  gallery." with a single-file input.
- Tier-aware approval: approving a photo submission on an unpaid bar
  REPLACES the profile photo (paid tiers still append). If a submission
  holds more photos than the plan allows (legacy rows from before the
  gate), the review UI shows the photos as pickable thumbnails; the
  reviewer's pick publishes, the rest stay stored in submitted_data on the
  approved row (they are the upgrade path), and the API refuses to approve
  without a pick (422 requiresPhotoPick).
- Pending Apothéke LA photo_upload (6 photos, tier top10) is the first
  case: it now waits in /admin/review as a one-pick approval.

## 2026-09-10 - 'archived' submission status (quiet shelf)
- New owner_submissions status for setting a submission aside with no
  publish, no reject flow, and no owner notification; submitted_data stays
  intact. Owner API (/api/owner/bars) hides archived rows from the owner
  dashboard; admin review inbox gains an "archived" tab.
- Requires scripts/archive-status-migration.sql in the Supabase SQL Editor
  (widens the status CHECK constraint and archives the Apothéke LA photo
  submission, its 6 photos kept on the row). DDL cannot run through
  PostgREST, so this one is a dashboard paste.

## 2026-09-10 - Stripe subscription safety net
- New webhook /api/stripe-webhook (Stripe endpoint we_1UEG2OHjlgfQ8kMfhEmc95q7,
  events customer.subscription.updated + .deleted, signature-verified via
  STRIPE_WEBHOOK_SECRET, Sensitive env on Vercel prod). Flags lapses
  (ended, past_due, unpaid, canceled, incomplete_expired, paused,
  cancellation scheduled) by emailing NOTIFICATION_EMAIL with the matched
  bar and a "tier NOT changed" banner. It never touches the tier: demotion
  stays a human decision.
- scripts/audit-featured-tiers.mjs: read-only reconciliation of
  featured/premium bars against Stripe subscriptions (normalized bar_name
  matching, pagination, exit 1 on mismatch). First run: clean, 2/2 matched.

## 2026-09-11 - Zig Zag merge completed (Seattle TOP 10 back to ten)
- The 2026-08-25 pre-standard merge deactivated zig-zag-cafe-seattle
  (tier top10) without moving the tier to the keeper, leaving Seattle's
  TOP 10 at nine. Standard repair applied: zig-zag-cafe re-tiered
  free -> top10 (keeper was richer on every other field, nothing else
  copied), 301 zig-zag-cafe-seattle -> zig-zag-cafe added, dup row
  hard-deleted after clean bar_claims/owner_submissions checks
  (full-row snapshot taken pre-delete). Seattle active top10 = 10.
- Sydney stays at nine pending Roman's tenth pick (The Hook closure);
  shortlist in claude/top10-audit.md session notes.
