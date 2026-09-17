import { describe, it, expect } from 'vitest';
import {
  barStatus, isOpen, isClosed, isTemporarilyClosed, isPermanentlyClosed,
  statusPill, statusNotice, closedLast,
} from './bar-status';

describe('bar status', () => {
  it('defaults to open, so it is inert until the column exists', () => {
    expect(barStatus(undefined)).toBe('open');
    expect(barStatus(null)).toBe('open');
    expect(barStatus({})).toBe('open');
    expect(barStatus({ status: null })).toBe('open');
    expect(isOpen({})).toBe(true);
  });

  it('never throws on a value it does not know', () => {
    expect(barStatus({ status: 'renovating' })).toBe('open');
    expect(barStatus({ status: '' })).toBe('open');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(barStatus({ status: 42 as any })).toBe('open');
  });

  it('reads the three real values, case and space insensitive', () => {
    expect(barStatus({ status: 'temporarily_closed' })).toBe('temporarily_closed');
    expect(barStatus({ status: ' Permanently_Closed ' })).toBe('permanently_closed');
    expect(isTemporarilyClosed({ status: 'temporarily_closed' })).toBe(true);
    expect(isPermanentlyClosed({ status: 'permanently_closed' })).toBe(true);
    expect(isClosed({ status: 'temporarily_closed' })).toBe(true);
    expect(isClosed({ status: 'open' })).toBe(false);
  });

  it('gives a pill only when the bar is not open', () => {
    expect(statusPill({})).toBe('');
    expect(statusPill({ status: 'temporarily_closed' })).toBe('Temporarily closed');
    expect(statusPill({ status: 'permanently_closed' })).toBe('Permanently closed');
  });

  it('prefers the stored reason in the notice, and always has a fallback', () => {
    expect(statusNotice({})).toBeNull();
    expect(statusNotice({ status: 'temporarily_closed', status_note: 'Closed after a fire in May 2026.' }))
      .toEqual({ heading: 'Temporarily closed', body: 'Closed after a fire in May 2026.' });
    const bare = statusNotice({ status: 'temporarily_closed' });
    expect(bare?.heading).toBe('Temporarily closed');
    expect(bare?.body.length).toBeGreaterThan(10);
  });

  it('sorts closed bars last without touching any score', () => {
    expect(closedLast({ status: 'open' })).toBe(0);
    expect(closedLast({})).toBe(0);
    expect(closedLast({ status: 'temporarily_closed' })).toBe(1);
    expect(closedLast({ status: 'permanently_closed' })).toBe(1);
  });
});
