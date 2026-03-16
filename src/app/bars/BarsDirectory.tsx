'use client';

import { useState, useMemo } from 'react';
import { BARS_DATA } from '@/lib/bars-data';
import Link from 'next/link';

export function BarsDirectory() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = useMemo(() => {
    const c = Array.from(new Set(BARS_DATA.map(b => b.city))).sort();
    return ['All', ...c];
  }, []);

  const filtered = useMemo(() => {
    return BARS_DATA.filter(bar => {
      const matchCity = selectedCity === 'All' || bar.city === selectedCity;
      const matchSearch = !search || 
        bar.name.toLowerCase().includes(search.toLowerCase()) ||
        bar.city.toLowerCase().includes(search.toLowerCase()) ||
        bar.country.toLowerCase().includes(search.toLowerCase());
      return matchCity && matchSearch;
    });
  }, [search, selectedCity]);

  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Bar Directory
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600 }}>
          Discover the world&apos;s best cocktail bars. From World&apos;s 50 Best to hidden gems, explore {BARS_DATA.length} curated bars across the globe.
        </p>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search bars, cities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 300px',
            padding: '12px 20px',
            borderRadius: 100,
            border: '1px solid var(--border)',
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'var(--bg-card)',
            outline: 'none',
          }}
        />
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          style={{
            padding: '12px 20px',
            borderRadius: 100,
            border: '1px solid var(--border)',
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {cities.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
        Showing {filtered.length} bars
      </p>

      {/* Bar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 'var(--gap)',
      }}>
        {filtered.map((bar, i) => (
          <div
            key={i}
            style={{
              background: bar.gradient || 'var(--bg-dark)',
              borderRadius: 'var(--radius)',
              padding: 28,
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: 220,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{bar.name}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {bar.city}, {bar.country}
                </p>
              </div>
              {bar.ranking_badge && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'var(--accent)',
                  padding: '4px 10px',
                  borderRadius: 100,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}>
                  {bar.ranking_badge}
                </span>
              )}
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
              {bar.description}
            </p>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {bar.address}
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {bar.instagram_url && (
                <a
                  href={bar.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    transition: 'all 0.3s',
                  }}
                >
                  {bar.instagram}
                </a>
              )}
              {bar.website && bar.website !== 'Not listed' && bar.website !== 'Not available' && (
                <a
                  href={bar.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    transition: 'all 0.3s',
                  }}
                >
                  Website
                </a>
              )}
              {bar.phone && bar.phone !== 'Not listed' && bar.phone !== 'Not available' && (
                <a
                  href={`tel:${bar.phone}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                  }}
                >
                  {bar.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: 16 }}>No bars found matching your search.</p>
        </div>
      )}

      {/* CTA */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        textAlign: 'center',
        marginTop: 48,
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Want your bar listed?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
          Join the world&apos;s leading bars in our directory. Get featured to cocktail enthusiasts, industry professionals, and travelers worldwide.
        </p>
        <Link
          href="/work-with-us"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          View Packages
        </Link>
      </div>
    </div>
  );
}
