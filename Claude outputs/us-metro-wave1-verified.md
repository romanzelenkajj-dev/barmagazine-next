# US metro wave 1: 21 verified bars ready to insert (2026-09-14)

All 21 are 2026 Tales of the Cocktail Spirited Awards regional honorees, verified against each venue's OWN site
(operator or hotel site where the venue has none). Six metros: Chicago, New Orleans, Austin, Denver, Nashville, Dallas.

Standing rules applied:
- region: North America. country: United States. type: Cocktail Bar unless noted.
- Descriptions are house style: US English, no em-dashes, prose, written from each venue's own material.
- Hours are house format; formatHoursForCountry() renders them 12-hour for the US.
- Accolade titles use the parenthetical form, matching the Phoenix set: "Best U.S. Hotel Bar (Regional Honoree)", org totc, year 2026, kind nominee.
- EMAIL: only where published. Never construct one. "none" = leave empty.
- PostgREST bulk insert requires identical keys on every row. Insert singly or normalize keys first.

## DECISIONS FOR ROMAN BEFORE INSERT
1. BRENNAN'S NAMING. The Spirited honoree is listed as "Brennan's" but the bar room is "The Roost Bar". Recommend
   name = "The Roost Bar at Brennan's" so both names are searchable, with the description carrying the Brennan's history.
2. THE ELYSIAN BAR self-describes as "restaurant, bar and cafe", closer to the Chilte case we skipped. Counter-argument
   for admitting: the venue is literally named as a bar and its Spirited honor is in the hotel-bar category. Recommend ADMIT.
3. BAR TRE DITA is a distinct bar room adjacent to the Tre Dita dining room, with its own cocktail list and bar director.
   Recommend ADMIT as Cocktail Bar + Hotel Bar subtype.

## OUTREACH FLAGS (for the follow-on batches, not for the insert)
- bar-tre-dita: operated by Lettuce Entertain You, which sits in the relationship parking lot. Form only anyway, no send.
- friends-of-friends and sportsmans-club: operated by Heisler Hospitality (parking lot), BUT both publish venue-specific
  addresses on their own venue domains, so per the CH Projects / Alt Strategies precedent these are KEEPS.
- the-sazerac-bar: Hilton/Waldorf chain, only departmental inboxes. PARK.
- the-cruise-room: only a hotel general reservations inbox. PARK.
- catbird: contact is a form; the only addresses found are a hotel staff member and a PR agency. PARK both.
- the-elysian-bar: info@hotelpeterandpaul.com is a single boutique property inbox on the bar's own listed domain,
  which the eyeball rules treat as a KEEP (DUKES/Widder/Sanders precedent). Roman's eyeball at dry-run.
- midnight-rambler: info@midnightramblerbar.com appears in the venue's own JSON-LD but not in visible page text.
  Same precedent as Bitter & Twisted (info@ published in own site source). KEEP.

## ADDRESS FLAGS (not first-party confirmed)
- friends-of-friends: 2001 W Grand Ave from third parties; operator confirms West Town only.
- moneygun: 660 W Lake St from third parties; the venue's own map link points to matching coordinates.
- sportsmans-club: own site prints "948 Western Ave." without the directional; Tock and other listings say 948 N Western Ave.

---

# CHICAGO (6)

## bar-tre-dita
name: Bar Tre Dita
city: Chicago
address: 401 E Wacker Dr, Chicago, IL 60601
website: https://www.treditarestaurant.com/bar-tre-dita/
subtypes: Hotel Bar
hours: Sun-Thu 4pm-12am; Fri-Sat 4pm-1am
email: none (form only)
instagram: treditarestaurant
description: Bar Tre Dita is the bar room of Tre Dita on the second floor of The St. Regis Chicago, overlooking the meeting of the Chicago River and Lake Michigan. Led by the chef Evan Funke, it celebrates Tuscan tradition, with its own cocktail list and an all-Italian wine program of more than seven hundred labels.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)

## charis-listening-bar
name: Charis Listening Bar
city: Chicago
address: 3317 S Morgan St, Chicago, IL 60608
website: https://www.charislisteningbar.com/
hours: Mon-Tue closed; Wed-Sun 4pm-12am
email: none (form only)
instagram: charislisteningbar
description: Charis is a listening bar in Bridgeport, named for the owner's mother and built on the idea that music shared with a drink and good company is one of the best parts of life. The thirty-five-seat room is seated only, with no reservations, and its music is curated with a rotating monthly roster of vinyl selectors.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

