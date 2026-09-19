import { cityBase } from './city-base';

/**
 * Suburbs that belong to a metro, and the metro they belong to.
 *
 * THE SHAPE (task 79): a bar belongs to a METRO and carries an AREA inside
 * it. Beverly Hills is an area of Los Angeles, so its bar sits on the Los
 * Angeles page and in the Los Angeles dropdown entry, while "Beverly Hills"
 * stays searchable and stays printed on the card.
 *
 * WHY THIS IS A LIST AND NOT A RULE: "is Oakland part of San Francisco" is
 * exactly the question a script must never answer on its own. Oakland has 16
 * bars and is its own city; Beverly Hills has one and is not. Every line here
 * is a human decision, and nothing folds until it appears below.
 *
 * WHY NOTHING IS WRITTEN TO THE DATABASE: the rollup happens where the city
 * index is built, so `bars.city` keeps saying "Beverly Hills", which is true
 * and which is what makes the area recoverable. Removing a line here puts the
 * city back exactly as it was. A migration that overwrote the column would
 * make a wrong line unrecoverable, and would have to be re-run for every bar
 * added afterwards.
 *
 * KEYED ON STATE, NOT JUST NAME: Decatur, Georgia is an area of Atlanta.
 * Decatur, Illinois is not anything of Chicago. A rollup that matched on the
 * city name alone would eventually fold the wrong one.
 */
export interface MetroRollup {
  /** The metro the areas fold into, as it is spelled in bars.city. */
  metro: string;
  country: string;
  /**
   * The state the METRO is filed under, and the state a rolled row is treated
   * as being in for grouping. Null outside the US and Canada.
   *
   * These differ for a metro that straddles a state line: Kansas City is
   * filed under MO, and Shawnee is in KS. Without normalising the rolled
   * row's state to the metro's, city-keys would see two states under one
   * base and split the metro into kansas-city-mo and kansas-city-ks, which
   * is the opposite of what the rollup is for.
   */
  state: string | null;
  /**
   * The city strings that fold in, with the state each one is actually in.
   * A bare string means the area shares the metro's state, which is the
   * common case; the object form is for the ones that cross a line.
   */
  areas: (string | { name: string; state: string })[];
}

/**
 * PROPOSED, AND NOT YET APPROVED. Roman approves this list line by line
 * (task 79). Until he does, this file is the proposal in a form he can click
 * through on a preview rather than a plan in a document.
 */
export const METRO_ROLLUP: MetroRollup[] = [
  // Los Angeles County. Beverly Hills and Santa Monica are enclosed by or
  // directly adjacent to the city.
  //
  // LONG BEACH IS DELIBERATELY NOT HERE (Roman, 2026-09-19). It sits in the
  // Los Angeles-Long Beach-Anaheim metro and carries one bar, which is the
  // case for folding it; it is also a city of 460,000 with its own port,
  // downtown and identity, which is the case against. Same judgement as
  // Oakland: size and self-identity beat metro membership. Baby Gee keeps
  // its own Long Beach entry.
  { metro: 'Los Angeles', country: 'United States', state: 'CA', areas: ['Beverly Hills', 'Santa Monica'] },

  // DeKalb County, inside the Atlanta metro. Avondale Estates borders Decatur.
  { metro: 'Atlanta', country: 'United States', state: 'GA', areas: ['Decatur', 'Avondale Estates'] },

  // Middlesex County, directly across the Charles from Boston.
  { metro: 'Boston', country: 'United States', state: 'MA', areas: ['Somerville'] },

  // Miami-Dade. Miami Beach is a separate municipality across the bay.
  { metro: 'Miami', country: 'United States', state: 'FL', areas: ['Miami Beach'] },

  // Jefferson County, inside the Louisville metro.
  { metro: 'Louisville', country: 'United States', state: 'KY', areas: ['Prospect'] },

  // Macomb County, inside the Detroit metro.
  { metro: 'Detroit', country: 'United States', state: 'MI', areas: ['St. Clair Shores'] },

  // Johnson County, Kansas, inside the Kansas City metro, which straddles the
  // state line: the metro is filed under MO and these areas are in KS. NOTE:
  // the Kansas City rows themselves arrive with the wave 3 insert; until that
  // runs this folds Shawnee into a metro with no other bars, which is
  // harmless but does nothing.
  {
    metro: 'Kansas City', country: 'United States', state: 'MO',
    areas: [{ name: 'Shawnee', state: 'KS' }],
  },

  // Makati is a city of Metro Manila, not a neighbour of it.
  { metro: 'Manila', country: 'Philippines', state: null, areas: ['Makati'] },
];

interface RollupTarget {
  metro: string;
  metroBase: string;
  /** The state the rolled row is grouped under: the METRO's, not its own. */
  metroState: string | null;
}

/** area base + country + the area's own state -> the metro it folds into. */
const BY_AREA = new Map<string, RollupTarget>();
for (let i = 0; i < METRO_ROLLUP.length; i += 1) {
  const r = METRO_ROLLUP[i];
  const target: RollupTarget = {
    metro: r.metro,
    metroBase: cityBase(r.metro),
    metroState: r.state ? r.state.toUpperCase() : null,
  };
  for (let j = 0; j < r.areas.length; j += 1) {
    const a = r.areas[j];
    const name = typeof a === 'string' ? a : a.name;
    const areaState = typeof a === 'string' ? (r.state || '') : a.state;
    BY_AREA.set(`${cityBase(name)}|${r.country}|${areaState.toUpperCase()}`, target);
  }
}

