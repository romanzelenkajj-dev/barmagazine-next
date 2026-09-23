'use client';

import { matchesAllWords } from '@/lib/search-rank';
import { metroCityOf, searchTermsOf } from '@/lib/metro-rollup';
import { displayType } from '@/lib/bar-type';
import { hasFiftyBest, renderableAccolades } from '@/lib/accolades';
import { CardStatusPills } from '@/components/CardStatusPills';
import { statusPill } from '@/lib/bar-status';
import { meritBand } from '@/lib/city-levels';
import { BarPlaceholder } from '@/components/BarPlaceholder';
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Bar } from '@/lib/supabase';
import { getGeoScore } from '@/lib/geo';
import { isCityCentre } from '@/lib/geocode';
import { NEAR_BANDS_KM, nearBand, compareBandAndPrecision } from '@/lib/near-order';
import { formatBarType } from '@/lib/utils';
import { placeLine } from '@/lib/city-location';
import { BarDirectorySidebar, BarDirectorySidebarPromo } from './BarDirectorySidebar';
import { BarSearchTypeahead } from './BarSearchTypeahead';

interface Props {
  initialBars: Bar[];
  totalBars?: number;
  totalCountries?: number;
  totalCities?: number;
  countries: string[];
  /** Every metro, for the "All cities" escape. */
  cities: string[];
  /** Metros with at least MIN_DROPDOWN_CITY_BARS bars: the default list. */
  commonCities?: string[];
  types: string[];
  geoCity?: string;
  geoCountryCode?: string;
  geoContinent?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const FEATURED_PER_PAGE = 12;
/**
 * Near-me distance bands, in km. Quality competes ONLY between bars that are
 * realistically equally reachable; between bands, closer always wins.
 *
 * WHY BANDS AND NOT ONE RADIUS. This was a single 80 km boundary with tier,
 * then photo, then distance inside it. Roman, looking at it from Carlsbad:
 * "if somebody is looking for the best bars near them, they don't want to
 * drive 50 miles to get to the bar." He is right. Under one 80 km band a
 * featured bar 35 miles away outranked a good one two miles away on tier
 * alone, which is not near me in any useful sense.
 *
 * The boundaries are chosen by how you would actually get there rather than
 * by round numbers: 5 km is walking or a short hop, 5 to 15 km is a normal
 * ride across a city, 15 to 40 km is a deliberate trip out. Past 40 km
 * nothing is "near", so quality stops competing entirely and it is pure
 * distance, which is what the old code did past 80.
 */
// NEAR_BANDS_KM, nearBand and the measurable-before-approximate rule now live
// in lib/near-order.ts so the ordering can be tested without a browser. Both
// edge cases Roman asked about are absent from the live data and could only be
// pinned in a test.
//
// NEAR_LIMIT_KM used to live here as the banner's own threshold. It is gone on
// purpose: the banner is now derived from whether any card can show a distance,
// so there is no second number to drift away from the first.

/**
 * A distance as the visitor's own locale would write it. Miles for the places
 * that use them for road distance, kilometres everywhere else. One decimal
 * while the number is small, none once it is not.
 */
/**
 * The places that use miles for road distance. GB genuinely does.
 */
const IMPERIAL_COUNTRIES = new Set(['US', 'GB', 'LR', 'MM']);

/** The region subtag of the browser's language, or '' when there is none. */
function regionFromLanguage(): string {
  if (typeof navigator === 'undefined') return '';
  return (navigator.language || '').split('-')[1] || '';
}

/**
 * A distance in the unit the visitor's COUNTRY uses.
 *
 * WHY NOT navigator.language. It is a language preference, not a location. A
 * Slovak bartender with their browser in US English, which is common, was
 * getting miles while standing in Bratislava. The old code also defaulted to
 * 'en-US' when navigator was absent, so anything server-side resolved to
 * miles, and a browser reporting plain 'en' or 'de' with no region subtag
 * produced an empty region and fell through to kilometres by accident rather
 * than by design.
 *
 * `geoCountryCode` is the visitor's country from their IP, which the near-me
 * feature already sorts on, so the unit now comes from the same signal as the
 * ordering. Language is only a fallback, and kilometres is the default,
 * because most of the world uses them.
 */
/**
 * One decision for both the unit and the threshold below, so they cannot
 * disagree about who the visitor is.
 */
function usesImperial(countryCode?: string): boolean {
  const region = String(countryCode || regionFromLanguage() || '').toUpperCase();
  return IMPERIAL_COUNTRIES.has(region);
}

/**
 * Whether a distance is worth printing on a card.
 *
 * WHY NOT ALWAYS. In Bratislava the number is useful: a card reading 2.1 km is
 * something a visitor can act on. In Carlsbad the nearest bars are 21 miles
 * out and a wall of cards reading 800 mi makes the directory look empty, which
 * is a statement about our coverage rather than about the bar. Roman: "maybe
 * we just keep it without the distance for now. But then again, in some cities
 * like Bratislava, it might work." Both halves are right, so the card shows it
 * only when it means something and the banner says it once when it does not.
 *
 * THIRTY IN THE VISITOR'S OWN UNIT, not one converted into the other: 30 miles
 * for a visitor on miles, 30 km for a visitor on kilometres. A converted
 * threshold would put an odd 48 in front of somebody. It also gives US
 * visitors a slightly wider net, which matches how much further they drive.
 *
 * Nothing has to be switched on later: as cities fill in, distances start
 * appearing on their own.
 */
const CARD_DISTANCE_LIMIT = 30;

function showsDistanceOnCard(km: number, countryCode?: string): boolean {
  if (!Number.isFinite(km)) return false;
  const value = usesImperial(countryCode) ? km * 0.621371 : km;
  return value < CARD_DISTANCE_LIMIT;
}

function formatDistance(km: number, countryCode?: string): string {
  if (usesImperial(countryCode)) {
    const mi = km * 0.621371;
    return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
  }
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}
/**
 * The value of the city dropdown's escape option. Not a city, and never sent
 * to the server: onChange intercepts it and expands the list instead.
 * Prefixed so it cannot collide with a real city name.
 */
/** The row shape /api/bars/map returns. Kept local so this file does not
    import a route module. */
type MapBarPayload = {
  id: string; name: string; slug: string; city: string; country: string;
  state?: string | null; type: string; tier: string;
  lat: number | null; lng: number | null; photo: string | null;
  subtypes?: string[] | null; accolades?: unknown;
};

/**
 * The best renderable accolade's score, 0 when a bar holds none.
 *
 * Mirrors bestAccolade() in seo-cities.ts, which is private to that module
 * and pulls the Supabase client in with it, so it cannot be imported into a
 * client component. Only the score is needed here; the award wording is not.
 */
function bestScore(bar: { accolades?: unknown }): number {
  const entries = renderableAccolades(bar.accolades);
  if (entries.length === 0) return 0;
  let top = 0;
  for (let i = 0; i < entries.length; i += 1) {
    const s = entries[i].score ?? 0;
    if (s > top) top = s;
  }
  return top;
}

const SHOW_ALL_CITIES = '__show_all_cities__';

const PHOTO_PER_PAGE = 24;
const LIST_PER_PAGE = 60;

// The 50 Best test reads the stored accolades, never a hardcoded name list.
// A name list and the card badge disagreed: the badge renders from
// hasFiftyBest(bar.accolades), so a bar whose name was spelled differently, or
// which entered from a regional 50 Best list, showed the badge and did not
// sort as one. hasFiftyBest covers w50b, a50b, e50b and na50b.

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
    const aIs50Best = hasFiftyBest(a.accolades) ? 1 : 0;
    const bIs50Best = hasFiftyBest(b.accolades) ? 1 : 0;
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
 * Bounds containing the visitor and their nearest bars, for the map's GPS
 * view. A fixed zoom 9 (~40km across) showed an empty map to anyone whose
 * nearest bars sit farther out — Roman: grid right, map blank. Bars within
 * the near-me radius when there are enough of them, otherwise the closest
 * five wherever they are: the map's first job here is to show SOME bars.
 */
function nearestBarsBounds(
  lat: number,
  lng: number,
  bars: Bar[]
): [[number, number], [number, number]] | null {
  const withCoords = bars
    .filter(b => b.lat != null && b.lng != null)
    .map(b => ({ lat: b.lat!, lng: b.lng!, d: haversineKm(lat, lng, b.lat!, b.lng!) }))
    .sort((a, b) => a.d - b.d);
  if (withCoords.length === 0) return null;
  // The nearest three guarantee visible pins; everything inside the near-me
  // radius rides along. Never "nearest N" alone — in a sparse region that
  // can stretch the bounds across an ocean just to reach pin number five.
  const within = withCoords.filter(p => p.d <= 80);
  const chosen = Array.from(new Set([...withCoords.slice(0, 3), ...within]));
  const lats = [lat, ...chosen.map(p => p.lat)];
  const lngs = [lng, ...chosen.map(p => p.lng)];
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
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
    const fiftyA = hasFiftyBest(a.accolades) ? 0 : 1;
    const fiftyB = hasFiftyBest(b.accolades) ? 0 : 1;
    if (fiftyA !== fiftyB) return fiftyA - fiftyB;
    return a.name.localeCompare(b.name);
  });

  // Group B: sort by IP-based geo score (same logic as sortByGeo)
  withoutCoords.sort((a, b) => {
    const aGeo = getGeoScore(a, geoCity, geoCountryCode, geoContinent);
    const bGeo = getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    if (aGeo !== bGeo) return bGeo - aGeo;
    const fiftyA = hasFiftyBest(a.accolades) ? 0 : 1;
    const fiftyB = hasFiftyBest(b.accolades) ? 0 : 1;
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
  HR: [15.2, 45.1, 6.5], RS: [21.0, 44.0, 6.0], SI: [14.8, 46.1, 7.0],
  RO: [25.0, 45.9, 5.5], HU: [19.0, 47.2, 6.5], SK: [19.4, 48.7, 7.0],
  UA: [31.2, 48.4, 5.0], TR: [35.2, 39.0, 5.0], IL: [34.9, 31.5, 7.0],
  SA: [45.1, 23.9, 5.0], EG: [30.8, 26.8, 5.5], NG: [8.7, 9.1, 5.0],
  KE: [37.9, 0.0, 6.0], MA: [-7.1, 31.8, 5.5], PE: [-75.0, -9.2, 5.0],
  CL: [-71.5, -35.7, 4.5], VE: [-66.6, 6.4, 5.5], PH: [122.0, 12.9, 5.5],
  MY: [109.7, 4.2, 5.5], ID: [113.9, -0.8, 4.5], VN: [106.0, 16.2, 5.0],
  TW: [120.9, 23.7, 7.0], PK: [69.3, 30.4, 5.0], BD: [90.4, 23.7, 7.0],
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'US', 'usa': 'US', 'united kingdom': 'GB', 'uk': 'GB', 'canada': 'CA',
  'australia': 'AU', 'germany': 'DE', 'france': 'FR', 'spain': 'ES', 'italy': 'IT',
  'japan': 'JP', 'china': 'CN', 'india': 'IN', 'brazil': 'BR', 'mexico': 'MX',
  'singapore': 'SG', 'hong kong': 'HK', 'uae': 'AE', 'united arab emirates': 'AE',
  'thailand': 'TH', 'netherlands': 'NL', 'portugal': 'PT', 'greece': 'GR',
  'argentina': 'AR', 'colombia': 'CO', 'south africa': 'ZA', 'new zealand': 'NZ',
  'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK', 'switzerland': 'CH', 'austria': 'AT',
  'ireland': 'IE', 'poland': 'PL', 'czech republic': 'CZ', 'czechia': 'CZ', 'south korea': 'KR',
  'croatia': 'HR', 'serbia': 'RS', 'slovenia': 'SI', 'romania': 'RO', 'hungary': 'HU',
  'slovakia': 'SK', 'ukraine': 'UA', 'turkey': 'TR', 'israel': 'IL', 'saudi arabia': 'SA',
  'egypt': 'EG', 'nigeria': 'NG', 'kenya': 'KE', 'morocco': 'MA', 'peru': 'PE',
  'chile': 'CL', 'venezuela': 'VE', 'philippines': 'PH', 'malaysia': 'MY',
  'indonesia': 'ID', 'vietnam': 'VN', 'taiwan': 'TW', 'pakistan': 'PK', 'bangladesh': 'BD',
};

function DirectoryMap({ bars, geoCity = '', geoCountryCode = '', userLat = null, userLng = null, countryFilter = '', cityFilter = '' }: { bars: Bar[]; geoCity?: string; geoCountryCode?: string; userLat?: number | null; userLng?: number | null; countryFilter?: string; cityFilter?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isInitialBarsRender = useRef(true);
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

      // Priority: active city filter > active country filter > user GPS > IP city > IP country
      // > bars-bounding-box (only useful when bars are a tight subset, e.g. country filter applied)
      // > world view.
      // NOTE: bars-bounding-box must NOT take priority over GPS / IP, otherwise the
      // global "all bars" set yields a degenerate midpoint (~lng 15, lat 10 — Africa).
      const hasLocationFilter = !!(cityFilter || countryFilter);
      const activeCityKey = cityFilter.toLowerCase();
      const activeCityCoords = CITY_COORDS_MAP[activeCityKey];
      const activeCountryCode = countryFilter ? COUNTRY_NAME_TO_CODE[countryFilter.toLowerCase()] : null;
      const activeCountryCenter = activeCountryCode ? COUNTRY_CENTER[activeCountryCode] : null;
      const barsWithCoords = bars.filter(b => b.lat && b.lng);
      let barsCenter: [number, number] | null = null;
      let barsZoom = 9;
      if (barsWithCoords.length === 1) {
        barsCenter = [barsWithCoords[0].lng!, barsWithCoords[0].lat!];
        barsZoom = 13;
      } else if (barsWithCoords.length > 1) {
        const lngs = barsWithCoords.map(b => b.lng!);
        const lats = barsWithCoords.map(b => b.lat!);
        barsCenter = [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
        barsZoom = 9;
      }
      // WHEN A LOCATION FILTER IS ACTIVE, THE FILTERED BARS ARE THE ANSWER.
      //
      // `bars` is already the filtered set, so its bounding box IS the city or
      // country the visitor asked for. It outranks GPS and IP, which say where
      // the visitor is rather than where they asked to look, and unlike
      // CITY_COORDS_MAP it needs no table to be kept up to date.
      //
      // That table holds 32 cities. 66 of the 98 cities with three or more
      // bars are missing from it, so picking Macau, Bratislava, Munich,
      // Copenhagen or Melbourne and then opening the map put the visitor on
      // their OWN city instead: a Londoner filtering to Macau got London. The
      // table stays as a fallback and is deliberately NOT extended by hand.
      const filterCenter = hasLocationFilter ? barsCenter : null;
      const initialCenter: [number, number] = filterCenter
        ? filterCenter
        : activeCityCoords ? activeCityCoords
        : activeCountryCenter ? [activeCountryCenter[0], activeCountryCenter[1]]
        : (userLat != null && userLng != null) ? [userLng, userLat]
        : cityCoords ? cityCoords
        : countryCenter ? [countryCenter[0], countryCenter[1]]
        : barsCenter ? barsCenter
        : [-98.5, 39.5];
      const initialZoom = filterCenter
        ? barsZoom
        : activeCityCoords ? 11
        : activeCountryCenter ? activeCountryCenter[2]
        : (userLat != null && userLng != null) ? 9
        : cityCoords ? 9
        : countryCenter ? countryCenter[2]
        : barsCenter ? barsZoom
        : 3.5;

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

      // GPS known before the map was created: swap the fixed metro zoom for a
      // view that provably contains the nearest bars (filters keep priority).
      if (userLat != null && userLng != null && !activeCityCoords && !activeCountryCenter) {
        const nearBounds = nearestBarsBounds(userLat, userLng, bars);
        if (nearBounds) map.fitBounds(nearBounds, { padding: 70, maxZoom: 12, duration: 0 });
      }

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
                city: bar.city, country: bar.country, type: displayType(bar),
                tier: bar.tier, hasPhoto: bar.photos && bar.photos.length > 0 ? 1 : 0,
                photo: bar.photos?.[0] || '', hasArticle: bar.wp_article_slug ? 1 : 0,
              },
            })),
        };

        map.addSource('bars', { type: 'geojson', data: geojson, cluster: true, clusterMaxZoom: 12, clusterRadius: 50 });

        map.addLayer({
          id: 'clusters', type: 'circle', source: 'bars', filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], '#7B1E1E', 10, '#651818', 30, '#4F1313'],
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
          paint: { 'circle-radius': 5, 'circle-color': '#7B1E1E', 'circle-stroke-width': 1.5, 'circle-stroke-color': 'rgba(244, 237, 228, 0.4)', 'circle-opacity': 0.85 },
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
            : isFeatured ? '<span style="display:inline-block;background:#7B1E1E;color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;font-weight:600;margin-bottom:4px;letter-spacing:0.5px;">FEATURED</span><br/>' : '';
          // The paid-listing conversion link, shown to owners who find their
          // own venue. It used --accent (#7B1E1E) as TEXT on this near-black
          // card: 1.48:1, effectively invisible — the monetisation prompt was
          // unreadable at the moment of highest intent. The accent stays
          // correct as a FILL (markers, the FEATURED badge above), so this is
          // scoped to the popup rather than changing the token. Brass reads
          // as the site's accent-on-dark and clears AA at 6.77:1.
          const upgradeHtml = (!isFeatured && !isTop10) ? '<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);font-size:11px;"><a class="bar-map-popup-upgrade" href="/feature-your-bar">★ Upgrade to stand out →</a></div>' : '';
          new mapboxgl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '220px', className: 'bar-map-popup' })
            .setLngLat(coords)
            .setHTML(`<div style="cursor:pointer;" onclick="window.location.href='/bars/${props.slug}'">${photoHtml}${badgeHtml}<strong style="font-size:14px;color:#f5f0eb;">${props.name}</strong><br/><span style="font-size:12px;color:#a09888;">${props.city}, ${props.country}</span><br/><span style="font-size:11px;color:#9a9182;text-transform:uppercase;letter-spacing:0.6px;">${props.type || 'Bar'}</span>${upgradeHtml}</div>`)
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
    const validBars = bars.filter(b => b.lat && b.lng);
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validBars.map(bar => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [bar.lng!, bar.lat!] },
        properties: { id: bar.id, name: bar.name, slug: bar.slug, city: bar.city, country: bar.country, type: displayType(bar), tier: bar.tier, hasPhoto: bar.photos && bar.photos.length > 0 ? 1 : 0, photo: bar.photos?.[0] || '', hasArticle: bar.wp_article_slug ? 1 : 0 },
      })),
    };
    source.setData(geojson);

    // Fit the map to the filtered set of bars whenever filters change.
    //
    // THE FIRST RUN IS SKIPPED ONLY WHEN THERE IS NOTHING TO FIT TO.
    //
    // It used to be skipped unconditionally, to respect the IP/GPS centre the
    // map was created with. But when a city filter is ALREADY active as the
    // map mounts, that skipped run is the one that should have zoomed to the
    // city, and if /api/bars/map resolves before the map's 'load' event there
    // is no later run to do it. The map then sat over Europe while the list
    // under it showed five bars in Macau. Switching to Map first appeared to
    // work only because the later filter change triggered a fresh run.
    //
    // The initial centre knows about a city filter only through
    // CITY_COORDS_MAP, which holds 32 cities; 66 of the 98 cities with three
    // or more bars are missing from it, so this was most of the dropdown
    // rather than one awkward city. That table stays as a fallback and is NOT
    // extended by hand: fitting to the bars we actually hold needs no table.
    const hasLocationFilter = !!(cityFilter || countryFilter);
    const firstRun = isInitialBarsRender.current;
    if (firstRun) {
      isInitialBarsRender.current = false;
      // No location filter: the IP/GPS start is correct, leave it alone.
      if (!hasLocationFilter) return;
    }
    // Only a LOCATION filter justifies moving the map. A type filter narrows
    // the set without saying anything about where the visitor wants to look.
    if (!hasLocationFilter) return;
    // On the first run the map is still showing its initial centre and the
    // visitor has not seen it, so move instantly. Flying across the globe
    // from a centre they never asked for is animation for its own sake.
    const duration = firstRun ? 0 : 1200;
    if (validBars.length === 0) {
      // No bars with coordinates — try to fly to the filtered country center
      if (countryFilter) {
        const code = COUNTRY_NAME_TO_CODE[countryFilter.toLowerCase()];
        const center = code ? COUNTRY_CENTER[code] : null;
        if (center) {
          mapRef.current.flyTo({ center: [center[0], center[1]], zoom: center[2], duration, essential: true });
        }
      }
      return;
    }
    if (validBars.length === 1) {
      mapRef.current.flyTo({
        center: [validBars[0].lng!, validBars[0].lat!],
        zoom: 14,
        duration,
        essential: true,
      });
      return;
    }
    // Without a location filter the global set spans the world and fitBounds
    // would zoom out to a centroid near (lng 0, lat ~8). Guarded above.
    const lngs = validBars.map(b => b.lng!);
    const lats = validBars.map(b => b.lat!);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    mapRef.current.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 60, maxZoom: 14, duration, essential: true }
    );
  }, [bars, mapLoaded, cityFilter, countryFilter]);

  // If GPS resolves AFTER the map is created and no filter is active, fly to the user.
  // Without this, a user who opens Map before geolocation resolves stays on the IP/default
  // center even after granting location.
  const didFlyToGPS = useRef(false);
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (didFlyToGPS.current) return;
    if (userLat == null || userLng == null) return;
    if (cityFilter || countryFilter) return;
    didFlyToGPS.current = true;
    const nearBounds = nearestBarsBounds(userLat, userLng, bars);
    if (nearBounds) {
      mapRef.current.fitBounds(nearBounds, { padding: 70, maxZoom: 12, duration: 1200, essential: true });
    } else {
      mapRef.current.flyTo({ center: [userLng, userLat], zoom: 9, duration: 1200, essential: true });
    }
    // didFlyToGPS makes this a one-shot, so `bars` staying out of the deps
    // only affects which snapshot the single fit uses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLng, mapLoaded, cityFilter, countryFilter]);

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
  commonCities,
  types,
  geoCity = '',
  geoCountryCode = '',
  geoContinent = '',
}: Props) {
  const [search, setSearch] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Debounce search input — only trigger server fetch after user stops typing for 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Arrived via "Find bars near me" (?near=me): sort by nothing but
  // distance. Read from location.search in an effect rather than
  // useSearchParams() so the page's prerender is untouched.
  const [nearMode, setNearMode] = useState(false);
  useEffect(() => {
    setNearMode(new URLSearchParams(window.location.search).has('near'));
  }, []);

  // Once the visitor names a place, near-me mode stops deciding the order.
  // MODE D runs BEFORE the MODE A location branch, so without this a visitor
  // who arrived from "Find bars near me" and then filtered to a city kept
  // proximity ordering, and beyond the 80 km radius MODE D sorts on raw
  // distance alone. Filtering to Bratislava from Carlsbad therefore returned
  // the city in arbitrary distance order with photo, accolade and tier all
  // ignored, burying Mirror Bar below three photo-less bars.
  //
  // `near` is dropped from the URL at the same time so a refresh cannot
  // resurrect it. Written as an effect rather than in each setter because the
  // filters are set from several places (dropdowns, chips, the typeahead) and
  // one of them would eventually be missed.
  useEffect(() => {
    if (!nearMode) return;
    if (!(cityFilter || countryFilter || debouncedSearch.trim())) return;
    setNearMode(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has('near')) {
      url.searchParams.delete('near');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [nearMode, cityFilter, countryFilter, debouncedSearch]);

  /**
   * Every active bar with coordinates, fetched once and shared by the map and
   * by near-me.
   *
   * WHY NEAR-ME NEEDS IT (task 87). `initialBars` is 226 rows: the top 200 of
   * 230 top10, both featured bars, and 24 of the 110 free-with-photo bars,
   * chosen globally with no reference to the visitor. Sorting THAT by distance
   * returns the nearest bars in a global sample, not the nearest bars we list.
   * From Bratislava it gave one local bar and then Prague and Italy, while
   * Mirror Bar, 500m away with three accolades, was not in the payload at all
   * because it lost a 24-slot lottery against 110 candidates.
   *
   * Raising the 24 would make that rarer and leave the bug. Near-me has to see
   * every bar with coordinates or it is guessing.
   */
  const toBar = useCallback((b: MapBarPayload): Bar => ({
    ...b,
    // The route types tier as a plain string; Bar narrows it to the four
    // known values. The column is constrained in the database, so this is a
    // widening the type system cannot see rather than an assumption.
    tier: b.tier as Bar['tier'],
    state: b.state ?? null,
    region: null, address: null, website: null, instagram: null,
    phone: null, email: null, description: null, short_excerpt: null, subtypes: b.subtypes ?? null,
    photos: b.photo ? [b.photo] : [],
    accolades: (b.accolades ?? null) as Bar['accolades'],
    featured_until: null, is_verified: false, is_active: true,
    wp_article_slug: null, created_at: '', updated_at: '',
    // The remaining Bar fields the card never reads on the directory grid.
    // Spelled out rather than cast, so adding a required column to Bar breaks
    // the build here instead of shipping an undefined at runtime.
    photo_credit: null, opening_hours: null, menu_url: null,
    menu_highlights: null, menu_sections: null, reservation_url: null,
    whatsapp: null, owner_id: null, claimed_at: null,
  }), []);

  /**
   * Near-me fetches the whole directory the first time it is switched on.
   *
   * LAZY ON PURPOSE. This is ~478 KB of JSON, about 30 KB over the wire once
   * gzipped, and most visitors never press the button. It fires on the press,
   * not on page load, so a phone that only browses pays nothing. The endpoint
   * is cached 10 minutes at the edge and shared with the map view, so a
   * visitor who uses both pays once.
   */
  const [nearBars, setNearBars] = useState<Bar[] | null>(null);
  // A REF, NOT STATE, for the in-flight flag. As state it belongs in the
  // effect's dependency array, and then setting it re-runs the effect, whose
  // cleanup cancels the fetch that set it. The request completes and its
  // result is thrown away, so near-me silently keeps the 226-row sample.
  const nearFetchStarted = useRef(false);

  useEffect(() => {
    if (!nearMode || nearFetchStarted.current) return;
    nearFetchStarted.current = true;
    fetch('/api/bars/map')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data) setNearBars((data.bars || []).map(toBar)); })
      .catch(e => {
        // Leave the sample in place and let the visitor retry by toggling.
        nearFetchStarted.current = false;
        console.error('near-me: failed to load the directory', e);
      });
  }, [nearMode, toBar]);

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
        const bars: Bar[] = (data.bars || []).map(toBar);
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
  }, [mapBarsLoaded, geoCity, geoCountryCode, geoContinent, userLat, userLng, toBar]);

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

  /**
   * The city dropdown.
   *
   * Two shortenings, and they do different jobs. Metros only, so an area like
   * Beverly Hills no longer takes a line of its own: that took 217 to 207.
   * Then only metros carrying at least MIN_DROPDOWN_CITY_BARS bars, which
   * takes it to 91 and is the change that actually makes the menu usable.
   *
   * NOTHING IS HIDDEN. Choosing "All cities" expands to every metro, and the
   * currently selected city is always listed even when it is below the
   * threshold, so a filter set from a link or from All cities never shows a
   * dropdown that disagrees with the list under it.
   */
  const availableCities = useMemo(() => {
    const inCountry = countryFilter
      ? Array.from(new Set(allBars.filter(b => b.country === countryFilter).map(b => metroCityOf(b)))).sort()
      : null;
    // A country filter is already a short list, so the threshold does not
    // apply on top of it; picking France should show all of France.
    if (inCountry) return inCountry;
    if (showAllCities || !commonCities || commonCities.length === 0) {
      return Array.from(new Set(cities)).sort();
    }
    const short = commonCities.slice();
    if (cityFilter && !short.includes(cityFilter)) short.push(cityFilter);
    return short.sort();
  }, [countryFilter, allBars, cities, commonCities, showAllCities, cityFilter]);

  /** True when the escape would actually reveal something. */
  const hasHiddenCities =
    !countryFilter && !showAllCities && !!commonCities && cities.length > availableCities.length;

  const isFiltering = !!(search || countryFilter || cityFilter || typeFilter);

  // Filter bars first
  const filtered = useMemo(() => {
    /**
     * Near-me sorts the WHOLE directory, not the 226-row initial payload.
     *
     * An effect above drops nearMode the moment a city, country or search
     * filter is set, so in near-me these predicates are all inert and the
     * source can be swapped safely. Until the fetch lands, nearBars is null
     * and the existing 226 are used, so the button responds immediately and
     * the list deepens a moment later rather than blocking on the network.
     */
    const source = nearMode && nearBars ? nearBars : allBars;
    return source.filter(bar => {
      // Location matching goes through the metro rollup, not bar.city: the
      // dropdown says "Los Angeles" while Polo Lounge still says "Beverly
      // Hills", and searching "Beverly Hills" has to find it either way.
      //
      // matchesAllWords, not a contiguous includes(): this must agree with
      // the server filter in searchOrFilters, or it silently throws away the
      // rows that query just found.
      const matchSearch = matchesAllWords(search, [bar.name, bar.search_terms, bar.country, ...searchTermsOf(bar)]);
      const matchCountry = !countryFilter || bar.country === countryFilter;
      const matchCity = !cityFilter || metroCityOf(bar) === cityFilter;
      const matchType = !typeFilter || bar.type === typeFilter || (bar.subtypes ?? []).includes(typeFilter);
      return matchSearch && matchCountry && matchCity && matchType;
    });
  }, [search, countryFilter, cityFilter, typeFilter, allBars, nearMode, nearBars]);

  // Apply the same filters to the map-only bar dataset so that when a
  // country/city/type filter is active, the map shows only matching bars
  // and can zoom to their bounds.
  const filteredMapBars = useMemo(() => {
    return mapBars.filter(bar => {
      // Location matching goes through the metro rollup, not bar.city: the
      // dropdown says "Los Angeles" while Polo Lounge still says "Beverly
      // Hills", and searching "Beverly Hills" has to find it either way.
      //
      // matchesAllWords, not a contiguous includes(): this must agree with
      // the server filter in searchOrFilters, or it silently throws away the
      // rows that query just found.
      const matchSearch = matchesAllWords(search, [bar.name, bar.search_terms, bar.country, ...searchTermsOf(bar)]);
      const matchCountry = !countryFilter || bar.country === countryFilter;
      const matchCity = !cityFilter || metroCityOf(bar) === cityFilter;
      const matchType = !typeFilter || bar.type === typeFilter || (bar.subtypes ?? []).includes(typeFilter);
      return matchSearch && matchCountry && matchCity && matchType;
    });
  }, [search, countryFilter, cityFilter, typeFilter, mapBars]);

  // ── UNIFIED SORTED GRID ──
  //
  // MODE A — City or country filter is active (user has chosen a specific location):
  //   1. Tier: Featured (with article) → TOP 10 → Free
  //   2. Photo: with photo before without photo (within same tier)
  //   3. 50 Best, then alphabetical
  //
  // MODE B — No filter active (browsing all bars, geo detected):
  //   1. Photo: all bars WITH photos before any bar WITHOUT photo
  //   2. Proximity band (100km buckets): closest area first
  //   3. Tier within band: Featured → TOP 10 → Free
  //   4. 50 Best, then alphabetical
  //
  // MODE C — No filter, no geo:
  //   Strict tier order, then alphabetical
  // Distance to a bar, GPS when we have it and the IP-geo score converted to
  // rough km when we do not. Lifted out of the sort memo so the near-me notice
  // measures distance the same way MODE D orders by it; two copies would drift
  // and the notice would eventually contradict the list under it.
  const getDistKm = useCallback((b: Bar): number => {
    if (userLat !== null && userLng !== null) {
      return (b.lat != null && b.lng != null)
        ? haversineKm(userLat, userLng, b.lat, b.lng)
        : 99999;
    }
    const score = getGeoScore(b, geoCity, geoCountryCode, geoContinent);
    return Math.max(0, (1000 - score) * 20);
  }, [userLat, userLng, geoCity, geoCountryCode, geoContinent]);

  /**
   * A city-centre point is USELESS FOR STREET DISTANCE AND PERFECTLY GOOD FOR
   * KNOWING WHICH CITY A BAR IS IN (Roman, 2026-09-21).
   *
   * The first version of this excluded such rows from distance entirely, which
   * put Teens of Thailand behind a Melbourne bar for a visitor standing in
   * Bangkok. Correct about the metres, useless to the reader.
   *
   * So the point IS used, for the one thing it is good for: it bands the row
   * with its own city, which is exactly where the bar is. Two things then keep
   * it honest:
   *   - inside a band, every measurable bar outranks every approximate one, so
   *     a city-centre row lands directly after the bars we can actually place;
   *   - the card shows NO distance, because the number would be fiction.
   *
   * ONLY 'city-centre' counts as approximate. NULL predates the column and
   * behaves exactly as it always has.
   */
  const isApprox = useCallback((b: Bar): boolean => isCityCentre(b.geo_method), []);

  const allFiltered = useMemo(() => {
    const hasPhoto = (b: Bar) => !!(b.photos && b.photos.length > 0);

    // Paid, editorial pick, article, rest. This had it backwards: any bar with
    // an article outranked top10, featured and premium, which all shared 1. So
    // an article we wrote for free beat the tier two bars pay for.
    const tierRank = (b: Bar): number => {
      if (b.tier === 'featured' || b.tier === 'premium') return 0;        // the paid tier
      if (b.tier === 'top10') return 1;                                   // our editorial pick
      if (b.wp_article_slug) return 2;                                    // we wrote about it
      return 3;                                                           // everything else
    };

    const hasGeoSignal = !!(geoCity || geoCountryCode);
    const hasLocationFilter = !!(cityFilter || countryFilter);

    // MODE D: "Find bars near me". Distance decides the band, quality decides
    // the order inside it, and a closer band always wins. So a great bar in
    // the next town never outranks a decent one the visitor can walk to, and
    // within one walkable band the better bar still leads. GPS when granted;
    // the IP-geo score converts to real-ish km when the visitor's city is
    // known, and to "far" buckets when only country or continent match, which
    // lands those bars past the last band, exactly where they belong.
    if (nearMode) {
      return [...filtered].sort((a, b) => {
        const dA = getDistKm(a);
        const dB = getDistKm(b);
        const bandA = nearBand(dA);
        // Band first, then a measurable bar ahead of an approximate one. Both
        // rules live in lib/near-order.ts and are tested there.
        const precedence = compareBandAndPrecision(dA, isApprox(a), dB, isApprox(b));
        if (precedence !== 0) return precedence;
        if (bandA < NEAR_BANDS_KM.length) {
          // Inside one band the bars are comparably reachable, so the
          // directory's usual quality order applies, distance last.
          const tA = tierRank(a);
          const tB = tierRank(b);
          if (tA !== tB) return tA - tB;
          // ACCOLADES BEFORE PHOTO (Roman, 2026-09-20). All sixteen
          // Bratislava bars sit inside 600m, so they are one band and every
          // one is free tier with or without a photo. Without this term
          // distance broke the tie and Mirror Bar, No. 25 on the World's 50
          // Best with two more awards behind it, sat third behind two bars
          // holding nothing, on eighty metres.
          //
          // Same ordering the city pages use: the best renderable accolade's
          // score, highest first. Renderable is the point, since an entry the
          // badge would not draw should not move the list either.
          const sA = bestScore(a);
          const sB = bestScore(b);
          if (sA !== sB) return sB - sA;
          const pA = hasPhoto(a) ? 0 : 1;
          const pB = hasPhoto(b) ? 0 : 1;
          if (pA !== pB) return pA - pB;
          if (dA !== dB) return dA - dB;
          return a.name.localeCompare(b.name);
        }
        // Past the last band nothing is near, so nothing beats being closer.
        if (dA !== dB) return dA - dB;
        return a.name.localeCompare(b.name);
      });
    }

    // MODE A: city or country filter active — tier first, then photo, then alpha
    if (hasLocationFilter) {
      return [...filtered].sort((a, b) => {
        // 1. Tier
        const tA = tierRank(a);
        const tB = tierRank(b);
        if (tA !== tB) return tA - tB;
        // 2. Merit band, then photo INSIDE it. This had photo above 50 Best,
        // which is photos before everything; a 50 Best bar without a photo
        // fell behind a free bar with a snapshot. It now falls behind another
        // 50 Best bar that has one.
        const mA = meritBand(a) - meritBand(b);
        if (mA !== 0) return mA;
        const pA = hasPhoto(a) ? 0 : 1;
        const pB = hasPhoto(b) ? 0 : 1;
        if (pA !== pB) return pA - pB;
        // 3. 50 Best
        const aIs50Best = hasFiftyBest(a.accolades) ? 1 : 0;
        const bIs50Best = hasFiftyBest(b.accolades) ? 1 : 0;
        if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
        // 4. Alphabetical
        return a.name.localeCompare(b.name);
      });
    }

    // MODE C: no geo — strict tier order, then alphabetical
    if (!hasGeoSignal) {
      return [...filtered].sort((a, b) => {
        const rankA = tierRank(a);
        const rankB = tierRank(b);
        if (rankA !== rankB) return rankA - rankB;
        const aIs50Best = hasFiftyBest(a.accolades) ? 1 : 0;
        const bIs50Best = hasFiftyBest(b.accolades) ? 1 : 0;
        if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
        return a.name.localeCompare(b.name);
      });
    }

    // MODE B: geo active, no filter — photo first, then proximity band, then tier
    const BAND_KM = 100;
    return [...filtered].sort((a, b) => {
      // 1. Photo (has photo = first — always)
      const pA = hasPhoto(a) ? 0 : 1;
      const pB = hasPhoto(b) ? 0 : 1;
      if (pA !== pB) return pA - pB;
      // 2. Proximity band
      const bandA = Math.floor(getDistKm(a) / BAND_KM);
      const bandB = Math.floor(getDistKm(b) / BAND_KM);
      if (bandA !== bandB) return bandA - bandB;
      // 3. Tier within band
      const tA = tierRank(a);
      const tB = tierRank(b);
      if (tA !== tB) return tA - tB;
      // 4. 50 Best
      const aIs50Best = hasFiftyBest(a.accolades) ? 1 : 0;
      const bIs50Best = hasFiftyBest(b.accolades) ? 1 : 0;
      if (aIs50Best !== bIs50Best) return bIs50Best - aIs50Best;
      // 5. Alphabetical
      return a.name.localeCompare(b.name);
    });
    // geoContinent, userLat and userLng are not listed: they are getDistKm's
    // own dependencies now, so a change to any of them gives this memo a new
    // getDistKm and it recomputes anyway.
  }, [filtered, cityFilter, countryFilter, geoCity, geoCountryCode, nearMode, getDistKm, isApprox]);

  /**
   * How far the closest bar actually is, in near-me mode only.
   *
   * We list bars in 218 cities, so plenty of visitors have nothing genuinely
   * near them. MODE D already falls through to plain distance past the radius
   * so the grid is never empty, but without this the page presents a bar 3,000
   * km away as though it were local. The list is already distance-ordered, so
   * the head of it is the nearest; the loop is a guard for the case where the
   * first entry has no coordinates.
   */
  const nearestKm = useMemo(() => {
    if (!nearMode || allFiltered.length === 0) return null;
    let min = Infinity;
    const limit = Math.min(allFiltered.length, 50);
    for (let i = 0; i < limit; i++) {
      // Skip approximate rows. This number decides whether the banner speaks,
      // and the banner speaks when no CARD can show a distance. An approximate
      // row never shows one, so letting its city-centre distance in here would
      // silence the banner on exactly the case it exists for: a visitor whose
      // only nearby bars are ones we cannot place.
      if (isApprox(allFiltered[i])) continue;
      const d = getDistKm(allFiltered[i]);
      if (d < min) min = d;
    }
    return Number.isFinite(min) ? min : null;
  }, [nearMode, allFiltered, getDistKm, isApprox]);

  /**
   * Whether the distance is a measurement or an artifact.
   *
   * Without GPS, getDistKm converts the IP-geo score with (1000 - score) * 20,
   * so a visitor we cannot place at all comes out at "20000 km". That is a
   * scoring bucket wearing a kilometre label, and printing it as a distance
   * would be exactly the dishonesty this notice exists to remove. With no
   * coordinates the notice says what it actually knows and quotes no number.
   */
  const hasPreciseLocation = userLat !== null && userLng !== null;

  /**
   * The banner speaks exactly when no card can.
   *
   * It is DERIVED from the card rule rather than carrying a threshold of its
   * own. It used to key off the 80 km near-me radius while the cards keyed off
   * 30 in the visitor's unit, and between those two numbers sat a band where a
   * visitor saw a list of bars with no distances and no reason given: nearest
   * bar 45 km away, every card silent, banner silent too. Two numbers drift
   * apart the moment either is tuned, which is how that gap appeared. One
   * number now, and the banner is its complement.
   *
   * The list is distance-ordered, so if the nearest bar cannot show a distance
   * then none of them can.
   */
  const noCardShowsDistance =
    nearestKm === null
    || !hasPreciseLocation
    || !showsDistanceOnCard(nearestKm, geoCountryCode);

  /**
   * Turn near-me on or off. The control has no state of its own: it renders
   * from nearMode, so the existing effect that drops the mode when a city or
   * country filter is applied clears the control at the same time.
   */
  const toggleNearMe = useCallback(() => {
    const url = new URL(window.location.href);
    const commit = () => window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    if (nearMode) {
      setNearMode(false);
      if (url.searchParams.has('near')) { url.searchParams.delete('near'); commit(); }
      return;
    }
    setNearMode(true);
    url.searchParams.set('near', 'me');
    commit();
    // Asked for at the moment of the click, which is when the visitor has
    // actually asked to be located.
    if (userLat === null && userLng === null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => { /* denied: the IP-geo score still orders the list */ },
        { timeout: 8000, maximumAge: 300000 },
      );
    }
  }, [nearMode, userLat, userLng]);

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
    <div className="directory-outer-with-sidebar">
      {/* Row 1: hero (left) + promo (right) — same height */}
      {/* Task 112: a compact black band, the header's black, in place of the
          photo hero. Eyebrow, title, and the counts as one grey line. */}
      <div className="directory-hero">
        <div className="directory-hero-inner">
          <span className="directory-hero-eyebrow">Bar directory</span>
          <h1>Discover the World&apos;s Best Bars</h1>
          {/* Pinned to en-US like every other count on the site. Without
              the argument the separator follows the browser, so a German
              visitor saw 1.506+ where everyone else saw 1,506+. */}
          <p className="directory-hero-line">
            {totalBars ? `${totalBars.toLocaleString('en-US')}+` : '1,000+'} bars
            {' · '}{totalCities || 140} cities
            {' · '}{totalCountries || 58} countries
          </p>
        </div>
      </div>

      {/* Row 1 right: promo box — same grid row as hero */}
      <BarDirectorySidebarPromo />

      {/* Row 2 left: filters + grid */}
      <div className="directory-page-body">

      {/* ── Search & Filters ── */}
      <div className="directory-filters">
        <BarSearchTypeahead
          value={search}
          onChange={v => { setSearch(v); resetPagination(); }}
          onClear={() => setSearch('')}
          inputRef={searchInputRef}
        />
        <div className="directory-filter-row">
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setCityFilter(''); resetPagination(); }}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={cityFilter}
            onChange={e => {
              // The escape is an option rather than a separate control so it
              // sits where someone already is when the city they want is not
              // in the list. It expands the menu; it never filters, so the
              // selection stays put.
              if (e.target.value === SHOW_ALL_CITIES) { setShowAllCities(true); return; }
              setCityFilter(e.target.value);
              resetPagination();
            }}
          >
            <option value="">All Cities</option>
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            {hasHiddenCities && (
              <option value={SHOW_ALL_CITIES}>
                Show all {cities.length} cities...
              </option>
            )}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); resetPagination(); }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {/* Near-me is a STATE of this page, not a link to another one, so it
              belongs in the filter row rather than in the NearMeBar strip. A
              visitor landing on /bars from a search result had no way into
              MODE D at all, and no way out of it but editing the URL. */}
          <button
            type="button"
            className={`directory-near-btn${nearMode ? ' active' : ''}`}
            onClick={toggleNearMe}
            aria-pressed={nearMode}
            aria-label={nearMode ? 'Turn off near me' : 'Show bars near me'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            Near me
            {nearMode && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
          </button>
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
        {/* Quick type chips — one-tap filtering, Fun Radio-style pills */}
        <div className="directory-type-chips" role="tablist" aria-label="Filter by bar type">
          <button
            className={`directory-type-chip${!typeFilter ? ' active' : ''}`}
            onClick={() => { setTypeFilter(''); resetPagination(); }}
          >
            All types
          </button>
          {types.map(t => (
            <button
              key={t}
              className={`directory-type-chip${typeFilter === t ? ' active' : ''}`}
              onClick={() => { setTypeFilter(typeFilter === t ? '' : t); resetPagination(); }}
            >
              {t}
            </button>
          ))}
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

      {/* We list bars in 218 cities, so a lot of visitors have nothing genuinely
          near them. When no card can show a distance, this says it once rather
          than leaving the reader to wonder why the numbers vanished. */}
      {nearMode && noCardShowsDistance && (
        <div className="dir-near-notice">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {hasPreciseLocation && nearestKm !== null && nearestKm < 99999
            ? `The nearest bars we list are ${formatDistance(nearestKm, geoCountryCode)} away.`
            : 'We could not pin down where you are. These are ordered by our best guess at what is closest to you.'}
        </div>
      )}

      {/* ═══ MAP VIEW ═══ */}
      {viewMode === 'map' && <DirectoryMap bars={mapBarsLoaded ? filteredMapBars : allFiltered} geoCity={geoCity} geoCountryCode={geoCountryCode} userLat={userLat} userLng={userLng} countryFilter={countryFilter} cityFilter={cityFilter} />}

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
              {/* The banner that used to sit here is gone (Roman, 2026-09-18):
                  "this sentence doesn't look good there, and I don't think
                  it's necessary". It explained the ranking to someone who had
                  not asked, and once every card carries its own distance it
                  told the reader nothing they could not already see. The
                  near-me control shows the mode is on and gives a way out, so
                  nothing is lost. The one line that survives is the
                  beyond-the-radius notice above, which is the only fact the
                  cards cannot convey on their own: a card reading 340 km does
                  not tell you that is the best we have rather than a mistake. */}
              {/* ══ UNIFIED GRID: all bars, same card design, sorted by tier then proximity ══ */}
              <div className="directory-featured-grid">
                {allFiltered.slice(0, gridVisible).map(bar => (
                  <FeaturedBarCard key={bar.id} bar={bar} distanceKm={nearMode && hasPreciseLocation && !isApprox(bar) ? getDistKm(bar) : null} countryCode={geoCountryCode} />
                ))}
              </div>

              {/* Inline CTA after first page of results */}
              {!isFiltering && gridVisible >= FEATURED_PER_PAGE && (
                <div className="directory-inline-cta">
                  <div className="directory-inline-cta-inner">
                    <div className="directory-inline-cta-text">
                      <h3>Get featured in BarMagazine</h3>
                      <p>From a free listing to a full feature article: get your bar in front of the world&apos;s bar professionals.</p>
                    </div>
                    <Link href="/feature-your-bar" className="directory-inline-cta-btn">
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
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    <BarDirectorySidebar />
    </div>
  );
}

/* ─── Card Components ─── */


function FeaturedBarCard({ bar, distanceKm, countryCode }: { bar: Bar; distanceKm?: number | null; countryCode?: string }) {
  const imageUrl = bar.photos?.[0] || null;
  const isPremium = bar.tier === 'premium';
  const isTop10 = bar.tier === 'top10';
  // Featured is the PAID subscription and nothing else. This used to read
  // `tier === 'featured' || wp_article_slug`, which put the badge on every
  // bar we had written about: 15 bars wearing a badge two bars pay for, two
  // of them showing Top 10 and Featured side by side as though our editorial
  // picks were advertising. Having an article is a real editorial signal and
  // still ranks, under its own name.
  const isFeatured = bar.tier === 'featured';
  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-featured-card">
      <div className="bar-dir-featured-visual">
        {imageUrl
          ? <img src={imageUrl} alt={bar.name} loading="lazy" />
          : (
            <BarPlaceholder name={bar.name} type={bar.type} />
          )
        }
        <CardStatusPills top10={isTop10} fiftyBest={hasFiftyBest(bar.accolades)} featured={isFeatured} premium={isPremium} status={statusPill(bar)} />
        {typeof distanceKm === 'number' && showsDistanceOnCard(distanceKm, countryCode) && (
          <span className="bar-dir-distance-pill">{formatDistance(distanceKm, countryCode)}</span>
        )}
      </div>
      <div className="bar-dir-featured-body">

        <h3 className="bar-dir-featured-name">{bar.name}</h3>
        <span className="bar-dir-featured-location">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {placeLine(bar)}
        </span>
      </div>
    </Link>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PhotoBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;
  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-card">
      <div className="bar-dir-card-visual">
        {imageUrl
          ? <img src={imageUrl} alt={bar.name} loading="lazy" />
          : (
            <BarPlaceholder name={bar.name} type={bar.type} />
          )
        }
      </div>
      <div className="bar-dir-card-body">
        <h3>{bar.name}</h3>
        <div className="bar-dir-card-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span>{placeLine(bar)}</span>
        </div>
        <span className="bar-dir-type">{formatBarType(bar.type)}</span>
      </div>
    </Link>
  );
}