## double-fun
name: Double Fun
city: Chicago
address: 2 W Elm St, Chicago, IL 60610
website: https://www.doublefunchicago.com/
hours: Mon-Thu 4pm-2am; Fri 2pm-2am; Sat 2pm-3am; Sun 2pm-2am
email: hello@doublefunchicago.com
instagram: doublefunchicago
description: Double Fun reimagines the corner bar in Chicago's Gold Coast, drawing on a warm memory of the west coast and the relaxed cool of 1970s Hollywood. Large windows give it a vantage on one of the city's most recognizable neighborhoods, and the list runs from frozen drinks through to the boozy end of the menu.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

## friends-of-friends
name: Friends of Friends
city: Chicago
address: 2001 W Grand Ave, Chicago, IL 60612 (see address flags)
website: https://www.fofchicago.com/
hours: Sun-Thu 4pm-12am; Fri-Sat 2pm-2am
email: info@fofchicago.com
instagram: fof_chicago
description: Friends of Friends is a neighborhood cocktail bar in West Town with an emphasis on classic, distinct flavors. The room runs first come, first served with a patio alongside it, and the bar keeps no kitchen on site.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

## moneygun
name: MONEYGUN
city: Chicago
address: 660 W Lake St, Chicago, IL 60661 (see address flags)
website: https://www.moneygunchicago.com/
hours: Mon closed; Tue-Sun 5pm-close
email: info@moneygunchicago.com
instagram: moneygunchicago
description: MONEYGUN calls itself a bar that is just a bar, serving a cocktail list full of classics under the Green and Pink Line tracks in Chicago. It runs first come, first served, and its Dirty Thirty Club challenges drinkers to work through all thirty of its essential classics for a plaque on the wall.
accolade: totc 2026, Best U.S. Bar Team (Regional Honoree)

## sportsmans-club
name: Sportsman's Club
city: Chicago
address: 948 N Western Ave, Chicago, IL 60622 (see address flags)
website: https://drinkingandgathering.com/
hours: none published
email: info@drinkingandgathering.com
instagram: drinkandgather
description: Sportsman's Club opened in December 2013 in Ukrainian Village, in a room that once served as a haven for Polish immigrants and still keeps its original art deco bar. It is built on the idea of the daily cocktail, a menu of four drinks that changes every day and is left entirely to whoever is working the bar that night, alongside an amaro machine and a carry-out liquor program.
accolade: totc 2026, Best U.S. Cocktail Bar (Regional Honoree)
note: their site is stale (blog stops in 2015, COVID-era copy on the contact page) but the venue is live, with Tock reservations running.

# NEW ORLEANS (5)

## chandelier-bar
name: Chandelier Bar
city: New Orleans
address: 2 Canal St, New Orleans, LA 70130
website: https://www.fourseasons.com/neworleans/dining/lounges/chandelier-bar/
subtypes: Hotel Bar
hours: Sun-Wed 10am-12am; Thu-Sat 10am-1am
email: none (form only)
instagram: none published on the venue's own page
description: The Chandelier Bar occupies the lobby of the Four Seasons Hotel New Orleans, under a namesake chandelier built from fifteen thousand hand-strung Bohemian crystals. Its list celebrates the city's cocktail history with renditions of the Sazerac, French 75 and Brandy Crusta alongside house builds, and guests can book classes on the classics.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)
note: also claims Spirited regional honoree 2023 and 2024 and a 2025 national Top 10 nomination. Verify against official TOTC lists before adding those rows.

## junebug
name: Junebug
city: New Orleans
address: 744 Camp St, New Orleans, LA 70130
website: https://www.junebugnola.com/
hours: Mon closed; Tue-Thu 4pm-12am; Fri-Sat 4pm-1am; Sun 10:30am-11pm
email: hello@junebugnola.com
instagram: junebugneworleans
description: Junebug opened in 2025 in the Warehouse District, pairing French and Creole small plates with a spirits-forward cocktail list and a deep selection of brandies and fruit-based spirits. The building at 744 Camp Street housed Cosimo Matassa's recording studio from 1967 to 1978, where Allen Toussaint worked and the Meters cut Cissy Strut, and the bar honors that with a six-hundred-album vinyl collection played continuously.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

## the-elysian-bar
name: The Elysian Bar
city: New Orleans
address: 2317 Burgundy St, New Orleans, LA 70117
website: https://ash.world/dining/the-elysian-bar/
subtypes: Hotel Bar
hours: none published (the venue publishes service windows only, no single bar close)
email: info@hotelpeterandpaul.com (hotel general, single property, see outreach flags)
instagram: elysianbarnola
description: The Elysian Bar sits inside Hotel Peter and Paul in the Marigny, a boutique hotel converted from a former church, schoolhouse, rectory and convent a few blocks from Frenchmen Street. It works as restaurant, bar and cafe at once, and its name plays on both Elysian Fields as paradise and the avenue that divides the neighborhood.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)

