import { createClient } from '@supabase/supabase-js';
import { stripPrivate, stripPrivateAll } from './private-columns';
import { searchOrFilter } from './ascii-fold';
import type { Accolade } from './accolades';
import { metroCityOf, cityStringsForMetro } from './metro-rollup';
import { MIN_DROPDOWN_CITY_BARS } from './city-thresholds';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

import { boundedPublicFetch } from './bounded-fetch';

// PUBLIC reads: bounded (5s + one retry, then throw - the Sept 4 incident
// was unbounded fetches hanging 300s on Supabase 522s) and shared through a
// 300s Data-Cache entry so concurrent page regenerations and API calls stop
// issuing identical queries against a struggling DB. The week-stale counts
// that once justified no-store here were really the unpaginated 1000-row cap
// (fixed); a 5-minute read cache cannot reintroduce them. Claim/owner/admin
// paths keep their own no-store clients - correctness there is untouched.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: boundedPublicFetch },
});

// ---------- Types ----------
export interface MenuHighlight {
  name: string;
  ingredients?: string;
  /** Second-language ingredient line (e.g. the bar's original Spanish), shown beneath */
  ingredients_alt?: string;
  price?: string;
}

/** A full menu section for paid-tier profiles ("the bar's website" feature) */
export interface MenuSection {
  title: string;
  note?: string;
  items: MenuHighlight[];
}

export interface Bar {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  region: string | null;
  address: string | null;
  /** Two-letter US state or Canadian province (bars.state, 2026-09-15); null
      elsewhere. Read by the city slug rule and the location label; never
      re-derived from the address at render time. */
  state?: string | null;
  /** Editorial neighborhood (bars.neighborhood, 2026-09-15); null on most rows. */
  neighborhood?: string | null;
  lat: number | null;
  lng: number | null;
  type: string;
  website: string | null;
  instagram: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  short_excerpt: string | null;
  photos: string[];
  /** Secondary style tags, curated per bar from its own description (a
      speakeasy is usually also a cocktail bar). Nullable and empty for most
      bars; always read through (subtypes || []). The primary `type` column
      is unchanged and cards keep showing only it. */
  subtypes: string[] | null;
  /** Attribution for the photos, shown under the hero. Editorial field —
      set in admin when images are added, never owner-editable. */
  photo_credit: string | null;
  tier: 'free' | 'featured' | 'premium' | 'top10';
  opening_hours: string | null;
  /** Happy hour and specials, one or two lines, owner-editable (2026-09-16). */
  specials?: string | null;
  menu_url: string | null;
  menu_highlights: MenuHighlight[] | null;
  menu_sections: MenuSection[] | null;
  reservation_url: string | null;
  whatsapp: string | null;
  featured_until: string | null;
  is_verified: boolean;
  /**
   * Set when a claim completes. This — not `is_verified` — is what "someone
   * owns this listing" means; `is_verified` is an editorial flag and the claim
   * flow never touches it.
   */
  owner_id: string | null;
  claimed_at: string | null;
  is_active: boolean;
  /**
   * open | temporarily_closed | permanently_closed (bars.status, 2026-09-17).
   * Independent of is_active: a temporarily closed bar stays ACTIVE, keeps its
   * profile, its accolades and its place in a curated Top 10, and carries a
   * notice. Optional here because the column is added by a migration that runs
   * in the Supabase SQL editor; every read defaults to 'open'.
   * See src/lib/bar-status.ts.
   */
  status?: string | null;
  /** One sentence shown to readers on the profile notice. */
  status_note?: string | null;
  status_updated_at?: string | null;
  /**
   * Editorial listings that admitted this bar (bars.editorial_sources,
   * 2026-09-17). An ADMISSION RECORD, never an accolade: not scored, not
   * rendered as a tile. Array of {source, url, note, year}.
   */
  editorial_sources?: unknown;
  /**
   * Roman's override on a city's best-of list (bars.editorial_pick,
   * 2026-09-17). Positive pins to the top in that order, -1 drops the bar off
   * Level 2 while keeping it on Level 3, null lets the rule decide. Never
   * rendered, never an accolade. See src/lib/city-levels.ts.
   */
  editorial_pick?: number | null;
  wp_article_slug: string | null;
  /**
   * Editorial award entries, pre-sorted by score descending, one per org_key.
   * Read-only display data: a scheduled task rewrites `score` monthly with a
   * recency decay, so never recompute or cache a derived ranking from it.
   */
  accolades: Accolade[] | null;
  created_at: string;
  updated_at: string;
}

