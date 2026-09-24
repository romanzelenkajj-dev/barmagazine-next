import { describe, it, expect } from 'vitest';
import { toUrlSlug } from './utils';

describe('toUrlSlug', () => {
  it('transliterates accented letters as before', () => {
    expect(toUrlSlug('São Paulo')).toBe('sao-paulo');
    expect(toUrlSlug('Gdańsk')).toBe('gdansk');
    expect(toUrlSlug('Genève')).toBe('geneve');
  });

  it('transliterates letters NFD cannot split (task 130: Wrocław was wroc-aw)', () => {
    expect(toUrlSlug('Wrocław')).toBe('wroclaw');
    expect(toUrlSlug('Łódź')).toBe('lodz');
    expect(toUrlSlug('Tromsø')).toBe('tromso');
    expect(toUrlSlug('Düsseldorf Straße')).toBe('dusseldorf-strasse');
    expect(toUrlSlug('Diyarbakır')).toBe('diyarbakir');
    expect(toUrlSlug('Split')).toBe('split');
  });
});
