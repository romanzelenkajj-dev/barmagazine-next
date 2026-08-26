import { describe, it, expect } from 'vitest';
import { highlightSegments, MAX_BOLD_SPANS } from './highlight';

const boldParts = (text: string) =>
  highlightSegments(text).filter(s => s.bold).map(s => s.text);

const rejoined = (text: string) =>
  highlightSegments(text).map(s => s.text).join('');

describe('highlightSegments', () => {
  it('never alters the text itself — segments rejoin to the input', () => {
    const t = "Ranked on World's 50 Best Bars, run by bar director Maura Milia.";
    expect(rejoined(t)).toBe(t);
  });

  it('bolds fixed phrases case-insensitively', () => {
    expect(boldParts("praised by the world's 50 best bars jury")).toEqual([
      "world's 50 best bars",
    ]);
    expect(boldParts('a Michelin-starred kitchen')).toEqual(['Michelin']);
  });

  it('is word-boundary safe', () => {
    // "michelin" inside another word must not match.
    expect(boldParts('the Michelins of this world are unmoved')).toEqual([]);
    expect(boldParts('ownership changed twice')).toEqual([]);
  });

  it('bolds only the name after a role title, not the role', () => {
    const parts = boldParts('led by head bartender Giacomo Giannotti since 2019');
    expect(parts).toEqual(['Giacomo Giannotti']);
  });

  it('captures the full name when punctuation follows the surname', () => {
    expect(boldParts('chef-co-founder David Barzelay, the team behind Lazy Bear')).toEqual([
      'David Barzelay',
    ]);
    expect(boldParts('run by founder Monica Berg.')).toEqual(['Monica Berg']);
  });

  it('handles multi-word roles, plurals and hyphenated names', () => {
    expect(boldParts('executive bar manager Anna Sebastian')).toEqual(['Anna Sebastian']);
    expect(boldParts('founders Alex Kratena and Monica Berg')).toEqual(['Alex Kratena']);
    expect(boldParts("co-founder Jean-Luc O'Brien")).toEqual(["Jean-Luc O'Brien"]);
  });

  it('does not bold lowercase words after a role', () => {
    expect(boldParts('the owner also runs a wine shop')).toEqual([]);
  });

  it('caps at MAX_BOLD_SPANS in reading order', () => {
    const t =
      "Tales of the Cocktail winner, on World's 50 Best Bars and Asia's 50 Best Bars, " +
      'a Michelin room with a James Beard pedigree.';
    const parts = boldParts(t);
    expect(parts).toHaveLength(MAX_BOLD_SPANS);
    expect(parts[0]).toBe('Tales of the Cocktail');
    expect(parts).not.toContain('James Beard');
  });

  it('drops overlapping spans instead of nesting them', () => {
    // "Spirited Awards" sits inside "Tales of the Cocktail Spirited Awards"?
    // The phrases are separate list entries; adjacent matches must not overlap.
    const t = 'won at the Tales of the Cocktail Spirited Awards last year';
    const parts = boldParts(t);
    expect(parts).toEqual(['Tales of the Cocktail', 'Spirited Awards']);
  });

  it('returns a single plain segment when nothing matches', () => {
    expect(highlightSegments('a quiet neighbourhood bar')).toEqual([
      { text: 'a quiet neighbourhood bar', bold: false },
    ]);
  });

  it('handles empty input', () => {
    expect(highlightSegments('')).toEqual([]);
  });
});
