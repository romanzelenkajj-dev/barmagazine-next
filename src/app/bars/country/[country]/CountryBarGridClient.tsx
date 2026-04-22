'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/supabase';
import { formatBarType } from '@/lib/utils';
import { hasSlug, safeHref } from '@/lib/safe-slug';

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Deterministic dark colour from bar name — 8 rich dark palettes
// ---------------------------------------------------------------------------
const PLACEHOLDER_COLOURS = [
  'linear-gradient(135deg, #0a0f1e 0%, #0d1530 100%)',
  'linear-gradient(135deg, #0a1a0e 0%, #0d2412 100%)',
  'linear-gradient(135deg, #1a0a0e 0%, #240d12 100%)',
  'linear-gradient(135deg, #0e0a1a 0%, #140d24 100%)',
  'linear-gradient(135deg, #1a100a 0%, #24160d 100%)',
  'linear-gradient(135deg, #0a1a1a 0%, #0d2424 100%)',
  'linear-gradient(135deg, #151515 0%, #1e1e1e 100%)',
  'linear-gradient(135deg, #0f0a1a 0%, #160d24 100%)',
];

function barColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_COLOURS[hash % PLACEHOLDER_COLOURS.length];
}

// ---------------------------------------------------------------------------
// Card — same design as city page CityBarCard
// ---------------------------------------------------------------------------
function CountryBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] ?? null;
  const isTop10 = bar.tier === 'top10';
  const isFeatured = bar.tier === 'featured' || !!bar.wp_article_slug;

  return (
    <Link href={safeHref('/bars', bar.slug)} className="bar-dir-featured-card">
      <div className="bar-dir-featured-visual">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={bar.name} loading="lazy" />
        ) : (
          <div
            className="bar-dir-featured-placeholder"
            style={{ background: barColour(bar.name) }}
          >
            <span>
              {bar.name
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .split(/\s+/)
                .filter(Boolean)
                .map((w: string) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 4)}
            </span>
          </div>
        )}
      </div>
      <div className="bar-dir-featured-body">
        <div className="bar-dir-featured-badges">
          {isTop10 && (
            <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">★ TOP 10</span>
          )}
          {isFeatured && (
            <span className="bar-dir-badge-pill bar-dir-badge-pill--featured">Featured</span>
          )}
          {bar.type && (
            <span className="bar-dir-badge-pill bar-dir-badge-pill--type">
              {formatBarType(bar.type)}
            </span>
          )}
        </div>
        <h3 className="bar-dir-featured-name">{bar.name}</h3>
        <span className="bar-dir-featured-location">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {bar.city}
          {bar.city !== bar.country ? `, ${bar.country}` : ''}
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Grid with Show More pagination
// ---------------------------------------------------------------------------
export default function CountryBarGridClient({ bars }: { bars: Bar[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (bars.length === 0) return null;

  const visible = bars.filter(hasSlug).slice(0, visibleCount);
  const hasMore = visibleCount < bars.length;

  return (
    <>
      <div className="directory-grid">
        {visible.map(bar => (
          <CountryBarCard key={bar.id} bar={bar} />
        ))}
      </div>

      {hasMore && (
        <div className="directory-load-more">
          <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
            Show More Bars
          </button>
        </div>
      )}
    </>
  );
}
