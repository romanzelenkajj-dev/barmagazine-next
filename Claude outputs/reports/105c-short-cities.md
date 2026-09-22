# 105, Wave C (cities one to three bars short): 15 bars added, four cities reach a page, 2026-09-22

Data only, main branch, no visual change. Active bars 1,736 -> 1,751. Live award-claims audit:
1,751 rows, 0 problems. All 15 rows geocoded at `address` precision (Bar K6 and Nokishita 711 on
their Japanese-form addresses, with the bilingual line restored on the address text after insert).

| City | Before | Target | After | Added |
|---|---|---|---|---|
| Basel | 4 open (5 rows) | 6 | 6 open (7 rows) | Renée Bar, Barfly |
| Lyon | 3 | 6 | 4 | Baràgones |
| Cartagena | 3 | 6 | 4 | Townhouse Rooftop |
| Kyoto | 3 | 6 | 5 | Bar K6, Nokishita 711 |
| Hanoi | 3 | 6 | 4 | Bamboo Bar |
| Calgary | 3 | 6 | 6 | Blue Rock Swim Club, Fleetwood Lounge, Prohibition Lounge |
| Sacramento | 3 | 6 | 6 | The Roost, The Jungle Bird, The Shady Lady Saloon |
| San Juan | 3 | 6 | 5 | Cui Cui, Jungle Bird (173° held, see below) |
| Split | 4 | 6 | 4 | none |
| Medellín | 4 | 6 | 4 | none |

Pages: /bars/city/basel, /lyon, /cartagena, /kyoto, /hanoi, /calgary, /sacramento, /san-juan.

## Sources used (never as accolades unless official)

Falstaff for Basel and Lyon (recorded only in editorial_sources; the insert guard confirms the
word never reaches a reader). 50 Best Discovery for Kyoto and Hanoi. Spirited Awards for Cartagena
and San Juan, written as accolade records: Townhouse Rooftop 2020 and 2022 (Best International
Hotel Bar, top 10), Cui Cui 2026 (Best New International Cocktail Bar, Latin America & Caribbean,
regional honoree), Jungle Bird San Juan 2020 (Best International Restaurant Bar, top 10). Avenue
Calgary (February 2026) for Calgary. Imbibe (June 2024) for Sacramento, plus Esquire's 2014 Best
Bars in America for the Shady Lady (no list URL survives; recorded by name and year).

Emails stored: 9 (Renée, Baràgones, Townhouse, Nokishita 711, Bamboo Bar, Blue Rock, Prohibition,
The Roost, The Jungle Bird). Bamboo Bar's is the hotel's bar mailbox.

## Why the shortfalls are real

- **Split.** Falstaff has nothing in Split (checked 09-19). Time Out Croatia's Split guide lists a
  single cocktail bar, Gaga, which has no site and no Instagram, only Facebook, so its address
  cannot be confirmed on its own channels. Everything else on the local blogs is untested by any
  list you named.
- **Medellín.** 50 Best Discovery lists three Medellín bars, all already in (Bar Carmen, Mala
  Audio Bar, Mamba Negra). No Spirited row, no Time Out or CNT list found.
- **Lyon.** Falstaff has seven Lyon rooms: L'Antiquaire (in), Baràgones (added), Celest (a
  gastronomic restaurant by its own site), Ninkasi (brewery), Cave d'à Côté (no site or
  Instagram of its own), and two whose domains are dead or hijacked (De l'Autre Côté du Pont now
  serves a gambling page; Bar Lounge le 12.2 does not resolve).
- **Cartagena.** Discovery: Alquímico and El Barón (in), Celele (restaurant), Casa San Agustín
  (hotel). Spirited's other Cartagena rows are restaurant bars (Mar y Zielo, Celele).
- **Kyoto.** Asia's 50 Best has no Kyoto entry this year. Discovery adds Bar K6 and Nokishita 711
  (both added); L'Escamoteur, Grace Note and Cocktail Stand Furek publish no address on their own
  channels (Instagram bios only), so they are held, not dropped.
- **Hanoi.** Discovery's other bars, Kumquat Tree and Use Bar, likewise publish no address on
  their own channels; Nê is Facebook-only. Held.
- **San Juan.** 173° (Spirited 2026 winner, Best International Hotel Bar, Latin America & the
  Caribbean) is on HOLD in the wave file: its Instagram names the Hotel Iberia but no street, and
  the geocoder places the hotel's 1464 Avenida Wilson 600 m from Condado. Say the word and I insert
  it on the hotel's line with the flag, which lifts San Juan to six.

## Judgment calls

- Renée Bar calls itself a bar and live venue with a DJ programme: admitted as Cocktail Bar +
  Music Bar on Falstaff's cocktail-bar classification, not as a club.
- Bamboo Bar is the Metropole's poolside hotel bar; admitted as Hotel Bar (Discovery and
  Falstaff both list it as a bar).
- Nokishita 711 is a reservation-only tasting-menu cocktail room; admitted as Cocktail Bar with
  the seating times in place of hours.
- The Shady Lady's own site claims a 2015 Spirited top-ten; the cached official lists do not carry
  it, so no record was written and the description does not mention it.
- Major Tom (Calgary, Spirited 2022 Best New top 10) calls itself modern fine dining and is out.

## Files

`Claude outputs/105c-short-cities.md` (wave file, 173° block on HOLD), this report. Pushed
together. Continuing to Wave D without waiting.
