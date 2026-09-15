import { toUrlSlug } from './utils';
import { usesSubdivision } from './city-location';

/**
 * City slugs that survive same-name cities.
 *
 * THE RULE (Roman, 2026-09-15): the city slug stays the bare city for every
 * city with no collision, so nothing churns. Where two or more active rows
 * share a folded city name across different countries, or different US
 * states, each city gets a qualified slug: US cities take the two-letter
 * state (portland-or, portland-me, birmingham-al), everything else the ISO
 * country code (birmingham-gb). City pages, best-bars pages, the sitemap,
 * breadcrumbs and the nearby block all key on the qualified slug, and the
 * stored city string stays the bare name; the state lives in bars.state.
 *
 * Why it was needed: /bars/city/birmingham listed two Alabama bars beside
 * one in England, and "Portland, Maine" had to be stored as a qualified
 * string to keep Jewel Box off Scotch Lodge's Oregon page. The page matched
 * toUrlSlug(city) alone, across every country.
 *
 * The state is read from the column, never re-derived from the address
 * here. A row whose state is null joins its city's majority state, so an
 * unfilled row can never fake a collision or fall off its own page; the
 * backfill and the insert path keep the column filled for US and Canadian
 * rows.
 */

export interface CityRow {
  city: string;
  country: string;
  state?: string | null;
}

export interface CityEntry {
  /** The URL slug: bare ("nashville") or qualified ("portland-me"). */
  slug: string;
  /** The display string: the most common spelling among the entry's rows. */
  city: string;
  country: string;
  /** Two-letter state or province code for US and Canadian entries, else null. */
  state: string | null;
  /** Every raw city string the rows use, for the database query. */
  cityStrings: string[];
  count: number;
  /** True when this city name collides and the slug carries a qualifier. */
  qualified: boolean;
  /** Within its country, this entry takes the rows whose state is null. */
  absorbsNullState: boolean;
}

/** ISO 3166-1 alpha-2 for the country names the table uses. */
export const COUNTRY_ISO: Record<string, string> = {
  Albania: 'AL', Argentina: 'AR', Australia: 'AU', Austria: 'AT', Bahamas: 'BS', Belgium: 'BE',
  'Bosnia and Herzegovina': 'BA', Brazil: 'BR', Cambodia: 'KH', Canada: 'CA', 'Cayman Islands': 'KY',
  Chile: 'CL', China: 'CN', Colombia: 'CO', 'Costa Rica': 'CR', Croatia: 'HR', 'Czech Republic': 'CZ',
  Denmark: 'DK', Ecuador: 'EC', Finland: 'FI', France: 'FR', Germany: 'DE', Ghana: 'GH', Greece: 'GR',
  'Hong Kong': 'HK', Hungary: 'HU', Iceland: 'IS', India: 'IN', Indonesia: 'ID', Ireland: 'IE',
  Italy: 'IT', Japan: 'JP', Kenya: 'KE', 'Kyrgyz Republic': 'KG', Macau: 'MO', Malaysia: 'MY',
  Mexico: 'MX', Nepal: 'NP', Netherlands: 'NL', 'New Zealand': 'NZ', Norway: 'NO', Peru: 'PE',
  Philippines: 'PH', Poland: 'PL', Portugal: 'PT', 'Puerto Rico': 'PR', Romania: 'RO', Russia: 'RU',
  Serbia: 'RS', Singapore: 'SG', Slovakia: 'SK', 'South Africa': 'ZA', 'South Korea': 'KR', Spain: 'ES',
  'Sri Lanka': 'LK', Sweden: 'SE', Switzerland: 'CH', Taiwan: 'TW', Thailand: 'TH', Turkey: 'TR',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US', Uruguay: 'UY',
  Vietnam: 'VN',
};

export function countryCode(country: string): string {
  return (COUNTRY_ISO[country] || toUrlSlug(country)).toLowerCase();
}

/** The city string without a qualifier ("Portland, Maine" -> "Portland"). */
export function bareCity(city: string): string {
  return (city || '').split(',')[0].trim();
}

/** The folded city name that groups spellings: "Kraków" and "Krakow" are one. */
export function cityBase(city: string): string {
  return toUrlSlug(bareCity(city));
}

function normState(s: unknown): string | null {
  return typeof s === 'string' && s.trim() ? s.trim().toUpperCase() : null;
}

