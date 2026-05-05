import { describe, it, expect } from 'vitest';
import {
  CATEGORY_DESCRIPTIONS,
  isNewsArticleCategory,
  truncateHeadline,
} from './article-schema';

describe('CATEGORY_DESCRIPTIONS', () => {
  const expectedSlugs = ['bars', 'people', 'cocktails', 'awards', 'brands', 'events'];

  it('has a description for each of the 6 live WP categories', () => {
    for (const slug of expectedSlugs) {
      expect(CATEGORY_DESCRIPTIONS, `missing description for ${slug}`).toHaveProperty(slug);
    }
  });

  it('every description is 130–160 chars (meta-description shape)', () => {
    for (const slug of expectedSlugs) {
      const d = CATEGORY_DESCRIPTIONS[slug];
      expect(d.length, `${slug}: ${d.length} chars`).toBeGreaterThanOrEqual(130);
      expect(d.length, `${slug}: ${d.length} chars`).toBeLessThanOrEqual(160);
    }
  });

  it('every description mentions BarMagazine exactly once', () => {
    for (const slug of expectedSlugs) {
      const matches = CATEGORY_DESCRIPTIONS[slug].match(/BarMagazine/g) ?? [];
      expect(matches.length, `${slug}: ${matches.length} mentions`).toBe(1);
    }
  });

  it('descriptions are pairwise distinct (no copy-paste)', () => {
    const values = expectedSlugs.map((s) => CATEGORY_DESCRIPTIONS[s]);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe('isNewsArticleCategory', () => {
  it('returns true for events', () => {
    expect(isNewsArticleCategory([{ slug: 'events' }])).toBe(true);
  });

  it('returns true for awards', () => {
    expect(isNewsArticleCategory([{ slug: 'awards' }])).toBe(true);
  });

  it('returns false for cocktails / bars / people / brands (Article, not NewsArticle)', () => {
    expect(isNewsArticleCategory([{ slug: 'cocktails' }])).toBe(false);
    expect(isNewsArticleCategory([{ slug: 'bars' }])).toBe(false);
    expect(isNewsArticleCategory([{ slug: 'people' }])).toBe(false);
    expect(isNewsArticleCategory([{ slug: 'brands' }])).toBe(false);
  });

  it('multi-category: NewsArticle wins (per audit spec)', () => {
    expect(isNewsArticleCategory([{ slug: 'cocktails' }, { slug: 'events' }])).toBe(true);
    expect(isNewsArticleCategory([{ slug: 'people' }, { slug: 'awards' }, { slug: 'bars' }])).toBe(true);
  });

  it('case-insensitive', () => {
    expect(isNewsArticleCategory([{ slug: 'EVENTS' }])).toBe(true);
    expect(isNewsArticleCategory([{ slug: 'Awards' }])).toBe(true);
  });

  it('handles empty / malformed input', () => {
    expect(isNewsArticleCategory([])).toBe(false);
    expect(isNewsArticleCategory([{ slug: '' }])).toBe(false);
    expect(isNewsArticleCategory([{ slug: null }])).toBe(false);
    expect(isNewsArticleCategory([{}])).toBe(false);
  });
});

describe('truncateHeadline', () => {
  it('returns short strings unchanged', () => {
    expect(truncateHeadline('Short headline')).toBe('Short headline');
  });

  it('returns 110-char strings unchanged at the boundary', () => {
    const exactly110 = 'a'.repeat(110);
    expect(truncateHeadline(exactly110)).toBe(exactly110);
  });

  it('breaks at last word boundary when over 110', () => {
    // 12 words of "abc " = 48 chars per group; > 110 with enough words.
    const long =
      'World 50 Best Bars Awards 2026 Live From Hong Kong as the Industry Celebrates a Decade of Cocktail Innovation Today';
    const result = truncateHeadline(long);
    expect(result.length).toBeLessThanOrEqual(110);
    expect(result.endsWith('…')).toBe(true);
    // Ends at a word boundary, not mid-word.
    const trimmedTail = result.slice(0, -1).trimEnd();
    expect(trimmedTail).not.toMatch(/\s$/);
  });

  it('hard-truncates a single oversized word', () => {
    const noSpaces = 'a'.repeat(150);
    const result = truncateHeadline(noSpaces);
    expect(result.length).toBeLessThanOrEqual(110);
    expect(result.endsWith('…')).toBe(true);
  });

  it('honors a custom max', () => {
    const result = truncateHeadline('one two three four five', 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.endsWith('…')).toBe(true);
  });

  it('trims leading/trailing whitespace before measuring', () => {
    expect(truncateHeadline('   short   ')).toBe('short');
  });
});
