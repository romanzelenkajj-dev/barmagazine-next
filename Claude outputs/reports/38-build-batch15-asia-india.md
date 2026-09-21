# Report: 38-build-batch15-asia-india (2026-09-16, 21:45 to 22:10 PT)

BUILT AND REPORTED ONLY. No runner script was written, no launchd agent created or loaded, nothing sent. The batch is armed in a later task only after Roman confirms the list in chat.

Output: outreach/batch15-w1.slugs and outreach/batch15-w2.slugs, 12 bars each, 24 in total.

## Proposed schedule, for Roman to approve

Monday 2026-09-21, w1 at 21:00 PT and w2 at 23:00 PT. That lands Tuesday midday in Tokyo and Singapore and Tuesday morning in Mumbai and Dubai. Tuesday and Wednesday mornings are the strongest windows; Friday is the weakest, which is why batch 14 moved off Thursday night.

## Candidate pool and exclusions

Countries included: Japan, China, Hong Kong, Macau, Singapore, South Korea, Taiwan, Thailand, Vietnam, Malaysia, Indonesia, Philippines, India, Sri Lanka, Nepal, Cambodia, plus the Gulf (United Arab Emirates, Qatar, Saudi Arabia, Bahrain, Kuwait, Oman). The Gulf is included because earlier waves grouped Dubai with this region; only the UAE actually has rows.

349 active rows in the pool. Mechanical exclusions, each counted:

| Exclusion | Count |
|---|---|
| No email on the row (sent to harvesting) | 254 |
| Already in outreach/sent-log.txt | 52 |
| Claimed (owner_id set) | 8 |
| Corporate or group inbox on the send script's blocked list | 11 |
| Opted out (outreach/optout.txt) | 1 |
| Parked (outreach/parked.txt) | 0 in this region |

Of the 254 without an email, 115 have a website and could be harvested; 139 have no website at all and cannot be, so they are on the hold list by definition. A 75-bar shortlist was harvested, prioritised by accolade standing and tier and spread across 13 countries, by three parallel researchers reading only each venue's own site and Instagram bio. No address was guessed or constructed from a pattern. 26 of 75 yielded an address.

## The batch: 24 bars

| Window | slug | bar | city | country | email | source |
|---|---|---|---|---|---|---|
| w1 | pony-up | Pony Up | Shanghai | China | comefindus@ponyupshanghai.com | https://www.ponyupshanghai.com |
| w2 | bar-leone | Bar Leone | Hong Kong | Hong Kong | tuttobene@barleonehk.com | https://barleonehk.com |
| w1 | bourkes | Bourke's | Hong Kong | Hong Kong | info@bourkeshk.com | stored on the row |
| w2 | coa | Coa | Hong Kong | Hong Kong | info@coa.com.hk | https://coa.com.hk |
| w1 | penicillin | Penicillin | Hong Kong | Hong Kong | info@penicillinbarhk.com | https://penicillinbarhk.com |
| w2 | quinary | Quinary | Hong Kong | Hong Kong | info@quinary.hk | https://quinary.hk |
| w1 | the-savory-project | The Savory Project | Hong Kong | Hong Kong | info@thesavoryproject.com | https://thesavoryproject.com |
| w2 | canopy-lounge-rooftop-bar-kl | Canopy Lounge by Tigerbay | Kuala Lumpur | Malaysia | info@canopylounge.my | https://canopylounge.my |
| w1 | atlas | Atlas | Singapore | Singapore | info@atlasbar.sg | https://atlasbar.sg |
| w2 | cat-bite-club | Cat Bite Club | Singapore | Singapore | meow@catbiteclub.com | https://catbiteclub.com |
| w1 | employees-only-singapore | Employees Only | Singapore | Singapore | reservations@employeesonlysg.com | stored on the row |
| w2 | fura | FURA | Singapore | Singapore | hi@fura.com.sg | https://fura.space |
| w1 | jigger-pony | Jigger & Pony | Singapore | Singapore | info@jiggerandpony.com | https://jiggerandpony.com |
| w2 | live-twice | Live Twice | Singapore | Singapore | info@livetwice.sg | stored on the row |
| w1 | milli | Milli | Singapore | Singapore | contact@millisingapore.com | stored on the row |
| w2 | native | Native | Singapore | Singapore | info@tribenative.com | https://tribenative.com |
| w1 | nutmeg-clove | Nutmeg & Clove | Singapore | Singapore | Hello@NutmegClove.com | https://nutmegclove.com |
| w2 | offtrack | Offtrack | Singapore | Singapore | hello@offtrack.sg | https://offtrack.sg |
| w1 | nuss-bar | Nuss Bar | Bangkok | Thailand | nusarabkk@gmail.com | https://www.nusarabkk.com/contact |
| w2 | ml-bkk | mL BKK | Bangkok | Thailand | hello@mlbkk.com | https://mlbkk.com |
| w1 | 1920 | 1920 | Dubai | United Arab Emirates | reservations@1920.ae | https://1920.ae |
| w2 | galaxy-bar | Galaxy Bar | Dubai | United Arab Emirates | reservations@galaxy-bar.com | https://galaxy-bar.com |
| w1 | lpm-dubai | LPM Dubai | Dubai | United Arab Emirates | info@lpmdubai.ae | https://lpmrestaurants.com/dubai |
| w2 | mimi-kakushi | Mimi Kakushi | Dubai | United Arab Emirates | book@mimikakushi.ae | https://mimikakushi.ae |

