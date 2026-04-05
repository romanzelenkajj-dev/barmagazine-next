'use client';

import Link from 'next/link';
import { useState } from 'react';

const TOP10_CITIES = [
  { label: 'Dubai', slug: 'top-10-bars-in-dubai-2025' },
  // More cities coming soon
];

export function BarDirectorySidebar() {
  const [selectedCity, setSelectedCity] = useState('');

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    setSelectedCity(slug);
    if (slug) {
      window.location.href = `/${slug}`;
    }
  }

  return (
    <aside className="bars-sidebar">

      {/* ── Promo Box ── */}
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

      {/* ── Top 10 Bars ── */}
      <div className="bars-sidebar-top10">
        <h3 className="bars-sidebar-top10-title">Top 10 Bars In</h3>
        <div className="bars-sidebar-top10-select-wrap">
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="bars-sidebar-top10-select"
          >
            <option value="">Select a city…</option>
            {TOP10_CITIES.map(c => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <svg className="bars-sidebar-top10-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
        </div>
        {/* Quick links */}
        <div className="bars-sidebar-top10-links">
          {TOP10_CITIES.map(c => (
            <Link key={c.slug} href={`/${c.slug}`} className="bars-sidebar-top10-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Top 10 Bars in {c.label}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
