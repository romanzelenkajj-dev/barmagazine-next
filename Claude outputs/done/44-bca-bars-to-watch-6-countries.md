# Bartenders' Choice Awards "bars to watch": 91 bars across 6 countries (admission source)

Roman supplied this from the Bartenders' Choice Awards Instagram, their per-country "bars to watch" lists. This is an ADMISSION SOURCE ONLY. BCA is a whitelisted accolade org, but a watchlist is not an award: do NOT write any accolade for these bars on the strength of this list. If a bar separately holds a real BCA win or nomination, that is a different fact and needs its own verification.

The value: these are mid-tier-city bars in exactly the cities the coverage programme targets (Košice, Nitra, Lyon, Marseille, Bordeaux, Nice, Montpellier, Gdańsk, Wrocław, Kraków, Győr, Split, Belgrade). BCA publishes these yearly per country, so add "BCA bars to watch, by country" to the source checklist in the coverage programme.

## Method
1. MATCH FIRST, by Instagram handle against the `instagram` field on existing rows, not by name. Report which handles we already have, with slug and city. Expect a good number of Prague, Paris and Budapest ones to be in already.
2. For every unmatched handle: open the Instagram profile and the website in its bio. Confirm it is open, cocktail-led, and get name, city, address, hours, website. Anything you cannot confirm from the bar's own Instagram or site is HELD and listed, never guessed.
3. Insert the verified ones with the full wave protocol: description 90 to 120 words primary-sourced, type and subtypes, address, hours, phone, website, Instagram, coordinates address-first with the 40 km guard, state or country, no dashes, no food negation, US English.
4. Group the work by city and report bars-per-city before and after, so we can see which cities crossed the credible-guide threshold of eight.
5. Add every new bar to claude/indexing-queue.json, write or refresh the city intro for any city that crosses the threshold, and produce an outreach candidate list of the new bars with verified emails.

Work in country order, reporting after each country, so a long run still produces usable output if it is interrupted.

## SERBIA (15)
bar_central011, holymolycocktailclub, josephine.belgrade, kissa10.bg, ljiljan.cocktailbar, rakiabarbelgrade, yama.belgrade, backdoor_5, baric11030, elizabeth.belgrade, tattoobar.bg, nomadthebar, angrymonkbelgrade, squareninehotel, dbar.bg

## FRANCE (19)
bar1802_paris, abstract_house_of_monochromes_, aperturemontpellier, bonsoir_bonsoir_cocktail_bar, contrast.lyon, copperbay_paris, cravanparis, kissproofbelleville, lagobeleterie, barlequatriemetiers, lesyndicat, lantiquairebar, madamepang_, paloma_marseille, pepere_marseille, barpovera, symbiosebordeaux, saintbarnice, soeurscarnage

## POLAND (18)
backroom.warsaw, donkeyshoe.bar, dziadyikoktajle, ginmillkrk, hanashicocktail, hedwigs.club, yoru.krk, labour.bar, mala_sztuka_bar, mercybrownkrk, mirzamgdansk, rusty_rat, skwerbar_krakow, t57.wroclaw, botanista_cocktailbar, tlenbar.gdansk, toystore.bar, vhswarsaw

## HUNGARY (14)
barside.bp, blackswanlabbudapest, boutiq.bar, cooldownbudapest, highnoteskybar, hudsonbarbudapest, kaa.mixology, lazycocktailbar, lilithbudapest, miticobudapest, seven.w26, szomszed_gyor, tuktukbar, warmupbudapest

## CZECH REPUBLIC (16)
alcronbarprague, alenka_cocktail_bar, anonymous_bar, tynskabarandbooks, barcobra, beyondthebar.cz, blackangelsbar, bonvivantsctc, bugsysbar, bylonebylo.bar, goldeneyebar_prague, hemingwaybarprague, parlourprague, sabi_and_sip, savage_bar_prague, super_panda_circus

## CROATIA (9)
apotecha.bar, blendbar__, bokamorracroatia, colonna.bar, kalavanda_bar, koi_zg, mediterraneo_bar, mintiqbar, mrfogg_zg

Note: blackswanlabbudapest may be the Black Swan row we already hold (renamed from Black Swan Budapest); check carefully before inserting a duplicate.