## the-sazerac-bar
name: The Sazerac Bar
city: New Orleans
address: 123 Baronne St, New Orleans, LA 70112
website: https://therooseveltneworleans.com/dining/
subtypes: Hotel Bar
hours: Sun-Thu 11am-12am; Fri-Sat 11am-1am
email: none (chain hotel, PARK)
instagram: none published
description: The Sazerac Bar is a restored landmark inside The Roosevelt New Orleans, with an African walnut bar and murals by Paul Ninas on its walls. It serves the Sazerac, which the hotel calls the official cocktail of New Orleans, in a house version built on Sazerac Rye, Peychaud's Bitters and Herbsaint, alongside Coffee House and Cognac variants.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)

## the-roost-bar (NAMING: see decision 1)
name: The Roost Bar at Brennan's
city: New Orleans
address: 417 Royal St, New Orleans, LA 70130
website: https://www.brennansneworleans.com/roost-bar/
subtypes: Restaurant Bar
hours: Mon-Fri 9am-10pm; Sat-Sun 8am-10pm
email: none (phone only)
instagram: brennansnola
description: The Roost Bar is the bar room of Brennan's on Royal Street, an airy space overlooking the restaurant's courtyard, serving traditional New Orleans cocktails modernized. Brennan's opened in 1946 and occupies a building raised in 1795 that later housed the Louisiana State Bank, and the bar room is finished with a gilded-glass mural of exotic birds, bird cages hung above the bar and tables of crushed eggshell set in resin.
accolade: totc 2026, Best U.S. Restaurant Bar (Regional Honoree)

# AUSTIN (3)

## bar-fino
name: Bar Fino
city: Austin
address: 88 1/2 Rainey St, Austin, TX 78701
website: https://www.barfinoatx.com/
hours: Mon-Wed 4pm-11pm; Thu 4pm-12am; Fri 3:30pm-2am; Sat 1pm-2am; Sun 1pm-11pm
email: none (form only)
instagram: barfinoatx
description: Bar Fino is an intimate European-inspired cocktail bar on Austin's Rainey Street, pairing an aperitivo-forward program with chef-driven food. It runs walk-ins only, with an aperitivo hour midweek and weekly DJs, and shares its address with a coffee shop and a taco window.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

## drinkwell
name: DrinkWell
city: Austin
address: 207 E 53rd St, Austin, TX 78751
website: https://www.drinkwellaustin.com/
hours: Mon-Wed 4pm-11pm; Thu-Sat 3pm-12am; Sun closed
email: bar@drinkwellaustin.com
instagram: drinkwellaustin
description: DrinkWell has been an intimate cocktail bar and neighborhood restaurant in Austin's North Loop since 2012, with thirty-eight seats indoors and twenty more on open-air patios. It takes no reservations for parties under eight, and adds an automatic wellness fee that passes in full to staff as wages.
accolade: totc 2026, Best U.S. Cocktail Bar (Regional Honoree)
note: the gap list styled it "Drink.Well"; their own site styles it "DrinkWell". Use the venue's own styling.

## holiday
name: Holiday
city: Austin
address: 5020 E 7th St, Austin, TX 78702
website: https://www.holidayon7th.com/
subtypes: Restaurant Bar
hours: Mon closed; Tue-Thu 5pm-11pm; Fri-Sat 5pm-12am; Sun 5pm-11pm
email: hello@holidayon7th.com
instagram: holidayon7th
description: Holiday is a cocktail bar and restaurant on the corner of East Seventh and Shady Lane in Austin's Govalle neighborhood, created by three industry veterans who met working at the restaurant Olamaie. It runs walk-in only, with full service in the bar and lounge, a covered trellis and patios.
accolade: totc 2026, Best U.S. Restaurant Bar (Regional Honoree)

# DENVER (3)

## lady-jane
name: Lady Jane
city: Denver
address: 2021 W 32nd Ave, Denver, CO 80211
website: https://www.ladyjanedenver.com/
hours: Mon-Thu 4pm-11pm; Fri 4pm-12am; Sat 2pm-12am; Sun closed
email: info@ladyjanedenver.com
instagram: ladyjanedenver
description: Lady Jane opened in August 2018 in Denver's Lower Highlands as a neighborhood cocktail bar dedicated to serving drinks in a welcoming and safe space. Its cocktails are bold, seasonal and approachable, built on local ingredients, and the menu changes constantly with the whole team contributing.
accolades: totc 2026, Best U.S. Cocktail Bar (Regional Honoree) AND totc 2026, Best U.S. Bar Team (Regional Honoree)
note: also claims a 2026 James Beard Foundation Outstanding Bar semifinalist placing. We have a jbf org_key and folded JBF 2026 in on 09-01. Check whether Lady Jane was missed in that import; if so add it, sourced to the official JBF list.