Per country: Singapore 10, Hong Kong 6, United Arab Emirates 4, Thailand 2, China 1, Malaysia 1.

## Quality pass: profiles to fix before their email goes out

| slug | what is missing |
|---|---|
| pony-up | no photo |
| bourkes | no photo, no hours |
| canopy-lounge-rooftop-bar-kl | no photo |
| employees-only-singapore | no photo |
| milli | no photo |
| nuss-bar | no photo |
| ml-bkk | no description, no photo, no hours |
| 1920 | short description (16 words) |
| galaxy-bar | short description (17 words) |
| lpm-dubai | short description (32 words) |
| mimi-kakushi | short description (29 words) |

11 of 24 need work, 13 are presentable as they stand. The common one is the missing photo: the profile falls back to the dark placeholder, which is a weak thing to invite an owner to look at. Every row in the batch has coordinates, so every profile renders its map.

## Chain and group inboxes: a gap in the guard, for Roman to rule on

18 bars were excluded because their only address is a hotel brand or portfolio inbox rather than the bar. Only some of those domains are on the send script's CORPORATE_DOMAINS list; the rest I blocked by the same principle but they would sail through a live run today.

| slug | address | domain |
|---|---|---|
| canes-tales | Dominic.Dijkstra@waldorfastoria.com | waldorfastoria (chain not yet on the list) |
| de-tiger-bar-a-far-east-speakeasy | houseoftugu@tuguhotels.com | tuguhotels (hotel group inbox, chain not yet on the list) |
| horatio | dining@rwsentosa.com | rwsentosa (chain not yet on the list) |
| house-of-nomad | reservations.mumbai@ihcltata.com | ihcltata (chain not yet on the list) |
| jungle-ballroom | jungleballroom@mondrianhotels.com | mondrianhotels (chain not yet on the list) |
| juniper-bar-andaz-delhi | Andaz.delhi.restaurants@andaz.com | andaz (chain not yet on the list) |
| level-43-sky-lounge | fp.dxbsf.fpdubai@fourpoints.com | fourpoints (chain not yet on the list) |
| library-bar | reservations@theleela.com | theleela (chain not yet on the list) |
| long-bar-raffles | singapore@raffles.com | raffles (chain not yet on the list) |
| the-bar-at-15-stamford | restaurant.15stamford@kempinski.com | kempinski (chain not yet on the list) |
| the-blue-bar | tphbluebar.del@tajhotels.com | tajhotels (chain not yet on the list) |
| the-library-bar | restaurantreservation.tlpnd@theleela.com | theleela (chain not yet on the list) |
| the-long-bar-at-the-waldorf-astoria | shawa.fb@waldorfastoria.com | waldorfastoria (chain not yet on the list) |
| the-pineapple-room | thepineappleroom.singapore@capellahotels.com | capellahotels (chain not yet on the list) |
| the-st-regis-bar | diningreservations.macao@stregis.com | stregis (chain not yet on the list) |
| the-st-regis-bar-jakarta | dine.stregisjakarta@stregis.com | stregis (chain not yet on the list) |
| the-zuk-bar | FBAdminShanghai@sukhothai.com | sukhothai (chain not yet on the list) |
| yoi | mario.lapietra@capellahotels.com | capellahotels (chain not yet on the list) |

