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

## 2026-09-11 - Sydney TOP 10 back to ten (The Baxter Inn)
- Roman's pick for the tenth slot after The Hook's closure. the-baxter-inn
  re-tiered free -> top10 (guarded). Accolades backfilled from the official
  W50B previous-list archive, all six ranked years verified: 2012 No. 7,
  2013 No. 8, 2014 No. 7, 2015 No. 6, 2016 No. 12, 2017 No. 45. The "Best
  Bar in Australasia 2014" title was NOT confirmable on official pages
  (the archive carries no regional-award markers) and stays out per the
  verify-or-omit rule; supporting context: Baxter was the highest-ranked
  Australasian bar on the verified 2014 list.
- Sanity check passed: cantina-ok was already in the ten; its W50B 2024
  No. 96 (extended list) placement was missing from accolades and is now
  added, sourced to the official previous-list/2024 archive page.

## 2026-09-11 - Country-aware hours display wired
- formatHoursForCountry() now renders opening_hours on the bar profile
  (detail row + Plan Your Visit) and both /best-bars pages: 24-hour for
  most of the world, am/pm for the 12-hour set (US, UK, Ireland, Canada,
  Australia, New Zealand, Philippines, India - UK/Ireland approved).
  Storage untouched; irregular strings render as stored; JSON-LD left
  raw (machine format, not display copy). Convention documented in
  claude/hours-format.md. One data fix: backdoor-43 "18h30 - 2h30"
  hand-normalized to "18:30-02:30" (same meaning, house shape).

## 2026-09-11 - aapex (Seoul) held, unverified current operation
- NOT a closure. Inserted earlier today (Roman editorial addition), then
  set is_active=false the same day: venue opened April 2026, all
  traceable activity stops May 2026 and the Instagram is gone, so it is
  held pending confirmation it currently trades. Full row (description,
  hours, address, geocode) stays intact for one-line reactivation:
  set is_active=true on slug aapex (id 9eb05cf7) once confirmed open.

## 2026-09-11 - aapex (Seoul) reactivated (held-then-confirmed, new handle)
- Resolves the hold above: Roman confirmed the venue is open, so
  is_active=true on slug aapex (id 9eb05cf7). The mystery of the vanished
  Instagram is solved: the account was RENAMED, not deleted -
  aapex_bar -> aapex_lab (live profile: "'Edible Scents' Distilled
  Spirits Lab / Cultural Space Center", bio email aapex.seoul@gmail.com,
  which is why the old handle 404'd). instagram set to aapex_lab and the
  rendered profile link verified to resolve to instagram.com/aapex_lab.
  Update went through /api/admin/manage-bar, so profile + Seoul city
  page revalidated; both confirmed live (bar listed, new IG link).

## 2026-09-14 - Self-transfer claims auto-expire
- The Society (Tokyo): one claimant submitted the claim form twice seven
  minutes apart; the first completed and made him owner, the second was
  classified a transfer because the bar was by then owned - by him. Row
  expired by hand (status expired, evidence.expired_reason
  claimant_already_owner); no approval, no owner change, no email, and
  the review queue is empty.
- Second occurrence, so the hourly sweep now closes this class itself:
  a THIRD dead-row rule in /api/cron/stuck-claims expires pending_review
  transfers whose claimant address exactly equals the current owner's.
  Decision logic is isRedundantSelfTransfer() in src/lib/claim-routes.ts
  (pure + unit tested). Exact address match only, deliberately not a
  domain match, so a colleague on the company domain is still a genuine
  transfer request and stays in the queue for a human.

## 2026-09-14 - Negroni Week Asia additions (3 inserted, 5 not)
- INSERTED, own-site sourced: drinking-and-healing (Ho Chi Minh City;
  hours 17:00-02:00 per the venue's own booking site, which overrides the
  6:30pm in the press release; no email published), pony-and-plume
  (Macau, Level 1 Capella at Galaxy Macau, Cocktail Bar + Hotel Bar /
  Whiskey Bar subtypes; Sunday hours are not published by the venue),
  bar-leone-shanghai (Bar Leone's own site confirms it operates two
  locations, Hong Kong from June 2023 and Shanghai from November 2025).
- NOT inserted: Osteria Gia (own site is a food-led Italian restaurant
  group, 8 outlets); Lai La / Laila HCMC (self-tagged modern cocktail
  CLUB, DJ from 9pm - the la-siesta-budapest precedent); Odyssey Chengdu
  (unverifiable, not disproven: mainland venues often live only on
  WeChat, so absence from Western search is weak evidence); Zuma Hong
  Kong (rejected on re-check, see below); Ne Cocktail Bar (held pending
  Izzy - the release says Ho Chi Minh City but the venue's own posts say
  3B Tong Duy Tan, Hoan Kiem, HANOI).
- Zuma Hong Kong rejected: own page leads "contemporary Japanese dining
  experience", publishes only restaurant service hours with no separate
  bar hours, names no bar lead, and is roughly 80% food. Restaurant-first
  by its own description (the Chilte case). NOTE it does publish five
  named seasonal cocktails, so "no bar menu" is not quite right, but the
  decisive facts hold. CONSISTENCY GAP: zuma (Dubai, tier top10) and
  zuma-london are already listed and would fail the same test. Dubai
  demotion would drop that city's TOP 10 to nine.
- HATS Bar: name capitalization corrected from "Hats Bar". The venue's
  own Instagram and Linktree both use HATS with no apostrophe; the 50
  Best list and the Campari release both write "Hat's Bar" and are wrong.
- Geocoding note: Mapbox cannot resolve either new Asian address. The
  HCMC insert first landed 61km outside the city and was corrected to a
  street-level fix on Ho Tung Mau, Ben Nghe (10.771509, 106.704100).
  bar-leone-shanghai sits on a Huangpu district centroid, roughly 2km
  from Sinan Mansions, for want of a sourceable street-level result.

## 2026-09-14 - Milli inserted; geocode tolerance tightened
- milli (Singapore) inserted per Roman: Cocktail Bar + Restaurant Bar
  subtype, National Gallery rooftop, email published, own name styling
  "Milli" not "Milli's". Instagram left empty: the venue runs two handles
  (milli.sky.sg level 6, milli.lounge.sg level 5) and neither is clearly
  primary. Two published phone numbers, unlabelled, also left out.
- geocode.ts validation rewritten: great-circle distanceKm() replaces a
  Pythagoras-on-degrees comparison, and the tolerance drops from 1.8
  degrees (~200km, wider than most metro areas) to MAX_CITY_DISTANCE_KM
  = 40. Threshold picked from an audit of all 1,162 active bars with
  coordinates: the furthest DEFENSIBLE outliers are ~31km (Ubud against
  the Bali centre, Dona Paula against Goa, Dubai Marina against Dubai).
  Exceeding it is not fatal, the caller still falls back to city centre.
- Audit result, reported not corrected: exactly ONE row is genuinely
  wrong. ticuchi (Mexico City) stores coordinates that reverse-geocode to
  Oaxaca, 366km away, while its address is Polanco. Nothing else exceeds
  31km. Separately worth a look: seven Bengaluru bars share one
  city-centre coordinate (no addresses on file), so they stack on the map.
