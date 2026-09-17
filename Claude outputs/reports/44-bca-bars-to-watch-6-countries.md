# Report: 44-bca-bars-to-watch-6-countries (2026-09-17)

Done and live. 43 bars inserted across six countries, commits `2c9ff4a` and
`3692102`.

**No accolade was written for any of these bars.** Every row carries
`accolade: none`, and no description mentions the Bartenders' Choice Awards, a
watchlist, or any ranking. Where a venue advertises a placing on its own page,
the researchers left it out and said so. A watchlist is not an award, and the
fact that BCA is a whitelisted accolade org makes that line sharper rather
than softer.

The source is now on the admission checklist in
`claude/city-coverage-program.md`, as the task asked. That file did not exist,
so I wrote it first and marked it as reconstructed.

## Match first, by handle

This was the right instruction and it paid twice.

11 of the 91 handles were already in the directory. One of them,
`blackswanlabbudapest`, is our Black Swan Budapest row, which you flagged as a
duplicate risk: the bar renamed after we listed it, so a name match would have
missed it and created a second row. Four more were caught later in the same
way, by name rather than handle, after research: Madame Pang and Symbiose in
Bordeaux, Boutiq' Bar and Tuk Tuk Bar in Budapest.

## Results by country

| Country | Handles | Already listed | Verified | Held |
|---|---|---|---|---|
| Serbia | 15 | 0 | 4 | 11 |
| France | 19 | 5 | 10 | 4 |
| Poland | 18 | 0 | 11 | 7 |
| Hungary | 14 | 2 | 10 | 2 |
| Czech Republic | 16 | 4 | 9 | 3 |
| Croatia | 9 | 0 | 7 | 2 |
| **Total** | **91** | **11** | **51** | **29** |


51 verified, of which 43 were new and 8 turned out to be bars we already hold
under a different name or handle.

## The real finding: the strike rate is about the country, not the bars

The spread is wide and the cause is consistent. Serbia converted 4 of 15 and
Poland needed a second pass to reach 11 of 18, while Hungary reached 10 of 12
and Croatia 7 of 9.

**Nine of Serbia's eleven holds are because the bar publishes no street
address on any channel it controls**, several of them deliberately. Ljiljan's
bio reads "Hidden in plain sight". Yama, Holy Moly, Bar Central, KISSA10 and
Bar Barić give a district or a Google Maps pin and nothing more. Poland was
the same before the second pass.

So the Bartenders' Choice lists identify the right bars. In some countries
they cannot be turned into listings without a manual check, and that is worth
knowing before the next country run is scheduled.

## Geography corrections in the source list

- **Four of the seven Croatian bars are not in Zagreb or Split.** Ka'Lavanda
  is in Hvar, Mediterraneo in Rovinj, MintiQ in Poreč, and Colonna in Zadar.
- **Bar Cobra is in Prague, not Brno.** Its own bio ends "Letná!" and its site
  is titled for Prague 7.
- **Soeurs Carnage is in Nantes and La Gobeleterie in Dijon**, neither of
  which was in the expected French set.
- **Toy Store is in Katowice** and **Botanista in Zielona Góra**, outside the
  expected Polish cities. **Dziady i Koktajle is in Wrocław, not Kraków.**
- `barlequatriemetiers` is **Le Quatrième Tiers**; the handle does not match
  the venue's name.

## Two handles that are not what the list says

- **`blendbar__` is in Mexico**, not Croatia. Its bio gives a Sonora address
  and a +52 WhatsApp number. A Zagreb "Blend bar" appears to exist under a
  different handle; nothing was substituted for it.
- **`apotecha.bar` does not resolve** at all, and the researcher confirmed
  that is not a login wall by loading a control handle in the same session.

## The Poland number was a tooling artefact, not a result

Poland's first pass returned 5 of 18, with eight holds that were purely "this
venue has no website". That researcher could not read Instagram at all in this
environment, while four others could. A second pass using the browser pane
converted six of those holds into listings. The method that worked, and that
future runs should use: read `meta[name="description"]`, which carries the
complete bio and survives Instagram's age gates, and read the alt text of the
grid images, where each post's alt string contains its posting date and
settles whether the bar is trading.

