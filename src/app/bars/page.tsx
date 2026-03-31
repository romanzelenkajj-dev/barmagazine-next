import { headers } from 'next/headers';
import { getBars, getBarFilterOptions, getBarStats } from '@/lib/supabase';
import { BarDirectoryMapClient } from '@/components/BarDirectoryMap';
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
    openGraph: {
      title: 'Global Bar Directory | Discover the World\'s Best Bars',
      description: `${barCount}+ curated bars across ${stats.totalCities || 70}+ cities worldwide.`,
      url: `${SITE_URL}/bars`,
      images: [{ url: `${SITE_URL}/og-bars.jpg`, width: 1200, height: 630, alt: 'BarMagazine Bar Directory' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Global Bar Directory | Discover the World\'s Best Bars',
      images: [`${SITE_URL}/og-bars.jpg`],
    },
  };
}

export default async function BarsPage() {
  // Read Vercel geo headers for IP-based personalization
  const headersList = headers();
  const geoCity = headersList.get('x-vercel-ip-city') || '';
  const geoCountryCode = headersList.get('x-vercel-ip-country') || '';
  const geoContinent = headersList.get('x-vercel-ip-continent') || '';

  // Fetch top10, featured, and photo bars separately so all sections start with a full grid.
  // Load order: top10 (170 bars) → featured/premium → photo bars
  const [{ bars: top10Initial }, { bars: featuredInitial }, { bars: photoInitial }, filters, stats] = await Promise.all([
    getBars({ perPage: 200, tier: 'top10' }),
    getBars({ perPage: 48, tier: 'featured' }),
    getBars({ perPage: 24, tier: 'free', hasPhoto: true }),
    getBarFilterOptions(),
    getBarStats(),
  ]);
  // Merge: top10 first, then featured, then photo bars (dedup by id)
  const seenIds = new Set(top10Initial.map(b => b.id));
  const featuredDeduped = featuredInitial.filter(b => !seenIds.has(b.id));
  featuredDeduped.forEach(b => seenIds.add(b.id));
  const initialBars = [
    ...top10Initial,
    ...featuredDeduped,
    ...photoInitial.filter(b => !seenIds.has(b.id)),
  ];

  // ItemList JSON-LD — use stats.totalBars for the count, list the top 50 by name for schema
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Global Bar Directory',
    description: 'Discover the world\'s best cocktail bars, speakeasies, hotel bars, and more on BarMagazine.',
    url: `${SITE_URL}/bars`,
    numberOfItems: stats.totalBars,
    itemListElement: initialBars.slice(0, 50).map((bar, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: bar.name,
      url: `${SITE_URL}/bars/${bar.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <BarDirectoryMapClient
        initialBars={initialBars}
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
