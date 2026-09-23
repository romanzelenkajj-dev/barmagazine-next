'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { groupCitiesByRegion, regionOfGeo, DEFAULT_REGION } from '@/lib/city-regions';

/**
 * The city-guide directory (Roman, task 118): one white card, heading
 * inside, region tabs (Europe, North America, Latin America, Asia, Middle
 * East and Africa, Oceania), one region visible at a time, its cities in a
 * four-column alphabetical grid of plain links in the article link style.
 * It replaced a cloud of 110 pills.
 *
 * Every city link is in the HTML on every viewport: the inactive panels are
 * `hidden`, not absent. The default tab is the visitor's region from the IP
 * geo the site already reads. /bars passes it from the request headers;
 * the ISR city pages cannot see headers, so they start on Europe and ask
 * /api/geo once after mount, switching only if the visitor has not picked a
 * tab. The server and the client render the same initial markup either way.
 */
export function CityGuideDirectory({
  heading,
  cities,
  defaultRegion,
}: {
  heading: string;
  cities: { slug: string; city: string; country: string }[];
  /** The visitor's region from the request's IP geo, when the page can read it. */
  defaultRegion?: string;
}) {
  const groups = groupCitiesByRegion(cities);
  const has = (r: string | undefined) => !!r && groups.some(g => g.region === r);
  const initial = has(defaultRegion) ? (defaultRegion as string) : has(DEFAULT_REGION) ? DEFAULT_REGION : groups[0]?.region;
  const [active, setActive] = useState<string | undefined>(initial);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    if (defaultRegion || picked) return;
    let live = true;
    fetch('/api/geo')
      .then(r => (r.ok ? r.json() : null))
      .then(geo => {
        if (!live || picked || !geo?.country) return;
        const r = regionOfGeo('', String(geo.country));
        if (groups.some(g => g.region === r)) setActive(r);
      })
      .catch(() => {});
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (groups.length === 0) return null;

  const idFor = (region: string) => `city-region-${region.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <section className="city-guides">
      <h2 className="city-guides-heading">{heading}</h2>
      <div className="city-guides-tabs" role="tablist" aria-label="Region">
        {groups.map(g => (
          <button
            key={g.region}
            type="button"
            role="tab"
            id={`${idFor(g.region)}-tab`}
            aria-selected={g.region === active}
            aria-controls={idFor(g.region)}
            className={`city-guides-tab${g.region === active ? ' is-active' : ''}`}
            onClick={() => { setPicked(true); setActive(g.region); }}
          >
            {g.region}
          </button>
        ))}
      </div>
      {groups.map(g => (
        <ul
          key={g.region}
          id={idFor(g.region)}
          role="tabpanel"
          aria-labelledby={`${idFor(g.region)}-tab`}
          className="city-region-grid"
          hidden={g.region !== active}
        >
          {g.cities.map(c => (
            <li key={c.slug}>
              <Link href={`/best-bars/${c.slug}`} className="city-guide-link">
                {c.city}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
