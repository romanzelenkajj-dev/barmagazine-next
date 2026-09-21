# Report: 25-wave5-insert-go (2026-09-16, 13:45 to 13:58 PT)

Done: 11 rows inserted on Roman's relayed go, every post-insert check run, data files committed (commit 6b76fbf). No source code changed in this task; the wave tooling was committed under task 24 (d501b30).

## Roman's two decisions, applied

- Bar Marmont: not inserted. Recorded as permanently closed in the wave file's block (status HOLD, "do not re-add") and in a new "DO NOT RE-ADD" section at the end of claude/us-gap-analysis.md (the task's us-award-gap-list.md does not exist; the gap analysis is the file later waves diff against).
- Hard Shake: inserted with Roman's values. Address 3752 S Las Vegas Blvd, Las Vegas, NV 89158; phone +1 702 590 8888; hours "Daily 5pm-11pm"; website the exact Hilton dining URL for Hard Shake (captured by the research pass); Instagram null (the only candidate account is private); reservations URL null (not captured); type Hotel Bar; venue Waldorf Astoria Las Vegas; description 96 words from Hilton's own copy (23rd floor, Strip views, hand-shaken signature cocktails, a small menu of global dishes, Rockwell Group room), lint clean, no dashes, no food negation. admin_notes carries "hours per the Google Business profile 2026-09-16" through the block's status line.

## The 11 rows (slug, id, state, coordinates)

| slug | id | state | lat, lng |
|---|---|---|---|
| round-robin-bar | 89c3d99c-2720-4f7f-8d90-366ed47f9e0f | DC | 38.896625, -77.032279 |
| hmf | bea7a3e4-019f-4415-b314-c1ee3fec33ca | FL | 26.714454, -80.033634 |
| blind-duck | 05796830-0374-45aa-9693-75612afd397f | MA | 42.348404, -71.07503 |
| the-living-room-dewberry | 26a16e4b-da5a-48e5-ae82-f46270c39265 | SC | 32.78787, -79.934566 |
| z-bar | 512c026b-3c84-4270-bb98-5e8708fe09d7 | IL | 41.896127, -87.624997 |
| salon-salon | ab75b079-b300-4d83-9ba3-f1d55dc6ba5e | LA | 29.948874, -90.072069 |
| tonga-room | 60894787-2d6e-40f1-8c07-eacf7752558b | CA | 37.792275, -122.410431 |
| hey-love | 88e0ff21-2a73-48be-a2a4-4adac13c89bf | OR | 45.522787, -122.65622 |
| polo-lounge | fb3a53f4-cfae-45c4-bda9-ba0cf4794681 | CA | 34.08133, -118.414244 |
| alle-lounge-on-66 | 51859291-814f-4bfb-88de-f34bb43a8a70 | NV | 36.133154, -115.16415 |
| hard-shake | 41147168-4590-4321-bf82-54a5377b3c00 | NV | 36.106028, -115.174635 |

All type Hotel Bar, tier free, active, the hotel stored as "Venue: <hotel>" in admin_notes with the source URLs. The create path geocoded every row by the address method on insert and derived the state from the address.

## Post-insert sequence, results

- State column: scripts/backfill-state.mjs, 456 US/CA rows, 0 to set, 0 underivable.
- Geocode re-run through /api/admin/geocode-bars with force and dryRun on the 11 ids: all 11 by the address method, 0.0 km moved. Nothing applied.
- City-index purge: done by the create path (revalidateBarPages purges the city-index tag and the city and country pages).
- Coordinates missing: npm run audit:coords reports 10, all of them the ten rows held for a manual look in task 16; none from this wave.
- Description lint: 1455 rows, 0 food-negation hits. Address audit: 0.
- Sitemap: the CDN's cached copy of sitemap-bars.xml (one-hour s-maxage) still listed the pre-wave 1348 profile URLs plus the two new city pages; a fresh render (cache-busting query) lists 1359 profile URLs = 1359 active rows.
- Redirects: untouched (no slug changed; the-living-room-dewberry is a new slug beside New Delhi's the-living-room).
- New city pages live: /bars/city/beverly-hills (Polo Lounge) and /bars/city/palm-beach (HMF), both 200 and in the sitemap. /bars/city/portland-or lists Hey Love, /bars/city/charleston lists The Living Room.
- Hey Love: the Spirited 2023 tile renders (winner tier) and the credentials line reads "Winner of Best U.S. Hotel Bar at the 2023 Spirited Awards."
- Indexing queue: 13 items appended to claude/indexing-queue.json as pending (the 11 profiles and the two city pages, the latter with slug "city/<slug>" so the URL resolves to /bars/city/<slug>; note in each item).

## Flags carried from the wave file

Round Robin is pouring from the hotel's Lincoln Library until the fall (admin_notes); Salon Salon's own site and the hotel disagree on the street number and phone (own-site values stored); Tonga Room's hotel page prints two Wed-Thu closing times (10pm stored) and warns of full closures and buyouts; Polo Lounge publishes only meal-period hours; three rows carry hotel-wide inboxes (blind-duck, the-living-room-dewberry, salon-salon), parked for outreach.
