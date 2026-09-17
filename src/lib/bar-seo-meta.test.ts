import { describe, it, expect } from 'vitest';
import {
  barTitle, barDescription, shortHours, streetAddress, titleAccolade,
  TITLE_MAX, DESCRIPTION_MAX,
} from './bar-seo-meta';
import type { Accolade } from './accolades';

const acc = (over: Partial<Accolade>): Accolade => ({
  org: "World's 50 Best Bars", org_key: 'w50b', year: 2025, rank: 1,
  kind: 'ranked', title: null, score: 100, source: 'https://example.com', ...over,
});

const bar = (over: Partial<Parameters<typeof barTitle>[0]> = {}) => ({
  name: 'Satan\'s Whiskers', city: 'London', country: 'United Kingdom', ...over,
});

describe('streetAddress', () => {
  it('keeps the street and drops the city, postcode and country', () => {
    expect(streetAddress('Weinbergsweg 25, 10119 Berlin, Germany')).toBe('Weinbergsweg 25');
    expect(streetAddress('2911 Grand Avenue, Suite 111, Coconut Grove, Miami, FL 33133'))
      .toBe('2911 Grand Avenue');
  });
  it('refuses a bare number or postcode, and handles nothing', () => {
    expect(streetAddress('10119')).toBe('');
    expect(streetAddress(null)).toBe('');
    expect(streetAddress('   ')).toBe('');
  });
  it('skips a unit or floor and finds the street behind it', () => {
    expect(streetAddress('Shop A, LG/F Wah Shin House, 6-10 Shin Hing Street, Central'))
      .toBe('6-10 Shin Hing Street');
    expect(streetAddress('52nd Floor, ICD Brookfield Place, 312 Al Mustaqbal Street, DIFC, Dubai'))
      .toBe('312 Al Mustaqbal Street');
  });
  it('keeps the number when the street name carries it in its own segment', () => {
    expect(streetAddress('C/ del Marqués del Duero, 8, Salamanca, 28001 Madrid, Spain'))
      .toBe('C/ del Marqués del Duero, 8');
  });
  it('never mistakes a postcode and city for a street', () => {
    expect(streetAddress('C/ del Marqués del Duero, 8, Salamanca, 28001 Madrid, Spain'))
      .not.toContain('Madrid');
  });
  it('keeps a street that has no number at all', () => {
    expect(streetAddress('Secret location, Milano (by introduction)')).toBe('Secret location');
  });
  it('turns an en dash into a hyphen', () => {
    expect(streetAddress('Rue 12–14, Paris')).toBe('Rue 12-14');
  });
});

describe('shortHours', () => {
  it('reads a day range and a time range', () => {
    expect(shortHours('Tue-Sat 7pm-1am', 'United Kingdom')).toBe('Open Tue to Sat, 7pm to 1am');
  });
  it('reads daily', () => {
    expect(shortHours('Daily 5pm-1am', 'United States')).toBe('Open daily, 5pm to 1am');
    expect(shortHours('Daily Mon - Sun : 6PM - Late Night', 'United States')).toBe('Open daily from 6pm');
  });
  it('uses only the first clause', () => {
    expect(shortHours('Sun-Thu 4pm-12am; Fri-Sat 4pm-2am', 'United States'))
      .toBe('Open Sun to Thu, 4pm to 12am');
  });
  it('applies the country convention before reading', () => {
    expect(shortHours('Tue–Sat 18:00–01:00', 'United Kingdom')).toBe('Open Tue to Sat, 6pm to 1am');
    expect(shortHours('Tue–Sat 18:00–01:00', 'Germany')).toBe('Open Tue to Sat, 18:00 to 01:00');
  });
  it('handles a single day and an open end', () => {
    expect(shortHours('Thursday 8pm till late', 'United States')).toBe('Open Thu from 8pm');
  });
  it('reads a later clause when the first one has no time', () => {
    expect(shortHours('Mon and Tue Closed; Wed to Fri 5:00 PM-12:00 AM; Sat 4:00 PM-12:00 AM', 'United States'))
      .toBe('Open Wed to Fri, 5:00 pm to 12:00 am');
    expect(shortHours('Mon-Wed Closed; Thu 17:00-01:00; Fri 17:00-02:00', 'Serbia'))
      .toBe('Open Thu, 17:00 to 01:00');
  });
  it('reads past a label in front of the days', () => {
    expect(shortHours('Cafe Hours: Sun-Sat 8am-5pm. Bar Hours: Tue 5pm-12am', 'United States'))
      .toBe('Open Sun to Sat, 8am to 5pm');
    expect(shortHours('Coffee: Wed-Fri 9am-3pm and 4pm-9pm', 'United States'))
      .toBe('Open Wed to Fri, 9am to 3pm');
  });
  it('accepts thru and a comma between the days and the time', () => {
    expect(shortHours('Mon thru Sat 5:30pm-2am', 'United States')).toBe('Open Mon to Sat, 5:30pm to 2am');
    expect(shortHours('Wed-Sat, 6 PM-12 AM', 'United States')).toBe('Open Wed to Sat, 6 pm to 12 am');
  });
  it('says nothing rather than guessing', () => {
    expect(shortHours('Evenings, daily', 'Italy')).toBe('');
    expect(shortHours('Tue-Sun evenings (booking by introduction)', 'Italy')).toBe('');
    expect(shortHours(null, 'Italy')).toBe('');
  });
  it('never emits an en or em dash', () => {
    expect(shortHours('Tue–Sat 7pm–1am', 'United Kingdom')).not.toMatch(/[–—]/);
  });
});

