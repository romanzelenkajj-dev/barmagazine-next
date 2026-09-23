'use client';

import { useState } from 'react';
import Link from 'next/link';
import { groupCitiesByRegion, OPEN_BY_DEFAULT } from '@/lib/city-regions';

/**
 * The city-guide directory (Roman, task 118): one white card, heading
 * inside, the cities grouped by region in columns, plain text links in the
 * article link style. It replaced a cloud of 110 pills.
 *
 * Every city link is in the HTML on every viewport. On phones each region
 * is a collapsible header, Europe and North America open by default; the
 * collapse is a class the phone stylesheet reads, so the desktop columns
 * never hide anything and the server and client render the same markup.
 */
export function CityGuideDirectory({
  heading,
  cities,
}: {
  heading: string;
  cities: { slug: string; city: string; country: string }[];
}) {
  const groups = groupCitiesByRegion(cities);
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(groups.map(g => g.region).filter(r => !OPEN_BY_DEFAULT.has(r)))
  );
  if (groups.length === 0) return null;

  const toggle = (region: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });

  return (
    <section className="city-guides">
      <h2 className="city-guides-heading">{heading}</h2>
      <div className="city-guides-regions">
        {groups.map(g => {
          const isCollapsed = collapsed.has(g.region);
          const listId = `city-region-${g.region.toLowerCase().replace(/[^a-z]+/g, '-')}`;
          return (
            <div key={g.region} className={`city-region${isCollapsed ? ' is-collapsed' : ''}`}>
              <button
                type="button"
                className="city-region-head"
                onClick={() => toggle(g.region)}
                aria-expanded={!isCollapsed}
                aria-controls={listId}
              >
                <span>{g.region}</span>
                <svg className="city-region-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <ul id={listId} className="city-region-list">
                {g.cities.map(c => (
                  <li key={c.slug}>
                    <Link href={`/best-bars/${c.slug}`} className="city-guide-link">
                      {c.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
