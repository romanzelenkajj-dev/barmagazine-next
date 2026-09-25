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

## Resolved 2026-09-24 (Roman)

- **#90 merged and live:** `/bars/city/scottsdale` redirects (308) to `/bars/city/phoenix`.
- **Albuquerque is now 7.** Still Spirits went in: a distillery's cocktail bar counts as cocktail-led, and only taprooms are excluded. Founders went in once its address was confirmed on its own Google Business profile: 622 Central Ave SW, NM 87102, inside El Rey Liquors, linking to foundersabq.com, phone (505) 582-2693. Record: `Claude outputs/131-city-expansion-wave2-batch2-verified.md`. Waxlight stays out as a restaurant.
- **Daydream Rum Bar accolade:** North America's 50 Best Bars 2026, SevenRooms Best Bar Design Award (kind winner). Source: https://www.the50.com/bars/best-in-north-america/awards/best-bar-design.html. Score is 600 until the monthly rescoring. Award-claims audit: 1,962 active bars, 0 problems.

## Photos published (Roman approved 34, 2026-09-24)

One per bar, credited "Photo: <Bar name>" (checked live on Fanboy). The unchosen candidates and the 131 staging folder and contact sheet are deleted.

| Slug | Source image (bar's own site) |
|---|---|
| apothecary-lounge-albuquerque | https://assets.milestoneinternet.com/cdn-cgi/image/f=auto/sf-brown-real-estate/hotel-parq-central-394667-1/siteimages/apothecary-lounge/hotel-parq-central-photos-by-viewlio-v1-86.jpg |
| bar-1919-san-antonio | https://cdn.prod.website-files.com/5fc94aa2ec37827798b8c7c5/641cb068299e3b5ea77daef9_bar1919-establishment-image.webp |
| bar-dkdc-memphis | https://images.squarespace-cdn.com/content/v1/66acf389855f99125c7c7e63/d6fba8d7-a38a-4fce-a088-94b7fd8c8a12/309263967_534355968694849_6108986750144161469_n.jpg?format=2500w |
| batch-tucson | https://images.squarespace-cdn.com/content/v1/5fd430c467ebfc29b09184c3/79f395ec-1d87-47ad-9d64-3005fb99765f/batch_batch1_18.jpg?format=2500w |
| character-study-asheville | https://characterstudybar.com/images/room/room-03.jpg |
| daydream-rum-bar-albuquerque | https://static.wixstatic.com/media/affdfe_e599a211a13347b8947c00b7336d12a7~mv2.jpg |
| eleven-honolulu | https://images.squarespace-cdn.com/content/v1/5e56f4485191ee5107089691/1625864587104-QK10518MPXIE8P0CACGM/L1000409-03a-Lo.jpg?format=2500w |
| ep-bar-honolulu | https://images.squarespace-cdn.com/content/v1/6185d117c727250f482cf637/1640763879271-OHJ2OQVG9FBX44VYK0R3/L1050431.jpg?format=2500w |
| fanboy-richmond | https://images.squarespace-cdn.com/content/v1/652dc6ed918ed33c256fd329/d923ee2a-6479-4df4-88a5-5eb692ab1705/Fanboy+vibe+pics-3.jpg?format=2500w |
| good-for-a-few-oklahoma-city | https://img1.wsimg.com/isteam/ip/c66167e0-aea5-4d0c-b91f-1467b40a7bd7/gfaf-last-call-4.jpg |
| hap-hap-lounge-boise | https://treefortmusichall.com/wp-content/uploads/2024/07/Cdigi-_16.jpeg |
| high-violet-buffalo | https://img1.wsimg.com/isteam/ip/a0f802fc-67de-40d3-b5a8-78dfc2be6390/8Y6A0053.JPG |
| hu-roof-memphis | https://huhotelmemphis.com/wp-content/uploads/2021/10/Garrett-Sweet-Hu.-Interiors-01-scaled.jpg |
| japps-cincinnati | https://static.wixstatic.com/media/0d50a1_8d3a5a951b704e338e9fd1b990233003~mv2.jpg |
| little-jumbo-asheville | https://littlejumbobar.com/assets/photographs/915A0355-41444323ccabbe295710538504b602f15c1bc942053a9377d220159ab3c6cb95.jpg |
| longfellow-cincinnati | https://images.squarespace-cdn.com/content/v1/58ee593f6a49639a8a10c24f/1492640021538-QQ60L1BCGXXJIFKZ6JSQ/168_Longfellow_3.23.1724167.jpg |
| lucky-day-whiskey-bar-buffalo | https://images.squarespace-cdn.com/content/v1/59395f62579fb3fd7674cedd/1498512616523-E0TENY5PPKYM2QU9GTMB/aaron-ingrao-lucky-day-whiskey-bar-cocktail-buffalo-new-york-170-Edit.jpg?format=2500w |
| mathers-social-gathering-orlando | https://images.squarespace-cdn.com/content/v1/61d34fa20a990136390beded/182a5e5b-8096-4220-bafd-4f8303bf885e/E43A0325.jpg?format=2500w |
| nowhere-special-indianapolis | https://static.wixstatic.com/media/cf902b_c085fb13558843929ddefed5b57417bd~mv2.jpg |
| o-bar-oklahoma-city | https://www.obarokc.com/resourcefiles/gallery-snippet-images/seating-at-o-bar-ambassador-hotel-okc.jpg |
| owls-club-tucson | https://images.squarespace-cdn.com/content/v1/580689b01b631b37ff3f8e21/1613412883262-PG3B9M1F0YM3FDRN44NQ/6A5A7113-2.jpg?format=2500w |
| podmore-honolulu | https://cdn.prod.website-files.com/6556a2e697728d5179db6263/6556a2e697728d5179db629a_BarPodmore-0288-LR.jpg |
| saint-neri-buffalo | https://saintneri.com/cdn/shop/files/5.jpg |
| solaire-rooftop-richmond | https://solairerooftop.com/wp-content/uploads/2025/07/DSC00363-scaled.jpg |
| somerset-cincinnati | https://images.squarespace-cdn.com/content/v1/63caf1fe3dedff507ae17e26/8e527dbe-1f8d-499e-9c30-5ea8601f7de3/CGPHOTO%2B-%2BSomersetOTR-17.jpg |
| sternewirth-san-antonio | https://thehotelemma.com/wp-content/uploads/2022/12/sternewirth-tavern-og.jpg |
| tenfold-rooftop-san-antonio | https://symphony.cdn.tambourine.com/_white-lodging-fb-4/media/tenfoldrooftop-gallery-01-670ff0bfada10.jpg |
| the-dame-memphis | https://hotelpontotoc.com/wp-content/uploads/2026/03/Looking-for-Happy-Hour-Drinks-in-Memphis-Choose-The-Dame-The-Dame-Hotel-Pontotoc.jpg |
| the-jasper-richmond | https://images.squarespace-cdn.com/content/v1/640031d9a2b3c86fef77146d/1522ae0a-5520-4f44-b9a6-23fa6de16ad6/Jasper+RVA+07-28-2023-053.jpg?format=2500w |
| the-moons-daughters-san-antonio | https://images.getbento.com/accounts/06ef9866da2c9850883a1d69031b7bc9/media/4wJW9YTFSI6kQaC29eBy_SATTH-moons-daughters3.jpg |
| the-vault-at-the-national-oklahoma-city | https://www.thevaultokc.com/resourcefiles/home-gallery-single-image/central-counches-at-the-vault-downtown-okc.jpg |
| the-vault-indy-indianapolis | https://static.spotapps.co/website_images/ab_websites/128249_website/about_page_left.jpg |
| thick-as-thieves-boise | https://images.squarespace-cdn.com/content/v1/62756829ef8e162acfb11e92/78d90ef1-c005-4656-a81e-8c9389aaf338/bar+pic.jpeg?format=2500w |
| vue-rooftop-lounge-buffalo | https://vuebuffalo.com/wp-content/uploads/2022/02/Lounge-w-shuffle-board.jpg |
