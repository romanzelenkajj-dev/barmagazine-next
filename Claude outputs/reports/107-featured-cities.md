# Task 107: Santiago, Palma de Mallorca and Medellín to six; both Featured bars top their pages; Chile's country page lists six, 2026-09-22

Data only, main branch, no visual change. Active bars 1,767 -> 1,778. Live award-claims audit:
1,778 rows, 0 problems. All 11 rows at `address` precision, eyeballed against the venue's own
street. One code change rides along: `src/lib/geocode.ts` gains a `Palma de Mallorca` centre
(see below). 13 geocode tests pass.

| City | Before | After | Added |
|---|---|---|---|
| Santiago | 2 | 6 | Bar La Providencia, Siete Negronis, Gracielo Bar, Lolita Jones |
| Palma de Mallorca | 1 | 6 | Brassclub, Bar Abaco, LAB Cocktail Bar, Bar Nicolás, Sky Bar at Hotel Hostal Cuba |
| Medellín | 4 | 6 | Calante Cocktail House, Náufrago |

## Confirmed live

- **/bars/city/santiago**: The Loft first, then Siete Negronis, Bar La Providencia, Gracielo, Lolita
  Jones, Siam Thai.
- **/bars/city/palma-de-mallorca**: Dangerous Water first, then Abaco, Nicolás, Brassclub, LAB,
  Sky Bar at Hotel Hostal Cuba.
- **/bars/country/chile**: exists and lists the six, The Loft first. (The route already rendered
  for Chile because a Featured bar pre-builds it; it now clears six.)
- **/bars/city/medellin**: six, Bar Carmen and Mamba Negra ahead on their 50 Best records, then
  Mala Audio Bar, Quema Que Quema, Calante, Náufrago.

## Sources used

**Santiago.** 50 Best Discovery (Bar La Providencia, Lolita Jones; Prima Bar is held, see below),
the Spirited archive (Siete Negronis 2020 Best International Bar Team top 10, written as an
accolade record), The Clinic's "20 voces eligen el mejor bar de Santiago" (February 2025) and La
Tercera Finde's "Los 30 mejores bares para visitar en Santiago" (2023) as the Chilean press
lists. World's 50 Best 51-100: the cached lists carry 51-100 only from 2022, and no Santiago bar
appears in 2022-2025; Siete Negronis' own bio claims three years on the list (2019-2021), which
predates the cache, so no record is written and the description does not repeat it. Spirited also
carries Room 09 (2020, restaurant bar; its Instagram says "opening December 2026", so closed) and
Nkiru (2024, hotel bar; held). Top 500 Bars publishes its four list pages as a Wix app with no
readable text to a fetch or the browser, so it contributed nothing here.

