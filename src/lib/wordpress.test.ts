import { describe, it, expect } from 'vitest';
import { TOP10_SLUG_RE, rankTop10Series } from './wordpress';

const post = (slug: string, date: string, rendered: string) => ({
  slug,
  date,
  title: { rendered },
});

describe('TOP10_SLUG_RE', () => {
  it('matches real Top-10-series slugs', () => {
    for (const s of [
      'top-10-bars-in-new-york-2026',
      'top-10-bars-in-hong-kong-2025',
      'top-10-bars-in-london-2026',
      'top-10-bars-in-dubai-2025',
      'top-10-bars-in-buenos-aires-2027',
    ]) {
      expect(TOP10_SLUG_RE.test(s), s).toBe(true);
    }
  });

  it('rejects non-series slugs', () => {
    for (const s of [
      'how-to-price-a-cocktail',
      'top-10-bars-in-london',          // no year
      'top-10-cocktails-in-london-2026', // not "bars"
      'best-bars-in-new-york-2026',      // wrong prefix
      'top-10-bars-in-2026',             // no city segment
      'top-10-bars-in-london-26',        // 2-digit year
    ]) {
      expect(TOP10_SLUG_RE.test(s), s).toBe(false);
    }
  });
});

describe('rankTop10Series', () => {
  it('newest post becomes featured; rest are series in date DESC', () => {
    const { featured, series } = rankTop10Series([
      post('top-10-bars-in-dubai-2025', '2025-06-01T00:00:00', 'Top 10 Bars in Dubai 2025'),
      post('top-10-bars-in-london-2026', '2026-05-15T00:00:00', 'Top 10 Bars in London 2026'),
      post('top-10-bars-in-hong-kong-2025', '2025-09-01T00:00:00', 'Top 10 Bars in Hong Kong 2025'),
    ]);
    expect(featured?.slug).toBe('top-10-bars-in-london-2026');
    expect(featured?.url).toBe('https://barmagazine.com/top-10-bars-in-london-2026');
    expect(series.map((s) => s.slug)).toEqual([
      'top-10-bars-in-hong-kong-2025',
      'top-10-bars-in-dubai-2025',
    ]);
  });

  it('filters out posts whose slug is not a Top-10-series slug', () => {
    const { featured, series } = rankTop10Series([
      post('how-to-price-a-cocktail', '2026-05-20T00:00:00', 'How to Price a Cocktail'),
      post('top-10-bars-in-london-2026', '2026-05-15T00:00:00', 'Top 10 Bars in London 2026'),
    ]);
    expect(featured?.slug).toBe('top-10-bars-in-london-2026');
    expect(series).toHaveLength(0);
  });

  it('caps the series list (featured excluded from the cap)', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      post(`top-10-bars-in-city${i}-20${10 + i}`, `20${10 + i}-01-01T00:00:00`, `City ${i}`),
    );
    const { featured, series } = rankTop10Series(many, 6);
    expect(featured?.slug).toBe('top-10-bars-in-city11-2021'); // newest year
    expect(series).toHaveLength(6);
  });

  it('decodes HTML entities in titles via stripHtml', () => {
    const { featured } = rankTop10Series([
      post('top-10-bars-in-hong-kong-2026', '2026-01-01T00:00:00', 'Top 10 Bars in Hong Kong &amp; Macau 2026'),
    ]);
    expect(featured?.title).toBe('Top 10 Bars in Hong Kong & Macau 2026');
  });

  it('returns empty result for no matching posts (WP-down resilience)', () => {
    expect(rankTop10Series([])).toEqual({ featured: null, series: [] });
    expect(rankTop10Series([post('unrelated', '2026-01-01', 'x')])).toEqual({
      featured: null,
      series: [],
    });
  });
});
