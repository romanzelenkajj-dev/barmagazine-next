/**
 * Route selection and address handling for bar claims.
 *
 * Pure functions only — the API routes own the database and mail. Keeping the
 * decision logic here means the rules in the spec are testable without a
 * Supabase round trip.
 */

export type ClaimMethod = 'domain_match' | 'contact_on_file' | 'manual';

/**
 * Registrable domain of a website, per the spec: strip the scheme, strip a
 * leading `www.`, lowercase, ignore path/query.
 *
 * Note this is a literal comparison, not a public-suffix parse: an owner
 * writing from `@mail.example.com` will NOT match a site at `example.com` and
 * falls through to manual review. That is the safe direction to be wrong in.
 */
export function websiteDomain(website: unknown): string | null {
  if (typeof website !== 'string') return null;
  const trimmed = website.trim();
  if (!trimmed) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const host = new URL(withScheme).hostname.toLowerCase();
    const bare = host.replace(/^www\./, '');
    return bare || null;
  } catch {
    return null;
  }
}

/** Domain part of an email address, lowercased. */
export function emailDomain(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain.includes('.') ? domain : null;
}

/** True when the claimant's address is on the bar's own domain. */
export function isDomainMatch(claimantEmail: unknown, barWebsite: unknown): boolean {
  const a = emailDomain(claimantEmail);
  const b = websiteDomain(barWebsite);
  return !!a && !!b && a === b;
}

/**
 * Mask an on-file address for display: first character, then a fixed-width
 * blob, then the domain. Never reveal the full local part — the spec forbids
 * exposing a stored address anywhere in an API response or the UI.
 *
 * The blob is a constant width so its length leaks nothing about the address.
 */
export function maskEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (!local || domain.length < 2) return null;
  return `${local[0]}•••••${domain.toLowerCase()}`;
}

export interface BarForClaim {
  website?: unknown;
  email?: unknown;
  owner_id?: unknown;
}

export interface RouteDecision {
  method: ClaimMethod;
  /** Where the magic link must go. Null for manual — nothing is sent. */
  destination: string | null;
  /** Masked form of the destination, safe to return to the caller. */
  maskedDestination: string | null;
  /** A bar that already has an owner is a transfer: always human-reviewed. */
  isTransfer: boolean;
  /** Whether this route may create the auth user and send a link now. */
  autoVerifiable: boolean;
}

/**
 * Choose the claim route. Precedence is A, then B, then C — if both apply,
 * prefer A, because control of the bar's own domain is the stronger proof.
 *
 * A transfer never auto-approves regardless of route: the claim is recorded
 * for review and no link goes out, so an existing owner can't be displaced by
 * someone who merely controls a matching mailbox.
 */
export function decideRoute(bar: BarForClaim, claimantEmail: string): RouteDecision {
  const isTransfer = !!bar.owner_id;

  const domainMatch = isDomainMatch(claimantEmail, bar.website);
  const onFile = typeof bar.email === 'string' && bar.email.trim() ? bar.email.trim() : null;

  let method: ClaimMethod = 'manual';
  let destination: string | null = null;

  if (domainMatch) {
    method = 'domain_match';
    destination = claimantEmail;
  } else if (onFile) {
    method = 'contact_on_file';
    // Deliberately the stored address, never the one typed into the form.
    destination = onFile;
  }

  const autoVerifiable = method !== 'manual' && !isTransfer;

  return {
    method,
    destination: autoVerifiable ? destination : null,
    maskedDestination: destination ? maskEmail(destination) : null,
    isTransfer,
    autoVerifiable,
  };
}

/** A claim awaiting verification for longer than this is dead. */
export const CLAIM_VERIFICATION_WINDOW_HOURS = 24;

export function isClaimExpired(createdAt: string | Date, now: Date = new Date()): boolean {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(created.getTime())) return true;
  const ageHours = (now.getTime() - created.getTime()) / 36e5;
  return ageHours > CLAIM_VERIFICATION_WINDOW_HOURS;
}

/** Rate limits from the spec, counted over the trailing hour. */
export const CLAIM_RATE_LIMIT_PER_EMAIL = 3;
export const CLAIM_RATE_LIMIT_PER_IP = 10;
