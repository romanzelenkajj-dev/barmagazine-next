'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Persistent bottom action bar — inspired by Fun Radio's pinned mini-player.
 * One tap into the geo-sorted Bar Directory.
 *
 * Shown on the homepage and on the city/country directory listings, where it
 * is a genuine shortcut. Deliberately NOT shown on /bars itself (it links
 * there, so it would be a button to the current page), nor on individual bar
 * profiles or articles.
 */
function showsNearMeBar(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/bars/city/') ||
    pathname.startsWith('/bars/country/')
  );
}

export function NearMeBar({ barCount, cityCount }: { barCount: number; cityCount: number }) {
  const pathname = usePathname();

  if (!pathname || !showsNearMeBar(pathname)) {
    return null;
  }

  return (
    <>
      <Link href="/bars" className="nearme-bar" aria-label="Find bars near me">
        <span className="nearme-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <span className="nearme-text">
          <strong>Find bars near me</strong>
          <small>{barCount.toLocaleString('en-US')}+ bars &middot; {cityCount} cities worldwide</small>
        </span>
        <span className="nearme-go">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </Link>
      {/* In-flow clearance below the footer — the pill is fixed, so without
          this it would sit on top of the last thing on the page. */}
      <div className="nearme-spacer" aria-hidden="true" />
    </>
  );
}
