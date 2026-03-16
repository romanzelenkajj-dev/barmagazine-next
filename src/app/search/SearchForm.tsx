'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search articles, bars, cocktails..."
          style={{
            flex: 1,
            padding: '14px 24px',
            borderRadius: 100,
            border: '1px solid var(--border)',
            fontSize: 16,
            fontFamily: 'inherit',
            background: 'var(--bg-card)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '14px 28px',
            background: 'var(--text-primary)',
            color: '#fff',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
}
