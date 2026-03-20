import { headers } from 'next/headers';
import { getBars, getBarFilterOptions, getBarStats } from '@/lib/supabase';
import { BarDirectoryClient } from '@/components/BarDirectory';
import type { Metadata } from 'next';

export const revalidate = 300; // 5 min ISR

const SITE_URL = 'https://barmagazine.com';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getBarStats();
  const barCount = Math.floor((stats.totalBars || 600) / 100) * 100;
  return {
    title: 'Global Bar Directory | Discover the World\'s Best Bars',
    description: `Discover the world's best cocktail bars, speakeasies, hotel bars, and more. Search by city, country, or style. ${barCount}+ curated bars across ${stats.totalCities || 70}+ cities worldwide.`,
    alternates: { canonical: `${SITE_URL}/bars` },
    robots: { index: true, follow: true },
  };
}

export default async function BarsPage() {
  // Read Vercel geo headers for IP-based personalization
  const headersList = headers();
  const geoCity = headersList.get('x-vercel-ip-city') || '';
  const geoCountryCode = headersList.get('x-vercel-ip-country') || '';
  const geoContinent = headersList.get('x-vercel-ip-continent') || '';

  const [{ bars }, filters, stats] = await Promise.all([
    getBars({ perPage: 1000 }),
    getBarFilterOptions(),
    getBarStats(),
  ]);

  // ItemList JSON-LD for the directory
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Global Bar Directory',
    description: 'Discover the world\'s best cocktail bars, speakeasies, hotel bars, and more on BarMagazine.',
    url: `${SITE_URL}/bars`,
    numberOfItems: stats.totalBars,
    itemListElement: bars.slice(0, 50).map((bar, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: bar.name,
      url: `${SITE_URL}/bars/${bar.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <BarDirectoryClient
        initialBars={bars}
        totalBars={stats.totalBars}
        totalCountries={stats.totalCountries}
        totalCities={stats.totalCities}
        countries={filters.countries}
        cities={filters.cities}
        types={filters.types}
        geoCity={decodeURIComponent(geoCity)}
        geoCountryCode={geoCountryCode}
        geoContinent={geoContinent}
      />
    </>
  );
}
