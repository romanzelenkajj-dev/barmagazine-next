import { describe, it, expect } from 'vitest';
import { barSlug } from './bar-slug';

describe('barSlug (task 127: no leading hyphen from non-Latin names)', () => {
  it('keeps the Latin part of a mixed name and never leads with a hyphen', () => {
    expect(barSlug('庙前三酉 SanYou', 'Guangzhou')).toEqual({ slug: 'sanyou', withCity: 'sanyou-guangzhou' });
    expect(barSlug('バー 本丸 Honmaru', 'Tokyo').slug).toBe('honmaru');
    expect(barSlug('Бар Стрелка Strelka', 'Moscow').slug).toBe('strelka');
  });

  it('falls back to the city when the name has no Latin letter or digit', () => {
    expect(barSlug('庙前三酉', 'Guangzhou')).toEqual({ slug: 'bar-guangzhou', withCity: 'guangzhou-bar' });
    expect(barSlug('', 'São Paulo').slug).toBe('bar-sao-paulo');
  });

  it('transliterates accents and strips punctuation like before', () => {
    expect(barSlug("Bourke's", 'Hong Kong')).toEqual({ slug: 'bourkes', withCity: 'bourkes-hong-kong' });
    expect(barSlug('Florería Atlántico', 'Buenos Aires').slug).toBe('floreria-atlantico');
    expect(barSlug('  The Loft  ', 'Prague').slug).toBe('the-loft');
  });

  for (const [name, city] of [['庙前三酉 SanYou', 'Guangzhou'], ['---', 'Oslo'], ['!!!', ''], ['東京', '東京']]) {
    it(`never returns an empty slug or a leading/trailing hyphen for ${JSON.stringify(name)}`, () => {
      const { slug, withCity } = barSlug(name, city);
      for (const s of [slug, withCity]) {
        expect(s.length).toBeGreaterThan(0);
        expect(s.startsWith('-')).toBe(false);
        expect(s.endsWith('-')).toBe(false);
        expect(/^[a-z0-9-]+$/.test(s)).toBe(true);
      }
    });
  }
});
