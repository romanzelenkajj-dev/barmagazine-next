import { describe, it, expect } from 'vitest';
import { nearestBars, streetOf, lineOf, distanceLabel } from './nearby';

const mk = (o: Partial<Parameters<typeof nearestBars>[1][number]> & { id: string; slug: string }) => ({
  name: o.slug, city: 'San Diego', address: null, lat: null, lng: null, short_excerpt: null, description: null, ...o,
});

describe('nearby', () => {
  const me = { id: 'me', city: 'San Diego', country: 'United States', lat: 32.7157, lng: -117.1611 };

  it('returns the closest first, same city only, never itself', () => {
    const out = nearestBars(me, [
      mk({ id: 'me', slug: 'me', lat: 32.7157, lng: -117.1611 }),
      mk({ id: 'a', slug: 'far', lat: 32.8, lng: -117.2 }),
      mk({ id: 'b', slug: 'near', lat: 32.716, lng: -117.162 }),
      mk({ id: 'c', slug: 'other-city', city: 'Los Angeles', lat: 32.7158, lng: -117.1612 }),
    ]);
    expect(out.map(e => e.slug)).toEqual(['near', 'far']);
  });

  it('shows what exists under five and nothing for a lonely bar', () => {
    expect(nearestBars(me, [mk({ id: 'a', slug: 'a', lat: 32.72, lng: -117.16 })])).toHaveLength(1);
    expect(nearestBars(me, [])).toEqual([]);
    expect(nearestBars({ ...me, lat: null }, [mk({ id: 'a', slug: 'a', lat: 32.72, lng: -117.16 })])).toEqual([]);
  });

  it('caps at five', () => {
    const many = Array.from({ length: 9 }, (_, i) => mk({ id: String(i), slug: `b${i}`, lat: 32.7157 + i * 0.001, lng: -117.1611 }));
    expect(nearestBars(me, many)).toHaveLength(5);
  });

  it('uses miles for the United States and km elsewhere, matching the hours precedent', () => {
    expect(distanceLabel(1.609344, 'United States')).toBe('1.0 mi');
    expect(distanceLabel(1.609344, 'Mexico')).toBe('1.6 km');
    expect(distanceLabel(0.05, 'Spain')).toBe('nearby');
    expect(distanceLabel(12.4, 'United Kingdom')).toBe('12 km');
  });

  it('takes the street from the address and the line from excerpt or first sentence', () => {
    expect(streetOf('4696 30th St, San Diego, CA 92116', 'San Diego')).toBe('4696 30th St');
    expect(streetOf('Cotai, Macau', 'Cotai')).toBeNull();
    expect(streetOf(null, 'X')).toBeNull();
    expect(lineOf('Short and sweet.', 'Long description. More.')).toBe('Short and sweet.');
    expect(lineOf(null, 'First sentence here. Second one.')).toBe('First sentence here.');
    expect(lineOf(null, null)).toBeNull();
  });
});
