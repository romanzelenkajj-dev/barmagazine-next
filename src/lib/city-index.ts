import { unstable_cache } from 'next/cache';
import { supabase, getAllActiveBars, type Bar } from './supabase';
import { stripPrivateAll } from './private-columns';
import { buildCityEntries, CityIndex, CITY_INDEX_TAG, type CityEntry, type CityRow } from './city-keys';

/**
 * The city index the pages resolve through: every active row's city,
 * country and state, folded into entries with their slugs (see city-keys.ts
 * for the rule).
 *
 * Cached for 300 seconds under CITY_INDEX_TAG and purged by
 * revalidateBarPages on every bars write, so a profile render does not pay
 * for a whole-directory read and a new city still appears on the next
 * request after its insert.
 */
const loadEntries = unstable_cache(
  async (): Promise<CityEntry[]> => buildCityEntries(await getAllActiveBars<CityRow>('city, country, state')),
  ['city-index'],
  { revalidate: 300, tags: [CITY_INDEX_TAG] }
);

export async function getCityIndex(): Promise<CityIndex> {
  return new CityIndex(await loadEntries());
}

/**
 * The active bars of one city entry, alphabetical. Fetched by the entry's
 * raw city strings and country, then filtered by the state rule so a
 * qualified entry (portland-me) never carries the other state's rows.
 */
export async function getBarsForCity(entry: CityEntry, opts: { top10Only?: boolean } = {}): Promise<Bar[]> {
  let q = supabase
    .from('bars')
    .select('*')
    .eq('is_active', true)
    .eq('country', entry.country)
    .in('city', entry.cityStrings)
    .order('name', { ascending: true });
  if (opts.top10Only) q = q.eq('tier', 'top10');
  const { data, error } = await q;
  if (error) {
    console.error('Error fetching bars for city:', error);
    throw new Error('getBarsForCity failed');
  }
  const rows = stripPrivateAll(data || []) as Bar[];
  if (!entry.qualified) return rows;
  const index = await getCityIndex();
  return rows.filter(b => index.belongs({ city: b.city, country: b.country, state: b.state }, entry));
}
