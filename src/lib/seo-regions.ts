import { supabase } from './supabase';
import type { Bar } from './supabase';
import { subdivisionName } from './city-location';
import { toUrlSlug } from './utils';
import { TYPE_PAGES, type TypePage, barHasType, sortSeoBars, type SeoCity } from './seo-cities';

/**
 * The two SEO rungs above the city-by-type pages (Roman, 2026-09-16):
 *
 *   /best-bars/country/<country-slug>/<type-slug>
 *   /best-bars/us/<state-slug>/<type-slug>
 *
 * Same data, same thin-page rule: a page exists only when the combination
 * has MIN_REGION_BARS active bars (the type by primary column or subtypes,
 * the same union test the city pages use); anything under that is not
 * generated, not in the sitemap, and 404s. Counts are read live; nothing
 * about a page is baked at write time except the hand-written intros in
 * region-intros.ts.
 */

export const MIN_REGION_BARS = 6;

export type RegionKind = 'country' | 'us-state';

export interface Region {
  kind: RegionKind;
  /** URL segment: "united-states", "california". */
  slug: string;
  /** Bare name: "United States", "California". */
  name: string;
  /** With the article where English uses one: "the United States". */
  displayName: string;
  /** The country string as stored on bars.country. */
  country: string;
  /** Two-letter state code for us-state regions. */
  state: string | null;
}

export interface RegionCombo {
  region: Region;
  type: TypePage;
  count: number;
  /** Newest updated_at among the members, for the sitemap's lastmod. */
  newest: string | null;
}

/** Countries whose English name takes "the". */
const THE_COUNTRIES = new Set([
  'United States', 'United Kingdom', 'United Arab Emirates', 'Netherlands', 'Philippines',
  'Czech Republic', 'Dominican Republic', 'Bahamas', 'Maldives', 'Cayman Islands',
]);

export function countryDisplayName(country: string): string {
  return THE_COUNTRIES.has(country) ? `the ${country}` : country;
}

export function countryRegion(country: string): Region {
  return {
    kind: 'country',
    slug: toUrlSlug(country),
    name: country,
    displayName: countryDisplayName(country),
    country,
    state: null,
  };
}

export function stateRegion(code: string): Region | null {
  const name = subdivisionName(code, 'United States');
  if (!name) return null;
  return { kind: 'us-state', slug: toUrlSlug(name), name, displayName: name, country: 'United States', state: code.toUpperCase() };
}

export function regionHref(region: Region, typeSlug: string): string {
  return region.kind === 'country'
    ? `/best-bars/country/${region.slug}/${typeSlug}`
    : `/best-bars/us/${region.slug}/${typeSlug}`;
}

export function regionIntroKey(region: Region, typeSlug: string): string {
  return region.kind === 'country' ? `country:${region.slug}:${typeSlug}` : `us:${region.slug}:${typeSlug}`;
}

type LiteRow = Pick<Bar, 'country' | 'state' | 'type' | 'subtypes' | 'updated_at'>;

async function readActiveLite(): Promise<LiteRow[]> {
  const PAGE = 1000;
  const out: LiteRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('bars')
      .select('country, state, type, subtypes, updated_at')
      .eq('is_active', true)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`readActiveLite failed: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...(data as LiteRow[]));
    if (data.length < PAGE) break;
  }
  return out;
}

/** Every country-by-type and US-state-by-type combination that clears the threshold. */
export async function getRegionCombos(): Promise<RegionCombo[]> {
  const rows = await readActiveLite();
  const acc = new Map<string, { region: Region; type: TypePage; count: number; newest: string | null }>();
  const bump = (region: Region, t: TypePage, updated: string | null) => {
    const key = `${region.kind}:${region.slug}:${t.slug}`;
    const cur = acc.get(key) ?? { region, type: t, count: 0, newest: null };
    cur.count++;
    if (updated && (!cur.newest || updated > cur.newest)) cur.newest = updated;
    acc.set(key, cur);
  };
  for (const r of rows) {
    if (!r.country) continue;
    const c = countryRegion(r.country);
    const s = r.country === 'United States' && r.state ? stateRegion(r.state) : null;
    for (const t of TYPE_PAGES) {
      if (!barHasType({ type: r.type, subtypes: r.subtypes }, t.type)) continue;
      bump(c, t, r.updated_at ?? null);
      if (s) bump(s, t, r.updated_at ?? null);
    }
  }
  return Array.from(acc.values())
    .filter(x => x.count >= MIN_REGION_BARS)
    .sort((a, b) => b.count - a.count || a.region.name.localeCompare(b.region.name));
}

export async function resolveRegionCombo(kind: RegionKind, regionSlug: string, typeSlug: string): Promise<RegionCombo | null> {
  const combos = await getRegionCombos();
  return combos.find(c => c.region.kind === kind && c.region.slug === regionSlug && c.type.slug === typeSlug) ?? null;
}

/** The bars of one combination, best first (the city pages' ordering), no cap. */
export async function getRegionBars(combo: RegionCombo): Promise<Bar[]> {
  const PAGE = 1000;
  const out: Bar[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase
      .from('bars')
      .select('id, slug, name, city, country, state, type, subtypes, tier, accolades, photos, wp_article_slug, address, short_excerpt, updated_at')
      .eq('is_active', true)
      .eq('country', combo.region.country)
      .range(from, from + PAGE - 1);
    if (combo.region.state) q = q.eq('state', combo.region.state);
    const { data, error } = await q;
    if (error) throw new Error(`getRegionBars failed: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...(data as Bar[]));
    if (data.length < PAGE) break;
  }
  return sortSeoBars(out.filter(b => barHasType(b, combo.type.type)));
}

/** The city-by-type pages that exist inside this region for this type. */
export function regionCityTypeLinks(cities: SeoCity[], combo: RegionCombo): { slug: string; city: string; count: number }[] {
  return cities
    .filter(c => c.country === combo.region.country && (!combo.region.state || (c.key.state || '').toUpperCase() === combo.region.state))
    .flatMap(c => {
      const t = c.typeSlugs.find(x => x.slug === combo.type.slug);
      return t ? [{ slug: c.slug, city: c.city, count: t.count }] : [];
    })
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

/** Meta description with the LIVE count (Roman: never baked). */
export function composeRegionDescription(combo: RegionCombo, count: number, topName: string | null): string {
  const where = combo.region.displayName;
  const lead = topName ? `, led by ${topName}` : '';
  return `${count} ${combo.type.plural} in ${where}${lead}. Verified addresses, opening hours and signature drinks from BarMagazine.`;
}

/** Generic opening paragraph for a region page without a hand-written intro. */
export function composeRegionIntro(
  combo: RegionCombo,
  count: number,
  topName: string | null,
  cityLinks: { city: string; count: number }[]
): string {
  const where = combo.region.displayName;
  const parts: string[] = [];
  parts.push(
    topName
      ? `BarMagazine lists ${count} ${combo.type.plural} in ${where}, and ${topName} leads the set.`
      : `BarMagazine lists ${count} ${combo.type.plural} in ${where}.`
  );
  if (cityLinks.length >= 2) {
    const names = cityLinks.slice(0, 4).map(c => c.city);
    const last = names.pop();
    parts.push(`${names.join(', ')} and ${last} each have enough ${combo.type.plural} to earn their own city guide, linked below.`);
  } else if (cityLinks.length === 1) {
    parts.push(`${cityLinks[0].city} has enough ${combo.type.plural} to earn its own city guide, linked below.`);
  }
  parts.push(`Every listing is verified, with the address, the hours the venue publishes and the drinks worth ordering.`);
  return parts.join(' ');
}
