'use client';

import { useState } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import type { WPPost } from '@/lib/wordpress';

const PAGE_SIZE = 12;

export function SearchResults({ posts }: { posts: WPPost[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const shown = posts.slice(0, visible);
  const remaining = posts.length - visible;

  return (
    <>
      <div className="article-grid">
        {shown.map(post => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>

      {remaining > 0 && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            style={{
              padding: '12px 32px',
              background: 'transparent',
              border: '1.5px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            Show More
            <span style={{ marginLeft: 8, color: 'var(--color-muted)', fontWeight: 400 }}>
              {remaining} more result{remaining !== 1 ? 's' : ''}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
