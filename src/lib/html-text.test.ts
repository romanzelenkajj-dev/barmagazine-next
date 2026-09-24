import { describe, it, expect } from 'vitest';
import { decodeEntities, htmlToText, straightenQuotes } from './html-text';

describe('decodeEntities', () => {
  it('decodes decimal, hex and named entities', () => {
    expect(decodeEntities('Martiny&#8217;s &amp; Co &#x27;x&#x27; &rsquo;')).toBe('Martiny’s & Co \'x\' ’');
  });
  it('leaves unknown entities and bare ampersands alone', () => {
    expect(decodeEntities('Tom &amp; Jerry &unknownthing; &')).toBe('Tom & Jerry &unknownthing; &');
  });
});

describe('straightenQuotes', () => {
  it('turns curly quotes into straight ones', () => {
    expect(straightenQuotes('‘a’ “b”')).toBe('\'a\' "b"');
  });
});

describe('htmlToText', () => {
  const wp = '<p>Takuma Watanabe of Martiny&#8217;s in New York wins the Altos Bartenders&#8217; Bartender Award 2026, voted by peers on The World&#8217;s&hellip;</p>\n';
  it('gives the same plain text wherever it runs (no DOM needed)', () => {
    expect(htmlToText(wp)).toBe("Takuma Watanabe of Martiny's in New York wins the Altos Bartenders' Bartender Award 2026, voted by peers on The World's…");
  });
  it('strips tags and collapses whitespace', () => {
    expect(htmlToText('<p>One</p>\n<p>two   three</p>')).toBe('One two three');
  });
  it('is stable when applied twice to ordinary excerpt text', () => {
    const once = htmlToText(wp);
    expect(htmlToText(once)).toBe(once);
  });
});
