import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeoCities } from '@/lib/seo-cities';
import { getRegionCombos, getRegionBars, composeRegionDescription, regionHref } from '@/lib/seo-regions';
import { RegionTypePage } from '@/components/RegionTypePage';

/**
 * /best-bars/country/[country]/[type]: "best hotel bars in the United
 * States". Exists only when the country has MIN_REGION_BARS active bars of
 * the type (see seo-regions.ts); everything else 404s and is not in the
 * sitemap. The meta description carries the live count.
 */

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';
const titleCase = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export async function generateStaticParams() {
  const combos = await getRegionCombos();
  return combos.filter(c => c.region.kind === 'country').map(c => ({ country: c.region.slug, type: c.type.slug }));
}

async function resolve(country: string, type: string) {
  const combos = await getRegionCombos();
  const combo = combos.find(c => c.region.kind === 'country' && c.region.slug === country && c.type.slug === type);
  return combo ? { combo, combos } : null;
}

export async function generateMetadata({ params }: { params: { country: string; type: string } }): Promise<Metadata> {
  const r = await resolve(params.country, params.type);
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

export default async function BestTypeCountryPage({ params }: { params: { country: string; type: string } }) {
  const r = await resolve(params.country, params.type);
  if (!r) notFound();
  const [bars, cities] = await Promise.all([getRegionBars(r.combo), getSeoCities()]);
  if (bars.length < 6) notFound();
  const siblings = r.combos.filter(c => c.region.kind === 'country' && c.region.slug === r.combo.region.slug && c.type.slug !== r.combo.type.slug);
  const statePages = r.combos.filter(c => c.region.kind === 'us-state' && c.region.country === r.combo.region.country && c.type.slug === r.combo.type.slug);
  return <RegionTypePage combo={r.combo} bars={bars} cities={cities} siblings={siblings} statePages={statePages} />;
}
