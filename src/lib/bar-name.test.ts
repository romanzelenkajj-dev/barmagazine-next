import { describe, it, expect } from 'vitest';
import { flagBarName } from './bar-name';

describe('flagBarName', () => {
  describe('appended city', () => {
    it('flags a city glued to the end of the name', () => {
      const f = flagBarName('Kura Stockholm', 'Stockholm', 'Cocktail Bar');
      expect(f?.kind).toBe('city');
      expect(f?.suffix).toBe('Stockholm');
    });

    it('flags regardless of the separator an aggregator used', () => {
      expect(flagBarName('Bar Maaya | Toronto', 'Toronto')?.kind).toBe('city');
      expect(flagBarName('ABSTRCT BAR - JAKARTA', 'Jakarta')?.kind).toBe('city');
    });

    it('does not flag a city that is not this bar’s city', () => {
      // Harry's New York Bar is in Paris; "New York" is part of the name.
      expect(flagBarName("Harry's New York Bar", 'Paris')).toBeNull();
    });

    it('does not flag when the name IS the city', () => {
      expect(flagBarName('Shanghai', 'Shanghai')).toBeNull();
    });
  });

  describe('appended venue type', () => {
    it('flags a type suffix and says so when it repeats the type field', () => {
      const f = flagBarName('Alenka Cocktail bar', 'Prague', 'Cocktail Bar');
      expect(f?.kind).toBe('type');
      expect(f?.suffix).toBe('cocktail bar');
      expect(f?.message).toContain('repeats');
    });

    it('prefers the longest matching suffix', () => {
      expect(flagBarName('De Tiger Bar - a Far East Speakeasy')?.suffix).toBe('speakeasy');
      expect(flagBarName('Some Place Speakeasy Bar')?.suffix).toBe('speakeasy bar');
    });

    it('never flags a name that is only the type', () => {
      // These are whole names, not a name plus a label.
      expect(flagBarName('The Cocktail Club', 'Jakarta')).toBeNull();
      expect(flagBarName('Cocktail Bar', 'Tokyo')).toBeNull();
    });

    it('flags genuine names too, because only the venue can settle it', () => {
      // Deliberate: "Experimental Cocktail Club" really is the venue's name,
      // but the detector cannot know that, so it raises a hand for a human
      // rather than rewriting. The message says as much.
      const f = flagBarName('Experimental Cocktail Club', 'Paris');
      expect(f?.kind).toBe('type');
      expect(f?.message).toContain('only strip it if the venue does not use it');
    });
  });

  it('passes clean names through', () => {
    expect(flagBarName('Connaught Bar', 'London', 'Cocktail Bar')).toBeNull();
    expect(flagBarName('Bar Leone', 'Hong Kong')).toBeNull();
    expect(flagBarName('Sips', 'Barcelona')).toBeNull();
  });

  it('is safe on junk input', () => {
    expect(flagBarName(null)).toBeNull();
    expect(flagBarName('')).toBeNull();
    expect(flagBarName('   ')).toBeNull();
    expect(flagBarName(42 as unknown)).toBeNull();
  });
});
