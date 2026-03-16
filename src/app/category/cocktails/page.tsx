import Link from 'next/link';
import { getPostsByMultipleCategories } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cocktails | Bar Magazine',
  description: 'Cocktail recipes, trends, and mocktail inspiration from the bar world.',
};

export default async function CocktailsPage() {
  // cocktails (8) + mocktails (64)
  const result = await getPostsByMultipleCategories([8, 64], 1, 12);
  const fetchUrl = `https://barmagazine.com/wp-json/wp/v2/posts?categories=8,64&per_page=12`;

  return (
    <>
      <div style={{ marginTop: 'var(--gap)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Cocktails
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Cocktail recipes, trends, and mocktail inspiration
        </p>

        <div className="cat-filters">
          <Link href="/" className="cat-filter-btn">Latest</Link>
          <Link href="/category/people" className="cat-filter-btn">People</Link>
          <Link href="/category/cocktails" className="cat-filter-btn active">Cocktails</Link>
          <Link href="/category/awards-events" className="cat-filter-btn">Awards</Link>
          <Link href="/category/brands" className="cat-filter-btn">Brands</Link>
        </div>

        <LoadMoreGrid
          initialPosts={result.data as any}
          totalPages={result.totalPages}
          fetchUrl={fetchUrl}
        />

        {result.data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: 16 }}>No articles found in this category yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
