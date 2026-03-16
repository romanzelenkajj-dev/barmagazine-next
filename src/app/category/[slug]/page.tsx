import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getPostsByCategory, getCategories } from '@/lib/wordpress';
import { ArticleCard } from '@/components/ArticleCard';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: `${category.name} | Bar Magazine`,
    description: `Browse ${category.name} articles on Bar Magazine — the latest in cocktail culture, bar news, and spirits.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const page = parseInt(searchParams.page || '1');
  const result = await getPostsByCategory(params.slug, page, 12);
  const allCategories = await getCategories();
  const visibleCategories = allCategories.filter(c => c.count > 0 && c.slug !== 'blog');

  return (
    <>
      <div style={{ marginTop: 'var(--gap)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {category.name}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {category.count} articles
        </p>

        {/* Category filters */}
        <div className="cat-filters">
          {visibleCategories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`cat-filter-btn${cat.slug === params.slug ? ' active' : ''}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Article grid */}
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

        {/* Pagination */}
        {result.totalPages > 1 && (
          <div className="pagination">
            {page > 1 && (
              <Link href={`/category/${params.slug}?page=${page - 1}`}>
                <button>&larr; Previous</button>
              </Link>
            )}
            <span style={{ padding: '10px 18px', fontSize: 14, color: 'var(--text-secondary)' }}>
              Page {page} of {result.totalPages}
            </span>
            {page < result.totalPages && (
              <Link href={`/category/${params.slug}?page=${page + 1}`}>
                <button>Next &rarr;</button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
