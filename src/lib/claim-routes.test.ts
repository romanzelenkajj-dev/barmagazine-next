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

  describe('decideRoute — open claiming', () => {
    it('domain match: MATCH, link to the typed address', () => {
      const d = decideRoute(
        { website: 'https://saikindo.com', email: 'info@saikindo.com' },
        'sam@saikindo.com'
      );
      expect(d.method).toBe('domain_match');
      expect(d.destination).toBe('sam@saikindo.com');
      expect(d.autoVerifiable).toBe(true);
      expect(d.match).toBe(true);
    });

    it('claimant IS the on-file contact: MATCH, link still to the typed address', () => {
      const d = decideRoute(
        { website: 'https://other.com', email: 'onfile@bar.com' },
        'ONFILE@bar.com'
      );
      expect(d.method).toBe('contact_on_file');
      expect(d.destination).toBe('ONFILE@bar.com');
      expect(d.match).toBe(true);
      expect(d.autoVerifiable).toBe(true);
    });

    it('NEVER mails the on-file address for a stranger — route B is dead', () => {
      const d = decideRoute(
        { website: 'https://bar.com', email: 'onfile@bar.com' },
        'stranger@gmail.com'
      );
      expect(d.method).toBe('manual');
      expect(d.match).toBe(false);
      // The link goes to the stranger's OWN address, proving only their mailbox.
      expect(d.destination).toBe('stranger@gmail.com');
      expect(d.destination).not.toBe('onfile@bar.com');
    });

    it('no match still auto-verifies — open claiming has no admin gate', () => {
      const d = decideRoute({ website: null, email: null }, 'stranger@gmail.com');
      expect(d.method).toBe('manual');
      expect(d.match).toBe(false);
      expect(d.autoVerifiable).toBe(true);
      expect(d.destination).toBe('stranger@gmail.com');
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
      expect(d.match).toBe(true);
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
