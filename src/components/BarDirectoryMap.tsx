'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
const FEATURED_PER_PAGE = 12;
const PHOTO_PER_PAGE = 24;
const LIST_PER_PAGE = 60;

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

/**
 * Sort bars by geo proximity first, then by editorial quality signals.
 * Used within each section independently so geo-sorting applies to all three tiers.
 */
function sortByGeo(bars: Bar[], geoCity = '', geoCountryCode = '', geoContinent = ''): Bar[] {
  return [...bars].sort((a, b) => {
    const aGeo = getGeoScore(a, geoCity, geoCountryCode, geoContinent);
    const bGeo = getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    if (aGeo !== bGeo) return bGeo - aGeo;
    // Within same geo score: 50 Best first, then alphabetical
    const aIs50Best = FIFTY_BEST_2025.has(a.name) ? 1 : 0;
    const bIs50Best = FIFTY_BEST_2025.has(b.name) ? 1 : 0;
    if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Haversine distance in km between two lat/lng pairs.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Hybrid sort: when GPS coords are available, bars WITH lat/lng are sorted by
 * true haversine distance (closest first). Bars WITHOUT lat/lng are sorted by
 * IP-based geo score and appended after. This prevents bars in far-away countries
 * from appearing before nearby bars that simply lack coordinates.
 */
function sortByGPS(
  bars: Bar[],
  userLat: number,
  userLng: number,
  geoCity: string,
  geoCountryCode: string,
  geoContinent: string,
): Bar[] {
  const withCoords = bars.filter(b => b.lat != null && b.lng != null);
  const withoutCoords = bars.filter(b => b.lat == null || b.lng == null);

  // Group A: sort by true distance
  withCoords.sort((a, b) => {
    const distA = haversineKm(userLat, userLng, a.lat!, a.lng!);
    const distB = haversineKm(userLat, userLng, b.lat!, b.lng!);
    if (Math.abs(distA - distB) > 0.5) return distA - distB;
    const fiftyA = FIFTY_BEST_2025.has(a.name) ? 0 : 1;
    const fiftyB = FIFTY_BEST_2025.has(b.name) ? 0 : 1;
    if (fiftyA !== fiftyB) return fiftyA - fiftyB;
    return a.name.localeCompare(b.name);
  });

  // Group B: sort by IP-based geo score (same logic as sortByGeo)
  withoutCoords.sort((a, b) => {
    const aGeo = getGeoScore(a, geoCity, geoCountryCode, geoContinent);
    const bGeo = getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    if (aGeo !== bGeo) return bGeo - aGeo;
    const fiftyA = FIFTY_BEST_2025.has(a.name) ? 0 : 1;
    const fiftyB = FIFTY_BEST_2025.has(b.name) ? 0 : 1;
    if (fiftyA !== fiftyB) return fiftyA - fiftyB;
    return a.name.localeCompare(b.name);
  });

  return [...withCoords, ...withoutCoords];
}

/* ─── Map Component (loaded dynamically) ─── */
// Approximate country center coordinates for map initial view
const COUNTRY_CENTER: Record<string, [number, number, number]> = {
  // [lng, lat, zoom]
  US: [-98.5, 39.5, 3.5], GB: [-2.0, 54.0, 5.0], CA: [-96.0, 60.0, 3.0],
  AU: [134.0, -25.0, 3.5], DE: [10.5, 51.2, 5.0], FR: [2.5, 46.5, 5.0],
  ES: [-3.7, 40.4, 5.0], IT: [12.5, 42.0, 5.0], JP: [138.0, 36.5, 5.0],
  CN: [104.0, 35.0, 3.5], IN: [78.9, 20.6, 4.0], BR: [-51.9, -14.2, 3.5],
  MX: [-102.5, 23.6, 4.5], SG: [103.8, 1.35, 10.5], HK: [114.2, 22.3, 10.0],
  AE: [54.0, 24.0, 7.0], TH: [101.0, 15.0, 5.5], NL: [5.3, 52.1, 6.0],
  PT: [-8.2, 39.4, 6.0], GR: [22.0, 39.0, 6.0], AR: [-63.6, -38.4, 3.5],
  CO: [-74.3, 4.6, 5.5], ZA: [25.0, -29.0, 4.5], NZ: [172.5, -41.0, 5.0],
  SE: [18.6, 60.1, 4.5], NO: [8.5, 60.5, 4.5], DK: [10.0, 56.0, 6.0],
  CH: [8.2, 46.8, 6.5], AT: [14.5, 47.5, 6.5], IE: [-8.0, 53.2, 6.0],
  PL: [19.1, 52.1, 5.5], CZ: [15.5, 49.8, 6.5], KR: [127.8, 36.5, 6.0],
};

function DirectoryMap({ bars, geoCity = '', geoCountryCode = '', userLat = null, userLng = null }: { bars: Bar[]; geoCity?: string; geoCountryCode?: string; userLat?: number | null; userLng?: number | null }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const loadMap = async () => {
      if (!document.querySelector('link[href*="mapbox-gl"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
        document.head.appendChild(link);
      }
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Determine initial map center from visitor's geo location
      const CITY_COORDS_MAP: Record<string, [number, number]> = {
        'new york': [-74.01, 40.71], 'los angeles': [-118.24, 34.05], 'chicago': [-87.63, 41.88],
        'san francisco': [-122.42, 37.77], 'miami': [-80.19, 25.76], 'las vegas': [-115.14, 36.17],
        'seattle': [-122.33, 47.61], 'austin': [-97.74, 30.27], 'boston': [-71.06, 42.36],
        'houston': [-95.37, 29.76], 'atlanta': [-84.39, 33.75], 'new orleans': [-90.07, 29.95],
        'london': [-0.13, 51.51], 'paris': [2.35, 48.86], 'berlin': [13.41, 52.52],
        'barcelona': [2.17, 41.39], 'madrid': [-3.70, 40.42], 'rome': [12.50, 41.90],
        'amsterdam': [4.90, 52.37], 'prague': [14.44, 50.08], 'vienna': [16.37, 48.21],
        'lisbon': [-9.14, 38.72], 'dublin': [-6.26, 53.35], 'budapest': [19.04, 47.50],
        'singapore': [103.82, 1.35], 'hong kong': [114.16, 22.28], 'tokyo': [139.69, 35.68],
        'bangkok': [100.50, 13.75], 'dubai': [55.27, 25.20], 'sydney': [151.21, -33.87],
        'toronto': [-79.38, 43.65], 'mexico city': [-99.13, 19.43],
      };
      const cityKey = geoCity.toLowerCase();
      const cityCoords = CITY_COORDS_MAP[cityKey];
      const countryCenter = geoCountryCode ? COUNTRY_CENTER[geoCountryCode.toUpperCase()] : null;

      // Priority: GPS coordinates > IP city > IP country > world view
      const initialCenter: [number, number] = (userLat != null && userLng != null)
        ? [userLng, userLat]
        : cityCoords
        ? cityCoords
        : countryCenter ? [countryCenter[0], countryCenter[1]] : [15, 30];
      const initialZoom = (userLat != null && userLng != null)
        ? 9
        : cityCoords ? 9 : countryCenter ? countryCenter[2] : 1.5;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false,
        minZoom: 1,
        maxZoom: 18,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
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

        map.addSource('bars', { type: 'geojson', data: geojson, cluster: true, clusterMaxZoom: 12, clusterRadius: 50 });

        map.addLayer({
          id: 'clusters', type: 'circle', source: 'bars', filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], '#c47843', 10, '#b06835', 30, '#9a5a2a'],
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 32, 100, 40],
            'circle-stroke-width': 2, 'circle-stroke-color': 'rgba(244, 237, 228, 0.3)',
          },
        });

        map.addLayer({
          id: 'cluster-count', type: 'symbol', source: 'bars', filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'], 'text-size': 13 },
          paint: { 'text-color': '#f5f0eb' },
        });

        map.addLayer({
          id: 'bar-points-top10', type: 'circle', source: 'bars',
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'tier'], 'top10']],
          paint: { 'circle-radius': 8, 'circle-color': '#C9A84C', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#fff8e1', 'circle-opacity': 1 },
        });

        map.addLayer({
          id: 'bar-points-featured', type: 'circle', source: 'bars',
          filter: ['all', ['!', ['has', 'point_count']], ['in', ['get', 'tier'], ['literal', ['featured', 'premium']]]],
          paint: { 'circle-radius': 7, 'circle-color': '#d4a44a', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#f5f0eb', 'circle-opacity': 1 },
        });

        map.addLayer({
          id: 'bar-points-free', type: 'circle', source: 'bars',
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'tier'], 'free']],
          paint: { 'circle-radius': 5, 'circle-color': '#c47843', 'circle-stroke-width': 1.5, 'circle-stroke-color': 'rgba(244, 237, 228, 0.4)', 'circle-opacity': 0.85 },
        });

        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (!features[0]) return;
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('bars') as mapboxgl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !zoom) return;
            const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
            map.easeTo({ center: coords, zoom });
          });
        });

        const showPopup = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties!;
          const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];
          const isFeatured = props.tier === 'featured' || props.tier === 'premium';
          const isTop10 = props.tier === 'top10';
          const photoHtml = props.photo && props.hasPhoto
            ? `<img src="${props.photo}" alt="${props.name}" style="width:100%;height:120px;object-fit:cover;border-radius:6px 6px 0 0;margin:-12px -12px 8px -12px;width:calc(100% + 24px);" />`
            : '';
          const badgeHtml = isTop10
            ? '<span style="display:inline-block;background:linear-gradient(135deg,#B8973A,#D4B84A);color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;font-weight:700;margin-bottom:4px;letter-spacing:0.5px;">★ TOP 10</span><br/>'
            : isFeatured ? '<span style="display:inline-block;background:#c47843;color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;font-weight:600;margin-bottom:4px;letter-spacing:0.5px;">FEATURED</span><br/>' : '';
          const upgradeHtml = (!isFeatured && !isTop10) ? '<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#c47843;"><a href="/claim-your-bar" style="color:#c47843;text-decoration:none;">★ Upgrade to stand out →</a></div>' : '';
          new mapboxgl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '220px', className: 'bar-map-popup' })
            .setLngLat(coords)
            .setHTML(`<div style="cursor:pointer;" onclick="window.location.href='/bars/${props.slug}'">${photoHtml}${badgeHtml}<strong style="font-size:14px;color:#f5f0eb;">${props.name}</strong><br/><span style="font-size:12px;color:#a09888;">${props.city}, ${props.country}</span><br/><span style="font-size:11px;color:#7a7060;text-transform:uppercase;letter-spacing:0.5px;">${props.type || 'Bar'}</span>${upgradeHtml}</div>`)
            .addTo(map);
        };

        map.on('click', 'bar-points-free', showPopup);
        map.on('click', 'bar-points-featured', showPopup);
        map.on('click', 'bar-points-top10', showPopup);
        map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'bar-points-free', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'bar-points-free', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'bar-points-featured', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'bar-points-featured', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'bar-points-top10', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'bar-points-top10', () => { map.getCanvas().style.cursor = ''; });
        setMapLoaded(true);
      });

      mapRef.current = map;
    };

    loadMap();
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('bars') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: bars.filter(b => b.lat && b.lng).map(bar => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [bar.lng!, bar.lat!] },
        properties: { id: bar.id, name: bar.name, slug: bar.slug, city: bar.city, country: bar.country, type: bar.type, tier: bar.tier, hasPhoto: bar.photos && bar.photos.length > 0 ? 1 : 0, photo: bar.photos?.[0] || '', hasArticle: bar.wp_article_slug ? 1 : 0 },
      })),
    };
    source.setData(geojson);
  }, [bars, mapLoaded]);

  const toggleExpand = () => { setIsExpanded(!isExpanded); setTimeout(() => mapRef.current?.resize(), 100); };

  return (
    <div className={`directory-map-wrapper ${isExpanded ? 'directory-map-expanded' : ''}`}>
      <div ref={mapContainer} className="directory-map" />
      <button className="directory-map-expand" onClick={toggleExpand} aria-label={isExpanded ? 'Collapse map' : 'Expand map'}>
        {isExpanded ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
        )}
      </button>
    </div>
  );
}

