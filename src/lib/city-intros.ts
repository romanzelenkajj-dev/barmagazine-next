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
};

export function getCityIntro(citySlug: string): string | null {
  return CITY_INTROS[citySlug] ?? null;
}
