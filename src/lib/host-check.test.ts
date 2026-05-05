import { describe, it, expect } from 'vitest';
import { isCanonicalHost, isLocalHost, CANONICAL_HOST } from './host-check';

describe('host-check', () => {
  it('CANONICAL_HOST is the apex domain', () => {
    expect(CANONICAL_HOST).toBe('barmagazine.com');
  });

  describe('isCanonicalHost', () => {
    it('returns true for the apex', () => {
      expect(isCanonicalHost('barmagazine.com')).toBe(true);
    });

    it('returns false for the www subdomain (B5: www is intentionally non-canonical)', () => {
      // If www.barmagazine.com ever starts resolving (DNS at the registrar),
      // middleware 301s it to apex rather than fragmenting ranking signals.
      expect(isCanonicalHost('www.barmagazine.com')).toBe(false);
    });

    it('returns false for Vercel preview / alias hosts', () => {
      expect(isCanonicalHost('barmagazine-next.vercel.app')).toBe(false);
      expect(
        isCanonicalHost('barmagazine-next-git-fix-x-romanzelenkajj-7135s-projects.vercel.app'),
      ).toBe(false);
    });

    it('returns false for unrelated hosts', () => {
      expect(isCanonicalHost('example.com')).toBe(false);
      expect(isCanonicalHost('barmagazine.com.evil.example')).toBe(false);
      expect(isCanonicalHost('evilbarmagazine.com')).toBe(false);
    });

    it('returns false for empty / malformed input', () => {
      expect(isCanonicalHost('')).toBe(false);
    });
  });

  describe('isLocalHost', () => {
    it('matches localhost', () => {
      expect(isLocalHost('localhost')).toBe(true);
    });

    it('matches *.local hosts (mac mDNS / docker compose conventions)', () => {
      expect(isLocalHost('mac.local')).toBe(true);
      expect(isLocalHost('roman.local')).toBe(true);
    });

    it('does NOT match production hosts', () => {
      expect(isLocalHost('barmagazine.com')).toBe(false);
      expect(isLocalHost('www.barmagazine.com')).toBe(false);
    });

    it('does NOT match Vercel preview hosts', () => {
      expect(isLocalHost('barmagazine-next.vercel.app')).toBe(false);
    });
  });
});
