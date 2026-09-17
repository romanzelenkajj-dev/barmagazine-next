# Batch 16, and outreach performance to date

_2026-09-17. Roman confirmed this send in chat. He then asked for the 9:30
window to go as soon as possible, so window 1 sent at 08:02 PT instead._

## Batch 16 at a glance

| | |
|---|---|
| Recipients | 113 bars |
| Window 1 | 35 bars, **sent 08:02 PT, all 35 delivered to Resend, no failures** |
| Window 2 | 35 bars, armed for 11:30 PT |
| Window 3 | 43 bars, armed for 13:30 PT |
| Region split | Europe 58, Americas 55 |
| Countries | 24 |
| Bars researched by hand for this batch | 297 |
| Held after research, not emailed | 184 |

Europe filled the earliest window and the Americas the later ones. 9:30 PT is
already 17:30 in London and 18:30 in Madrid, the end of a European bar's
working afternoon, while it is only 12:30 in New York. Within each region the
countries interleave, so no window is one country. Window 3 is larger than the
other two because the last research agent finished after the windows were
armed and its ten bars were added there rather than left for another day.

## How the pool was built

Active bars in the United States, Canada, Mexico, Central and South America and
Europe, then these removed before any research began:

| Excluded | Bars |
|---|---|
| Already in sent-log.txt | 321 |
| Claimed already (owner_id set) | 49 |
| Listed in parked.txt | 35 |
| No description on the profile | 81 |
| Corporate or chain inbox on the row | 28 |
| No email, no website and no Instagram | 9 |

That left 435 bars worth researching. Ten researchers worked through 297 of
them, reading each bar's own website and, where there was none, its Instagram
bio. Every address in the tables below was read off one of those two sources
today, and the source URL is recorded beside it.

## Why 184 were held

| Reason | Bars |
|---|---|
| No address published on the site or in the Instagram bio | 90 |
| Chain, hotel, group, agency or HR inbox rather than the bar | 43 |
| Address on the row, but not published anywhere today to confirm it | 33 |
| Site or venue no longer matches our record | 17 |
| Inbox already emailed, or shared with another bar in this batch | 1 |

Ten of those holds were mine rather than a researcher's, after reading the
flags one row at a time:

- **Mad Souls & Spirits** publishes `neri.fante@gmail.con`. That top-level
  domain does not exist, so nothing would be delivered.
- **Backroom Bar** publishes only `rrhh@`, the human-resources inbox.
- **Connaught Bar**, **The Cadier Bar**, **The Living Room at the Dewberry**
  and **No Goodbyes** publish only a hotel-wide inbox, concierge desk or
  reservations desk. That is the hotel, not the bar.
- **Guldbaren** publishes the Nobis Hotel reservations desk.
- **Barr Hill Cocktail Bar** publishes the Caledonia Spirits corporate inbox.
- **Three Sheets Soho** shares an operator and a domain with Three Sheets
  Dalston, which is in this batch. One email to Three Sheets, not two.
- **La Commune** sits on the Syndicat group domain, which was already emailed
  at `lesyndicat@` in an earlier batch.

Four venues worth a look separately from this batch: **Uptown** in Buenos Aires
now serves a TLS certificate for an unrelated events business, **A Bar Called
Gemma** returns a hard 404, **Null Social Lab** returns 402 Payment Required
though its Instagram shows current hours, and **Experimental Cocktail Club**
now redirects to the group site.

## Guards that ran on this list

- Every address was checked against optout.txt, parked.txt, sent-log.txt and
  the sender's own CORPORATE_DOMAINS list. Zero collisions.
- De-duplicated by slug and by address, and against the 132 addresses already
  emailed in earlier batches. The sent log is keyed by slug, so two bars
  sharing one inbox would otherwise be a second email to the same mailbox.
- Re-checked against the live database immediately before arming: none of the
  113 had been claimed or deactivated since the pool was built.
- 44 of the 113 rows had no address stored. The sender reads `bars.email`, so
  those were written to their rows by id through the admin API. Where a row
  already stored an address it was kept, even when research found a different
  one: Peaches & Cream, Swift and Reserve 101 keep their stored, more specific
  inboxes.

## The send mechanism

Three one-shot launchd agents, the batch 14 pattern with the fix from that
night: each runner deletes its own plist **before** unloading itself, because
`launchctl unload` kills the running job and anything after it on the line
never executes. That is what left a spent agent armed on 16 September. This is
now `outreach/arm-window.sh`, so future windows do not get hand-written.

Window 1 was fired by hand at 08:02 after its 9:30 agent was disarmed, so it
could not fire twice. The Mac is held awake by `caffeinate` until 14:28 PT,
past the last window. Each runner reads its slug file at fire time, appends to
`outreach/batch16-amer-eur-send.log`, and the sender writes every successful
send to `outreach/sent-log.txt`.

One consequence of sending window 1 early: it went out on the old email
template. Windows 2 and 3 will carry the hardened one from task 40, reported
separately.


### Window 1, sent 08:02 PT (35 bars)

