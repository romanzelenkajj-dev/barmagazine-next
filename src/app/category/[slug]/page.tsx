import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategory } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import { CATEGORY_DESCRIPTIONS } from '@/lib/article-schema';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  // A8: prefer the curated per-category description (lifted from the deleted
  // brands/cocktails/people static pages and extended to all 6 live categories).
  // Fallback covers any future category before its curated copy lands.
  const description =
    CATEGORY_DESCRIPTIONS[params.slug.toLowerCase()] ??
    `Browse ${category.name} articles on BarMagazine — the latest in cocktail culture, bar news, and spirits.`;
  return {
    title: category.name,
    description,
    alternates: {
      canonical: `https://barmagazine.com/category/${params.slug}`,
    },
    // Noindex /category/bars — the /bars directory is the canonical bars page
    ...(params.slug === 'bars' && { robots: { index: false, follow: true } }),
  };
}

// HTML-decode WP-rendered titles for the ItemList schema (the rendered
// field arrives with entities like &#8217; for typographic apostrophes).
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&apos;|&#39;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&hellip;|&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const result = await getPostsByCategory(params.slug, 1, 12);
  // Use the local proxy to avoid exposing the WP staging domain in client HTML
  const fetchUrl = `/api/wp-posts?categories=${category.id}&per_page=12`;

  // A6: ItemList JSON-LD enumerating the posts on this category page.
  // Helps Google understand the page's content as an editorial collection
  // and unlocks SERP carousel / list-style rich results.
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} — BarMagazine`,
    url: `https://barmagazine.com/category/${params.slug}`,
    numberOfItems: result.data.length,
    itemListElement: (
      result.data as Array<{ slug: string; title?: { rendered?: string }; date?: string }>
    ).map((post, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://barmagazine.com/${post.slug}`,
      name: decodeHtmlEntities(post.title?.rendered ?? ''),
      // A8: include datePublished so Google can sort/cluster the list by recency
      // for SERP carousel surfaces. Fallback to undefined if WP didn't return it.
      ...(post.date && { datePublished: post.date }),
    })),
  };

  return (
    <div className="category-header-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <div className="category-header">
        <h1>{category.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</h1>
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
