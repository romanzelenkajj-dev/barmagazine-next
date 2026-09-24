/**
 * Every redirect that left next.config.mjs for the middleware on 2026-09-23
 * (Vercel's 2,048-route cap) must still answer 301 to the same target.
 */
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import nextConfig from '../../next.config.mjs';
import { MERGED_SLUGS } from './merged-slugs';
import { rootBarSlugsFrom, slugRedirectTarget } from './slug-redirects';
import { middleware } from '../middleware';

const ORIGIN = 'https://barmagazine.com';
// A constructed NextRequest carries no Host header; the middleware reads it for
// the canonical-host check, so set it or every request 308s to production first.
const req = (url: string) => new NextRequest(url, { headers: { host: 'barmagazine.com' } });

describe('merged bar slugs', () => {
  it('every old slug 301s, through the middleware, to /bars/<kept slug>', async () => {
    expect(Object.keys(MERGED_SLUGS).length).toBeGreaterThan(30);
    for (const [from, to] of Object.entries(MERGED_SLUGS)) {
      const res = middleware(req(`${ORIGIN}/bars/${from}`));
      expect(res.status, `/bars/${from}`).toBe(301);
      expect(res.headers.get('location'), `/bars/${from}`).toBe(`${ORIGIN}/bars/${to}`);
    }
  });

  it('keeps the query string and tolerates a trailing slash', () => {
    const res = middleware(req(`${ORIGIN}/bars/kwant-mayfair/?utm=x`));
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/bars/kwant?utm=x`);
  });

  it('no kept slug is itself a merged source (no 301 chains)', () => {
    for (const [from, to] of Object.entries(MERGED_SLUGS)) {
      expect(MERGED_SLUGS[to], `${from} -> ${to} -> ${MERGED_SLUGS[to]}`).toBeUndefined();
    }
  });

  it('a live profile slug passes through untouched', () => {
    const res = middleware(req(`${ORIGIN}/bars/kwant`));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('is no longer duplicated in next.config.mjs redirects()', async () => {
    const rules = (await nextConfig.redirects!()) as { source: string }[];
    const sources = new Set(rules.map(r => r.source));
    for (const from of Object.keys(MERGED_SLUGS)) {
      expect(sources.has(`/bars/${from}`), `/bars/${from} still in next.config`).toBe(false);
    }
  });
});

describe('root bar slugs (the A4 /{slug} -> /bars/{slug} redirects)', () => {
  const generated = {
    redirects: [
      { from: '/handshake-speakeasy', to: '/bars/handshake-speakeasy' },
      { from: '/bar-leone', to: '/bars/bar-leone' },
      { from: 'not-a-path', to: '/bars/x' },
    ],
  };
  const set = rootBarSlugsFrom(generated);

  it('reads the generator output into a slug set, ignoring malformed rows', () => {
    expect(Array.from(set).sort()).toEqual(['bar-leone', 'handshake-speakeasy']);
  });

  it('redirects a known root slug to its profile and nothing else', () => {
    expect(slugRedirectTarget('/handshake-speakeasy', set)).toBe('/bars/handshake-speakeasy');
    expect(slugRedirectTarget('/handshake-speakeasy/', set)).toBe('/bars/handshake-speakeasy');
    expect(slugRedirectTarget('/some-article-slug', set)).toBeNull();
    expect(slugRedirectTarget('/', set)).toBeNull();
    expect(slugRedirectTarget('/category/events', set)).toBeNull();
    expect(slugRedirectTarget('/bars/handshake-speakeasy', set)).toBeNull();
  });

  it('the generated rules are no longer spread into next.config.mjs', async () => {
    const rules = (await nextConfig.redirects!()) as { source: string; destination: string }[];
    const perBar = rules.filter(r => /^\/[A-Za-z0-9-]+$/.test(r.source) && r.destination === `/bars${r.source}`);
    expect(perBar, perBar.map(r => r.source).slice(0, 5).join(', ')).toHaveLength(0);
  });
});

describe('Vercel route cap', () => {
  it('next.config.mjs stays well under the 2,048-route deployment limit', async () => {
    const redirects = await nextConfig.redirects!();
    const rewrites = nextConfig.rewrites ? await nextConfig.rewrites() : [];
    const headers = nextConfig.headers ? await nextConfig.headers() : [];
    const rw = Array.isArray(rewrites)
      ? rewrites.length
      : Object.values(rewrites as Record<string, unknown[]>).reduce((n, a) => n + a.length, 0);
    expect(redirects.length + rw + headers.length).toBeLessThan(1800);
  });
});

describe('retired city slugs (task 130)', () => {
  it('sends the old Wroclaw slug to the new one on every city route, through the middleware', () => {
    for (const [from, to] of [
      ['/bars/city/wroc-aw', '/bars/city/wroclaw'],
      ['/best-bars/wroc-aw', '/best-bars/wroclaw'],
      ['/best-bars/wroc-aw/cocktail-bars', '/best-bars/wroclaw/cocktail-bars'],
    ]) {
      const res = middleware(req(`${ORIGIN}${from}`));
      expect(res.status, from).toBe(301);
      expect(res.headers.get('location'), from).toBe(`${ORIGIN}${to}`);
    }
  });

  it('leaves a live city slug alone', () => {
    expect(slugRedirectTarget('/best-bars/gdansk', new Set())).toBeNull();
  });
});
