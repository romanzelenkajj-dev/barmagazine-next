/**
 * HTML to plain text without a DOM, so the server render and the client
 * hydration agree byte for byte.
 *
 * Task 124: the home category grid decoded WordPress excerpts with a
 * DOM span in the browser (giving real characters such as a curly
 * apostrophe) and with a short replace list on the server (giving a
 * straight one). React then logged "Text content does not match" for
 * every card whose excerpt held an entity. This module is the one
 * decoder for both sides, and it is pure: same input, same output,
 * wherever it runs.
 *
 * Typographic quotes are normalised to straight ones, the way
 * `formatCardTitle` in utils.ts already treats titles, so a card's title
 * and excerpt read the same.
 */
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c',
  hellip: '\u2026', ndash: '\u2013', mdash: '\u2014', laquo: '\u00ab', raquo: '\u00bb',
  eacute: 'é', egrave: 'è', agrave: 'à', aacute: 'á', iacute: 'í',
  oacute: 'ó', uacute: 'ú', ntilde: 'ñ', ccedil: 'ç', uuml: 'ü',
  ouml: 'ö', auml: 'ä', szlig: 'ß', copy: '©', reg: '®', trade: '™',
};

/** Decode numeric (decimal and hex) and common named entities. Unknown ones stay as written. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const hex = entity[1] === 'x' || entity[1] === 'X';
      const codePoint = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) return match;
      try { return String.fromCodePoint(codePoint); } catch { return match; }
    }
    return NAMED[entity.toLowerCase()] ?? match;
  });
}

/** Curly single and double quotes to straight ones. */
export function straightenQuotes(text: string): string {
  return text.replace(/[\u2018\u2019\u201a\u201b]/g, "'").replace(/[\u201c\u201d\u201e\u201f]/g, '"');
}

/** Strip tags, decode entities, straighten quotes, collapse whitespace. */
export function htmlToText(html: string): string {
  return straightenQuotes(decodeEntities(html.replace(/<[^>]*>/g, ''))).replace(/\s+/g, ' ').trim();
}
