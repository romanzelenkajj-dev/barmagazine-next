import { getPostsByCategory, WP_API } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Brands',
  description: 'Discover the latest spirits and wines shaping the bar industry.',
  alternates: { canonical: 'https://barmagazine.com/category/brands' },
};

export default async function BrandsPage() {
  const result = await getPostsByCategory('brands', 1, 12);
  const fetchUrl = `${WP_API}/posts?categories=201&per_page=12`;

  return (
    <div className="category-header-wrapper">
      <div className="category-header">
        <h1>Brands</h1>
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
