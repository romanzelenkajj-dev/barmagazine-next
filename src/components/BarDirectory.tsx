'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/supabase';

interface Props {
  initialBars: Bar[];
  totalBars: number;
  totalCountries: number;
  totalCities: number;
  countries: string[];
  cities: string[];
  types: string[];
}

const ITEMS_PER_PAGE = 24;

// Generate a warm gradient based on bar name for cards without photos
function getBarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #2d1b3d 0%, #3d1f47 50%, #1a1a2e 100%)',
    'linear-gradient(135deg, #1e3a2f 0%, #1a3a4a 50%, #162447 100%)',
    'linear-gradient(135deg, #3d2c1e 0%, #4a3728 50%, #2d1b12 100%)',
    'linear-gradient(135deg, #2e1a1a 0%, #3d2525 50%, #1a1a2e 100%)',
    'linear-gradient(135deg, #1a2e2e 0%, #254040 50%, #1a1a2e 100%)',
    'linear-gradient(135deg, #2e2a1a 0%, #403a25 50%, #2e1a1a 100%)',
    'linear-gradient(135deg, #1a1a3d 0%, #252547 50%, #0f0f2e 100%)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(/[\s\-&]+/)
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// Cocktail glass SVG for no-photo cards
function CocktailIcon() {
  return (
    <svg className="bar-dir-card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8M12 15v7M3 2l3 11h12l3-11" />
      <path d="M7.5 7.5C8.5 9 10 10 12 10s3.5-1 4.5-2.5" />
    </svg>
  );
}

// Sort bars: article bars first (with photos), then photo bars, then no-photo bars
function sortBars(bars: Bar[]): Bar[] {
  return [...bars].sort((a, b) => {
    const aHasArticle = a.wp_article_slug ? 1 : 0;
    const bHasArticle = b.wp_article_slug ? 1 : 0;
    const aHasPhoto = (a.photos && a.photos.length > 0) ? 1 : 0;
    const bHasPhoto = (b.photos && b.photos.length > 0) ? 1 : 0;

    // First: bars with articles
    if (aHasArticle !== bHasArticle) return bHasArticle - aHasArticle;
    // Then: bars with photos
    if (aHasPhoto !== bHasPhoto) return bHasPhoto - aHasPhoto;
    // Finally: alphabetical
    return a.name.localeCompare(b.name);
  });
}