| Bar | City | Country | Address | Source |
|---|---|---|---|---|
| Callooh Callay | London | United Kingdom | hello@calloohcallaybar.com | https://calloohcallaybar.com |
| Bar Immertreu | Berlin | Germany | mail@bar-immertreu.de | https://bar-immertreu.de/ |
| Devil's Cut | Madrid | Spain | info@devilscutmadrid.com | https://devilscutmadrid.com |
| Bar Lupo | Zurich | Switzerland | contact@lupo.bar | https://lupo.bar |
| AnonymouS Bar | Prague | Czech Republic | info@anonymousbar.cz | https://anonymousbar.cz |
| Arbane Cocktail Bar | Paris | France | contact@larbane.com | https://www.larbane.com/ |
| Gorilla | Thessaloniki | Greece | info@gorillabar.gr | https://gorillabar.gr |
| Josef Cocktail Bar | Vienna | Austria | reservierung@josef-bar.at | https://www.josef-bar.at |
| Fitz's Bar | Amsterdam | Netherlands | info@fitzsbaramsterdam.com | https://www.fitzsbaramsterdam.com |
| Locale Firenze | Florence | Italy | info@localefirenze.it | https://localefirenze.it/contatti/ |
| Hernö Gin Bar - Stockholm | Stockholm | Sweden | stockholm@hernogin.com | https://hernogin.com/herno-gin-bar/stockholm |
| Peaches & Cream Bar | Zagreb | Croatia | cocktail@peachescream.bar | https://www.peachesandcreambar.com (row already stores cocktail@peachescream.bar, which is kept) |
| Pensão Amor | Lisbon | Portugal | email@pensaoamor.pt | https://pensaoamor.com/pensao-amor-contacto/ |
| Pink Pony Club | Budapest | Hungary | info@ppcbudapest.com | https://ppcbudapest.com |
| Antique American Bar | Bratislava | Slovakia | antique@sassy.sk | https://www.antique-americanbar.com |
| The Trust | Kraków | Poland | drinks@thetrust.pl | https://www.instagram.com/the.trust.bar/ |
| Coupette | London | United Kingdom | info@coupette.co.uk | https://coupette.co.uk |
| Becketts Kopf | Berlin | Germany | info@becketts-kopf.de | https://becketts-kopf.de |
| Dr. Stravinsky | Barcelona | Spain | info@drstravinsky.cat | https://drstravinsky.cat/contacto/ |
| Kronenhalle Bar | Zurich | Switzerland | info@kronenhalle.com | https://kronenhalle.com/en/bar/ |
| Beyond The Bar | Prague | Czech Republic | hello@beyondthebar.cz | https://beyondthebar.cz |
| Le Calbar | Paris | France | info@lecalbarcocktail.com | https://lecalbarcocktail.com/ |
| Upupa Epops | Athens | Greece | info@upupa.gr | https://upupaepopsthebar.gr |
| Truth & Dare | Vienna | Austria | drink@truthanddare.bar | https://www.truthanddare.bar |
| Sins of Sal | Amsterdam | Netherlands | hello@sinsofsal.nl | https://www.sinsofsal.nl |
| Salmon Guru | Milan | Italy | milano@salmonguru.it | https://salmonguru.it/ |
| Le Hibou | Stockholm | Sweden | lehibou@bankhotel.se | https://bankhotel.se/restaurants/le-hibou/ |
| Happiness Forgets | London | United Kingdom | manager@happinessforgets.com | https://happinessforgets.com |
| Buck & Breck | Berlin | Germany | info@buckandbreck.com | https://buckandbreck.com |
| FOCO | Barcelona | Spain | info@focobcn.com | https://www.focobcn.com |
| Late Bloomers | Zurich | Switzerland | info@latebloomersthebar.com | https://latebloomersthebar.com |
| Lost and Found Bar Prague | Prague | Czech Republic | lostfoundcz@gmail.com | https://lostfoundcz.com |
| Moonshiner | Paris | France | speakeasy@moonshinerbar.fr | https://moonshinerbar.fr |
| Hey Palu | Edinburgh | United Kingdom | hey@heypalu.com | https://www.heypalu.com |
| Hildegard Bar | Berlin | Germany | info@hildegardbar-berlin.de | https://hildegardbar-berlin.de/kontakt/ |

### Window 2, 11:30 PT (35 bars)

| Bar | City | Country | Address | Source |
|---|---|---|---|---|
| Monk | Barcelona | Spain | info@monkbarcelona.com | https://monkbarcelona.com |
| Schluggstube | Basel | Switzerland | info@schluggstube.ch | https://www.schluggstube.ch/index.php?id=6 |
| Lucky Liquor Co. | Edinburgh | United Kingdom | info@luckyliquorco.com | https://www.luckyliquorco.com/ |
| LIMONADIER Cocktailbar | Berlin | Germany | info@limonadier.de | https://www.limonadier.de |
| Sips | Barcelona | Spain | bookings@sips.barcelona | https://sips.barcelona/contact/ |
| Murder Inc | London | United Kingdom | bookings@murderinclondon.com | https://www.murderinclondon.com |
| Provocateur Bar | Berlin | Germany | hello@provocateur-hotel.com | https://www.provocateur-hotel.com/provocateur-bar/ |
| Nightjar | London | United Kingdom | shoreditch@barnightjar.com | https://barnightjar.com/get-in-touch |
| Vault Bar | Berlin | Germany | info@vault.berlin | https://vault.berlin |
| Oriole | London | United Kingdom | info@oriolebar.com | https://oriolebar.com |
| Velvet | Berlin | Germany | kontakt@velvet-bar-berlin.de | https://velvet-bar-berlin.de/info |
| Satan's Whiskers | London | United Kingdom | info@satanswhiskers.com | https://satanswhiskers.com/ |
| Scarfes Bar | London | United Kingdom | info@scarfesbar.com | https://scarfesbar.com |
| Swift | London | United Kingdom | soho@barswift.com | https://www.barswift.com (row already stores soho@barswift.com, which is kept) |
| The Pot Still | Glasgow | United Kingdom | info@thepotstill.co.uk | https://thepotstill.co.uk/ |
| Three Sheets Dalston | London | United Kingdom | dalston@threesheets-bar.com | https://threesheets-bar.com |
| Trailer Happiness | London | United Kingdom | reservations@trailerh.com | https://trailerh.com/ |
| Waltz | London | United Kingdom | info@waltzbar.uk | https://waltzbar.uk |
| All Night Skate | New York | United States | groovy@allnightskate.com | https://www.allnightskate.com/ |
| Botanist | Vancouver | Canada | info@botanistrestaurant.com | https://botanistrestaurant.com/location/botanist/ |
| Liz Cocktail e Wine | Rio de Janeiro | Brazil | contato@lizcocktailewine.com | https://lizcocktailewine.com |
| Bijou Drinkery Room | Mexico City | Mexico | info@bijoudrinkeryroom.com | https://bijoudrinkeryroom.com |
| Bar Carmen | Medellín | Colombia | reservas@carmenmedellin.com | https://carmenmedellin.com |
| The Loft | Santiago | Chile | eventos@theloftroom.cl | https://theloftroom.cl/ |
| Lady Bee | Lima | Peru | info@ladybee.bar | https://ladybee.bar/ |
| SOMMA | Buenos Aires | Argentina | info@sommabar.com.ar | https://www.instagram.com/somma.bar/ |
| Baby Gee | Long Beach | United States | info@babygeebar.com | https://babygeebar.com/ |
| Meo | Vancouver | Canada | info@meochinatown.com | https://www.meochinatown.com/contact |
| Picco | São Paulo | Brazil | contato@opicco.com.br | http://opicco.com.br/contato/ |
| Handshake Speakeasy | Mexico City | Mexico | reservaciones@handshake.bar | https://handshake.bar |
| Mala Audio Bar | Medellín | Colombia | hello.malaaudiobar@gmail.com | https://malaaudiobar.co |
| Bar Betsie | Washington DC | United States | hello@barbetsiedc.com | https://www.barbetsiedc.com/ |
| Mother | Toronto | Canada | info@motherdrinks.co | https://motherdrinks.co |
| Bar Chenin | Detroit | United States | info@barchenin.com | https://barchenin.com/ |
| The Keefer Bar | Vancouver | Canada | info@thekeeferbar.com | https://thekeeferbar.com/contact/ |

