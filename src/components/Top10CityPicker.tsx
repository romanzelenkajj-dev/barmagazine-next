'use client';

import Link from 'next/link';
import { TOP10_CITIES } from '@/lib/top10-cities';

export { TOP10_CITIES };

export function Top10CityPicker() {
  return (
    <div className="top10-picker">
      <div className="top10-picker-header">
        <span className="top10-picker-eyebrow">Top 10 Bars</span>
        <Link href="/bars" className="top10-picker-viewall-inline">View all →</Link>
      </div>
      <p className="top10-picker-tagline">The world&rsquo;s best bars, by city</p>
      <div className="top10-picker-grid">
        {TOP10_CITIES.map(c => (
          <Link
            key={c.dirSlug}
            href={`/bars/city/${c.dirSlug}?view=top10`}
            className="top10-picker-city"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
