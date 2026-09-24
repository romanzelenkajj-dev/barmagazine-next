/**
 * Title and meta description for a bar profile.
 *
 * WHY (Roman, 2026-09-17, from Search Console): bar profiles were 594 pages,
 * 9,712 impressions and 35 clicks in seven days, a 0.36% CTR against 1.50% on
 * articles and 2.64% on the city guides. 65 profiles sat at position 5 to 15
 * with roughly 5,000 impressions and ZERO clicks between them. These are
 * branded searches: someone typed the bar's name, we rank on page one, and
 * they click something else, because the old title said `Name | Cocktail Bar
 * in Warsaw` and the old description was the profile's opening prose, which
 * usually starts with history. Google's own panel already gives them hours
 * and a map, so our snippet offered nothing they wanted.
 *
 * So the snippet now answers the query: where it is, when it is open, and the
 * one credential or detail that separates this bar from the next result.
 *
 * Everything here is assembled from stored structured fields. Nothing is
 * inferred, nothing is written by hand, and a field that is missing is simply
 * left out and the sentence is shorter. The page body, the H1 and the stored
 * description are untouched.
 */
import { tileEntries, type Accolade, displayOrg } from './accolades';
import { accoladeClause } from './accolade-sentences';
import { formatHoursForCountry } from './format-hours';
import { cityLabel, subdivisionName } from './city-location';

/** Google truncates around here; the brand sits last so it is what goes. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;
const BRAND = 'BarMagazine';

/** The shape this module reads. A subset of Bar, so tests need no fixtures. */
export interface BarMetaInput {
  name: string;
  city: string;
  country: string;
  state?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  opening_hours?: string | null;
  accolades?: Accolade[] | null;
  description?: string | null;
  /** The one-line editorial summary. Written to be read on its own, which is
      exactly what a search snippet needs. */
  short_excerpt?: string | null;
  menu_highlights?: { name: string }[] | null;
}

/** En and em dashes are not used in our copy; a hyphen is. */
const noDashes = (s: string) => s.replace(/[–—]/g, '-');

/** Collapse whitespace and repair the punctuation a dropped field leaves. */
function tidy(s: string): string {
  return noDashes(s)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/,\s*,/g, ',')
    .replace(/\.\s*\./g, '.')
    .replace(/[,\s]+$/, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Street address
// ---------------------------------------------------------------------------

/** "Shop A", "52nd Floor", "Unit 3": true of the segment, but not the street. */
const UNIT = /^(?:shop|unit|suite|ste|apt|apartment|room|rm|floor|fl|level|lg\/f|g\/f|ug\/f|\d+(?:st|nd|rd|th)\s+floor|piso|planta|bloc|block)\b/i;
/** A line with a number and real words in it: "6-10 Shin Hing Street". */
const looksLikeStreet = (s: string) => /\d/.test(s) && /[A-Za-zÀ-ÿ]{3}/.test(s) && !UNIT.test(s);

/**
 * The street line only: stored addresses carry the city, the postcode and
 * often the country behind them ("Weinbergsweg 25, 10119 Berlin, Germany"),
 * and the city is said once, by the caller.
 */
export function streetAddress(address: string | null | undefined): string {
  const segs = String(address || '').split(',').map(tidy).filter(Boolean);
  if (segs.length === 0) return '';

  // Spain, Italy and Portugal put the number in its own comma segment
  // ("C/ del Marqués del Duero, 8"), so the street is the pair, not the head.
  if (!/\d/.test(segs[0]) && !UNIT.test(segs[0]) && segs[1] && /^\d+[a-zA-Z]?$/.test(segs[1])) {
    return `${segs[0]}, ${segs[1]}`;
  }

  // Otherwise the first segment that actually reads as a street line. Only
  // the first three are considered: look deeper and a postcode and city
  // ("28001 Madrid") starts to look like a street.
  const street = segs.slice(0, 3).find(looksLikeStreet);
  if (street) return street;

  // No number anywhere: whatever the venue put first, unless that is a bare
  // number or postcode, which tells a reader nothing.
  return /^[\d\s-]+$/.test(segs[0]) ? '' : segs[0];
}

// ---------------------------------------------------------------------------
// Opening hours, short form
// ---------------------------------------------------------------------------

const DAY_CANON: Record<string, string> = {
  mon: 'Mon', monday: 'Mon', tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
  wed: 'Wed', weds: 'Wed', wednesday: 'Wed', thu: 'Thu', thur: 'Thu',
  thurs: 'Thu', thursday: 'Thu', fri: 'Fri', friday: 'Fri',
  sat: 'Sat', saturday: 'Sat', sun: 'Sun', sunday: 'Sun',
};
const DAY = '(?:Mondays?|Tuesdays?|Tues|Wednesdays?|Weds|Thursdays?|Thurs?|Fridays?|Saturdays?|Sundays?|Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
const TIME = '(?:\\d{1,2}(?:[:.]\\d{2})?\\s?(?:am|pm)|\\d{1,2}:\\d{2}|noon|midnight)';
const OPEN_END = '(?:late night|late|midnight|close)';
const SEP = '(?:\\s*[-–—]\\s*|\\s+(?:to|till|til|until|thru|through)\\s+)';

const HOURS_RE = new RegExp(
  '^\\s*(?:(daily|every\\s?day)(?:\\s+' + DAY + SEP + DAY + ')?|(' + DAY + ')(?:' + SEP + '(' + DAY + '))?)' +
  '\\s*[:,]?\\s*(' + TIME + ')' + SEP + '(' + TIME + '|' + OPEN_END + ')',
  'i'
);

/**
 * Venues put the useful clause second as often as first: "Mon and Tue Closed;
 * Wed to Fri 5pm-12am", "Cafe Hours: Sun-Sat 8am-5pm. Bar Hours: Tue 5pm-12am",
 * "Open 5:30pm-Final Seating 9:15pm, Wed-Sat". So the string is split into
 * clauses and each is tried in turn, rather than anchoring on the first.
 */
function hourClauses(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/[;.]/)) {
    const clause = raw.trim();
    if (!clause) continue;
    out.push(clause);
    // "Bar Hours: Tue 5pm-12am" and "Coffee: Wed-Fri 9am-3pm" carry a label
    // in front of the days. Drop a leading label, but never a day name.
    const stripped = clause.replace(/^[A-Za-z][A-Za-z ]{0,20}:\s*/, '');
    if (stripped !== clause) out.push(stripped);
  }
  return out;
}

