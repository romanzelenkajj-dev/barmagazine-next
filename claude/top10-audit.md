# TOP 10 membership audit (2026-09-11)

Membership = bars.tier='top10' AND is_active=true, grouped by exact city
string (src/lib/supabase.ts getTop10BarsByCity). 230 top10 rows total:
228 active across 23 cities, 2 inactive. No city-string variants (no
split counts from casing or whitespace).

**21 of 23 cities sit at exactly ten. Two are at nine, both because of a
deactivated top10 row; neither is related to the 2026-09-10 hard-deleted
duplicates (all four were tier free: New Orleans, London, Dubai,
Budapest - none Sydney, none top10).**

## Sydney: 9 - genuine closure, tenth never backfilled
- `the-hook` (The Hook, tier top10) deactivated 2026-08-20. Its
  description records the reason: "Permanently closed around March 2025;
  the bar's official site..." A real closure, correctly kept inactive as
  history per policy. No duplicate row, no lost data - the list simply
  went to nine and no replacement pick was ever made.
- Repair shape: editorial backfill of a tenth Sydney pick (Roman's call).

## Seattle: 9 - pre-standard duplicate merge dropped the tier
- `zig-zag-cafe-seattle` (tier top10) deactivated 2026-08-25 as
  "Duplicate listing, this venue is listed as Zig Zag Cafe (...)",
  pointing at `zig-zag-cafe` - which is active but tier FREE (created
  2026-03-22, same website zigzagseattle.com). The merge predates the
  Kwant standard: the tier was never copied to the keeper, and no
  301 exists for /bars/zig-zag-cafe-seattle in next.config.mjs (the
  merged-slug map has only the four 2026-09-10 pairs).
- Repair shape: re-tier `zig-zag-cafe` to top10 (+ add the missing 301,
  and per the current standard the dup row would then be deleted).

## Raw audit output

```
top10 rows total: 230 (228 active, 2 inactive)

=== ACTIVE COUNTS BY CITY ===
Austin, United States: 10
  daydreamer, drinkwell, equipment-room, la-mezca, midnight-cowboy, murrays-tavern, nickel-city, papercut, the-roosevelt-room, whislers
Barcelona, Spain: 10
  boadas, dr-stravinsky, dry-martini-by-javier-de-las-muelas, foco, kyara, monk, morro-fi, paradiso, sips, two-schmucks
Boston, United States: 10
  backbar-boston, bogies-place-boston, carrie-nation-boston, daiquiris-and-daisies-boston, hecate-bar-boston, lookout-rooftop-boston, offsuit-boston, parla-boston, the-wig-shop-boston, yvonnes-boston
Chicago, United States: 10
  best-intentions, bisous, gus-sip-dip, kittys-cosmopolitan-club, kumiko, lazy-bird, meadowlark, nine-bar, queen-mary-tavern, three-dots-and-a-dash
Denver, United States: 10
  adrift-denver, american-bonded-denver, bgc-denver, cooper-lounge-denver, death-and-co-denver, run-for-the-roses-denver, spuntino-denver, family-jones-spirit-house, williams-and-graham-denver, yacht-club-denver
Dubai, United Arab Emirates: 10
  1920, blind-tiger, clap-ongaku, gaba, galaxy-bar, honeycomb-hi-fi, lpm-dubai, mimi-kakushi, salmon-guru-dubai, zuma
Hong Kong, China: 10
  argo, bar-leone, coa, darkside, gokan, penicillin, quinary, the-old-man, the-pontiac, the-savory-project
Las Vegas, United States: 10
  cleaver, doberman-drawing-room, ghost-donkey, herbs-rye, liquid-diet-las-vegas, nocturno, pachi-pachi, the-chandelier, velveteen-rabbit, white-whale
London, United Kingdom: 10
  a-bar-with-shapes-for-a-name, connaught-bar, kwant, lyaness, satans-whiskers, scarfes-bar, side-hustle, swift, tayer-elementary, three-sheets-soho
Los Angeles, United States: 10
  apotheke-los-angeles, daisy-margarita-bar, dante-beverly-hills, death-co-los-angeles, mirate, seven-grand-los-angeles, the-wolves, thunderbolt, tiki-ti, vandell
Mexico City, Mexico: 10
  baltra-bar, bar-mauro, bijou-drinkery-room, brujas, cafe-de-nadie, handshake-speakeasy, hanky-panky, licoreria-limantour, rayo, tlecan
Miami, United States: 10
  bar-kaiju, better-days-miami, cafe-la-trova, kaona-room, lost-boy-dry-goods, mama-tried-miami, sweet-liberty, the-broken-shaker, tropezon-miami, viceversa
New Orleans, United States: 10
  bar-tonique, beachbum-berrys-latitude-29, cane-table, carousel-bar-lounge, compere-lapin, cure, french-75, jewel-of-the-south, loa-bar, revel-cafe-bar
New York, United States: 10
  attaboy, bar-snack, clemente-bar, death-co-east-village, martinys, overstory, schmuck, seed-library-nyc, sip-guzzle, superbueno
Paris, France: 10
  bar-hemingway, bar-nouveau, bisou-canal, combat, danico, experimental-cocktail-club, le-syndicat, les-ambassadeurs, little-red-door, the-cambridge-public-house
Philadelphia, United States: 10
  one-tippling-place-philadelphia, a-bar-philadelphia, almanac-philadelphia, enswell-philadelphia, forsythia-philadelphia, friday-saturday-sunday-philadelphia, hop-sing-laundromat-philadelphia, southwark-philadelphia, franklin-mortgage-philadelphia, library-bar-philadelphia
San Diego, United States: 10
  false-idol, gillys-house-of-cocktails, good-enough-cocktail-club, happy-medium, noble-experiment, polite-provisions, raised-by-wolves, realm-of-the-52-remedies, the-whaling-bar, young-blood
San Francisco, United States: 10
  abv, bar-shoji, bar-sprezzatura, buena-vista-cafe, jilli, pacific-cocktail-haven, smugglers-cove, trick-dog, true-laurel, valley-club
Seattle, United States: 9  <<< 9 (not 10)
  bathtub-gin-seattle, canon-seattle, hazlewood-seattle, liberty-seattle, needle-and-thread-seattle, rob-roy-seattle, roquette-seattle, rumba-seattle, sol-liquor-lounge
Singapore, Singapore: 10
  atlas, cat-bite-club, jigger-pony, live-twice, manhattan, native, nutmeg-clove, offtrack, sago-house, side-door
Sydney, Australia: 9  <<< 9 (not 10)
  bar-planet, cantina-ok, centro-86, deadwax, deux-freres, maybe-sammy, pleasure-club, the-waratah, tigra-disco-pantera
Tokyo, Japan: 10
  bar-benfiddich, bar-high-five, bar-libre, bar-trench, punch-room-tokyo, sangai, the-bellwood, the-sg-club, tokyo-confidential, virtu
Washington DC, United States: 10
  allegory-dc, amazonia-dc, barmini-dc, copycat-co-dc, death-and-co-dc, jack-rose-dc, off-the-record-dc, press-club-dc, service-bar-dc, silver-lyan-dc

=== INACTIVE top10 ROWS ===
Seattle: zig-zag-cafe-seattle (Zig Zag Café) updated 2026-08-25T06:04:10.786899+00:00
Sydney: the-hook (The Hook) updated 2026-08-20T22:32:09.345624+00:00

=== CITY STRING VARIANTS (all top10 rows) ===
(none)
```