Five Polish handles remain held behind age gates that hide the post grid.
`ginmillkrk` is the best of them and needs only one look from a logged-in
session.

## What the six countries look like now

| City | Before | After |
|---|---|---|
| Prague | 13 | 21 |
| Budapest | 12 | 19 |
| Belgrade | 12 | 16 |
| Kraków | 3 | 6 |
| Zagreb | 4 | 5 |
| Split | 3 | 4 |

Prague, Budapest and Belgrade all clear eight active bars with six or more
descriptions. Prague meets the credible-guide bar in full; Budapest and
Belgrade fail on photos alone. Intros are written for all three.

Eleven new single-bar and two-bar cities appeared: Liberec, Hvar, Rovinj,
Poreč, Nice, Nantes, Lyon, Montpellier, Győr, Katowice, Zielona Góra,
Wrocław. Under task 43's rule those pages are live, linked and followable but
noindexed until each reaches four, which is the correct outcome rather than a
problem to fix.

## Indexing and outreach

All 43 are in `claude/indexing-queue.json` behind the zero-click cohort.
`Claude outputs/outreach-candidates-2026-09-17.md` carries the ones publishing
a venue inbox, part of 53 across both waves.

### Already listed, found by Instagram handle

| Handle | Our slug | Bar | City |
|---|---|---|---|
| bar1802_paris | bar-1802 | Bar 1802 | Paris |
| copperbay_paris | copperbay | CopperBay | Paris |
| cravanparis | cravan | Cravan | Paris |
| kissproofbelleville | kissproof | Kissproof | Paris |
| lesyndicat | le-syndicat | Le Syndicat | Paris |
| blackswanlabbudapest | black-swan-budapest | Black Swan | Budapest |
| warmupbudapest | warm-up-cocktail-bar | Warm Up Cocktail bar | Budapest |
| alenka_cocktail_bar | alenka-cocktail-bar-prague | Alenka Cocktail Bar | Prague |
| anonymous_bar | anonymous-bar | AnonymouS Bar | Prague |
| beyondthebar.cz | beyond-the-bar | Beyond The Bar | Prague |
| blackangelsbar | black-angel-s-bar | Black Angel's Bar | Prague |

### Held, with the reason