/** metro base + country -> the metro's display spelling. */
const METRO_DISPLAY = new Map<string, string>();
for (let i = 0; i < METRO_ROLLUP.length; i += 1) {
  const r = METRO_ROLLUP[i];
  METRO_DISPLAY.set(`${cityBase(r.metro)}|${r.country}`, r.metro);
}

/**
 * The metro a row folds into, or null when the row is already its own city.
 *
 * A row whose state is unknown does NOT fold: a rollup is a positive claim
 * about where a bar is, and a null state cannot support one. This is the
 * opposite of the null-state rule in city-keys, deliberately, because there
 * absorbing a row keeps it on its own page while here it would move it.
 */
export function rollupTarget(row: { city?: string | null; country?: string | null; state?: string | null }): RollupTarget | null {
  if (!row.city || !row.country) return null;
  const state = typeof row.state === 'string' && row.state.trim() ? row.state.trim().toUpperCase() : '';
  return BY_AREA.get(`${cityBase(row.city)}|${row.country}|${state}`) ?? null;
}

/**
 * The metro a bar is listed under: its own city, unless that city folds.
 *
 * This is what the dropdown lists and what the city filter compares against.
 * Using `bar.city` directly there is the bug it exists to prevent: the option
 * would read "Los Angeles" while Polo Lounge still says "Beverly Hills", so
 * choosing Los Angeles would hide it.
 */
export function metroCityOf(bar: { city?: string | null; country?: string | null; state?: string | null }): string {
  return rollupTarget(bar)?.metro ?? (bar.city || '');
}

/**
 * Every raw `bars.city` value that a metro selection should return.
 *
 * The city filter is applied SERVER side as `.eq('city', ...)`, so filtering
 * on "Los Angeles" alone drops the Beverly Hills, Santa Monica and Long Beach
 * rows before the client ever sees them. The dropdown offers the metro, so
 * the query has to ask for the metro's whole set.
 */
export function cityStringsForMetro(metro: string): string[] {
  const out = [metro];
  for (let i = 0; i < METRO_ROLLUP.length; i += 1) {
    const r = METRO_ROLLUP[i];
    if (cityBase(r.metro) !== cityBase(metro)) continue;
    for (let j = 0; j < r.areas.length; j += 1) {
      const a = r.areas[j];
      out.push(typeof a === 'string' ? a : a.name);
    }
  }
  return out;
}

/** Every string the free-text search should match a bar on for location. */
export function searchTermsOf(bar: { city?: string | null; country?: string | null; state?: string | null; neighborhood?: string | null }): string[] {
  const metro = metroCityOf(bar);
  const out = [metro];
  const areas = areasOf(bar, metro);
  for (let i = 0; i < areas.length; i += 1) out.push(areas[i]);
  return out;
}

/**
 * The metro slug a retired area slug should redirect to, or null.
 *
 * /bars/city/beverly-hills exists today and must not become a 404: it is
 * reachable from internal links and Google may hold it even though the page
 * is noindex and absent from the sitemap. The map is derived from
 * METRO_ROLLUP rather than written out by hand, so a line added there cannot
 * be forgotten here.
 *
 * Returns the BARE metro base. The caller resolves it against the live city
 * index, because the metro may carry a qualified slug of its own.
 */
export function retiredAreaSlugTarget(slug: string): { metroBase: string; country: string; metroState: string | null } | null {
  for (let i = 0; i < METRO_ROLLUP.length; i += 1) {
    const r = METRO_ROLLUP[i];
    for (let j = 0; j < r.areas.length; j += 1) {
      const a = r.areas[j];
      const name = typeof a === 'string' ? a : a.name;
      if (cityBase(name) === slug) {
        return {
          metroBase: cityBase(r.metro),
          country: r.country,
          metroState: r.state ? r.state.toUpperCase() : null,
        };
      }
    }
  }
  return null;
}

/** The forced display name for a metro base, so a big area cannot outvote it. */
export function metroDisplayName(base: string, country: string): string | null {
  return METRO_DISPLAY.get(`${base}|${country}`) ?? null;
}

/**
 * EVERY area name a bar answers to, finest first.
 *
 * A list and not a single string, which was the first thing the real data
 * broke. Spoke Wine Bar is in Davis Square, IN Somerville, which folds into
 * Boston: returning only the neighbourhood loses "Somerville", the exact word
 * the rollup was supposed to keep findable. Watch Hill Proper (Norton
 * Commons, in Prospect) and The S.O.S. Tiki Bar (Downtown Decatur, in
 * Decatur) lose theirs the same way.
 *
 * So both survive. Display takes the first, search takes all of them.
 */
export function areasOf(
  bar: { city?: string | null; neighborhood?: string | null },
  metroCity: string
): string[] {
  const out: string[] = [];
  const hood = typeof bar.neighborhood === 'string' ? bar.neighborhood.trim() : '';
  if (hood) out.push(hood);
  const city = typeof bar.city === 'string' ? bar.city.trim() : '';
  // The raw city is an area only when it is NOT the metro: a New York bar in
  // Midtown East must not be labelled "New York, New York".
  if (city && cityBase(city) !== cityBase(metroCity) && cityBase(city) !== cityBase(hood)) {
    out.push(city);
  }
  return out;
}

/** The single area to print on a card: the finest one, or null. */
export function areaOf(
  bar: { city?: string | null; neighborhood?: string | null },
  metroCity: string
): string | null {
  return areasOf(bar, metroCity)[0] ?? null;
}
