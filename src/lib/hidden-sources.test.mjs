import { describe, it, expect } from 'vitest';
import { visitorCopyViolation, rowCopyViolation } from './hidden-sources.mjs';

describe('the two descriptions that actually shipped', () => {
  it('catches the Seiberts one, by name AND by score', () => {
    const v = visitorCopyViolation(
      "The bar cites first place in the Falstaff Barguide 2025/26 with 98 points and a Mixology Bar Awards 2025 Top 10 listing.",
    );
    expect(v?.kind).toBe('hidden-source');
    expect(v?.matched.toLowerCase()).toContain('falstaff');
  });

  it('catches the Tür 7 one', () => {
    const v = visitorCopyViolation('It was named American Bar of the Year in the Falstaff Bar Guide 2026.');
    expect(v?.kind).toBe('hidden-source');
  });

  it('passes the repaired versions', () => {
    expect(visitorCopyViolation(
      "Volker Seibert's temple to the classic cocktail in Cologne. It holds a Mixology Bar Awards 2025 Top 10 listing.",
    )).toBeNull();
    expect(visitorCopyViolation(
      "A speakeasy-style boutique bar in Vienna's 8th district, entered by ringing the doorbell of an unmarked door.",
    )).toBeNull();
  });
});

describe('the score is the same leak wearing a hat', () => {
  it('refuses a points score even with the name removed', () => {
    // Dropping "Falstaff" and keeping "98 points" still tells the reader
    // which guide, to anyone who knows the guide.
    const v = visitorCopyViolation('It took first place in the 2026 guide with 98 points.');
    expect(v?.kind).toBe('score');
    expect(v?.what).toContain('points');
  });

  it('refuses a glasses rating, spelled or numeric', () => {
    expect(visitorCopyViolation('Awarded four glasses.')?.kind).toBe('score');
    expect(visitorCopyViolation('A 4 glass bar.')?.kind).toBe('score');
  });

  it('refuses a bar-guide year, which names the source obliquely', () => {
    expect(visitorCopyViolation('Listed in the Bar Guide 2026.')?.kind).toBe('score');
  });

  it('leaves ordinary copy alone', () => {
    for (const ok of [
      'A dark, mid-century living room with no fixed menu.',
      'No. 25 on the World’s 50 Best Bars 2025.',
      'Three floors of agave, a taqueria at street level.',
      'Open since 1893, the longest-surviving cocktail bar in London.',
      'Raki is treated as a base spirit rather than a curiosity.',
    ]) {
      expect(visitorCopyViolation(ok), ok).toBeNull();
    }
  });

  it('is unbothered by junk', () => {
    for (const bad of [null, undefined, 42, '', {}]) expect(visitorCopyViolation(bad)).toBeNull();
  });
});

describe('rowCopyViolation checks every visitor-facing field', () => {
  it('finds it wherever it hides', () => {
    expect(rowCopyViolation({ name: 'Falstaff Bar' })?.field).toBe('name');
    expect(rowCopyViolation({ description: 'ok', short_excerpt: 'Falstaff pick' })?.field).toBe('short_excerpt');
    expect(rowCopyViolation({ specials: 'Happy hour, 98 points' })?.field).toBe('specials');
  });

  it('does NOT check admin_notes, which is internal and SHOULD record the source', () => {
    expect(rowCopyViolation({ admin_notes: 'Admitted from the Falstaff guide', description: 'A bar.' })).toBeNull();
  });

  it('passes a clean row', () => {
    expect(rowCopyViolation({
      name: 'Little Link',
      description: 'A Cologne bar on Maastrichter Strasse.',
      short_excerpt: 'Maastrichter Strasse, Cologne.',
    })).toBeNull();
  });
});
