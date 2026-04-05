'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Cities with a dedicated Top 10 article slug → navigate to the article
// Cities without a slug → navigate to /bars?city=CityName (directory filter)
const TOP10_CITIES: { label: string; slug?: string; city?: string }[] = [
  { label: 'Dubai', slug: 'top-10-bars-in-dubai-2025' },
  // Add more as articles are published, e.g.:
  // { label: 'London', city: 'London' },
  // { label: 'New York', city: 'New York' },
];

/** Promo box — rendered as a direct grid child alongside the hero */
export function BarDirectorySidebarPromo() {
  return (
    <div className="bars-sidebar-promo">
      <div className="bars-sidebar-promo-badge">
        🔥 Launch Special — 50% Off First Year
      </div>
      <h2 className="bars-sidebar-promo-title">
        Get Your Bar <span className="bars-sidebar-promo-accent">Featured</span>
      </h2>
      <p className="bars-sidebar-promo-desc">
        Put your bar in front of thousands of cocktail enthusiasts and industry professionals — starting at just €19.50/month.
      </p>
      <Link href="/claim-your-bar" className="bars-sidebar-promo-btn">
        List Your Bar →
      </Link>
    </div>
  );
}

/** Sidebar rest — ad + Top 10 dropdown, rendered as a direct grid child below the promo */
export function BarDirectorySidebar() {
  const router = useRouter();

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (!value) return;
    router.push(value);
  }

  return (
    <div className="bars-sidebar">

      {/* ── Flavour Blaster Ad ── */}
      <a
        href="https://flavourblaster.com/BARMAGAZINE"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="bars-sidebar-ad"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/flavour-blaster.jpg" alt="Flavour Blaster — CODE: BarMagazine" />
      </a>

      {/* ── Top 10 Bars dropdown ── */}
      <div className="bars-sidebar-top10">
        <h3 className="bars-sidebar-top10-title">Top 10 Bars In</h3>
        <div className="bars-sidebar-top10-select-wrap">
          <select
            defaultValue=""
            onChange={handleCityChange}
            className="bars-sidebar-top10-select"
          >
            <option value="">Select a city…</option>
            {TOP10_CITIES.map(c => {
              const href = c.slug
                ? `/${c.slug}`
                : `/bars?city=${encodeURIComponent(c.city || c.label)}`;
              return (
                <option key={c.label} value={href}>{c.label}</option>
              );
            })}
          </select>
          <svg className="bars-sidebar-top10-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

    </div>
  );
}
