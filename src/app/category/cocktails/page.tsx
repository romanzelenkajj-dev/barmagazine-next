import { getPostsByCategory } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cocktails',
  description: 'Cocktail recipes, trends, and mocktail inspiration from the bar world.',
  alternates: { canonical: 'https://barmagazine.com/category/cocktails' },
};

export default async function CocktailsPage() {
  const result = await getPostsByCategory('cocktails', 1, 12);
  const fetchUrl = `/api/wp-posts?categories=8&per_page=12`;

  return (
    <div className="category-header-wrapper">
      <div className="category-header">
        <h1>Cocktails</h1>
        <div className="category-header-line" />
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
  );
}