The domains not yet on the list: waldorfastoria, andaz, stregis, fourpoints, capellahotels, kempinski, raffles, mondrianhotels, tajhotels, theleela, ihcltata, sukhothai, rwsentosa, tuguhotels. My recommendation is to add them to CORPORATE_DOMAINS in scripts/send-upsell.mjs, which is a separate task and not done here. If Roman would rather treat a named person at a property (Dominic.Dijkstra@waldorfastoria.com, mario.lapietra@capellahotels.com) as venue-specific and mail them, say so and they go back in.

## Held, with reasons

**Site live but publishes no address (phone, form or booking widget only)** (26)

1920-lounge-dining, 85b-cocktail-bar, bar-benfiddich, bar-high-five, bar-libre, bar-nayuta, bar-pomme, bar-tea-scent, bar-trench, cirrus-9, clap-ongaku, cosmo-pony, drinking-and-healing, eau-bar, firefly, hope-sesame, idoru, indulge-bistro, lamp-bar, pantja, pony-and-plume, posino-taipei, revolucion-cocktail, soka, the-old-man, wing-lei-bar

**Stored website is a blocked chain domain or blocks reading** (10)

aer-mumbai, backdoor-bodega, bar-trigona, bkk-social-club, charles-h, copitas, darkside, inge-s-bar, nautilus-bar, virtu

**Website dead or unreachable** (10)

bombay-cocktail-bar, carrots-bar, craftroom, gaba, gokan, lost-drink-chill, ounce-taipei, side-door, the-sg-club, vender

**Only a group, portfolio or parent-venue inbox exists** (6)

blind-tiger, modernhaus, salmon-guru-dubai, soy-como-soy, speak-low, the-cocktail-club

**In batch 14, sending tonight** (2)

barc, smoke-bitters

**Site no longer presents the bar in our record** (1)

the-diplomat

Total held: 55. The 139 rows with no website at all are not listed individually; they are the bulk of the region and need a different approach than harvesting.

## Notes worth your eye

- The Diplomat (Hong Kong) publishes an address, but thediplomat.hk now presents a contemporary European restaurant rather than the cocktail bar in our record. Held under the task's own rule, and the row itself probably needs an editorial check.

- Bar Leone Shanghai shares the Hong Kong bar's inbox, so only the Hong Kong row is in the batch. The duplicate guard now compares addresses as well as slugs, against the 130 addresses in the previous send logs, because the sent log is keyed by slug and would not have caught it.

- smoke-bitters and barc are held: they go out tonight in batch 14 and will not appear in the sent log until then.

- Three addresses were published as Cloudflare-obfuscated mailto links and were decoded from the page source: Coa, The Savory Project, Canopy Lounge. They are the venues' own published addresses, not guesses.

- Nuss Bar uses the Nusara inbox; the bar sits inside that restaurant and shares its site, so it is the venue's own address.
