import { supabase } from './supabase';
import type { Bar } from './supabase';
import { toUrlSlug } from './utils';
import { renderableAccolades } from './accolades';

/**
 * Data layer for the programmatic SEO surface: /best-bars/[city] and
 * /best-bars/[city]/[type].
 *
 * Thin-page rules, enforced here so no route can accidentally ship a
 * doorway page: a city page exists only with MIN_CITY_BARS active bars, a
 * type-city page only with MIN_TYPE_BARS active bars of that type. Cities
 * and combos below threshold are simply not generated and 404.
 *
 * Every page's title, meta description and opening paragraph are assembled
 * from real data (bar count, award count, top-ranked venue) by the
 * composers at the bottom, so no two pages read as the same sentence with
 * the city name swapped.
 */

export const MIN_CITY_BARS = 5;
export const MIN_TYPE_BARS = 4;

/** The five bar types that get type-by-city pages, with URL slugs. */
export const TYPE_PAGES = [
  { type: 'Cocktail Bar', slug: 'cocktail-bars', plural: 'cocktail bars' },
  { type: 'Speakeasy', slug: 'speakeasies', plural: 'speakeasies' },
  { type: 'Rooftop Bar', slug: 'rooftop-bars', plural: 'rooftop bars' },
  { type: 'Hotel Bar', slug: 'hotel-bars', plural: 'hotel bars' },
  { type: 'Pub', slug: 'pubs', plural: 'pubs' },
  // No city clears the threshold yet; pages appear automatically when one
  // does, and profile tags render (unlinked) meanwhile.
  { type: 'Tiki Bar', slug: 'tiki-bars', plural: 'tiki bars' },
] as const;

export type TypePage = (typeof TYPE_PAGES)[number];

export function typePageBySlug(slug: string): TypePage | null {
  return TYPE_PAGES.find(t => t.slug === slug) ?? null;
}

export function typePageForType(type: string | null | undefined): TypePage | null {
  return TYPE_PAGES.find(t => t.type === type) ?? null;
}

/**
 * Photos first, stable: bars with a card image lead, everything else keeps
 * its existing relative order behind them. Applied by the best-bars pages to
 * both the curated top10 sets and the ranked fallback, so a photo-less card
 * never sits above a photographed one.
 */
export function photosFirst<T extends { photos?: string[] | null }>(bars: T[]): T[] {
  const withPhoto = bars.filter(b => b.photos && b.photos.length > 0);
  const without = bars.filter(b => !(b.photos && b.photos.length > 0));
  return [...withPhoto, ...without];
}

/** Union type test: the primary column OR the curated subtypes array.
    subtypes is nullable and empty for most bars, hence the coalesce. */
export function barHasType(bar: { type: string | null; subtypes?: string[] | null }, type: string): boolean {
  return bar.type === type || (bar.subtypes ?? []).includes(type);
}

export interface SeoCity {
  city: string;
  country: string;
  slug: string;
  count: number;
  top10Count: number;
  /** Bars carrying at least one renderable accolade. */
  awardedCount: number;
  /** Name of the highest-standing venue (best accolade score, then tier). */
  topBar: string | null;
  /** Human line for the top bar's best accolade ("No. 2 on the World's 50
      Best Bars 2025"), null when the city has none. */
  topBarAward: string | null;
  /** Type slugs that clear MIN_TYPE_BARS for this city. */
  typeSlugs: { slug: string; type: string; plural: string; count: number }[];
}

interface CityAccumulator {
  country: string;
  count: number;
  top10Count: number;
  awardedCount: number;
  types: Record<string, number>;
  best: { name: string; score: number; award: string | null } | null;
}

function bestAccolade(bar: Pick<Bar, 'accolades' | 'name' | 'tier'>): { score: number; award: string | null } {
  const entries = renderableAccolades(bar.accolades);
  if (entries.length === 0) {
    // Tier stands in when no accolade exists, so a top10 bar can still be
    // the city's named venue in an award-less city.
    return { score: bar.tier === 'top10' ? 1 : 0, award: null };
  }
  const top = entries.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const award =
    top.rank != null
      ? `No. ${top.rank} on ${top.org} ${top.year}`
      : top.title
        ? `${top.title} at the ${top.org} ${top.year}`
        : `${top.org} ${top.year}`;
  return { score: 1000 + (top.score ?? 0), award };
}

