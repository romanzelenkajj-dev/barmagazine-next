import { describe, it, expect } from 'vitest';
import { escapeHtml, fieldRows } from './notify';

describe('notify', () => {
  describe('escapeHtml', () => {
    it('escapes the characters that would inject markup', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      );
      expect(escapeHtml(`"quoted" & 'single'`)).toBe(
        '&quot;quoted&quot; &amp; &#39;single&#39;'
      );
    });

    it('renders null and undefined as empty rather than "null"', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('escapes & first so entities are not double-broken', () => {
      expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
    });
  });

  describe('fieldRows', () => {
    it('escapes owner-supplied values', () => {
      const html = fieldRows({ website: '<img src=x onerror=alert(1)>' });
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img');
    });

    it('summarises arrays by count instead of dumping every URL', () => {
      expect(fieldRows({ photos: ['a.jpg', 'b.jpg', 'c.jpg'] })).toContain('3 items');
      expect(fieldRows({ photos: ['only.jpg'] })).toContain('1 item');
    });

    it('truncates very long values', () => {
      const html = fieldRows({ opening_hours: 'x'.repeat(500) });
      expect(html).toContain('…');
      expect(html.length).toBeLessThan(500 + 300);
    });

    it('renders one row per field', () => {
      const html = fieldRows({ phone: '+34 900', website: 'https://example.com' });
      expect(html.match(/<tr/g)?.length).toBe(2);
    });

    it('handles an empty field set', () => {
      expect(fieldRows({})).toBe('');
    });
  });
});
