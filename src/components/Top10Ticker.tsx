import Link from 'next/link';
import { hasSlug, safeHref } from '@/lib/safe-slug';

export interface TickerBar {
  name: string;
  city: string;
  slug: string;
}

/**
 * Fun Radio-style running line: Top 10 bars scrolling continuously
 * left-to-right in a single black strip. Pure CSS animation (no JS),
 * row duplicated for a seamless loop; pauses on hover.
 */
export function Top10Ticker({ bars }: { bars: TickerBar[] }) {
  const items = bars.filter(hasSlug);
  if (items.length === 0) return null;

  const row = (ariaHidden: boolean) => (
    <div className="ticker-row" aria-hidden={ariaHidden || undefined}>
      {items.map(bar => (
        <Link key={`${bar.slug}${ariaHidden ? '-b' : ''}`} href={safeHref('/bars', bar.slug)} className="ticker-item">
          <span className="ticker-star" aria-hidden="true">★</span>
          {bar.name}
          <span className="ticker-city">{bar.city}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="ticker-strip">
      <span className="ticker-label">★ Top 10 bars</span>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
