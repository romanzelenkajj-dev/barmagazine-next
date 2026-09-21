import { describe, it, expect } from 'vitest';
import { venueTypeConcern, hasAccolade, holdMessage } from './venue-type-guard.mjs';

describe('venueTypeConcern', () => {
  it('holds the two rows that actually got in this way', () => {
    // Both are real James Beard "Outstanding Bar" 2026 winners, and neither
    // is a cocktail bar. This is the case the guard exists for.
    const onyx = venueTypeConcern({ name: 'Onyx Coffee Lab', city: 'Rogers' });
    expect(onyx?.reason).toBe('a coffee roaster or coffee house');
    const bow = venueTypeConcern({ name: 'Bow & Arrow Brewing Co.', city: 'Albuquerque' });
    expect(bow?.reason).toBe('a brewery');
  });

  it('holds a jeweller, which is how Bijoux got in', () => {
    expect(venueTypeConcern({ name: 'Bijoux Jewellers' })?.reason).toBe('a jeweller');
  });

  it('lets ordinary bars through', () => {
    for (const name of [
      'Bar Nouveau', 'The American Bar', 'Coa', 'Jigger & Pony',
      'Tres Monos', 'Vänster at Häktet', 'Radio Bar', 'Attaboy',
    ]) {
      expect(venueTypeConcern({ name, type: 'Cocktail Bar' }), name).toBeNull();
    }
  });

  it('does NOT hold a listed bar type just because its description mentions one', () => {
    // A cocktail bar that roasts its own coffee, or sits next to a brewery,
    // is still a cocktail bar. The type settles it.
    const row = {
      name: 'Some Bar',
      type: 'Cocktail Bar',
      description: 'Beside the old brewery, with coffee roasted in house.',
    };
    expect(venueTypeConcern(row)).toBeNull();
  });

  it('DOES consult the description when the type is not one we list', () => {
    const row = { name: 'Some Place', type: '', description: 'A brewpub with forty taps.' };
    expect(venueTypeConcern(row)?.reason).toBe('a brewery');
  });

  it('is unbothered by junk input', () => {
    for (const bad of [null, undefined, {}, { name: 42 }]) {
      expect(venueTypeConcern(bad)).toBeNull();
    }
  });
});

describe('the held message', () => {
  it('names the matched word and refuses to drop the row', () => {
    const row = { name: 'Onyx Coffee Lab', accolades: [{ org: 'James Beard Awards', year: 2026 }] };
    const msg = holdMessage('onyx-coffee-lab', venueTypeConcern(row), row);
    expect(hasAccolade(row)).toBe(true);
    expect(msg).toContain('Coffee Lab');
    expect(msg).toContain('an award is not an admission rule');
    // The whole point: held, not dropped.
    expect(msg).toContain('NOT inserted and NOT dropped');
  });

  it('says something different when no award is involved', () => {
    const row = { name: 'Some Brewery' };
    const msg = holdMessage('some-brewery', venueTypeConcern(row), row);
    expect(msg).toContain('Nothing admitted it except this wave');
  });
});
