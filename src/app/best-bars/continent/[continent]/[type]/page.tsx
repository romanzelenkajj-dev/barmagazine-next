import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeoCities } from '@/lib/seo-cities';
import { getRegionCombos, getRegionBars, composeRegionDescription, regionHref, regionCountries } from '@/lib/seo-regions';
import { RegionTypePage } from '@/components/RegionTypePage';

/**
 * /best-bars/continent/[continent]/[type]: "best hotel bars in Europe".
 *
 * The third rung above the city-by-type pages, built on the same combos and
 * the same threshold as the country and US-state rungs, so all three render
 * through one component and cannot drift apart. Exists only when the
 * combination has MIN_REGION_BARS active bars; everything else 404s and
 * stays out of the sitemap.
 *
 * Cocktail Bar makes no page at this rung (see CONTINENTS in seo-regions.ts):
 * it is the default `type` on 94% of rows, so a continent-wide cocktail bar
 * page would be 479 bars of everything and would compete with every country
 * page beneath it.
 *
 * On indexing: these pages target a phrase nothing else on the site claims.
 * "Best hotel bars in Europe" is not the target of any city page (whose H1 is
 * "Best Bars in <City>") or of any country page ("...in the United Kingdom"),
 * so this rung does not repeat the H1 collision found in task 80.
 */

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';
const titleCase = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export async function generateStaticParams() {
  const combos = await getRegionCombos();
  return combos.filter(c => c.region.kind === 'continent').map(c => ({ continent: c.region.slug, type: c.type.slug }));
}

async function resolve(continent: string, type: string) {
  const combos = await getRegionCombos();
  const combo = combos.find(c => c.region.kind === 'continent' && c.region.slug === continent && c.type.slug === type);
  return combo ? { combo, combos } : null;
}

export async function generateMetadata({ params }: { params: { continent: string; type: string } }): Promise<Metadata> {
  const r = await resolve(params.continent, params.type);
  if (!r) return {};
  const bars = await getRegionBars(r.combo);
  const year = new Date().getFullYear();
  const title = `Best ${titleCase(r.combo.type.plural)} in ${r.combo.region.displayName} (${year})`;
  const description = composeRegionDescription(r.combo, bars.length, bars[0]?.name ?? null);
  const url = `${SITE_URL}${regionHref(r.combo.region, r.combo.type.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} | BarMagazine`, description, type: 'website', url, siteName: 'BarMagazine' },
  };
}

export default async function BestTypeContinentPage({ params }: { params: { continent: string; type: string } }) {
  const r = await resolve(params.continent, params.type);
  if (!r) notFound();
  const [bars, cities] = await Promise.all([getRegionBars(r.combo), getSeoCities()]);
  if (bars.length < 6) notFound();
  // Siblings are the other types on this continent. The rung below is the
  // country pages of the same type, which is the link that makes the
  // hierarchy legible: Europe -> the United Kingdom -> London.
  const siblings = r.combos.filter(c => c.region.kind === 'continent' && c.region.slug === r.combo.region.slug && c.type.slug !== r.combo.type.slug);
  const inContinent = regionCountries(r.combo.region);
  const statePages = r.combos.filter(c => c.region.kind === 'country'
    && c.type.slug === r.combo.type.slug
    && inContinent.includes(c.region.country));
  return <RegionTypePage combo={r.combo} bars={bars} cities={cities} siblings={siblings} statePages={statePages} />;
}
