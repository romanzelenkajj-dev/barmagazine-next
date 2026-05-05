/**
 * Host-canonicalization helpers used by src/middleware.ts.
 *
 * Extracted into a pure-logic module so vitest can test them without
 * mocking NextRequest/NextResponse.
 *
 * `CANONICAL_HOST` is the production apex domain. `www.<apex>` is
 * INTENTIONALLY non-canonical — middleware 301s any request that
 * arrives on the www subdomain (or any other off-canonical host) to
 * the same path on the apex. The www subdomain doesn't currently
 * resolve at the registrar, but if it ever does, this code-side
 * defense ensures it can't fragment ranking signals or get indexed
 * as a duplicate of apex.
 */
export const CANONICAL_HOST = 'barmagazine.com';

/**
 * True iff the given hostname is the canonical apex.
 * Pass the host header value with port stripped and lowercased.
 */
export function isCanonicalHost(hostname: string): boolean {
  return hostname === CANONICAL_HOST;
}

/**
 * True iff the given hostname is a local development host that should
 * skip canonical-host enforcement (next dev, mac .local rendezvous).
 */
export function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname.endsWith('.local');
}