/* ─── Section Header Component ─── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SectionHeader({
  icon, label, sublabel, count, accent = false, top10 = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  count?: number;
  accent?: boolean;
  top10?: boolean;
}) {
  return (
    <div className={`dir-section-header ${accent ? 'dir-section-header--accent' : ''} ${top10 ? 'dir-section-header--top10' : ''}`}>
      <div className="dir-section-header-left">
        <span className="dir-section-header-icon">{icon}</span>
        <div>
          <span className="dir-section-header-label">{label}</span>
          {sublabel && <span className="dir-section-header-sublabel">{sublabel}</span>}
        </div>
      </div>
      {count !== undefined && (
        <span className="dir-section-header-count">{count} {count === 1 ? 'bar' : 'bars'}</span>
      )}
    </div>
  );
}

/* ─── Geo Location Label ─── */
function GeoLabel({ geoCity, geoCountryCode }: { geoCity: string; geoCountryCode: string }) {
  if (!geoCity && !geoCountryCode) return null;
  const location = geoCity || geoCountryCode;
  return (
    <div className="dir-geo-label">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      Sorted by proximity to <strong>{location}</strong>
    </div>
  );
}

/* ─── Main Component ─── */
export function BarDirectoryMapClient({
  initialBars,
  totalBars,
  totalCountries,
  totalCities,
  countries,
  cities,
  types,
  geoCity = '',
  geoCountryCode = '',
  geoContinent = '',
}: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Debounce search input — only trigger server fetch after user stops typing for 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // GPS-based sorting state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [gridVisible, setGridVisible] = useState(FEATURED_PER_PAGE);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Legacy pagination state — unused but kept to avoid refactor churn
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_photoVisible] = useState(PHOTO_PER_PAGE);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_listVisible] = useState(LIST_PER_PAGE);

  // Request GPS location on mount for true distance sorting
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => {
        // Permission denied or error — keep using IP-based sorting
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Dedicated lightweight map data — fetched once when map view is first opened
  const [mapBars, setMapBars] = useState<Bar[]>([]);
  const [mapBarsLoaded, setMapBarsLoaded] = useState(false);

  const openMapView = useCallback(async () => {
    setViewMode('map');
    if (mapBarsLoaded) return; // already fetched
    try {
      const res = await fetch('/api/bars/map');
      if (res.ok) {
        const data = await res.json();
        // Convert MapBar shape to Bar shape (fill missing fields with defaults)
        const bars: Bar[] = (data.bars || []).map((b: { id: string; name: string; slug: string; city: string; country: string; type: string; tier: string; lat: number | null; lng: number | null; photo: string | null }) => ({
          ...b,
          region: null, address: null, website: null, instagram: null,
          phone: null, email: null, description: null, short_excerpt: null,
          photos: b.photo ? [b.photo] : [],
          featured_until: null, is_verified: false, is_active: true,
          wp_article_slug: null, created_at: '', updated_at: '',
        }));
        // Apply geo sorting so closest bars appear first on the map too
        const sorted = userLat !== null && userLng !== null
          ? sortByGPS(bars, userLat, userLng, geoCity, geoCountryCode, geoContinent)
          : sortByGeo(bars, geoCity, geoCountryCode, geoContinent);
        setMapBars(sorted);
        setMapBarsLoaded(true);
      }
    } catch (e) {
      console.error('Failed to load map bars', e);
    }
  }, [mapBarsLoaded, geoCity, geoCountryCode, geoContinent, userLat, userLng]);

  // Server-side pagination state
  const [allBars, setAllBars] = useState<Bar[]>(initialBars);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [serverPage, setServerPage] = useState(2);
  const [hasMoreFromServer, setHasMoreFromServer] = useState((totalBars || 0) > initialBars.length);
  const [isFilterFetching, setIsFilterFetching] = useState(false);

  // When a search term or filter is applied, fetch ALL matching bars from the server.
  // This is critical because the initial load only fetches top10/featured/photo bars —
  // free bars without photos are not in the initial payload and would be missed by
  // in-memory search. Fetching from the server ensures all bars are searchable.
  useEffect(() => {
    if (!debouncedSearch && !countryFilter && !cityFilter && !typeFilter) {
      // No filters — reset to initial bars and allow normal pagination
      setAllBars(initialBars);
      setServerPage(2);
      setHasMoreFromServer((totalBars || 0) > initialBars.length);
      return;
    }
    // Fetch all bars matching the current filters from the server
    setIsFilterFetching(true);
    const params = new URLSearchParams({ perPage: '1000' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (countryFilter) params.set('country', countryFilter);
    if (cityFilter) params.set('city', cityFilter);
    if (typeFilter) params.set('type', typeFilter);
    fetch(`/api/bars?${params}`)
      .then(r => r.json())
      .then(data => {
        setAllBars(data.bars || []);
        setHasMoreFromServer(false); // All filtered results are loaded
      })
      .catch(e => console.error('Filter fetch failed:', e))
      .finally(() => setIsFilterFetching(false));
  }, [debouncedSearch, countryFilter, cityFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMoreBarsFromServer = useCallback(async () => {
    if (isFetchingMore || !hasMoreFromServer) return;
    setIsFetchingMore(true);
    try {
      const params = new URLSearchParams({ page: String(serverPage), perPage: '100' });
      const res = await fetch(`/api/bars?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAllBars(prev => {
          const existingIds = new Set(prev.map(b => b.id));
          const newBars = (data.bars as Bar[]).filter(b => !existingIds.has(b.id));
          return [...prev, ...newBars];
        });
        setServerPage(prev => prev + 1);
        if (allBars.length + data.bars.length >= (totalBars || 0)) setHasMoreFromServer(false);
      }
    } catch (e) {
      console.error('Failed to fetch more bars:', e);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMoreFromServer, serverPage, allBars.length, totalBars]);

  const availableCities = useMemo(() => {
    if (!countryFilter) return cities;
    return Array.from(new Set(allBars.filter(b => b.country === countryFilter).map(b => b.city))).sort();
  }, [countryFilter, allBars, cities]);

  const isFiltering = !!(search || countryFilter || cityFilter || typeFilter);

  // Filter bars first
  const filtered = useMemo(() => {
    return allBars.filter(bar => {
      const q = search.toLowerCase();
      const matchSearch = !search || bar.name.toLowerCase().includes(q) || bar.city.toLowerCase().includes(q) || bar.country.toLowerCase().includes(q);
      const matchCountry = !countryFilter || bar.country === countryFilter;
      const matchCity = !cityFilter || bar.city === cityFilter;
      const matchType = !typeFilter || bar.type === typeFilter;
      return matchSearch && matchCountry && matchCity && matchType;
    });
  }, [search, countryFilter, cityFilter, typeFilter, allBars]);

  // ── UNIFIED SORTED GRID ──
  // Sort order:
  //   PRIMARY split: bars WITH photos always before bars WITHOUT photos.
  //   WITHIN each photo group:
  //     When geo is active: proximity-first hybrid score
  //       = proximityScore (0–1000) + tierBonus (featured=200, top10=100, free=0)
  //       Nearby Sydney bars beat far-away Featured bars.
  //     When no geo: strict tier order (Featured → TOP 10 → Free), then alphabetical.
  const allFiltered = useMemo(() => {
    const hasPhoto = (b: Bar) => !!(b.photos && b.photos.length > 0);

    const tierBonus = (b: Bar): number => {
      if (b.wp_article_slug) return 200;         // Featured with article
      if (b.tier === 'top10' || b.tier === 'premium') return 100; // TOP 10
      return 0;                                  // Free
    };

    const hasGeoSignal = !!(geoCity || geoCountryCode);

    const getProximityScore = (b: Bar): number => {
      if (userLat !== null && userLng !== null) {
        const dist = (b.lat != null && b.lng != null)
          ? haversineKm(userLat, userLng, b.lat, b.lng)
          : 99999;
        return Math.max(0, 1000 - Math.round(dist / 20));
      }
      return getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    };

    const sortBars = (bars: Bar[]): Bar[] => {
      if (!hasGeoSignal) {
        // No geo: strict tier order, then alphabetical
        return [...bars].sort((a, b) => {
          const rankA = a.wp_article_slug ? 0 : (a.tier === 'top10' || a.tier === 'premium') ? 1 : 2;
          const rankB = b.wp_article_slug ? 0 : (b.tier === 'top10' || b.tier === 'premium') ? 1 : 2;
          if (rankA !== rankB) return rankA - rankB;
          const aIs50Best = FIFTY_BEST_2025.has(a.name) ? 1 : 0;
          const bIs50Best = FIFTY_BEST_2025.has(b.name) ? 1 : 0;
          if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
          return a.name.localeCompare(b.name);
        });
      }
      // Geo active: proximity + tier hybrid
      return [...bars].sort((a, b) => {
        const totalA = getProximityScore(a) + tierBonus(a);
        const totalB = getProximityScore(b) + tierBonus(b);
        if (totalA !== totalB) return totalB - totalA;
        const aIs50Best = FIFTY_BEST_2025.has(a.name) ? 1 : 0;
        const bIs50Best = FIFTY_BEST_2025.has(b.name) ? 1 : 0;
        if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
        return a.name.localeCompare(b.name);
      });
    };

    // Split into two groups: with photo and without photo
    const withPhoto = filtered.filter(b => hasPhoto(b));
    const withoutPhoto = filtered.filter(b => !hasPhoto(b));

    // Sort each group independently, then concatenate: photos first
    return [...sortBars(withPhoto), ...sortBars(withoutPhoto)];
  }, [filtered, geoCity, geoCountryCode, geoContinent, userLat, userLng]);

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (countryFilter) activeFilters.push({ label: countryFilter, clear: () => { setCountryFilter(''); setCityFilter(''); } });
  if (cityFilter) activeFilters.push({ label: cityFilter, clear: () => setCityFilter('') });
  if (typeFilter) activeFilters.push({ label: typeFilter, clear: () => setTypeFilter('') });

  const clearAll = useCallback(() => {
    setSearch(''); setCountryFilter(''); setCityFilter(''); setTypeFilter('');
    setGridVisible(FEATURED_PER_PAGE);
  }, []);

  const resetPagination = () => {
    setGridVisible(FEATURED_PER_PAGE);
  };

  const hasGeo = !!(geoCity || geoCountryCode);

  return (
    <div className="directory-page">
      {/* ── Hero ── */}
      <div className="directory-hero">
        <div className="directory-hero-inner">
          <div className="directory-hero-badge">Global Bar Directory</div>
          <span className="directory-hero-divider" aria-hidden="true" />
          <h1>Discover the World&apos;s<br /> Best Bars</h1>
          {(totalBars || totalCountries || totalCities) && (
            <div className="directory-hero-stats">
              {totalBars && (
                <div className="directory-hero-stat" onClick={() => { setCountryFilter(''); setCityFilter(''); setSearch(''); }}>
                  <span className="directory-hero-stat-count">{totalBars.toLocaleString()}+</span>
                  <span className="directory-hero-stat-label">Bars</span>
                </div>
              )}
              {totalCountries && (
                <div className="directory-hero-stat">
                  <span className="directory-hero-stat-count">{totalCountries}</span>
                  <span className="directory-hero-stat-label">Countries</span>
                </div>
              )}
              {totalCities && (
                <div className="directory-hero-stat">
                  <span className="directory-hero-stat-count">{totalCities}</span>
                  <span className="directory-hero-stat-label">Cities</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="directory-filters">
        <div className="directory-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search bars, cities, countries..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPagination(); }}
          />
          {search && (
            <button className="directory-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="directory-filter-row">
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setCityFilter(''); resetPagination(); }}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); resetPagination(); }}>
            <option value="">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); resetPagination(); }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="directory-view-toggle">
            <button className={`directory-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Grid
            </button>
            <button className={`directory-view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={openMapView} aria-label="Map view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            ))}
            <button className="directory-filter-chip directory-filter-chip--clear" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </div>

      {/* ── Results count + geo label ── */}
      <div className="directory-results-bar">
        <span className="directory-count">
          {isFilterFetching
            ? 'Loading…'
            : isFiltering
            ? `${allFiltered.length} ${allFiltered.length === 1 ? 'bar' : 'bars'} found`
            : `${totalBars || allFiltered.length} bars worldwide`}
        </span>
        {!isFiltering && (hasGeo || (userLat !== null && userLng !== null)) && (
          userLat !== null && userLng !== null
            ? <div className="dir-geo-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Sorted by distance from your location
              </div>
            : <GeoLabel geoCity={geoCity} geoCountryCode={geoCountryCode} />
        )}
      </div>

      {/* ═══ MAP VIEW ═══ */}
      {viewMode === 'map' && <DirectoryMap bars={mapBarsLoaded ? mapBars : allFiltered} geoCity={geoCity} geoCountryCode={geoCountryCode} userLat={userLat} userLng={userLng} />}

      {/* ═══ GRID VIEW ═══ */}
      {viewMode === 'grid' && (
        <>
          {isFilterFetching ? (
            <div className="directory-empty">
              <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '3rem 0' }}>Loading bars…</p>
            </div>
          ) : allFiltered.length === 0 ? (
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
          ) : (
            <div className="dir-section">
              {/* ══ UNIFIED GRID: all bars, same card design, sorted by tier then proximity ══ */}
              <div className="directory-featured-grid">
                {allFiltered.slice(0, gridVisible).map(bar => (
                  <FeaturedBarCard key={bar.id} bar={bar} />
                ))}
              </div>

              {/* Inline CTA after first page of results */}
              {!isFiltering && gridVisible >= FEATURED_PER_PAGE && (
                <div className="directory-inline-cta">
                  <div className="directory-inline-cta-inner">
                    <div className="directory-inline-cta-text">
                      <h3>Get featured in BarMagazine</h3>
                      <p>From a free listing to a full feature article — get your bar in front of the world&apos;s bar professionals.</p>
                    </div>
                    <Link href="/claim-your-bar" className="directory-inline-cta-btn">
                      List Your Bar
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              )}

              {/* Load more */}
              {(gridVisible < allFiltered.length || hasMoreFromServer) && (
                <div className="directory-load-more">
                  <button
                    onClick={() => {
                      setGridVisible(prev => prev + PHOTO_PER_PAGE);
                      if (gridVisible + PHOTO_PER_PAGE >= allFiltered.length && hasMoreFromServer) {
                        fetchMoreBarsFromServer();
                      }
                    }}
                    disabled={isFetchingMore}
                  >
                    {isFetchingMore ? 'Loading…' : 'Show More Bars'}
                    {!isFetchingMore && allFiltered.length - gridVisible > 0 && (
                      <span className="directory-load-more-count">{allFiltered.length - gridVisible} more</span>
                    )}
                  </button>
                </div>
              )}
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
  const isPremium = bar.tier === 'premium';
  const isTop10 = bar.tier === 'top10';
  return (
    <Link href={`/bars/${bar.slug}`} className={`bar-dir-featured-card ${isPremium ? 'bar-dir-featured-card--premium' : ''}`}>
      <div className="bar-dir-featured-visual">
        {imageUrl
          ? <img src={imageUrl} alt={bar.name} loading="lazy" />
          : (
            <div className="bar-dir-featured-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{bar.name.slice(0, 2).toUpperCase()}</span>
            </div>
          )
        }
        <div className="bar-dir-featured-overlay" />
        {isTop10 && (
          <div className="bar-dir-top10-badge-corner">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            TOP 10
          </div>
        )}
        {(isPremium || bar.wp_article_slug) && (
          <div className={`bar-dir-featured-badge-corner ${isPremium ? 'bar-dir-featured-badge-corner--premium' : ''}`}>
            {isPremium ? '★ Premium' : 'Featured'}
          </div>
        )}
        <div className="bar-dir-featured-content">
          <h3>{bar.name}</h3>
          <span className="bar-dir-featured-location">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}
          </span>
          {bar.type && (
            <span className="bar-dir-featured-type">{formatBarType(bar.type)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PhotoBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;
  const is50Best = FIFTY_BEST_2025.has(bar.name);
  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-card">
      <div className="bar-dir-card-visual">
        {imageUrl
          ? <img src={imageUrl} alt={bar.name} loading="lazy" />
          : (
            <div className="bar-dir-card-placeholder">
              <svg className="bar-dir-card-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="bar-dir-card-initials">{bar.name.slice(0, 2).toUpperCase()}</span>
            </div>
          )
        }
        {is50Best && <span className="bar-dir-50best-badge">50 Best</span>}
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
