# Task 136b, listing check (from 134 batch 5)

Roman, typed go, 2026-09-26. Checked each bar on its own site and its Google Business profile (read in Chrome), then applied the fixes through the admin API and read them back.

| Bar | Finding | Evidence | Change made |
|---|---|---|---|
| Beaufort Bar (London) | Renamed, now a wine bar | The Savoy's bars page lists Beaufort Wine Bar (no Beaufort Bar); its page calls it "The Savoy House of Wine", 250 wines from 18 countries, over 120 by the glass, Head Sommelier Romain Audrerie, Tue-Sat 5pm-late. Google Business: "BEAUFORT WINE BAR", The Savoy, Floor G. | name Beaufort Wine Bar, type Wine Bar, website the new Savoy page, hours Tue-Sat 5pm-late, description and excerpt rewritten from the Savoy page (the old text described tableside martinis and a cabaret-stage cocktail room). Slug unchanged. |
| Lounge Bohemia (London) | Open | loungebohemia.com forwards to the bar's own anniversary page (tvaroh.art/experience): "Until then it's business as usual", regular bookings 07720 707 000; the bar closes to the general public 2 November to 23 December for a 20-course tasting. Google Business: cocktail bar, by appointment, open. | none |
| Soka (Bengaluru) | Open | Google Business: SOKA Cocktail Bar, ICON Boutique Hotel, Indiranagar, opens 5 PM; still lists sokabar.com. sokabar.com fails (TLS error; Cloudflare 1001 over http). | website cleared (Instagram soka_blr kept). Also found the map pin about 5.5 km off (12.9215, 77.6093); moved to the Google Business plus code point (12.9651, 77.6384) and completed the address. |
| The Cocktail Office (Singapore) | Open, moved | thecocktailoffice.com footer: 144 Robinson Road #10-02, Singapore 068908, info@thecocktailoffice.com, +65 8779 4569. Google Business owner post: "We've officially moved", same address. The .sg domain does not resolve. | website https://thecocktailoffice.com, address, pin (OSM, matches Google), phone and email from the bar's site. |

Checks after the changes: description lint and award-claims audit both clean.

Not changed, for your call: The Cocktail Office's description is first-person copy from its site ("We specialize in bespoke cocktail experiences..."); it should be rewritten in our own words. Beaufort Wine Bar: Google shows "Opens Oct 13" while the Savoy page shows regular hours; left open.
