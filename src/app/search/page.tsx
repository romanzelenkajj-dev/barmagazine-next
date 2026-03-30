import { searchPosts } from '@/lib/wordpress';
import type { Metadata } from 'next';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  alternates: { canonical: 'https://barmagazine.com/search' },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  // Fetch up to 100 results sorted by relevance so important posts (e.g. 50 Best)
  // always surface regardless of when they were last modified.
  const results = query ? await searchPosts(query, 100) : [];

  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>
        Search
      </h1>

      <SearchForm initialQuery={query} />

      {query && (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && <SearchResults posts={results} />}

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: 16 }}>No articles found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
