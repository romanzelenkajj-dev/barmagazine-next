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
  * ADDED LATER THE SAME DAY, same defect class, NOT our row: Shaker
    Awards' own nominee list labels Kanché as "Mérida" while Shaker's own
    venue page for it is titled "Kanché Izamal", 70 km away. An awards
    body's nominee list contradicting its own venue page on city is
    exactly the address-vs-city defect, sitting in award data rather than
    ours. Consequence: award data needs the address check too, not just
    our own rows; any accolade import must run the city of the award
    entry against the venue's address before it is trusted. Shaker's 2025
    Top 30 page also mis-links two entries (Bronson carries @bekeb_sma,
    BEKEB carries @vinithebar), so handle-level identity from an awards
    page needs the same scepticism.
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

## 2026-09-14 - All 30BBI entries held as unverified
- Two automated reads of the same 30 Best Bars India page returned year
  sets a FULL YEAR APART. The record backfilled earlier reads #2/2023,
  #7/2024, #19/2025 for Cobbler & Crew; a later read of the same page
  reads #2/2022, #7/2023, #19/2024, plus a 2025 listing with no rank.
  Neither read is trusted, and the entries have NOT been "corrected" to
  the second one: the point is that the source has not been read reliably,
  not that one reading beat the other.
- NEW SCHEMA FIELD: Accolade.unverified. isRenderable() drops any entry
  carrying it, so the data and its citation are preserved while nothing is
  drawn. A wrong year on a tile is worse than an absent tile, because the
  tile's entire claim is that a named body ranked this bar in a stated
  year. Three unit tests cover it, including that a held entry does not
  suppress its neighbours.
- HELD: 19 entries across cobbler-crew (8), elephant-and-co (6),
  soy-como-soy (2), malaka-spice (2), paasha (1). Every 30BBI entry we
  hold, since all came from the same source read the same way. The Fox's
  Tales of the Cocktail entry is a different source and STANDS.
- TO CLEAR: Roman opens 30bestbarsindia.in/bar/cobbler-crew/ and
  /bar/elephant-co/ in his own browser, reads the years off the page, and
  we drop the flag on what matches. The domain is unreachable from this
  environment, which is why no third automated read is worth attempting.

## 2026-09-14 - Four Walls address: settled, no change
- Roman's gate was: check a venue-controlled booking page and switch only
  if it agrees with the venue's own site. There is no Tock page; the venue
  books through OPENTABLE, which is the same kind of venue-entered
  listing. It shows "401 Korean Veterans Blvd, Nashville, TN 37203",
  agreeing with THE HOTEL, not with the bar site's "405 4th avenue south".
- So the row is correct as stored and no change was made. The description
  saying the bar is inside The Joseph is also correct: OpenTable's own
  copy reads "Tucked away within The Joseph Nashville". No relocation.
- The bar's own site remains the outlier. Worth knowing it also carries a
  stale menu PDF and a hidden display:none hours block, so its address may
  simply be another neglected corner of that page.

## 2026-09-14 - City pages say the state, not the country
- "Nashville, United States" is not how anyone writes or searches it. NEW
  src/lib/city-location.ts: US and Canadian cities render the spelled-out
  state or province ("Nashville, Tennessee"), everywhere else keeps City,
  Country because that is what genuinely disambiguates Cordoba and
  Valencia. Neither "United States" nor "Canada" is ever the qualifier.
  Unresolvable rows fall back to the BARE CITY, never the country. 13
  unit tests.
- No state column exists (the `region` column is our 7 continental
  regions), so the subdivision is derived from addresses and ANCHORED TO
  THE POSTCODE. A bare two-letter search read "99 Krog Street NE,
  Atlanta" as Nebraska and did the same to Albuquerque; the anchor fixed
  both. A majority vote across a city's bars keeps a single spilled
  address (Brookline against Boston, Surfside against Miami) from
  renaming the city.
- Resolution on live data: 26 of 28 US/CA cities resolve. Detroit and
  Victoria have no postcode in any stored address and fall back to the
  bare city name, which is the specified behaviour.
- Washington DC renders as "Washington DC", not "Washington DC, District
  of Columbia": the label skips a qualifier the city name already carries.
- Applied at every site the pattern appears, via grep rather than the one
  reported line: the city page meta description, its JSON-LD description
  and its intro sentence, plus composeCityDescription and
  composeTypeDescription in seo-cities.ts, which the /best-bars pages
  share. Left alone deliberately: schema.org addressCountry (a
  machine-readable country field, correct as the country) and the
  breadcrumb trail, which renders Country and City as separate navigation
  links rather than as a "City, Country" label.
- COUNT DROPPED from the intro: "Explore the 8 best bars in Nashville"
  implied a curated top eight when eight was simply every bar we list. Now
  "Explore the best bars in Nashville, Tennessee, handpicked by the
  BarMagazine editorial team", which stays honest at any size and removes
  a number that goes stale between revalidations.

## 2026-09-14 - Counts out of meta descriptions
- Dropped the bar count from the city-page meta description and from
  composeCityDescription and composeTypeDescription in seo-cities.ts,
  matching the intro sentence. Reason recorded in the code is CACHING, not
  grammar: Google holds a meta description for weeks while these pages
  revalidate every 300 to 3600 seconds, so a number there is stale more
  often than accurate, and a cached "the 8 best" against a page now showing
  twelve is worse than no number. "The 1 best cocktail bars in Detroit" was
  the visible symptom.
- Also removed the Top 10 count from the second composeCityDescription
  branch, which was the last pluralization branch in that copy
  ("pick${... === 1 ? '' : 's'}"). Counts remain in ON-PAGE copy, which
  regenerates with the data and is read at the moment it renders.
- While there, branches one and two of composeCityDescription now use the
  city LABEL rather than the bare city, so a US city reads "Nashville,
  Tennessee" consistently across all three branches.
- CONFIRMED UNCHANGED, both Roman's call: schema.org addressCountry stays
  the country, and the breadcrumb trail stays two navigation links.
- claude/data-checks.md gained the derivation rule: deriving a field from
  free-text addresses needs an ANCHOR (the postcode), because a bare
  two-letter match reads "Krog Street NE" as Nebraska, plus a MAJORITY VOTE
  across a city's rows so one spilled address cannot rename the city.

## 2026-09-14 - Accolade-org test refined; supply counts; Shaker Awards count
- RULING TWO REFINED (Roman): the accolade test is about PROCESS, not
  publisher. "Published by a media company" cannot be the exclusion,
  because The World's 50 Best Bars is published by William Reed, a trade
  media company. An org qualifies with all four of: a named jury or voting
  body; a published methodology; an annual cycle; results issued as a
  ranked or awarded list tied to a year. PASS: Mixology Bar Awards, Top
  Cocktail Bars Spain (Neodrinks), EXAME Casual 100 Melhores Bares, Shaker
  Awards, alongside the 50 Best lists, Spirited, BCA, JBF and 30BBI. FAIL:
  Eater, Food & Wine, Esquire, Time Out, Thrillist and editorial lists of
  that kind. Written into the TILES comment in src/lib/accolades.ts, the
  test comment in accolades.test.ts, and a new section of
  claude/accolades-badges-spec.md, with the example bodies on BOTH sides so
  it is not re-argued from scratch.
- SUPPLY COUNTS, ten accent-stripped city URLs, verified against the
  awarding bodies' own pages (50 Best Discovery machine-checked over the
  full sitemap; Shaker, TCB, EXAME, Bar and Drinks list pages read
  directly): Querétaro 3, Asunción 3, Málaga 2, València 2, Brasília 2,
  Córdoba (Spain) 1, Cancún 1, Mérida 1, Córdoba (Argentina) 0,
  Düsseldorf 0, Curaçao 0. Threshold for a wave is four. NO WAVE FOR ANY.
  An interim report had credited six Mexican bars with a "Shaker Top 100
  2025" listing; there is no 2025 Top 100 (2025 published a Top 30, the
  Top 100 begins with 2026) and none of the six exists on Shaker's site.
  Corrected before any decision rested on it.
- PARKED with a date: Querétaro, revisit after 2026-11-24 when Shaker's
  Top 100 2026 finishes publishing at the gala (currently about half out;
  the city sits one entry short). Everything else parked with no date.
  Recorded in claude/data-checks.md under "Expansion candidates: parked".
- SHAKER AWARDS TILE DECISION INPUT. Matched Shaker's Top 30 lists for
  2023, 2024 and 2025 (30 entries each, read from shakerawards.com) to our
  35 active Mexican rows by IDENTITY, never by name: the Instagram handle
  Shaker links from each entry against our instagram field, or the website
  domain where Shaker links a site instead. 13 rows match on identity and
  would carry a Shaker accolade today: bar-mauro, bijou-drinkery-room,
  cafe-arixi, form-matter, handshake-speakeasy, hanky-panky,
  kaito-del-valle, licoreria-limantour, mecenas, rayo, sabina-sabe,
  selva-oaxaca-cocktail-bar, tlecan (27 entries between them, e.g.
  Handshake 1/1/3, Tlecān 20/2/2, Bijou 5/5/4). The 2023 page carries no
  links, so 2023 identity is Shaker's 2024/25 handle carried across by
  Shaker's own entry name; marked as such per entry. Nine further rows
  match on name only and were NOT counted (arca, aruba-day-drink,
  baltra-bar, bekeb, brujas, cafe-de-nadie, casa-prunes, el-gallo-altanero,
  zapote-bar-playa-del-carmen), each because our stored handle differs
  from Shaker's or we store none. 36 Shaker entries have no row at all.
  Result exceeds the dozen Roman set as the build threshold. Match output:
  scratch shaker-match.json (session scratchpad, not committed).
- Shaker data defects found on the way, logged beside cobbler-crew above:
  Kanché "Mérida" vs its own venue page "Kanché Izamal"; the 2025 Top 30
  page mis-links Bronson and BEKEB's Instagram handles. Award data gets
  the address check too.
- tsc reports three pre-existing TS2722 errors in
  src/lib/redirect-chain.test.ts (untouched by this change; the production
  build does not type-check test files). Noted, not fixed here.

## 2026-09-14 - Shaker Awards tile built and backfilled; Cobbler & Crew unheld
- TILE: org_key `shaker`, org "Shaker Awards" exactly as the body writes
  it. Region line MÉXICO with the accent the body uses. Main line SHAKER,
  the body's own name, NOT "TOP 30": the bold line must stay constant
  within a family and from 2026 Shaker also issues an unranked Top 100, so
  a list name on the tile would be a false claim for those entries.
  "SHAKER AWARDS" is 13 characters against JAMES BEARD's 11, already the
  widest line that fits 74px. Navy, the same national tier as 30bbi: one
  colour per national body would not scale past three countries, the
  region line does the differentiating, and a bar never carries both
  national tiles so the two are never side by side on one row. Top 30
  placings are `ranked` with rank on the entry; Top 100 listings are
  `listed`. Four unit tests added (45 pass).
- NOT CHANGED, flagged for Roman: no org exposes rank on hover. The tile
  title attribute is org, year, `title` and source; ranked entries in every
  org (50 Best included) carry `title` null, so rank never appears in the
  hover text, matching TileView's "rank stays entirely unexposed"
  invariant. Shaker follows the same convention. If rank on hover is
  wanted, it is a one-line change in AccoladeBadges.tsx for every org at
  once, not a per-org exception.
