import { getPostsByMultipleCategories } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cocktails | BarMagazine',
  description: 'Cocktail recipes, trends, and mocktail inspiration from the bar world.',
};

export default async function CocktailsPage() {
  const result = await getPostsByMultipleCategories([8, 64], 1, 12);
  const fetchUrl = `https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com/posts?categories=8,64&per_page=12`;

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
