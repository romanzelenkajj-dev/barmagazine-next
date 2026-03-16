import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategory } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
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
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const result = await getPostsByCategory(params.slug, 1, 12);
  const fetchUrl = `https://barmagazine.com/wp-json/wp/v2/posts?categories=${category.id}&per_page=12`;

  return (
    <div className="category-header-wrapper">
      <div className="category-header">
        <h1>{category.name}</h1>
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
