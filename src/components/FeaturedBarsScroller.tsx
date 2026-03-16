'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/bars-data';

export function FeaturedBarsScroller({ bars }: { bars: Bar[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <button className="bars-scroll-btn scroll-left" onClick={() => scroll('left')} aria-label="Scroll left">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, stroke: 'currentColor' }}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="bars-grid-scroll" ref={scrollRef}>
        {bars.map((bar) => (
          <Link key={bar.name} href="/bars" className="bar-card">
            <div className="bar-img" style={{ background: bar.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600 }}>
              {bar.ranking_badge || ''}
            </div>
            <h4>{bar.name}</h4>
            <span className="bar-city">{bar.city}, {bar.country}</span>
            <br />
            <span className="bar-link">See more</span>
          </Link>
        ))}
      </div>
      <button className="bars-scroll-btn scroll-right" onClick={() => scroll('right')} aria-label="Scroll right">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, stroke: 'currentColor' }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
