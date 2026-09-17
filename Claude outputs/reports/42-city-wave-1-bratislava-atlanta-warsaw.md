# Report: 42-city-wave-1-bratislava-atlanta-warsaw (2026-09-17)

Done and live. 32 bars inserted, commit `2c9ff4a`, intros `3692102`.

One thing to correct before the rest: **the strategy document this task cites,
`claude/city-coverage-program.md`, did not exist in the project.** I worked
from the task's own summary and then wrote the file, marked as reconstructed,
so task 44's instruction to add a source to its checklist had somewhere to go.
Correct it where it does not match what you intended.

## What the three cities look like now

| City | Before | After | New | With descriptions | With photos | Credible guide |
|---|---|---|---|---|---|---|
| Warsaw | 3 | 16 | 12 | 16 | 0 | photos only |
| Bratislava | 5 | 14 | 9 | 14 | 3 | **yes** |
| Atlanta | 4 | 13 | 9 | 12 | 0 | photos only |

Plus two separate municipalities that were in the Atlanta candidate pool and
are listed as themselves rather than folded into Atlanta: **Decatur** 1 to 2,
**Avondale Estates** 0 to 1.

All three cross the indexable threshold of four comfortably. Warsaw and
Atlanta now fail the credible-guide bar on one thing only, photos, which is
exactly what the outreach email asks bars for.

## New city and type pages

- `/best-bars/warsaw/rooftop-bars` and `/best-bars/warsaw/hotel-bars` now
  generate, both confirmed live. Warsaw has five rooftops and seven hotel bars.
- `/best-bars/bratislava/cocktail-bars` and `/best-bars/atlanta/cocktail-bars`
  generate.
- Intros written for all three, plus Belgrade, Prague and Budapest from task
  44's cities, in `src/lib/city-intros.ts`.

**Warsaw's intro is the one worth reading.** Warsaw holds no ranked bar at all
in our data, so manufacturing prestige was not available and would have been
dishonest anyway. It opens on the city's height instead, four rooms above the
street plus a terrace over the Vistula, then the specialists below.

## Four defects this wave caught, which the next one will not repeat

- **"Praha" would have split Prague in two.** The Czech research returned the
  endonym; we store "Prague". Inserting it would have created a second Prague
  page holding eight bars, noindexed as thin under task 43's rule, while the
  real Prague page kept its thirteen. City names now map onto the spelling
  already in the table.
- **Two geocodes landed in the wrong place.** UFO watch.taste.groove. came
  back 19.3 km outside Bratislava and, in the task 44 wave, Angry Monk 26.7 km
  outside Belgrade. Both addresses are correct as the venues print them: a
  bridge with no street number, and a Belgrade street the provider misreads.
  Both now carry the coordinates their own pages publish. A 40 km guard does
  not catch a 20 km error, so every wave now gets a distance check against the
  city's existing bars.
- **Seven rooftops came in as subtype "Rooftop"** where the table uses
  "Rooftop Bar", and one tiki bar as "Tiki" against "Tiki Bar". The type pages
  match on an exact string, so those eight would have sat outside their own
  type pages permanently. My fault for giving the researchers a loose list.
- **"Wrocław" slugged to "wroc-aw"**, because the Polish l has no ASCII
  decomposition for NFKD to strip.

## Admission and verification

Every bar was admitted by at least two independent local sources and then
verified against the venue's own site or Instagram. Sources used: Atlanta
Journal-Constitution, The Infatuation, Atlanta Magazine and Time Out Atlanta;
Warsaw Insider, the Warsaw Tourism Office city guide and Weranda Weekend;
World Class Cocktail Festival Slovakia, SME, Startitup, Refresher, Falstaff
Bar Guide 2026, Club Oenologique and Svoboda & Williams.

Eleven descriptions across both waves were rewritten before insert. They were
factually sound but written as verification notes, with email addresses and
phone numbers in the body copy and sentences like "posts on the venue's own
Instagram run through September 2026". That belongs in fields and flags.

## A research caveat you should know