## the-cruise-room
name: The Cruise Room
city: Denver
address: 1600 17th St, Denver, CO 80202
website: https://www.theoxfordhotel.com/eat-drink/the-cruise-room
subtypes: Hotel Bar
hours: Mon-Thu 4pm-11pm; Fri-Sat 4pm-12am; Sun 4pm-10pm
email: none (hotel reservations inbox only, PARK)
instagram: none published
description: The Cruise Room opened in the Oxford Hotel the day after Prohibition was repealed in 1933 and calls itself Denver's original cocktail bar, running continuously ever since. Its art deco room was modeled on a lounge aboard the RMS Queen Mary, and it is known for its martini and for a bartender's-choice happy hour.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)

## the-peach-crease-club
name: The Peach Crease Club
city: Denver
address: 4180 Wynkoop St, Suite 130, Denver, CO 80216
website: https://www.peachcreaseclub.com/
hours: Mon 4pm-12am; Tue closed; Wed-Thu 4pm-12am; Fri-Sat 4pm-1am; Sun 2pm-10pm
email: howdy@peachcreaseclub.com
instagram: peachcreaseclub
description: The Peach Crease Club is the first joint project from the husband-and-wife bar veterans Alex Jump and Stuart Jensen, in a 1970s-inspired Denver room with a twelve-seat bar, vintage records and a dedicated DJ booth. The list runs full-proof, low-ABV and non-alcoholic cocktails drawn from culinary dishes and the couple's travels, alongside minimal-intervention wines, uncommon sakes and light bites.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

# NASHVILLE (2)

## eleven11
name: Eleven11
city: Nashville
address: 913 Dickerson Pike, Nashville, TN
website: https://eleven11nashville.com/
hours: Mon-Tue closed; Wed-Sun 5pm-1am
email: info@eleven11nashville.com
instagram: none confirmed on their own site (search surfaces eleven11nashville, unverified)
description: Eleven11 describes itself as a cocktail bar, discotheque and restaurant under one roof on Dickerson Pike in Nashville. The bar runs later than the kitchen, reservations are handled online, and parking is validated inside.
accolade: totc 2026, Best New U.S. Cocktail Bar (Regional Honoree)

## white-limozeen
name: White Limozeen
city: Nashville
address: 101 20th Ave N, Nashville, TN 37203
website: https://www.whitelimozeen.com/
subtypes: Hotel Bar
hours: none published
email: info@whitelimozeennash.com
instagram: whitelimozeennash
description: White Limozeen is the rooftop bar and restaurant on the twelfth floor of the Graduate hotel in Midtown Nashville, with views over the city and a menu that gives Southern comfort food a French turn. It is home to the Governor's Pool, with poolside cocktails and cabana reservations in season, and is twenty-one and over after nine.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)
note: the displayed email is info@whitelimozeennash.com while the underlying mailto points at info@whitelimozeen.com. Use the displayed one.

# DALLAS (2)

## catbird
name: Catbird
city: Dallas
address: 1401 Elm St, Dallas, TX 75202
website: https://www.catbirddallas.com/
subtypes: Hotel Bar
hours: Sun-Thu 5pm-11pm; Fri-Sat 5pm-12:30am
email: none (form only, see outreach flags)
instagram: catbirddallas
description: Catbird is a rooftop cocktail lounge above downtown Dallas at the Thompson hotel, serving cocktails and izakaya-inspired bites from sunset into the late night. The jewel-box room runs a rotating lineup of DJs and live performers, with a private conservatory and terrace alongside it.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)

## midnight-rambler
name: Midnight Rambler
city: Dallas
address: 1530 Main St, Dallas, TX 75201
website: https://midnightramblerbar.com/
subtypes: Hotel Bar
hours: Mon closed; Tue-Wed 5pm-12am; Thu-Sat 5pm-2am; Sun closed
email: info@midnightramblerbar.com (venue's own JSON-LD, see outreach flags)
instagram: midnightramblerbar
description: Midnight Rambler is a subterranean cocktail lounge beneath The Joule on Main Street in Dallas, entered through the hotel. Its menu is built by the bartender Gabe Sanchez, and the room takes its cues from jazz, funk, rock and afrobeat, with DJs on weekends.
accolade: totc 2026, Best U.S. Hotel Bar (Regional Honoree)
