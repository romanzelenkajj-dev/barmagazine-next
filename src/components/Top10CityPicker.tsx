'use client';

import Link from 'next/link';

const TOP10_CITIES = [
  { label: 'Austin',        dirSlug: 'austin',        flag: '🤠' },
  { label: 'Barcelona',     dirSlug: 'barcelona',     flag: '🇪🇸' },
  { label: 'Boston',        dirSlug: 'boston',        flag: '🦞' },
  { label: 'Chicago',       dirSlug: 'chicago',       flag: '🏙️' },
  { label: 'Denver',        dirSlug: 'denver',        flag: '🏔️' },
  { label: 'Hong Kong',     dirSlug: 'hong-kong',     flag: '🇭🇰' },
  { label: 'Las Vegas',     dirSlug: 'las-vegas',     flag: '🎰' },
  { label: 'London',        dirSlug: 'london',        flag: '🇬🇧' },
  { label: 'Los Angeles',   dirSlug: 'los-angeles',   flag: '🌴' },
  { label: 'Mexico City',   dirSlug: 'mexico-city',   flag: '🇲🇽' },
  { label: 'Miami',         dirSlug: 'miami',         flag: '🌊' },
  { label: 'New Orleans',   dirSlug: 'new-orleans',   flag: '🎷' },
  { label: 'New York',      dirSlug: 'new-york',      flag: '🗽' },
  { label: 'Paris',         dirSlug: 'paris',         flag: '🇫🇷' },
  { label: 'Philadelphia',  dirSlug: 'philadelphia',  flag: '🔔' },
  { label: 'San Diego',     dirSlug: 'san-diego',     flag: '☀️' },
  { label: 'San Francisco', dirSlug: 'san-francisco', flag: '🌉' },
  { label: 'Seattle',       dirSlug: 'seattle',       flag: '☕' },
  { label: 'Singapore',     dirSlug: 'singapore',     flag: '🇸🇬' },
  { label: 'Sydney',        dirSlug: 'sydney',        flag: '🦘' },
  { label: 'Tokyo',         dirSlug: 'tokyo',         flag: '🇯🇵' },
  { label: 'Washington DC', dirSlug: 'washington-dc', flag: '🏛️' },
];

export function Top10CityPicker() {
  return (
    <div className="top10-picker">
      <div className="top10-picker-header">
        <span className="top10-picker-label">TOP 10 BARS</span>
        <span className="top10-picker-sub">Select a city</span>
      </div>
      <div className="top10-picker-grid">
        {TOP10_CITIES.map(c => (
          <Link
            key={c.dirSlug}
            href={`/bars/city/${c.dirSlug}`}
            className="top10-picker-city"
          >
            <span className="top10-picker-flag">{c.flag}</span>
            <span className="top10-picker-name">{c.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/bars" className="top10-picker-all">
        View All Cities →
      </Link>
    </div>
  );
}
