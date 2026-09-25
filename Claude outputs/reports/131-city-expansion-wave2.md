# Task 131: city expansion, wave 2 (US mid-tier cities)

Roman, 2026-09-24: "new US mid-tier cities, 6 bars each: Richmond, Asheville, Tucson, Indianapolis, Cincinnati, Buffalo, San Antonio, Orlando, Oklahoma City, Boise, Memphis, Honolulu, Albuquerque. Scottsdale goes into the Phoenix metro. Same procedure, same rules and report format as 130, photos staged on a contact sheet."

## Outcome

74 bars inserted and live across 13 cities. Every city now has a directory page and a best-bars page, both confirmed 200 on barmagazine.com. Eleven cities reached six bars; Buffalo and Albuquerque have five (see "Short cities" below).

| City | Before | Added | Now | Best-bars page | Slugs added |
|---|---|---|---|---|---|
| Albuquerque | 1 | 4 | 5 | [/best-bars/albuquerque](https://barmagazine.com/best-bars/albuquerque) "The Best Bars in Albuquerque" (top five shown, 2 qualify) | apothecary-lounge-albuquerque, daydream-rum-bar-albuquerque, g-toti-albuquerque, the-copper-lounge-albuquerque |
| Asheville | 0 | 6 | 6 | [/best-bars/asheville](https://barmagazine.com/best-bars/asheville) "The 5 Best Bars in Asheville" | character-study-asheville, crucible-asheville, daytrip-asheville, little-jumbo-asheville, the-crow-and-quill-asheville, the-golden-pineapple-asheville |
| Boise | 0 | 6 | 6 | [/best-bars/boise](https://barmagazine.com/best-bars/boise) "The Best Bars in Boise" (top five shown, 1 qualify) | bar-please-boise, hap-hap-lounge-boise, press-and-pony-boise, suite-104-boise, the-mode-lounge-boise, thick-as-thieves-boise |
| Buffalo | 0 | 5 | 5 | [/best-bars/buffalo](https://barmagazine.com/best-bars/buffalo) "The Best Bars in Buffalo" (top five shown, 0 qualify) | equal-parts-buffalo, high-violet-buffalo, lucky-day-whiskey-bar-buffalo, saint-neri-buffalo, vue-rooftop-lounge-buffalo |
| Cincinnati | 0 | 6 | 6 | [/best-bars/cincinnati](https://barmagazine.com/best-bars/cincinnati) "The Best Bars in Cincinnati" (top five shown, 1 qualify) | ghost-baby-cincinnati, japps-cincinnati, longfellow-cincinnati, lost-and-found-otr-cincinnati, overlook-lodge-cincinnati, somerset-cincinnati |
| Honolulu | 1 | 5 | 6 | [/best-bars/honolulu](https://barmagazine.com/best-bars/honolulu) "The 6 Best Bars in Honolulu" | eleven-honolulu, ep-bar-honolulu, pint-jigger-honolulu, podmore-honolulu, skull-crown-trading-co-honolulu |
| Indianapolis | 0 | 6 | 6 | [/best-bars/indianapolis](https://barmagazine.com/best-bars/indianapolis) "The Best Bars in Indianapolis" (top five shown, 3 qualify) | astrea-indianapolis, nowhere-special-indianapolis, strange-bird-indianapolis, the-ball-and-biscuit-indianapolis, the-inferno-room-indianapolis, the-vault-indy-indianapolis |
| Memphis | 0 | 6 | 6 | [/best-bars/memphis](https://barmagazine.com/best-bars/memphis) "The Best Bars in Memphis" (top five shown, 0 qualify) | art-bar-at-crosstown-arts-memphis, bar-dkdc-memphis, cameo-memphis, hu-roof-memphis, memphis-whistle-memphis, the-dame-memphis |
| Oklahoma City | 0 | 6 | 6 | [/best-bars/oklahoma-city](https://barmagazine.com/best-bars/oklahoma-city) "The Best Bars in Oklahoma City" (top five shown, 2 qualify) | good-for-a-few-oklahoma-city, later-bye-oklahoma-city, o-bar-oklahoma-city, palo-santo-oklahoma-city, stag-lounge-oklahoma-city, the-vault-at-the-national-oklahoma-city |
| Orlando | 0 | 6 | 6 | [/best-bars/orlando](https://barmagazine.com/best-bars/orlando) "The Best Bars in Orlando" (top five shown, 4 qualify) | aku-aku-tiki-bar-orlando, dba-orlando, hansons-shoe-repair-orlando, mathers-social-gathering-orlando, sunroom-orlando, the-guesthouse-orlando |
| Richmond | 0 | 6 | 6 | [/best-bars/richmond](https://barmagazine.com/best-bars/richmond) "The Best Bars in Richmond" (top five shown, 3 qualify) | fanboy-richmond, goldwing-richmond, grandstaff-stein-richmond, q-rooftop-bar-richmond, solaire-rooftop-richmond, the-jasper-richmond |
| San Antonio | 0 | 6 | 6 | [/best-bars/san-antonio](https://barmagazine.com/best-bars/san-antonio) "The 6 Best Bars in San Antonio" | bar-1919-san-antonio, sternewirth-san-antonio, tenfold-rooftop-san-antonio, the-esquire-tavern-san-antonio, the-moons-daughters-san-antonio, the-rose-san-antonio |
| Tucson | 0 | 6 | 6 | [/best-bars/tucson](https://barmagazine.com/best-bars/tucson) "The Best Bars in Tucson" (top five shown, 4 qualify) | bar-crisol-tucson, batch-tucson, nightjar-tucson, owls-club-tucson, sidecar-tucson, the-royal-room-tucson |

Before = active rows already in the city: Bar Leather Apron (Honolulu) and Happy Accidents (Albuquerque). "Qualify" is the live level-2 count under the current classifier. Three cities get a numbered title now. Most others fall short because the US mid-tier has few selective lists: no Eater, Infatuation or Time Out cocktail lists for Buffalo, Memphis, Boise or Cincinnati, and local "best of" reader polls (Memphis Flyer) don't count.

**Scottsdale → Phoenix:** draft PR https://github.com/romanzelenkajj-dev/barmagazine-next/pull/90 (one metro-rollup line and tests; also records that Palm Beach stays separate). It's a preview, so it's held for your go. Scottsdale has no bars yet, so nothing changes on the site until one is added.

## Fixes in the same run

- **Missing state on 11 rows.** Admin create takes the state from the address, and 11 addresses carry no ZIP. Those rows were saved with an empty state, which would have split them off their city page. I set the state on each via the admin API: DayTrip, Crucible, The Crow and Quill (NC); Hap Hap Lounge (ID); Equal Parts, VUE (NY); Japp's (OH); Art Bar (TN); Mathers, Hanson's (FL); Goldwing (VA). All 74 rows now carry a state.
- **Em dash in a source title** ("Say Hello to Later Bye—Midtown's Latest Bar"): the converter now removes dashes from source titles as well as from descriptions.

## Audits

- Award claims: 1,960 active bars, 0 problems.
- Description lint (since 2026-09-24): 178 rows, 0 food-negation hits.
- No em or en dashes, no Falstaff mention and no points or award wording in any new description or excerpt.
- Geocoding: all 74 are address-level (Mapbox) and each sits within 12 km of its city's median point. Bar Please! and Thick As Thieves share a point because they are on different floors of 620 W Idaho St. The Guesthouse and Sunroom are next-door neighbours on N Mills Ave.

## How the rows were built

Same procedure and guards as 130. Seven research agents covered the 13 cities (102 candidates, including spares). Every address, hours line and contact comes from the venue's own site, its hotel's page or its own Instagram or Facebook. Every row has dated 2026 evidence that it is open. Descriptions state only what the venue says about itself and name no award. Wave file: `Claude outputs/131-city-expansion-wave2-verified.md`. It passed `wave-insert.mjs` in a dry run (74 of 74, no guard hits) before `--apply`.

**Swapped for a spare, and why**
- Tucson: **The Cork** out, Owls Club in. The Cork is a 1966 steakhouse with a 14-seat bar; Esquire named the bar, but the room isn't cocktail-led.
- Orlando: **Quicksand Bar à Vin** out (natural wine bar, not cocktail-led), D.B.A. in.
- San Antonio: **Hugman's Oasis** out, The Rose in. Hugman's is a real tiki bar, but its 2026 evidence is third-party only (a Fiesta medal and a collector's log). The Rose has a September 2026 calendar on its own site and a Distiller Top 10 listing.
- Oklahoma City: **The Daley** out, Stag Lounge in. The Daley's own page was last updated in 2024, and its only 2026 evidence is Yelp.
- Honolulu: five new bars plus Bar Leather Apron make six, so the spares (Heyday, Lewers Lounge) weren't needed.

## Short cities (your call)

- **Albuquerque (5).** Two candidates are held:
  - **Founders Speakeasy**: its site is password-gated and its Instagram has no address. 622 Central Ave SW comes from Visit Albuquerque, not the venue. Add it if you accept that source.
  - **Still Spirits**: a distillery's downtown tasting room and cocktail bar. It has 2026 evidence on its own site, but it's a distillery room.
- **Buffalo (5).** **Waxlight Bar à Vin** is held. The venue calls itself a wine-focused restaurant with a bar and lounge, and its James Beard 2025 semifinal nod is for the wine programme, so it isn't cocktail-led. The two spares, Vault @ 237 and Billy Club, both describe themselves as restaurants.
- **Daydream Rum Bar** holds North America's 50 Best Bars 2026 **Best Bar Design Award** (a special award, not a ranking). The wave format can't carry it, so it is not in `accolades`. Say if you want it added as an accolade.

## Things worth a look

- **Thick As Thieves**: the photo is polished enough that the researcher asked whether it could be a render. To me it reads as a real photograph.
- **Crucible (Asheville)** has no website; its address, phone and email come from its own Facebook page. **DayTrip** has no website; its address comes from its Instagram bio.
- **The Esquire Tavern** has no staged photo: the only one on its site shows a pint in the foreground.
- **Sundry and Vice** (a spare in Indianapolis and Cincinnati, not inserted): its events page stops taking bookings after June 2026.

## Photos: contact sheet for approval

`outreach/photos-staged/131-contact-sheet.html`: 52 candidates for 34 bars, all from the bars' own sites, cropped 3:2 and staged under `outreach/photos-staged/<slug>/`. Nothing is published. Each approved photo goes live credited "Photo: <Bar name>".

Rejected under the photo rule:
- **Crowds or silhouettes:** The Guesthouse (both), Stag Lounge (both), Skull & Crown.
- **Drink in the foreground:** The Esquire Tavern.
- **Bartender-led:** The Dame #2.
- **Outdoor terrace:** Solaire #2.
- **Bottle-shelf close-ups:** Tenfold #2, Goldwing.
- **Sign wall:** Daydream #2.
- **Private room, not the bar:** Japp's #2.
- **Busy crowd under the conservatory roof:** Somerset #1.
- **Nightjar:** a nude painting dominates the frame.

40 of the 74 bars have no usable own-site interior. Their sites show drinks, people, exteriors, logos or back-bar close-ups, or block downloads (Strange Bird, Suite 104).
