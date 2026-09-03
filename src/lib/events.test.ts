import { describe, it, expect } from 'vitest';
import { upcomingEvents } from './events';

describe('upcomingEvents drop-off', () => {
  it('lists an event through the whole of its end date', () => {
    // Margarita Mile ends 2026-09-16; late evening Hong Kong time on the 16th
    // it must still be listed (the closing party is that night).
    const partyTime = new Date('2026-09-16T15:00:00Z'); // 23:00 in Hong Kong
    expect(upcomingEvents(partyTime).some(e => e.slug === 'margarita-mile-hong-kong-2026')).toBe(true);
  });

  it('drops an event after its end date has passed everywhere', () => {
    const wellAfter = new Date('2026-09-18T00:00:00Z');
    expect(upcomingEvents(wellAfter).some(e => e.slug === 'margarita-mile-hong-kong-2026')).toBe(false);
  });
});
