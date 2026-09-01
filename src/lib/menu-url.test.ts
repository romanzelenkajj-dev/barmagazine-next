import { describe, it, expect } from 'vitest';
import { isSearchOrMapsUrl, menuDomainDiffers } from './menu-url';

describe('isSearchOrMapsUrl', () => {
  it('rejects the URL Apothéke actually pasted (google search results)', () => {
    expect(isSearchOrMapsUrl('https://www.google.com/search?q=apotheke+la+menu')).toBe(true);
  });
  it('rejects google maps in every shape', () => {
    expect(isSearchOrMapsUrl('https://www.google.com/maps/place/Apotheke')).toBe(true);
    expect(isSearchOrMapsUrl('https://maps.google.com/?cid=123')).toBe(true);
    expect(isSearchOrMapsUrl('https://maps.app.goo.gl/abc123')).toBe(true);
  });
  it('rejects google ccTLDs and other engines', () => {
    expect(isSearchOrMapsUrl('https://www.google.co.uk/search?q=menu')).toBe(true);
    expect(isSearchOrMapsUrl('https://www.bing.com/search?q=menu')).toBe(true);
    expect(isSearchOrMapsUrl('https://duckduckgo.com/?q=menu')).toBe(true);
  });
  it('accepts real menu pages, including scheme-less input', () => {
    expect(isSearchOrMapsUrl('https://apothekela.com/menu')).toBe(false);
    expect(isSearchOrMapsUrl('apothekela.com/menu')).toBe(false);
    expect(isSearchOrMapsUrl('')).toBe(false);
  });
  it('does not flag domains merely containing an engine name', () => {
    expect(isSearchOrMapsUrl('https://binghamptonbar.com/menu')).toBe(false);
    expect(isSearchOrMapsUrl('https://googlybar.com/search-our-menu')).toBe(false);
  });
});

describe('menuDomainDiffers', () => {
  it('matches same domain, www and subdomains', () => {
    expect(menuDomainDiffers('https://apothekela.com/menu', 'https://www.apothekela.com')).toBe(false);
    expect(menuDomainDiffers('https://menu.apothekela.com', 'https://apothekela.com')).toBe(false);
  });
  it('flags a genuinely different host', () => {
    expect(menuDomainDiffers('https://linktr.ee/apotheke', 'https://apothekela.com')).toBe(true);
  });
  it('never fires on empty or unparseable values', () => {
    expect(menuDomainDiffers('https://linktr.ee/apotheke', '')).toBe(false);
    expect(menuDomainDiffers('', 'https://apothekela.com')).toBe(false);
  });
});
