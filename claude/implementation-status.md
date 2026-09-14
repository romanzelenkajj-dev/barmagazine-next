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

## 2026-09-14 - Bar edits now revalidate every card surface
- Reported gap: an admin edit already revalidated /bars, /bars-map, the
  city and country guides and the bar's own profile (not only the
  profile), but NOT the surfaces with the longest windows. Added:
  / (homepage top 10 band, 300s), /best-bars/[city] and
  /best-bars/[city]/[type] (3600s), /collections/[slug] (3600s),
  /api/bars/map (600s, carries names into map markers) and /api/bars.
  So a rename could read correct on the profile and stale in the city
  guides for an hour.
- Residual, documented in the helper: /api/bars is keyed by query string
  (filters, pagination), and revalidatePath cannot purge every variant,
  so a filtered or "load more" grid can still lag its 300s window.
- The reported "Stir" staleness had already aged out by the time it was
  checked: DB, profile, /bars, city page and /api/bars all agreed. The
  one surface still serving the old name mid-check was /api/bars/map,
  which is exactly the endpoint nothing revalidated.

## 2026-09-14 - Zuma London delisted (admission rule, NOT a closure)
- zuma-london set is_active=false because it fails the cocktail-led
  admission test, not because anything happened to the venue. It is open
  and trading. Its own page leads "authentic Japanese restaurant in
  Knightsbridge, London | izakaya dining", publishes no bar hours (only
  "bar is open for drinks all day"), names no bar lead, and runs roughly
  85-90% food. Same grounds as the Zuma Hong Kong rejection.
- Consequence: /bars/zuma-london now 404s. No redirect added, since a
  delisting has no successor row to point at (unlike a duplicate merge).
  Worth watching in GSC. London's TOP 10 is unaffected, zuma-london was
  never in it.
- zuma (Dubai, tier top10) deliberately UNTOUCHED, awaiting Roman's call:
  it fails the same test on self-description, but is the only one of the
  three to publish genuinely separate bar hours (Mon-Sun 12:00-02:00).
  Demoting it would drop Dubai's TOP 10 to nine and need a replacement.
- NOTE for future edits: two rows are named "Zuma", so an admin update by
  barName hits both. Use barId.

## 2026-09-14 - Ticuchi coordinates corrected
- ticuchi stored coordinates that reverse-geocoded to Oaxaca, 366km from
  its own address. Re-geocoded from "Petrarca 254, Polanco" against a
  Mexico City bbox to 19.433633, -99.185450, which reverse-geocodes to
  "Calle Francisco Petrarca 254" and sits 5km from the city centre. This
  was the single genuine outlier in the coordinate audit.

## 2026-09-14 - Name-quality: detector at the door, Bengaluru addresses
- NEW src/lib/bar-name.ts flagBarName(): detects a name carrying its own
  city ("Kura Stockholm") or a venue-type suffix ("... Cocktail Bar").
  DETECTION ONLY, never a rewrite: plenty of venues really are called
  "Wave Cocktail Bar", "Experimental Cocktail Club" or "Handshake
  Speakeasy", and some genuinely carry a city ("Harry's New York Bar"),
  so only the venue's own channels can settle it. Wired into the two
  paths where bars enter: /api/admin/submissions GET now returns a
  name_flag per row so the reviewer sees it BEFORE approving, and
  /api/admin/manage-bar logs a warning on insert. 10 unit tests.
- Bengaluru centroid cluster cut from 7 bars to 3. Addresses sourced from
  own channels and re-geocoded to street level: copitas (Four Seasons
  contact page), prost-brew-pub (own site), windmills-craftworks (own
  site, Whitefield being the original in their own words),
  the-permit-room (own Facebook About).
- Still on the fallback centroid, reported not guessed:
  * 1q1 - NO ADDRESS PUBLISHED on any own channel (site live but
    address-free, IG and FB both now unavailable).
  * byg-brewski-brewing-company - THREE Bengaluru outlets (Hennur,
    Sarjapur Road, Yeswanthpur), none labelled main by the venue.
  * bob-s-bar - SIX outlets, four with full addresses, none labelled
    main. Needs an editorial pick of which outlet the row represents.
