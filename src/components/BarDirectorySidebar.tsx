'use client';

import Link from 'next/link';
import { Top10CityPicker } from './Top10CityPicker';

/** Promo box — rendered as a direct grid child alongside the hero */
export function BarDirectorySidebarPromo() {
  return (
    <div className="bars-sidebar-promo">
      <div className="bars-sidebar-promo-badge">
        🔥 Launch Special — 50% Off First Year
      </div>
      <div className="bars-sidebar-promo-body">
        <h2 className="bars-sidebar-promo-title">
          Get Your Bar <span className="bars-sidebar-promo-accent">Featured</span>
        </h2>
        <p className="bars-sidebar-promo-desc">
          Put your bar in front of thousands of cocktail enthusiasts and industry professionals — starting at just €19.50/month.
        </p>
      </div>
      <Link href="/claim-your-bar" className="bars-sidebar-promo-btn">
        List Your Bar →
      </Link>
    </div>
  );
}

/** Sidebar rest — ad + Top 10 city picker, rendered as a direct grid child below the promo */
export function BarDirectorySidebar() {
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

      {/* ── Top 10 Bars city picker ── */}
      <Top10CityPicker />

    </div>
  );
}
