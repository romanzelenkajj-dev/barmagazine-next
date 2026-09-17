/**
 * Editorial intros for the top city landing pages (phase 1: top 20 cities
 * by active bar count, approved by Roman 2026-09-10). Keyed by the city's
 * URL slug (toUrlSlug output).
 *
 * PRIMARY-SOURCE RULE: every named bar, rank and award below comes from
 * our own bars.accolades records (World's 50 Best 2025, regional 50 Best
 * 2026, Spirited Awards, verified against the DB at writing time). Rank
 * claims need the annual refresh when new lists land - tracked in
 * claude/description-year-refresh-worklist.md. No em dashes; US English.
 */
export const CITY_INTROS: Record<string, string> = {
  'london':
    "London's cocktail scene runs from grand hotel rooms to experimental counters, and the world's ranking panels agree: Tayēr + Elementary and the Connaught Bar both sit in the top ten of the World's 50 Best Bars. Beyond the famous names, our list reaches from Soho institutions to Shoreditch and Bethnal Green rooms like Satan's Whiskers.",
  'new-york':
    "New York remains the deepest bench in American bartending, from Superbueno's top-twenty run on the World's 50 Best list to fixtures like Attaboy and Double Chicken Please. Our picks span Manhattan classics and the Brooklyn rooms reshaping the city's drinking culture.",
  'singapore':
    "Singapore packs more decorated bars per square mile than almost anywhere on earth. Jigger & Pony holds a top-ten spot on the World's 50 Best Bars, FURA won the 2026 Spirited Award for World's Best Bar, and a dozen more of our listings carry Asia's 50 Best recognition.",
  'hong-kong':
    "Hong Kong is home to Bar Leone, ranked the number one bar in the world on the 2025 World's 50 Best list, and the density around Central keeps the competition honest. Coa, Argo, and Penicillin round out one of Asia's most awarded neighborhoods.",
  'bangkok':
    "Bangkok has become Southeast Asia's cocktail capital, led by Bar Us inside the world's top twenty and BKK Social Club's long run on the global list. Rooms like Dry Wave Cocktail Studio and Lennon's, both high on Asia's 50 Best, show how deep the city now goes.",
  'tokyo':
    "Tokyo's bartending tradition rewards precision, and the rankings reflect it: Bar Benfiddich sits inside the World's 50 Best top twenty, with Virtù, The Bellwood, and The SG Club close behind. Expect intimate counters where the craft is the whole show.",
  'paris':
    "Paris has quietly built one of Europe's strongest cocktail benches. Bar Nouveau and The Cambridge Public House both rank inside the world's top twenty, Danico holds a global spot, and De Vie won the 2026 Spirited Award for Best New International Cocktail Bar.",
  'barcelona':
    "Barcelona holds two of the top five bars in the world: Sips at number three and Paradiso at number four on the 2025 World's 50 Best list. Around them, rooms like Dr. Stravinsky and Aldea make the city a genuine cocktail destination rather than a two-bar town.",
  'milan':
    "Milan pairs aperitivo heritage with modern ambition: Moebius Milano ranks seventh in the world, 1930 keeps its long-running place on the global list, and Camparino in Galleria carries the city's Campari history onto Europe's 50 Best.",
  'seoul':
    "Seoul's rise has been fast and loud, with Zest inside the world's top twenty on the strength of its Korean-ingredient program, and Alice Cheongdam and Bar Cham holding places on the Asian and world lists behind it.",
  'sydney':
    "Sydney's cocktail scene stretches from harbor-view hotel bars to basement rooms, anchored by Maybe Sammy's steady run on the World's 50 Best list. Our picks cover the CBD and the neighborhoods beyond it.",
  'seattle':
    "Seattle drinks seriously without shouting about it, and Roquette's place on North America's 50 Best gives the scene national standing. Our list runs from downtown dens to neighborhood rooms across the city.",
  'mexico-city':
    "Mexico City is a heavyweight: Handshake Speakeasy ranked second in the world in 2025, Bar Mauro sits at number two in North America, and Tlecān's agave-first program holds a global top-25 spot. Few cities anywhere land this many punches.",
  'miami':
    "Miami's scene mixes Cuban tradition with hotel-bar polish: Café La Trova carries the city's cantina heritage onto the World's 50 Best extended list, and Viceversa won the 2026 Spirited Award for Best U.S. Hotel Bar. Newer rooms like Bar Kaiju are pushing the city beyond the beach clubs.",
  'taipei':
    "Taipei's bar culture rewards the curious, with To Infinity & Beyond leading a group of our listings recognized on Asia's 50 Best. The scene favors small rooms, serious technique, and tea and local produce behind the bar.",
  'los-angeles':
    "Los Angeles spreads its best drinking across the map, from Mírate's top-thirty spot on North America's 50 Best to Thunderbolt in Echo Park and Daisy, the Margarita specialist. The city rewards a drive: no single strip holds it all.",
  'new-orleans':
    "New Orleans practically invented American cocktail culture, and it still delivers: Jewel of the South holds a World's 50 Best spot, Cure anchors the North American list, and rooms like the Carousel Bar and French 75 keep the classics in Spirited Awards contention.",
  'las-vegas':
    "Las Vegas runs on spectacle, but the cocktails are serious: Cleaver won the 2024 Spirited Award for Best U.S. Restaurant Bar, and our list covers both the casino-floor showpieces and the off-Strip rooms locals prefer.",
  'chicago':
    "Chicago's bench is deep and disciplined: Kumiko and Best Intentions both rank inside North America's top twenty, with Gus' Sip & Dip and Bisous close behind. From West Loop tasting counters to corner taverns, the city covers the full range.",
  'new-delhi':
    "New Delhi's cocktail moment is arriving, with Lair breaking onto the World's 50 Best extended list and Aabbcc recognized on Asia's 50 Best. Our listings track a scene growing more ambitious by the season.",

  // Phase 2 (2026-09-17): the cities filled by the coverage programme.
  // Warsaw and Belgrade hold no ranked bars in our data, so those two are
  // written from what the rooms actually are rather than from prestige.
  // Every bar named and every award cited was checked against bars.accolades
  // at writing time; two venues that advertise placings on their own pages
  // (Sky Bar Bratislava, Boutiq' Bar Budapest) carry no accolade record, so
  // neither claim is repeated here.
  'warsaw':
    "Warsaw drinks high. Several of the rooms on our list sit well above the street: Panorama Sky Bar on the fortieth floor of the Warsaw Presidential Hotel, Ether Rooftop Bar on the nineteenth at the NYX inside Varso Place, The Roof Skybar on the twenty first floor at Rondo Daszyńskiego, and Loreta bar on the top floor of PURO Warsaw Downtown. B-Heaven Rooftop Bar adds a fifth floor terrace over the Vistula in Powiśle. At ground level and below, the city runs to specialists. Negroni Centrale builds an Italian list around one drink. Bar Pacyfik works through tequila and mezcal. Lane's Gin Bar pours into hand made glassware at Hotel Bristol, and El Koktel keeps a basement of emerald walls and house made ingredients. Kita Koguta builds each drink around what the guest says they feel like, Donkey Shoe hides behind horseshoe doors in Fabryka Norblina, Zamieszanie Cocktail Bar batches and pours from frozen taps, and Monkey Love runs a listening bar on the Vistula bank.",
  'bratislava':
    "Bratislava's bar scene is compact, and most of it sits within a short walk of the Old Town. Mirror Bar, inside the Radisson Blu Carlton on Hviezdoslavovo námestie, is ranked 25 on the World's 50 Best Bars 2025 and 8 on Europe's 50 Best Bars 2026, and it took Best Cocktail Bar (Slovakia) at the Bartenders' Choice Awards 2026. Around it runs a line of concealed rooms: Michalská Cocktail Room, entered through a wardrobe upstairs at a bistro; The Half Blind Pig on Baštová; and Old Fashioned Bar, an interwar gentleman's club on Laurinská. Bukowski Bar and Bukowski 2.0 work literary cocktails on two central squares, Baudelaire Bar opens in the morning and runs late on Panská, and The Cuba Libre Rum & Cigar House keeps more than 130 rums. Antique American Bar adapts the classics to the guest. For the outlook, UFO watch.taste.groove. occupies the saucer on the pylon of Most SNP, 95 meters above the Danube.",
  'atlanta':
    "Atlanta's cocktail bars cluster tightly in a handful of neighborhoods, and several of them carry national recognition. JoJo's Beloved Cocktail Lounge, a disco-era room inside a Midtown food hall, was a regional honoree for Best U.S. Bar Team at the Tales of the Cocktail Spirited Awards in 2025 and again in 2026. Bar ANA, a late-night dessert and cocktail bar in Poncey-Highland, was a 2026 regional honoree for Best New U.S. Cocktail Bar. Ticonderoga Club, at Krog Street Market, stands at No. 85 on North America's 50 Best Bars 2026. The rest reads by neighborhood. Old Fourth Ward holds Ranger Station, an attic hideaway on John Wesley Dobbs Avenue, and The James Room, hidden behind a cafe at Studioplex on Auburn Avenue. Inman Park has Little Spirit and BoccaLupo. Lucky Star runs as a Taiwanese cafe by day in West Midtown, and Redacted Basement Drink Parlor sits below street level in Summerhill.",
  'belgrade':
    "Belgrade's cocktail rooms gather in Stari Grad, Dorćol and Vračar, and the city's two current award holders sit at opposite ends of the format. Beogradski Koktel Klub won Best Cocktail Bar (Serbia) at the Bartenders' Choice Awards 2026. Dragoljub, a New Balkan Cuisine house beside the Atelje 212 theater that runs a cocktail and snack concept on its lower level, won Best Cocktail Menu (Serbia) in the same year. What surrounds them is a set of very specific ideas. Rakia Bar Belgrade builds everything on rakija, the Serbian fruit brandy. Noble Roots grows its produce on the bar's own allotment in Sopot. Null Social Lab writes its list with an artist, a robot and artificial intelligence. Riddle Bar and Druid Bar make drinks bespoke to each guest. Ananasa Tri and Ćilim Bar both run guest shifts with visiting bartenders, and Elizabeth pours inside the restored 1912 Hotel Bristol in Savamala.",
  'prague':
    "Prague's bar culture is long established and runs deep. Alma Prague, the cocktail room inside a multi-part venue in the New Town, is ranked 25 on Europe's 50 Best Bars 2026. Forbína Bar, a theatrical room on Národní beside the National Theatre, is ranked 38 on the same list and took Best Cocktail Bar (Czechia) at the Bartenders' Choice Awards 2026. Taigen, a two-person Vinohrady bar with a Japanese-influenced approach, won Best Cocktail Menu (Czechia) that same year. Beyond them the city is dense with worked-out concepts: AnonymouS Bar on the Gunpowder Plot, The Alchemist Bar on the court of Rudolf II, Black Angel's Bar in a Gothic cellar off Old Town Square, Hemingway Bar with the most extensive absinthe selection in the country. Golden Eye looks over the Vltava from the roof of the Fairmont, Minus One Bar runs several rooms below Wenceslas Square, and Bar Cobra and Café Bar Pilotů serve Letná and Vršovice.",
  'budapest':
    "Budapest's cocktail bars stack up in the seventh district and reach across the river. Elysian Budapest, built on Hungarian produce, house fermentation and zero-waste practice, won Best Cocktail Bar (Hungary) at the Bartenders' Choice Awards 2026. Leo Rooftop, eight floors above the Buda end of the Chain Bridge, won Best Cocktail Menu (Hungary) the same year. The depth is in everything around them. Boutiq' Bar has worked through more than fifteen years of the city's cocktail revolution. Hotsy Totsy seats every guest by design and holds Hudson Bar, a bar within a bar, inside it, while the same team opened Lilith Budapest on Rumbach Sebestyén utca. Cooldown Budapest applies Japanese minimalism on Nagy Diófa utca, Warm Up Cocktail bar opens with a conversation and builds to taste, and SEVEN Cocktail Bar pours Seven Hills Distillery's Tokaj gin. Múzsa at the Gresham Palace, Blue Fox The Bar at the Kempinski and High Note SkyBar at the Aria cover the hotel rooms.",

  // Phase 3 (2026-09-17): the US city fill. Dallas and Portland Oregon hold
  // two or three ranked bars each, so both are written from the rooms and
  // the neighborhoods rather than from prestige. Portland here is Oregon;
  // Portland, Maine is a separate city entry and is never named.
  'dallas':
    "Dallas splits its drinking between grand hotel rooms and independent bars out in the neighborhoods. Midnight Rambler, the subterranean lounge beneath The Joule on Main Street, was a Top 10 Nominee for Best U.S. Hotel Bar at the Tales of the Cocktail Spirited Awards in 2026, and Catbird, the rooftop above the Thompson downtown, was a Regional Honoree in the same category that year. In Oak Cliff, Ayahuasca Cantina, an agave bar with a menu organized by era of Mexican history, was a semifinalist for Outstanding Bar at the James Beard Awards in 2026. The older hotel side holds its ground: The French Room Bar off the lobby of the Adolphus, The Mansion Bar in a 1920s house on Turtle Creek, and The Library Bar, a wood paneled piano room inside the Warwick Melrose. The independent rooms are smaller and looser, from Armoury D.E. on Elm Street in Deep Ellum to Parliament in Uptown and Las Almas Rotas and its mezcal back bar in Exposition Park.",
  'portland':
    "Portland is a city of specific rooms, and two of them carry national standing. Scotch Lodge, a below-ground whisky bar built around Scotch, sits at No. 63 on North America's 50 Best Bars 2026 and won Outstanding Bar at the James Beard Awards in 2026. Hey Love, the plant-filled lobby bar of the Jupiter NEXT on East Burnside, won Best U.S. Hotel Bar at the Tales of the Cocktail Spirited Awards in 2023. Around them the city keeps one of nearly everything: Multnomah Whiskey Library and its climbing walls of bottles above Southwest Alder Street, the tiki bar Hale Pele on Northeast Broadway, Bible Club's Prohibition era rooms tucked into a Sellwood house, and hotel bars in the 1950s Driftwood Room at Hotel deLuxe and Pacific Standard at KEX. Neighborhood bars do the rest of the work, among them Angel Face in Kerns, Rum Club on Southeast Sandy Boulevard, Arbor Hall in Montavilla, and Malpractice on the Central Eastside.",
};

export function getCityIntro(citySlug: string): string | null {
  return CITY_INTROS[citySlug] ?? null;
}