const canonDay = (d: string) => DAY_CANON[d.toLowerCase().replace(/s$/, '')] ?? DAY_CANON[d.toLowerCase()] ?? '';

/**
 * "Open Tue to Sat, 6pm to 2am" from the stored free text, or "" when the
 * string does not start with a day-and-time pattern we can read without
 * guessing. Only the FIRST clause is used: a snippet has no room for a full
 * week, and the first clause is the one that describes most days.
 *
 * Country convention is applied first, so a UK bar stored as "18:00-01:00"
 * reads "6pm to 1am" and a German one keeps 24-hour time.
 */
export function shortHours(
  stored: string | null | undefined,
  country: string | null | undefined
): string {
  const text = formatHoursForCountry(stored, country).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  let m: RegExpExecArray | null = null;
  for (const clause of hourClauses(text)) {
    m = HOURS_RE.exec(clause);
    if (m) break;
  }
  if (!m) return '';
  const [, everyDay, dayFrom, dayTo, start, end] = m;

  let days: string;
  if (everyDay) {
    days = 'daily';
  } else {
    const a = canonDay(dayFrom);
    if (!a) return '';
    const b = dayTo ? canonDay(dayTo) : '';
    days = b && b !== a ? `${a} to ${b}` : a;
  }

  const openEnded = new RegExp('^' + OPEN_END + '$', 'i').test(end);
  const from = start.toLowerCase();
  if (openEnded) {
    return days === 'daily' ? `Open daily from ${from}` : `Open ${days} from ${from}`;
  }
  const to = end.toLowerCase();
  return days === 'daily' ? `Open daily, ${from} to ${to}` : `Open ${days}, ${from} to ${to}`;
}

// ---------------------------------------------------------------------------
// Accolades
// ---------------------------------------------------------------------------

/**
 * The short name each list goes by. Only lists whose placing is a crisp,
 * widely recognised credential are here: these are the ones worth spending
 * title characters on. Everything else falls through to the generic title.
 */
const SHORT_ORG: Record<string, string> = {
  w50b: "World's 50 Best",
  a50b: "Asia's 50 Best",
  e50b: "Europe's 50 Best",
  na50b: "North America's 50 Best",
  '30bbi': '30 Best Bars India',
};

/**
 * A compact credential for the title, or "" when the bar has none that
 * qualifies. The year is kept: "No. 1 on World's 50 Best" with no year reads
 * as a standing claim, and a 2019 placing is not a standing claim.
 */
