import { describe, it, expect } from 'vitest';
import { formatHours, formatHoursForCountry, hoursFormatForCountry, classifyHours } from './format-hours';

describe('format-hours', () => {
  describe('to 24h', () => {
    it('converts the house 12-hour patterns', () => {
      expect(formatHours('Daily 6pm-2am', '24h')).toBe('Daily 18:00-02:00');
      expect(formatHours('Daily 5pm-12am (kitchen until 11pm)', '24h')).toBe(
        'Daily 17:00-00:00 (kitchen until 23:00)'
      );
      expect(formatHours('Mon-Sat 11:30am-1am, Sun closed', '24h')).toBe(
        'Mon-Sat 11:30-01:00, Sun closed'
      );
    });

    it('handles noon, midnight and 12 o clock edge cases', () => {
      expect(formatHours('Daily noon-midnight', '24h')).toBe('Daily 12:00-00:00');
      expect(formatHours('Sun 12pm-12am', '24h')).toBe('Sun 12:00-00:00');
    });

    it('leaves already-24h and irregular strings untouched', () => {
      const s = 'Mon–Thu 10:00–01:00, Fri–Sun 10:00–02:00';
      expect(formatHours(s, '24h')).toBe(s);
      expect(formatHours('Check the website', '24h')).toBe('Check the website');
      // Bare integers are ambiguous and must never convert.
      expect(formatHours('Happy hour 4-6', '24h')).toBe('Happy hour 4-6');
    });
  });

  describe('to 12h', () => {
    it('converts the house 24-hour patterns', () => {
      expect(formatHours('Mon–Thu 10:00–01:00, Fri–Sun 10:00–02:00', '12h')).toBe(
        'Mon–Thu 10am–1am, Fri–Sun 10am–2am'
      );
      expect(formatHours('Daily 18:00-02:00', '12h')).toBe('Daily 6pm-2am');
      expect(formatHours('Tue-Sat 17:30-00:00; Sun-Mon closed', '12h')).toBe(
        'Tue-Sat 5:30pm-12am; Sun-Mon closed'
      );
    });

    it('never mistakes a coloned 12-hour time for a 24-hour token', () => {
      // "6:30 PM" carries a colon but is a 12-hour time; converting the
      // digits alone produced "6:30am PM" before the lookahead fix.
      expect(formatHours('Mon-Sun 6:30 PM till close', '12h')).toBe('Mon-Sun 6:30 PM till close');
      expect(formatHours('Mon-Sun 6:30 PM till close', '24h')).toBe('Mon-Sun 18:30 till close');
    });

    it('treats 24:00 as midnight and leaves 12h strings untouched', () => {
      expect(formatHours('Daily 12:00-24:00', '12h')).toBe('Daily 12pm-12am');
      expect(formatHours('Daily 6pm-2am', '12h')).toBe('Daily 6pm-2am');
    });
  });

  it('is idempotent in both directions', () => {
    const once = formatHours('Daily 5pm-12am (kitchen until 11pm)', '24h');
    expect(formatHours(once, '24h')).toBe(once);
    const twice = formatHours('Mon–Thu 10:00–01:00', '12h');
    expect(formatHours(twice, '12h')).toBe(twice);
  });

  it('picks the format from the country', () => {
    expect(hoursFormatForCountry('United States')).toBe('12h');
    expect(hoursFormatForCountry('Serbia')).toBe('24h');
    expect(hoursFormatForCountry(null)).toBe('24h');
    expect(formatHoursForCountry('Daily 6pm-2am', 'Serbia')).toBe('Daily 18:00-02:00');
    expect(formatHoursForCountry('Daily 18:00-02:00', 'United States')).toBe('Daily 6pm-2am');
  });

  it('classifies for the dry run', () => {
    expect(classifyHours('Daily 6pm-2am', '24h')).toBe('converted');
    expect(classifyHours('Daily 18:00-02:00', '24h')).toBe('already-target');
    expect(classifyHours('Varies by season', '24h')).toBe('no-times');
  });
});
