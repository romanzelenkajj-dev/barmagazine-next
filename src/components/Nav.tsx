'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links: { href: string; label: string; badge?: string }[] = [
    { href: '/', label: 'Latest' },
    { href: '/category/bars', label: 'Bars' },
    { href: '/category/people', label: 'People' },
    { href: '/category/cocktails', label: 'Cocktails' },
    { href: '/category/awards-events', label: 'Awards' },
    { href: '/category/brands', label: 'Brands' },
    { href: '/events', label: 'Events' },
    { href: '/bars', label: 'Directory' },
  ];

  return (
    <>
      <div className="nav-wrapper">
        <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-white.png"
                alt="BarMagazine"
                width={164}
                height={29}
                style={{ height: 29, width: 'auto' }}
              />
            </Link>
            <ul className="nav-links">
              {links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={pathname === link.href ? 'active' : ''}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="nav-badge">{link.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/claim-your-bar" className="nav-cta">
              List Your Bar
            </Link>
            <Link href="/search" className="nav-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="nav-search-text">Search</span>
            </Link>
            <button
              className="nav-mobile"
              aria-label="Menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map(link => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/claim-your-bar" className="mobile-menu-cta" onClick={() => setMenuOpen(false)}>
          List Your Bar
        </Link>
      </div>
    </>
  );
}