### Window 3, 13:30 PT (43 bars)

| Bar | City | Country | Address | Source |
|---|---|---|---|---|
| Bar Kabawa | New York | United States | hello@barkabawa.com | https://www.momofuku.com/restaurants/barkabawa |
| Bar Maritime | San Francisco | United States | hi@eatmaritime.com | https://www.eatmaritime.com/ |
| Birds | New York | United States | booking@birds-nyc.com | https://birds-nyc.com/ |
| Bryant's Cocktail Lounge | Milwaukee | United States | hello@bryantscocktaillounge.com | https://www.bryantscocktaillounge.com/ |
| Bygones Cocktail Bar | Birmingham | United States | hello@bygonesbar.com | https://www.bygonesbar.com/ |
| Cavaña | San Francisco | United States | hola@cavanasf.com | https://www.cavanasf.com/ |
| Clavel Mezcaleria | Baltimore | United States | clavelmezcal@gmail.com | https://barclavel.com/ |
| Cobra | Columbus | United States | info@cobrabarcolumbus.com | https://www.cobrabarcolumbus.com/ |
| Devil's Toboggan | Bozeman | United States | info@devilstoboggan.com | https://www.devilstoboggan.com/ |
| Drastic Measures | Shawnee | United States | info@drasticbar.com | https://www.drasticbar.com/ |
| Grey Ghost Detroit | Detroit | United States | info@greyghostdetroit.com | https://greyghostdetroit.com/ |
| Hey Love | Portland | United States | hello@heylovepdx.com | https://www.heylovepdx.com/ |
| Jewel Box | Portland | United States | thejewelboxmaine@gmail.com | https://www.jewelboxportlandmaine.com/ |
| Johnny's Gold Brick | Houston | United States | info@johnnysgoldbrick.com | https://www.johnnysgoldbrick.com/ |
| Kingfisher | Durham | United States | info@kingfisherdurham.com | https://www.kingfisherdurham.com/ |
| LPM Miami | Miami | United States | info@lpmmiami.com | https://lpmrestaurants.com/miami/ |
| Lone Wolf Lounge | Savannah | United States | lonewolfloungesav@gmail.com | https://www.lonewolfsav.com/ |
| Macchialina | Miami Beach | United States | info@macchialina.com | https://macchialina.com/ |
| Meteor | Minneapolis | United States | info@meteormpls.com | https://www.meteormpls.com/ |
| Reserve 101 | Houston | United States | sean@reserve101.com | https://www.reserve101.com/ (row already stores sean@reserve101.com, which is kept) |
| Rumba | Seattle | United States | rumba@rumbaonpike.com | https://www.rumbaonpike.com |
| Spoke Wine Bar | Somerville | United States | info@spokewinebar.com | https://www.spokewinebar.com/ |
| Standby | Detroit | United States | info@standbydetroit.com | https://www.standbydetroit.com/ |
| Tallboy | Oakland | United States | sup@tallboy.bar | https://www.tallboy.bar/ |
| The Butterscotch Den | Sacramento | United States | drink@butterscotchden.com | https://www.thebutterscotchden.com/ |
| The Gin Room | St. Louis | United States | ginroomgm@gmail.com | https://www.natashasginroom.com/ |
| The Grey | Savannah | United States | info@thegreyrestaurant.com | https://thegreyrestaurant.com/ |
| The Mountaineering Club | Seattle | United States | info@themountaineeringclub.com | https://www.themountaineeringclub.com/ |
| The Snug | Sacramento | United States | drink@snugca.com | https://www.snugca.com/ |
| Tikehau Lounge | Kihei | United States | info@tikehaulounge.com | https://tikehaulounge.com/ |
| Watch Hill Proper | Prospect | United States | watchhillproper@kbmbrands.com | https://www.watchhillproper.com/ |
| Water Witch | Salt Lake City | United States | info@waterwitchbar.com | https://waterwitchbar.com/ |
| Wild Child Wines | Lafayette | United States | wild@wildchildwines.com | https://wildchildwines.com/ |
| Elysian Budapest | Budapest | Hungary | info@elysianbudapest.com | https://elysianbudapest.com |
| Bar Pompette | Toronto | Canada | barpompette@pompette.ca | https://www.pompette.ca/barpompette |
| Bar am Wasser | Zurich | Switzerland | info@baramwasser.ch | https://baramwasser.ch |
| June on Cambie | Vancouver | Canada | info@juneoncambie.com | https://juneoncambie.com/contact/ |
| BarMünster | Zurich | Switzerland | info@barmuenster.ch | https://barmuenster.ch |
| Civil Works | Toronto | Canada | info@civilworks.ca | https://www.waterworksfoodhall.com/restaurants/civil-works |
| Marea Cocktailbar | Zurich | Switzerland | info@marea.bar | https://marea.bar |
| Prophecy | Vancouver | Canada | management@prophecybar.com | https://www.prophecybar.com |
| Old Crow | Zurich | Switzerland | info@oldcrow.ch | https://oldcrow.ch |
| Arca | Tulum | Mexico | contact@arcatulum.com | https://arcatulum.com |

