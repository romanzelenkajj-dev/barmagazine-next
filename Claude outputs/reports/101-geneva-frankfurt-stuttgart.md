# Task 101: Geneva, Frankfurt and Stuttgart lifted to five

**Applied. Eight bars inserted, all eight geocoded to the address, and all three city pages are live with five bars.**

| City page | Live |
|---|---|
| https://barmagazine.com/bars/city/geneva | 5 bars |
| https://barmagazine.com/bars/city/frankfurt-am-main | 5 bars |
| https://barmagazine.com/bars/city/stuttgart | 5 bars |

---

# One correction to the premise

The task said the three cities were at three. **Geneva was at one.** Task 86's table reported
Geneva at 3 after the Falstaff wave, but only Le Verre à Monique was ever written; the other two
Geneva candidates were held in that same report (MO Bar, Rivage Café: hotel-group sites with no
bar page; Bambou: restaurant-first). So Geneva needed four, not two, and got four. Frankfurt's
three live under the city key `Frankfurt am Main`, which is where the page is, and the two new
rows use the same spelling so they count.

# Who was admitted, and from where

Admitting source is Falstaff for all eight, recorded in `editorial_sources` with the listing URL
and never as an accolade. Every address is the venue's own and agrees with the guide; hours,
email and handle are from the venue's own site. No description names the guide or a score, and
the insert script would have refused one that did.

## Geneva (4)

| Bar | Address | The venue in its own words |
|---|---|---|
| **Little Eminente Barrel** | Rue du Lac 15, 1207 | rum bar, "nearly 140 rums", an "intimate speakeasy", up to 50 for tastings |
| **L'Apothicaire Cocktail Club** | Boulevard Georges-Favon 16, 1204 | "the reference in Genevese mixology for over 10 years", seasonal signatures, "good vibes only" |
| **La Distillerie Bar** | Boulevard Carl-Vogt 77, 1205 | mixes and distils; "cocktails artisanaux", natural wines, local products |
| **Moon** | Rue Henri-Blanvalet 14, 1207 | 1930s New York speakeasy, "the night is our domain", clarified drinks, house spirits |

## Frankfurt am Main (2)

| Bar | Address | The venue in its own words |
|---|---|---|
| **Hunky Dory** | Baseler Strasse 10, 60329 | "Come Curious. Leave Hunky Dory."; every cocktail EUR 15; Sencha, Heartbeat, Mas Agave Por Favor |
| **Maingold** | Zeil 1, 60313 | "relaxed living room atmosphere" at the top of the Zeil; evenings only, Tue to Sat |

## Stuttgart (2)

| Bar | Address | The venue in its own words |
|---|---|---|
| **Holzmaler Bar** | Weberstrasse 9, 70182 | the woodworker's house joined to the 1920s; a menu in seven chapters |
| **Lennart Bar** | Tübinger Strasse 109, 70178 | "classic cocktail bar with no fixed menu"; "casual, honest and a little raw" |

# What was checked and set aside

The guide lists 42 Geneva, 130 Frankfurt and 73 Stuttgart bars. Everything with a rating was
read, and these were excluded under the standing rules:

- **Hotel group inboxes and sites**: MO Bar, Rivage Café, Le Bar des Bergues, Leopard Bar, Atrium,
  Il Lago (Geneva); Bar Les Nations, whose only site is geneva.intercontinental.com; Roomers, Bar
  Shuka, Oost, Max on One (Frankfurt); Wolfram, Sonderbar (Stuttgart).
- **Restaurant-first by the venue's own description** (the Fabios test): Satu ("reserve your
  culinary experience", lunch service), Sauvage ("bar à manger", shared plates and a sommelier),
  Arthur's rivegauche (on a restaurant group's site), Lili's Bar (on a restaurant's site).
- **Unverifiable**: Jacques Genève, whose site gives hours and an address and nothing else.

**Address confirmation decided the last Stuttgart place.** Schwarz Weiss Bar, the highest-rated
candidate there, prints no visiting address anywhere on its own site; the only street address on
the page is an event partner's, and its footer map pin merely agrees with the guide. Lennart's own
Instagram bio prints "Tübinger Str. 109", which matched, so Lennart went in. Schwarz Weiss is the
spare if you want a sixth; so is Bar Chroma in Frankfurt (no website, active Instagram).

One note on Lennart: its site and its Instagram give slightly different hours (19:00 on the site,
18:00 on Instagram for Wednesday and Thursday). The site's hours are stored, as the more formal
source.

# Geocoding

All eight resolved at `address` precision, between 0.3 and 1.5 km from the city centre, which is
the whole point of the task-90 and task-97 work: no centroid, no guessed point.

# Verify

Data only, no code. The award-claims gate and the rest of `npm run verify` are unaffected, and
the wave file is committed beside this report.
