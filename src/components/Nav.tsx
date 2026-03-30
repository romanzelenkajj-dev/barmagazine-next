'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // On mount: read saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem('bm-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('bm-theme', next ? 'dark' : 'light');
  };

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
    { href: '/bars', label: 'Bar Directory' },
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
            {/* Dark mode toggle */}
            <button
              className="nav-theme-toggle"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                /* Sun icon */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                /* Moon icon */
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
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
        {/* Dark mode toggle in mobile menu */}
        <button
          className="mobile-menu-theme-toggle"
          onClick={() => { toggleDarkMode(); setMenuOpen(false); }}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀ Light Mode' : '☽ Dark Mode'}
        </button>
      </div>
    </>
  );
}
