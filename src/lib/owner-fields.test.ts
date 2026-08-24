import { describe, it, expect } from 'vitest';
import {
  filterOwnerFields,
  buildOwnerBarUpdate,
  OWNER_EDITABLE_FIELDS,
  OWNER_FORBIDDEN_FIELDS,
} from './owner-fields';

describe('owner-fields', () => {
  describe('filterOwnerFields', () => {
    it('keeps every field an owner is allowed to edit', () => {
      const input = Object.fromEntries(OWNER_EDITABLE_FIELDS.map(f => [f, 'x']));
      const { allowed, rejected } = filterOwnerFields(input);
      expect(Object.keys(allowed).sort()).toEqual([...OWNER_EDITABLE_FIELDS].sort());
      expect(rejected).toEqual([]);
    });

    it('drops every forbidden field and reports it', () => {
      const input = Object.fromEntries(OWNER_FORBIDDEN_FIELDS.map(f => [f, 'x']));
      const { allowed, rejected } = filterOwnerFields(input);
      expect(allowed).toEqual({});
      expect(rejected.sort()).toEqual([...OWNER_FORBIDDEN_FIELDS].sort());
    });

    it('separates allowed from forbidden in a mixed payload', () => {
      const { allowed, rejected } = filterOwnerFields({
        phone: '+34 900 000 000',
        tier: 'premium',
        description: 'the best bar in Madrid',
        opening_hours: 'Tue-Sun 18:00-02:00',
      });
      expect(allowed).toEqual({
        phone: '+34 900 000 000',
        opening_hours: 'Tue-Sun 18:00-02:00',
      });
      expect(rejected.sort()).toEqual(['description', 'tier']);
    });

    it('drops unknown keys, so a column added to bars later is closed by default', () => {
      const { allowed, rejected } = filterOwnerFields({ some_new_column: 1 });
      expect(allowed).toEqual({});
      expect(rejected).toEqual(['some_new_column']);
    });

    it('maps the photo route’s gallery_images onto the photos column', () => {
      const { allowed, rejected } = filterOwnerFields({ gallery_images: ['a.jpg', 'b.jpg'] });
      expect(allowed).toEqual({ photos: ['a.jpg', 'b.jpg'] });
      expect(rejected).toEqual([]);
    });

    it('is not fooled by a prototype-polluting key', () => {
      const { allowed } = filterOwnerFields(JSON.parse('{"__proto__":{"tier":"premium"}}'));
      expect(allowed).toEqual({});
      expect(({} as Record<string, unknown>).tier).toBeUndefined();
    });

    it('returns empty for non-object input rather than throwing', () => {
      for (const bad of [null, undefined, 'string', 42, ['array']]) {
        expect(filterOwnerFields(bad)).toEqual({ allowed: {}, rejected: [] });
      }
    });

    it('allowlist and forbidden list do not overlap', () => {
      const overlap = OWNER_EDITABLE_FIELDS.filter(f =>
        (OWNER_FORBIDDEN_FIELDS as readonly string[]).includes(f)
      );
      expect(overlap).toEqual([]);
    });
  });

  describe('buildOwnerBarUpdate', () => {
    it('strips forbidden keys stored on an older submission row', () => {
      // The approve path spreads this into bars.update(); a row written before
      // submission-side filtering shipped must still not be able to set tier.
      const update = buildOwnerBarUpdate({
        website: 'https://example.com',
        tier: 'premium',
        is_active: false,
        name: 'Renamed Bar',
      });
      expect(update).toEqual({ website: 'https://example.com' });
    });

    it('returns an empty object when nothing is permitted', () => {
      expect(buildOwnerBarUpdate({ description: 'x' })).toEqual({});
    });
  });
});