### Held, not emailed

| Bar | Country | Why |
|---|---|---|
| Alquímico | Colombia | address on record but unconfirmed: site live (Centro Histórico address, current hours) but publishes no email; Instagram bio shows only a Linktree, no address |
| Capri Club | United States | agency, group or portfolio inbox: recorded capriclub@ not on the site; only printed address is robert@icecoldhospitality.com - FLAG: personal inbox on the Ice Cold Hospitality grou |
| Florattica Rooftop London | United Kingdom | address on record but unconfirmed: site live but publishes no email; Instagram bio readable and shows no address, only linktr.ee/canopylondoncity - venue appears to operate inside  |
| Viajante87 | United Kingdom | agency, group or portfolio inbox: same address still printed; site also lists talent@ and press@thesleffgroup.com - FLAG: those are PR/agency inboxes, not used |
| Courtland Club | United States | address on record but unconfirmed: site live and current (Jan 2026 menu) but publishes no email; Instagram returned no readable bio |
| The Bar at Willett | United States | address on record but unconfirmed: distillery visit page live and lists The Bar at Willett hours, but publishes no email; Instagram bio shows only a Linktree, no address |
| KINK Bar | Germany | address on record but unconfirmed: could not read either source: kink-berlin.de fetch blocked by a domain safety check, Instagram fetch blocked by the permission classifier; no evi |
| Bar Termini | United Kingdom | address on record but unconfirmed: site live for 7 Old Compton Street but publishes no email (newsletter field only); Instagram returned no readable bio |
| Patesô | Germany | address on record but unconfirmed: site live (Novalisstraße 2) but publishes a contact form only, no email; Instagram bio readable and shows hours only, no address |
| Victoria Bar | Germany | address on record but unconfirmed: site live (Potsdamer Straße 102, current hours) but publishes no email; no Instagram handle on record to check |
| Library by the Sea | Cayman Islands | address on record but unconfirmed: site live and venue active, publishes no address; Instagram bio not readable (login wall) |
| Bar ANA | United States | agency, group or portfolio inbox: same address printed on site; FLAG: anahgp.com is a hospitality-group inbox, not the bar's own baranaatl.com domain |
| Lucia | United States | address on record but unconfirmed: site live (venue open) but prints no address; Instagram bio has none either, only a post caption referenced reservations@luciala.com - not confir |
| Not No Bar | United States | same address printed on site; venue open (closed Tue/Wed weekly only) |
| Sunny's Steakhouse | United States | address on record but unconfirmed: site resolves but returns almost no readable text (JS-only page), no address extractable; Instagram bio shows Resy reservations info and no addre |
| The Hope Farm | United States | address on record but unconfirmed: site live, lists phone and address only, no email; Instagram bio has a Linktree and no address |
| Your Only Friend | United States | address on record but unconfirmed: site live and venue open, publishes no address; Instagram bio has a Linktree and no address |
| Soma | United Kingdom | address on record but unconfirmed: site live (Soho and Canary Wharf both operating), publishes no address; Instagram bio has none |
| Torno Subito | United States | address on record but unconfirmed: site resolves but returns only the venue name (JS-only page), no address; Instagram bio (venue at The Moore, Design District) shows no address |
| La Fleur En Papier Doré | Belgium | address on record but unconfirmed: site live as Het Goudblommeke in Papier (VZW Geert Van Bruaene), open daily, but publishes no address; no Instagram handle on record |
| The Library Bar at The Lanesborough | United Kingdom | stored site is the Oetker Collection portfolio domain (oetkerhotels.com); both fetches returned HTTP 429 so nothing was read - recorded address kept unconfirmed |
| Tan Tan | Brazil | address on record but unconfirmed: site would not load (TLS certificate error, 'unable to verify the first certificate'); Instagram bio public but prints no address, only a linktr. |
| Aruba Day Drink | Mexico | address on record but unconfirmed: site live and clearly this bar, but the email is Cloudflare-obfuscated ([email protected]) so no address is actually readable; Instagram login wa |
| Dolores | United States | address on record but unconfirmed: site live (Brooklyn venue, nav only, JS-heavy) but publishes no address; Instagram login wall, bio shows only the website link |
| Kato | United States | address on record but unconfirmed: site live but publishes no address on the homepage; /contact returns 404. Fetched page summary described a London location, so venue identity on  |
| Raines Law Room at the William | United States | address on record but unconfirmed: site live and still lists both locations including The William, but publishes no email address anywhere; Instagram login wall |
| Lyaness | United Kingdom | agency, group or portfolio inbox: bar's own domain prints the same address for general enquiries; flag: it is a hotel-host domain (Sea Containers London) though venue-specific. Sit |
| Dangerous Water | Spain | address on record but unconfirmed: no website on record; Instagram login wall, bio shows only 'Classic cocktail bar', hours and a barmagazine.com link, no address |
| Shakerato | Netherlands | address on record but unconfirmed: site live (Stadhouderskade 7, Amsterdam) but publishes no address; /contact returns 404 and no Instagram handle on record |
| Bisou | France | address on record but unconfirmed: site live and both Paris locations listed, but it publishes no email address; Instagram login wall. Recorded address is on a different domain (bi |
| Deck Lounge Bar | Brazil | hotel-group domain (Pestana Hotel Group). Bar still listed on the Pestana Rio page, but every address printed is a chain inbox: reservas.br@pestana.com (country-wide reservations), |
| Nipperkin | United Kingdom | address on record but unconfirmed: site could not be fetched - domain nijulondon.com blocked by the fetch tool's safety check, so liveness unconfirmed; Instagram (@nijulondon) is a |
| Rooftop @ The Social Hub Florence Lavagnini | Italy | hotel-chain/portfolio domain (The Social Hub, multi-city European group); recorded florence@thesocialhub.co is a property inbox on that chain domain. Page returned only the title o |
| Tonga Room & Hurricane Bar | United States | hotel-chain domain (Fairmont, an Accor brand). Venue is alive and still listed with hours, and the page prints tongaroom@fairmont.com, but that address is on the rejected chain dom |
| Panda & Sons | United Kingdom | address on record but unconfirmed: site live, publishes no address; Instagram age-restricted login wall |
| Mamba Negra | Colombia | address on record but unconfirmed: site live, publishes no address; IG bio shows no email. FLAG: recorded address is a group inbox on thehacienda.com.co, not the bar's own domain |
| Missy's | Canada | address on record but unconfirmed: site live, publishes no address; IG bio shows no email |
| Gage & Tollner | United States | address on record but unconfirmed: site live; homepage and /contact-us/ print no email, only a contact form and phone |
| Kimball House | United States | agency, group or portfolio inbox: same address as on record; site also prints resy@ and bryan@kimball-house.com, plus anna@sprouthouseagency.com (PR agency, not used) |
| Bar 1802 | France | address on record but unconfirmed: site live but both emails are Cloudflare-obfuscated ([email protected]), unreadable; IG bio shows no email |
| Graft Wine Shop & Wine Bar | United States | address on record but unconfirmed: site live; homepage and /contact-us-1 print no email, contact form only |
| Green Door | Germany | address on record but unconfirmed: site live; homepage and /de/kontakt/ print no email, contact form only |
| Overstory | United States | site publishes no email (Resy/Tock links and inquiry forms only); Instagram bio readable but carries no address |
| Bar Nouveau | France | no email on site (OpenTable link only, no mentions legales page); Instagram returned a login wall |
| Sastrería Martinez | Peru | agency, group or portfolio inbox: FLAG: marketing/private-events inbox, only address printed on the bar's own domain |
| Svanen | Norway | no email on site (booking link only); Instagram returned a login wall |
| Stjärtilleriet | Sweden | agency, group or portfolio inbox: FLAG: parent restaurant (Restaurang Artilleriet) inbox, the only address the bar site prints |
| Quattro Teste | Portugal | no website in record; Instagram bio readable but has no address (points to a linktr.ee) |
| A Bar Called Gemma | Sweden | website returns HTTP 404 (dead); Instagram returned a login wall |
| Ulysses | Portugal | no website in record; Instagram returned a login wall |
| Santa Cocktail Club | Italy | agency, group or portfolio inbox: FLAG: group inbox, brand runs four Italian locations; address printed as data controller contact (Hotel Santa Maria Novella srl) |
| Hiding in Plain Sight | Netherlands | site publishes no email (phone number only, no contact page); no Instagram handle in record |
| Bandista | United States | home and /contact/ publish no address (signup form and phone only); venue sits inside Four Seasons Houston but uses its own domain |
| Experimental Cocktail Club | France | agency, group or portfolio inbox: FLAG: group/portfolio site, experimentalcocktailclub.com 301-redirects to experimentalgroup.com; this address is the one listed for the Paris venu |
| María Mezcal | Peru | site publishes no email (routes reservations to Instagram DM); Instagram bio readable but carries no address |
| Null Social Lab | Serbia | website returns HTTP 402 Payment Required (not serving); Instagram bio readable but has no address |
| Dry Martini by Javier de las Muelas | Spain | agency, group or portfolio inbox: FLAG: group/portfolio inbox on the Dry Martini Organization domain, the only address the Barcelona site prints |
| Uptown | Argentina | domain no longer serves the bar: TLS certificate is issued for globaleventscrc.com, not uptownba.com |
| Nottingham Forest | Italy | no email on the home page or /contatti (JS-rendered site returned little content); no Instagram handle in record |
| Artesian | United Kingdom | chain or portfolio inbox (langhamhotels) |
| Bar Fino | United States | home and /contact publish no address, contact page is a web form only |
| Chandelier Bar | United States | chain domain |
| Tayēr + Elementary | United Kingdom | venue-specific address on own domain; site states bar is TEMPORARILY CLOSED after a fire in the building |
| Exímia | Brazil | no website; Instagram bio loaded but lists only address and rankings, no email |
| The Bar in Front of the Bar | Greece | site live and on-brand, but home page and /get-in-touch print no email (address and socials only) |
| Art Katowice | Poland | artkatowice.pl does not resolve (DNS ENOTFOUND, dead domain); Instagram bio has no email |
| Amma Don | Iceland | site prints phone only, no email; site's own Instagram link points to ox.reykjavik, not ammadonrvk; ammadonrvk bio has no email |
| Tlecān | Mexico | site is image-only with no contact page or email; Instagram returned no readable bio |
| Ananasa Tri | Serbia | no website; Instagram profile returned no bio content |
| Lost My Voice Bar | Germany | lostmyvoice.berlin fails TLS handshake (SSLV3_ALERT_HANDSHAKE_FAILURE); Instagram returned no bio content |
| Bar Mauro | Mexico | no website; Instagram bio read in full, no email |
| Ćilim Bar | Serbia | no website; Instagram bio read in full, no email |
| Café La Trova | United States | cafelatrova.com refuses connections (ECONNREFUSED); Instagram returned no bio content |
| Little Red Door | France | lrdparis.com is a JS-only site; home page and /contact render no text or email |
| La Calor | Peru | site uses WhatsApp only, no email; Instagram bio has no email |
| Tiki Bar Athens | Greece | site prints phone and WhatsApp only, no email; Instagram bio has no email |
| Mecenas | Mexico | site uses OpenTable and WhatsApp only, no email; Instagram bio has no email |
| Kultura Bar | Serbia | no website; Instagram profile returned a login wall |
| Bekeb | Mexico | home page and /contact print address and socials only, no email |
| Kumandra | Serbia | no website; Instagram bio read in full, links to linktr.ee but no email |
| Two Schmucks | Spain | twoschmucks.com returned empty content on both fetches; Instagram returned no bio content |
| Trade Sky Bar | Argentina | tradeskybar.com TLS certificate has expired, site unreachable; Instagram returned no bio content |
| Mag i Navigli | Italy | agency, group or portfolio inbox: FLAG: group/portfolio inbox - listed website is the Farmily Group site; MAG i Navigli still listed there, but no MAG-specific address is printed |
| Carousel Bar & Lounge | United States | agency, group or portfolio inbox: independent hotel, not on the chain reject list; Carousel Bar featured on site. FLAG: page also lists PR agency address hotelmonteleone@candrpr.co |
| Kissproof | France | listed site is the Wisors Hospitality Group portfolio; Kissproof page and group /contact print no email, only a form |
| Bagheera | Canada | site renders a themed JS page with no contact details; Instagram bio has no email |
| Sexy Fish | United Kingdom | home page and /contact-us print phone, address and booking system only, no email |
| Duck and Cover | Denmark | no email on home or contact page; contact form and reservation link only |
| Paradiso | Spain | site unreachable: TLS handshake failure on both paradiso.cat and www.paradiso.cat |
| CoChinChina | Argentina | website is a Meitre booking-platform page that renders no bar content; Instagram bio has no email |
| Paloma Nera | Croatia | no email on home or link-tree page; phone/WhatsApp only. Homepage also carries injected sports-betting spam content |
| Identidad | Puerto Rico | site lists phone numbers only; Instagram bio has no email |
| Angelita | Spain | FLAG: press/communications inbox of the parent group Amargueria, on a different domain - only address published on the site |
| Victor Audio Bar | Argentina | no website in record; Instagram bio readable but contains no email (linktree only) |
| String's Bar | Croatia | no website in record; Instagram bio readable but contains no email |
| Guarita Bar | Brazil | no website in record; Instagram returned only the page title (login wall), bio not readable |
| The 7 Jokers | Greece | no website in record; Instagram bio readable but contains no email |
| Presidente Bar | Argentina | events inbox, the only address published; apex domain has a TLS certificate mismatch, www works |
| Queen Mary Tavern | United States | FLAG: group/media inbox of parent company Heisler Hospitality, on a different domain - only address published |
| Fréquence | France | no website in record; Instagram bio readable but contains no email |
| Vian Cocktail Bar | Brazil | viancocktailbar.com.br returned HTTP 403; Instagram bio readable but contains no email |
| Atwater Cocktail Club | Canada | FLAG: group-bookings inbox of the Barroco restaurant group, on a different domain - only address published |
| Beogradski Koktel Klub | Serbia | no website; Instagram bio not retrievable (login wall) |
| Alenka Cocktail Bar | Czech Republic | only real address on the site; operator domain thealice.cz, not alenkacocktailbar.cz (page also shows a template placeholder info@mysite.com) |
| Wax On | Germany | no website; no email in Instagram bio |
| Otro Bar | Costa Rica | no website; no email in Instagram bio (booking link only) |
| 1930 | Italy | agency, group or portfolio inbox: FLAG: group/portfolio inbox - Farmily Group runs several bars; site deliberately publishes no direct contact for 1930 |
| Bar TwentySeven | Netherlands | FLAG: house hotel inbox (independent Hotel TwentySeven, not a listed chain); page also carries a template placeholder info@defaulthotel.com |
| Michalská Cocktail Room | Slovakia | site publishes no email; no email in Instagram bio |
| L'Antiquario | Italy | no website; no email in Instagram bio (booking link only) |
| Branie | Netherlands | website dead - branieamsterdam.com returns HTTP 404 with and without www |
| Library Bar | Canada | chain or portfolio inbox (fairmont) |
| Hommage | Sweden | site publishes no email; contact page is a form only |
| Licorería Limantour | Mexico | site publishes no email; Instagram bio not retrievable (login wall) |
| Isabel Speakeasy | Serbia | no website; Instagram bio not retrievable (login wall) |
| Minus One Bar | Czech Republic | minusone.wprague.com returns HTTP 403 to fetches; no email in Instagram bio |
| drinc. Cocktail & Conversation | Italy | site publishes phones only; Instagram bio not retrievable (login wall) |
| Tales & Spirits | Netherlands | no website; Instagram bio not retrievable (login wall) |
| La Punta Expendio de Agave | Italy | site publishes no email; no email in Instagram bio (Linktree only) |
| Shinji's | United States | shinjisbar.com returns HTTP 404; no email in Instagram bio (bio still links to that domain) |
| Cravan | France | site publishes no email; contact page lists phones and addresses only |
| Side Hustle | United Kingdom | chain domain |
| The Blue Pub | Brazil | site publishes phone/WhatsApp only; no email in Instagram bio |
| Civil Liberties | Canada | site publishes no email (chat widget only); Instagram bio not retrievable (login wall) |
| Widder Bar | Switzerland | widderhotel.com addresses are Cloudflare-obfuscated and unreadable; no bar-specific address shown, and no address guessed |
| Hanky Panky | Mexico | site publishes no email; Instagram bio gives WhatsApp only |
| Selva Oaxaca Cocktail Bar | Mexico | site publishes phone/WhatsApp only; no email in Instagram bio |
| Tres Monos | Argentina | no website; instagram bio readable but has no email |
| Landsky | Croatia | site publishes no email (home and /bar checked) |
| La Factoría | Puerto Rico | contact page offers a web form only, no address printed |
| Schmuck | United States | no email on home page; /pages/contact returns 404 |
| The Cambridge Public House | France | home page is near-empty shell, /contact returns 404 |
| El Infusionista | Peru | no website; instagram bio has no email |
| Hide | Hungary | site lists phone and WhatsApp only; instagram bio did not render (login wall) |
| Gus' Sip & Dip | United States | footer has an unresolved Email Us link but no printed address; /contact returns 404 |
| Danico | France | site is the Daroco group portfolio site; contact form only, no address printed |
| La Cachina Bar | Peru | no website; instagram bio did not render (login wall) |
| El Gallo Altanero | Mexico | no website; instagram bio has no email |
| Druid Bar | Serbia | no website; instagram bio did not render (login wall) |
| Hemingway Bar | Czech Republic | no email on home page; /kontakt returns 404; no instagram handle on file |
| Boadas | Spain | boadas.com does not resolve (dead domain); instagram bio has no email |
| Boticario | Argentina | no website; instagram bio has no email |
| The Portrait Bar | United States | own domain (bar sits in The Fifth Avenue Hotel) but contact page prints no email |
| Bar Hemingway | France | ritzparis.com returns HTTP 403 to fetches; instagram bio did not render (login wall) |
| Champagne Bar at Four Seasons Surf Club | United States | chain domain |
| Classique | France | no website; instagram bio has no email |
| Sky Leme | Brazil | chain domain |
| Humboldt Bar | Canada | contact page lists phone and address only, no email |
| Tales Bar | Switzerland | contact page offers a web form and phone only, no address printed |
| Café de Nadie | Mexico | site is a splash page with no contact details; instagram bio has no email |
| Q Bar | Serbia | no website; instagram bio has no email |
| Punch Room | Italy | chain domain |
| Morro Fi | Spain | no email on site; instagram bio did not render (login wall) |
| 1862 Dry Bar | Spain | no website; instagram bio lists a phone number only |
| Super Lyan | Netherlands | chain domain |
| La Sala de Laura | Colombia | agency, group or portfolio inbox: FLAG: group inbox shared with sister restaurant Leo; only address the site prints |
| Bar dos Arcos | Brazil | site serves a bot-verification screen; Instagram bio not readable |
| Barro Negro | Greece | no email published on site; phone only, /contact 404s |
| El Koktel | Poland | no website; Instagram bio readable but contains no email |
| Explorer Bar | Brazil | no email published on site; phone and WhatsApp only |
| Avra Bar | Greece | chain domain |
| Urania Bar | Croatia | site is a Squarespace 'under construction' placeholder; Instagram login wall |
| Atrium Bar | Italy | chain domain |
| Law & Order | Netherlands | no email published; contact form and phone only; Instagram login wall |
| A Bar with Shapes For a Name | United Kingdom | domain dead: abarwithshapesforaname.com does not resolve (NXDOMAIN, with and without www) |
| Kwãnt | United Kingdom | domain dead: kwantmayfair.com does not resolve (NXDOMAIN, with and without www) |
| Santana Bar | Brazil | no website; Instagram bio readable but contains no email |
| Baltra Bar | Mexico | site returns HTTP 500 (apex and www) |
| Old Pal | Serbia | no website; Instagram bio readable but contains no email |
| Kyara | Spain | chain or portfolio inbox (slshotels) |
| Nickel City | United States | no email published on site; /contact 404s |
| Ritz Bar | France | ritzparis.com returns HTTP 403 to fetches (bar page and /en/contact) |
| Rasputin | Italy | no email published; phone and Tableo booking only |
| The Brick Space | Italy | no website; Instagram bio readable but contains no email |
| No Goodbyes | United States | the only published address is the hotel reservations desk at The Line |
| Guldbaren | Sweden | reservations@nobishotel.com is the hotel reservations desk, not the bar |
| La Commune | France | the Syndicat group domain was already emailed at lesyndicat@syndicatcocktailclub.com in an earlier batch |
| The Cadier Bar | Sweden | info@grandhotel.se is the Grand Hotel's hotel-wide inbox, not the bar |
| Barr Hill Cocktail Bar | United States | info@caledoniaspirits.com is the distillery's corporate inbox, not the bar |
| The Living Room | United States | concierge@dewberryhotels.com is the hotel concierge desk, not the bar |
| Mad - Souls & Spirits | Italy | the published address is neri.fante@gmail.con, a personal inbox and a dead top-level domain (.con); nothing would be delivered |
| Three Sheets Soho | United Kingdom | same operator and same domain as three-sheets-dalston, which is in this batch; one email to Three Sheets, not two |
| Connaught Bar | United Kingdom | info@the-connaught.co.uk is the hotel's general inbox under Maybourne, not the bar |
| Backroom Bar | Argentina | rrhh@ is the human-resources inbox (recursos humanos), not the bar's team |

---


_2026-09-17. Built from outreach/sent-log.txt joined to the bars table on slug; "claimed now" means the row has an owner_id today._

## Performance by batch

| Batch | Sent | Weekday | Days ago | Region | Sent to | Claimed now | Claim rate |
|---|---|---|---|---|---|---|---|
| batch-1 | 2026-08-26 | Wednesday | 22 | Asia and Gulf 7, Americas 7, Europe 6 | 20 | 5 | 25% |
| batch-2 | 2026-08-27 | Thursday | 21 | Europe 7, Asia and Gulf 7, Americas 6 | 20 | 2 | 10% |
| batch-3 | 2026-08-28 | Friday | 20 | Asia and Gulf 9, Europe 7, Americas 4 | 20 | 4 | 20% |
| batch-4 | 2026-08-31 | Monday | 17 | Americas 31 | 31 | 2 | 6% |
| hotel-partner | 2026-08-31 | Monday | 17 | Asia and Gulf 7 | 7 | 1 | 14% |
| batch-5 | 2026-09-01 | Tuesday | 16 | Asia and Gulf 48 | 48 | 3 | 6% |
| batch7-us-harvest | 2026-09-01 | Tuesday | 16 | Americas 40 | 40 | 5 | 12% |
| fresh-link-recovery | 2026-09-02 | Wednesday | 15 | Asia and Gulf 2, Europe 2 | 4 | 4 | 100% |
| batch8-us-wave2 | 2026-09-02 | Wednesday | 15 | Americas 46 | 46 | 6 | 13% |
| batch9-europe-wave2 | 2026-09-03 | Thursday | 14 | Europe 41 | 41 | 4 | 10% |
| batch10-us-harvest | 2026-09-08 | Tuesday | 9 | Americas 54 | 54 | 1 | 2% |
| batch11-europe-wave3a | 2026-09-10 | Thursday | 7 | Europe 43, Asia and Gulf 1 | 44 | 10 | 23% |
| batch11-europe-wave3b | 2026-09-11 | Friday | 6 | Europe 42 | 42 | 3 | 7% |
| batch12-ca-fresh | 2026-09-11 | Friday | 6 | Americas 4 | 4 | 0 | 0% |
| batch12-ca-photo-nudge | 2026-09-11 | Friday | 6 | Americas 12 | 12 | 0 | 0% |
| batch13-phoenix | 2026-09-15 | Tuesday | 2 | Americas 9 | 9 | 3 | 33% |
| batch13-nashville | 2026-09-15 | Tuesday | 2 | Americas 6 | 6 | 0 | 0% |
| batch13-metro1 | 2026-09-15 | Tuesday | 2 | Americas 12 | 12 | 3 | 25% |
| batch14-asia-enriched | 2026-09-17 | Thursday | 0 | Asia and Gulf 3 | 3 | 0 | 0% |
| **All batches** | | | | | **463** | **56** | **12%** |

## Which days work

Two adjustments before reading anything into the weekday column. fresh-link-recovery and hotel-partner are not cold outreach (one re-sent working links to bars that had already engaged, and claimed 4 of 4; the other was a partner introduction), so they are out. Batches under a week old are out too, because a claim takes days to arrive and counting them punishes the newest sends: that removes batch11-europe-wave3b, both batch12 lanes, all three batch13 lanes and batch14.

What is left, 359 cold emails across 10 batches:

| Weekday sent | Emails | Claimed | Rate | Batches |
|---|---|---|---|---|
| Friday | 20 | 4 | 20% | 1 |
| Wednesday | 66 | 11 | 17% | 2 |
| Thursday | 105 | 16 | 15% | 3 |
| Monday | 31 | 2 | 6% | 1 |
| Tuesday | 142 | 9 | 6% | 3 |

Read this cautiously. Friday's 20% is one batch of 20 emails from 28 August and could move several points on a single claim. The honest summary is narrower than the table looks:

- **Tuesday is the weakest day we have real volume on.** 142 emails, 6%. That is the largest single-day sample and the lowest rate, and it holds across three separate batches rather than resting on one bad wave.

- **Wednesday and Thursday are the strongest days with volume behind them**, 17% and 15% over 171 emails combined.

- **Monday looks poor** (6%) but it is one batch of 31, so treat it as unproven rather than bad.

- The Friday result argues against the assumption that Friday is dead. It is one small batch, but it does not support avoiding Friday either.

The batch 14 reasoning, that a Thursday-night send lands Friday morning in Asia, is about the RECIPIENT'S weekday, which this table cannot see: it records the day we pressed send. For Asia and India sends from California those differ by one day. Worth separating properly once there are more Asia batches.

## Which regions work

| Region | Emails | Claimed | Rate |
|---|---|---|---|
| Europe | 105 | 16 | 15% |
| Asia and Gulf | 88 | 12 | 14% |
| Americas | 171 | 14 | 8% |

Same filter. The Americas are close to half of all cold outreach and convert at roughly half the rate of Europe. That gap is larger than any weekday effect in this data, and batch 16 is an Americas and Europe wave, so it is the number worth watching.

## Caveats

- 463 rows in the sent log, 56 of those bars claimed today, 12% overall.

- A claim is attributed to whichever batch contacted the bar; a bar contacted twice is counted in the first batch that reached it, so re-contact batches understate.

- The table cannot see opens, replies or bounces, only whether the bar is claimed today. A bar may have claimed for reasons unrelated to the email.
