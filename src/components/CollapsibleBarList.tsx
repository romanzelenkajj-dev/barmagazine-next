'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/supabase';
import { formatBarType } from '@/lib/utils';

interface Props {
  bars: Bar[];
  hasPhotoBars: boolean;
}

export function CollapsibleBarList({ bars, hasPhotoBars }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (bars.length === 0) return null;

  return (
    <div className="directory-list-section">
      {/* Toggle button — only show if there are photo bars above */}
      {hasPhotoBars && !expanded && (
        <div className="directory-load-more">
          <button onClick={() => setExpanded(true)}>
            More Bars
            <span className="directory-load-more-count">{bars.length} more</span>
          </button>
        </div>
      )}

      {/* List — shown when expanded OR when there are no photo bars above */}
      {(expanded || !hasPhotoBars) && (
        <>
          {hasPhotoBars && (
            <div className="directory-section-label directory-section-label--all">
              More Bars
            </div>
          )}
          <div className="directory-list">
            {bars.map(bar => (
              <Link key={bar.id} href={`/bars/${bar.slug}`} className="directory-list-item">
                <div className="directory-list-name">{bar.name}</div>
                <div className="directory-list-location">
                  {bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}
                </div>
                <div className="directory-list-type">{formatBarType(bar.type)}</div>
                <svg className="directory-list-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
