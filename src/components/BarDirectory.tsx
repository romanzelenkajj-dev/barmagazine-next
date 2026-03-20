'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/supabase';
import { getGeoScore } from '@/lib/geo';
import { formatBarType } from '@/lib/utils';

interface Props {
  initialBars: Bar[];
  totalBars?: number;
  totalCountries?: number;
  totalCities?: number;
  countries: string[];
  cities: string[];
  types: string[];
  geoCity?: string;
  geoCountryCode?: string;
  geoContinent?: string;
}

const ITEMS_PER_PAGE = 24;
const LIST_PER_PAGE = 40;

// World's 50 Best Bars 2025 — used as a ranking signal
const FIFTY_BEST_2025 = new Set([
  'Bar Leone', 'Handshake Speakeasy', 'Sips', 'Paradiso',
  'Tayēr + Elementary', 'The Connaught Bar', 'Moebius Milano', 'Line',
  'Jigger & Pony', 'Tres Monos', 'Alquímico', 'Superbueno',
  'Lady Bee', 'Himkok', 'Bar Us', 'Zest', 'Bar Nouveau',
  'Benfiddich', "Caretaker's Cottage", 'The Cambridge Public House',
  "Satan's Whiskers", 'Locale Firenze', 'Tlecān', 'Tan Tan',
  'Mirror Bar', 'CoChinChina', 'Baba au Rum', 'Nouvelle Vague',
  'Hope & Sesame', 'Danico', 'Scarfes Bar', 'Svanen',
  'Sastrería Martinez', 'Panda & Sons', 'Röda Huset', 'Mimi Kakushi',
  'Salmon Guru', 'Coa', 'Sip & Guzzle', 'Drink Kong',
  'Double Chicken Please', 'Maybe Sammy', '1930', 'Jewel of the South',
  'Virtù', 'Overstory', 'The Bar in Front of the Bar', 'The Bellwood',
  'BKK Social Club', 'Nutmeg & Clove',
]);

// Sort bars with geo-targeting: nearby bars first, then articles, 50 Best, photos
function sortBars(
  bars: Bar[],
  geoCity: string = '',
  geoCountryCode: string = '',
  geoContinent: string = ''
): Bar[] {
  return [...bars].sort((a, b) => {
    // 1. Geo proximity (city → country → continent)
    const aGeo = getGeoScore(a, geoCity, geoCountryCode, geoContinent);
    const bGeo = getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    if (aGeo !== bGeo) return bGeo - aGeo;

    // 2. Bars with editorial articles
    const aHasArticle = a.wp_article_slug ? 1 : 0;
    const bHasArticle = b.wp_article_slug ? 1 : 0;
    if (aHasArticle !== bHasArticle) return bHasArticle - aHasArticle;

    // 3. World's 50 Best
    const aIs50Best = FIFTY_BEST_2025.has(a.name) ? 1 : 0;
    const bIs50Best = FIFTY_BEST_2025.has(b.name) ? 1 : 0;
    if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;

    // 4. Bars with photos
    const aHasPhoto = (a.photos && a.photos.length > 0) ? 1 : 0;
    const bHasPhoto = (b.photos && b.photos.length > 0) ? 1 : 0;
    if (aHasPhoto !== bHasPhoto) return bHasPhoto - aHasPhoto;

    // 5. Alphabetical
    return a.name.localeCompare(b.name);
  });
}