export interface BarSubmission {
  name: string;
  city: string;
  country: string;
  address?: string;
  type?: string;
  website?: string;
  instagram?: string;
  email: string;
  phone?: string;
  description?: string;
  contact_name?: string;
}

// ---------- Queries ----------

/** Get all active bars, featured/premium first */
export async function getBars(filters?: {
  country?: string;
  city?: string;
  type?: string;
  search?: string;
  page?: number;
  perPage?: number;
  tier?: string;
  hasPhoto?: boolean;
}) {
  const page = filters?.page || 1;
  const perPage = filters?.perPage || 24;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('bars')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('tier', { ascending: true }) // premium first (alphabetically: featured, free, premium — we fix below)
    .order('name', { ascending: true })
    .range(from, to);

  if (filters?.country) {
    query = query.eq('country', filters.country);
  }
  if (filters?.city) {
    // The dropdown offers METROS, so a selection has to ask for every raw
    // city string that metro covers. `.eq('city', 'Los Angeles')` would drop
    // the Beverly Hills, Santa Monica and Long Beach rows at the server, and
    // no amount of client-side matching gets them back. For a city with no
    // areas this is a one-element `in`, which behaves as the `eq` did.
    query = query.in('city', cityStringsForMetro(filters.city));
  }
  if (filters?.type) {
    // Union with the curated subtypes array: a bar typed Cocktail Bar but
    // tagged Speakeasy must match a Speakeasy filter. Values are from the
    // fixed type list (no commas), so the or() syntax is safe; cs = array
    // contains, and null subtypes simply never match.
    query = query.or(`type.eq."${filters.type}",subtypes.cs.{"${filters.type}"}`);
  }
  if (filters?.search) {
    // Accent-insensitive: match the folded query against the generated
    // name_ascii/city_ascii columns so "muzsa" finds "Múzsa". searchOrFilter
    // also keeps a raw clause for names the generated columns fold wrongly.
    // `neighborhood` is searched too (task 79): it is where an area lives for
    // a bar that sits inside its own metro, so without it "North Loop" and
    // "Deep Ellum" match nothing and the 149 bars carrying an area stay
    // unreachable. This is the SERVER gate: the directory re-fetches from
    // here whenever a search term is set, so a client-side match on a row the
    // server never returned cannot rescue it.
    //
    // There is no `neighborhood_ascii` generated column, so this clause
    // matches raw text and does NOT accent-fold: "Stare Mesto" will not find
    // "Staré Mesto", though typing the accents will. Adding that column is a
    // migration, which this task does not do.
    query = query.or(searchOrFilter(filters.search, ['country', 'neighborhood']));
  }
  if (filters?.tier) {
    query = query.eq('tier', filters.tier);
  }
  if (filters?.hasPhoto === true) {
    // photos is a jsonb array — filter for non-empty arrays
    // photos is a Postgres text[] - its empty literal is '{}', not the
    // jsonb-style '[]', which Postgres rejects with 22P02 "malformed array
    // literal". That error silently emptied this query for as long as the
    // filter existed; the incident's throw-on-error finally surfaced it.
    query = query.not('photos', 'eq', '{}').not('photos', 'is', null);
  }

  const { data, count, error } = await query;
  if (error) {
    // Throw, never return empty: an ISR regeneration that "succeeds" with
    // zero bars replaces a good page with an empty one; a throw keeps the
    // stale page (and API callers 500 fast instead of caching nothing).
    console.error('Error fetching bars:', error);
    throw new Error(`getBars failed: ${error.message}`);
  }

  // Sort: top10 first, then premium, then featured, then free
  const tierOrder: Record<string, number> = { top10: 0, premium: 1, featured: 2, free: 3 };
  const sorted = (data || []).sort((a, b) => {
    const ta = tierOrder[a.tier] ?? 2;
    const tb = tierOrder[b.tier] ?? 2;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });

  return { bars: stripPrivateAll(sorted) as Bar[], total: count || 0 };
}

/** Get a single bar by slug */
export async function getBarBySlug(slug: string): Promise<Bar | null> {
  const { data, error } = await supabase
    .from('bars')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  // PGRST116 = zero rows for .single(): a true 404. Any OTHER error is the
  // DB failing - throwing keeps ISR's stale page instead of replacing a
  // live profile with a 404 (a Supabase 522 during regen did exactly that).
  if (error && error.code !== 'PGRST116') {
    throw new Error(`getBarBySlug failed: ${error.message}`);
  }
  if (!data) return null;
  return stripPrivate(data) as Bar;
}

