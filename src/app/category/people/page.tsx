import { getPostsByCategory } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'People',
  description: 'Interviews, profiles, and books from the world of bars and cocktails.',
  alternates: { canonical: 'https://barmagazine.com/category/people' },
};

export default async function PeoplePage() {
  const result = await getPostsByCategory('people', 1, 12);
  const fetchUrl = `https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com/posts?categories=199&per_page=12`;

  return (
    <div className="category-header-wrapper">
      <div className="category-header">
        <h1>People</h1>
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
