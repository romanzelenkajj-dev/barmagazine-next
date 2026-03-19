import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------- Types ----------
export interface Bar {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  region: string | null;
  address: string | null;
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
  tier: 'free' | 'featured' | 'premium';
  featured_until: string | null;
  is_verified: boolean;
  is_active: boolean;
  wp_article_slug: string | null;
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
    query = query.eq('city', filters.city);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,country.ilike.%${filters.search}%`
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('Error fetching bars:', error);
    return { bars: [], total: 0 };
  }

  // Sort: premium first, then featured, then free
  const tierOrder: Record<string, number> = { premium: 0, featured: 1, free: 2 };
  const sorted = (data || []).sort((a, b) => {
    const ta = tierOrder[a.tier] ?? 2;
    const tb = tierOrder[b.tier] ?? 2;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });

  return { bars: sorted as Bar[], total: count || 0 };
}

/** Get a single bar by slug */
export async function getBarBySlug(slug: string): Promise<Bar | null> {
  const { data, error } = await supabase
    .from('bars')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Bar;
}

/** Get unique filter values */
export async function getBarFilterOptions() {
  const { data } = await supabase
    .from('bars')
    .select('country, city, type')
    .eq('is_active', true);

  if (!data) return { countries: [], cities: [], types: [] };

  const countries = Array.from(new Set(data.map(b => b.country).filter(Boolean))).sort();
  const cities = Array.from(new Set(data.map(b => b.city).filter(Boolean))).sort();
  const types = Array.from(new Set(data.map(b => b.type).filter(Boolean))).sort();

  return { countries, cities, types };
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
    return [];
  }
  return data as Bar[];
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
    return [];
  }
  return data as Bar[];
}

/** Get all unique countries with bar counts */
export async function getCountriesWithCounts() {
  const { data } = await supabase
    .from('bars')
    .select('country')
    .eq('is_active', true);

  if (!data) return [];
  const counts: Record<string, number> = {};
  data.forEach(b => { counts[b.country] = (counts[b.country] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count }));
}

/** Get all unique cities with bar counts and their country */
export async function getCitiesWithCounts() {
  const { data } = await supabase
    .from('bars')
    .select('city, country')
    .eq('is_active', true);

  if (!data) return [];
  const map: Record<string, { count: number; country: string }> = {};
  data.forEach(b => {
    if (!map[b.city]) map[b.city] = { count: 0, country: b.country };
    map[b.city].count++;
  });
  return Object.entries(map).sort((a, b) => b[1].count - a[1].count).map(([city, info]) => ({ city, count: info.count, country: info.country }));
}

/** Get bar count stats */
export async function getBarStats() {
  const { count } = await supabase
    .from('bars')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: locationData } = await supabase
    .from('bars')
    .select('country, city')
    .eq('is_active', true);

  const countries = locationData ? Array.from(new Set(locationData.map(b => b.country))).length : 0;
  const cities = locationData ? Array.from(new Set(locationData.map(b => b.city))).length : 0;

  return { totalBars: count || 0, totalCountries: countries, totalCities: cities };
}
