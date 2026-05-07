import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config.mjs';

/**
 * Headers-config regression guard.
 *
 * Currently tests the X-Robots-Tag: noindex header on /_next/static/:path*
 * (the GSC "Indexed, though blocked by robots.txt" alert fix). Same shape
 * as the redirect-chain test: pin the architectural property so future
 * refactors don't silently regress it.
 */

type HeaderEntry = { key: string; value: string };
type HeaderRule = { source: string; headers: HeaderEntry[] };

describe('next.config.mjs headers()', () => {
  it('emits X-Robots-Tag: noindex on /_next/static/:path*', async () => {
    const all = (await nextConfig.headers()) as HeaderRule[];
    const rule = all.find((r) => r.source === '/_next/static/:path*');
    expect(rule, 'rule for /_next/static/:path* must exist').toBeDefined();

    const xRobots = rule!.headers.find(
      (h) => h.key.toLowerCase() === 'x-robots-tag',
    );
    expect(xRobots, 'X-Robots-Tag header must be set on /_next/static/:path*').toBeDefined();
    expect(xRobots!.value).toBe('noindex');
  });

  it('every header rule has a non-empty source and at least one header', async () => {
    const all = (await nextConfig.headers()) as HeaderRule[];
    expect(all.length).toBeGreaterThan(0);
    for (const rule of all) {
      expect(rule.source, 'rule.source must be a non-empty string').toBeTruthy();
      expect(rule.headers.length, `rule for ${rule.source} must have headers`).toBeGreaterThan(0);
      for (const h of rule.headers) {
        expect(h.key, `header in ${rule.source} must have a key`).toBeTruthy();
        expect(h.value, `header in ${rule.source} must have a value`).toBeTruthy();
      }
    }
  });
});
