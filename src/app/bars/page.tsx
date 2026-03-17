'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import barsData from '@/data/bars.json';

interface Bar {
  id: number | null;
  name: string;
  slug: string;
  city: string;
  country: string;
  type: string;
  excerpt: string;
  image: string | null;
  wp_post_slug: string | null;
  ranking?: string;
}

const bars: Bar[] = barsData as Bar[];

// Get unique values for filters
const cities = Array.from(new Set(bars.map(b => b.city).filter(c => c && c !== 'Unknown'))).sort();
const countries = Array.from(new Set(bars.map(b => b.country).filter(c => c && c !== 'Unknown'))).sort();
const types = Array.from(new Set(bars.map(b => b.type))).sort();

export default function BarsDirectoryPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    return bars.filter(bar => {
      const matchSearch = !search || 
        bar.name.toLowerCase().includes(search.toLowerCase()) ||
        bar.city.toLowerCase().includes(search.toLowerCase()) ||
        bar.country.toLowerCase().includes(search.toLowerCase());
      const matchCity = !cityFilter || bar.city === cityFilter;
      const matchCountry = !countryFilter || bar.country === countryFilter;
      const matchType = !typeFilter || bar.type === typeFilter;
      return matchSearch && matchCity && matchCountry && matchType;
    });
  }, [search, cityFilter, countryFilter, typeFilter]);

  // Available cities based on country filter
  const availableCities = useMemo(() => {
    if (!countryFilter) return cities;
    return Array.from(new Set(bars.filter(b => b.country === countryFilter).map(b => b.city).filter(c => c && c !== 'Unknown'))).sort();
  }, [countryFilter]);

  const clearFilters = () => {
    setSearch('');
    setCityFilter('');
    setCountryFilter('');
    setTypeFilter('');
  };

  const hasFilters = search || cityFilter || countryFilter || typeFilter;

  return (
    <div className="directory-page">
      {/* Hero */}
      <div className="directory-hero">
        <h1>Bar Directory</h1>
        <p>Discover {bars.length} bars across {countries.length} countries</p>
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
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="directory-filter-row">
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setCityFilter(''); }}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
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
        {hasFilters && <span> &mdash; filtered</span>}
      </div>

      {/* Bar Grid */}
      <div className="directory-grid">
        {filtered.map((bar, i) => (
          <BarCard key={`${bar.slug}-${i}`} bar={bar} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="directory-empty">
          <p>No bars found matching your filters.</p>
          <button onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      {/* CTA */}
      <div className="directory-cta">
        <h2>Add Your Bar</h2>
        <p>Join the Bar Magazine directory and reach cocktail enthusiasts worldwide.</p>
        <Link href="/add-your-bar" className="directory-cta-btn">Get Listed</Link>
      </div>
    </div>
  );
}

function BarCard({ bar }: { bar: Bar }) {
  const href = bar.wp_post_slug ? `/${bar.wp_post_slug}` : null;
  const hasImage = !!bar.image;
  const cardClass = hasImage ? 'bar-dir-card' : 'bar-dir-card bar-dir-card--text';

  const inner = hasImage ? (
    <>
      <div className="bar-dir-card-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bar.image!} alt={bar.name} loading="lazy" />
        {bar.ranking && (
          <span className="bar-dir-badge">{bar.ranking.replace("World's 50 Best Bars 2025 - ", "")}</span>
        )}
      </div>
      <div className="bar-dir-card-body">
        <h3>{bar.name}</h3>
        <div className="bar-dir-card-meta">
          <span className="bar-dir-city">{bar.city}</span>
          {bar.city !== bar.country && <span className="bar-dir-country">{bar.country}</span>}
        </div>
        <span className="bar-dir-type">{bar.type}</span>
      </div>
    </>
  ) : (
    <div className="bar-dir-card-body">
      <h3>{bar.name}</h3>
      <div className="bar-dir-card-meta">
        <span className="bar-dir-city">{bar.city}</span>
        {bar.city !== bar.country && <span className="bar-dir-country">{bar.country}</span>}
      </div>
      <span className="bar-dir-type">{bar.type}</span>
      {bar.ranking && (
        <span className="bar-dir-badge-inline">{bar.ranking.replace("World's 50 Best Bars 2025 - ", "")}</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className={cardClass}>{inner}</Link>;
  }
  return <div className={cardClass}>{inner}</div>;
}
