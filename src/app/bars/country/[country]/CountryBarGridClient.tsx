'use client';

import { BarPlaceholder } from '@/components/BarPlaceholder';
import { hasFiftyBest } from '@/lib/accolades';
import { useState } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/supabase';
import { hasSlug, safeHref } from '@/lib/safe-slug';

const PAGE_SIZE = 12;



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
          <BarPlaceholder name={bar.name} type={bar.type} />
        )}
        {(isTop10 || isFeatured || hasFiftyBest(bar.accolades)) && (
          <div className="bar-dir-visual-pills">
            {isTop10 && (
              <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">★ TOP 10</span>
            )}
            {isFeatured && (
              <span className="bar-dir-badge-pill bar-dir-badge-pill--featured">Featured</span>
            )}
            {hasFiftyBest(bar.accolades) && (
              <span className="bar-dir-badge-pill bar-dir-badge-pill--50best">50 Best</span>
            )}
          </div>
        )}
      </div>
      <div className="bar-dir-featured-body">
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