describe('titleAccolade', () => {
  it('uses a ranked fifty best placing, with its year', () => {
    expect(titleAccolade([acc({})])).toBe("No. 1 on World's 50 Best 2025");
    expect(titleAccolade([acc({ org_key: 'a50b', org: "Asia's 50 Best Bars", rank: 12, year: 2026 })]))
      .toBe("No. 12 on Asia's 50 Best 2026");
  });
  it('uses a James Beard or Spirited win', () => {
    expect(titleAccolade([acc({ org_key: 'jbf', org: 'James Beard Awards', kind: 'winner', rank: null, year: 2024 })]))
      .toBe('James Beard Award Winner 2024');
  });
  it('is empty for lists that are not whitelisted, and for no accolades', () => {
    expect(titleAccolade([acc({ org_key: 'pinnacle', org: 'The Pinnacle Guide', rank: null, kind: 'winner', title: '2 Pins' })])).toBe('');
    expect(titleAccolade(null)).toBe('');
    expect(titleAccolade([])).toBe('');
  });
});

describe('barTitle', () => {
  it('uses the generic promise when there is no credential', () => {
    expect(barTitle(bar({ opening_hours: 'Tue-Sat 6pm-1am' })))
      .toBe("Satan's Whiskers, London | Hours & Drinks | BarMagazine");
  });
  it('prefers the credential over the generic promise', () => {
    expect(barTitle(bar({ name: 'Connaught Bar', accolades: [acc({ rank: 1 })] })))
      .toContain("No. 1 on World's 50 Best");
  });
  it('only promises what the row actually has', () => {
    // A short enough name for the full promise to fit; a longer one shortens.
    const withBoth = barTitle(bar({ name: 'Coa', city: 'Hong Kong', country: 'Hong Kong',
      address: '12 Dean Street', opening_hours: 'Tue-Sat 6pm-1am' }));
    expect(withBoth).toContain('Address, Hours & Drinks');
    const hoursOnly = barTitle(bar({ opening_hours: 'Tue-Sat 6pm-1am' }));
    expect(hoursOnly).toContain('Hours & Drinks');
    expect(hoursOnly).not.toContain('Address');
    const addressOnly = barTitle(bar({ address: '12 Dean Street, London' }));
    expect(addressOnly).toContain('Address & Drinks');
    expect(addressOnly).not.toContain('Hours');
    const neither = barTitle(bar());
    expect(neither).toBe("Satan's Whiskers, London | BarMagazine");
  });
  it('does not repeat a city the name already carries', () => {
    expect(barTitle(bar({ name: 'LPM Miami', city: 'Miami', country: 'United States', state: 'FL',
      address: '1300 Brickell Bay Dr, Miami, FL', opening_hours: 'Mon-Fri 12pm-3pm' })))
      .toBe('LPM Miami | Address, Hours & Drinks | BarMagazine');
  });
  it('gives a short name the full promise', () => {
    expect(barTitle(bar({ name: 'Coa', city: 'Hong Kong', country: 'Hong Kong',
      address: '6-10 Shin Hing Street, Central', opening_hours: 'Tue-Sun 6pm-1am' })))
      .toBe('Coa, Hong Kong | Address, Hours & Drinks | BarMagazine');
  });
  it('never exceeds the cap, even for the longest name we have', () => {
    const t = barTitle(bar({ name: 'Cause Effect Cocktail Kitchen & Cape Brandy Bar', city: 'Cape Town', country: 'South Africa' }));
    expect(t.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(t).toContain('Cause Effect Cocktail Kitchen & Cape Brandy Bar');
  });
  it('has no dangling separator, comma or double space', () => {
    for (const b of [bar(), bar({ name: 'Coa', city: 'Hong Kong', country: 'Hong Kong', address: '6-10 Shin Hing Street' })]) {
      const t = barTitle(b);
      expect(t).not.toMatch(/\s{2}|,\s*\||\|\s*$|,\s*$/);
    }
  });
});

describe('barDescription', () => {
  const full = bar({
    address: '343 Cambridge Heath Road, London E2 9RA',
    opening_hours: 'Tue-Sat 6pm-12am',
    accolades: [acc({ org_key: 'e50b', org: "Europe's 50 Best Bars", rank: 18, year: 2026, kind: 'ranked' })],
  });

  it('leads with the street, then the hours, then the credential', () => {
    const d = barDescription(full);
    expect(d.startsWith('343 Cambridge Heath Road, London.')).toBe(true);
    expect(d).toContain('Open Tue to Sat, 6pm to 12am.');
    expect(d).toContain("No. 18 on Europe's 50 Best Bars 2026");
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it('drops a missing field instead of leaving a gap', () => {
    const d = barDescription(bar({ opening_hours: 'Tue-Sat 6pm-12am' }));
    expect(d).toBe('London. Open Tue to Sat, 6pm to 12am.');
    expect(d).not.toMatch(/\s{2}|,\s*\.|\.\./);
  });

  it('uses the signature serves when there is no accolade', () => {
    const d = barDescription(bar({
      address: 'Weinbergsweg 25, 10119 Berlin',
      menu_highlights: [{ name: 'Gladiator' }, { name: 'Taj Twist' }, { name: 'Third' }],
    }));
    expect(d).toContain('Signature serves include Gladiator and Taj Twist.');
  });

  it('falls back to the neighborhood last', () => {
    const d = barDescription(bar({ address: '12 Dean Street, London', neighborhood: 'Soho' }));
    expect(d).toContain('In the Soho neighborhood.');
  });

  it('falls back to the stored prose when there is nothing structured', () => {
    const d = barDescription({
      name: 'X', city: '', country: '',
      description: 'A room of forty seats behind an unmarked door. ' + 'Long prose. '.repeat(30),
    });
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(d.endsWith('.')).toBe(true);
  });

  it('adds only whole sentences from the stored prose, never a fragment', () => {
    const d = barDescription(bar({
      address: 'Zagrebačka ul. 1, 21000 Split',
      description: "String's is a cocktail and guitar bar in Split that pairs a Prohibition-era speakeasy look with a rock and roll soundtrack, guitars on the walls and drinks named for songs. It also has a terrace.",
    }));
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(/[.!?]$/.test(d)).toBe(true);
    expect(d).not.toContain('guitars on the walls and');
  });

  it('does not say the same credential twice when the excerpt repeats it', () => {
    const d = barDescription(bar({
      city: 'Hong Kong', country: 'Hong Kong',
      address: 'Shop A, LG/F Wah Shin House, 6-10 Shin Hing Street, Central',
      accolades: [acc({ rank: 38 })],
      short_excerpt: "#38 on World's 50 Best Bars 2025",
    }));
    expect(d.match(/50 Best Bars 2025/g)?.length).toBe(1);
  });

  it('keeps an excerpt that only shares a place name with the lead', () => {
    const d = barDescription(bar({
      city: 'Belgrade', country: 'Serbia',
      short_excerpt: "Belgrade's first craft cocktail bar, on Cetinjska",
    }));
    expect(d).toContain("Belgrade's first craft cocktail bar");
  });

  it('never exceeds the cap and never ends mid word', () => {
    for (const b of [full, bar({ address: 'A'.repeat(200) }), bar()]) {
      const d = barDescription(b);
      expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(d).not.toMatch(/[–—]/);
      expect(d).not.toMatch(/\s{2}|,\s*\.|\.\.|,\s*$/);
    }
  });
});
