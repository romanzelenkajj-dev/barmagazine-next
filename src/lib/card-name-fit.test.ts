import { describe, it, expect } from 'vitest';
import { isLongCardName, LONG_NAME_CHARS, LONG_NAME_TOKEN_CHARS } from './card-name-fit';

describe('isLongCardName', () => {
  it('drops a size for the one name in the directory that overflows two lines', () => {
    // Measured in the real 241px card box at 21px: this is the only active
    // bar name of 1,646 that needs a third line.
    expect(isLongCardName('Cause Effect Cocktail Kitchen & Cape Brandy Bar')).toBe(true);
  });

  it('catches the other three names at or above the threshold', () => {
    expect(isLongCardName("Captain Foxheart's Bad News Bar & Spirit Lodge")).toBe(true);
    expect(isLongCardName('Rooftop @ The Social Hub Florence Lavagnini')).toBe(true);
    expect(isLongCardName('Bootlegger Cocktail Bar & Cuisine Montréal')).toBe(true);
  });

  it('leaves ordinary names alone', () => {
    expect(isLongCardName('Connaught Bar')).toBe(false);
    expect(isLongCardName('Double Chicken Please')).toBe(false);
    expect(isLongCardName('Licorería Limantour')).toBe(false);
  });

  it('leaves the two-line names Roman flagged at full size, because they fit', () => {
    // These wrap to two lines and used to sit next to one-line names, which
    // is the raggedness the fixed-height box fixes. They do not overflow, so
    // they must NOT be shrunk as well.
    expect(isLongCardName('BOP (Bartenders of Pony)')).toBe(false);
    expect(isLongCardName('The Cambridge Public House')).toBe(false);
    expect(isLongCardName('Mount Pleasant Vintage & Provisions')).toBe(false);
    expect(isLongCardName('Realm of the 52 Remedies')).toBe(false);
  });

  it('drops a size for one unbreakable token even when the name is short', () => {
    const token = 'A'.repeat(LONG_NAME_TOKEN_CHARS);
    expect(token.length).toBeLessThan(LONG_NAME_CHARS);
    expect(isLongCardName(token)).toBe(true);
  });

  it('ignores surrounding whitespace rather than counting it as length', () => {
    // Short words, so this exercises the length rule and not the token rule.
    const name = 'ab cd '.repeat(6).trim(); // 35 characters
    expect(name.length).toBeLessThan(LONG_NAME_CHARS);
    expect(isLongCardName(name)).toBe(false);
    expect(isLongCardName(`   ${name}   `)).toBe(false);
  });

  it('is exact at the length boundary', () => {
    // Every token here is well under the token limit, so these two cases
    // isolate the length rule instead of tripping the other one.
    const atThreshold = `${'y'.repeat(13)} ${'y'.repeat(13)} ${'y'.repeat(14)}`;
    const oneShort = `${'y'.repeat(13)} ${'y'.repeat(13)} ${'y'.repeat(13)}`;
    expect(atThreshold.length).toBe(LONG_NAME_CHARS);
    expect(oneShort.length).toBe(LONG_NAME_CHARS - 1);
    expect(isLongCardName(atThreshold)).toBe(true);
    expect(isLongCardName(oneShort)).toBe(false);
  });
});
