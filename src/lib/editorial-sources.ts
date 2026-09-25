/**
 * Editorial sources: what admitted a bar, and whether that is selective
 * enough to qualify it for a city's best-of list.
 *
 * WHY THE DISTINCTION EXISTS. The task 50 report found that "has an editorial
 * source" cannot rank bars inside a city we filled from local press, because
 * there it is the admission floor for every bar in the city. Bratislava
 * qualified 12 of 16 that way, Baudelaire Bar included, which was the whole
 * complaint. So a source only qualifies a bar if the source itself made a
 * SELECTION: a bounded "Top N", a guide with a standard, a real award.
 *
 * A tourism board page, a festival participant roster and a broad city map do
 * not qualify. They say a bar exists and is worth knowing about. They do not
 * say it is one of the best in its city.
 *
 * NEVER AN ACCOLADE. Nothing here is written to bars.accolades, scored by
 * bestAccolade, or rendered as a tile.
 */

export interface EditorialSource {
  source?: string | null;
  url?: string | null;
  note?: string | null;
  year?: number | null;
}

/**
 * Guides and awards that select by their own standard, whatever the count.
 * Matched as a lowercase substring of the source string.
 */
const SELECTIVE_NAMES = [
  'falstaff', 'michelin', 'pinnacle',
  // NOT a bare "50 best": "the 50 best bars in Dallas right now" is a local
  // directory with a headline, not the World's 50 Best Bars.
  "world's 50 best", "asia's 50 best", "europe's 50 best", "north america's 50 best",
  'james beard', 'spirited awards', 'tales of the cocktail',
  // Bare "imbibe", not just Imbibe 75 (Roman, 2026-09-18): Imbibe is a
  // national cocktail magazine, and a city guide from it is a guide with a
  // standard rather than a listing, which is the test above. Checked before
  // adding: across the 217 rows that carry editorial_sources the only
  // existing Imbibe string is "Imbibe 75", which already qualified, so this
  // newly qualifies the seven Louisville bars admitted by An Imbiber's Guide
  // and nothing else.
  'imbibe', 'punch', 'esquire', 'speed rack',
  'bartenders choice', "bartenders' choice",
  'best of warsaw', 'best of the best',
  // Gault&Millau selects by its own standard in every country edition
  // (Roman, 2026-09-24). All the spellings a source string might carry.
  'gault&millau', 'gault & millau', 'gault et millau', 'gault millau', 'gault-millau',
];

/**
 * Sources that never qualify a bar, however their title reads (Roman,
 * 2026-09-24): listicle farms and aggregators, booking and hotel-group
 * sites, tour-company and personal travel blogs, and a bar's own post about
 * its rivals. Checked before everything else, so a farm's "The 10 Best Bars
 * in Bologna (2026 ranked)" cannot pass on its count.
 *
 * Named, not inferred: each line is a publisher that appeared in our own
 * data and failed the "established publication" test. Borderline ones
 * (city portals, niche directories) are listed in the task 130b report for
 * Roman to rule on, and are NOT here.
 */
const NOT_EDITORIAL = [
  // listicle farms and aggregators
  'evendo', 'intravel', 'wanderlog', 'restaurant guru', 'restaurantguru',
  'tripadvisor', 'yelp', 'mindtrip', 'cocktayl', 'barsforkings',
  'ted valentin', 'hotelbars.guide', 'top50cocktailbars',
  // booking and hotel-group sites
  'accor', 'booking.com', 'expedia', 'hotels.com',
  // tour companies and personal travel blogs
  'city unscripted', 'into the bloom', 'the grand wine tour',
  // a bar's own post ranking its rivals
  'plumette',
];

/**
 * The word for "best" in the languages our cities publish in. A counted
 * best-of in one of these qualifies only from an ESTABLISHED publication
 * (ESTABLISHED_LOCAL): Roman accepted local-language lists on that condition,
 * because the local listicle market is where most of the noise is.
 */
const LOCAL_BEST = /\b(migliori|meilleur(?:e|s|es)?|mejores|besten|beste|najlepsz\w*|najbolj\w*|melhores|bästa|bedste|nejlepší|en iyi)\b/i;

/**
 * Established publications whose local-language best-of lists count:
 * national and city newspapers, city magazines, food and drink magazines,
 * recognised guides. Matched as a lowercase substring of the publisher, the
 * part of the source string before its first comma.
 */