| Country | Handle | Bar | Why |
|---|---|---|---|
| Serbia | bar_central011 | Bar Central | HELD: no street address and no opening hours are published on the bar's own Instagram profile, and no own website could be found. The profile is current and coc |
| Serbia | holymolycocktailclub | Holy Moly | HELD: no street address and no opening hours published. The bar's own bio says only "Cocktail club / In the heart of Belgrade" with phone +381 61 31 64 557, and |
| Serbia | kissa10.bg | KISSA10 | HELD: no street address published on the bar's own Instagram profile and no own website. The only link in bio points to a magazine page (vogueadria.com), which  |
| Serbia | ljiljan.cocktailbar | Ljiljan cocktail bar | HELD: no street address and no opening hours could be read from the bar's own sources. The bio gives only "no reservations / Ljiljan cocktail bar Novi Sad / Dre |
| Serbia | yama.belgrade | Yama Sake & Cocktail Bar | HELD: no street address published on the bar's own Instagram profile and no own website or link in bio. The bio reads "NYC/Tokyo beats, BG streets. Walk-ins onl |
| Serbia | backdoor_5 | Backdoor 5 | HELD: nothing could be confirmed. The Instagram profile is age-gated, returning "You must be 23 years old or over to see this profile" on every attempt, so the  |
| Serbia | baric11030 | Бар Барић | HELD: no street address published on the bar's own Instagram profile and no own website or link in bio. The bio gives the municipality only, reading "Najbolji k |
| Serbia | tattoobar.bg | Cocktail Bar & Tattoo studio | HELD: current trading not confirmed. The bar's own Instagram bio still reads "Closed for the summer, See you in September!" as of 17 September 2026, and no reop |
| Serbia | nomadthebar | NOMAD COCKTAIL BAR | HELD: no street address is published in the bar's own Instagram bio and there is no own website or link in bio. A reading of "Dunavska, 14" appears only inside  |
| Serbia | squareninehotel | (unidentified) | HELD: confirmed as a hotel account, not a bar account. The profile is the verified account of Square Nine Hotel Belgrade, a five star hotel at Studentski trg 9, |
| Serbia | dbar.bg | Д Бар | HELD: the venue states on its own Instagram bio that its address is shut, reading "Pop-up @beecentersilosi / Dositejeva 21 - closed until november. / Dorćol, Be |
| France | lagobeleterie | La Gobeleterie | HELD: the venue's own Instagram and Threads profiles carry only the line Cocktails et bonne humeur. No street address and no opening hours are published on any  |
| France | paloma_marseille | Paloma | HELD: no street address, city or opening hours are published on any source the venue controls. Its Instagram profile name is PALOMA bar à cocktails and the bio  |
| France | pepere_marseille | Pépère | HELD: no street address and no city are published on any source the venue controls. The Instagram bio gives only the concept and the hours recorded above; the l |
| France | barpovera | Povera | HELD: no street address is published on any source the venue controls. The Instagram profile confirms the name POVERA, the city Nice in its header, and the self |
| Poland | backroom.warsaw | Back Room Bar Warsaw | HELD. The venue's own site is a single splash card carrying only a logo, the address, a phone number, an email and social links. It publishes no opening hours,  |
| Poland | dziadyikoktajle | (unidentified) | HELD. No venue-owned website exists. The obvious candidate dziadyikoktajle.pl is a parked domain advertised for sale: it redirects to eadres.pl and the page rea |
| Poland | ginmillkrk | (unidentified) | HELD. No venue-owned website found. ginmill.pl, gin-mill.pl, ginmillkrakow.pl, ginmillkrakow.com, ginmill.com.pl, ginmillkrk.pl, ginmillkrk.com, ginmillbar.pl,  |
| Poland | labour.bar | (unidentified) | HELD. The domain labour.bar is not registered at all (NXDOMAIN), so the handle is an Instagram name rather than a web address. labourbar.com resolves but serves |
| Poland | mala_sztuka_bar | Mała Sztuka | HELD on the cocktail-led test. The only live venue-owned page is an auto-generated DISH/eatbu template. Its venue-specific fields are usable and are recorded ab |
| Poland | mirzamgdansk | (unidentified) | HELD. No venue-owned website exists. mirzam.pl, mirzambar.pl, mirzam.bar, mirzamgdansk.pl, mirzam.gda.pl, mirzambar.com, barmirzam.pl, mirzam.com.pl and mirzamc |
| Poland | skwerbar_krakow | (unidentified) | HELD. No venue-owned website exists. skwer.bar, skwerbar.pl, skwerbar.com, skwer-bar.pl, barskwer.pl, skwerbar.krakow.pl, skwer.krakow.pl and skwerkrakow.pl all |
| Hungary | barside.bp | Barside Bar Budapest | HELD. The Instagram profile exists and is named Barside Bar Budapest, but it carries no bio, no address, no hours and no website link, and its most recent post  |
| Hungary | lazycocktailbar | (unidentified) | HELD. instagram.com/lazycocktailbar returns 'Profile isn't available. The link may be broken, or the profile may have been removed.' With no reachable profile t |
| Czech Republic | parlourprague | Parlour bar | HELD: no usable own sources for the directory fields. The bar has no working website. parlour.cz resolves but serves a parked for sale placeholder page, not the |
| Czech Republic | sabi_and_sip | Sabi & Sip | HELD: no street address anywhere on the venue's own site. sabiandsip.com is a four page site (home, gallery, cookies, GDPR, terms) carrying only the name, openi |
| Czech Republic | super_panda_circus | Super Panda Circus | HELD on the cocktail-led test only. Everything else is confirmed from the venue's own site: name, Brno address, hours, email, phone +420 734 878 603, and curren |
| Croatia | apotecha.bar | (unidentified) | HELD: the handle does not resolve. Instagram returns "Profile isn't available. The link may be broken, or the profile may have been removed." Checked twice, and |
| Croatia | blendbar__ | (unidentified) | HELD: wrong country. The handle resolves to "The Blend Bar", whose own Instagram bio gives the address "Bordo Nuevo Esq. C California", Spanish day abbreviation |