export function BarDirectoryClient({
  initialBars,
  countries,
  cities,
  types,
  geoCity = '',
  geoCountryCode = '',
  geoContinent = '',
}: Props) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [listVisibleCount, setListVisibleCount] = useState(LIST_PER_PAGE);
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
    return sortBars(result, geoCity, geoCountryCode, geoContinent);
  }, [search, countryFilter, cityFilter, typeFilter, initialBars, geoCity, geoCountryCode, geoContinent]);

  // Split: featured (article + photo) sorted newest first, photo bars, text-only bars
  const { featuredBars, photoBars } = useMemo(() => {
    const allFeatured = filtered
      .filter(b => b.wp_article_slug && b.photos && b.photos.length > 0)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const nonArticlePhoto = filtered.filter(b => (!b.wp_article_slug) && b.photos && b.photos.length > 0);
    return {
      featuredBars: allFeatured,
      photoBars: nonArticlePhoto,
    };
  }, [filtered]);

  const textBars = useMemo(() => {
    return filtered.filter(b => !b.photos || b.photos.length === 0);
  }, [filtered]);

  const visiblePhotoBars = photoBars.slice(0, visibleCount);
  const hasMorePhotoBars = visibleCount < photoBars.length;

  // Text bars hidden by default — only shown after all photo bars loaded
  const [showTextBars, setShowTextBars] = useState(false);
  const visibleTextBars = showTextBars ? textBars.slice(0, listVisibleCount) : [];
  const hasMoreTextBars = listVisibleCount < textBars.length;

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
    setListVisibleCount(LIST_PER_PAGE);
  }, []);

  return (
    <div className="directory-page">
      {/* Hero */}
      <div className="directory-hero">
        <div className="directory-hero-inner">
          <div className="directory-hero-badge">Global Bar Directory</div>
          <span className="directory-hero-divider" aria-hidden="true" />
          <h1>Discover the World&apos;s<br /> Best Bars</h1>
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
            onChange={e => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); setListVisibleCount(LIST_PER_PAGE); }}
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
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setCityFilter(''); setVisibleCount(ITEMS_PER_PAGE); setListVisibleCount(LIST_PER_PAGE); }}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setVisibleCount(ITEMS_PER_PAGE); setListVisibleCount(LIST_PER_PAGE); }}>
            <option value="">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setVisibleCount(ITEMS_PER_PAGE); setListVisibleCount(LIST_PER_PAGE); }}>
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
          {isFiltering
            ? `${filtered.length} ${filtered.length === 1 ? 'bar' : 'bars'} found`
            : `${totalBars || filtered.length} ${(totalBars || filtered.length) === 1 ? 'bar' : 'bars'}`}
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

      {/* INLINE CTA — List Your Bar */}
      {!isFiltering && (
        <div className="directory-inline-cta">
          <div className="directory-inline-cta-inner">
            <div className="directory-inline-cta-text">
              <h3>Get your bar on the map</h3>
              <p>Free listing or upgrade for a BarMagazine feature article and priority placement.</p>
            </div>
            <Link href="/claim-your-bar" className="directory-inline-cta-btn">
              List Your Bar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      )}

      {/* Photo Bars Grid — non-featured bars with photos */}
      {visiblePhotoBars.length > 0 && (
        <>
          <div className="directory-grid" ref={gridRef}>
            {visiblePhotoBars.map(bar => (
              <PhotoBarCard key={bar.id} bar={bar} />
            ))}
          </div>

          {hasMorePhotoBars && (
            <div className="directory-load-more">
              <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>
                Show More Bars
              </button>
            </div>
          )}
        </>
      )}

      {/* Show More Bars button — reveals text-only bars only after all photo bars are visible */}
      {!showTextBars && !hasMorePhotoBars && textBars.length > 0 && (
        <div className="directory-load-more">
          <button onClick={() => setShowTextBars(true)}>
            Show More Bars
          </button>
        </div>
      )}

      {/* Text-only Bars List — revealed after clicking Show More */}
      {showTextBars && visibleTextBars.length > 0 && (
        <div className="directory-list-section">
          <div className="directory-list">
            {visibleTextBars.map(bar => {
              return (
              <Link key={bar.id} href={`/bars/${bar.slug}`} className="directory-list-item">
                <div className="directory-list-name">
                  {bar.name}
                </div>
                <div className="directory-list-location">
                  {bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}
                </div>
                <div className="directory-list-type">{formatBarType(bar.type)}</div>
                <svg className="directory-list-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              );
            })}
          </div>

          {hasMoreTextBars && (
            <div className="directory-load-more">
              <button onClick={() => setListVisibleCount(prev => prev + LIST_PER_PAGE)}>
                Show More Bars
              </button>
            </div>
          )}
        </div>
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


    </div>
  );
}

/* Featured bar card — clean: "Featured" badge top-left, bar name bottom-left */
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
        <div className="bar-dir-featured-badge-corner">Featured</div>
        <div className="bar-dir-featured-content">
          <h3>{bar.name}</h3>
          <span className="bar-dir-featured-location">
            {bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* Photo bar card */
function PhotoBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;

  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-card">
      <div className="bar-dir-card-visual">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={bar.name} loading="lazy" />
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
        <span className="bar-dir-type">{formatBarType(bar.type)}</span>
      </div>
    </Link>
  );
}
