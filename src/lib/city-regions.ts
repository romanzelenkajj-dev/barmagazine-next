import { getContinentCountryNames } from './geo';

/**
 * The six regions the city-guide directory groups cities under (Roman, task
 * 118), in display order. They are editorial regions, not the geo.ts
 * continents: Latin America takes South America plus Mexico, Central America
 * and the Caribbean out of North America; the Middle East comes out of Asia
 * and shares a column with Africa. Turkey and Georgia stay in Europe, where
 * the 50 Best lists put Istanbul and Tbilisi.
 */
export const CITY_REGIONS = [
  'Europe',
  'North America',
  'Latin America',
  'Asia',
  'Middle East and Africa',
  'Oceania',
] as const;

export type CityRegion = (typeof CITY_REGIONS)[number];

/** Regions open by default on a phone; the rest start collapsed there. */
export const OPEN_BY_DEFAULT: ReadonlySet<string> = new Set(['Europe', 'North America']);

const set = (code: string) => new Set(getContinentCountryNames(code));
const EUROPE = set('EU');
const ASIA = set('AS');
const OCEANIA = set('OC');
const AFRICA = set('AF');
const SOUTH_AMERICA = set('SA');

/** Out of geo.ts's North America and into Latin America. */
const LATIN_NORTH = new Set([
  'Mexico', 'Panama', 'Costa Rica', 'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua',
  'Jamaica', 'Cuba', 'Puerto Rico', 'Trinidad and Tobago', 'Cayman Islands', 'Bahamas', 'Barbados',
  'Dominican Republic',
]);

/** Out of geo.ts's Asia and into the Middle East column. */
const MIDDLE_EAST = new Set([
  'United Arab Emirates', 'Israel', 'Lebanon', 'Qatar', 'Saudi Arabia', 'Bahrain', 'Kuwait', 'Oman',
  'Jordan', 'Iraq', 'Iran',
]);

export function regionOfCountry(country: string): CityRegion {
  if (LATIN_NORTH.has(country) || SOUTH_AMERICA.has(country)) return 'Latin America';
  if (MIDDLE_EAST.has(country) || AFRICA.has(country)) return 'Middle East and Africa';
  if (EUROPE.has(country)) return 'Europe';
  if (OCEANIA.has(country)) return 'Oceania';
  if (ASIA.has(country)) return 'Asia';
  // Every country with a city page today is covered above; a new one lands
  // with the largest bench rather than vanishing from the directory.
  return 'North America';
}

export interface RegionGroup<T> {
  region: CityRegion;
  cities: T[];
}

/**
 * Cities grouped under the six regions in display order, alphabetical inside
 * each, empty regions dropped. Every city passed in comes back out.
 */
export function groupCitiesByRegion<T extends { city: string; country: string }>(cities: T[]): RegionGroup<T>[] {
  const buckets = new Map<CityRegion, T[]>();
  for (const c of cities) {
    const r = regionOfCountry(c.country);
    const list = buckets.get(r) ?? [];
    list.push(c);
    buckets.set(r, list);
  }
  return CITY_REGIONS
    .filter(r => buckets.has(r))
    .map(r => ({ region: r, cities: buckets.get(r)!.slice().sort((a, b) => a.city.localeCompare(b.city)) }));
}
