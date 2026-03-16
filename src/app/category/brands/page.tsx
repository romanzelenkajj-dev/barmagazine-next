import Link from 'next/link';
import { getPostsByMultipleCategories } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Brands | Bar Magazine',
  description: 'Discover the latest spirits and wines shaping the bar industry.',
};

export default async function BrandsPage() {
  // spirits (59) + wines (41)
  const result = await getPostsByMultipleCategories([59, 41], 1, 12);
  const fetchUrl = `https://barmagazine.com/wp-json/wp/v2/posts?categories=59,41&per_page=12`;

  return (
    <>
      <div style={{ marginTop: 'var(--gap)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Brands
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Spirits and wines from the world of bars
        </p>

        <div className="cat-filters">
          <Link href="/" className="cat-filter-btn">Latest</Link>
          <Link href="/category/people" className="cat-filter-btn">People</Link>
          <Link href="/category/cocktails" className="cat-filter-btn">Cocktails</Link>
          <Link href="/category/awards-events" className="cat-filter-btn">Awards</Link>
          <Link href="/category/brands" className="cat-filter-btn active">Brands</Link>
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