**Palma.** SeeMallorca's "Top cocktail bars in Palma" (updated 22 September 2026) is the
admitting list for all five; it is the strongest Palma-specific title. 50 Best Discovery has one
Palma bar, Chapeau 1987 (held). Condé Nast Traveler and Time Out have no Palma bar list I could
find (CNT covers the island's hotels; Time Out has no Mallorca edition). Spirited: nothing in
Palma. Guía Repsol's Soletes cover Brassclub and Agabar, but only as a claim on their own bios, so
not recorded.

**Medellín.** The Medellín Cocktail Week 2026 host-bar lineup, cited from our own article
(barmagazine.com/medellin-cocktail-week-2026) with El Tiempo's May 2026 piece as corroboration.
Condé Nast Traveler (Spain) names Mamba Negra, Mala Audio Bar and Konbini; El Colombiano's "tres
bares que reinventan la noche" names Konbini too; Time Out's 2026 nightlife piece names clubs and
listening bars. Konbini is held (below).

## Held, with reasons in the wave file

- **Prima Bar** (Santiago; Discovery, La Tercera): own site carries hours and copy but no
  street; Instagram profile unavailable.
- **Nkiru Bar** (Santiago; Spirited 2024): Instagram no longer resolves and it is off Discovery's
  current Santiago page; the hotel's site still describes it. Confirm it is open, then it goes in
  on the hotel's line with its Spirited record.
- **Bar Enigma** (Santiago; La Tercera): the address is the concept, "ask for Enigma" inside
  Café Enigma in La Reina; nothing on its own channels names a street.
- **El Sindicato**: Instagram bio says "Stgo, Chile" and nothing more.
- **Chapeau 1987 and Ginbo** (Palma; the Passeig de Mallorca pair): no website, Instagram bios
  carry hours only. Both would go in on their bios' first street line.
- **Agabar, Door 13, Idem** (Palma): their domains do not resolve or refuse every connection
  (agabar.es has no DNS record; door13bar.com and idemmallorca.com time out from Node and the
  browser alike), and their Instagram bios carry no street. Weyler's bio is a joke and it has no
  site. Wineing is temporarily closed by its own site.
- **Penumbra, Konbini, Susurro Susurro** (Medellín; Cocktail Week hosts, Konbini also CNT):
  Instagram bios carry hours and no street; Penumbra's hotel (Calle Flora) serves empty pages on
  all three of its domains.
- **Excluded on their own words:** Belisario, Zombra, Casa de Nadie (restaurants), Krudo (raw
  bar), Test (unidentifiable), Piso Uno and Blue Jar (restaurants), Arca (bar de barrio with a
  world-food menu), De Tokio a Lima and Ventuno (restaurants), Hot Shop-style hotel rooftops
  where the page is the restaurant's.

## Judgment calls

- **Lolita Jones** calls itself "taquería | cocktail bar" and Discovery files it as a bar; admitted
  as Cocktail Bar + Restaurant Bar on the Wave B precedent for mixed self-descriptions. Reverse it
  and Santiago sits at five, still a page.
- **Sky Bar at Hotel Hostal Cuba** is a hotel rooftop that also serves the hotel's breakfast; admitted
  as Hotel Bar + Rooftop Bar on SeeMallorca's cocktail-bar listing and the hotel's own "open to
  the public all year for cocktails".
- **Bar Nicolás**'s address is on the Grupo Amida domain (barnicolas@grupoamida.com), a
  venue-named alias on a group domain, the class you unparked for batch 18. Stored and flagged.
- **Siete Negronis** has a site under construction; its Instagram bio is the whole of its own
  material, so the description is two sentences and no hours are stored.
- **Calante** was inserted on the form the geocoder accepts ("Carrera 35 # 8A - 24, Medellín
  050021"; the readable form landed 8 km east in Santa Elena) and the readable line restored
  after insert.

## The Palma geocoding bug, fixed

Mapbox resolves "Palma de Mallorca, Spain" to a point in Catalonia 215 km from the island. The
geocoder measures every address result against that centre, rejects the correct ones as too far,
and falls back to the wrong centre with `geo_method = city-centre`. That is what happened to all
five Palma rows on insert (production ran the old code). Fixed two ways: the five rows were set
to their address-precision coordinates through the admin API, and `src/lib/geocode.ts` now
carries `'Palma de Mallorca': [39.57, 2.65]` in `CITY_OVERRIDES` with a comment, so the next
Palma insert lands on the island. Dangerous Water was unaffected (39.5704, 2.6539). 13 geocode
tests pass. This is a fix nobody sees except that it stops being wrong, so it ships with this
push under the standing rule.

## Emails stored

9: reservas@barlaprovidencia.cl, contacto@gracielo.cl, reservas@lolitajones.cl,
info@brassclub.com, info@barlabacademy.com, barnicolas@grupoamida.com (flagged above),
info@hotelhostalcuba.com (the hotel's inbox; eyeball before a batch). None for Siete Negronis,
Abaco, Calante, Náufrago (Náufrago's is the Click Clack reservations desk, not stored).

## Files

`Claude outputs/107-featured-cities.md` (wave file with five HOLD blocks), `src/lib/geocode.ts`,
this report. One push.