**Two of the nine agents could not read Instagram at all in this environment**,
while the other seven could. Warsaw's researcher was one of them, so every
Warsaw handle was read from a venue-owned website instead, and six Warsaw
candidates are held purely because they are Instagram-only venues. B-Side and
Weles in particular look like real listings once someone can open their
profiles. The same failure hit the Polish BCA run in task 44, and a second
pass with the browser pane converted six of its holds into listings, so this
is a tooling problem rather than a finding about those cities.

## Indexing and outreach

All 75 bars from today's two waves are in `claude/indexing-queue.json`, behind
the zero-click cohort from task 46.

`Claude outputs/outreach-candidates-2026-09-17.md` holds **53 of the 75** that
publish a venue inbox, none of them previously emailed, one excluded as a
group inbox. Six are in the United States, the rest across Poland, the Czech
Republic, Hungary, Slovakia, France, Serbia and Croatia.


### Bratislava

| Bar | City | Address | Admitted by | Source |
|---|---|---|---|---|
| The Half Blind Pig | Bratislava | Baštová 3, Bratislava | Falstaff Bar Guide 2026 Slovakia; SME Cl | https://www.falstaff.com/en/the-best/bar-guide-2026-the-best |
| Baudelaire Bar | Bratislava | Panská 6, Bratislava 81101 | Refresher.sk Top 5 cocktail bars in Brat | https://refresher.sk/119825-Navstivili-sme-5-najlepsich-kokt |
| Bukowski Bar | Bratislava | Námestie SNP 24, Bratislava 81101 | World Class Cocktail Festival Slovakia 2 | https://www.startitup.sk/na-slovensku-dnes-startuje-kokteilo |
| Bukowski 2.0 | Bratislava | Kamenné nám. 1, Bratislava 81108 | World Class Cocktail Festival Slovakia 2 | https://www.startitup.sk/na-slovensku-dnes-startuje-kokteilo |
| Juicy | Bratislava | Panská 14, Bratislava | World Class Cocktail Festival Slovakia 2 | https://www.startitup.sk/na-slovensku-dnes-startuje-kokteilo |
| Mezcalli | Bratislava | Námestie SNP 1, 811 06 Bratislava | World Class Cocktail Festival Slovakia 2 | https://www.startitup.sk/na-slovensku-dnes-startuje-kokteilo |
| UFO watch.taste.groove. | Bratislava | Most SNP, 851 01 Bratislava, Slovensko | Club Oenologique, Bratislava cocktails:  | https://cluboenologique.com/story/best-bratislava-cocktail-b |
| The Cuba Libre Rum & Cigar House | Bratislava | Laurinská 11, Bratislava 811 01 | World Class Cocktail Festival Slovakia 2 | https://www.startitup.sk/na-slovensku-dnes-startuje-kokteilo |
| Casa del Havana | Bratislava | Michalská 26, 811 03 Bratislava | Bratislava Region official tourism board | https://www.bratislavaregion.travel/poi/6409/casa-del-havana |

**Held in Bratislava (7)**

| Bar | Why |
|---|---|
| Spin Cocktail Bar | HELD: cannot confirm the bar is currently open from its own sources. spin-bar.sk returns HTTP 404 on every path, including the /visit and menu pages that search engines s |
| Mullet Bar | HELD on address only. Cocktail-led and trading are both confirmed from own sources: mullet.sk serves the bar's own drinks menu PDF, a full house cocktail list with named  |
| Mini Bar by SPIN - Shots & Negroni Bar | HELD: no website and no Instagram account of its own could be found, so nothing can be verified against an own source. It is the sister venue to Spin Cocktail Bar, whose  |
| Brixton House | HELD on what it is. The venue's own site now presents it as Brixton Osteria, talianska reštaurácia, an Italian restaurant, with structured data typed as Restaurant and no |
| Nu Spirit Bar | HELD on what it is, and on admission. The venue's own site is built entirely around a live music and DJ programme across house, jazz, disco and electronic, with a 20:00 o |
| Outlook Bar & Lounge | HELD: the own-source page for this 13th floor bar at the Lindner Hotel Bratislava gives the address and the kitchen's lunch and dinner service times but publishes no bar  |
| Papagayo | HELD: cannot confirm it is currently trading. The venue describes itself as an LGBT+ friendly bar with drinks and music, but the papagayo.sk domain in its Instagram bio d |

