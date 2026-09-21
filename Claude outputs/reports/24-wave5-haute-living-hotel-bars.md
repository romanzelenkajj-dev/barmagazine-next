# Report: 24-wave5-haute-living-hotel-bars (2026-09-16, 13:05 to 13:50 PT)

STOPPED BEFORE INSERT, awaiting Roman's go in chat. Twelve new public bar pages are a publish, and the queue guard says nothing is published outward on the strength of a file. Everything up to the insert is done and checked; the insert is one command away (below), and the post-insert steps run right after it.

## What is ready

The wave file: "Claude outputs/haute-living-wave5-verified.md" (the wave 4 format: one block per bar with name, city, address, venue, website, hours, phone, email, Instagram, type Hotel Bar, description, accolade, status, source, plus a DATA FLAGS section). Every value is from the bar's own site, the hotel's page for the bar, or the bar's own Instagram; the Haute Living list is the admission reason only (editorial, not an accolade) and is not mentioned anywhere in the rows.

10 OPEN, ready to insert: round-robin-bar, hmf, blind-duck (venue spelling "The Blind Duck"), the-living-room-dewberry (distinct slug; the-living-room is New Delhi), z-bar, salon-salon, tonga-room (name "Tonga Room & Hurricane Bar"), hey-love, polo-lounge, alle-lounge-on-66.

2 HOLD, not inserted:
- bar-marmont: chateaumarmont.com has no Bar Marmont page or mention at all (its only dining link goes to Resy). No venue-owned source confirms the bar is open in 2026; review sites say closed, which is not used as a fact but agrees with the silence.
- hard-shake: the official hilton.com page is behind a bot wall (fetch and browser); the only Instagram candidate is private and unconfirmed. Its block holds unverified snippet data and is marked HOLD.

Accolades: one, Hey Love, Tales of the Cocktail 2023 Best U.S. Hotel Bar, winner, verified on talesofthecocktail.org's 2023 winners page (stored shape: org "Tales of the Cocktail Spirited Awards", org_key totc, winner, 810, source URL). The 2023 to 2026 Top 10, regional, Top 4 and winner pages were checked for all twelve; none of the other eleven appear.

## Checks run on the file (no writes)

- Geocode dry run with the real address-first geocoder and the 40 km guard (scripts/run-wave-geocode-dry.mjs, new): all twelve resolve by the ADDRESS method; distances from the city centre 0.4 to 4.5 km for the ten (bar-marmont 11.9 km, hard-shake 7.7 km, both held anyway). None fell to the name search or the city centre.
- Description lint: 90 to 120 words each, no em or en dash anywhere in the file, zero food-negation hits (the audit:descriptions patterns run over the file's descriptions). Two edits of mine after review: Hey Love's closing "and was named Best U.S. Hotel Bar at the 2023 Spirited Awards" removed (that is the tile, and task 06 flagged exactly these tails), and Round Robin's time-bound "since July 2026 the bar has been pouring from the Lincoln Library" sentence moved out of the description (it stays in the flags and will go into admin_notes).
- Slugs: none of the twelve exist in bars (active or inactive).
- City keys: Beverly Hills and Palm Beach are new cities (no rows anywhere, no folded collision), so two new city pages; Charleston has one SC row (graft), Portland has ME and OR rows so Hey Love joins /bars/city/portland-or; Washington DC, Boston, Chicago, New Orleans, San Francisco and Las Vegas exist. The create path derives bars.state from the address (DC, FL, MA, SC, IL, LA, CA, OR, CA, NV).
- Insert dry run (scripts/wave-insert.mjs, new, dry run by default): ten payloads parse cleanly (type Hotel Bar, tier free, is_active true, admin_notes "Venue: <hotel>. Source: <URLs>"), the two HOLD blocks are skipped, Hey Love's accolade renders in the stored shape.

Data flags worth Roman's eye (full list in the file): Round Robin is in a temporary room until the fall; Salon Salon's own site and the hotel disagree on the street number and phone (own-site values stored); Tonga Room's hotel page prints two Wed-Thu closing times (the fetched page's 10pm stored) and warns of full closures and buyouts; Polo Lounge publishes only meal-period hours; four rows carry hotel-wide inboxes (blind-duck, the-living-room-dewberry, salon-salon and the held bar-marmont), parked for outreach.

## The insert, when Roman says go

```bash
cd /Users/romanzelenka/barmagazine-next && node scripts/wave-insert.mjs "Claude outputs/haute-living-wave5-verified.md" --apply
```

Then, in order: node scripts/backfill-state.mjs (expect zero nulls), the geocode re-run through /api/admin/geocode-bars in one chunk of 10 with force and dryRun (expect address method, small moves), npm run audit:coords (expect 0), npm run audit:descriptions, npm run audit:addresses, the sitemap-bars count (+10) and the two new city pages (/bars/city/beverly-hills, /bars/city/palm-beach) live, the ten slugs appended to claude/indexing-queue.json as pending, changelog and this report updated with ids.

## Tooling added (committed, d501b30)

scripts/wave-file.mjs (parser for the verified wave files), scripts/run-wave-geocode-dry.mjs plus wave-geocode-dry.ts (the real geocoder on a wave file, writes nothing), scripts/wave-insert.mjs (manage-bar create per block, dry run unless --apply, HOLD blocks skipped, accolade lines in the stored shape).
