import { getPostsByMultipleCategories } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Awards | Bar Magazine',
  description: 'Awards, news, and features from the global bar and cocktail industry.',
};

export default async function AwardsEventsPage() {
  // Awards (200) + legacy: News (52), Features (40)
  const result = await getPostsByMultipleCategories([200, 52, 40], 1, 12);
  const fetchUrl = `https://barmagazine.com/wp-json/wp/v2/posts?categories=52,40&per_page=12`;

  return (
    <div className="category-header-wrapper">
      <div className="category-header">
        <h1>Awards</h1>
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
