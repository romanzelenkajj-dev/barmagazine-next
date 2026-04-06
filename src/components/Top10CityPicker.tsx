'use client';

import Link from 'next/link';

const TOP10_CITIES = [
  { label: 'Austin',        dirSlug: 'austin' },
  { label: 'Barcelona',     dirSlug: 'barcelona' },
  { label: 'Boston',        dirSlug: 'boston' },
  { label: 'Chicago',       dirSlug: 'chicago' },
  { label: 'Denver',        dirSlug: 'denver' },
  { label: 'Hong Kong',     dirSlug: 'hong-kong' },
  { label: 'Las Vegas',     dirSlug: 'las-vegas' },
  { label: 'London',        dirSlug: 'london' },
  { label: 'Los Angeles',   dirSlug: 'los-angeles' },
  { label: 'Mexico City',   dirSlug: 'mexico-city' },
  { label: 'Miami',         dirSlug: 'miami' },
  { label: 'New Orleans',   dirSlug: 'new-orleans' },
  { label: 'New York',      dirSlug: 'new-york' },
  { label: 'Paris',         dirSlug: 'paris' },
  { label: 'Philadelphia',  dirSlug: 'philadelphia' },
  { label: 'San Diego',     dirSlug: 'san-diego' },
  { label: 'San Francisco', dirSlug: 'san-francisco' },
  { label: 'Seattle',       dirSlug: 'seattle' },
  { label: 'Singapore',     dirSlug: 'singapore' },
  { label: 'Sydney',        dirSlug: 'sydney' },
  { label: 'Tokyo',         dirSlug: 'tokyo' },
  { label: 'Washington DC', dirSlug: 'washington-dc' },
];

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
            href={`/bars/city/${c.dirSlug}`}
            className="top10-picker-city"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
