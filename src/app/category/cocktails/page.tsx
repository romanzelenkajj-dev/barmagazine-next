import Link from 'next/link';
import { getPostsByMultipleCategories } from '@/lib/wordpress';
import { ArticleCard } from '@/components/ArticleCard';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cocktails | Bar Magazine',
  description: 'Cocktail recipes, mocktails, and mixology trends from Bar Magazine.',
};

export default async function CocktailsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  // cocktails (8) + mocktails (64)
  const result = await getPostsByMultipleCategories([8, 64], page, 12);

  return (
    <>
      <div style={{ marginTop: 'var(--gap)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Cocktails
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Cocktail recipes and mocktail inspiration
        </p>

        <div className="cat-filters">
          <Link href="/" className="cat-filter-btn">Latest</Link>
          <Link href="/category/people" className="cat-filter-btn">People</Link>
          <Link href="/category/cocktails" className="cat-filter-btn active">Cocktails</Link>
          <Link href="/category/awards-events" className="cat-filter-btn">Awards &amp; Events</Link>
          <Link href="/category/brands" className="cat-filter-btn">Brands</Link>
        </div>

        <div className="article-grid">
          {result.data.map(post => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>

        {result.data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: 16 }}>No articles found in this category yet.</p>
          </div>
        )}

        {result.totalPages > 1 && (
          <div className="pagination">
            {page > 1 && (
              <Link href={`/category/cocktails?page=${page - 1}`}>
                <button>&larr; Previous</button>
              </Link>
            )}
            <span style={{ padding: '10px 18px', fontSize: 14, color: 'var(--text-secondary)' }}>
              Page {page} of {result.totalPages}
            </span>
            {page < result.totalPages && (
              <Link href={`/category/cocktails?page=${page + 1}`}>
                <button>Next &rarr;</button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