export function titleAccolade(accolades: unknown): string {
  for (const a of tileEntries(accolades)) {
    if (a.year == null) continue;
    // From 2026 the world list is "The 50 Best Bars" (task 121, displayOrg);
    // earlier years and the regional lists keep the short forms.
    const short = SHORT_ORG[a.org_key] && (a.year ?? 0) >= 2026 && a.org_key === 'w50b'
      ? displayOrg(a)
      : SHORT_ORG[a.org_key];
    if (short && a.rank != null) return `No. ${a.rank} on ${short} ${a.year}`;
    if (a.org_key === 'jbf' && a.kind === 'winner') return `James Beard Award Winner ${a.year}`;
    if (a.org_key === 'totc' && a.kind === 'winner') return `Spirited Award Winner ${a.year}`;
  }
  return '';
}

/** The strongest credential as a sentence, phrased as the profile phrases it. */
function accoladeSentence(accolades: unknown): string {
  const [top] = tileEntries(accolades);
  if (!top) return '';
  const clause = accoladeClause(top);
  if (!clause) return '';
  return `${clause.charAt(0).toUpperCase()}${clause.slice(1)}.`;
}

/** "Signature serves include Gladiator and Taj Twist." */
function signatureServes(highlights: { name: string }[] | null | undefined): string {
  const names = (highlights || [])
    .map(h => tidy(String(h?.name || '')))
    .filter(Boolean)
    .slice(0, 2);
  if (names.length === 0) return '';
  const list = names.length === 1 ? names[0] : `${names[0]} and ${names[1]}`;
  return `Signature serves include ${list}.`;
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

/**
 * The place a snippet says: the city, and for the US and Canada the state or
 * province with it, because "Portland" alone is two different cities in this
 * directory. Everywhere else the country is left off. `cityLabel` is the
 * site's own rule and handles the city-states, so Hong Kong prints once.
 */
function metaPlace(bar: BarMetaInput): string {
  if (!bar.city) return '';
  const sub = subdivisionName(bar.state, bar.country);
  if (sub) return cityLabel(bar.city, bar.country, sub);
  return tidy(bar.city);
}

/** "Satan's Whiskers, London", or just the name when it already says the city. */
function titleHead(bar: BarMetaInput): string {
  const place = metaPlace(bar);
  const name = tidy(bar.name);
  const nameLower = name.toLowerCase();
  const already =
    nameLower.includes(String(bar.city || '').toLowerCase().trim()) ||
    nameLower.includes(place.toLowerCase());
  if (!bar.city || already) return name;
  return `${name}, ${place}`;
}

/**
 * `Satan's Whiskers, London | Address, Hours & Drinks | BarMagazine`, with the
 * credential in place of the generic middle where the bar has one.
 *
 * The middles are tried longest first and the first one that fits inside
 * TITLE_MAX wins, so a short name gets the full promise and a long one is
 * still a complete, unclipped title rather than a sentence Google cuts in
 * half. A name so long that nothing fits is returned on its own: better a
 * bare name than a truncated claim.
 */
export function barTitle(bar: BarMetaInput): string {
  const fits = (s: string) => s.length <= TITLE_MAX;
  const withPlace = titleHead(bar);
  const nameOnly = tidy(bar.name);
  // A handful of names are long enough that "name, city" alone busts the cap
  // (Captain Foxheart's Bad News Bar & Spirit Lodge, Houston, Texas). Those
  // drop the city rather than the name: someone searching the name will
  // recognise it, and a city they cannot see costs them nothing.
  const head = fits(withPlace) ? withPlace : nameOnly;

  // A credential is the most clickable thing we own and outranks the brand,
  // so it is the one case where the brand is dropped to make room. "No. 1 on
  // World's 50 Best 2025" beats "BarMagazine" in a result list every time.
  const credential = titleAccolade(bar.accolades);
  if (credential) {
    for (const c of [`${head} | ${credential} | ${BRAND}`, `${head} | ${credential}`]) {
      if (fits(c)) return c;
    }
  }

  // The generic promise names only what the page can actually show. Promising
  // "Address, Hours & Drinks" on a bar whose row has neither an address nor
  // opening hours is the same empty snippet in a new costume, and it is the
  // click we would lose trust on.
  const has = {
    address: !!streetAddress(bar.address),
    hours: !!shortHours(bar.opening_hours, bar.country),
  };
  const generic = has.address && has.hours
    ? ['Address, Hours & Drinks', 'Hours & Drinks']
    : has.hours ? ['Hours & Drinks']
    : has.address ? ['Address & Drinks']
    : [];

  // The generic promise is worth LESS than the brand, so here the middle is
  // shortened first and the brand is kept.
  for (const middle of generic) {
    if (fits(`${head} | ${middle} | ${BRAND}`)) return `${head} | ${middle} | ${BRAND}`;
  }
  for (const middle of generic) {
    if (fits(`${head} | ${middle}`)) return `${head} | ${middle}`;
  }
  return fits(`${head} | ${BRAND}`) ? `${head} | ${BRAND}` : head;
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

/**
 * Comparison key for "have we already said this": letters and digits only,
 * with the placing words that differ between our phrasing and a venue's own
 * ("no.", "#", "ranked") and the article removed, so "No. 38 on The World's
 * 50 Best Bars 2025" and "#38 on World's 50 Best Bars 2025" come out
 * identical (displayOrg adds "The" to pre-2026 world placings; a venue's own
 * excerpt usually leaves it out).
 */
const sayKey = (s: string) =>
  s.toLowerCase().replace(/\b(?:no|number|ranked|rank|the)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * True when everything `fact` says has already been said. Only this
 * direction: a fact that merely CONTAINS an earlier word is not a repeat, and
 * testing that way would drop "Belgrade's first craft cocktail bar" purely
 * because the lead already named Belgrade.
 */
function repeats(already: string, fact: string): boolean {
  const f = sayKey(fact);
  if (!f) return true;
  return sayKey(already).includes(f);
}

/**
 * Cut to the cap without ever ending mid word: prefer the last sentence end,
 * then the last space. A stored field can be arbitrarily long (one address in
 * the directory is a full postal block), so nothing downstream may assume the
 * assembled string already fits.
 */
function clamp(s: string): string {
  if (s.length <= DESCRIPTION_MAX) return s;
  const cut = s.slice(0, DESCRIPTION_MAX + 1);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (stop > 40) return cut.slice(0, stop + 1).trim();
  const space = cut.slice(0, DESCRIPTION_MAX).lastIndexOf(' ');
  return tidy(cut.slice(0, space > 0 ? space : DESCRIPTION_MAX));
}

/**
 * Street, then hours, then the one fact that distinguishes the bar, each
 * dropped silently when the field behind it is absent. Facts are added while
 * they fit; nothing is ever cut mid sentence, so the result is always a whole
 * number of sentences.
 *
 * The last resort is the stored description, cut at a sentence end, so a row
 * with no structured data at all still has a description rather than none.
 */
export function barDescription(bar: BarMetaInput): string {
  const place = metaPlace(bar);
  const street = streetAddress(bar.address);

  const lead = street ? `${street}, ${place}.` : place ? `${place}.` : '';
  const hours = shortHours(bar.opening_hours, bar.country);

  const parts: string[] = [];
  if (lead) parts.push(lead);
  if (hours) parts.push(`${hours}.`);

  // In preference order; the first that fits is added, then the next, while
  // there is room. A credential beats a drinks list beats a neighbourhood.
  const excerpt = tidy(String(bar.short_excerpt || ''));
  const facts = [
    accoladeSentence(bar.accolades),
    excerpt ? (/[.!?]$/.test(excerpt) ? excerpt : `${excerpt}.`) : '',
    signatureServes(bar.menu_highlights),
    bar.neighborhood ? `In the ${tidy(bar.neighborhood)} neighborhood.` : '',
  ].filter(Boolean);

  for (const fact of facts) {
    // Facts overlap. Coa's excerpt is literally "#38 on World's 50 Best Bars
    // 2025", which the credential sentence has already said, and an excerpt
    // usually names the neighbourhood the neighbourhood sentence would. Said
    // twice inside 160 characters it reads like a machine wrote it.
    if (repeats(parts.join(' '), fact)) continue;
    if (bar.neighborhood && fact.startsWith('In the ') &&
        parts.join(' ').toLowerCase().includes(String(bar.neighborhood).toLowerCase())) continue;
    const next = tidy([...parts, fact].join(' '));
    if (next.length <= DESCRIPTION_MAX) parts.push(fact);
  }

  const out = clamp(tidy(parts.join(' ')));
  if (out.length >= 40) return out;

  // Nothing structured to say: fall back to the stored prose, whole
  // sentences only.
  // Whole sentences from the stored prose, and only whole ones. Cutting at a
  // word boundary leaves "guitars on the walls and" hanging in a search
  // result, which reads worse than a short description.
  const prose = tidy(String(bar.description || ''));
  if (!prose) return out;
  let built = out;
  for (const sentence of prose.match(/[^.!?]+[.!?]+(?:\s|$)/g) || []) {
    const next = tidy(built ? `${built} ${sentence}` : sentence);
    if (next.length > DESCRIPTION_MAX) break;
    built = next;
  }
  return built;
}