/** All cities clearing MIN_CITY_BARS, with the stats the composers need. */
export async function getSeoCities(): Promise<SeoCity[]> {
  const { data, error } = await supabase
    .from('bars')
    .select('name, city, country, type, subtypes, tier, accolades')
    .eq('is_active', true);
  if (error || !data) return [];

  const acc: Record<string, CityAccumulator> = {};
  for (const bar of data) {
    if (!bar.city) continue;
    if (!acc[bar.city]) {
      acc[bar.city] = { country: bar.country, count: 0, top10Count: 0, awardedCount: 0, types: {}, best: null };
    }
    const a = acc[bar.city];
    a.count++;
    if (bar.tier === 'top10') a.top10Count++;
    // Union counts: each bar counts once per page type it matches, via the
    // primary column or the subtypes array (a Speakeasy-typed bar tagged
    // Cocktail Bar counts for both pages, never twice for either).
    for (const t of TYPE_PAGES) {
      if (barHasType(bar as { type: string | null; subtypes: string[] | null }, t.type)) {
        a.types[t.type] = (a.types[t.type] || 0) + 1;
      }
    }
    const b = bestAccolade(bar as Bar);
    if (renderableAccolades(bar.accolades).length > 0) a.awardedCount++;
    if (b.score > 0 && (!a.best || b.score > a.best.score)) {
      a.best = { name: bar.name, score: b.score, award: b.award };
    }
  }

  return Object.entries(acc)
    .filter(([, a]) => a.count >= MIN_CITY_BARS)
    .map(([city, a]) => ({
      city,
      country: a.country,
      slug: toUrlSlug(city),
      count: a.count,
      top10Count: a.top10Count,
      awardedCount: a.awardedCount,
      topBar: a.best?.name ?? null,
      topBarAward: a.best?.award ?? null,
      typeSlugs: TYPE_PAGES.filter(t => (a.types[t.type] || 0) >= MIN_TYPE_BARS).map(t => ({
        slug: t.slug,
        type: t.type,
        plural: t.plural,
        count: a.types[t.type],
      })),
    }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export async function resolveSeoCity(citySlug: string): Promise<SeoCity | null> {
  const cities = await getSeoCities();
  return cities.find(c => c.slug === citySlug) ?? null;
}

/**
 * The bars listed on a city or type-city page: best first (tier, then
 * accolade standing, then photo, then name), capped so the page stays a
 * ranked pick rather than a dump. The full dump lives at /bars/city.
 */
export const CITY_PAGE_MAX_BARS = 12;

export async function getSeoCityBars(city: string, type?: string): Promise<Bar[]> {
  const { data: rows, error } = await supabase
    .from('bars')
    .select('*')
    .eq('is_active', true)
    .eq('city', city);
  if (error || !rows) return [];
  // Union filter in JS rather than PostgREST or() syntax: type values carry
  // spaces and the client-side test is the same barHasType used for counts,
  // so pages and thresholds can never disagree.
  const data = type ? (rows as Bar[]).filter(b => barHasType(b, type)) : (rows as Bar[]);

  const tierRank = (b: Bar) => (b.tier === 'top10' ? 0 : b.tier === 'featured' || b.tier === 'premium' ? 1 : 2);
  const hasPhoto = (b: Bar) => !!(b.photos && b.photos.length > 0);
  return (data as Bar[])
    .slice()
    .sort((a, b) => {
      const t = tierRank(a) - tierRank(b);
      if (t !== 0) return t;
      const s = bestAccolade(b).score - bestAccolade(a).score;
      if (s !== 0) return s;
      const p = (hasPhoto(a) ? 0 : 1) - (hasPhoto(b) ? 0 : 1);
      if (p !== 0) return p;
      return a.name.localeCompare(b.name);
    })
    .slice(0, CITY_PAGE_MAX_BARS);
}

// ---------------------------------------------------------------- composers

/**
 * Opening paragraph for a city page, assembled from what the city actually
 * has. The branches key off real data facts (award-holding venues, curated
 * top10 sets, type mix), so pages differ in substance and not just in the
 * city name. No em dashes in any of this copy.
 */
export function composeCityIntro(c: SeoCity, listed: number): string {
  const parts: string[] = [];

  if (c.topBar && c.topBarAward) {
    parts.push(
      `${c.city} drinking starts with ${c.topBar}, ${c.topBarAward}, and the bench behind it runs deep: ` +
        `we list ${c.count} active bars across the city.` +
        // The headline counts the LIST, this sentence counts the CITY; when
        // they differ, say so explicitly or the two numbers read as a drift.
        (listed < c.count ? ` The ${listed} below are our pick of them.` : '')
    );
  } else if (c.top10Count > 0) {
    parts.push(
      `${c.city} holds ${c.top10Count === 1 ? 'one of our curated Top 10 picks' : `${c.top10Count} of our curated Top 10 picks`}, ` +
        `drawn from the ${c.count} bars we list across the city.` +
        (listed < c.count ? ` The ${listed} below are our pick of them.` : '')
    );
  } else {
    parts.push(
      `We track ${c.count} active bars in ${c.city}, and the ${listed} below are where we would start.`
    );
  }

  if (c.awardedCount > 1) {
    parts.push(
      `${c.awardedCount} of them hold verified international recognition, from the 50 Best lists to the Spirited Awards.`
    );
  } else if (c.awardedCount === 1 && !c.topBarAward) {
    parts.push(`One holds verified international recognition.`);
  }

  if (c.typeSlugs.length >= 2) {
    const names = c.typeSlugs.map(t => t.plural);
    const last = names.pop();
    parts.push(
      `The scene splits into real depth by style: ${names.join(', ')} and ${last} each have enough venues here to earn their own guide.`
    );
  }

  parts.push(
    `Every listing below is verified by BarMagazine, with addresses, opening hours and the signature drinks worth ordering.`
  );
  return parts.join(' ');
}

/** Meta description for a city page. Data-led, 150 to 160 characters aimed. */
export function composeCityDescription(c: SeoCity): string {
  if (c.topBar && c.topBarAward) {
    return `The best bars in ${c.city} right now, led by ${c.topBar} (${c.topBarAward}). ${c.count} verified listings with addresses, hours and signature drinks.`;
  }
  if (c.top10Count > 0) {
    return `The best bars in ${c.city}, including ${c.top10Count} BarMagazine Top 10 pick${c.top10Count === 1 ? '' : 's'}. ${c.count} verified listings with addresses and opening hours.`;
  }
  return `The best bars in ${c.city}, ${c.country}: ${c.count} verified listings with addresses, opening hours and signature drinks, curated by BarMagazine.`;
}

/** Opening paragraph for a type-city page. */
export function composeTypeIntro(
  c: SeoCity,
  t: TypePage,
  typeCount: number,
  topName: string | null,
  listed: number
): string {
  const parts: string[] = [];
  if (topName) {
    parts.push(
      `${c.city} has ${typeCount} ${t.plural} in the BarMagazine directory, and ${topName} leads the pack.`
    );
  } else {
    parts.push(`${c.city} has ${typeCount} ${t.plural} in the BarMagazine directory.`);
  }
  if (listed < typeCount) {
    parts.push(`The ${listed} below are the ones we would send you to first.`);
  }
  parts.push(
    `This guide covers the ${t.plural} specifically; the full ${c.city} picture, all ${c.count} bars of it, lives on the city page.`
  );
  parts.push(`Each listing is verified, with the address, opening hours and what to order.`);
  return parts.join(' ');
}

export function composeTypeDescription(c: SeoCity, t: TypePage, typeCount: number, topName: string | null): string {
  if (topName) {
    return `The ${typeCount} best ${t.plural} in ${c.city}, led by ${topName}. Verified addresses, opening hours and signature drinks from BarMagazine.`;
  }
  return `The ${typeCount} best ${t.plural} in ${c.city}, ${c.country}. Verified addresses, opening hours and signature drinks from BarMagazine.`;
}