- Caution flags from the research: the-permit-room's website is expired
  and its Instagram dormant, so its trading status wants checking before
  we lean on that row.

## 2026-09-14 - Zuma London restored
- Reactivated on Roman's instruction, reversing the admission-rule
  delisting earlier the same day. The row is unchanged otherwise (tier
  free, London). The earlier changelog entry stands as the record of why
  it was removed; this is the reversal, not a correction of the evidence.

## 2026-09-14 - Name audit pass one (16 city-suffix candidates)
- RENAMED, each against the venue's own site or Instagram (slugs
  deliberately unchanged, so no redirects needed):
  * "Alenka Cocktail bar Prague" -> "Alenka Cocktail Bar"
  * "Bar Mood Taipei" -> "Bar Mood"
  * "Blind Spot London" -> "Blind Spot"
  * "Bar Maaya | Toronto" -> "Bar Maaya"
  * "Elysian Bar Budapest" -> "Elysian Budapest" (the CITY is genuinely
    part of the name here; the spurious word was "Bar")
  * "Sky Bar Bratislava" -> "Sky Bar" (own IG display name is "Sky Bar &
    Restaurant"; whether to carry the restaurant half is Roman's call)
- KEPT, city verified as genuinely part of the name: tiki-bar-athens
  ("Tiki Bar Athens" on site and IG), posino-taipei, segreto-athens (IG
  handle @segretoathens also added), the-speakeasy-rooftop-bar-bangkok.
- HELD, own channels conflict or are unreachable: lost-and-found-bar-prague
  (site brands "Lost & Found Bar Prague", body copy says "Lost & Found";
  also stores "and" where the venue writes "&"), kura-stockholm (site
  "Kura Stockholm", IG "KURA"), ounce-taipei (Facebook "Ounce Taipei",
  IG "Ounce Cocktail Bar"), florattica-rooftop-london (site "FLORATTICA
  ROOFTOP", IG "Florattica Rooftop London"), art-katowice (domain dead,
  IG display name empty, Facebook age-gated).
- NOT a naming problem: abstrct-bar-jakarta. Its own Instagram bio reads
  "PERMANENTLY CLOSED." Needs deactivating as a closure; left untouched
  pending Roman.

## 2026-09-14 - Address-vs-city audit (the class distance cannot see)
- Method: flag rows whose address names neither their city (diacritics
  folded, local-name aliases handled) nor their country, then geocode the
  address TEXT ALONE and measure how far it lands from the stored city.
- THREE genuine mismatches, all the same shape: a multi-outpost brand
  whose fields were mixed between locations. Reported, not corrected,
  since either field could be the wrong one:
  * attaboy - city New York, address "8 Mcferrin Ave, Nashville TN",
    Instagram @attaboynashville. NOTE this row is tier top10, i.e. it is
    currently one of New York's ten.
  * employees-only - city New York, website employeesonlynyc.com, but
    address "112 Amoy Street, Singapore" and Instagram @employeesonlysg.
  * cobbler-crew - city Bengaluru, address "Kalyani Nagar, Pune".
- Ten further rows resolved far away but are geocoder artifacts, not data
  errors: the address is correct and simply omits its city, so Mapbox
  matched a same-named street elsewhere (Bar Basso's Via Plinio 39 to
  Taranto, Kinsman's Peel St to the Philippines, No Vacancy's Ossington
  Avenue to Ottawa, and so on). Listed in the session report.

## 2026-09-14 - Admission rule clarified (claude/admission-rule.md)
- Standing rule from Roman: the admission test is about venue TYPE
  (cocktail-led rooms, not nightclubs, wine bars or pure restaurants) and
  is NOT a quality bar. We do not remove or refuse bars for being
  insufficiently prestigious; awards are not a requirement. Removing an
  already-listed venue is a last resort, and a famous room readers search
  for stays listed with an honest description instead of being delisted.
  Recorded in claude/admission-rule.md.
- Acting on it, both reversals of earlier errors in this session:
  * zuma-london REACTIVATED. The earlier delisting applied the test as a
    quality filter; under the rule, "leads with dining and names no bar
    lead" is an argument about how to describe the venue, not grounds to
    remove it.
  * zuma-hong-kong INSERTED (LANDMARK Level 5 & 6, Queen's Road Central),
    having been refused under the same misreading.
- zuma (Dubai) now carries Roman's approved description in place of the
  composed fallback, verified live. Per his constraints it names no
  bartender, claims no sake or whisky list of any size, and keeps the
  rankings in the past tense.
- zuma-hong-kong description deliberately LEFT EMPTY: Roman is
  researching London and Hong Kong and will supply both, rather than
  having thin copy written from what we already hold. The composed
  fallback renders on that profile until his text arrives.
- Note for that work: zuma-london already has a real description (not the
  fallback), and it claims "more than 40 sakes". That is sourced from
  Zuma's own page, but it is the same class of sized-list claim Roman
  ruled out for Dubai, so it is worth a decision when he replaces it.
- Three rows are now named "Zuma" (zuma, zuma-london, zuma-hong-kong), so
  any admin update by barName hits all three. Use barId.

## 2026-09-14 - ABSTRCT Bar Jakarta deactivated (closure)
- abstrct-bar-jakarta set is_active=false as a CLOSURE, under the
  standing approval for closures. Evidence is the venue's own Instagram
  bio, a single line reading "PERMANENTLY CLOSED." The handle
  (@abstrct.bar, display name "Abstrct Bar SCBD") has been stored on the
  row so the evidence is traceable. Mild caveat: we held no channel for
  this bar before, so the identification rests on the name and the SCBD
  district matching our Jakarta record rather than on a link we already
  had. Reversible if that turns out to be a different venue.

## 2026-09-14 - Name audit dispositions (Roman)
- Pass one stands as applied. "Sky Bar" stays "Sky Bar": the fuller "Sky
  Bar & Restaurant" came from a single channel, and the venue type is
  captured separately in our own fields.
- The five conflicted names (lost-and-found-bar-prague, kura-stockholm,
  ounce-taipei, florattica-rooftop-london, art-katowice) stay HELD, to be
  settled opportunistically when those bars are next touched for
  enrichment or outreach rather than as a dedicated pass. art-katowice
  additionally needs a logged-in Facebook look, so it is parked.
- Pass two (63 type-suffix candidates) remains a report, unchanged.
- The ~200 addresses that omit their own city are deliberately LEFT
  ALONE. They display correctly because the city renders separately on
  the profile, so rewriting them would be churn with no reader benefit.

## 2026-09-14 - Outpost-contaminated rows split into real venues
- Three rows each held one venue's city with another outpost's details.
  All now internally consistent, and the siblings are listed separately
  the way Bar Leone Shanghai was.
- attaboy (New York, tier top10): address was the Nashville outpost's and
  Instagram was @attaboynashville. Corrected to 134 Eldridge St and
  @attaboy134 from the brand's own New York page. Its coordinates were
  already right, and in fact reverse-geocoded to 134 Eldridge Street,
  which is how the correct address was first confirmed.
- employees-only (New York): address was "112 Amoy Street, Singapore" and
  Instagram @employeesonlysg. Corrected to 510 Hudson St and
  @employeesonlyny. The PIN was wrong too, and instructively so: it had
  been geocoded off the Singapore address onto "112 Amboy Street,
  Brooklyn", a same-numbered near-homonym. Repointed to Hudson St.
- cobbler-crew: the CITY field was the wrong one, not the address. The
  venue's own Linktree, Facebook page name and LinkedIn all place it in
  Kalyani Nagar, PUNE, with no Bengaluru outlet anywhere on its own
  channels. Moved to Pune with matching coordinates, and given a
  description sourced from its own Instagram bio. Bengaluru drops to 11
  active bars; Pune becomes a new city.
- INSERTED as their own rows: attaboy-nashville (8 McFerrin Ave, own
  hours and email, @attaboynashville) and employees-only-singapore (112
  Amoy St, @employeesonlysg). Both confirmed still trading from their own
  channels.
- next.config.mjs: REMOVED the placeholder redirects for both new slugs.
  They sat in the "bars we haven't migrated yet" block sending traffic to
  /bars, and would have shadowed the real profiles. That both slugs were
  in that block at all is evidence readers were already searching for
  them. Added a note to the block to drop a line whenever its bar is
  actually listed.
- Three brands now have multiple rows sharing a name (Attaboy, Employees
  Only, Zuma), so admin updates by barName are unsafe for these. Use ids.

## 2026-09-14 - Zuma Hong Kong and London descriptions
- Both written BY ID, not by name: three rows are named "Zuma".
- zuma-hong-kong: was EMPTY (composed fallback rendering). Now carries
  Roman's approved copy on the LANDMARK levels five and six, the izakaya
  register, Burning History, the garden terrace and the DJ nights.
- zuma-london: replaced the previous description entirely. The old text's
  "more than 40 sakes" is deliberately gone, being the same class of
  sized-list claim ruled out for Dubai.
- YEAR DROPPED from the London copy, per Roman's instruction. He asked me
  to confirm the about-us page before writing "2002". Findings: the
  about-us page states NO founding year at all, but the LONDON page does,
  and it says "Zuma has been one of the city's standout dining
  destinations since opening in 2008" while the same page also says the
  restaurant has been renowned "for the last two decades". The venue's
  own site therefore contradicts itself and disagrees with Wikipedia's
  2002. The sentence now reads "opened on Raphael Street in Knightsbridge
  as the first room in what has become a global group", with no year.
- Verified live on both: composed fallback absent, new copy in the body
  and the meta description, profiles serving 200.

## 2026-09-14 - Redirect/live-bar diff, TOP 10 recheck, audit method test
- REDIRECT DIFF: every redirect source under /bars/ (20 rules: 15
  explicit, 5 in the merged-slug map) matched against the 1,234 active
  slugs. RESULT: NO shadowed profiles. attaboy-nashville and
  employees-only-singapore were the only two, and both were already
  removed. The 404-recovery block is otherwise clean.
- The reverse check found a different defect: three redirects RESOLVED
  but landed on 404s, because their destination slug is inactive or does
  not exist. Repointed:
  * /bars/bar-le-mal-ncessaire now goes to /bars/le-mal-necessaire, the
    live row for that Montreal venue (it had pointed at an inactive
    accent-stripped duplicate).
  * /bars/caf-pacifico and /bars/eau-de-vie-bar-melbourne now go to
    /bars, per the block's own stated convention, their targets being an
    inactive row and no row at all respectively.
- TOP 10 RECHECK: all 23 TOP 10 cities sit at exactly ten, so nothing
  regressed. Bengaluru is NOT a TOP 10 city and never was: it has no
  top10 rows at all (11 active bars, all free tier). Cobbler & Crew was
  free tier, so moving it to Pune could not have affected any TOP 10.
- ADDRESS AUDIT METHOD TEST: appending the row's own city and country to
  the geocode query cut hits from 26 to 17, but ALL 17 remain false
  positives, so precision is still zero and the method is NOT safe to run
  unattended. The change also introduced a new systematic artifact: 11 of
  the 17 are Hong Kong bars resolving to the identical wrong place
  ("Hongtong Xian, Linfen Shi, Shanxi"), because appending "Hong Kong"
  makes Mapbox match "Hong". Keep this as an assisted check that a human
  reads, not a cron. The signal that actually found all three real
  mismatches was a place name in the address text contradicting the city
  field, not a distance measurement.

## 2026-09-14 - Nashville and Pune insert waves (13 rows)
- DIFFED FIRST, per the rule: all 13 candidates checked against the bars
  table by name and slug before any write. All were genuine gaps; the
  only name hits were other cities (De Tiger Bar/Jakarta, The White
  Elephant/Miami). No slug collisions.
- NASHVILLE +7: the-fox-bar-cocktail-club, four-walls, the-patterson-house,
  old-glory, tiger-bar, bastion, pearl-diver. Nashville 1 -> 8.
- PUNE +6: elephant-and-co, soy-como-soy, juju, qora, malaka-spice,
  paasha. Pune 1 -> 7.
- ACCOLADES HELD, NOT WRITTEN, and this is the blocker to resolve: the
  tile system has exactly seven approved orgs (w50b, a50b, e50b, na50b,
  totc, bca, jbf) and isRenderable() drops everything else on purpose,
  because "there is no approved wording for it". 30 BEST BARS INDIA,
  Food & Wine, Eater and Esquire all have NO tile, so storing them would
  put invisible rows in the database. Affects Elephant & Co., Soy Como
  Soy, Malaka Spice, Paasha, Cobbler & Crew and most of the Nashville
  set. Needs approved tile wording (region line, main line, colour tier)
  for 30 Best Bars India, plus a decision on whether magazine lists are
  accolades in our sense at all. Cobbler & Crew's accolade update is
  held for the same reason.
- Cobbler & Crew's "#2 in 2023" anomaly RESOLVED and is not an error: it
  placed #2 overall in 2023 AND won Highest New Entry, which is what the
  highest-placed debutant wins. Both are real.
- Research findings worth keeping:
  * Four Walls: its own site says "405 4th avenue south, TN 37201" while
    The Joseph says "401 Korean Veterans Blvd, Floor 2, TN 37203".
    Stored the hotel's version as supplied; the conflict is UNRESOLVED.
    thejosephnashville.com also has an EXPIRED TLS certificate, which is
    why automated reading failed.
  * The Patterson House: visible copy is correctly moved, but the dead
    1711 Division Street address is STILL in the site's JSON-LD, site
    config and map coordinates, so aggregators keep broadcasting it. Our
    row stores only the new address. Note 718 Division Street is the
    current valet and is NOT the stale one.
  * Old Glory and The Fox both publish hours on demonstrably stale pages
    (Super Bowl promo seven months old and an Instagram feed frozen since
    April; "Summer Hours" with no date range in September). Hours stored
    as published, but worth a phone check.
  * Tiger Bar publishes NO social links at all, and @tigerbarnashville
    does not exist on Instagram. Instagram left empty, confirmed twice.
  * Pearl Diver's "award-winning" is unsubstantiated in visible copy. Not
    repeated anywhere in our description.
  * Soy Como Soy is KOREGAON PARK, settled on the operator's own site.
  * Juju's handle confirmed (@juju.bar.pune) and its bio publishes hours.
- No neighbourhood stored for The Patterson House: the bars table has no
  neighborhood column, so "Midtown" went into the description instead.

## 2026-09-14 - Address check rebuilt on names; redirect chains validated
- NEW scripts/address-city-check.mjs replaces the distance-based audit,
  which is retired. It matches PLACE NAMES from the address text against
  a GeoNames cities5000 gazetteer (~70k places, alternate names inline),
  rather than measuring how far a geocode lands from the city.
  Gazetteer is cached in .cache/ (gitignored, re-downloads on demand).
  Rules that matter, each earned from a false positive:
  * comma SEGMENTS are matched whole, so "Calle Rio de Janeiro 56" is not
    the city Rio de Janeiro and "Victoria Dockside" is not Victoria;
  * a row whose address names its OWN city is skipped outright;
  * alternate names resolve the row's own city (Bangalore/Bengaluru) but
    are NOT used to match candidates, being full of transliterations that
    collide with street words;
  * street and district markers drop "Chengde Rd" and "Xinyi District",
    and the marker test runs BEFORE the trailing-token strip, or "chuo ku"
    would become "chuo" and read as a city;
  * a name followed by a SHORT number is a street ("Turin 52"), while five
    digits or more is a postcode ("Singapore 069932");
  * if any place of that name sits near the row's own city, that local
    reading wins, which is what separates Mexico City's Cuauhtemoc borough
    from the city in Chihuahua.
- --validate re-injects the three known mismatches IN MEMORY and fails if
  any is missed. It caught two real regressions while the rules were being
  tuned, including one where the street-line rule skipped the first
  SURVIVING segment, which is usually the city.
- RESULT: 2 flags across 1,211 addresses, both explainable (a Ho Chi Minh
  City street named after a Hanoi district, and Osaka's Kita ward). Under
  the 30 threshold, so it is worth scheduling.
- NEW check in scripts/seo-check.mjs: bar-redirect-chains. For every
  /bars/* redirect rule (47 at runtime, not the 20 a regex suggested) it
  follows the chain hop by hop and asserts a 200, catching loops and
  multi-hop dead ends. This closes a real gap: checkRedirectDestinations
  deliberately SKIPS /bars/* destinations, which is why the three rules
  found by hand today were never flagged.
- It immediately found 11 MORE: accent-stripped /bars/city/* rules
  pointing at city pages for cities we do not list, so they 308'd and then
  404'd. All repointed to /bars, with a note to restore the original
  target if we ever list bars in those cities.
- Also corrected: the earlier "no shadowed profiles" diff used a regex and
  saw only 20 of the 47 rules. Re-run against nextConfig.redirects() at
  runtime, the conclusion holds: 0 shadowed profiles.

## 2026-09-14 - 30 Best Bars India approved as an accolade org (30bbi)
- NEW tile: org_key 30bbi, org name exactly "30 Best Bars India", region
  line INDIA, main line "30 BEST". Ranked placings and named category wins
  both render; a nominee renders outlined. Bartender awards are NOT stored
  on bar rows, per Roman.
- TIER: there was NO free existing key. Every tier below `dark` is already
  an organisation's signature colour (orange = Spirited, grey = BCA,
  burgundy = James Beard), so borrowing one would visually merge 30BBI
  with that body. Added a new pair, `navy` / `navy-outline` (#1F3A5F),
  which reads one step below the near-black continental tiles and stays
  heavier than the bca grey. Recolour in one line if Roman prefers.
- MAIN LINE: Roman asked for a rank-carrying line ("No. 19 in 2025") on
  the pattern of an existing national tile. There is no such tile: no tile
  in the system carries a rank, TileDef says the bold line is "constant
  within each award family; never vary it", and TileView says "Rank stays
  entirely unexposed, as ever". Implemented as "INDIA / 30 BEST / 2025",
  mirroring "ASIA'S / 50 BEST / 2025", with rank on hover like every other
  org. Flagged for Roman: changing it would mean revisiting that invariant
  across all seven existing orgs, not just adding one tile.
- RULE RECORDED in src/lib/accolades.ts beside the exact-naming rule:
  magazine and editorial lists are NOT accolades and never get an org key
  or a tile (Food & Wine, Eater, Esquire, Time Out, Thrillist,
  Architectural Digest, Bon Appetit and their kind). Notable mentions
  belong in description prose with publication and year attributed. Four
  unit tests cover the new tile and the editorial exclusion.
- BACKFILLED: cobbler-crew (8 entries: ranked #2/2023, #7/2024, #19/2025,
  listed 2022, plus Highest New Entry 2023, Best Bar Team 2023 and Best
  Work in Sustainability 2022 and 2023), elephant-and-co (6: #22/2022,
  #47/2023 and four People's Choice wins), soy-como-soy (2),
  malaka-spice (2), paasha (#25/2021). the-fox-bar-cocktail-club got its
  Tales of the Cocktail 2023 entry under the existing totc key, as a
  nominee since a regional top ten is a shortlist.
- SOURCING CAVEAT: 30bestbarsindia.in is UNREACHABLE from this environment
  (connection failure, not a 404), so the cited source URL could not be
  opened to verify page by page. Rank values are Roman's supplied record,
  corroborated by press coverage of the awards.

## 2026-09-14 - Three flag follow-ups
- MALAKA SPICE: stays, on the admission rule, but RECORDED AS A MARGINAL
  ADMISSION rather than a clean one. Its own Instagram bio is purely
  culinary ("29 years of inspired South East Asian cuisine") with no
  mention of a bar or cocktails, which is the pattern that failed Osteria
  Gia. It is admitted because 30 Best Bars India ranks it as a bar. Outlet
  ambiguity resolved the BYG Brewski way: the row now defaults to the
  KOREGAON PARK original, stated in the description, with coordinates
  moved there. If the type test is ever revisited, this is the row to find.
- PATTERSON HOUSE: row left as is, it is correct. Logged as an OUTREACH
  OPENING rather than a defect: their own site still broadcasts the dead
  1711 Division Street address through its JSON-LD, its Squarespace site
  config and its stored map coordinates, despite the visible copy being
  correctly updated and the site being edited on 2026-08-20. Aggregators
  read that structured data, so they are still publishing an address they
  moved away from in 2025. Worth an email.
- FOUR WALLS: NOT switched, and the gate Roman set is the reason. He asked
  me to confirm against the bar's own Instagram bio before changing the
  address to 405 4th Avenue South. The bio (@fourwallsnash) publishes NO
  address at all: it reads "now pouring vol. 5 / a spaghetti western in
  cocktails | 50 best discovery" and links only to a 50 Best Discovery
  page. So the bio neither agrees nor disagrees, the condition is unmet,
  and the row still holds the hotel's 401 Korean Veterans Blvd. Awaiting
  Roman's word to switch on the venue-site evidence alone.

## 2026-09-14 - Address check allowlisted and scheduled; runtime-config rule
- ALLOWLIST in address-city-check.mjs for the two reviewed flags, dot-bar
  (a Ho Chi Minh City street named after the Trung Sisters, also a Hanoi
  district) and canes-tales (Osaka's Kita ward). Each entry records its
  reason inline and is BOUND TO THE EXACT ADDRESS it was approved against:
  if the address changes, the row is reported as "STALE ALLOWLIST" with
  the approved-for value and the reason, rather than staying silent.
  Verified by simulating an address change. A clean run is now 0 flags.
- SCHEDULED: npm run audit:addresses (and :validate). Weekly via launchd
  com.barmagazine.address-audit, Mondays 09:00, logging to
  outreach/address-audit.log; installed and test-fired clean. PLUS a
  standing procedure to run it after every insert wave, which is when
  addresses actually enter the table. Documented in claude/data-checks.md.
- RUNTIME-CONFIG RULE written where it will be read: at the TOP of
  next.config.mjs itself (the file someone would be tempted to regex) and
  in claude/data-checks.md. Anything inspecting the config must evaluate
  nextConfig.redirects(), never parse text, because the rules are composed
  with an imported generated JSON and do not exist as literal text.
- AUDIT RESULT: every in-repo consumer already evaluated the config
  correctly (seo-check.mjs, redirect-chain.test.ts, headers-config.test.ts).
  The only text-parser was a throwaway script. Nothing to convert there.
- But the same principle caught a real one: generate-bar-redirects.mjs
  carried a HAND-TRANSCRIBED list of root-level redirects that had to be
  kept in step with the config by hand. Now derived from redirects().
- THAT CHANGE INTRODUCED AND THEN FIXED A SERIOUS BUG, worth recording:
  next.config.mjs composes the generator's own previous output, so the
  derived list counted the last run as pre-existing config and the second
  consecutive run emitted 0 redirects and skipped 1000. It would have
  silently wiped 990 live redirects on the next deploy. Fixed by
  subtracting our own output (keyed on `from`, the shape the JSON uses),
  proven stable across four consecutive runs, and guarded by
  assertNotCollapsed(), which refuses to write a zero-redirect payload
  while the directory holds bars.
