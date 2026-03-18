'use client';

import { useState, useMemo } from 'react';
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

  // Filter cities based on country selection
  const availableCities = useMemo(() => {
    if (!countryFilter) return cities;
    return Array.from(new Set(initialBars.filter(b => b.country === countryFilter).map(b => b.city))).sort();
  }, [countryFilter, initialBars, cities]);

  // Filter bars
  const filtered = useMemo(() => {
    return initialBars.filter(bar => {
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
  }, [search, countryFilter, cityFilter, typeFilter, initialBars]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasFilters = search || countryFilter || cityFilter || typeFilter;

  const clearFilters = () => {
    setSearch('');
    setCountryFilter('');
    setCityFilter('');
    setTypeFilter('');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="directory-page">
      {/* Hero */}
      <div className="directory-hero">
        <h1>Bar Directory</h1>
        <p>Discover {totalBars} bars across {totalCities} cities in {totalCountries} countries</p>
      </div>

      {/* Search & Filters */}
      <div className="directory-filters">
        <div className="directory-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search bars, cities, countries..."
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
          />
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
          {hasFilters && (
            <button className="directory-clear" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="directory-count">
        {filtered.length} {filtered.length === 1 ? 'bar' : 'bars'} found
        {hasFilters && <span> — filtered</span>}
      </div>

      {/* Bar Grid */}
      <div className="directory-grid">
        {visible.map(bar => (
          <BarCard key={bar.id} bar={bar} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="directory-empty">
          <p>No bars found matching your filters.</p>
          <button onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="directory-load-more">
          <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>
            Load More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* CTA */}
      <div className="directory-cta">
        <h2>Add Your Bar</h2>
        <p>Join the BarMagazine directory and reach cocktail enthusiasts worldwide.</p>
        <Link href="/add-your-bar" className="directory-cta-btn">Get Listed</Link>
      </div>
    </div>
  );
}

function BarCard({ bar }: { bar: Bar }) {
  const hasImage = bar.photos && bar.photos.length > 0;
  const imageUrl = hasImage ? bar.photos[0] : null;
  const isPaid = bar.tier === 'featured' || bar.tier === 'premium';

  return (
    <Link href={`/bars/${bar.slug}`} className={`bar-dir-card${!hasImage ? ' bar-dir-card--text' : ''}${isPaid ? ' bar-dir-card--featured' : ''}`}>
      {hasImage && (
        <div className="bar-dir-card-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl!} alt={bar.name} loading="lazy" />
        </div>
      )}
      <div className="bar-dir-card-body">
        <div className="bar-dir-card-header">
          <h3>{bar.name}</h3>
          {isPaid && <span className="bar-dir-badge">{bar.tier === 'premium' ? 'Premium' : 'Featured'}</span>}
        </div>
        <div className="bar-dir-card-meta">
          <span className="bar-dir-city">{bar.city}</span>
          {bar.city !== bar.country && <span className="bar-dir-country">{bar.country}</span>}
        </div>
        <span className="bar-dir-type">{bar.type}</span>
      </div>
    </Link>
  );
}
