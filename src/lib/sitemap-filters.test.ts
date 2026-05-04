import { describe, it, expect } from 'vitest';
import {
  isSlovakSlug,
  isWpSystemSlug,
  isStubPagePendingRebuild,
  shouldExcludeFromSitemap,
} from './sitemap-filters';

describe('isSlovakSlug', () => {
  it('matches obvious Slovak legacy slugs', () => {
    expect(isSlovakSlug('50-najlepsich-barov-sveta')).toBe(true);
    expect(isSlovakSlug('drinky-juznej-ameriky')).toBe(true);
    expect(isSlovakSlug('casino-royale-a-dalsi')).toBe(true);
    expect(isSlovakSlug('vzdelanie-pre-barmanov')).toBe(true);
    expect(isSlovakSlug('letne-trendy-2024')).toBe(true);
    expect(isSlovakSlug('cocktailove-novinky-tohto-roka')).toBe(true);
    expect(isSlovakSlug('vydal-prvu-knihu')).toBe(true);
    expect(isSlovakSlug('21-storocie-koktailov')).toBe(true);
  });

  it('matches bare "nova"/"novu" between hyphens', () => {
    expect(isSlovakSlug('nova-bar')).toBe(true);
    expect(isSlovakSlug('otvoril-novu-bar')).toBe(true);
  });

  it('does NOT false-positive on real English slugs containing similar substrings', () => {
    // Both of these exist in the live WP data — confirmed via the public API.
    expect(
      isSlovakSlug('athens-bar-show-2025-celebrates-15-years-of-innovation'),
    ).toBe(false);
    expect(
      isSlovakSlug('ryan-chetiyawardana-on-innovation-at-silver-lyan'),
    ).toBe(false);
  });

  it('does NOT match other English/global slugs', () => {
    expect(isSlovakSlug('atwater-cocktail-club')).toBe(false);
    expect(isSlovakSlug('zuma-london')).toBe(false);
    expect(isSlovakSlug('medellin-cocktail-week-2026')).toBe(false);
    expect(isSlovakSlug('north-americas-50-best-bars-2026-results')).toBe(false);
    expect(isSlovakSlug('top-10-bars-in-hong-kong-for-2026')).toBe(false);
    // "novato" was a worry for /\bnov[au]\b/ — confirm word boundary holds.
    expect(isSlovakSlug('novato-distillery-feature')).toBe(false);
  });

  it('handles edge cases', () => {
    expect(isSlovakSlug('')).toBe(false);
    expect(isSlovakSlug(undefined as unknown as string)).toBe(false);
  });
});

describe('isWpSystemSlug', () => {
  it('matches all known WP system / placeholder slugs', () => {
    expect(isWpSystemSlug('sample-page')).toBe(true);
    expect(isWpSystemSlug('create-your-website-with-blocks')).toBe(true);
    expect(isWpSystemSlug('frontend-submission')).toBe(true);
    expect(isWpSystemSlug('cart')).toBe(true);
    expect(isWpSystemSlug('shop')).toBe(true);
    expect(isWpSystemSlug('checkout')).toBe(true);
    expect(isWpSystemSlug('my-account')).toBe(true);
    expect(isWpSystemSlug('event-directory')).toBe(true);
  });

  it('is exact-match, not substring', () => {
    // A real article slug containing "cart" or "shop" must not be excluded.
    expect(isWpSystemSlug('cart-this-cocktail-is-trending')).toBe(false);
    expect(isWpSystemSlug('shop-talk-with-bartender')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isWpSystemSlug('Sample-Page')).toBe(true);
    expect(isWpSystemSlug('CART')).toBe(true);
  });
});

describe('isStubPagePendingRebuild', () => {
  it('matches all A1.2 stub pages', () => {
    expect(isStubPagePendingRebuild('about')).toBe(true);
    expect(isStubPagePendingRebuild('contact')).toBe(true);
    expect(isStubPagePendingRebuild('privacy-policy')).toBe(true);
    expect(isStubPagePendingRebuild('categories')).toBe(true);
    expect(isStubPagePendingRebuild('articles')).toBe(true);
    expect(isStubPagePendingRebuild('trending')).toBe(true);
    expect(isStubPagePendingRebuild('most-popular')).toBe(true);
  });

  it('is exact-match, not substring', () => {
    expect(isStubPagePendingRebuild('about-our-2026-awards')).toBe(false);
    expect(isStubPagePendingRebuild('contact-the-editors')).toBe(false);
  });
});

describe('shouldExcludeFromSitemap', () => {
  it('excludes when slug shadows a /bars/{slug} entry', () => {
    const barSlugs = new Set(['atwater-cocktail-club', 'zuma-london']);
    const r = shouldExcludeFromSitemap('atwater-cocktail-club', { barSlugs });
    expect(r.exclude).toBe(true);
    expect(r.reason).toBe('shadows-bar-directory');
  });

  it('keeps a non-bar editorial slug even when barSlugs is provided', () => {
    const barSlugs = new Set(['atwater-cocktail-club']);
    const r = shouldExcludeFromSitemap('medellin-cocktail-week-2026', { barSlugs });
    expect(r.exclude).toBe(false);
    expect(r.reason).toBeNull();
  });

  it('excludes Slovak legacy slugs', () => {
    const r = shouldExcludeFromSitemap('50-najlepsich-barov-sveta');
    expect(r.exclude).toBe(true);
    expect(r.reason).toBe('slovak-legacy');
  });

  it('excludes WP system slugs', () => {
    const r = shouldExcludeFromSitemap('cart');
    expect(r.exclude).toBe(true);
    expect(r.reason).toBe('wp-system');
  });

  it('excludes stub pages pending rebuild (A1.2)', () => {
    const r = shouldExcludeFromSitemap('about');
    expect(r.exclude).toBe(true);
    expect(r.reason).toBe('stub-pending-rebuild');
  });

  it('keeps real editorial article slugs', () => {
    const r = shouldExcludeFromSitemap('medellin-cocktail-week-2026');
    expect(r.exclude).toBe(false);
    expect(r.reason).toBeNull();
  });

  it('treats empty/null slug as excluded', () => {
    expect(shouldExcludeFromSitemap('').exclude).toBe(true);
    expect(shouldExcludeFromSitemap('').reason).toBe('empty');
  });

  it('precedence: bar-shadow wins over Slovak match', () => {
    // Synthetic case: a bar slug that also looks Slovak. The bar-shadow
    // reason should win since /bars/{slug} canonicality is the load-bearing
    // call.
    const barSlugs = new Set(['nova-bar']);
    const r = shouldExcludeFromSitemap('nova-bar', { barSlugs });
    expect(r.exclude).toBe(true);
    expect(r.reason).toBe('shadows-bar-directory');
  });
});
