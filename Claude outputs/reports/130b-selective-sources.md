# 130b: local-language lists and Gault&Millau as selective sources

Status: **merged and live 2026-09-24 (#92).** Draft PR: https://github.com/romanzelenkajj-dev/barmagazine-next/pull/92

## The rule as built

A bar's editorial source now counts toward the numbered "The N Best Bars in X" title in any of these cases:

1. **Gault&Millau**, under any spelling ("Gault&Millau", "Gault & Millau", "Gault et Millau", "Gault-Millau").
2. **A local-language counted best-of list** with 25 bars or fewer (Italian migliori, French meilleurs, Spanish mejores, German besten or beste, Polish najlepsze, Croatian and Slovenian najbolji, Portuguese melhores, Scandinavian bästa or bedste, Czech nejlepší, Turkish en iyi), **but only** when the publisher is on the established list:
   - Italy: Gambero Rosso, Dissapore, Scatti di Gusto, Identità Golose, Corriere, la Repubblica, Il Gusto, Il Mattino, La Stampa, Il Resto del Carlino, NapoliToday, BolognaToday, TorinoToday, Vanity Fair Italia, GQ Italia.
   - France, Belgium, Switzerland: Le Fooding, Le Figaro, Le Monde, Le Parisien, Télérama, L'Express, Le Point, Lyon Capitale, Le Progrès, Tribune de Lyon, Sud Ouest, Le Soir, La Libre, BRUZZ, Le Vif, Knack, De Standaard, Het Nieuwsblad, Tribune de Genève, Le Temps, 24 heures.
   - Spain and Latin America: El País, El Mundo, La Vanguardia, El Tiempo, El Espectador, Semana, El Universal, Milenio, Excélsior, Chilango, La Tercera.
   - Portugal: Público, Expresso, Observador, NiT, Evasões, Visão.
   - Poland: Gazeta Wyborcza, Trójmiasto.pl, Weranda, Newsweek Polska, Wprost, Gazeta Wrocławska, Dziennik Bałtycki.
   - Croatia: Jutarnji list, Večernji list, Slobodna Dalmacija, Index.hr, Telegram.hr.
   - Turkey: Hürriyet, Milliyet, Sabah.
   - International: Time Out, Condé Nast, GQ, Vogue, Esquire, Tatler, Monocle.
3. English counted lists work exactly as before.

**Never counted, even with a count in the title:** booking and aggregator sites (Evendo, InTravel, Wanderlog, Restaurant Guru, Tripadvisor, Yelp, Mindtrip, Cocktayl, BarsForKings, Ted Valentin, hotelbars.guide, top50cocktailbars, Accor, Booking.com, Expedia, Hotels.com), travel blogs (City Unscripted, Into the Bloom, The Grand Wine Tour), and a rival bar's own post (Plumette).

## Data added (live on main; no effect until this PR merges)

The live classifier ignores these entries, so no title changed today.

| Source | Bars |
|---|---|
| Gault&Millau Belgium, Cocktail bars (2026) | Plumette, The Modern Alchemist, La Pharmacie Anglaise. Chemistry & Botanic's, Confessions, Life is Beautiful and Under the Stairs already carried it. |
| TorinoToday, "Una mappa dei 12 migliori cocktail bar di Torino" (30 Oct 2024) | Affini, Azotea, Bar Cavour, D.One, La Drogheria, Piano 35 |
| Telegram.hr (Super1), "8 najboljih zagrebačkih barova..." (22 Jun 2024) | Esplanade 1925, Roots, Peaches & Cream, Blend, Landsky |
| Gault&Millau Polska, 2 toques, 2026 guide | Eliksir |
| Gambero Rosso, "ecco 9 cocktail bar da provare in città" (29 Jan 2024) | L'Antiquario, Anthill. Stored verbatim; does **not** count (see below). |

## Before and after

| City | Qualifying | Title now | Title after | Why |
|---|---|---|---|---|
| **Brussels** | 3 → 7 | The Best Bars in Brussels | **The 7 Best Bars in Brussels** | Gault&Millau adds 5 bars: Chemistry & Botanic's, Confessions, Life is Beautiful, Plumette, Under the Stairs. L'Archiduc drops (its only source is Accor Limitless). |
| **Zagreb** | 2 → 6 | The Best Bars in Zagreb | **The 6 Best Bars in Zagreb** | The Telegram.hr list adds Blend, Landsky, Peaches & Cream and Roots. |
| **Turin** | 5 → 6 | The 5 Best Bars in Turin | **The 6 Best Bars in Turin** | TorinoToday adds La Drogheria and Piano 35. Smile Tree drops: it isn't on the TorinoToday list, and its only other sources are The Grand Wine Tour (2017) and Evendo. |
| Bologna | 4 → 3 | The Best Bars in Bologna | unchanged | Donkey drops (Curious Appetite, Boozing Abroad and Evendo don't count). I found no established Bologna list with a count: BolognaToday, il Resto del Carlino, Fine Dining Lovers and 2night all say "migliori" with no number. |
| Gdańsk | 4 → 3 | The Best Bars in Gdańsk | unchanged | MONK drops (Into the Bloom is a travel blog). Eliksir keeps Michelin and adds Gault&Millau Polska. |
| Naples | 4 → 4 | The Best Bars in Naples | unchanged | See the Gambero Rosso question below. |

No other city's title changes. I checked all cities against the same data snapshot.

## Your calls

1. **Gambero Rosso, Naples.** Established publisher, 9 bars, 2024. The title says "da provare" (to try), but the article's own section heading reads "I migliori cocktail bar di Napoli". As stored it doesn't count. If you count it, L'Antiquario is already qualified and Anthill joins, taking Naples to 5 and **"The 5 Best Bars in Naples"**.
2. **Feeling (Roularta), Brussels**, "10 x onze favoriete cocktailbars in Brussel" (2024). A national magazine, but "favoriete" is favourite, not best. Not added.
3. **Guadalajara Secreta** (Secret Media Network), "12 mejores bares de Guadalajara". This is a digital city guide rather than a newspaper or recognised guide, so it doesn't count. It is in the same group as Lyon Secret and Bordeaux Secret.
4. **English publishers left counting that you may want to review:** Asia Bars & Restaurants, Portugal.com, Visit Italy, The Rooftop Guide, That's So Tampa, Cleveland Traveler, Good Food Pittsburgh, Culture Trip.
5. **Vogue Türkiye, "İstanbul'un En İyi 11 Kokteyl Barı"**: first published 2018 and since updated. Not added.

Nothing else was found for Wrocław, Split, Istanbul or Cartagena. Lists that were too old, had no count, or were written by AI or a booking site were rejected (listed in the research notes).

## Tests

`src/lib/editorial-sources.test.ts`: every accept and refuse case above is covered, including Gault&Millau, TorinoToday, Telegram.hr, Le Soir, Hürriyet and El Tiempo (accept), and Evendo, InTravel, Accor, City Unscripted, Into the Bloom, Plumette, Guadalajara Secreta and the Gambero Rosso "da provare" title (refuse). Full suite and tsc pass.

## Resolved 2026-09-24 (Roman)

- Gambero Rosso Naples miniguide counts: Roman's ruling, since the section heading says "I migliori" and Gambero Rosso is Italy's leading food guide. It is stored as a dated, URL-level ruling (`RULED_SELECTIVE_URLS` in `editorial-sources.ts`), so the stored title stays verbatim. This adds Anthill.
- **Live titles after the merge:** The 5 Best Bars in Naples, The 7 Best Bars in Brussels, The 6 Best Bars in Zagreb, The 6 Best Bars in Turin. Bologna and Gdańsk stay "The Best Bars in". Asheville, San Antonio, Honolulu and Phoenix are unchanged.