/** Build the entries from every active row's city, country and state. */
export function buildCityEntries(rows: CityRow[]): CityEntry[] {
  // base -> country -> rows
  const groups = new Map<string, Map<string, CityRow[]>>();
  for (const r of rows) {
    if (!r.city || !r.country) continue;
    const base = cityBase(r.city);
    if (!base) continue;
    let byCountry = groups.get(base);
    if (!byCountry) {
      byCountry = new Map();
      groups.set(base, byCountry);
    }
    const list = byCountry.get(r.country);
    if (list) list.push(r);
    else byCountry.set(r.country, [r]);
  }

  const entries: CityEntry[] = [];
  groups.forEach((byCountry, base) => {
    // First pass: the keys (country, state) this base resolves to.
    const keys: { country: string; state: string | null; rows: CityRow[]; absorbs: boolean }[] = [];
    byCountry.forEach((list, country) => {
      if (!usesSubdivision(country)) {
        keys.push({ country, state: null, rows: list, absorbs: true });
        return;
      }
      const byState = new Map<string, CityRow[]>();
      const nulls: CityRow[] = [];
      for (const r of list) {
        const s = normState(r.state);
        if (!s) nulls.push(r);
        else {
          const l = byState.get(s);
          if (l) l.push(r);
          else byState.set(s, [r]);
        }
      }
      if (byState.size === 0) {
        keys.push({ country, state: null, rows: list, absorbs: true });
        return;
      }
      // The majority state takes the rows whose state is unknown.
      const ordered = Array.from(byState.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
      ordered.forEach(([state, srows], i) => {
        keys.push({ country, state, rows: i === 0 ? srows.concat(nulls) : srows, absorbs: i === 0 });
      });
    });

    const qualified = keys.length > 1;
    const countriesInGroup = new Map<string, number>();
    for (const k of keys) countriesInGroup.set(k.country, (countriesInGroup.get(k.country) || 0) + 1);

    for (const k of keys) {
      let slug = base;
      if (qualified) {
        if (k.country === 'United States') slug = `${base}-${(k.state || 'US').toLowerCase()}`;
        else if ((countriesInGroup.get(k.country) || 0) > 1 && k.state) slug = `${base}-${k.state.toLowerCase()}`;
        else slug = `${base}-${countryCode(k.country)}`;
      }
      // Display string: the most common spelling, first seen on a tie.
      const spellings = new Map<string, number>();
      for (const r of k.rows) {
        const s = bareCity(r.city);
        spellings.set(s, (spellings.get(s) || 0) + 1);
      }
      const city = Array.from(spellings.entries()).sort((a, b) => b[1] - a[1])[0][0];
      entries.push({
        slug,
        city,
        country: k.country,
        state: k.state,
        cityStrings: Array.from(new Set(k.rows.map(r => r.city))),
        count: k.rows.length,
        qualified,
        absorbsNullState: k.absorbs,
      });
    }
  });

  return entries.sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

/** Lookup over the entries: by slug, and the entry a row belongs to. */
export class CityIndex {
  readonly entries: CityEntry[];
  private readonly bySlug = new Map<string, CityEntry>();
  private readonly byBaseCountry = new Map<string, CityEntry[]>();

  constructor(entries: CityEntry[]) {
    this.entries = entries;
    for (const e of entries) {
      this.bySlug.set(e.slug, e);
      const k = `${cityBase(e.city)}|${e.country}`;
      const l = this.byBaseCountry.get(k);
      if (l) l.push(e);
      else this.byBaseCountry.set(k, [e]);
    }
  }

  resolve(slug: string): CityEntry | null {
    return this.bySlug.get(slug) ?? null;
  }

  /** The entry a row belongs to; null for a row whose city is not in the index. */
  forRow(row: CityRow): CityEntry | null {
    const list = this.byBaseCountry.get(`${cityBase(row.city)}|${row.country}`);
    if (!list || list.length === 0) return null;
    if (list.length === 1) return list[0];
    const s = normState(row.state);
    return list.find(e => e.state === s) ?? list.find(e => e.absorbsNullState) ?? list[0];
  }

  /** The slug for a row; falls back to the bare slug for a row outside the index. */
  slugFor(row: CityRow): string {
    return this.forRow(row)?.slug ?? cityBase(row.city);
  }

  /** Does this row belong to the entry? (The state rule, for filtering a query.) */
  belongs(row: CityRow, entry: CityEntry): boolean {
    return this.forRow(row)?.slug === entry.slug;
  }
}

/** The cache tag the index is stored under; revalidated on every bars write. */
export const CITY_INDEX_TAG = 'city-index';
