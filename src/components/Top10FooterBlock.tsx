'use client';
import Link from 'next/link';
import { TOP10_CITIES, top10Href } from '@/lib/top10-cities';

export function Top10FooterBlock() {
  return (
    <div className="top10-footer-block">
      <h2 className="top10-footer-heading">Top 10 Bars</h2>
      <ul className="top10-footer-cities">
        {TOP10_CITIES.map(c => (
          <li key={c.dirSlug}>
            <Link href={top10Href(c)}>
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
