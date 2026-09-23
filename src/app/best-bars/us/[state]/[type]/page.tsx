import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeoCities } from '@/lib/seo-cities';
import { getRegionCombos, getRegionBars, composeRegionDescription, regionHref } from '@/lib/seo-regions';
import { RegionTypePage } from '@/components/RegionTypePage';

/**
 * /best-bars/us/[state]/[type]: "best hotel bars in California". Keyed on
 * bars.state, the spelled-out state name slugged. Exists only with
 * MIN_REGION_BARS active bars of the type in the state (seo-regions.ts).
 */

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';
const titleCase = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export async function generateStaticParams() {
  const combos = await getRegionCombos();
  return combos.filter(c => c.region.kind === 'us-state').map(c => ({ state: c.region.slug, type: c.type.slug }));
}

async function resolve(state: string, type: string) {
  const combos = await getRegionCombos();
  const combo = combos.find(c => c.region.kind === 'us-state' && c.region.slug === state && c.type.slug === type);
  return combo ? { combo, combos } : null;
}

export async function generateMetadata({ params }: { params: { state: string; type: string } }): Promise<Metadata> {
  const r = await resolve(params.state, params.type);
  if (!r) return {};
  const bars = await getRegionBars(r.combo);
  const year = new Date().getFullYear();
  const title = `Best ${titleCase(r.combo.type.plural)} in ${r.combo.region.displayName} (${year})`;
  const description = composeRegionDescription(r.combo, bars);
  const url = `${SITE_URL}${regionHref(r.combo.region, r.combo.type.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} | BarMagazine`, description, type: 'website', url, siteName: 'BarMagazine' },
  };
}

export default async function BestTypeStatePage({ params }: { params: { state: string; type: string } }) {
  const r = await resolve(params.state, params.type);
  if (!r) notFound();
  const [bars, cities] = await Promise.all([getRegionBars(r.combo), getSeoCities()]);
  if (bars.length < 6) notFound();
  const siblings = r.combos.filter(c => c.region.kind === 'us-state' && c.region.slug === r.combo.region.slug && c.type.slug !== r.combo.type.slug);
  return <RegionTypePage combo={r.combo} bars={bars} cities={cities} siblings={siblings} statePages={[]} />;
}