- SCORING: same national calibration as the 30bbi backfill (recovered from
  the session transcript, since the changelog had not recorded it):
  ranked = 600 - 3 x rank - 12 x (2026 - year); listed = 520 - 12 x
  (2026 - year). Handshake #1/2024 scores 573, below its na50b #12/2026
  (856) and w50b #2/2025 (1124), so the national tile never displaces a
  50 Best tile on the same row.
- CITATION: source is the year's own list page
  (shakerawards.com/top-30/topYYYY/). New audit-only `basis` field on the
  Accolade type, never rendered: every 2023 entry says the 2023 page
  carries no links and identity is Shaker's own 2024/2025 handle for the
  same entry name, carried across Shaker's own pages.
- BACKFILLED 49 entries on 20 rows via the admin API (revalidates), merged
  into existing accolades and re-sorted by score. The 13 identity-matched
  rows (27 entries): handshake-speakeasy 1/1/3, licoreria-limantour
  2/15/9, hanky-panky 3/8/22, bijou-drinkery-room 5/5/4, kaito-del-valle
  8/7/5, tlecan 20/2/2, selva-oaxaca-cocktail-bar 22/9/16, sabina-sabe
  7/24, rayo 13/28, bar-mauro 1 (2025), form-matter 10, cafe-arixi 24,
  mecenas 25 (ranks for 2023/2024/2025).
- THE NINE NAME-ONLY ROWS, each pair opened on Instagram (public profiles;
  Roman's Chrome is not signed in to Instagram, which mattered once):
  * CONFIRMED and backfilled, 7 rows, 22 entries. Handle corrected by id
    where ours was dead or missing, to the one the venue actually uses:
    aruba-day-drink -> @arubadaydrinkbar (bio: No.51 NA50B 2026 = our
    row); baltra-bar @baltra.bar dead -> @baltrabar (bio: No.78 W50B
    2025 = our row); bekeb -> @bekeb_sma (bio: No.24 NA50B '26 at
    @liveaquasanmiguel; Shaker's own venue page gives Calzada de la Presa
    85 = our address); cafe-de-nadie @cafedenadie_cdmx dead ->
    @cafe.denadie (bio: chihuahua 135, cdmx = our address);
    el-gallo-altanero -> @elgalloaltanero (bio names the venue);
    zapote-bar-playa-del-carmen -> @zapotebar (bio: No.95 NA50B, bar at
    @rwmayakoba; our own Rosewood website field links the same handle).
    arca keeps @arcatulum (bio: No.77 W50B 2025 = our row; Shaker's own
    venue page: Carretera Tulum-Boca Paila km 7.6 = our address).
  * HANDLE FIXED, NO ACCOLADE: brujas. Our @brujasroma is dead; the
    venue's own site lasbrujas.mx links @brujasmex, whose bio (No.45
    NA50B '24, No.64 W50B '22) confirms it is the Roma Norte bar, so the
    handle is corrected. But Shaker's Brujas entry links @brujasmx, a
    94-follower stub, so the chain from Shaker's entry to this venue
    could not be closed on the venue's own profile. Not counted.
  * LEFT ALONE: casa-prunes. Our @casaprunesbar is dead; Shaker's
    @casaprunes is age-restricted and needs a signed-in session to read.
    Nothing confirmable without logging in. Roman can close it in one
    look: if @casaprunes's bio gives Chihuahua 78, Roma Norte, the handle
    and three placings (16/2023, 10/2024, 30/2025) follow.
- THIRD SHAKER DATA DEFECT, logged in data-checks.md beside Kanché and
  the Bronson/BEKEB swap: on all three years' pages the ARCA entry links
  @arca_bar, a beach bar in Vama Veche, Romania. Handle identity from an
  awards page gets the same scepticism as its city field; a handle counts
  only once its own profile agrees with the entry.
- COBBLER & CREW: Roman read 30bestbarsindia.in/bar/cobbler-crew/ in his
  browser: 2022 listed unranked, 2 in 2023, 7 in 2024, 19 in 2025, which
  is exactly the first-pass read. The `unverified` flag is cleared on all
  eight entries via the admin API. The other eleven 30bbi entries
  (elephant-and-co 6, soy-como-soy, malaka-spice, paasha) stay held until
  Roman reads one more page; if Elephant & Co matches, all eleven are
  restored on the same one-line basis.
- HOUSEKEEPING: the TS2722 errors in redirect-chain.test.ts and
  headers-config.test.ts fixed with a loadRedirects()/loadHeaders() helper
  that throws if next.config.mjs ever loses the function, rather than a
  non-null assertion that would let an empty list pass. scripts/
  geocode-report.json and geocode-updates.sql are run records that someone
  applies by hand (the SQL) and reads (the report); the modified pair is
  the 2026-08-27 run (105 targets, 13 resolved, 92 skipped), committed as
  such rather than left in the tree.

## 2026-09-14 - 30BBI fully unheld; Shaker backfill closed at 21 rows
- Roman read 30bestbarsindia.in/bar/elephant-co/: 2021 listed, 22 in 2022,
  47 in 2023, 2025 listed, matching the stored entries exactly. First-pass
  read now confirmed on two of five pages; the remaining eleven flags
  cleared via the admin API (elephant-and-co 6, soy-como-soy 2,
  malaka-spice 2, paasha 1). NOTHING in the table carries `unverified`.
- casa-prunes: Roman opened @casaprunes signed in and confirmed the Roma
  Norte bar (bio "Cocktail Bar / Casa Prunes", grid shows the house; no
  street address in the bio). Handle corrected from the dead
  @casaprunesbar to @casaprunes by id; Shaker 16/2023, 10/2024, 30/2025
  added with `basis` recording Roman's confirmation of the profile rather
  than an address match.
