/**
 * How a city is qualified in visitor-facing copy.
 *
 * "Nashville, United States" is not how anyone writes or searches for it.
 * Americans and Canadians name the state or province; everywhere else the
 * country is what disambiguates, and genuinely needs to, since Cordoba is
 * in both Argentina and Spain and Valencia in both Spain and Venezuela.
 *
 * RULE (Roman, 2026-09-14):
 *   United States and Canada -> "Nashville, Tennessee", the state or
 *     province spelled out, never the two-letter code and NEVER the country.
 *   Everywhere else          -> "Malaga, Spain", unchanged.
 *   Unresolvable             -> the bare city name. Falling back to the
 *     country would reintroduce exactly the string this rule removes.
 */

const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

const CA_PROVINCES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia',
  NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario',
  PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
};

/** Countries whose cities are qualified by subdivision rather than country. */
export function usesSubdivision(country: string | null | undefined): boolean {
  return country === 'United States' || country === 'Canada';
}

/**
 * Pull the subdivision code out of one address.
 *
 * ANCHORED TO THE POSTCODE, deliberately. A bare two-letter search matches
 * compass directions in street lines: "99 Krog Street NE, Atlanta" resolved
 * to Nebraska, and an Albuquerque address to the same, until this was
 * tightened.
 */
export function subdivisionCode(address: unknown, country: string): string | null {
  if (typeof address !== 'string') return null;
  if (country === 'Canada') {
    const m = /\b([A-Z]{2})[,\s]+[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/.exec(address);
    return m && CA_PROVINCES[m[1]] ? m[1] : null;
  }
  const m = /\b([A-Z]{2})[,\s]+\d{5}(?:-\d{4})?\b/.exec(address);
  return m && US_STATES[m[1]] ? m[1] : null;
}

/**
 * The subdivision for a city, by majority vote across its bars' addresses.
 *
 * A vote rather than first-match: a city's listings spill into neighbouring
 * towns (Brookline against Boston, Surfside against Miami), and a single
 * stray address should not rename the city.
 */
export function subdivisionForCity(
  addresses: unknown[],
  country: string | null | undefined
): string | null {
  if (!usesSubdivision(country)) return null;
  const map = country === 'Canada' ? CA_PROVINCES : US_STATES;
  const votes = new Map<string, number>();
  for (const a of addresses) {
    const code = subdivisionCode(a, country as string);
    if (code) votes.set(code, (votes.get(code) ?? 0) + 1);
  }
  if (votes.size === 0) return null;
  // Array.from, not spread: this tsconfig predates downlevelIteration.
  const winner = Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0][0];
  return map[winner] ?? null;
}

/**
 * The visitor-facing location label for a city.
 *
 * `subdivision` is the spelled-out state or province, from
 * subdivisionForCity; pass null when there is none or it could not be
 * resolved.
 */
export function cityLabel(
  city: string,
  country: string | null | undefined,
  subdivision: string | null
): string {
  if (usesSubdivision(country)) {
    if (!subdivision) return city;
    // "Washington DC, District of Columbia" is nobody's idea of a place
    // name. When the city already carries its own qualifier, it is done.
    const bare = city.toLowerCase().replace(/[^a-z ]/g, '');
    if (bare.endsWith(' dc') || bare.includes(subdivision.toLowerCase())) return city;
    return `${city}, ${subdivision}`;
  }
  return country ? `${city}, ${country}` : city;
}

/**
 * The spelled-out name for a stored state or province code (bars.state):
 * "ME" -> "Maine", "ON" -> "Ontario". Null for no code, an unknown code, or
 * a country that does not qualify by subdivision. This is what the pages
 * read since 2026-09-15; subdivisionForCity (the address vote) remains the
 * backfill source only.
 */
export function subdivisionName(code: string | null | undefined, country: string | null | undefined): string | null {
  if (!code || !usesSubdivision(country)) return null;
  const map = country === 'Canada' ? CA_PROVINCES : US_STATES;
  return map[code.toUpperCase()] ?? null;
}

/**
 * The place line for one bar, everywhere a card or a profile prints one
 * (Roman, 2026-09-15: every place line on the site prints the same way):
 * "Nashville, Tennessee", "Toronto, Ontario", "Malaga, Spain". Reads
 * bars.state; a US row with no state prints the bare city, never the
 * country. Pure, so client components can call it.
 */
export function placeLine(bar: { city: string; country: string; state?: string | null }): string {
  return cityLabel(bar.city, bar.country, subdivisionName(bar.state, bar.country));
}
