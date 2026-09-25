# 134: task 133 rulings (source rules, Nomad Skybar, Gothenburg, photos)

Roman's decisions on the task 133 report, 2026-09-25. Status: **prepared and held.** Nothing below is live until Roman confirms in chat.

## Source rules (draft PR https://github.com/romanzelenkajj-dev/barmagazine-next/pull/93)

1. **50 Best Discovery counts.** Added to `SELECTIVE_NAMES`.
2. **Ljubljana Times counts.** Added to `ESTABLISHED_LOCAL`.
3. **Neighborhood.lv does not count, and English counted lists are judged by the publication, not the title.** A new `ESTABLISHED_ENGLISH` list works the same way as the local-language one.
   - **Kept:** Time Out, The Infatuation, Eater, Condé Nast Traveler, Tatler, Bon Appétit, Club Oenologique, Distiller Magazine, Paste, The Scotsman, the Atlanta Journal-Constitution, Post and Courier, SFGATE, Axios, GlasgowWorld, Indianapolis Monthly, Indy Week, LEO Weekly, Creative Loafing, What's On, Weranda, SME and Refresher.sk.
   - **Dropped:** Neighborhood.lv, Lyon Secret and Bordeaux Secret (Secret Media), Portugal.com, The Rooftop Guide, Good Food Pittsburgh, That's So Tampa, Cleveland Traveler, Visit Italy.
   - **Borderline, excluded until you rule:** Asia Bars & Restaurants, Near+Far Magazine, Culture Trip.
4. and 5. Secret Media and 1000things: no change, both stay excluded.

**Every page the change affects** (live data, 2026-09-25):

| City | Qualifying | Title now | Title after |
|---|---|---|---|
| Ljubljana | 2 → 6 | The Best Bars in Ljubljana | **The 6 Best Bars in Ljubljana** |
| Shenzhen | 5 → 6 | The 5 Best Bars | **The 6 Best Bars** (Alcove gains via Time Out Hong Kong) |
| Hanoi | 7 → 5 | The 7 Best Bars | **The 5 Best Bars** (Angelina, Kumquat Tree lose: Asia Bars & Restaurants) |
| Kraków | 7 → 6 | The 7 Best Bars | **The 6 Best Bars** (Movida loses: Culture Trip) |
| Lyon | 6 → 4 | The 6 Best Bars | **The Best Bars** (L'Artchimiste, Sauvage lose: Lyon Secret) |
| Bordeaux | 5 → 4 | The 5 Best Bars | **The Best Bars** (La Drôlerie loses: Bordeaux Secret) |
| Porto | 5 → 4 | The 5 Best Bars | **The Best Bars** (Onterrace loses: Portugal.com) |
| Naples | 5 → 4 | The 5 Best Bars | **The Best Bars** (Grand Tour loses: Visit Italy) |
| Riga | 4 → 1 | The Best Bars | unchanged (Herbary, Mākonis, nosaints lose: Neighborhood.lv) |
| Pittsburgh | 4 → 0 | The Best Bars | unchanged (all four came from Good Food Pittsburgh) |
| Split | 4 → 2 | The Best Bars | unchanged (Roof 68, Split Rooftop Bar lose: The Rooftop Guide) |
| Abu Dhabi | 4 → 3 | The Best Bars | unchanged (St. Regis Bar loses: Near+Far) |
| Cleveland | 2 → 1 | The Best Bars | unchanged (Cleveland Traveler) |
| Tampa | 2 → 1 | The Best Bars | unchanged (That's So Tampa) |
| Tallinn | 0 → 2 | The Best Bars | unchanged (Discovery: Whisper Sister, Sigmund Freud) |
| Sofia | 0 → 1 | The Best Bars | unchanged (Discovery: Sputnik) |
| Kyoto, Santiago, Beijing, Guangzhou, Venice | +1 or +2 each | The Best Bars | unchanged (Discovery entries) |

**Borderline decisions that would move titles:**
- Counting Asia Bars & Restaurants keeps Hanoi at 7.
- Counting Culture Trip keeps Kraków at 7.

Naples falls back to "The Best Bars" because Grand Tour's only counted source is Visit Italy. Counting the Gambero Rosso piece brought Naples to 5, and this change takes it back to 4.

## 6. Nomad Skybar replaced

- **Pamela qualifies.** Its Google Business profile lists it as a cocktail bar at Bulevardul Dimitrie Cantemir 6, 040242, updated by the business, open until 02:00.
- **GinOteca does not.** Its own Google listing calls it a gastropub.
- **Plan:** deactivate Nomad Skybar and insert Pamela, so Bucharest stays at 6.

## 7. Göteborg → Gothenburg

- **Redirects (in the same PR):** `RETIRED_CITY_SLUGS` sends `/bars/city/goteborg`, `/best-bars/goteborg` and every sub-page to `gothenburg` with a 301.
- **Data:** the six rows' city value changes to "Gothenburg" once the redirect is live, and the city index cache is refreshed.
- **Bar slugs:** they keep their `-goteborg` suffix and are unaffected.

## Reopenings

La Soirée (Rotterdam) and Speakeasy Floor (Thessaloniki) are to be added when they reopen in October. Noted in the 133 report and pending there.

## Photos

41 staged bars, 39 approved:
- **Not approved:** Stage Bar, and both Imperial Rooftop candidates, which leaves that bar with no photo.
- **Bars with two candidates:** your choice is recorded for each one.
- **BEUYS Bar:** re-cropped from the original to 1335x890, which removes the photographer signature. Checked visually.

Once confirmed, each goes live credited "Photo: <Bar name>". The unchosen candidates, the 133 staging folders and the contact sheet are then deleted.