### Atlanta

| Bar | City | Address | Admitted by | Source |
|---|---|---|---|---|
| Buddy Buddy | Atlanta | 931 Monroe Dr NE C-106, Atlanta, GA 30308 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| Redacted Basement Drink Parlor | Atlanta | 63b Georgia Ave SE, Atlanta, GA 30312 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| Little Spirit | Atlanta | 299 N Highland Ave NE, Atlanta, Georgia 30307 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| Anansi Cocktail Lounge | Avondale Estates | 2700 East College Avenue, Avondale Estates, GA 30030 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| BoccaLupo | Atlanta | 753 Edgewood Ave NE, Atlanta, GA 30307 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| Kimball House | Decatur | 303 East Howard Avenue, Decatur, Georgia 30030 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| Lucky Star | Atlanta | 1055 Howell Mill Road Suite 110, Atlanta, GA 30318 | Atlanta Journal-Constitution, 12 essenti | https://www.ajc.com/food-and-dining/2026/07/12-essential-atl |
| The S.O.S. Tiki Bar | Decatur | 340 Church Street, Decatur, GA 30030 | Atlanta Magazine, 57 Best Bars in Atlant | https://www.atlantamagazine.com/best-bars-atlanta/ |
| The James Room | Atlanta | 661 Auburn Ave NE Suite 280, Atlanta, GA 30312 | The Infatuation, The 19 Best Bars In Atl | https://www.theinfatuation.com/atlanta/guides/best-bars-in-a |
| Bar Margot | Atlanta | 75 14th St NE, Atlanta, GA 30309 | Time Out Atlanta, The best bars in Atlan | https://www.timeout.com/atlanta/bars/best-bars-in-atlanta-ri |
| Ranger Station | Atlanta | 684 John Wesley Dobbs Ave NE, Unit J, Atlanta, GA 30312 | Atlanta Magazine, 57 Best Bars in Atlant | https://www.atlantamagazine.com/best-bars-atlanta/ |
| The Rooftop at Hotel Clermont | Atlanta | 789 Ponce de Leon Ave., Atlanta, GA 30306 | Time Out Atlanta, The best bars in Atlan | https://www.timeout.com/atlanta/bars/best-bars-in-atlanta-ri |

**Held in Atlanta (5)**

| Bar | Why |
|---|---|
| Close Company | HELD: opening hours are not printed anywhere on the venue's own website or Instagram, and hours could not be confirmed from a venue-owned source. Everything else checks o |
| Strangers in Paradise | HELD: the venue's own website, strangersinparadiseatl.com, returns HTTP 404 on both the apex and www hosts, so no live site exists to verify against. The Instagram bio gi |
| Talat Market | HELD: the venue's own website is currently a placeholder. Its Food, Drink, FAQ and Contact sections all read Details coming soon or Contact info coming soon, and no addre |
| El Malo | HELD on the cocktail-led test. Address is confirmed from the venue's own site and hours from its own Instagram bio, but the venue's own channels present it primarily as a |
| The Upper Room | HELD on the cocktail-led test and on the address. The venue's own site headlines itself as Coffee, Wine, Cocktails and Curated Experiences and trades daytime hours from n |

### Warsaw