const ESTABLISHED_LOCAL = [
  // Italy
  'gambero rosso', 'dissapore', 'scatti di gusto', 'identità golose', 'identita golose',
  'corriere', 'repubblica', 'il gusto', 'il mattino', 'la stampa', 'il resto del carlino',
  'napolitoday', 'bolognatoday', 'torinotoday', 'vanity fair italia', 'gq italia',
  // France, Belgium, Switzerland
  'le fooding', 'le figaro', 'le monde', 'le parisien', 'télérama', 'telerama', "l'express",
  'le point', 'lyon capitale', 'le progrès', 'le progres', 'tribune de lyon', 'sud ouest',
  'le soir', 'la libre', 'bruzz', 'le vif', 'knack', 'de standaard', 'het nieuwsblad',
  'tribune de genève', 'tribune de geneve', 'le temps', '24 heures',
  // Spain and Latin America
  'el país', 'el pais', 'el mundo', 'la vanguardia', 'el tiempo', 'el espectador',
  'semana', 'el universal', 'milenio', 'excélsior', 'excelsior', 'chilango', 'la tercera',
  // Portugal
  'público', 'publico', 'expresso', 'observador', 'nit', 'evasões', 'evasoes', 'visão', 'visao',
  // Poland
  'gazeta wyborcza', 'trójmiasto', 'trojmiasto', 'weranda', 'newsweek polska', 'wprost',
  'gazeta wrocławska', 'gazeta wroclawska', 'dziennik bałtycki', 'dziennik baltycki',
  // Croatia
  'jutarnji', 'večernji', 'vecernji', 'slobodna dalmacija', 'index.hr', 'telegram.hr',
  // Turkey
  'hürriyet', 'hurriyet', 'milliyet', 'sabah',
  // international brands with local editions
  'time out', 'condé nast', 'conde nast', 'gq ', 'vogue', 'esquire', 'tatler', 'monocle',
];

/**
 * Sources that are explicitly NOT a selection, whatever else their name says.
 * Checked first, so "Go To Warsaw ... Sky-high bars" cannot pass on the word
 * "bars" and a festival roster cannot pass on its city's name.
 */
const BROAD_NAMES = [
  'tourism', 'tourist board', 'poi listing', 'venue listing',
  'participant list', 'participant roster', 'festival',
  'going out', 'city map',
];

/** Numbers a list might spell out in its own title. */
const WORD_NUMBERS: Record<string, number> = {
  three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
};

/**
 * A "Top N" is a selection while N is small. "The 19 Best Bars in Atlanta" is
 * a pick; "57 Best Bars in Atlanta" is a directory with a headline. 25 is the
 * line, which is roughly where a city list stops being an opinion.
 */
const MAX_SELECTIVE_N = 25;

function countedSelection(text: string): boolean {
  const digits = text.match(/\b(\d{1,3})\b(?=[^.]{0,28}\b(best|essential|top|greatest|finest)\b)/i)
    || text.match(/\b(?:top|best)\b[^.]{0,12}?\b(\d{1,3})\b/i);
  if (digits) {
    const n = parseInt(digits[1], 10);
    if (n > 0 && n <= MAX_SELECTIVE_N) return true;
    if (n > MAX_SELECTIVE_N) return false;
  }
  for (const [word, n] of Object.entries(WORD_NUMBERS)) {
    if (n <= MAX_SELECTIVE_N && new RegExp(`\\b${word}\\b[^.]{0,24}\\bbest\\b`, 'i').test(text)) return true;
  }
  return false;
}

/** A counted local-language best-of: "I 10 migliori", "10 najlepszych", "en iyi 15". */
function localCountedSelection(text: string): boolean {
  const m = text.match(new RegExp(`\\b(\\d{1,3})\\b[^.]{0,20}${LOCAL_BEST.source}`, 'i'))
    || text.match(new RegExp(`${LOCAL_BEST.source}[^.]{0,20}?\\b(\\d{1,3})\\b`, 'i'));
  if (!m) return false;
  const n = parseInt(m.slice(1).find(g => g && /^\d+$/.test(g)) || '0', 10);
  return n > 0 && n <= MAX_SELECTIVE_N;
}

/** The publisher named at the front of a source string, lowercased. */
function publisherOf(text: string): string {
  return (text.split(',')[0] || '').trim();
}

/** True when this one source made a selection rather than a listing. */
export function isSelectiveSource(entry: EditorialSource | null | undefined): boolean {
  const text = String(entry?.source || '').toLowerCase().trim();
  if (!text) return false;
  if (NOT_EDITORIAL.some(b => text.includes(b))) return false;
  if (BROAD_NAMES.some(b => text.includes(b))) return false;
  if (SELECTIVE_NAMES.some(s => text.includes(s))) return true;
  if (countedSelection(text)) return true;
  // A local-language best-of counts only from an established publication.
  const pub = publisherOf(text);
  return localCountedSelection(text) && ESTABLISHED_LOCAL.some(e => pub.includes(e.trim()) || (e.endsWith(' ') && pub.startsWith(e.trim())));
}

/** True when ANY of a bar's sources is selective. */
export function hasSelectiveSource(sources: unknown): boolean {
  return toSources(sources).some(isSelectiveSource);
}

/** The stored value, defensively: the column is jsonb and may be null. */
export function toSources(sources: unknown): EditorialSource[] {
  return Array.isArray(sources) ? (sources as EditorialSource[]).filter(Boolean) : [];
}

/** The selective source to name as a bar's reason, or null. */
export function strongestSource(sources: unknown): EditorialSource | null {
  return toSources(sources).find(isSelectiveSource) ?? null;
}
