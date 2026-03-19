import { getBars, getBarFilterOptions, getBarStats } from '@/lib/supabase';
import { BarDirectoryClient } from '@/components/BarDirectory';
import type { Metadata } from 'next';

export const revalidate = 300; // 5 min ISR

export const metadata: Metadata = {
  title: 'Bar Directory',
  description: 'Discover the world\'s best cocktail bars, speakeasies, hotel bars, and more. Search by city, country, or style.',
  alternates: { canonical: 'https://barmagazine.com/bars' },
  robots: { index: false, follow: false },
};

export default async function BarsPage() {
  const [{ bars }, filters, stats] = await Promise.all([
    getBars({ perPage: 500 }), // load all for client-side filtering
    getBarFilterOptions(),
    getBarStats(),
  ]);

  return (
    <BarDirectoryClient
      initialBars={bars}
      totalBars={stats.totalBars}
      totalCountries={stats.totalCountries}
      totalCities={stats.totalCities}
      countries={filters.countries}
      cities={filters.cities}
      types={filters.types}
    />
  );
}