| Bar | City | Address | Admitted by | Source |
|---|---|---|---|---|
| Donkey Shoe | Warsaw | ul. Żelazna 51/53, 00-841 Warszawa | Warsaw Insider, Best of Warsaw 2024: Coc | https://warsawinsider.pl/best-of-warsaw-2024-cocktails/ |
| Negroni Centrale | Warsaw | Poznańska 13, 00-680 Warszawa | Warsaw Insider, Best of Warsaw 2024: Coc | https://warsawinsider.pl/best-of-warsaw-2024-cocktails/ |
| The Roof Skybar | Warsaw | Crowne Plaza Warsaw - The HUB, ul. Rondo Daszyńskiego 2, 00-843 Warszawa | Warsaw Insider, Best of Warsaw 2024: Coc | https://warsawinsider.pl/best-of-warsaw-2024-cocktails/ |
| Panorama Sky Bar | Warsaw | Warsaw Presidential Hotel, Al. Jerozolimskie 65/79, 00-697 Warszawa | Go To Warsaw (Warsaw Tourism Office), Sk | https://go2warsaw.pl/en/sky-high-bars-and-restaurants-with-a |
| Lane's Gin Bar | Warsaw | Krakowskie Przedmieście 42/44, 00-325 Warszawa | Warsaw Insider, Best of Warsaw 2023: Coc | https://warsawinsider.pl/best-of-warsaw-2023-cocktails/ |
| Kita Koguta | Warsaw | ul. Krucza 6/14, 00-950 Warszawa | Warsaw Insider, Going Out venue listing | https://warsawinsider.pl/kita-koguta-3/ |
| Zamieszanie Cocktail Bar | Warsaw | Nowy Świat 6/12, 00-400 Warszawa | Weranda Weekend, Top 8 koktajlbarów w Po | https://www.werandaweekend.pl/od-kuchni/8-najlepszych-koktaj |
| Ether Rooftop Bar | Warsaw | Chmielna 71, 00-801 Warszawa | Go To Warsaw (Warsaw Tourism Office), Sk | https://go2warsaw.pl/en/sky-high-bars-and-restaurants-with-a |
| B-Heaven Rooftop Bar | Warsaw | Wybrzeże Kościuszkowskie 43a, 00-347 Warszawa | Go To Warsaw (Warsaw Tourism Office), Sk | https://go2warsaw.pl/en/sky-high-bars-and-restaurants-with-a |
| Victoria Lounge | Warsaw | Królewska 11, 00-065 Warszawa | Weranda Weekend, Top 8 koktajlbarów w Po | https://www.werandaweekend.pl/od-kuchni/8-najlepszych-koktaj |
| Monkey Love | Warsaw | Bulwar Flotylli Pińskiej 1a, 00-468 Warszawa | Warsaw Insider, Best of Warsaw 2025: Nig | https://warsawinsider.pl/best-of-warsaw-2025-nightlife-2/ |
| Loreta bar | Warsaw | PURO Warsaw Downtown, Widok 9, 00-023 Warszawa | Go To Warsaw (Warsaw Tourism Office), Sk | https://go2warsaw.pl/en/sky-high-bars-and-restaurants-with-a |

**Held in Warsaw (9)**

| Bar | Why |
|---|---|
| B-Side | HELD: the only candidate website, bside-disco.club, leaves street address, postal code and telephone as TBA placeholders in its own structured data, most of its pages ret |
| Weles Bar | HELD: the venue owns the domain welesbar.pl but it serves nothing of its own, redirecting straight to instagram.com/welesbar. The operator site grupawarszawa.com is a par |
| Ave Pegaz | HELD on the cocktail-led test. Address, hours, email and Instagram are all confirmed from the venue's own site, but that site positions Ave Pegaz around a wide spirits se |
| Bar Wieczorny | HELD: the venue's own site is a single splash page carrying the name, the address and links to its social accounts plus company registration details, with no opening hour |
| Septem of Swords | HELD: no venue-owned website could be found, and the Instagram profile could not be fetched directly in this environment, so the street address, hours, email and signatur |
| Stage Bar | HELD: no venue-owned website and no confirmable venue Instagram account could be found, so nothing beyond the magazine's own address line could be verified from a venue s |
| 6 cocktails | HELD: the venue owns the 6cocktails.pl domain for email but publishes no website on it, and no venue Instagram account could be confirmed. Address, hours and contact deta |
| Va Bene Cicchetti | HELD: no working venue website. The group domain vabenegroup.pl shows only a placeholder saying a new site is in preparation, and vabene.pl does not resolve. Instagram co |
| TheOne Warsaw | HELD on two counts. First, the venue publishes no opening hours anywhere on its own site. Second, on what it is: its own hero banner reads restaurant, club, cocktail bar  |
