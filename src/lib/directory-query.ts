import { toUrlSlug } from '@/lib/utils';

/**
 * The /bars filters as a query string (task 132, Roman, 2026-09-24).
 *
 * WHY. The filters lived only in React state, so opening a bar and pressing
 * back rebuilt the directory from nothing: country, city, type and search all
 * gone. Now every filter writes to the URL as it changes and the page reads
 * it back on load, so back lands on the same list, and a filtered list can be
 * shared as a link.
 *
 * READABLE SLUGS, NOT RAW VALUES: /bars?country=italy&city=milan&type=cocktail-bar.
 * A slug is resolved against the option lists the page already has, so an
 * unknown or stale slug is ignored instead of producing an empty filter the
 * dropdown cannot show. The search text is free text and travels as typed.
 *
 * The canonical tag on /bars does not change: every one of these URLs points
 * Google at /bars, so filtered lists never compete with the directory itself.
 */
export interface DirectoryQuery {
  search: string;
  country: string;
  city: string;
  type: string;
  view: 'grid' | 'map';
}

export interface DirectoryOptions {
  countries: string[];
  cities: string[];
  types: string[];
}

export const EMPTY_QUERY: DirectoryQuery = { search: '', country: '', city: '', type: '', view: 'grid' };

/** The keys this page owns. Anything else in the URL (near, utm_*) is left alone. */
const OWN_KEYS = ['country', 'city', 'type', 'q', 'view'] as const;

function resolve(slug: string | null, options: string[]): string {
  if (!slug) return '';
  const s = toUrlSlug(slug);
  if (!s) return '';
  return options.find(o => toUrlSlug(o) === s) ?? '';
}

export function readDirectoryQuery(search: string | URLSearchParams | Record<string, string | string[] | undefined>, options: DirectoryOptions): DirectoryQuery {
  const p = search instanceof URLSearchParams
    ? search
    : typeof search === 'string'
      ? new URLSearchParams(search)
      : new URLSearchParams(
          Object.entries(search).flatMap(([k, v]) => (v === undefined ? [] : [[k, Array.isArray(v) ? v[0] ?? '' : v]])),
        );
  return {
    search: (p.get('q') ?? '').slice(0, 120),
    country: resolve(p.get('country'), options.countries),
    city: resolve(p.get('city'), options.cities),
    type: resolve(p.get('type'), options.types),
    view: p.get('view') === 'map' ? 'map' : 'grid',
  };
}

/**
 * The query string for a state, with this page's keys in a fixed order and
 * every other key kept as it was. Returns '' or '?...'.
 */
export function writeDirectoryQuery(current: string, q: DirectoryQuery): string {
  const prev = new URLSearchParams(current);
  const next = new URLSearchParams();
  if (q.country) next.set('country', toUrlSlug(q.country));
  if (q.city) next.set('city', toUrlSlug(q.city));
  if (q.type) next.set('type', toUrlSlug(q.type));
  const text = q.search.trim();
  if (text) next.set('q', text);
  if (q.view === 'map') next.set('view', 'map');
  prev.forEach((v, k) => {
    if (!(OWN_KEYS as readonly string[]).includes(k)) next.append(k, v);
  });
  const s = next.toString();
  return s ? `?${s}` : '';
}
