'use client';

import Link from 'next/link';
import { TOP10_CITIES, top10Href } from '@/lib/top10-cities';

export { TOP10_CITIES };

export function Top10CityPicker() {
  return (
    <div className="top10-picker">
      <div className="top10-picker-header">
        <span className="top10-picker-eyebrow">Top 10 Bars</span>
        <Link href="/bars" className="top10-picker-viewall-inline">View all →</Link>
      </div>
      <div className="top10-picker-grid">
        {TOP10_CITIES.map(c => (
          <Link
            key={c.dirSlug}
            href={top10Href(c)}
            className="top10-picker-city"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
