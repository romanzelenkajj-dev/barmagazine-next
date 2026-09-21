/**
 * The two decisions that come before quality in near-me ordering.
 *
 * Lifted out of BarDirectoryMap so they can be tested. Both of the edge cases
 * Roman asked about are cases that DO NOT EXIST in the live directory today
 * (no city has only city-centre bars, and no city-centre row is within 40 km
 * of another city's measurable bar), so a browser cannot demonstrate them.
 * They are one insert away from existing, which is exactly why they are
 * pinned here instead.
 */

/**
 * Proximity bands, in km.
 *
 * The boundaries are chosen by how you would actually get there rather than by
 * round numbers: 5 km is walking or a short hop, 5 to 15 km is a normal ride
 * across a city, 15 to 40 km is a deliberate trip out. Past 40 km nothing is
 * "near", so quality stops competing and it is pure distance.
 */
export const NEAR_BANDS_KM = [5, 15, 40];

/** Which band a distance falls in. Lower is closer; NEAR_BANDS_KM.length means "beyond". */
export function nearBand(km: number): number {
  for (let i = 0; i < NEAR_BANDS_KM.length; i++) {
    if (km <= NEAR_BANDS_KM[i]) return i;
  }
  return NEAR_BANDS_KM.length;
}

/**
 * Band first, then a measurable bar ahead of an approximate one.
 *
 * WHY A CITY-CENTRE ROW IS BANDED AT ALL. Its point is the middle of its city,
 * which is useless for street distance and perfectly good for knowing which
 * city the bar is in. Excluding it from distance entirely put Teens of
 * Thailand behind a Melbourne bar for a visitor in Bangkok: correct about the
 * metres, useless to the reader. So the point is used for the one thing it can
 * answer, and two rules keep it honest:
 *
 *   1. inside a band, every measurable bar outranks every approximate one, so
 *      an approximate row lands directly after the bars we can actually place
 *      and never displaces one;
 *   2. the card shows no distance, because the number would be fiction.
 *
 * Returns 0 when neither band nor precision decides, leaving the caller's
 * quality terms to settle it.
 */
export function compareBandAndPrecision(
  aKm: number,
  aApprox: boolean,
  bKm: number,
  bApprox: boolean,
): number {
  const bandA = nearBand(aKm);
  const bandB = nearBand(bKm);
  // Between bands, closer wins outright. Nothing about a bar's quality
  // competes with being reachable, and an approximate row in a NEARER band is
  // still genuinely nearer: it is in a closer city.
  if (bandA !== bandB) return bandA - bandB;
  const apA = aApprox ? 1 : 0;
  const apB = bApprox ? 1 : 0;
  if (apA !== apB) return apA - apB;
  return 0;
}
