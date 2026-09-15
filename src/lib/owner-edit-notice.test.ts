import { describe, it, expect } from 'vitest';
import {
  batchFor,
  hasNewerThan,
  describeField,
  fieldLabels,
  composeOwnerEditNotice,
  CHAIN_GAP_MS,
  type SubmissionRow,
} from './owner-edit-notice';

const T0 = Date.parse('2026-09-15T20:40:00Z');
function row(id: string, offsetMs: number, data: Record<string, unknown>, extra: Partial<SubmissionRow> = {}): SubmissionRow {
  return {
    id,
    status: 'pending',
    submission_type: 'gallery_images' in data ? 'photo_upload' : 'info_update',
    submitted_data: data,
    created_at: new Date(T0 + offsetMs).toISOString(),
    ...extra,
  };
}

const HOLIDAY = { name: 'Holiday', city: 'Austin', country: 'United States', state: 'TX' };

describe('batchFor', () => {
  it('a lone row is its own batch', () => {
    const a = row('a', 0, { phone: '1' });
    expect(batchFor([a], 'a').map(r => r.id)).toEqual(['a']);
  });

  it('chains rows less than CHAIN_GAP_MS apart, newest first, back from the anchor', () => {
    const a = row('a', 0, { opening_hours: 'x' });
    const b = row('b', 16_000, { gallery_images: ['u'] });
    const c = row('c', 70_000, { phone: '1' });
    expect(batchFor([a, c, b], 'c').map(r => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('stops at a gap of CHAIN_GAP_MS or more', () => {
    const a = row('a', 0, { phone: '1' });
    const b = row('b', CHAIN_GAP_MS, { phone: '2' });
    expect(batchFor([a, b], 'b').map(r => r.id)).toEqual(['b']);
  });

  it('never includes rows newer than the anchor', () => {
    const a = row('a', 0, { phone: '1' });
    const b = row('b', 10_000, { phone: '2' });
    expect(batchFor([a, b], 'a').map(r => r.id)).toEqual(['a']);
  });

  it('is empty when the anchor is gone', () => {
    expect(batchFor([row('a', 0, {})], 'zz')).toEqual([]);
  });
});

describe('hasNewerThan', () => {
  it('sees a newer row', () => {
    const rows = [row('a', 0, {}), row('b', 5_000, {})];
    expect(hasNewerThan(rows, 'a')).toBe(true);
    expect(hasNewerThan(rows, 'b')).toBe(false);
  });
  it('is false for an unknown anchor', () => {
    expect(hasNewerThan([row('a', 0, {})], 'zz')).toBe(false);
  });
});

describe('describeField', () => {
  it('counts photos and lists the urls', () => {
    expect(describeField('gallery_images', ['https://x/1.jpg'])).toEqual(['Photos: 1 photo', '  https://x/1.jpg']);
    expect(describeField('gallery_images', ['a', 'b'])[0]).toBe('Photos: 2 photos');
  });
  it('labels a plain value and collapses whitespace', () => {
    expect(describeField('opening_hours', 'Mon  5pm\n\nTue 5pm')).toEqual(['Opening hours: Mon 5pm Tue 5pm']);
  });
  it('marks a cleared value and truncates a long one', () => {
    expect(describeField('website', '')).toEqual(['Website: (cleared)']);
    const long = 'x'.repeat(400);
    expect(describeField('address', long)[0].endsWith('(truncated)')).toBe(true);
  });
  it('falls back to the raw key for an unknown field', () => {
    expect(describeField('foo', 1)).toEqual(['foo: 1']);
  });
});

describe('composeOwnerEditNotice', () => {
  it('one submission: subject names the field, body has place, owner, value, link', () => {
    const rows = [row('a', 0, { opening_hours: 'Daily 5pm to 2am' })];
    const { subject, text } = composeOwnerEditNotice({ bar: HOLIDAY, ownerEmail: 'hello@holidayon7th.com', rows });
    expect(subject).toBe('Edit to approve: Holiday (Opening hours)');
    expect(text).toContain('Bar: Holiday, Austin, Texas');
    expect(text).toContain('Owner: hello@holidayon7th.com');
    expect(text).toContain('Opening hours: Daily 5pm to 2am');
    expect(text).toContain('Submitted: Sep 15, 2026, 1:40 PM PT');
    expect(text).toContain('https://barmagazine.com/admin/review?tab=edits');
    expect(text).not.toContain('—');
  });

  it('a batch: fields in the subject in submission order, both listed, count line', () => {
    const rows = batchFor(
      [row('a', 0, { opening_hours: 'x' }), row('b', 16_000, { gallery_images: ['https://x/1.jpg'] })],
      'b'
    );
    const { subject, text } = composeOwnerEditNotice({ bar: HOLIDAY, ownerEmail: 'o@x', rows });
    expect(subject).toBe('Edit to approve: Holiday (Opening hours, Photos)');
    expect(text).toContain('2 submissions within a minute');
    expect(text.indexOf('Opening hours: x')).toBeLessThan(text.indexOf('Photos: 1 photo'));
  });

  it('repeats a label once and notes dropped keys and a non-pending row', () => {
    const rows = batchFor(
      [row('a', 0, { phone: '1' }), row('b', 1_000, { phone: '2' }, { status: 'approved' })],
      'b'
    );
    const { subject, text } = composeOwnerEditNotice({ bar: HOLIDAY, ownerEmail: 'o@x', rows, rejected: ['description'] });
    expect(subject).toBe('Edit to approve: Holiday (Phone)');
    expect(text).toContain('(already approved)');
    expect(text).toContain('Dropped by the field allowlist: description');
  });

  it('fieldLabels keeps first-appearance order across the batch', () => {
    expect(fieldLabels(batchFor([row('a', 0, { website: 'w', phone: 'p' }), row('b', 500, { phone: 'q' })], 'b')))
      .toEqual(['Website', 'Phone']);
  });
});
