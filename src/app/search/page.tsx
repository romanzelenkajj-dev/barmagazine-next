import { searchPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/ArticleCard';
import type { Metadata } from 'next';
import { SearchForm } from './SearchForm';

export const metadata: Metadata = {
  title: 'Search | BarMagazine',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const results = query ? await searchPosts(query, 20) : [];

  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>
        Search
      </h1>

      <SearchForm initialQuery={query} />

      {query && (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {results.length} results for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <div className="article-grid">
          {results.map(post => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: 16 }}>No articles found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