/**
 * A style needs this many active bars to earn a chip in the directory's type
 * filter. Matches MIN_REGION_BARS, which is the same judgement about when a
 * slice of the directory is worth offering as its own thing.
 */
export const MIN_FILTERABLE_TYPE_BARS = 6;



/** Get unique filter values */
export async function getBarFilterOptions() {
  // Whole-directory read: paged, or the filter menus stop at bar 1,000.
  // `state` is selected because the metro rollup is keyed on it: Decatur,
  // Georgia folds into Atlanta and Decatur, Illinois must not.
  const data = await getAllActiveBars<{ country: string; city: string; state: string | null; type: string | null; subtypes: string[] | null }>(
    'country, city, state, type, subtypes'
  );

  if (!data) return { countries: [], cities: [], commonCities: [], types: [] };

  const countries = Array.from(new Set(data.map(b => b.country).filter(Boolean))).sort();
  // Metros only, so an area does not take a line in the dropdown of its own.
  const cityCount = new Map<string, number>();
  for (const b of data) {
    const m = metroCityOf(b);
    if (m) cityCount.set(m, (cityCount.get(m) || 0) + 1);
  }
  const cities = Array.from(cityCount.keys()).sort();
  // The default dropdown: metros carrying at least MIN_DROPDOWN_CITY_BARS.
  // `cities` still holds every metro, for the "All cities" escape.
  const commonCities = cities.filter(c => (cityCount.get(c) || 0) >= MIN_DROPDOWN_CITY_BARS);
    // Union vocabulary: a style that exists only as a subtype (no bar has it
  // as primary type) must still be offered, since the filter matches the
  // union.
  const typeCount = new Map<string, number>();
  data.forEach(b => {
    // A bar counts once per style even when it is both the primary type and a
    // subtype, because the filter matches the union.
    const styles = new Set<string>();
    if (b.type) styles.add(b.type);
    (b.subtypes || []).forEach((st: string) => styles.add(st));
    styles.forEach(st => typeCount.set(st, (typeCount.get(st) || 0) + 1));
  });
  // A filter chip that returns one card is worse than no chip: it makes a
  // directory of 1,469 bars look thin. Roman filtered to "Omakase Cocktail
  // Bar" and got a single result. Below MIN_FILTERABLE_TYPE_BARS the style
  // stays on the bar row and stays visible on its profile, because Hanashi
  // genuinely is a Japanese cocktail bar and that is worth saying there. It
  // simply is not worth a filter. Count-driven, so a style reappears on its
  // own as it reaches the threshold and nothing needs maintaining.
  const types = Array.from(typeCount.entries())
    .filter(([, n]) => n >= MIN_FILTERABLE_TYPE_BARS)
    .map(([t]) => t)
    .sort();

  return { countries, cities, commonCities, types };
}

/** Get cities for a specific country */
export async function getCitiesForCountry(country: string) {
  const { data } = await supabase
    .from('bars')
    .select('city')
    .eq('country', country)
    .eq('is_active', true);

  if (!data) return [];
  return Array.from(new Set(data.map(b => b.city).filter(Boolean))).sort();
}