export function BarDirectoryClient({
  initialBars,
  totalBars,
  totalCountries,
  totalCities,
  countries,
  cities,
  types,
}: Props) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter cities based on country selection
  const availableCities = useMemo(() => {
    if (!countryFilter) return cities;
    return Array.from(new Set(initialBars.filter(b => b.country === countryFilter).map(b => b.city))).sort();
  }, [countryFilter, initialBars, cities]);

  const isFiltering = !!(search || countryFilter || cityFilter || typeFilter);

  // Filter bars
  const filtered = useMemo(() => {
    const result = initialBars.filter(bar => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        bar.name.toLowerCase().includes(q) ||
        bar.city.toLowerCase().includes(q) ||
        bar.country.toLowerCase().includes(q);
      const matchCountry = !countryFilter || bar.country === countryFilter;
      const matchCity = !cityFilter || bar.city === cityFilter;
      const matchType = !typeFilter || bar.type === typeFilter;
      return matchSearch && matchCountry && matchCity && matchType;
    });
    return sortBars(result);
  }, [search, countryFilter, cityFilter, typeFilter, initialBars]);

  // Split into featured (have article) and regular
  const featuredBars = useMemo(() => {
    return filtered.filter(b => b.wp_article_slug && b.photos && b.photos.length > 0);
  }, [filtered]);

  const regularBars = useMemo(() => {
    return filtered.filter(b => !b.wp_article_slug || !b.photos || b.photos.length === 0);
  }, [filtered]);

  const visible = regularBars.slice(0, visibleCount);
  const hasMore = visibleCount < regularBars.length;
  const activeFilters: { label: string; clear: () => void }[] = [];

  if (countryFilter) activeFilters.push({ label: countryFilter, clear: () => { setCountryFilter(''); setCityFilter(''); } });
  if (cityFilter) activeFilters.push({ label: cityFilter, clear: () => setCityFilter('') });
  if (typeFilter) activeFilters.push({ label: typeFilter, clear: () => setTypeFilter('') });

  const clearAll = useCallback(() => {
    setSearch('');
    setCountryFilter('');
    setCityFilter('');
    setTypeFilter('');
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  // Count bars per country for stats
  const topCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    initialBars.forEach(b => { counts[b.country] = (counts[b.country] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [initialBars]);

  return (
    <div className="directory-page">
      {/* Hero */}
      <div className="directory-hero">
        <div className="directory-hero-inner">
          <div className="directory-hero-badge">Global Bar Directory</div>
          <h1>Discover the World&apos;s<br /> Best Bars</h1>
          <p>{totalBars} curated bars across {totalCities} cities in {totalCountries} countries</p>
          <div className="directory-hero-stats">
            {topCountries.slice(0, 4).map(([country, count]) => (
              <button
                key={country}
                className="directory-hero-stat"
                onClick={() => { setCountryFilter(country); setVisibleCount(ITEMS_PER_PAGE); }}
              >
                <span className="directory-hero-stat-count">{count}</span>
                <span className="directory-hero-stat-label">{country}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="directory-filters">
        <div className="directory-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search bars, cities, countries..."
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
          />
          {search && (
            <button className="directory-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="directory-filter-row">
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setCityFilter(''); setVisibleCount(ITEMS_PER_PAGE); }}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}>
            <option value="">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="directory-active-filters">
            {activeFilters.map((f, i) => (
              <button key={i} className="directory-filter-chip" onClick={f.clear}>
                {f.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            ))}
            <button className="directory-filter-chip directory-filter-chip--clear" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="directory-results-bar">
        <span className="directory-count">
          {filtered.length} {filtered.length === 1 ? 'bar' : 'bars'}
          {isFiltering && ' found'}
        </span>
      </div>

      {/* Featured Bars Section */}
      {featuredBars.length > 0 && (
        <div className="directory-featured-section">
          {!isFiltering && (
            <div className="directory-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Featured in BarMagazine
            </div>
          )}
          <div className="directory-featured-grid">
            {featuredBars.map(bar => (
              <FeaturedBarCard key={bar.id} bar={bar} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Bars Grid */}
      {visible.length > 0 && (
        <>
          {featuredBars.length > 0 && !isFiltering && (
            <div className="directory-section-label directory-section-label--all">
              All Bars
            </div>
          )}
          <div className="directory-grid" ref={gridRef}>
            {visible.map(bar => (
              <BarCard key={bar.id} bar={bar} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div className="directory-empty">
          <div className="directory-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 8l6 6M14 8l-6 6" />
            </svg>
          </div>
          <h3>No bars found</h3>
          <p>Try adjusting your search or filters.</p>
          <button onClick={clearAll}>Clear all filters</button>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="directory-load-more">
          <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>
            Show More Bars
            <span className="directory-load-more-count">{regularBars.length - visibleCount} remaining</span>
          </button>
        </div>
      )}

      {/* CTA */}
      <div className="directory-cta">
        <div className="directory-cta-inner">
          <div className="directory-cta-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h2>List Your Bar</h2>
          <p>Join the BarMagazine directory and reach cocktail enthusiasts worldwide. Free basic listing, or upgrade for premium visibility.</p>
          <div className="directory-cta-actions">
            <Link href="/add-your-bar" className="directory-cta-btn">Get Listed Free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Featured bar card — larger with image overlay */
function FeaturedBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;

  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-featured-card">
      <div className="bar-dir-featured-visual">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={bar.name} loading="lazy" />
        )}
        <div className="bar-dir-featured-overlay" />
        <div className="bar-dir-featured-content">
          <span className="bar-dir-featured-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4h16v16H4z" />
              <path d="M9 9h6v6H9z" />
            </svg>
            BarMagazine Feature
          </span>
          <h3>{bar.name}</h3>
          <div className="bar-dir-featured-meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</span>
            <span className="bar-dir-featured-type">{bar.type}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Regular bar card */
function BarCard({ bar }: { bar: Bar }) {
  const hasImage = bar.photos && bar.photos.length > 0;
  const imageUrl = hasImage ? bar.photos[0] : null;
  const initials = getInitials(bar.name);

  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-card">
      <div className="bar-dir-card-visual">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl!} alt={bar.name} loading="lazy" />
        ) : (
          <div className="bar-dir-card-placeholder" style={{ background: getBarGradient(bar.name) }}>
            <CocktailIcon />
            <span className="bar-dir-card-initials">{initials}</span>
          </div>
        )}
      </div>
      <div className="bar-dir-card-body">
        <h3>{bar.name}</h3>
        <div className="bar-dir-card-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</span>
        </div>
        <span className="bar-dir-type">{bar.type}</span>
      </div>
    </Link>
  );
}
