import { describe, it, expect } from 'vitest';
import {
  websiteDomain,
  emailDomain,
  isDomainMatch,
  maskEmail,
  decideRoute,
  isClaimExpired,
} from './claim-routes';

describe('claim-routes', () => {
  describe('websiteDomain', () => {
    it('strips scheme, www and path', () => {
      expect(websiteDomain('https://www.saikindo.com/menu?x=1')).toBe('saikindo.com');
      expect(websiteDomain('http://example.co.uk/')).toBe('example.co.uk');
      expect(websiteDomain('example.com')).toBe('example.com');
    });

    it('lowercases', () => {
      expect(websiteDomain('HTTPS://WWW.Example.COM')).toBe('example.com');
    });

    it('returns null for junk', () => {
      for (const bad of [null, undefined, '', '   ', 42, 'http://']) {
        expect(websiteDomain(bad)).toBeNull();
      }
    });
  });

  describe('emailDomain', () => {
    it('takes the part after the last @', () => {
      expect(emailDomain('sam@saikindo.com')).toBe('saikindo.com');
      expect(emailDomain('odd"@"name@example.com')).toBe('example.com');
    });

    it('rejects addresses without a dotted domain', () => {
      expect(emailDomain('root@localhost')).toBeNull();
      expect(emailDomain('no-at-sign')).toBeNull();
      expect(emailDomain('@leading.com')).toBeNull();
      expect(emailDomain('trailing@')).toBeNull();
    });
  });

  describe('isDomainMatch', () => {
    it('matches an address on the bar’s own domain, ignoring www and case', () => {
      expect(isDomainMatch('SAM@Saikindo.com', 'https://www.saikindo.com')).toBe(true);
    });

    it('does not match a different domain', () => {
      expect(isDomainMatch('sam@gmail.com', 'https://saikindo.com')).toBe(false);
    });

    it('does not match a subdomain address — falls through to manual', () => {
      // Documented limitation: literal comparison, not a public-suffix parse.
      expect(isDomainMatch('sam@mail.saikindo.com', 'https://saikindo.com')).toBe(false);
    });

    it('is false when either side is missing', () => {
      expect(isDomainMatch('sam@saikindo.com', null)).toBe(false);
      expect(isDomainMatch(null, 'https://saikindo.com')).toBe(false);
    });
  });

  describe('maskEmail', () => {
    it('keeps only the first character and the domain', () => {
      expect(maskEmail('roman@barmagazine.com')).toBe('r•••••@barmagazine.com');
    });

    it('uses a constant-width blob so length is not leaked', () => {
      const short = maskEmail('a@x.com')!;
      const long = maskEmail('averyverylongmailbox@x.com')!;
      expect(short.length).toBe(long.length);
    });

    it('returns null for junk', () => {
      expect(maskEmail('no-at-sign')).toBeNull();
      expect(maskEmail(null)).toBeNull();
    });
  });

  describe('decideRoute', () => {
    it('A: domain match wins and sends to the typed address', () => {
      const d = decideRoute(
        { website: 'https://saikindo.com', email: 'info@saikindo.com' },
        'sam@saikindo.com'
      );
      expect(d.method).toBe('domain_match');
      expect(d.destination).toBe('sam@saikindo.com');
      expect(d.autoVerifiable).toBe(true);
    });

    it('A beats B when both apply', () => {
      const d = decideRoute(
        { website: 'https://bar.com', email: 'onfile@bar.com' },
        'owner@bar.com'
      );
      expect(d.method).toBe('domain_match');
    });

    it('B: sends to the STORED address, never the typed one', () => {
      const d = decideRoute(
        { website: 'https://bar.com', email: 'onfile@bar.com' },
        'stranger@gmail.com'
      );
      expect(d.method).toBe('contact_on_file');
      expect(d.destination).toBe('onfile@bar.com');
      expect(d.destination).not.toBe('stranger@gmail.com');
      expect(d.maskedDestination).toBe('o•••••@bar.com');
    });

    it('C: manual when neither applies, and nothing is sent', () => {
      const d = decideRoute({ website: null, email: null }, 'stranger@gmail.com');
      expect(d.method).toBe('manual');
      expect(d.destination).toBeNull();
      expect(d.autoVerifiable).toBe(false);
    });

    it('a transfer never auto-verifies, even on a domain match', () => {
      const d = decideRoute(
        { website: 'https://bar.com', email: 'onfile@bar.com', owner_id: 'someone' },
        'owner@bar.com'
      );
      expect(d.method).toBe('domain_match');
      expect(d.isTransfer).toBe(true);
      expect(d.autoVerifiable).toBe(false);
      expect(d.destination).toBeNull();
    });
  });

  describe('isClaimExpired', () => {
    const now = new Date('2026-08-25T12:00:00Z');

    it('is false inside the 24h window', () => {
      expect(isClaimExpired('2026-08-25T11:00:00Z', now)).toBe(false);
      expect(isClaimExpired('2026-08-24T12:30:00Z', now)).toBe(false);
    });

    it('is true past 24h', () => {
      expect(isClaimExpired('2026-08-24T11:00:00Z', now)).toBe(true);
    });

    it('treats an unparseable date as expired', () => {
      expect(isClaimExpired('not a date', now)).toBe(true);
    });
  });
});
