'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const ITEMS_PER_PAGE = 24;
const LIST_PER_PAGE = 40;

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

function sortBars(bars: Bar[], geoCity = '', geoCountryCode = '', geoContinent = ''): Bar[] {
  return [...bars].sort((a, b) => {
    const aGeo = getGeoScore(a, geoCity, geoCountryCode, geoContinent);
    const bGeo = getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    if (aGeo !== bGeo) return bGeo - aGeo;
    const aHasArticle = a.wp_article_slug ? 1 : 0;
    const bHasArticle = b.wp_article_slug ? 1 : 0;
    if (aHasArticle !== bHasArticle) return bHasArticle - aHasArticle;
    const aIs50Best = FIFTY_BEST_2025.has(a.name) ? 1 : 0;
    const bIs50Best = FIFTY_BEST_2025.has(b.name) ? 1 : 0;
    if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
    const aHasPhoto = (a.photos && a.photos.length > 0) ? 1 : 0;
    const bHasPhoto = (b.photos && b.photos.length > 0) ? 1 : 0;
    if (aHasPhoto !== bHasPhoto) return bHasPhoto - aHasPhoto;
    return a.name.localeCompare(b.name);
  });
}

/* ─── Map Component (loaded dynamically) ─── */
function DirectoryMap({ bars }: { bars: Bar[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const loadMap = async () => {
      // Load Mapbox CSS
      if (!document.querySelector('link[href*="mapbox-gl"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
        document.head.appendChild(link);
      }
      const mapboxgl = (await import('mapbox-gl')).default;

      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [15, 30],
        zoom: 1.5,
        attributionControl: false,
        minZoom: 1,
        maxZoom: 18,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        // Build GeoJSON
        const geojson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: bars
            .filter(b => b.lat && b.lng)
            .map(bar => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [bar.lng!, bar.lat!],
              },
              properties: {
                id: bar.id,
                name: bar.name,
                slug: bar.slug,
                city: bar.city,
                country: bar.country,
                type: bar.type,
                tier: bar.tier,
                hasPhoto: bar.photos && bar.photos.length > 0 ? 1 : 0,
                photo: bar.photos?.[0] || '',
                hasArticle: bar.wp_article_slug ? 1 : 0,
              },
            })),
        };

        map.addSource('bars', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 50,
        });

        // Cluster circles
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'bars',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step', ['get', 'point_count'],
              '#c47843',  // < 10
              10, '#b06835',  // 10-30
              30, '#9a5a2a',  // 30+
            ],
            'circle-radius': [
              'step', ['get', 'point_count'],
              18,   // < 10
              10, 24,   // 10-30
              30, 32,   // 30+
              100, 40,  // 100+
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(244, 237, 228, 0.3)',
          },
        });

        // Cluster count labels
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'bars',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-size': 13,
          },
          paint: {
            'text-color': '#f5f0eb',
          },
        });

        // Featured/paid bars — larger gold pins
        map.addLayer({
          id: 'bar-points-featured',
          type: 'circle',
          source: 'bars',
          filter: ['all', ['!', ['has', 'point_count']], ['in', ['get', 'tier'], ['literal', ['featured', 'premium']]]],
          paint: {
            'circle-radius': 7,
            'circle-color': '#d4a44a',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#f5f0eb',
            'circle-opacity': 1,
          },
        });

        // Free bars — smaller copper pins
        map.addLayer({
          id: 'bar-points-free',
          type: 'circle',
          source: 'bars',
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'tier'], 'free']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#c47843',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': 'rgba(244, 237, 228, 0.4)',
            'circle-opacity': 0.85,
          },
        });

        // Cluster click → zoom
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (!features[0]) return;
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('bars') as mapboxgl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !zoom) return;
            const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
            map.easeTo({ center: coords, zoom: zoom });
          });
        });

        // Bar click → popup
        const showPopup = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties!;
          const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];

          const isFeatured = props.tier === 'featured' || props.tier === 'premium';
          const photoHtml = props.photo && props.hasPhoto
            ? `<img src="${props.photo}" alt="${props.name}" style="width:100%;height:120px;object-fit:cover;border-radius:6px 6px 0 0;margin:-12px -12px 8px -12px;width:calc(100% + 24px);" />`
            : '';
          const badgeHtml = isFeatured
            ? '<span style="display:inline-block;background:#c47843;color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;font-weight:600;margin-bottom:4px;letter-spacing:0.5px;">FEATURED</span><br/>'
            : '';
          const upgradeHtml = !isFeatured
            ? '<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#c47843;"><a href="/claim-your-bar" style="color:#c47843;text-decoration:none;">★ Upgrade to stand out →</a></div>'
            : '';

          new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '220px',
            className: 'bar-map-popup',
          })
            .setLngLat(coords)
            .setHTML(`
              <div style="cursor:pointer;" onclick="window.location.href='/bars/${props.slug}'">
                ${photoHtml}
                ${badgeHtml}
                <strong style="font-size:14px;color:#f5f0eb;">${props.name}</strong><br/>
                <span style="font-size:12px;color:#a09888;">${props.city}, ${props.country}</span><br/>
                <span style="font-size:11px;color:#7a7060;text-transform:uppercase;letter-spacing:0.5px;">${props.type || 'Bar'}</span>
                ${upgradeHtml}
              </div>
            `)
            .addTo(map);
        };

        map.on('click', 'bar-points-free', showPopup);
        map.on('click', 'bar-points-featured', showPopup);

        // Cursors
        map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'bar-points-free', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'bar-points-free', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'bar-points-featured', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'bar-points-featured', () => { map.getCanvas().style.cursor = ''; });

        setMapLoaded(true);
      });

      mapRef.current = map;
    };

    loadMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map data when bars filter changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('bars') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: bars
        .filter(b => b.lat && b.lng)
        .map(bar => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [bar.lng!, bar.lat!] },
          properties: {
            id: bar.id, name: bar.name, slug: bar.slug,
            city: bar.city, country: bar.country, type: bar.type,
            tier: bar.tier, hasPhoto: bar.photos && bar.photos.length > 0 ? 1 : 0,
            photo: bar.photos?.[0] || '', hasArticle: bar.wp_article_slug ? 1 : 0,
          },
        })),
    };
    source.setData(geojson);
  }, [bars, mapLoaded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => mapRef.current?.resize(), 100);
  };

  return (
    <div className={`directory-map-wrapper ${isExpanded ? 'directory-map-expanded' : ''}`}>
      <div ref={mapContainer} className="directory-map" />
      <button className="directory-map-expand" onClick={toggleExpand} aria-label={isExpanded ? 'Collapse map' : 'Expand map'}>
        {isExpanded ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── Main Component ─── */
export function BarDirectoryMapClient({
  initialBars,
  totalBars,
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
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const gridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const availableCities = useMemo(() => {
    if (!countryFilter) return cities;
    return Array.from(new Set(initialBars.filter(b => b.country === countryFilter).map(b => b.city))).sort();
  }, [countryFilter, initialBars, cities]);

  const isFiltering = !!(search || countryFilter || cityFilter || typeFilter);

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

  const { featuredBars, photoBars } = useMemo(() => {
    const allFeatured = filtered
      .filter(b => b.wp_article_slug && b.photos && b.photos.length > 0);
    const nonArticlePhoto = filtered.filter(b => (!b.wp_article_slug) && b.photos && b.photos.length > 0);
    return { featuredBars: allFeatured, photoBars: nonArticlePhoto };
  }, [filtered]);

  const textBars = useMemo(() => filtered.filter(b => !b.photos || b.photos.length === 0), [filtered]);

  const visiblePhotoBars = photoBars.slice(0, visibleCount);
  const hasMorePhotoBars = visibleCount < photoBars.length;
  const [showTextBars, setShowTextBars] = useState(false);
  const visibleTextBars = showTextBars ? textBars.slice(0, listVisibleCount) : [];
  const hasMoreTextBars = listVisibleCount < textBars.length;

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (countryFilter) activeFilters.push({ label: countryFilter, clear: () => { setCountryFilter(''); setCityFilter(''); } });
  if (cityFilter) activeFilters.push({ label: cityFilter, clear: () => setCityFilter('') });
  if (typeFilter) activeFilters.push({ label: typeFilter, clear: () => setTypeFilter('') });

  const clearAll = useCallback(() => {
    setSearch(''); setCountryFilter(''); setCityFilter(''); setTypeFilter('');
    setVisibleCount(ITEMS_PER_PAGE); setListVisibleCount(LIST_PER_PAGE);
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

          {/* View toggle */}
          <div className="directory-view-toggle">
            <button
              className={`directory-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Grid
            </button>
            <button
              className={`directory-view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              aria-label="Map view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Map
            </button>
          </div>
        </div>

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
            <button className="directory-filter-chip directory-filter-chip--clear" onClick={clearAll}>Clear all</button>
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

      {/* ═══ MAP VIEW ═══ */}
      {viewMode === 'map' && (
        <DirectoryMap bars={filtered} />
      )}

      {/* ═══ GRID VIEW ═══ */}
      {viewMode === 'grid' && (
        <>
          {/* Featured Bars */}
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
                {featuredBars.map(bar => <FeaturedBarCard key={bar.id} bar={bar} />)}
              </div>
            </div>
          )}

          {/* Inline CTA */}
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

          {/* Photo Bars Grid */}
          {visiblePhotoBars.length > 0 && (
            <>
              <div className="directory-grid" ref={gridRef}>
                {visiblePhotoBars.map(bar => <PhotoBarCard key={bar.id} bar={bar} />)}
              </div>
              {hasMorePhotoBars && (
                <div className="directory-load-more">
                  <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>Show More Bars</button>
                </div>
              )}
            </>
          )}

          {/* Text-only bars */}
          {!showTextBars && !hasMorePhotoBars && textBars.length > 0 && (
            <div className="directory-load-more">
              <button onClick={() => setShowTextBars(true)}>Show More Bars</button>
            </div>
          )}

          {showTextBars && visibleTextBars.length > 0 && (
            <div className="directory-list-section">
              <div className="directory-list">
                {visibleTextBars.map(bar => (
                  <Link key={bar.id} href={`/bars/${bar.slug}`} className="directory-list-item">
                    <div className="directory-list-name">{bar.name}</div>
                    <div className="directory-list-location">{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</div>
                    <div className="directory-list-type">{formatBarType(bar.type)}</div>
                    <svg className="directory-list-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              {hasMoreTextBars && (
                <div className="directory-load-more">
                  <button onClick={() => setListVisibleCount(prev => prev + LIST_PER_PAGE)}>Show More Bars</button>
                </div>
              )}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="directory-empty">
              <div className="directory-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 8l6 6M14 8l-6 6" />
                </svg>
              </div>
              <h3>No bars found</h3>
              <p>Try adjusting your search or filters.</p>
              <button onClick={clearAll}>Clear all filters</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Card Components ─── */
function FeaturedBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;
  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-featured-card">
      <div className="bar-dir-featured-visual">
        {imageUrl && <img src={imageUrl} alt={bar.name} loading="lazy" />}
        <div className="bar-dir-featured-overlay" />
        <div className="bar-dir-featured-badge-corner">Featured</div>
        <div className="bar-dir-featured-content">
          <h3>{bar.name}</h3>
          <span className="bar-dir-featured-location">{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</span>
        </div>
      </div>
    </Link>
  );
}

function PhotoBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;
  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-card">
      <div className="bar-dir-card-visual">
        {imageUrl && <img src={imageUrl} alt={bar.name} loading="lazy" />}
      </div>
      <div className="bar-dir-card-body">
        <h3>{bar.name}</h3>
        <div className="bar-dir-card-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span>{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</span>
        </div>
        <span className="bar-dir-type">{formatBarType(bar.type)}</span>
      </div>
    </Link>
  );
}