/** Submit a new bar for review */
export async function submitBar(submission: BarSubmission) {
  const { data, error } = await supabase
    .from('bar_submissions')
    .insert(submission)
    .select()
    .single();

  if (error) {
    console.error('Error submitting bar:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/** Get all bars for a specific country */
export async function getBarsByCountry(country: string) {
  const { data, error } = await supabase
    .from('bars')
    .select('*')
    .eq('is_active', true)
    .eq('country', country)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching bars by country:', error);
    throw new Error('getBarsByCountry failed');
  }
  return stripPrivateAll(data || []) as Bar[];
}

/** Get all bars for a specific city */
export async function getBarsByCity(city: string) {
  const { data, error } = await supabase
    .from('bars')
    .select('*')
    .eq('is_active', true)
    .eq('city', city)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching bars by city:', error);
    throw new Error('getBarsByCity failed');
  }
  return stripPrivateAll(data || []) as Bar[];
}

/** Get all unique countries with bar counts */
export async function getCountriesWithCounts() {
  // Whole-directory read, feeds the sitemap: paged past the row cap.
  const data = await getAllActiveBars<{ country: string }>('country');

  if (!data) return [];
  const counts: Record<string, number> = {};
  data.forEach(b => { counts[b.country] = (counts[b.country] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count }));
}

/** Get all unique cities with bar counts and their country */
export async function getCitiesWithCounts() {
  // Whole-directory read, feeds the sitemap: paged past the row cap.
  const data = await getAllActiveBars<{ city: string; country: string }>('city, country');

  if (!data) return [];
  const map: Record<string, { count: number; country: string }> = {};
  data.forEach(b => {
    if (!map[b.city]) map[b.city] = { count: 0, country: b.country };
    map[b.city].count++;
  });
  return Object.entries(map).sort((a, b) => b[1].count - a[1].count).map(([city, info]) => ({ city, count: info.count, country: info.country }));
}

/** Get all wp_article_slug values for bars that have a directory listing */
export async function getBarArticleSlugs(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('bars')
    .select('wp_article_slug')
    .eq('is_active', true)
    .not('wp_article_slug', 'is', null);
  if (error) throw new Error(`getBarArticleSlugs failed: ${error.message}`);
  if (!data) return new Set();
  return new Set(data.map(b => b.wp_article_slug as string).filter(Boolean));
}

/** Cities that have at least one active top10-tier bar (for /best-bars pages) */
export async function getTop10Cities(): Promise<{ city: string; country: string; count: number }[]> {
  const { data, error } = await supabase
    .from('bars')
    .select('city, country')
    .eq('is_active', true)
    .eq('tier', 'top10');
  if (error) throw new Error(`getTop10Cities failed: ${error.message}`);
  if (!data) return [];
  const map: Record<string, { country: string; count: number }> = {};
  data.forEach(b => {
    if (!map[b.city]) map[b.city] = { country: b.country, count: 0 };
    map[b.city].count++;
  });
  return Object.entries(map)
    .map(([city, info]) => ({ city, country: info.country, count: info.count }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

/** The active top10-tier bars for one city, alphabetical */
export async function getTop10BarsByCity(city: string): Promise<Bar[]> {
  const { data, error } = await supabase
    .from('bars')
    .select('*')
    .eq('is_active', true)
    .eq('tier', 'top10')
    .eq('city', city)
    .order('name', { ascending: true });
  if (error) throw new Error(`getTop10BarsByCity failed: ${error.message}`);
  if (!data) return [];
  return stripPrivateAll(data) as Bar[];
}

/**
 * Every active bar, for consumers that must see the WHOLE directory.
 *
 * Paginated past Supabase's 1,000-row cap. `getBars({ perPage: 2000 })`
 * looks like it asks for everything but issues one .range() and comes back
 * with exactly 1,000 rows and no error, which is how sitemap-bars.xml
 * listed 1,000 profiles against 1,247 active for weeks (found 2026-09-14;
 * same defect e1a748d fixed in the SEO data layer). Use this, never a big
 * perPage, when the answer has to be complete.
 */
export async function getAllActiveBars<T = Bar>(select: string = '*'): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('bars')
      .select(select)
      .eq('is_active', true)
      .order('slug', { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(`getAllActiveBars failed: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as unknown as T[]));
    if (data.length < 1000) break;
  }
  // '*' callers hand these rows to client components; private columns stop here.
  return stripPrivateAll(rows as unknown as Record<string, unknown>[]) as unknown as T[];
}

/** Get bar count stats */
export async function getBarStats() {
  const { count, error: countError } = await supabase
    .from('bars')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  if (countError || count == null) {
    // Throw, never fall back: a failed regeneration keeps the previous
    // metadata/counters, whereas a silent 0 minted "600+ bars" into the
    // OG description and WhatsApp cached it.
    throw new Error(`getBarStats count failed: ${countError?.message ?? 'no count'}`);
  }

  // Paginated past the 1000-row cap - the unpaginated scan undercounted
  // cities and countries the moment the directory passed 1,000 bars.
  const locationData: { country: string; city: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data: page, error } = await supabase
      .from('bars')
      .select('country, city')
      .eq('is_active', true)
      .range(from, from + 999);
    if (error) throw new Error(`getBarStats locations failed: ${error.message}`);
    if (!page || page.length === 0) break;
    locationData.push(...page);
    if (page.length < 1000) break;
  }

  const countries = Array.from(new Set(locationData.map(b => b.country))).length;
  const cities = Array.from(new Set(locationData.map(b => b.city))).length;

  return { totalBars: count, totalCountries: countries, totalCities: cities };
}