- FINAL COUNTS: 30bbi 19 entries on 5 rows; shaker 52 entries on 21 rows.
  brujas stays the one open Shaker row (handle corrected, no accolade:
  Shaker's own link is a stub, chain of custody not closed).

## 2026-09-14 - Profile indexing diagnosis (report only, nothing fixed)
- Method: every active profile fetched (1,247), rendered word count from
  the stripped HTML; inbound links counted from a crawl of all 1,755
  sitemap URLs plus the 247 profiles the sitemap omits; row fields from
  the table; not-indexed list (425 profile URLs) and the 867 profiles with
  impressions pulled from Search Console in the browser.
- STRUCTURAL FINDING, unrelated to row content: sitemap-bars.xml lists
  exactly 1,000 profiles against 1,247 active. src/app/api/sitemap-bars/
  route.ts calls getBars({ perPage: 2000 }) but getBars issues a single
  .range() and Supabase caps a request at 1,000 rows, so 247 active
  profiles are absent from the sitemap, all ten San Diego TOP 10 among
  them. Not fixed yet, per instruction; it is the same class as the
  "paginate past Supabase's 1000-row cap" fix that reached the SEO data
  layer (e1a748d) but not this route.
- NO ROW FIELD SPLITS the San Diego five from five: description 80 to 96
  words on both sides (one fallback, on the not-indexed side), zero photos
  on nine of ten, zero accolades on nine of ten, hours/website/Instagram/
  email present on nine of ten, rendered page 378 to 410 words, inbound
  links 3 to 5 from the same city page and best-bars pages, all created
  2026-03-31 (three on 03-18/20). Across the whole set (340 not-indexed
  active vs 907 others) every median is within noise and the not-indexed
  side is if anything slightly richer. The split is Google's, not ours.
- The real number: a profile is ~354 words rendered of which the
  description is ~53; ~300 words are template and field labels. That is
  the thinness "Crawled, currently not indexed" usually names.
- Robots-blocked 229: 107 /_next/static css, 120 root ?p= WP post IDs, 1
  /search. All three are intentional Disallow lines.
- ?view=top10 city variants already emit canonical to the base city page
  (verified on london); the six are the "Alternate page with proper
  canonical" rows, working as intended.
- 404 profiles (40): 15 are deactivated rows (should 301 to the city
  page); 25 have no row, of which 17 are slug variants of live bars
  (accented, "the-", city-suffixed: licorería-limantour, tlecān,
  the-connaught-bar, the-dead-rabbit, junglebird, zest-seoul, coa-shanghai
  and so on) that should 301 to the live profile; 8 have no target
  (barmagazine-claim-test, peaches-cream-bar, bathtub-gin-co, service-bar,
  paradiso-voted-…, tay-r-elementary, honeycombs-hi-fi,
  berlin-bar-singapore, champagne-bar-four-seasons-surf-club).
- RANK-ON-HOVER ORIGIN: not a 50 Best brand constraint. Nothing in the
  repo cites a guideline; the approved mockup of 2026-08-24 drew the rank
  in the chip ("No. 25 · 2025"), the fixed-tile redesign approved
  2026-08-25 dropped it ("Being on the list is the badge; the placement
  lives in the description. This is deliberate"), and 5d1ace0 on 08-26
  wrote the invariant into TileView. It was a design decision taken with
  the tile shape, not a licensing one.

## 2026-09-14 - Row cap fixed in three places; 28 profile 301s; rank on hover
- THE 1,000-ROW CAP was in three consumers, not one. sitemap-bars.xml
  (getBars perPage 2000), the /bars-map page (perPage 1000) and the
  redirect generator (REST limit=10000) each issued a single request and
  got Supabase's silent 1,000-row maximum. New getAllActiveBars() in
  supabase.ts pages by 1,000; the generator pages by offset. Live after
  e469350: sitemap 1,247 profiles = 1,247 active rows, all ten San Diego
  TOP 10 present; the generator now sees 1,247 bars and emits 1,235 root
  redirects (was 989), identical across two consecutive runs with
  assertNotCollapsed() holding.
- DEPLOY CHECK: seo-check live mode gained sitemap-bars-count, which
  compares the sitemap's profile <loc> count with a HEAD count=exact
  against Supabase over the anon key. Missing env is a FAIL, not a skip.
  Passes: "1247 profiles = 1247 active rows".
- 28 REDIRECTS in next.config.mjs from the Search Console 404 report: 15
  deactivated rows to their city page (dangerous-water to
  /bars/country/spain, Palma has no city page); 13 slug variants to the
  live profile. Four of the 17 variants already had rules from earlier
  today (licorería-limantour, tlecān, tayēr-elementary, the-dead-rabbit).
  Next emits 308 for permanent rules, as for every existing one. The
  eight with no target stay 404. bar-redirect-chains: 74/74 land on 200.
- RANK ON HOVER for all nine orgs: title and aria-label now carry "No. N"
  between year and category. Verified live: "World's 50 Best Bars 2025 —
  No. 2 — <source>" on handshake-speakeasy. Face unchanged. Invariant
  rewritten in TileView and the spec so the hover part is not reversed.
- STRUCTURAL PASS ESTIMATES (report only, nothing built): see the session
  report of this date; headline numbers are nearby block ~96 words and
  5,885 links, accolade sentences ~11 words on 322 rows, article links
  2,719 new links to 430 profiles from name mentions (72 generic names to
  hand-check).

## 2026-09-14 - Enrichment applied (33 rows); structural pass built and measured
- ENRICHMENT from "Claude outputs/enrichment-priority-33.md", applied by
  id with the file's own guard (never overwrite a non-empty field): 33
  descriptions (all 33 rows were at 0 words), 21 hours strings, 14 emails,
  6 websites filled where empty, 14 Instagram handles filled where empty.
  Every hours string was run through classifyHours() first: 21 of 21
  clean (converted or already in the target format, no partials). The 13
  zero-word tranche rows went 0 -> 50 to 81 words and the composed
  fallback is gone from each, verified on the live pages.
- ACTION ITEMS honoured: el-gallo-altanero website was already empty;
  la-factora website already the new domain, its stored Instagram
  'lafactoriapr' FLAGGED (venue publishes none), not removed; lady-bee
  address verified as Pedro de Osma 205; mo-bar-shenzhen email stored and
  the address added to outreach/optout.txt (mohg is also in
  CORPORATE_DOMAINS, so the send scripts already refuse it); the-st-regis
  and vender emails not stored. Kept as stored and flagged: tan-tan hours
  ('Tue-Sun') and website, hope-sesame website (root vs deep URL),
  mo-bar's stored handle, gorilla's postcode (54632 stored, 54625 in the
  file; address out of scope).
- "Claude outputs/us-metro-wave1-verified.md" is an INSERT wave of 21 new
  rows with three decisions marked for Roman, not an enrichment file. Only
  one slug already exists (drinkwell, 105 words, so its description was
  not overwritten). Nothing inserted.
- BUILT (b1b306b): nearby block, five closest active bars by great-circle
  distance, same city only, miles for US rows, km elsewhere, street and a
  line from short_excerpt or the first sentence; replaces the photo-first
  four-card grid. Accolade prose, one sentence per renderable entry under
  the tiles. Article mentions from a conservative map (full name, whole
  word, plus the city in the text): 280 bars, 170 articles, 745 links,
  rendered as "<Bar> in BarMagazine" on the profile and "Bars in this
  article" on the article; 103 generic-name matches held in
  claude/article-mentions-held.md, none linked. New tests: 8 (272 total).
- MEASURED on the same 40-profile sample, before -> after, from full
  crawls: rendered words median 352 -> 420; inbound links median 4 -> 7.
  San Diego five-and-five: 380 -> 512 words, inbound 4 -> 11 (indexed)
  and 4 -> 8 (not indexed). Site-wide, all 1,247 active: words 354 ->
  428, inbound 3 -> 8, profiles with at most one inbound link 300 -> 37,
  profiles linked from an article 344 -> 450.
- The after-crawl regenerated every profile (a new deploy resets ISR;
  each URL was then fetched). 16 profiles timed out in one alphabetical
  burst during the crawl and all returned 200 on refetch.
- ROW CAP, four more: the bars-table grep found getBarFilterOptions,
  getCountriesWithCounts, getCitiesWithCounts and /api/bars/map still
  reading the whole directory in one request. All paged. The sitemap grew
  from 1,755 to 2,006 URLs as a result: city pages past the cap had been
  missing too. Rule and audit recorded in claude/data-checks.md.

## 2026-09-14 - US metro wave 1: 20 inserted (Chicago 6, New Orleans 5, Austin 2, Denver 3, Nashville 2, Dallas 2)
- Source: "Claude outputs/us-metro-wave1-verified.md", 21 blocks, all 2026
  Spirited Awards regional honorees verified on each venue's own site.
  Diffed first by slug and by folded name plus city: 20 clear, drinkwell
  already present (105 words) and left alone as the guard had it.
- Roman's three decisions applied: the-roost-bar inserted as "The Roost
  Bar at Brennan's" with the description as written; the-elysian-bar
  admitted; bar-tre-dita admitted as Cocktail Bar with Hotel Bar subtype.
- Inserted one by one through the admin create path (geocodes on insert,
  revalidates). All 20 geocoded; every one within 6.3 km of its city's
  existing centroid (Dallas is a new city, its two rows sit 0.3 km apart
  downtown). All 20 serve 200. Address check: 0 flags.
- ACCOLADES: every row carries Tales of the Cocktail Spirited Awards 2026
  as a nominee with the parenthetical title, the same treatment as the
  Phoenix set (lady-jane carries two: Best U.S. Cocktail Bar and Best U.S.
  Bar Team). The file's note on lady-jane checked out against the
  official JBF page (jamesbeard.org/stories/james-beard-award-
  semifinalists-2026 lists "Lady Jane, Denver, CO" under Outstanding
  Bar): jbf nominee, title "Outstanding Bar (Semifinalist)", added. The
  chandelier-bar note (earlier Spirited years) was NOT added; the file
  says verify first and that has not been done.
- OUTREACH FLAGS stored where the send scripts see them: new
  outreach/parked.txt, slug-keyed with the reason inline, read by
  send-upsell.mjs and send-photo-nudge.mjs before the email is looked at.
  Parked: the-sazerac-bar, the-cruise-room, catbird, bar-tre-dita. Keeps
  recorded in the same file as comments: friends-of-friends,
  sportsmans-club (Heisler, venue-specific addresses on own domains),
  the-elysian-bar, midnight-rambler. Dry runs of both scripts print
  PARKED for a parked slug and DRY RUN for a normal one.
- ADDRESS FLAGS (third-party address, not first-party confirmed):
  friends-of-friends 2001 W Grand Ave (operator confirms West Town only);
  moneygun 660 W Lake St (own map link points to matching coordinates);
  sportsmans-club 948 N Western Ave (own site prints it without the N).
  The bars row has NO notes column, so these cannot yet be recorded on
  the row itself. scripts/admin-notes-migration.sql adds `admin_notes
  text` for Roman to run in the SQL editor; once it lands the three flags
  go on the rows and owner-fields.ts must forbid the column to owners.
- COUNTS after the wave: active rows 1,267; sitemap-bars.xml profiles
  1,267 (cache-busted read; the CDN copy refreshes within the hour).
- The 103 held article-name matches were sent to Roman as
  claude/article-mentions-held.md for the hand check.

## 2026-09-15 - Held article mentions confirmed: 276 pairs loaded, map rebuilt
- Roman reviewed the 103 held names by reading each article: 274
  confirmed pairs across 90 bars ("Claude outputs/confirmed-pairs.txt").
  Loaded as claude/article-mentions-confirmed.txt, a tracked allowlist
  the build script reads, so confirmed pairs survive regeneration. Two
  pairs added on Roman's instruction: top-10-bars-in-los-angeles-2026 and
  dante-in-beverly-hills belong to dante-beverly-hills (the row exists),
  not to the New York dante row, which keeps only the 51-100 list piece.
- SECOND-LINK GUARD: the article-side block now skips any profile the
  article body already links, so no article carries two links to one bar;
  the profile side keeps the mention. 87 pairs skipped on that rule. Of
  the four Roman named, two were already linked in the body (atlas in the
  Singapore top ten, kwant in Negroni Week) and are skipped; two were
  NOT (gaba in the Dubai top ten links only its Instagram; gokan has no
  profile link in the Signature Sessions piece), so the block gives them
  their first link. Verified live on all four articles.
- FALSE POSITIVE caught on the live check and fixed the same hour: the
  Dubai top ten matched the MADRID salmon-guru row on a passing "Madrid
  original", the multi-outpost trap again. New
  claude/article-mentions-excluded.txt (same format, reason inline) is
  read by the script; the automatic rule never links an excluded pair.
- MAP NOW: 372 bars, 181 articles, 1,024 profile-side links, 24 names
  still held (the unconfirmed remainder of the generic list).
- MEASURED after deploy 0667b95, article pages re-crawled, on the same
  1,247-row set as the structural pass: profiles linked from an article
  450 -> 481; median inbound links 8 -> 8 (unchanged: the confirmed
  pairs concentrate on bars that were already well linked, Paradiso,
  Sips, Himkok, Line); article->profile links 1,388 in total; profiles
  with at most one inbound link stay at 37. On the 40-profile sample the
  median stays at 7.

## 2026-09-15 - Multi-row names: the city has to sit with the name (6690064)
- Roman approved five exclusions from the multi-row report
  (employees-only-singapore x2, salmon-guru-dubai x3), added to
  claude/article-mentions-excluded.txt with the sentence each came from.
- THE RULE, built rather than noted: for a folded name shared by two or
  more active rows (17 names, 39 rows), the sibling cities compete for
  each mention and the nearest wins. Order: the article TITLE decides
  when it names one of them (a city top ten belongs to that city's row);
  otherwise the first sibling city AFTER the name within 100 characters
  ("Salmon Guru, Madrid 64", "Salmon Guru – Madrid"); otherwise the
  nearest before it ("Direct from Madrid, Salmon Guru"); otherwise the
  same-sentence test. "Nearest in either direction" was tried first and
  misread dense lists, where the previous entry's city touches our name.
- RESULT against the reviewed map: the rule alone removes the five
  approved pairs plus twelve more of the same shape and adds nothing.
  Believed correct: salmon-guru-milan x4 (Madrid is the ranked bar),
  floreria-atlantico-dc -> Bar World 100 (Giovannoni is Buenos Aires),
  seed-library-nyc -> the London top ten and the 2024 Spirited nominees
  (London), seed-library -> the New York top ten (NYC). FOR ROMAN, four
  drops that may be genuine because the article is about the ORIGINAL
  opening an outpost and the title names the outpost's city: bar-leone ->
  bar-leone-shanghai-opens-this-november,
  bar-leone-expands-with-second-location-in-shanghai and
  negroni-week-2026-asia-pacific-guest-shifts; seed-library ->
  mr-lyan-brings-seed-library-to-new-york-this-fall. A line in the
  confirmed file restores any of them.
- Map now 369 bars, 181 articles, 1,006 links, 24 held. Multi-row report
  re-run on the final map: every outpost row carries only its own city's
  articles.
- Roman then RESTORED the four original-opens-an-outpost pairs (bar-leone
  x3, seed-library -> mr-lyan-brings-seed-library-to-new-york-this-fall)
  as confirmed pairs; both rows carry them (bb63298). The eight other
  drops stand. Map 1,010 links.

## 2026-09-15 - Traffic audit; meta-externalagent rate-limited in the Vercel Firewall
- Vercel request logs (vercel.com/api/logs/request-logs, the endpoint
  behind `vercel logs`) carry clientUserAgent, requestReferer and
  clientRegion, but only 50 rows a page, newest first, and the volume is
  far beyond a full 24-hour pull. Sampled the LAST ~1,000 requests of
  each hour (23,650 rows) plus one 2-minute window pulled in full.
  clientRegion is the Vercel edge (iad1, sfo1, lhr1), NOT the client's
  country, so country of origin is not answerable from this source.
- FINDING: meta-externalagent (Meta's AI training crawler) is 52% of the
  sample, present in 20 of 24 hours, and the complete window shows a
  burst of 54,901 Meta requests in 2 min 11 s at 05:30 UTC on the 14th,
  peaking at 39,577 in one minute (~650/s), across 33 paths, 86% of all
  origin-hitting (MISS/STALE) requests in that window. No WAF action on
  any of it. Googlebot 1.1% of the sample, ChatGPT-User 0.8%,
  OAI-SearchBot 0.7%, Bingbot 0.6%, ClaudeBot 0.2%; robots.txt allows
  every named AI crawler (explicit blocks for GPTBot, ChatGPT-User,
  ClaudeBot, PerplexityBot, Google-Extended; the rest under *).
- FIREWALL RULE (Roman): "meta-externalagent rate limit (429 above
  5/s)": user_agent contains meta-externalagent, fixed window 60 s,
  limit 300, keyed on ua, action deny (429). Config version 2, beside the
  existing Tencent SG challenge rule. Not a block; no other crawler
  touched. Self-tested with 330 requests in a minute under that UA.
- USAGE, billing cycle Aug 27 to date (Vercel Usage page): function
  invocations 785.97K, edge requests 740.67K, fast data transfer 36 GB,
  fast origin transfer 25 GB, ISR writes 328K, ISR reads 1.78M;
  on-demand charges $15.65 in total. Vercel does not attribute usage to
  a user agent; from the logs Meta is ~56% of origin-hitting requests in
  the sample and 86% in the burst, so roughly half the function and ISR
  spend, i.e. a few dollars a cycle. Not material in money; material in
  load, since each burst is thousands of ISR regenerations at once.
- SELF-INFLICTED: the 330-request self-test of the rule, run from the Mac
  against production, tripped Vercel's automatic DDoS mitigation on the
  Mac's own IP (68.72.208.8): a System Rule challenge, "Ongoing", visible
  under Firewall > Persistent Actions, with no entry in the IP Blocking
  list and Attack Challenge Mode off. Every non-browser fetch from the
  Mac was a 403 (x-vercel-mitigated: challenge) for about ten minutes;
  browsers were unaffected. The persistent action offers no removal in
  the dashboard; it expired on its own and a plain fetch returned 200 at
  05:31 UTC. Rule recorded in data-checks.md: production is never
  load-tested from the Mac. The 240 x 200 then 403s the burst saw were
  the mitigation, NOT the rate limit, so the burst proved nothing about
  the rule.
- SAFE VERIFICATION after clearing: 20 requests inside one second under
  the meta-externalagent UA all returned 200, an ordinary-UA control 200,
  plain curl 200. At a 300-per-60-second ceiling a 20-request test
  cannot produce a 429, so this proves the rule is scoped and harmless
  at normal volume, not that the 429 fires; that proof needs a preview
  deployment, not production. Deploy suite green from the Mac
  (sitemap-bars-count 1267 = 1267), so tomorrow's runs from this IP are
  clear.
- SINGAPORE, last hour (04:05 to 05:05 UTC, six 10-minute windows each
  capped at its newest 20,000 rows): 33,600 requests served from the
  Singapore edge, 31,200 browser-like, of which 28,800 carry ONE user
  agent (Mac Chrome/145, frozen) across 34 paths hit ~2,000 times each
  (city pages, the top tens, /privacy, /bars, /terms, /search) with
  spoofed internal referrers, bursting 19,600 in the 04:34 minute. That
  is a crawl from a rotating pool with a headless browser that executes
  GA, not a shared link: the same signature as the Tencent AS132203 rule,
  on an ASN the request log does not expose. No single shared page.
- OUTREACH: batch13 (three lanes, 28 emails) and batch14 (3 emails) dry
  runs written to claude/batch13-dryrun.md and batch14-dryrun.md for
  Roman's eyeball, NOTHING ARMED. Both send scripts gained a claimed-bar
  guard (owner_id on file = CLAIMED, not sent). The Fox and Four Walls
  parked. The "outreach status doc" with a PR-agency track lives in the
  claude.ai project, not the repo; Roman updated it himself.

## 2026-09-16 - Queue task 30: "Bars in this article" as the card carousel (0bd3021)
- src/components/ArticleBarsCarousel.tsx (server): fetches the named
  rows by slug, keeps the map's alphabetical order, renders the task-22
  track (.bar-v2-mentions-track, three visible on desktop with the
  MentionsArrows client buttons when more than three, halves on tablets,
  85% with a peek on phones, static row for three or fewer) with the
  directory card (DirectoryBarCard: photo or placeholder, pills, name,
  "City, Country" line). Same hrefs as the old list (/bars/<slug>). The
  outlined box is gone: hairline above, the profile-block heading size,
  the article body's link underline overridden inside the cards. Renders
  nothing without mentions or when no named row is active.
- Note: the article side skips bars the WP body already links (the
  build script's rule), so the Torno Subito article, whose body links all
  three profiles, shows no block by design; its three pairs live on the
  profiles.

## 2026-09-16 - Queue task 29: Bar Leone on the Negroni Week APAC article, multi-row audit
- The guest shift is at Bar Leone Shanghai ("Berg then continues from
  Bangkok to Bar Leone Shanghai on September 24, the mainland outpost of
  the Hong Kong bar named the world's best in 2025"); the Hong Kong row
  was linked by a hand-confirmed pair that read the context clause as a
  mention. Removed: bar-leone -> negroni-week-2026-asia-pacific-guest-shifts
  (now on the excluded list with the reason); confirmed with the sentence:
  bar-leone-shanghai -> the same article. Regeneration 1024 -> 1023, that
  one pair removed, none added.
- Multi-row audit (Attaboy, Employees Only, Salmon Guru, Paradiso, Zuma,
  Seed Library, Floreria Atlantico, The Living Room, Bar Leone), every
  pair read against the sentences naming the bar: all rows match their
  article's city except one to hold for Roman: seed-library (London) ->
  seed-library-nyc-new-cocktail-menu-june-2026, an article about the New
  York room's menu that names London only as the original. Not changed.

## 2026-09-16 - Queue task 28: mentions rebuilt for the Torno Subito article
- Article tato-giovannoni-floreria-atlantico-torno-subito-miami live. Three
  pairs added to claude/article-mentions-confirmed.txt with the quoted
  sentences (torno-subito, floreria-atlantico-dc, floreria-atlantico);
  scripts/build-article-mentions.mjs: 1021 -> 1024 pairs, exactly those
  three added, none removed, Barcelona not linked (the article never
  names it). The held list gained the article as a candidate for
  behind-bar (Buenos Aires, generic name "Behind"), held, not linked.

## 2026-09-16 - Queue task 27: Torno Subito (Miami) added as a restaurant bar
- torno-subito, id ea1e68d6-f1fa-44ee-b71b-eb6312153090, type Cocktail Bar
  with subtype Restaurant Bar (the 1986 Steak House precedent), all values
  from tornosubitomia.com read in the browser (script-rendered site):
  191 NE 40th St, (305) 209-3100, info@, @tornosubitomia, Resy link, bar
  hours Mon-Sat 12:30pm to close, two menu highlights (Negroni Balsamico,
  Americano al Caffe). Description 118 words, no dashes, no residency
  dates; the Floreria Atlantico residency (Sept 22 to 26) sits in
  admin_notes (no specials column yet). Geocoded by address, state FL,
  Miami city page revalidated, indexing queue +1. Article pairs: the
  article is not on WordPress yet; a dated placeholder in
  claude/article-mentions-confirmed.txt names the three pairs to add with
  its slug. wave-insert.mjs now carries subtypes and reservation_url.

## 2026-09-16 - Queue task 26: country-by-type and US-state-by-type SEO pages
- New routes /best-bars/country/<country>/<type> and
  /best-bars/us/<state>/<type> on the city-by-type template: intro (12
  hand-written in src/lib/region-intros.ts, the rest composed), the
  directory card grid (DirectoryBarCard, no cap, the city pages' best-first
  order), links down to the city-by-type pages inside the region, state
  pages inside a country, sibling types, ItemList and Breadcrumb JSON-LD,
  canonical, meta description with the LIVE count. Threshold
  MIN_REGION_BARS = 6 (src/lib/seo-regions.ts); below it the page 404s
  and is not in the sitemap. 52 country pages and 20 state pages at
  launch, all in sitemap-bars with lastmod = newest member. City-by-type
  pages link up to their state and country pages. sortSeoBars exported
  from seo-cities so the three rungs sort identically.
- Data: Bemelmans Bar, Carousel Bar & Lounge and Viceversa were typed
  Cocktail Bar with no Hotel Bar subtype; subtype added by id (they are
  hotel bars; the task's check list expects them on the US hotel-bars
  page). King Cole Bar in the directory is the Mexico City room, not New
  York's, so it is absent by design. New York, Texas and Florida hotel
  bars are under the threshold (5, 4, 4), so those three of the twelve
  requested intros have no page yet; the intros are in the file and light
  up when the counts reach six.

## 2026-09-16 - Queue task 25: wave 5 INSERTED, 11 rows (Roman's go relayed in the task file)
- Roman: Bar Marmont permanently closed (not inserted; "do not re-add"
  recorded in the wave file and claude/us-gap-analysis.md); Hard Shake
  open per the Google Business panel, inserted with his values (hours per
  the profile, noted in admin_notes). scripts/wave-insert.mjs --apply:
  round-robin-bar, hmf, blind-duck, the-living-room-dewberry, z-bar,
  salon-salon, tonga-room, hey-love, polo-lounge, alle-lounge-on-66,
  hard-shake, all type Hotel Bar, tier free, venue in admin_notes.
- Post-insert: state derived on all 11 (backfill-state: 456 US/CA rows, 0
  changes); geocode re-run force dry: all 11 address method, 0 km moved;
  audit:coords 10 (the task 16 holds, none from the wave);
  audit:descriptions 0 hits over 1455 rows; audit:addresses 0. New city
  pages /bars/city/beverly-hills and /bars/city/palm-beach live and in
  the sitemap; Hey Love joins portland-or, The Living Room joins
  charleston. Hey Love renders the Spirited tile and "Winner of Best U.S.
  Hotel Bar at the 2023 Spirited Awards." 13 items appended to
  claude/indexing-queue.json (11 profiles, 2 city pages).

## 2026-09-16 - Queue task 24: wave 5 (Haute Living hotel bars) PREPARED, insert awaiting Roman
- "Claude outputs/haute-living-wave5-verified.md": 10 OPEN (round-robin-bar,
  hmf, blind-duck, the-living-room-dewberry, z-bar, salon-salon,
  tonga-room, hey-love, polo-lounge, alle-lounge-on-66), 2 HOLD
  (bar-marmont: no venue-owned source; hard-shake: official page behind a
  bot wall). One accolade: Hey Love, TOTC 2023 Best U.S. Hotel Bar winner.
  Geocode dry run all by address (0.4 to 4.5 km), lint clean, slugs free,
  Beverly Hills and Palm Beach will be new city pages. Nothing inserted:
  new public pages are a publish under the queue guard; the command is in
  reports/24. Wave tooling committed (d501b30): wave-file.mjs,
  run-wave-geocode-dry.mjs, wave-insert.mjs (dry run by default).

## 2026-09-15 - Queue task 23 (urgent): sidebar blowout from the mentions row; footer gap (720117d)
- Regression from 22: the non-wrapping mentions track gave the 3fr
  profile column a min-content width (1685px on Handshake Speakeasy, 14
  cards), the sidebar went off screen and the action buttons past the
  right edge. Fix: .bar-v2 and .bar-v2-mentions min-width: 0, the track
  max-width 100% and overflow-x auto unconditionally (the lift room
  padding moved with it). Verified 1440 / 1000 / 390 on Handshake, Night
  Hawk, Lyaness, Mirate: document width equals the viewport, columns
  1032 / 344, arrows working.
- Footer gap: the nearby block (last in the column since 14) still
  carried padding-bottom 2rem and a hairline, so the last card sat 49px
  above the footer where the column gap is 16. Both removed; the gap is
  16 on profiles and stays 16 on /bars.

## 2026-09-15 - Queue task 22: mentions block is one horizontal scroll-snap row (849a931)
- .bar-v2-mentions-track: a flex row, cards one third of the width (two
  halves to 1099px, 85% on phones so the next card peeks in), scroll-snap
  x mandatory, overflow-x auto, scrollbar hidden, focusable (arrow keys
  scroll it natively), all cards in the server HTML. Three or fewer
  cards: a static row (stacked on phones), no overflow, no arrows.
- MentionsArrows (client, arrows only): two 36px round buttons beside
  the heading, one card per click with smooth behaviour, previous
  disabled at the start, next when the last card is fully in view (not
  at max scrollLeft, which mandatory snap may never reach); hidden below
  1100px and with three or fewer cards. Cards are border-box so three
  thirds plus two gaps fit the row exactly.

## 2026-09-15 - Queue task 21: nearby cards ARE the directory card (DirectoryBarCard, f87f2bd)
- The city page's CityBarCard moved into src/components/DirectoryBarCard.tsx
  (one optional prop, locationLine); the city page and the profile's
  "Nearby in <city>" both render it, so the two cannot drift. Nearby
  passes "<street or venue>, <distance>"; accolade tiles are gone from
  the nearby cards (the status pills on the photo carry TOP 10, 50 Best,
  Featured by the directory's rules). NearbyEntry carries tier and
  wpArticleSlug for the pills. Every Lyaness card is 317px tall at 1440
  (were 330 with uneven tile rows). The 19 mention cards are unchanged.
- Indexing: the 16:30 scheduled run fired (next run 2026-09-16) but
  wrote no log row and changed no queue item; row appended by hand
  (4361fb3). Two silent unattended runs today, both most likely stuck on
  tool-permission prompts; the interactive runs work.

## 2026-09-15 - Queue task 19: profile Nearby and mentions as card grids (056706e)
- Both blocks render the directory card three across (.bar-v2-card-grid /
  .bar-v2-gcard: white, house radius, hairline, 16:10 image or the
  BarPlaceholder, 12/16 body padding, 14px bold title, 12px meta). Two
  columns 700 to 1099, one below 700; tracks fixed, so a lone card sits
  left at one column's width.
- Nearby: NEARBY_LIMIT 5 -> 6; NearbyEntry carries photo, accolades and
  type; card = photo or placeholder, name, "<place>, <distance>", up to
  three accolade tiles, no description. The old .bar-v2-near row CSS is
  gone.
- Mentions: the wrapper card and heading stay; each row is a card with
  the article's featured image, the title (two-line clamp) and the date;
  the anchor still wraps image + title only with the same href and text.

## 2026-09-15 - Queue task 18: /bars hero content on the page column's edge (fa6cc2a)
- .directory-hero side padding 48 -> 24 (desktop: headline, subtitle and
  stat tiles at x=48, the search pill's content edge; were 72) and
  20 -> 26 at 768 and below (full-bleed hero: the search pill's outer
  edge, 10px gutter + 16px filters padding; were 20). Vertical padding,
  hero height (357 / 381), image, overlay, type sizes and the tiles'
  layout unchanged; the h1 wraps the same (63 / 47 tall).

## 2026-09-15 - Queue task 17: Top 10 city cards, 16:10 photo and the "Order this" block (b4119ab)
- Below 720px the card photo is aspect-ratio 16:10 (368x230 at 390) instead
  of a 190px strip; above 720px it stays the 280px column that fills the
  card's height (forcing 16:10 there would leave a blank strip under the
  photo), flagged for Roman.
- "Order this" is no longer a tinted panel: hairline above (the site's
  rgba(0,0,0,0.06)), gold uppercase label in the Plan Your Visit label
  style, the drink name bold, the ingredients in --text-secondary. New
  src/lib/menu-highlight.ts splitHighlight() separates a name that carries
  its ingredients after a dash and renders no em or en dash anywhere in
  the block. Same block on the /best-bars/[city]/[type] pages, which share
  the card. Absent entirely when a bar has no highlight (no empty hairline).

## 2026-09-15 - Queue task 11d: desktop card gaps 14/29/28 -> 8/15/18; CTA to Nearby 64 -> 32 (071e240)
- Measured against the pre-05 commit (582d7ea) served from a worktree.
  At 1440 the grid kept both neighbours' margins; the upper margin of each
  pair (place, tiles, prose) is now 0 inside the 1100px grid. Phones
  already matched pre-05 except the 11a button stack and the 09 note.
  Card bottom to Plan Your Visit was 40 everywhere, before and after.
- .bar-v2-nearby: 2rem above as margin, not padding, so it collapses into
  the CTA's margin (task 14 put the list under the CTA). 32 at both
  widths, the same as every other section gap.
- Kept on purpose: prose to description 10px (task 12), not the pre-05 0.

## 2026-09-15 - Queue task 16: 70 active rows without coordinates, 60 geocoded (7dad688)
- Paged count: 70 active rows with lat or lng null (Phoenix 11, Hong Kong
  10, Tokyo 10, Shanghai 5, Jakarta 3, Lima 3, 28 more cities). Dry run
  through /api/admin/geocode-bars in chunks of 15: 60 address results,
  10 name results, no explicit city-centre. The 60 were written by id via
  manage-bar (revalidated); Bitter & Twisted (33.446985, -112.074025)
  renders its map live.
- The 10 name results are held: seven sit exactly on the city centre
  (Mapbox answers a failed name search with the city's place feature), one
  is 31 km out (Beogradski Koktel Klub, no address), two are unverified
  (CMYK Changsha, Door No. 4 at the wrong end of Grand Cayman). Listed in
  reports/16 for a manual look; nine of them have no address on the row.
- src/lib/geocode.ts: a name result within 50 m of the city centre now
  reports as city-centre, not name. New `npm run audit:coords`
  (scripts/coords-check.mjs, paged) ends every add wave with the count;
  rule added to claude/data-checks.md.

## 2026-09-15 - Queue task 11c: task 15 reverted in full (542c57a)
- Roman: the owner-edit notice to his Gmail was fine; task 15 rested on a
  cloud-side misunderstanding. 8b35f93 reverted whole (module, tests, rig,
  the @vercel/functions dependency, the maxDuration lines). Recipient in
  effect: NOTIFICATION_EMAIL, the HTML "Owner edit pending" notice, exactly
  as before. No email sent in this task.
- 8b35f93 never reached production: its deploy failed at pnpm install
  (ERR_PNPM_OUTDATED_LOCKFILE, the new dependency was added with npm and
  pnpm-lock.yaml was not updated). Lesson for any future dependency add:
  Vercel installs with pnpm from pnpm-lock.yaml, so run pnpm install and
  commit that lockfile too.
- The [Test] email to office@ (Resend d1418296) stands as sent; nothing
  else went out.

## 2026-09-15 - Queue task 15: owner-edit notice to office@, batched (8b35f93, REVERTED by 11c)
- Holiday check: the 13:40 PT edits DID send two notices (Resend ids
  f70b6a79 and 607eb39b, both delivered), but to NOTIFICATION_EMAIL, which
  is Roman's Gmail. office@ was never the recipient.
- New src/lib/owner-edit-notice.ts: plain text to office@barmagazine.com,
  subject "Edit to approve: <Bar> (<fields>)", body with bar and place line,
  owner, each field's proposed value (photos as a count plus URLs), the
  /admin/review?tab=edits link. One email per burst: the notice runs in
  waitUntil after the response, waits 60 s, yields if a newer row from the
  same owner for the same bar exists, and lists every row less than 75 s
  apart back from its own. Both owner routes set maxDuration = 90.
  Claim and Stripe notices still go to NOTIFICATION_EMAIL (unchanged).
- Test rig scripts/run-owner-edit-notice-test.mjs (dry | send) composes
  from Holiday's real rows and creates nothing; one [Test] email delivered
  to office@ (Resend id d1418296).

## 2026-09-15 - Queue task 14: location map above the nearby list (3316bdb)
- Literal swap of the two blocks on the profile: the map now sits where
  the nearby list was (after the gallery, before the mentions card and the
  CTA) and the list where the map was (before the mobile Top 10). No
  markup or CSS of either block changed; a bar with no coordinates renders
  neither block and nothing empty.

## 2026-09-15 - Queue task 11a: phone card back to block flow, actions last (5f9b537)
- 05's grid put the buttons between the prose and the description on
  phones and widened every gap (grid items keep both neighbours' margins).
  Below 1100px the card is block flow again in reading order with the
  actions block at the end (moved in the DOM; desktop placement is by
  grid, order-independent); phones stack full-width buttons; tablets wrap
  a row. Gaps at 390: 14/29/28 -> 8/15/18.

## 2026-09-15 - Queue task 12: accolade prose as a credentials line (f3592cc, 3c0cfa2)
- No subject (the H1 says the name): "Listed on North America's 50 Best
  Bars in 2022 and awarded 2 Pins by The Pinnacle Guide in 2024." Same
  tile set and order as task 10, clauses recast as credentials, first
  letter capitalised, one period. credentialsLineWithName for any off-page
  reuse (none today). Prose now shares the description's 600px measure
  and left edge with a 10px gap.

## 2026-09-15 - Queue task 11: Holiday (Austin) specials sentence; specials field waits on the column
- Owner-requested happy hour sentence appended by id to Holiday's
  description (slug holiday, holidayon7th.com; the task said Phoenix, the
  row is Austin), lint clean, live. The owner "Specials" field (form,
  approval flow, two render spots) waits on bars.specials; re-queue when
  the column exists.

## 2026-09-15 - Queue task 10: accolade prose as one sentence, name first (a129d26)
- Supersedes the morning's one-sentence-per-org form (relayed as Roman's
  approval). accoladeSentence(name, accolades): one sentence, the stored
  name once, one clause per tile in tile order (tileEntries, the exact
  deduped score-ordered set the face renders), per-org phrasing from the
  task, "ranks" on the current edition (LATEST_EDITION map) and "ranked"
  on older ones. Bitter & Twisted's clauses come out listing-first because
  its 2022 North America listing is stored at 600 (undecayed; the
  calibration says 472), flagged for the score refresh. 156 rows have a
  description that also opens with the name (count only).

## 2026-09-15 - Queue task 09: ownership note final wording (1763b67)
- "This listing is managed by its owner. / For ownership changes contact:
  / office@barmagazine.com", the email alone on the third line as a mailto
  link, no trailing period.

## 2026-09-15 - Queue task 08: actions column capped (e699e8f)
- Follow-up to 05 from Roman's live look: the actions column is capped at
  300px at 1100px and up (grid minmax(0,1fr) 300px), the ownership note
  reads on three explicit lines ("For ownership changes:"), and the claim
  call to action is a pill button again, last in the column. Verified at
  1000 and 1440 on Bitter & Twisted, Daisy and Captain Foxheart's.

## 2026-09-15 - Queue tasks 05, 06, 07: profile card grid, accolade-tail scan (stopped), The Pinnacle Guide built
- 05 (04d541f): the profile info card is one grid in reading order; 60/40
  text and stacked actions at 1100px and up, a wrapping actions row under
  the tiles below, two per row on phones (border-box, the site is
  content-box); Instagram, Call and Get Directions buttons; the reserve
  button no longer gated on tier; claim prompt and ownership note in the
  meta style under the buttons (the claim pill is demoted to a text link,
  flagged for Roman). Verified at 390/768/1024/1180/1440 on four bars.
- 06 STOPPED at its own checkpoint: 404 trailing accolade sentences on 352
  rows (297 duplicate a stored accolade, 87 state a fact the accolades
  lack, 35 compound). Removing ~300 sentences is Roman's call; the scan
  is in claude/description-accolade-tails.json.
- 07 (f161099): The Pinnacle Guide built on the file's relay of Roman's
  decisions: `pinnacle` org, grade on the small line, PINNACLE constant,
  forest green tiers, "awarded it N Pins" prose, 600/570/540 minus 12 a
  year, announcement year with a basis note; 108 rows written by id;
  spec updated; article mentions regenerated (+11, 0 removed). Kumiko's
  3 Pins sits behind three higher scores (top-three rule).

## 2026-09-15 - Queue task 04: The Pinnacle Guide as an accolade org, STOPPED for Roman
- The cloud session asked for a `pinnacle` org and a directory match. Done
  up to the decision: programme verified against the four criteria
  (methodology published; jury anonymous by design; rolling waves rather
  than a yearly edition; no award year printed, only the announcement
  date), the full 190-bar list saved to claude/pinnacle-guide-list.json,
  the name-plus-city match saved to claude/pinnacle-guide-match.json: 99
  automatic matches plus 9 by eye = 108 rows would carry a Pin (3 three-
  Pin), 15 name-only hits are other venues, 69 pinned bars are not listed.
  Bitter & Twisted: 2 Pins, announced 2024-04-29. Nothing written, no org
  added: reports/04 lists the four points for Roman (year semantics, tile
  lines against the constant-bold-line rule, where the Pin count lives,
  the by-eye nine).

## 2026-09-15 - Queue task 03: article-mentions card on profiles (da4f3b2)
- The "<Bar> in BarMagazine" block was a bare heading and a bulleted list.
  Now the same white rounded card as the info card: one row per article
  with a small rounded lazy thumbnail (the article's featured image), the
  title, and the publish date in the muted meta style; the whole row is
  clickable through the title's stretched ::after while the anchor keeps
  title-only text and the same href, so the internal-link graph is
  unchanged (verified against a live baseline on Little Rituals and 1930).
  Mobile: 72px thumbnail on the left, title wraps. Nothing renders for a
  bar with no mention. Server-rendered. id="mentions" on the block.
- Data: scripts/build-article-mentions.mjs now carries date and
  jetpack_featured_media_url per article into the JSON. The pairing rule
  is untouched; a regeneration would ADD 11 pairs for rows inserted since
  the last build (listed in reports/03), so only the new fields were
  merged into the committed 1,010 pairs. Roman decides the regeneration.

## 2026-09-15 - Task queue (Claude outputs/queue -> reports -> done) and its first two tasks
- Roman set up a task queue between the cloud session and this one:
  queue/*.md run as prompts under every standing guard, full report to
  reports/<name>.md, file moved to done/. Nothing is sent, deleted,
  published outward or purchased on the strength of a file; those stop
  with a report and wait for Roman in chat.
- 01-hk-macau-country: 39 active rows moved from country China to Hong
  Kong (36) and Macau (3) by id; /bars/country/hong-kong and /macau exist,
  China down to 23; city slugs unchanged so no redirect; two inactive HK
  rows left (scope). Found and fixed a regression of the day: cityLabel
  printed "Singapore, Singapore" and "Hong Kong, Hong Kong" once the cards
  went through it; a city-state now prints once (b863569).
- 02-hero-long-name-mobile: the no-photo profile hero clipped a long
  name's second line on phones (height-capped hero, two-line clamp meant
  for card tiles). Option 4: inscription hidden at 768px and below (the H1
  repeats the name directly below), kept on desktop with a clamped size
  and no line clamp. 14 longest names checked at 375, 390 and 1280
  (94858e2). Dev-server launch config added.

## 2026-09-15 - Every card place line through placeLine (4292e63)
- placeLine(bar) in src/lib/city-location.ts: cityLabel with the state
  from bars.state; one call for every place line on the site. Routed:
  the directory grid, featured and list cards (BarDirectory), the map
  pins and cards (BarDirectoryMap; /api/bars/map now returns state and
  the MapBar-to-Bar conversion keeps it), the city page cards, the
  collapsible list, collections, and the award hubs (award-hubs selects
  state). Verified live: /bars "San Diego, California"; /bars/city/
  nashville "Nashville, Tennessee"; /bars/city/tokyo "Tokyo, Japan";
  /bars/city/toronto "Toronto, Ontario"; /bars/city/portland-me
  "Portland, Maine"; /awards/spirited-awards "London, United Kingdom".
- Left alone: BarsDirectory.tsx and FeaturedBarsScroller.tsx (static
  legacy dataset, rendered nowhere) and the admin, claim and add-your-bar
  forms. Seen in passing: Bar Leone and Argo carry country "China" with
  city "Hong Kong", so their line reads "Hong Kong, China"; a data
  question for Roman, not a label defect.

## 2026-09-15 - No-food rule: Bastion and JoJo's rewritten, description linter
- bastion (466e654f): "serves no food from that kitchen" removed; the
  sentence now reads plainly "It opens seven nights a week, and the Big
  Bar serves nachos until close to last call" (Roman smoothed the first
  cut, which cited the FAQ in the copy); the FAQ source sits in
  admin_notes. jojos-beloved (9b7a7dcf): the "serves no
  food" clause removed, the rest untouched. Both revalidated and confirmed
  live. momus and bar-us left as they are, by decision.
- RULE added to claude/admission-rule.md, Descriptions: never state that a
  bar has no kitchen or serves no food; if the venue says so, do not
  mention food. No description linter existed, so
  scripts/description-lint.mjs is new: the sweep's phrases plus variants,
  every row's description and short_excerpt, exit 1 on a hit, reviewed
  rows allowlisted against their exact phrase (momus, bar-us, the inactive
  Wise King line). Wired as `npm run audit:descriptions` and into
  data-checks.md as a post-wave check. First run caught one false positive (Bar des Pres, "drinks-only reservations", a booking policy); the pattern now excludes reservation wording. Clean run: 0 hits, 3 suppressed.

## 2026-09-15 - Same-name cities: city slugs qualified on collision, bars.state column, Kraków merge
- RULE (Roman, built same day; commits a96f847, 69f1b8a, e2938d4): the
  city slug stays the bare city for every city with no collision. Where two
  or more active rows share a folded city name across different countries
  or different US states, each city gets a qualified slug: US cities the
  two-letter state (portland-or, portland-me, birmingham-al), everything
  else the ISO country code (birmingham-gb). src/lib/city-keys.ts builds
  the entries from every active row's city, country and state (a null
  state joins the city's majority state, so an unfilled row can never fake
  a collision); src/lib/city-index.ts caches them 300 s under a tag that
  revalidateBarPages purges on every write. City pages, best-bars pages
  and their type sub-pages, the sitemap, breadcrumbs, the country page's
  city links and the nearby block (sameCity: city, country, state) all key
  on the entry. Stored city strings stay bare: jewel-box is "Portland"
  again, with ME in bars.state.
- bars.state (Roman ran scripts/state-column-migration.sql): backfilled on
  all 445 US and Canadian rows by scripts/backfill-state.mjs, zero nulls.
  Derivation in order: the code before a postcode, a code that ends the
  address (", CA", anchored to a comma before and the end after), a
  spelled-out state or province, the Canadian postal code's first letter,
  a qualifier in the city string. 18 rows with a bare street line or no
  address (inactive) were set by hand from their city, none a namesake
  (New Orleans 5, San Diego 2, San Francisco 1, New York 2, Seattle 1,
  Detroit 1, Austin 1, Rogers 1, Albuquerque 1, Toronto 1, Victoria 1,
  Montreal 1). The insert path (manage-bar create) now sets state from
  stateHint for US/CA rows. The slug rule and the label read the column;
  subdivisionForCity (the address vote) is the backfill source only.
  PUBLIC_EDITORIAL_COLUMNS lists it as public.
- LABEL: the profile place line and title now go through cityLabel with
  the state ("Portland, Maine", "Malaga, Spain"); they used to print
  "City, Country" for every row, against the 2026-09-14 label rule. A
  qualified city's page carries the label in h1 and title ("Best Bars in
  Portland, Maine"); no unqualified page's title changed (Nashville
  checked).
- REDIRECTS (next.config.mjs, through the chain test): /bars/city/portland
  -> portland-or, /bars/city/portland-maine (the interim URL, in the
  sitemap for a few hours) -> portland-me, /bars/city/birmingham ->
  birmingham-gb (Passing Fancies held the page first). No best-bars
  redirects: none of the four cities clears MIN_CITY_BARS.
- KRAKÓW: mercy-brown and tag moved from "Krakow" to "Kraków", the venue
  spelling every address and The Trust already used; /bars/city/krakow
  now lists all three (it showed one string's rows before). Same slug
  either way, so no redirect.
- VERIFIED LIVE: birmingham-al (adios, bygones) and birmingham-gb
  (passing-fancies), portland-or (scotch-lodge) and portland-me
  (jewel-box) render as separate pages with the right bars and qualified
  titles; the three redirects land on 200s; profile breadcrumbs link the
  qualified slugs; Adios's nearby block shows Bygones at 0.3 mi and
  nothing from England; sitemap city URLs before/after differ by exactly
  the seven expected lines (200 -> 201 URLs), no other city page changed
  its URL; sitemap profiles 1,348 = 1,348 active; address audit 0 flags
  with the jewel-box allowlist entry removed.
- NOT TOUCHED: directory and city cards still print "City, Country" in
  their location line (the label rule would say "Portland, Maine");
  getCitiesWithCounts and getBarsByCity remain in supabase.ts unused by
  the pages; two Canadian same-name cities in different provinces would
  take the province code (windsor-on, windsor-ns), untested against real
  rows.

## 2026-09-15 - Friends of Friends description: owner licensing flag
- Abe (owner) flagged that "and the bar keeps no kitchen on site" creates a
  problem with the Illinois Liquor Commission. Replaced by id
  (73d48412-3d72-4789-a09d-a0d8da327293) with "and small bar snacks are
  available", revalidated, live page and meta description confirmed.
- Sweep of every description and excerpt (1,444 rows) for a negated
  kitchen/food statement, NOT changed, for Roman: bastion (Nashville,
  "serves no food from that kitchen"), jojos-beloved (Atlanta, "serves no
  food"), momus (Madrid, "serves no beer, wine or food"); borderline: bar-us
  (Bangkok, "Not a dining but a drinking room"). the-wise-king-soho-hong-kong
  is inactive and historical. The rest were false positives (negations
  near "food" that say the opposite).

## 2026-09-15 - Geocoder address-first; week re-geocoded; same-name US cities logged as the next structural item
- GEOCODER (src/lib/geocode.ts, commit 450e289): the insert path now
  resolves the FULL STREET ADDRESS first, unboxed, with city, state (where
  derivable) and country appended only where the address lacks them, and
  falls back to name + city + country (boxed to the city) only when the
  address returns nothing usable. The 40 km city check is kept on every
  step; city centre last. The state comes from the address postcode line
  (subdivisionCode, "KS 66203") or from a qualifier the city string
  carries ("Portland, Maine"); the city-centre query carries it too, which
  is the actual fix: "Shawnee, United States" resolved to Shawnee,
  Oklahoma, the box around it excluded the Kansas address, and the row
  fell to the wrong centre 400 km out. geocodeBarDetailed reports the
  method (address, name, city-centre). Unit tests on the query builders.
  Callers unchanged: manage-bar create, submissions, bar-submission.
- ADMIN ROUTE /api/admin/geocode-bars: gains barIds, since, force (rows
  that already have coordinates), dryRun, minMoveKm; every result carries
  before, after, method and movedKm; writes stamp updated_at and
  revalidate. Chunk by ids (15 per call) to stay inside the function
  timeout.
- WEEK RE-RUN: all 121 rows inserted since 2026-09-14 re-geocoded dry.
  118 resolved by address, 2 by name, 1 city centre. Moved 3 km or more:
  ONE, zuma-hong-kong, 12.6 km, and that is the new result being WORSE
  (name search after the Landmark address returned nothing usable; the
  stored Central point is right), so nothing was applied. drastic-measures
  came back unchanged, i.e. the address-first path agrees with the
  Nominatim fix. Under 3 km: horn-cantle-saloon 0.9, qora 1.2 (address
  refinements, not applied), drinking-and-healing 0.5 (centre). Drastic
  Measures was the only namesake landing in the week.
- SAME-NAME CITIES, interim: jewel-box stays "Portland, Maine". cityLabel
  returns a city that already carries its subdivision unchanged, so the
  city page reads "Best Cocktail Bars in Portland, Maine" and the profile
  "Portland, Maine, United States"; nothing doubles. Added to the
  address-check allowlist with the reason (audit 0 flags, 3 suppressed).
- NEXT STRUCTURAL ITEM (Roman, 2026-09-15), NOT BUILT: for US (and
  Canada) cities, derive the city slug from city plus state whenever
  another active row shares the city name in a different state, so the
  stored city stays "Portland" and the pages split as portland-or and
  portland-me. The city page keys on the bare city string across ALL
  countries (src/app/bars/city/[city]/page.tsx matches toUrlSlug(city)
  only), so the rule must also split on COUNTRY. Inventory today, 1,348
  active rows:
  * LIVE COLLISIONS (two): Portland (scotch-lodge OR; jewel-box ME, held
    apart only by the interim qualifier) and Birmingham (adios, bygones
    AL; passing-fancies UK) which already renders as ONE page,
    /bars/city/birmingham, listing all three, title "Best Cocktail Bars
    in Birmingham".
  * NEAR-COLLISIONS (one state present, a well-known namesake elsewhere):
    Charleston SC (WV), Columbus OH (GA), Decatur GA (IL, AL), Durham NC
    (UK), Lafayette LA (IN, CA), Lawrence KS (MA), Shawnee KS (OK),
    Montpelier VT (France), Oakland CA, Prospect KY, Louisville KY, Miami
    FL (OK), Santa Monica CA. Any second row in the namesake collides on
    insert.
  * STATE NOT DERIVABLE from the address (no "ST 12345" line), which the
    rule needs: Detroit 1, New Orleans 3, New York 1, San Diego 2,
    Seattle 1, Washington DC 1 row. Fix the addresses or fall back to the
    majority state of the city (subdivisionForCity already votes).
  * STRING VARIANTS, separate defect: Kraków and Krakow both exist as
    city strings (two pages for one city).
  * Also needed: redirects for the slugs that change (portland ->
    portland-or), the sitemap and the seo-cities table keyed by city.

## 2026-09-15 - US JBF wave 4: 28 inserted (22 cocktail, 6 wine), 19 new city pages
- Source: "Claude outputs/us-jbf-wave4-verified.md"; every row a James
  Beard Outstanding Bar semifinalist or nominee 2023 to 2026. Every entry
  re-checked against JBF's own page for its year and stage before insert:
  semifinalists 2026 /stories/james-beard-award-semifinalists-2026, 2025
  /blog/the-2025-james-beard-award-semifinalists, 2024
  /blog/the-2024-james-beard-awards-semifinalists, 2023
  /blog/the-2023-james-beard-awards-semifinalists; nominees 2026
  /stories/james-beard-awards-restaurant-and-chef-nominees-2026, 2025
  /stories/2025-james-beard-awards-restaurant-and-chef-nominees, 2024
  /blog/the-2024-restaurant-and-chef-award-nominees, 2023
  /stories/the-2023-james-beard-restaurant-and-chef-awards-nominees (JBF's
  URL pattern changes every year; these are the ones that resolve). Stored
  as jbf nominee 200, title "Outstanding Bar (Semifinalist)" or
  "Outstanding Bar" for a finalist, the existing style. Bryant's also
  carries totc 2026 winner, Timeless U.S. Award, 790 (the Timeless
  International precedent), confirmed on TOTC's winners page. Diffed by
  slug and folded name plus city: all 28 clear. Three JBF venues excluded
  for cause per the file (Leyenda and Esters closed, Webb's City Cellar a
  brewery tasting room).
- SUBTYPES: Wine Bar on the six wine bars (type stays Cocktail Bar per
  the file), Distillery Bar on the-bar-at-willett and
  barr-hill-cocktail-bar (added to bar-type.ts and the admin options
  earlier today).
- CITY: jewel-box stored as "Portland, Maine". The one existing Portland
  row (scotch-lodge) is Oregon and a shared "Portland" string would merge
  the two cities (one city page, Maine in Scotch Lodge's nearby list).
  Only precedent for a qualifier is "Washington DC". Page is
  /bars/city/portland-maine; the address audit flags the row for the
  city/address mismatch until Roman confirms or renames the qualifier.
- GEOCODE: 28/28 on insert, but drastic-measures landed in Shawnee,
  Oklahoma (35.49, -97.02); re-geocoded from the full street address
  (Nominatim: 5817 Nieman Road, Shawnee, Johnson County, Kansas) to
  39.0232, -94.7144 and updated. The other 27 sit at their cities.
- NEIGHBORHOOD: stored on 15 rows the file gives as stated (Downtown for
  john-browns-underground, bittersweet, wolf-tree, wild-child-wines; Lone
  Mountain Ranch, Cannery District, Willett Distillery, Norton Commons,
  Market Square, Starland District, Arts District (garagiste), Midtown,
  Uptown, Davis Square). The file's 13 inferred went to admin_notes only;
  barr-hill's "Winooski riverside" is a description, not a neighborhood,
  noted and not stored.
- ADMIN_NOTES on 25 rows: the file's flags, parking reasons, the three
  KEEP reasons, the inferred neighborhoods, the Portland qualifier.
- PARKED (outreach/parked.txt, 11): john-browns-underground,
  horn-cantle-saloon, post-office-place, las-ramblas, ayahuasca-cantina,
  techo, bittersweet, wolf-tree, garagiste, le-caveau, aldo-sohm-wine-bar.
  17 addresses stored for the send scripts.
- AFTER INSERT: all 28 serve 200 (le-caveau threw one 500 on first
  render, 200 on every retry); sitemap-bars.xml 1,348 profiles = 1,348
  active rows, all 28 present; address check 1 flag (jewel-box, above).
  NEW CITY PAGES (19), all 200 and in the sitemap: shawnee, lawrence,
  big-sky, bozeman, salt-lake-city, bardstown, prospect, brownsville,
  st-louis, portland-maine, durham, raleigh, providence, baltimore,
  white-river-junction, montpelier, charleston, somerville, lafayette.
  Dallas, Austin, New York, Milwaukee, Savannah, Las Vegas and
  Philadelphia gained rows.

## 2026-09-15 - One tile per org per year; prose one sentence per org; national-stage pass; neighborhood column
- TILES (src/lib/accolades.ts tilesFor): each org and year pair renders at
  most once. Pretty Penny showed two "TOTC SPIRITED 2024" tiles for its two
  2024 categories; now one. The tile goes to the higher-scored entry, and
  where scores tie (the Spirited Awards ladder is all 590) to the further
  stage: Top 4 over Top 10 over regional honoree (stageOf). The top-three
  rule applies after the dedupe. Both entries stay on the row, in the prose
  and in schema.org/award. First cut put stage before score, which handed
  Cobbler & Crew's 2023 tile to the category win (524) over the No. 2
  placing (558) and pushed it to third; corrected to score first.
- PROSE (src/lib/accolade-sentences.ts rewritten): one sentence per org,
  years and categories grouped, the org with the newest honor first. The
  stage word comes from the title parenthetical: regional honoree, Top 10
  nominee, Top 4 finalist (TOTC's word), semifinalist, else nominee; the
  word "nominee" is never written for a regional honoree. Subject names:
  "The Spirited Awards", "The James Beard Awards", "The Bartenders' Choice
  Awards"; other bodies exactly as stored. Verified live: Pretty Penny
  reads exactly Roman's sentence; Handshake four sentences (na50b, w50b,
  Shaker grouped "No. 1 in 2023 and 2024 and No. 3 in 2025", TOTC win);
  Cobbler & Crew one sentence covering three placings, the 2022 listing and
  four category wins. Pretty Penny's description lost the composed line
  "Its Spirited Awards run includes back-to-back regional nominations"
  (the only row carrying it). src/lib/bar-fallback.ts (meta description
  for rows with no hand-written description) is untouched.
- INDEXING TASK: moved to 16:30 PT (cron 16:23 local plus the task
  runner's fixed 395 s jitter) so the rolling 24-hour quota has cleared
  from morning submissions. Prompt now ends every run with a log row
  whatever stops it; a quota hit on the first request logs "quota not yet
  reset, 0 requested". Roman clicks Run now once to pre-approve the tools.
- NATIONAL-STAGE PASS: every active U.S. row with a totc 2026 entry checked
  against TOTC's 2026 U.S. Top 10 nominee page, Top 4 finalists page and
  winners page (parsed per category, matched by folded name and city with
  Brooklyn = New York). 26 rows changed, the regional entry kept on every
  row and the higher stage added with its own source:
  Top 10 added on chandelier-bar, dolores, eleven11, highball-phoenix (Bar
  Team), junebug, lady-jane (Bar Team), midnight-rambler,
  raines-law-room-william, the-sazerac-bar, viridian, white-limozeen, and
  on prior winners with no 2026 entry double-chicken-please, mirate
  (Restaurant Bar; its World's Best Spirits Selection Top 4 was already
  on), overstory, pacific-cocktail-haven, service-bar-dc (Cocktail Bar,
  beside its Bar Team win), true-laurel, yacht-club-denver. Top 4 added on
  bar-snack (Bar Team, beside its Cocktail Bar win), sip-guzzle (two
  categories), superbueno (two), the-peach-crease-club; kimball-house and
  sunnys-steakhouse moved from Top 10 to Top 4 (both on the Top 4 page).
  The four wave 3 rows whose national entry had REPLACED the regional one
  (kimball-house, sunnys-steakhouse, the-manor-bar, cobra Bar Team) got
  the regional entry back. Shape per category and year: regional plus the
  highest confirmed stage, no intermediate. Every face checked with the
  one-tile rule: no org-year repeats, three tiles at most.
  NOT DONE, ROMAN'S CALL: nine Top 10 venues exist as active rows with NO
  totc entry at all (outside the pass's scope): daisy-margarita-bar,
  thunderbolt, dear-irving (confirm it is Dear Irving on Hudson, not the
  Gramercy original), semiprecious-denver, amazonia-dc, bar-madonna,
  martinys, nickel-city. "donna" (New York) is NOT TOTC's Donna's
  (Houston); leave it. Daisies (Chicago) and Hungry Eyes (New Orleans)
  have no row.
- NEIGHBORHOOD: column live (Roman ran the migration). Backfilled on 18
  wave 3 rows the file gives without an inferred flag (bar-chenin,
  standby-detroit, reserve-101, johnnys-gold-brick, adios, the-snug, kru,
  the-butterscotch-den, the-mountaineering-club, tikehau-lounge,
  jojos-beloved, bar-ana, lpm-miami, sunnys-steakhouse, no-goodbyes,
  cobra, pufferfish, the-grey). The nine wave 3 inferred (eight listed in
  the file plus aft-cocktail-deck's The Strip) and shipwreck-bar's "no
  formal neighborhood" went to admin_notes only. Wave 2's 22 neighborhoods
  went to admin_notes only, because that file never recorded stated
  versus inferred; Roman can promote them. Wave 1's file has no
  neighborhood field. Code: nearby block shows the neighborhood in place
  of the street where present (placeOf in src/lib/nearby.ts, verified on
  The Snug: "East Sacramento", "Oak Park"); PUBLIC_EDITORIAL_COLUMNS in
  private-columns.ts records it as public by decision with a test;
  normalize.ts trims it. Reads use select('*') so no select changed.
- FOLLOW-UP (Roman, same day): TOTC 2026 entries added to seven of the
  rows above at the stage the Top 10 page gives, sourced to it:
  daisy-margarita-bar and semiprecious-denver (Best New U.S. Cocktail
  Bar), thunderbolt and martinys (Best U.S. Cocktail Bar), amazonia-dc and
  bar-madonna (Best U.S. Restaurant Bar), nickel-city (Best U.S. Bar
  Team). dear-irving SKIPPED: the row is the Gramercy original (55 Irving
  Pl); TOTC's honoree is Dear Irving on Hudson at the Aliz Hotel, a
  separate venue with no row. donna left alone (not TOTC's Donna's,
  Houston). GAP LIST, no row: Daisies (Chicago), Hungry Eyes (New
  Orleans), Dear Irving on Hudson (New York), Donna's (Houston).
  Wave 2 neighborhoods: fourteen promoted to the column on Roman's word
  (bar-kabawa, birds, crown-shy, gage-tollner, lighthouse-bk, nubeluz,
  raines-law-room-william, capri-club, damn-i-miss-paris, lucia,
  bar-maritime, cavana, starlite-sf, viridian), the pending note removed
  from their admin_notes; the other eight (dolores, millys,
  lobby-bar-hotel-chelsea, real-charmer, not-no-bar, kato, baby-gee,
  tallboy) re-noted as inferred, not backfilled. 32 rows carry the column.
- SUBTYPE: "Distillery Bar" added to TYPE_PRIORITY (bar-type.ts, leads
  like Whiskey Bar) and the admin TYPE_OPTIONS, for The Bar at Willett and
  Barr Hill in wave 4. Wave 4 itself NOT run: "Claude outputs/
  us-jbf-wave4-verified.md" is not in the folder.

## 2026-09-15 - US metro wave 3: 31 inserted across 12 cities plus five single-venue cities
- Source: "Claude outputs/us-metro-wave3-verified.md"; every row a 2026
  Spirited Awards U.S. Regional Top 10 Honoree, all 31 names re-checked
  on TOTC's own 2026 U.S. regional page before insert. Diffed by slug and
  folded name plus city: all 31 clear.
- HAWAII CONVENTION: the one existing Hawaii row (bar-leather-apron) uses
  the town, Honolulu, not the island; Kihei (tikehau-lounge) and
  Kailua-Kona (shipwreck-bar) follow it. Thirteen new city pages:
  st-clair-shores, minneapolis, birmingham, sacramento, kihei,
  kailua-kona, decatur, miami-beach, columbus, milwaukee, fairhope,
  savannah, montecito (all under /bars/city/, all 200, all in the
  sitemap). Detroit, Houston, Seattle, Las Vegas, Atlanta, Miami and
  Washington DC gained rows.
- NAMES per the file (venue spelling over TOTC's): ADIÕS, Bar Chenin,
  Bar ANA, Bygones Cocktail Bar, JoJo's Beloved Cocktail Lounge, Grey
  Ghost Detroit, Kru (legal name in admin_notes), LPM Miami (legal name
  in admin_notes), Shipwreck Bar, Sunny's Steakhouse. Ten restaurant bars
  and eight hotel bars in as Cocktail Bar + subtype.
- ACCOLADES: 2026 regional honorees as totc nominee 590, source the 2026
  U.S. regional page. Prior-year honors as separate totc 2025 nominee
  entries at 555 (the 2025 Top 4 decay), source the 2025 U.S. regional
  page, on the-butterscotch-den, the-mountaineering-club and
  jojos-beloved, each confirmed on that page. Meteor carries jbf 2024
  Outstanding Bar (Semifinalist) at 200, confirmed on jamesbeard.org
  (/blog/the-2024-james-beard-awards-semifinalists; the /stories/ pattern
  used for 2026 does not exist for 2024). COBRA: winner, Best U.S.
  Restaurant Bar 2026, 810, confirmed on TOTC's winners page ("Cobra,
  Columbus, OH"). The insert attached only the file's Bar Team line, so
  the winner entry went on by a manage-bar update a minute later.
- NATIONAL STAGE, three deviations from the file, all from TOTC's own
  2026 Top 10 U.S. nominee page: kimball-house as the file said, plus
  sunnys-steakhouse (Best U.S. Restaurant Bar), the-manor-bar (Best U.S.
  Hotel Bar) and cobra's Bar Team honor all reached the national Top 10.
  Stored as "<category> (Top 10 Nominee)", nominee 590, source the Top 10
  page, replacing the regional entry for that category. The deviation is
  recorded in each row's admin_notes.
- ADMIN_NOTES written on insert for 24 rows: the file's address and data
  flags, the parking reason on every parked row, the KEEP reasoning on
  the two chain-property keeps, and the national-stage deviations.
  neighborhood is not a bars column; the file's neighborhoods (stated and
  inferred) are not stored anywhere.
- PARKED (outreach/parked.txt): the-best-kept-secret, bar-mara, adios,
  kru (nothing published); aft-cocktail-deck (Wynn), shipwreck-bar and
  the-manor-bar (Rosewood resort inboxes), pufferfish (hotel sales inbox).
  KEEP recorded for the-mountaineering-club (Graduate/Hilton,
  venue-specific inbox) and no-goodbyes (LINE, venue-named inbox on the
  hotel domain). 23 addresses stored for the send scripts.
- AFTER INSERT: all 31 geocoded on insert, every one within 22 km of its
  city reference point (shipwreck-bar 21.4 km north of Kailua-Kona is
  Kona Village at Kaʻūpūlehu; tikehau-lounge 8.8 km is Wailea); all 31
  serve 200; sitemap-bars.xml lists 1,320 profiles = 1,320 active rows;
  address check 0 flags.
- BACKLOG FOUND, NOT DONE: a rough sweep of the same Top 10 page against
  existing U.S. rows shows about a dozen stored as "(Regional Honoree)"
  only for a category where TOTC lists them in the national Top 10
  (highball-phoenix, lady-jane, chandelier-bar, midnight-rambler,
  raines-law-room-william, the-sazerac-bar, white-limozeen, viridian,
  dolores, eleven11, junebug, the-peach-crease-club) and several prior
  winners with no 2026 entry at all. Needs a proper pass with Roman's
  call on it.

## 2026-09-15 - US metro wave 2: 22 inserted (New York 10, LA area 7, Bay Area 5)
- Source: "Claude outputs/us-metro-wave2-verified.md"; every row a 2026
  Spirited Awards Regional Top 10 Honoree verified on the venue's own
  channels. Diffed by slug and folded name plus city: all 22 clear.
- BROOKLYN CONVENTION confirmed against the seven existing Brooklyn rows
  (nightmoves, clover-club, maison-premiere, bar-madonna, ...): city
  "New York", borough in the address. Followed for dolores, millys,
  gage-tollner, lighthouse-bk. New cities as the file decided: Santa
  Monica (not-no-bar), Long Beach (baby-gee), Oakland (tallboy,
  viridian).
- Admissions as decided: six restaurant bars as Cocktail Bar + Restaurant
  Bar (crown-shy, gage-tollner, lighthouse-bk, lucia, kato, viridian);
  six hotel bars as Cocktail Bar + Hotel Bar. Two low-confidence rows in
  with flags (millys, real-charmer): short descriptions sourced only to
  the awarding body, no website stored for millys (password-locked).
- ACCOLADES: totc 2026 nominee with the parenthetical title on every
  row; tallboy carries two (Best U.S. Cocktail Bar, Best U.S. Bar Team).
- ADMIN_NOTES written on insert for the eleven flagged rows (bar-kabawa,
  dolores, millys, real-charmer, nubeluz, lighthouse-bk, tallboy,
  viridian, lucia, crown-shy, gage-tollner), the file's address and data
  flags verbatim in substance.
- PARKED (outreach/parked.txt): lobby-bar-hotel-chelsea, starlite-sf,
  crown-shy, lighthouse-bk, damn-i-miss-paris, viridian, millys,
  real-charmer; nubeluz under the relationship lot (Jose Andres Group),
  its venue-specific address stored but never mailed.
- AFTER INSERT: all 22 geocoded on insert, every one within 36 km of its
  metro centroid (Long Beach 35.7 km from the LA centroid is Long Beach);
  all 22 serve 200; sitemap-bars.xml lists 1,289 profiles = 1,289 active
  rows; address check 0 flags.

## 2026-09-15 09:06 PT - Batch 13 SENT (27/27), fired directly on Roman's call
- The Wednesday date was a day-counting error; Tuesday 09:00 PT was the
  intended window. outreach/batch13-runner.sh run directly at 09:06 PT:
  batch13-phoenix 9 SENT, batch13-nashville 6 SENT, batch13-metro1 12
  SENT, zero failures, every send with a Resend id in
  outreach/batch13-send.log and 27 lines in outreach/sent-log.txt. The
  runner unloaded and deleted com.barmagazine.batch13.plist, so the
  Wednesday trigger cannot fire; launchctl shows only batch14-w1,
  batch14-w2 and address-audit. Batch 14 stays on Thursday 21:00/23:00.

## 2026-09-14 (PT) - Batch 13 and 14 armed; Alibaba AS45102 challenge rule
- EYEBALL CALLS (Roman): don-woods-say-when PARKED (hotel reservations
  inbox, the-cruise-room class); century-grand kept (operator inbox,
  decided 09-11); the-elysian-bar kept (boutique single-property inbox,
  DUKES precedent). Final counts: batch13-phoenix 9, batch13-nashville 6,
  batch13-metro1 12 = 27; batch14-asia-enriched 1 + 2 = 3.
- ARMED via launchd, all local time: com.barmagazine.batch13 fires
  outreach/batch13-runner.sh Wednesday 2026-09-16 09:00 (three lanes in
  sequence, each --batch labelled, slug files outreach/batch13-*.slugs);
  com.barmagazine.batch14-w1 Thursday 2026-09-17 21:00 (the-hudson-rooms)
  and com.barmagazine.batch14-w2 23:00 (smoke-bitters, barc). Runners
  unload and delete their own plist after the send so a reload cannot
  fire twice. net-preflight runs inside send-upsell.mjs. `launchctl list`
  shows all three loaded beside address-audit.
- FIREWALL: Roman asked for an ASN 132203 challenge for the Singapore
  scraper. That rule already existed (active since 09-01, ~130 hits that
  day) and had NOT caught it; the Firewall Traffic view attributes the
  scraper's 3.9k requests to Alibaba (US) Technology, AS45102. Added
  "Alibaba Cloud SG scraper (AS45102) challenge", challenge not deny,
  config version 3. Plain fetches from the Mac unchanged (200 on home,
  a profile, robots.txt). Both rules and the ASN note recorded in
  data-checks.md.
