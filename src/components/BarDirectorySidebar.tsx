'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Top10FooterBlock } from './Top10FooterBlock';

/**
 * Currency for the promo price. These promos render inside ISR-cached
 * pages (one HTML for every visitor), so the currency must resolve
 * client-side: geo_currency cookie first, /api/geo on a cold visit
 * (writing the cookie for the rest of the session), USD if everything
 * fails - the US is the biggest audience, and the hardcoded EUR here is
 * exactly what showed a Californian EUR pricing.
 */
function usePromoCurrencySymbol(): '$' | '€' {
  const [sym, setSym] = useState<'$' | '€'>('$');
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )geo_currency=(EUR|USD)/);
    if (m) {
      if (m[1] === 'EUR') setSym('€');
      return;
    }
    fetch('/api/geo')
      .then(r => r.json())
      .then(d => {
        const cur = d.isEU ? 'EUR' : 'USD';
        document.cookie = `geo_currency=${cur};path=/;max-age=3600;samesite=lax`;
        if (cur === 'EUR') setSym('€');
      })
      .catch(() => {});
  }, []);
  return sym;
}

/** Promo box — rendered as a direct grid child alongside the hero */
export function BarDirectorySidebarPromo() {
  const sym = usePromoCurrencySymbol();
  return (
    <div className="bars-sidebar-promo">
      <div className="bars-sidebar-promo-badge">
        🔥 Launch Special · 50% Off First Year
      </div>
      <div className="bars-sidebar-promo-body">
        <h2 className="bars-sidebar-promo-title">
          Get Your Bar <span className="bars-sidebar-promo-accent">Featured</span>
        </h2>
        <p className="bars-sidebar-promo-desc">
          Put your bar in front of thousands of cocktail enthusiasts and industry professionals, starting at just {sym}19.50/month.
        </p>
      </div>
      <Link href="/feature-your-bar" className="bars-sidebar-promo-btn">
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

      {/* ── Top 10 Bars ── */}
      <Top10FooterBlock />

    </div>
  );
}
