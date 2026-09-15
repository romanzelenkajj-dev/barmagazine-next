import { describe, it, expect } from 'vitest';
import { PRIVATE_BAR_COLUMNS, PUBLIC_EDITORIAL_COLUMNS, stripPrivate, stripPrivateAll } from './private-columns';
import { OWNER_FORBIDDEN_FIELDS } from './owner-fields';

describe('private bar columns', () => {
  it('removes admin_notes and nothing else', () => {
    const row = { slug: 'x', name: 'X', admin_notes: 'ADDRESS FLAG', accolades: [] };
    const out = stripPrivate(row);
    expect(out).toEqual({ slug: 'x', name: 'X', accolades: [] });
    expect('admin_notes' in out).toBe(false);
    expect(row.admin_notes).toBe('ADDRESS FLAG'); // input untouched
  });

  it('returns the same object when nothing private is present', () => {
    const row = { slug: 'x' };
    expect(stripPrivate(row)).toBe(row);
    expect(stripPrivateAll([row, { slug: 'y', admin_notes: 'n' }])).toEqual([{ slug: 'x' }, { slug: 'y' }]);
  });

  it('neighborhood is public by decision: never stripped, never listed private', () => {
    expect(PUBLIC_EDITORIAL_COLUMNS).toContain('neighborhood');
    for (const c of PUBLIC_EDITORIAL_COLUMNS) {
      expect(PRIVATE_BAR_COLUMNS as readonly string[]).not.toContain(c);
    }
    const row = { slug: 'x', neighborhood: 'Shaw', admin_notes: 'n' };
    expect(stripPrivate(row)).toEqual({ slug: 'x', neighborhood: 'Shaw' });
  });

  it('every private column is also forbidden to owners', () => {
    for (const c of PRIVATE_BAR_COLUMNS) {
      expect(OWNER_FORBIDDEN_FIELDS as readonly string[]).toContain(c);
    }
  });
});
