import { describe, it, expect, vi } from 'vitest';
import { distanceKm, MAX_CITY_DISTANCE_KM, stateHint, bareCity, cityQuery, addressQuery } from './geocode';

describe('geocode queries: the address first, the state where derivable', () => {
  const drastic = { address: '5817 Nieman Rd, Shawnee, KS 66203', city: 'Shawnee', country: 'United States' };

  it('derives the state from the address postcode line (Drastic Measures: Kansas, not Oklahoma)', () => {
    expect(stateHint(drastic)).toBe('KS');
    expect(cityQuery(drastic)).toBe('Shawnee, KS, United States');
  });

  it('takes the qualifier the city string carries when the address has none', () => {
    const jewel = { address: '644 Congress St', city: 'Portland, Maine', country: 'United States' };
    expect(stateHint(jewel)).toBe('Maine');
    expect(bareCity(jewel.city)).toBe('Portland');
    expect(cityQuery(jewel)).toBe('Portland, Maine, United States');
  });

  it('has no state outside the US and Canada, and none when nothing says', () => {
    expect(stateHint({ address: '30 Gibb St, Deritend, Birmingham B9 4BF', city: 'Birmingham', country: 'United Kingdom' })).toBeNull();
    expect(cityQuery({ address: null, city: 'Birmingham', country: 'United Kingdom' })).toBe('Birmingham, United Kingdom');
    expect(stateHint({ address: '99 Krog Street NE', city: 'Atlanta', country: 'United States' })).toBeNull();
  });

  it('builds the address query from the full address, appending only what is missing', () => {
    // Address already carries city and state: only the country is appended.
    expect(addressQuery(drastic)).toBe('5817 Nieman Rd, Shawnee, KS 66203, United States');
    // A bare street line gets city, state (from the qualifier) and country.
    expect(addressQuery({ address: '644 Congress St', city: 'Portland, Maine', country: 'United States' }))
      .toBe('644 Congress St, Portland, Maine, United States');
    // Outside the US nothing but the country is appended.
    expect(addressQuery({ address: '30 Gibb St, Deritend, Birmingham B9 4BF', city: 'Birmingham', country: 'United Kingdom' }))
      .toBe('30 Gibb St, Deritend, Birmingham B9 4BF, United Kingdom');
  });
});

describe('geocode validation distance', () => {
  it('measures real distances, not degree arithmetic', () => {
    // Ticuchi's stored coordinates against its actual city. The audit found
    // this row pointing at Oaxaca while its address is in Polanco.
    const oaxaca = distanceKm(17.062824, -96.72438, 19.4326, -99.1332);
    expect(Math.round(oaxaca)).toBeGreaterThan(350);
    expect(Math.round(oaxaca)).toBeLessThan(380);
  });

  it('counts a degree of longitude by latitude, not as a flat unit', () => {
    // One degree of longitude is ~111km at the equator and ~55km at 60N.
    const atEquator = distanceKm(0, 0, 0, 1);
    const atSixty = distanceKm(60, 0, 60, 1);
    expect(Math.round(atEquator)).toBe(111);
    expect(Math.round(atSixty)).toBe(56);
    // The old Pythagoras-on-degrees check scored both of these identically,
    // which is why one tolerance could never fit every city.
  });

  it('is zero for a point against itself and symmetric', () => {
    expect(distanceKm(51.5, -0.12, 51.5, -0.12)).toBe(0);
    expect(distanceKm(1, 2, 3, 4)).toBeCloseTo(distanceKm(3, 4, 1, 2), 9);
  });

  describe('the 40km tolerance', () => {
    it('accepts the furthest defensible outliers the audit found', () => {
      // Dubai Marina against central Dubai, ~26km.
      expect(distanceKm(25.08, 55.14, 25.2048, 55.2708)).toBeLessThan(MAX_CITY_DISTANCE_KM);
      // Ubud against the Bali centre used for the island, ~31km.
      expect(distanceKm(-8.5069, 115.2625, -8.41, 115.19)).toBeLessThan(MAX_CITY_DISTANCE_KM);
    });

    it('rejects a result in the wrong province', () => {
      // The Ho Chi Minh City insert that first landed 61km out.
      expect(distanceKm(10.512903, 107.191418, 10.7769, 106.7009)).toBeGreaterThan(
        MAX_CITY_DISTANCE_KM
      );
    });
  });
});

describe('the validation switch-off, closed', () => {
  // geocodeBarDetailed reads MAPBOX_TOKEN at MODULE LOAD and returns null
  // without one. The first version of these tests passed for exactly that
  // reason rather than because of the fix, so the token is set and the module
  // re-imported fresh inside every case.
  const load = async () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token';
    vi.resetModules();
    return import('./geocode');
  };
  const withFetch = async (handler: (url: string) => unknown, fn: () => Promise<unknown>) => {
    const real = globalThis.fetch;
    globalThis.fetch = (async (u: RequestInfo | URL) => ({
      json: async () => handler(String(u)),
    })) as unknown as typeof fetch;
    try { return await fn(); } finally { globalThis.fetch = real; }
  };
  const feature = (lat: number, lng: number) => ({ features: [{ center: [lng, lat] }] });
  const isCityQuery = (u: string) => !/Senopati/i.test(u) && !/\bbar,/i.test(u);

  it('proves the stub is actually reached', async () => {
    // Without this, every case below could pass on a null return.
    const { geocodeBarDetailed } = await load();
    const out = await withFetch(() => feature(-6.2088, 106.8456), () =>
      geocodeBarDetailed({ name: 'Somewhere', address: 'Jl. Senopati No. 79', city: 'Jakarta', country: 'Indonesia' }));
    expect(out).not.toBeNull();
  });

  it('REFUSES when the city itself does not resolve, instead of trusting the address', async () => {
    // The Jakarta case: the city query finds nothing, and the address query
    // returns a real address 5,000km away. Nothing validates it, so the only
    // honest answer is none.
    const { geocodeBarDetailed } = await load();
    const out = await withFetch(
      url => (isCityQuery(decodeURIComponent(url))
        ? { features: [] }                 // the city does not resolve
        : feature(28.6139, 77.2090)),      // New Delhi, 5,000km off
      () => geocodeBarDetailed({ name: 'Somewhere', address: 'Jl. Senopati No. 79', city: 'Jakarta', country: 'Indonesia' }),
    );
    expect(out).toBeNull();
  });

  it('still accepts an address result when the centre IS known and it is close', async () => {
    const { geocodeBarDetailed } = await load();
    const out = await withFetch(() => feature(-6.2297, 106.8095), () =>
      geocodeBarDetailed({ name: 'Somewhere', address: 'Jl. Senopati No. 79', city: 'Jakarta', country: 'Indonesia' }));
    expect(out).toMatchObject({ method: 'address' });
  });

  it('falls back to the centre, labelled as the centre, when the address is far off', async () => {
    const { geocodeBarDetailed } = await load();
    const out = await withFetch(url => {
      const u = decodeURIComponent(url);
      if (isCityQuery(u)) return feature(-6.2088, 106.8456);   // Jakarta centre
      return feature(28.6139, 77.2090);                        // far away
    }, () => geocodeBarDetailed({ name: 'Somewhere', address: 'Jl. Senopati No. 79', city: 'Jakarta', country: 'Indonesia' }));
    expect(out).toMatchObject({ method: 'city-centre' });
  });
});
