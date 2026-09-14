import { describe, it, expect } from 'vitest';
import { distanceKm, MAX_CITY_DISTANCE_KM } from './geocode';

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
